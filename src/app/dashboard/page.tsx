"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion"; // Ensure motion is imported
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Users, Star, GitFork, Archive, Code, AlertCircle,
  Calendar as CalendarIcon, GitCommit, Eye, GitPullRequest,
} from "lucide-react";

import { fetchGitHubGraphQL } from "@/lib/github-graphql";
import {
  type Block, type UserProfile, type PullRequest, type LanguageStat,
  type ContributionTypeStat, type GraphQLUserStatsData, type GraphQLUserPullRequestsData,
  type ContributionActivityStats, type GraphQLContributionCalendar, type GraphQLContributionDay,
  USER_STATS_QUERY, USER_PULL_REQUESTS_QUERY, MAX_TOP_LANGUAGES_DISPLAY,
  transformGraphQLPRToUIPR,
} from "../../components/dashboard/types"; // Adjusted path

import { DashboardLoadingScreen } from "@/components/dashboard/DashboardLoadingScreen";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserProfileDisplay } from "@/components/dashboard/UserProfileDisplay";
import { DashboardErrorAlert } from "@/components/dashboard/DashboardErrorAlert";
import { PullRequestSection } from "@/components/dashboard/PullRequestSection";
import { ActivityTabs } from "@/components/dashboard/ActivityTabs";
import { StatisticsGrid } from "@/components/dashboard/StatisticsGrid";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";

// Skeleton and other functions remain the same...
const UserProfileSkeleton = () => (
  <div
    className="animate-pulse bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-4 md:p-6 mb-6 shadow-sm"
    style={{ minHeight: '180px' }}
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="h-20 w-20 md:h-24 md:w-24 bg-neutral-300 dark:bg-neutral-700 rounded-full shrink-0"></div>
      <div className="flex-1 w-full">
        <div className="h-6 md:h-7 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2 sm:w-48 mb-2"></div>
        <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4 sm:w-64 mb-1.5"></div>
        <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-full sm:w-1/2 md:w-1/3"></div>
      </div>
    </div>
    <div className="mt-3 sm:mt-4 space-y-2">
      <div className="h-3.5 bg-neutral-300 dark:bg-neutral-700 rounded w-full"></div>
      <div className="h-3.5 bg-neutral-300 dark:bg-neutral-700 rounded w-5/6"></div>
    </div>
  </div>
);

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
  if (currentStreakDays > longestStreakDays) { // Final check after loop
    longestStreakDays = currentStreakDays;
  }
  if (longestStreakDays > 0) {
    stats.longestStreak = { days: longestStreakDays };
  }

  const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  allCalendarDaysChronological.forEach(day => {
    if (day.contributionCount > 0) {
      dayTotals[day.weekday] = (dayTotals[day.weekday] || 0) + day.contributionCount;
    }
  });

  let busiestWeekday = -1;
  let maxContributionsOnWeekday = -1;
  for (const weekdayStr in dayTotals) {
    const weekday = parseInt(weekdayStr);
    if (dayTotals[weekday] > maxContributionsOnWeekday) {
      maxContributionsOnWeekday = dayTotals[weekday];
      busiestWeekday = weekday;
    }
  }
  if (busiestWeekday !== -1 && maxContributionsOnWeekday > 0) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    stats.busiestDayOfWeek = { day: dayNames[busiestWeekday] };
  }

  return stats;
}


// Define animation variants for page sections
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4, // Duration for each individual section animation
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Time delay between each child section animating in
      // delayChildren: 0.1, // Optional: delay before the first child starts
    },
  },
};

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [currentUsername, _setUsernameInternal] = useState("ThePrimeagen");
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [featuredPRs, setFeaturedPRs] = useState<PullRequest[]>([]);
  const [topLanguages, setTopLanguages] = useState<LanguageStat[]>([]);
  const [contributionBreakdown, setContributionBreakdown] = useState<ContributionTypeStat[]>([]);
  const [activityStats, setActivityStats] = useState<ContributionActivityStats | null>(null);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPRs, setLoadingPRs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeStatBlockId, setActiveStatBlockId] = useState<string | null>(null);

  // ... (setUsername, handleUsernameChange, theme effects, refreshAll, fetchPRs, loadUserStatsAndRelatedData effects remain the same) ...
  useEffect(() => {
    const storedTheme = localStorage.getItem("github-dashboard-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkTheme(storedTheme ? storedTheme === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme);
    localStorage.setItem("github-dashboard-theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  const toggleTheme = useCallback(() => setIsDarkTheme((prev) => !prev), []);

  const setUsername = (newUsername: string) => {
    if (newUsername && newUsername.trim() && newUsername.trim() !== currentUsername) {
      setError(null); // Clear previous errors
      setUserProfile(null); // Clear old profile data immediately
      setFeaturedPRs([]); // Clear old PRs
      setBlocks([]);
      setTopLanguages([]);
      setContributionBreakdown([]);
      setActivityStats(null);
      _setUsernameInternal(newUsername.trim());
      // Data fetching useEffects will trigger due to currentUsername change
    }
  };

  const handleUsernameChange = () => {
    const nu = prompt("Enter GitHub username:", currentUsername);
    if (nu && nu.trim()) {
      setUsername(nu.trim());
    }
  };


  useEffect(() => {
    if (refreshing && !loadingStats && !loadingPRs) {
      setRefreshing(false);
    }
  }, [refreshing, loadingStats, loadingPRs]);

  const refreshAll = useCallback(() => {
    setError(null);
    // Optionally reset states here if you want instant clearing on refresh
    // setUserProfile(null);
    // setFeaturedPRs([]);
    setRefreshing(true); // This will trigger data fetching useEffects
  }, []);

  useEffect(() => {
    async function fetchPRs() {
      if (!currentUsername || sessionStatus !== "authenticated" || !session) {
        setFeaturedPRs([]);
        setLoadingPRs(false);
        return;
      }
      setLoadingPRs(true);
      try {
        const prSearchString = `author:${currentUsername} type:pr sort:updated-desc`;
        const gqlResponse = await fetchGitHubGraphQL<GraphQLUserPullRequestsData>(
          USER_PULL_REQUESTS_QUERY,
          { searchQueryString: prSearchString, first: 15 },
          session
        );
        if (gqlResponse?.search?.edges) {
          const formattedPRs = gqlResponse.search.edges
            .map(edge => edge?.node ? transformGraphQLPRToUIPR(edge.node) : null)
            .filter((pr): pr is PullRequest => pr !== null);
          setFeaturedPRs(formattedPRs);
        } else {
          setFeaturedPRs([]);
          if (gqlResponse && (!gqlResponse.search || typeof gqlResponse.search.edges === 'undefined')) {
            console.warn("GraphQL PR response structure unexpected or empty:", gqlResponse);
            if (!error && !refreshing) setError("Could not retrieve pull requests for this user.");
          }
        }
      } catch (e: any) {
        console.error("Featured PRs fetch error (GraphQL):", e);
        if (!error && !refreshing) setError(e.message || "Failed to fetch pull requests.");
        setFeaturedPRs([]);
      } finally {
        setLoadingPRs(false);
      }
    }

    if (currentUsername && (sessionStatus === 'authenticated' || refreshing)) { // Added refreshing condition
      fetchPRs();
    } else if (sessionStatus === 'loading') {
      setLoadingPRs(true);
    } else {
      setLoadingPRs(false);
      setFeaturedPRs([]);
      if (sessionStatus === "unauthenticated" && currentUsername && !error && !refreshing) {
        // setError("Please sign in to view pull requests."); // This can be handled by AuthPrompt or section-specific messages
      }
    }
  }, [currentUsername, refreshing, session, sessionStatus, error]);

  useEffect(() => {
    async function loadUserStatsAndRelatedData() {
      if (!currentUsername || sessionStatus !== "authenticated" || !session) {
        setUserProfile(null); setBlocks([]); setTopLanguages([]);
        setContributionBreakdown([]); setActivityStats(null);
        setLoadingStats(false);
        return;
      }
      setLoadingStats(true);
      // Reset states if not refreshing, to clear old data when username changes
      if (!refreshing) {
        setUserProfile(null); setBlocks([]); setTopLanguages([]);
        setContributionBreakdown([]); setActivityStats(null);
      }

      try {
        const gqlResponse = await fetchGitHubGraphQL<GraphQLUserStatsData>(
          USER_STATS_QUERY, { username: currentUsername }, session
        );
        if (gqlResponse?.user) {
          const profileData = gqlResponse.user;
          setUserProfile({
            name: profileData.name, login: profileData.login, bio: profileData.bio,
            avatar_url: profileData.avatarUrl, followers: profileData.followers.totalCount,
            public_gists: profileData.gists.totalCount, public_repos: profileData.repositories.totalCount,
            createdAt: profileData.createdAt,
          });

          const totalStars = profileData.repositories.nodes?.reduce((sum, repo) => sum + (repo.stargazerCount || 0), 0) || 0;
          const totalForks = profileData.repositories.nodes?.reduce((sum, repo) => sum + (repo.forkCount || 0), 0) || 0;
          let yearsOnGitHubText = "N/A";
          if (profileData.createdAt) {
            const memberForMs = new Date().getTime() - new Date(profileData.createdAt).getTime();
            let years = Math.floor(memberForMs / (1000 * 60 * 60 * 24 * 365.25));
            if (years < 0) years = 0;
            if (years < 1 && memberForMs > 0) yearsOnGitHubText = "< 1 year";
            else if (years === 0 && memberForMs <= 0) yearsOnGitHubText = "New Member";
            else yearsOnGitHubText = `${years} year${years !== 1 ? "s" : ""}`;
          }

          setBlocks([
            { id: "followers", title: "Followers", content: (profileData.followers.totalCount || 0).toLocaleString(), icon: <Users className="h-4 w-4" />, colorIndex: 0 },
            { id: "stars", title: "Total Stars", content: totalStars.toLocaleString(), icon: <Star className="h-4 w-4" />, colorIndex: 1 },
            { id: "forks", title: "Total Forks", content: totalForks.toLocaleString(), icon: <GitFork className="h-4 w-4" />, colorIndex: 2 },
            { id: "public_repos", title: "Public Repos", content: (profileData.repositories.totalCount || 0).toLocaleString(), icon: <Archive className="h-4 w-4" />, colorIndex: 0 },
            { id: "public_gists", title: "Public Gists", content: (profileData.gists.totalCount || 0).toLocaleString(), icon: <Code className="h-4 w-4" />, colorIndex: 1 },
            { id: "years_on_github", title: "Years on GitHub", content: yearsOnGitHubText, icon: <CalendarIcon className="h-4 w-4" />, colorIndex: 2 },
          ]);

          const languageMap = new Map<string, { size: number; color: string | null }>();
          profileData.repositories.nodes?.forEach(repo => {
            repo.languages?.edges?.forEach(langEdge => {
              if (langEdge.node.name && langEdge.size > 0) {
                const existing = languageMap.get(langEdge.node.name);
                languageMap.set(langEdge.node.name, {
                  size: (existing?.size || 0) + langEdge.size,
                  color: existing?.color || langEdge.node.color,
                });
              }
            });
          });
          const totalLanguageSize = Array.from(languageMap.values()).reduce((sum, lang) => sum + lang.size, 0);
          const sortedLanguages: LanguageStat[] = Array.from(languageMap.entries())
            .map(([name, data]) => ({ name, size: data.size, color: data.color, percentage: totalLanguageSize > 0 ? parseFloat(((data.size / totalLanguageSize) * 100).toFixed(1)) : 0 }))
            .sort((a, b) => b.size - a.size).slice(0, MAX_TOP_LANGUAGES_DISPLAY);
          setTopLanguages(sortedLanguages);

          if (profileData.contributionsCollection) {
            const contribs = profileData.contributionsCollection;
            const rawBreakdown = [
              { type: "commits" as const, label: "Commits", count: contribs.totalCommitContributions, icon: <GitCommit className="h-4 w-4" />, colorClass: "bg-sky-500" },
              { type: "pullRequests" as const, label: "Pull Requests", count: contribs.totalPullRequestContributions, icon: <GitPullRequest className="h-4 w-4" />, colorClass: "bg-purple-500" },
              { type: "reviews" as const, label: "Code Reviews", count: contribs.totalPullRequestReviewContributions, icon: <Eye className="h-4 w-4" />, colorClass: "bg-teal-500" },
              { type: "issues" as const, label: "Issues Opened", count: contribs.totalIssueContributions, icon: <AlertCircle className="h-4 w-4" />, colorClass: "bg-orange-500" },
            ];
            const totalBreakdownContributions = rawBreakdown.reduce((sum, item) => sum + item.count, 0);
            const formattedBreakdown: ContributionTypeStat[] = rawBreakdown.map(item => ({ ...item, percentage: totalBreakdownContributions > 0 ? parseFloat(((item.count / totalBreakdownContributions) * 100).toFixed(1)) : 0, })).sort((a, b) => b.count - a.count);
            setContributionBreakdown(formattedBreakdown);
            setActivityStats(calculateActivityHighlights(contribs.contributionCalendar));
          } else { setContributionBreakdown([]); setActivityStats(null); }
        } else {
          setUserProfile(null); setBlocks([]); setTopLanguages([]);
          setContributionBreakdown([]); setActivityStats(null);
          if (!error && !refreshing) setError(`User "${currentUsername}" not found or data is inaccessible.`);
        }
      } catch (e: any) {
        console.error("User stats/related data fetch error (GraphQL):", e);
        if (!error && !refreshing) setError(e.message || "Failed to load user profile.");
        setUserProfile(null); setBlocks([]); setTopLanguages([]);
        setContributionBreakdown([]); setActivityStats(null);
      } finally { setLoadingStats(false); }
    }

    if (currentUsername && (sessionStatus === 'authenticated' || refreshing)) { // Added refreshing condition
      loadUserStatsAndRelatedData();
    } else if (sessionStatus === 'loading') {
      setLoadingStats(true);
    } else {
      setLoadingStats(false);
      setUserProfile(null); setBlocks([]); setTopLanguages([]);
      setContributionBreakdown([]); setActivityStats(null);
      if (sessionStatus === "unauthenticated" && currentUsername && !error && !refreshing) {
        // setError("Please sign in to view user statistics."); // Handled by AuthPrompt or section messages
      }
    }
  }, [currentUsername, refreshing, session, sessionStatus, error]);


  const dndStatSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStartSB = useCallback((event: DragStartEvent) =>
    setActiveStatBlockId(event.active.id as string), []);

  const handleDragEndSB = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStatBlockId(null);
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return (oldIndex !== -1 && newIndex !== -1) ? arrayMove(items, oldIndex, newIndex) : items;
      });
    }
  }, []);

  const handleDragCancelSB = useCallback(() => setActiveStatBlockId(null), []);

  const activeSBData = useMemo(() =>
    blocks.find((b) => b.id === activeStatBlockId), [activeStatBlockId, blocks]);

  if (sessionStatus === 'loading' ||
    ((loadingStats || loadingPRs) && !refreshing && !error &&
      !userProfile && featuredPRs.length === 0 && !currentUsername)) {
    return <DashboardLoadingScreen />;
  }

  return (
    <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 p-3 md:p-5">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          currentUsername={currentUsername}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
          onUsernameChange={handleUsernameChange}
          onRefreshAll={refreshAll}
          refreshing={refreshing}
          loadingStats={loadingStats}
          loadingPRs={loadingPRs}
          sessionStatus={sessionStatus}
        />

        <DashboardErrorAlert
          error={error}
          currentUsername={currentUsername}
          refreshing={refreshing}
        />

        {/* Main content area with staggered animations */}
        {sessionStatus === 'authenticated' && currentUsername ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 md:space-y-6" // Adds spacing between animated sections
          >
            {/* 1. User Profile Section */}
            <motion.div variants={sectionVariants}>
              {
                // Logic to display skeleton, profile, or not found message
                (loadingStats && !userProfile && !error && !refreshing) ? (
                  <UserProfileSkeleton />
                ) : userProfile ? (
                  <UserProfileDisplay // Removed the inner motion.div here
                    userProfile={userProfile}
                    currentUsername={currentUsername}
                    activityStats={activityStats}
                  />
                ) : !loadingStats && !userProfile && !error ? (
                  <div
                    className="p-4 md:p-6 text-center text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center"
                    style={{ minHeight: '180px' }}
                  >
                    Profile for "<strong>{currentUsername}</strong>" not found or is not available.
                  </div>
                ) : (!loadingStats && !userProfile && error && !refreshing) ? null : ( // If error, DashboardErrorAlert handles it.
                  // Show skeleton if loading for a new user (after username change) or initial load if not covered by main loader
                  (loadingStats || (!userProfile && !error && !refreshing)) && <UserProfileSkeleton />
                )
              }
            </motion.div>

            {/* 2. Pull Request Section */}
            <motion.div variants={sectionVariants}>
              <PullRequestSection
                currentUsername={currentUsername}
                featuredPRs={featuredPRs}
                loadingPRs={loadingPRs}
                sessionStatus={sessionStatus}
              />
            </motion.div>

            {/* 3. Activity Tabs Section */}
            <motion.div variants={sectionVariants}>
              <ActivityTabs
                currentUsername={currentUsername}
                contributionBreakdown={contributionBreakdown}
                loadingStats={loadingStats}
                sessionStatus={sessionStatus}
              />
            </motion.div>

            {/* 4. Statistics Grid Section */}
            <motion.div variants={sectionVariants}>
              <StatisticsGrid
                blocks={blocks}
                loadingStats={loadingStats}
                sessionStatus={sessionStatus}
                dndSensors={dndStatSensors}
                onDragStart={handleDragStartSB}
                onDragEnd={handleDragEndSB}
                onDragCancel={handleDragCancelSB}
                activeBlockId={activeStatBlockId}
                activeBlockData={activeSBData}
                currentUsername={currentUsername}
                error={error}
                userProfile={userProfile}
              />
            </motion.div>
          </motion.div>
        ) : sessionStatus === 'unauthenticated' && currentUsername && !error ? (
          <div
            className="my-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-600 dark:text-yellow-300 rounded-md shadow-sm text-center flex items-center justify-center"
            style={{ minHeight: '100px' }}
          >
            Please sign in to view the full profile for <strong className="font-semibold">{currentUsername}</strong>.
          </div>
        ) : null}

        {(!currentUsername || (sessionStatus === 'unauthenticated' && !error)) && (
          <AuthPrompt
            sessionStatus={sessionStatus}
            loadingStats={loadingStats}
            loadingPRs={loadingPRs}
          />
        )}
      </div>
    </div>
  );
}
