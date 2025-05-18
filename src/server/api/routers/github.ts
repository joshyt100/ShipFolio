// src/server/api/routers/github.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { fetchGitHubGraphQL } from "~/lib/github-graphql"; // Assuming this path is correct
import { db } from "~/server/db";
import {
  type UserProfile,
  type PullRequest,
  type LanguageStat,
  type ContributionTypeStat,
  type ContributionActivityStats,
  // type GraphQLUserStatsData, // Not directly used in this file after initial fetch
  // type GraphQLUserPullRequestsData, // Not directly used in this file after initial fetch
  type GraphQLContributionCalendar,
  type GraphQLContributionDay,
  USER_STATS_QUERY,
  USER_PULL_REQUESTS_QUERY,
  MAX_TOP_LANGUAGES_DISPLAY,
  transformGraphQLPRToUIPR,
} from "~/components/dashboard/types"; // Assuming this path is correct

// Utility function - logging within it might be excessive unless debugging its specific logic
function calculateActivityHighlights(calendar: GraphQLContributionCalendar | null | undefined): ContributionActivityStats {
  const stats: ContributionActivityStats = {
    busiestDayOfWeek: null,
    mostCommitsSingleDay: null,
    longestStreak: null,
  };

  if (!calendar?.weeks?.length) return stats;

  const days = calendar.weeks.flatMap(week => week.contributionDays).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (!days.length) return stats;

  let peakDay: GraphQLContributionDay | null = null;
  let currentStreak = 0, longestStreak = 0;
  const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const day of days) {
    if (day.contributionCount > 0) {
      currentStreak++;
      dayTotals[day.weekday] += day.contributionCount;
      if (!peakDay || day.contributionCount > peakDay.contributionCount) peakDay = day;
    } else {
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      currentStreak = 0;
    }
  }
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  if (peakDay) {
    stats.mostCommitsSingleDay = {
      date: new Date(peakDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      count: peakDay.contributionCount,
    };
  }

  if (longestStreak > 0) {
    // Note: startDate and endDate calculation was missing in the original, adding placeholders
    stats.longestStreak = { days: longestStreak, startDate: "N/A", endDate: "N/A" };
  }

  const dayEntries = Object.entries(dayTotals);
  if (dayEntries.length > 0) {
    const maxWeekday = dayEntries.reduce((a, b) => b[1] > a[1] ? b : a);
    if (+maxWeekday[0] >= 0 && maxWeekday[1] > 0) { // ensure there were contributions
      stats.busiestDayOfWeek = {
        day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][+maxWeekday[0]],
        averageContributions: 0, // Note: averageContributions calculation was missing
      };
    }
  }
  return stats;
}

export const githubRouter = createTRPCRouter({
  refreshGitHubData: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const logPrefix = `[githubRouter.refreshGitHubData USER: ${input.username}]`;
      console.log(`${logPrefix} 🔄 Initiating refresh.`);

      try {
        // 1. Fetch User Stats and Profile from GitHub
        console.log(`${logPrefix} Fetching user stats and profile from GitHub...`);
        const statsRes = await fetchGitHubGraphQL(USER_STATS_QUERY, { username: input.username }, ctx.session);

        // It's good practice to log a sanitized version of what you received, or at least presence of key data
        if (!statsRes?.user) {
          console.error(`${logPrefix} ❌ GitHub API did not return user data. Response:`, statsRes);
          throw new TRPCError({ code: "NOT_FOUND", message: `GitHub user '${input.username}' not found or API error.` });
        }
        const profile = statsRes.user;
        console.log(`${logPrefix} ✅ Successfully fetched profile for GitHub user: ${profile.login}`);

        // 2. Process User Profile
        const userProfile: UserProfile = {
          name: profile.name,
          login: profile.login,
          bio: profile.bio,
          avatar_url: profile.avatarUrl,
          followers: profile.followers.totalCount,
          public_gists: profile.gists.totalCount,
          public_repos: profile.repositories.totalCount,
          createdAt: profile.createdAt,
        };
        console.log(`${logPrefix} Processed user profile data.`);

        // 3. Process Basic Stats
        const basicStats = {
          followers: profile.followers.totalCount,
          totalStars: profile.repositories.nodes?.reduce((a, r) => a + (r.stargazerCount ?? 0), 0) ?? 0,
          totalForks: profile.repositories.nodes?.reduce((a, r) => a + (r.forkCount ?? 0), 0) ?? 0,
          publicRepos: profile.repositories.totalCount,
          publicGists: profile.gists.totalCount,
          yearsOnGitHub: (() => {
            const diff = new Date().getTime() - new Date(profile.createdAt).getTime();
            const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
            return years < 1 ? "< 1 year" : `${years} year${years > 1 ? "s" : ""}`;
          })(),
        };
        console.log(`${logPrefix} Processed basic stats.`);

        // 4. Process Top Languages
        const languageMap = new Map<string, { size: number; color: string | null }>();
        profile.repositories.nodes?.forEach(repo => {
          repo.languages?.edges?.forEach(({ node, size }) => {
            if (!node.name || size <= 0) return;
            const prev = languageMap.get(node.name);
            languageMap.set(node.name, {
              size: (prev?.size ?? 0) + size,
              color: prev?.color ?? node.color,
            });
          });
        });
        const totalLangSize = [...languageMap.values()].reduce((a, l) => a + l.size, 0);
        const topLanguages: LanguageStat[] = [...languageMap.entries()]
          .map(([name, { size, color }]) => ({
            name,
            size,
            color,
            percentage: totalLangSize ? +(100 * size / totalLangSize).toFixed(1) : 0,
          }))
          .sort((a, b) => b.size - a.size)
          .slice(0, MAX_TOP_LANGUAGES_DISPLAY);
        console.log(`${logPrefix} Processed top languages. Found ${topLanguages.length} languages.`);

        // 5. Process Contribution Breakdown
        const contribs = profile.contributionsCollection;
        const contributionBreakdown: ContributionTypeStat[] = [
          { type: "commits", label: "Commits", count: contribs.totalCommitContributions, iconName: "GitCommit", colorClass: "bg-sky-500" },
          { type: "pullRequests", label: "Pull Requests", count: contribs.totalPullRequestContributions, iconName: "GitPullRequest", colorClass: "bg-purple-500" },
          { type: "reviews", label: "Code Reviews", count: contribs.totalPullRequestReviewContributions, iconName: "Eye", colorClass: "bg-teal-500" },
          { type: "issues", label: "Issues Opened", count: contribs.totalIssueContributions, iconName: "AlertCircle", colorClass: "bg-orange-500" },
        ];
        const totalContribs = contributionBreakdown.reduce((a, i) => a + i.count, 0);
        contributionBreakdown.forEach(i => i.percentage = totalContribs ? +(100 * i.count / totalContribs).toFixed(1) : 0);
        console.log(`${logPrefix} Processed contribution breakdown.`);

        // 6. Calculate Activity Highlights
        const activityStats = calculateActivityHighlights(contribs.contributionCalendar);
        console.log(`${logPrefix} Calculated activity highlights.`);

        // 7. Upsert Stats into Cache
        console.log(`${logPrefix} Upserting processed stats into database cache...`);
        await db.gitHubStatsCache.upsert({
          where: { username: input.username },
          create: { username: input.username, profileData: userProfile, basicStats, topLanguages, contributionBreakdown, activityStats },
          update: { profileData: userProfile, basicStats, topLanguages, contributionBreakdown, activityStats },
        });
        console.log(`${logPrefix} ✅ Successfully upserted stats cache.`);

        // 8. Fetch Pull Requests from GitHub
        console.log(`${logPrefix} Fetching user pull requests from GitHub...`);
        const prRes = await fetchGitHubGraphQL(USER_PULL_REQUESTS_QUERY, { searchQueryString: `author:${input.username} type:pr sort:updated-desc`, first: 15 }, ctx.session);

        if (!prRes?.search) {
          console.warn(`${logPrefix} GitHub API did not return search data for PRs. Response:`, prRes);
          // Depending on strictness, you might throw or continue with empty PRs
        }
        const pullRequests = prRes?.search?.edges?.map(e => e?.node ? transformGraphQLPRToUIPR(e.node) : null).filter((pr): pr is PullRequest => pr !== null) ?? [];
        console.log(`${logPrefix} ✅ Successfully fetched ${pullRequests.length} pull requests.`);

        // 9. Upsert PRs into Cache
        console.log(`${logPrefix} Upserting processed PRs into database cache...`);
        await db.gitHubPRsCache.upsert({
          where: { username: input.username },
          create: { username: input.username, prs: pullRequests },
          update: { prs: pullRequests },
        });
        console.log(`${logPrefix} ✅ Successfully upserted PRs cache.`);

        console.log(`${logPrefix} 🎉 Successfully refreshed all GitHub data.`);
        return { userProfile, basicStats, topLanguages, contributionBreakdown, activityStats, pullRequests };

      } catch (error) {
        console.error(`${logPrefix} ❌ Error during GitHub data refresh:`, error);
        if (error instanceof TRPCError) {
          throw error; // Re-throw TRPCError instances
        }
        // For other errors, wrap them in a TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `An unexpected error occurred while refreshing GitHub data for ${input.username}. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`,
          cause: error,
        });
      }
    }),

  getUserProfileAndStats: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const logPrefix = `[githubRouter.getUserProfileAndStats USER: ${input.username}]`;
      console.log(`${logPrefix} Attempting to fetch profile and stats from cache.`);

      const cache = await db.gitHubStatsCache.findUnique({ where: { username: input.username } });

      if (!cache) {
        console.warn(`${logPrefix} ⚠️ No cached stats found.`);
        throw new TRPCError({ code: "NOT_FOUND", message: "No cached stats found." });
      }

      console.log(`${logPrefix} ✅ Found cached profile and stats.`);
      return {
        userProfile: cache.profileData as UserProfile, // Added type assertion
        basicStats: cache.basicStats, // Consider adding type assertion if Json type isn't specific enough
        topLanguages: cache.topLanguages as LanguageStat[], // Added type assertion
        contributionBreakdown: cache.contributionBreakdown as ContributionTypeStat[], // Added type assertion
        activityStats: cache.activityStats as ContributionActivityStats, // Added type assertion
      };
    }),

  getUserPullRequests: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const logPrefix = `[githubRouter.getUserPullRequests USER: ${input.username}]`;
      console.log(`${logPrefix} Attempting to fetch pull requests from cache.`);

      const cache = await db.gitHubPRsCache.findUnique({ where: { username: input.username } });

      if (!cache) {
        console.warn(`${logPrefix} ⚠️ No cached PRs found. Returning empty array.`);
        return [];
      }

      console.log(`${logPrefix} ✅ Found ${(cache.prs as PullRequest[]).length} cached PRs.`);
      return cache.prs as PullRequest[] ?? []; // Added type assertion
    }),
});

// src/server/api/routers/post.ts (example with basic logging)
export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input, ctx }) => { // Added ctx for consistency if session needed
      const logPrefix = `[postRouter.hello]`;
      console.log(`${logPrefix} Received request with text: "${input.text}"`);
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const logPrefix = `[postRouter.create USER: ${ctx.session.user.id}]`;
      console.log(`${logPrefix} Attempting to create post with name: "${input.name}"`);

      try {
        const post = await db.post.create({
          data: {
            name: input.name,
            createdBy: { connect: { id: ctx.session.user.id } },
          },
        });
        console.log(`${logPrefix} ✅ Successfully created post with ID: ${post.id}`);
        return post;
      } catch (error) {
        console.error(`${logPrefix} ❌ Error creating post:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create post. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`,
          cause: error,
        });
      }
    }),

  getLatest: protectedProcedure
    .query(async ({ ctx }) => {
      const logPrefix = `[postRouter.getLatest USER: ${ctx.session.user.id}]`;
      console.log(`${logPrefix} Attempting to get latest post.`);

      try {
        const post = await db.post.findFirst({
          orderBy: { createdAt: "desc" },
          where: { createdById: ctx.session.user.id },
        });

        if (post) {
          console.log(`${logPrefix} ✅ Found latest post with ID: ${post.id}`);
        } else {
          console.log(`${logPrefix} No posts found for user.`);
        }
        return post;
      } catch (error) {
        console.error(`${logPrefix} ❌ Error fetching latest post:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch latest post. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`,
          cause: error,
        });
      }
    }),

  getSecretMessage: protectedProcedure
    .query(({ ctx }) => {
      const logPrefix = `[postRouter.getSecretMessage USER: ${ctx.session.user.id}]`;
      console.log(`${logPrefix} Accessing secret message.`);
      return "you can now see this secret message!";
    }),
});
