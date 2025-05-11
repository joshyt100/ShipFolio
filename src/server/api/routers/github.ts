import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { fetchGitHubGraphQL } from "~/lib/github-graphql"; // Adjusted path
import {
  type UserProfile,
  type PullRequest,
  type LanguageStat,
  type ContributionTypeStat,
  type GraphQLUserStatsData,
  type GraphQLUserPullRequestsData,
  type ContributionActivityStats,
  type GraphQLContributionCalendar,
  type GraphQLContributionDay,
  USER_STATS_QUERY,
  USER_PULL_REQUESTS_QUERY,
  MAX_TOP_LANGUAGES_DISPLAY,
  transformGraphQLPRToUIPR,
  // type Block, // For return type hint, actual block construction might be client-side or simplified
} from "~/components/dashboard/types"; // Adjusted path

// Helper function (from your original DashboardPage)
function calculateActivityHighlights(
  calendar: GraphQLContributionCalendar | null | undefined
): ContributionActivityStats {
  const stats: ContributionActivityStats = {
    busiestDayOfWeek: null,
    mostCommitsSingleDay: null,
    longestStreak: null,
  };

  if (!calendar?.weeks || calendar.weeks.length === 0) {
    return stats;
  }

  const allCalendarDaysChronological: GraphQLContributionDay[] = calendar.weeks
    .flatMap(week => week.contributionDays)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (allCalendarDaysChronological.length === 0) {
    return stats;
  }

  let peakDayActivity: GraphQLContributionDay | null = null;
  for (const day of allCalendarDaysChronological) {
    if (day.contributionCount > 0) {
      if (!peakDayActivity || day.contributionCount > peakDayActivity.contributionCount) {
        peakDayActivity = day;
      }
    }
  }
  if (peakDayActivity) {
    stats.mostCommitsSingleDay = {
      date: new Date(peakDayActivity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      count: peakDayActivity.contributionCount,
    };
  }

  let currentStreakDays = 0;
  let longestStreakDays = 0;
  for (const day of allCalendarDaysChronological) {
    if (day.contributionCount > 0) {
      currentStreakDays++;
    } else {
      if (currentStreakDays > longestStreakDays) {
        longestStreakDays = currentStreakDays;
      }
      currentStreakDays = 0;
    }
  }
  if (currentStreakDays > longestStreakDays) {
    longestStreakDays = currentStreakDays;
  }
  if (longestStreakDays > 0) {
    stats.longestStreak = { days: longestStreakDays, startDate: "", endDate: "" };
  }

  const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  allCalendarDaysChronological.forEach(day => {
    if (day.contributionCount > 0) {
      dayTotals[day.weekday] = (dayTotals[day.weekday] ?? 0) + day.contributionCount;
    }
  });

  let busiestWeekday = -1;
  let maxContributionsOnWeekday = -1;
  for (const weekdayStr in dayTotals) {
    const weekday: number = parseInt(weekdayStr);
    const contributions = dayTotals[weekday] ?? 0;
    if (contributions > maxContributionsOnWeekday) {
      maxContributionsOnWeekday = contributions;
      busiestWeekday = weekday;
    }
  }
  if (busiestWeekday !== -1 && maxContributionsOnWeekday > 0) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    stats.busiestDayOfWeek = { day: dayNames[busiestWeekday] ?? "Unknown", averageContributions: 0 };
  }

  return stats;
}


export const githubRouter = createTRPCRouter({
  getUserProfileAndStats: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const gqlResponse = await fetchGitHubGraphQL<GraphQLUserStatsData>(
          USER_STATS_QUERY, { username: input.username }, ctx.session
        );

        if (!gqlResponse?.user) {
          // User not found or data inaccessible, but not necessarily a TRPCError yet
          // The client can decide how to handle a null profile.
          // If GitHub API itself threw an error that fetchGitHubGraphQL didn't catch and rethrow as a user-friendly one,
          // that error might propagate. fetchGitHubGraphQL is designed to throw on HTTP/network errors.
          return {
            userProfile: null,
            basicStats: null,
            topLanguages: [],
            contributionBreakdown: [],
            activityStats: null,
          };
        }

        const profileData = gqlResponse.user;
        const userProfile: UserProfile = {
          name: profileData.name, login: profileData.login, bio: profileData.bio,
          avatar_url: profileData.avatarUrl, followers: profileData.followers.totalCount,
          public_gists: profileData.gists.totalCount, public_repos: profileData.repositories.totalCount,
          createdAt: profileData.createdAt,
        };

        const totalStars = profileData.repositories.nodes?.reduce((sum, repo) => sum + (repo.stargazerCount ?? 0), 0) ?? 0;
        const totalForks = profileData.repositories.nodes?.reduce((sum, repo) => sum + (repo.forkCount ?? 0), 0) ?? 0;
        let yearsOnGitHubText = "N/A";
        if (profileData.createdAt) {
          const memberForMs = new Date().getTime() - new Date(profileData.createdAt).getTime();
          let years = Math.floor(memberForMs / (1000 * 60 * 60 * 24 * 365.25));
          if (years < 0) years = 0;
          if (years < 1 && memberForMs > 0) yearsOnGitHubText = "< 1 year";
          else if (years === 0 && memberForMs <= 0) yearsOnGitHubText = "New Member";
          else yearsOnGitHubText = `${years} year${years !== 1 ? "s" : ""}`;
        }

        const basicStats = { // This will be used by client to build the 'Block[]' array
          followers: profileData.followers.totalCount || 0,
          totalStars,
          totalForks,
          publicRepos: profileData.repositories.totalCount || 0,
          publicGists: profileData.gists.totalCount || 0,
          yearsOnGitHub: yearsOnGitHubText,
        };

        const languageMap = new Map<string, { size: number; color: string | null }>();
        profileData.repositories.nodes?.forEach(repo => {
          repo.languages?.edges?.forEach(langEdge => {
            if (langEdge.node.name && langEdge.size > 0) {
              const existing = languageMap.get(langEdge.node.name);
              languageMap.set(langEdge.node.name, {
                size: (existing?.size ?? 0) + langEdge.size,
                color: existing?.color ?? langEdge.node.color,
              });
            }
          });
        });
        const totalLanguageSize = Array.from(languageMap.values()).reduce((sum, lang) => sum + lang.size, 0);
        const topLanguages: LanguageStat[] = Array.from(languageMap.entries())
          .map(([name, data]) => ({ name, size: data.size, color: data.color, percentage: totalLanguageSize > 0 ? parseFloat(((data.size / totalLanguageSize) * 100).toFixed(1)) : 0 }))
          .sort((a, b) => b.size - a.size).slice(0, MAX_TOP_LANGUAGES_DISPLAY);

        let contributionBreakdown: ContributionTypeStat[] = [];
        let activityStats: ContributionActivityStats | null = null;
        if (profileData.contributionsCollection) {
          const contribs = profileData.contributionsCollection;
          const rawBreakdown = [
            { type: "commits" as const, label: "Commits", count: contribs.totalCommitContributions, iconName: "GitCommit", colorClass: "bg-sky-500" },
            { type: "pullRequests" as const, label: "Pull Requests", count: contribs.totalPullRequestContributions, iconName: "GitPullRequest", colorClass: "bg-purple-500" },
            { type: "reviews" as const, label: "Code Reviews", count: contribs.totalPullRequestReviewContributions, iconName: "Eye", colorClass: "bg-teal-500" },
            { type: "issues" as const, label: "Issues Opened", count: contribs.totalIssueContributions, iconName: "AlertCircle", colorClass: "bg-orange-500" },
          ];
          const totalBreakdownContributions = rawBreakdown.reduce((sum, item) => sum + item.count, 0);
          contributionBreakdown = rawBreakdown
            .map(item => ({ ...item, percentage: totalBreakdownContributions > 0 ? parseFloat(((item.count / totalBreakdownContributions) * 100).toFixed(1)) : 0, }))
            .sort((a, b) => b.count - a.count);
          activityStats = calculateActivityHighlights(contribs.contributionCalendar);
        }

        return {
          userProfile,
          basicStats,
          topLanguages,
          contributionBreakdown,
          activityStats,
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(`[TRPC Error] getUserProfileAndStats for ${input.username}:`, error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message ?? "Failed to fetch user profile and stats from GitHub.",
            cause: error,
          });
        } else {
          console.error(`[Unexpected Error] getUserProfileAndStats for ${input.username}:`, error);
        }
      }
    }),

  getUserPullRequests: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const prSearchString = `author:${input.username} type:pr sort:updated-desc`;
        const gqlResponse = await fetchGitHubGraphQL<GraphQLUserPullRequestsData>(
          USER_PULL_REQUESTS_QUERY,
          { searchQueryString: prSearchString, first: 15 },
          ctx.session
        );

        if (gqlResponse?.search?.edges) {
          const formattedPRs = gqlResponse.search.edges
            .map(edge => edge?.node ? transformGraphQLPRToUIPR(edge.node) : null)
            .filter((pr): pr is PullRequest => pr !== null);
          return formattedPRs;
        }
        // Handle cases where search.edges might be null or undefined even if gqlResponse.search exists
        if (gqlResponse && (!gqlResponse.search || typeof gqlResponse.search.edges === 'undefined')) {
          console.warn("GraphQL PR response structure unexpected or empty:", gqlResponse);
        }
        return []; // Return empty array if no PRs or unexpected structure

      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(`[TRPC Error] getUserPullRequests for ${input.username}:`, error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message ?? "Failed to fetch pull requests from GitHub.",
            cause: error,
          });
        }
        else {
          console.error(`[Unexpected Error] getUserPullRequests for ${input.username}:`, error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred while fetching pull requests from GitHub.",
            cause: error,
          });
        }
      }
    }),
});

// For `ContributionTypeStat`, added `iconName: string` if you plan to send icon identifiers.
// The provided `types.ts` doesn't have `iconName` in `ContributionTypeStat`.
// For simplicity, I'll assume `ActivityTabs` can map types/labels to icons client-side,
// or you adjust `ContributionTypeStat` to include `iconName` and map it on the client.
// The `basicStats` object is designed to provide data for the `StatisticsGrid`'s blocks.
// The client will use `useMemo` to construct the `Block[]` array including the Lucide icons.
