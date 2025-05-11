// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
  Calendar as CalendarIcon, GitCommit, Eye, GitPullRequest, type LucideIcon,
} from "lucide-react";

import {
  type Block, type UserProfile, type PullRequest, type LanguageStat,
  type ContributionTypeStat, type ContributionActivityStats,
} from "@/components/dashboard/types";

import { DashboardLoadingScreen } from "@/components/dashboard/DashboardLoadingScreen";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserProfileDisplay } from "@/components/dashboard/UserProfileDisplay";
import { DashboardErrorAlert } from "@/components/dashboard/DashboardErrorAlert";
import { PullRequestSection } from "@/components/dashboard/PullRequestSection";
import { ActivityTabs } from "@/components/dashboard/ActivityTabs";
import { StatisticsGrid } from "@/components/dashboard/StatisticsGrid";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";

import { api } from "~/trpc/react";

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

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const iconMap: Record<string, LucideIcon> = {
  GitCommit, GitPullRequest, Eye, AlertCircle, Users, Star, GitFork, Archive, Code, CalendarIcon,
};

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [currentUsername, _setUsernameInternal] = useState("ThePrimeagen");
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Assuming default, will be updated by useEffect
  const [activeStatBlockId, setActiveStatBlockId] = useState<string | null>(null);

  // This state tracks if the very first load for a username's profile has completed.
  // It helps in deciding if a full animation is needed vs. a quick one.
  const [isInitialProfileDataLoad, setIsInitialProfileDataLoad] = useState(true);
  const dndStatSensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before activating
      // Allows for clicking on elements within items without triggering a drag
      activationConstraint: {
        distance: 8, // Or your preferred distance
      },
    }),
    useSensor(KeyboardSensor, {
      // You might configure keyboard controls here if needed
      // coordinateGetter: sortableKeyboardCoordinates, // If using sortable lists with keyboard
    })
  );


  const trpcUtils = api.useUtils();

  const userProfileAndStatsQuery = api.github.getUserProfileAndStats.useQuery(
    { username: currentUsername },
    {
      enabled: !!currentUsername && sessionStatus === "authenticated",
      onSuccess: (data) => {
        // If data is successfully fetched (even from cache after an initial fetch),
        // and it contains a user profile, we consider the "initial load" for this profile display done.
        if (data?.userProfile) {
          setIsInitialProfileDataLoad(false);
        }
      },
      onError: () => {
        // If there's an error, we might still want to reset initial load status
        // if user changes, or handle it based on specific error.
        // For now, error doesn't change this flag.
      }
    }
  );

  const pullRequestsQuery = api.github.getUserPullRequests.useQuery(
    { username: currentUsername },
    { enabled: !!currentUsername && sessionStatus === "authenticated" }
  );

  // Direct access to query results
  const statsQueryResult = userProfileAndStatsQuery.data;
  const prQueryResult = pullRequestsQuery.data;

  // Query status flags
  const isLoadingStats = userProfileAndStatsQuery.isLoading; // True only on first fetch (no cache)
  const isFetchingStats = userProfileAndStatsQuery.isFetching; // True during any fetch
  const isLoadingPRs = pullRequestsQuery.isLoading;
  const isFetchingPRs = pullRequestsQuery.isFetching;

  // Derived data
  const userProfileData = statsQueryResult?.userProfile ?? null;
  const basicStatsData = statsQueryResult?.basicStats ?? null;
  const activityStatsData = statsQueryResult?.activityStats ?? null;
  const contributionBreakdownRaw = statsQueryResult?.contributionBreakdown ?? [];
  const topLanguagesData = statsQueryResult?.topLanguages ?? [];
  const featuredPRsData = prQueryResult ?? [];

  const contributionBreakdown: ContributionTypeStat[] = useMemo(() => {
    return contributionBreakdownRaw.map(item => ({
      ...item,
      icon: item.iconName && iconMap[item.iconName] ? React.createElement(iconMap[item.iconName], { className: "h-4 w-4" }) : <AlertCircle className="h-4 w-4" />,
    }));
  }, [contributionBreakdownRaw]);

  const blocks: Block[] = useMemo(() => {
    if (!userProfileData || !basicStatsData) return [];
    return [
      { id: "followers", title: "Followers", content: (basicStatsData.followers || 0).toLocaleString(), icon: <Users className="h-4 w-4" />, colorIndex: 0 },
      { id: "stars", title: "Total Stars", content: (basicStatsData.totalStars || 0).toLocaleString(), icon: <Star className="h-4 w-4" />, colorIndex: 1 },
      { id: "forks", title: "Total Forks", content: (basicStatsData.totalForks || 0).toLocaleString(), icon: <GitFork className="h-4 w-4" />, colorIndex: 2 },
      { id: "public_repos", title: "Public Repos", content: (basicStatsData.publicRepos || 0).toLocaleString(), icon: <Archive className="h-4 w-4" />, colorIndex: 0 },
      { id: "public_gists", title: "Public Gists", content: (basicStatsData.publicGists || 0).toLocaleString(), icon: <Code className="h-4 w-4" />, colorIndex: 1 },
      { id: "years_on_github", title: "Years on GitHub", content: basicStatsData.yearsOnGitHub, icon: <CalendarIcon className="h-4 w-4" />, colorIndex: 2 },
    ];
  }, [userProfileData, basicStatsData]);

  const [dndBlocks, setDndBlocks] = useState<Block[]>(blocks);
  useEffect(() => { setDndBlocks(blocks); }, [blocks]);

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
    const trimmedUsername = newUsername.trim();
    if (trimmedUsername && trimmedUsername !== currentUsername) {
      _setUsernameInternal(trimmedUsername);
      setIsInitialProfileDataLoad(true); // Reset for new user, so full animation plays
      // Queries will refetch due to currentUsername change.
    }
  };

  const handleUsernameChange = () => {
    const nu = prompt("Enter GitHub username:", currentUsername);
    if (nu && nu.trim()) setUsername(nu.trim());
  };

  const refreshAll = useCallback(() => {
    if (currentUsername && sessionStatus === "authenticated") {
      setIsInitialProfileDataLoad(true); // Treat refresh as an initial load for animation
      trpcUtils.github.getUserProfileAndStats.invalidate({ username: currentUsername });
      trpcUtils.github.getUserPullRequests.invalidate({ username: currentUsername });
    }
  }, [currentUsername, sessionStatus, trpcUtils.github]);

  const handleDragStartSB = useCallback((event: DragStartEvent) => setActiveStatBlockId(event.active.id as string), []);
  const handleDragEndSB = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStatBlockId(null);
    if (over && active.id !== over.id) {
      setDndBlocks((items) => {
        const oldIdx = items.findIndex(item => item.id === active.id);
        const newIdx = items.findIndex(item => item.id === over.id);
        return (oldIdx !== -1 && newIdx !== -1) ? arrayMove(items, oldIdx, newIdx) : items;
      });
    }
  }, []);
  const handleDragCancelSB = useCallback(() => setActiveStatBlockId(null), []);
  const activeSBData = useMemo(() => dndBlocks.find(b => b.id === activeStatBlockId), [activeStatBlockId, dndBlocks]);

  // Overall loading for the entire page (skeletons or main loading screen)
  const isOverallInitialPageLoad = isLoadingStats || isLoadingPRs;

  // Show main loading screen only on the very first hard load or session loading
  if (sessionStatus === 'loading' || (isOverallInitialPageLoad && !statsQueryResult && !prQueryResult && !currentUsername)) {
    return <DashboardLoadingScreen />;
  }

  // Skeleton conditions for individual sections
  const showProfileSkeleton = isLoadingStats || (isFetchingStats && !statsQueryResult);
  const showPRSkeleton = isLoadingPRs || (isFetchingPRs && !prQueryResult);
  // ... add for other sections like ActivityTabs, StatisticsGrid if needed based on their data source

  const combinedError = userProfileAndStatsQuery.error?.message ?? pullRequestsQuery.error?.message ?? null;

  return (
    <>
      <DashboardHeader
        currentUsername={currentUsername}
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
        onUsernameChange={handleUsernameChange}
        onRefreshAll={refreshAll}
        refreshing={isFetchingStats || isFetchingPRs} // Any fetch activity
        loadingStats={isFetchingStats} // Specific to stats
        loadingPRs={isFetchingPRs}     // Specific to PRs
        sessionStatus={sessionStatus}
      />
      <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 p-3 mt-12 ">
        <div className="max-w-[87rem] mx-auto">

          <DashboardErrorAlert
            error={combinedError}
            currentUsername={currentUsername}
            refreshing={isFetchingStats || isFetchingPRs}
          />

          {sessionStatus === 'authenticated' && currentUsername ? (
            <motion.div
              key={currentUsername} // Add key here to force re-render of container on username change, resetting animations
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 md:space-y-6"
            >
              {/* 1. User Profile Section */}
              <motion.div variants={sectionVariants}>
                {showProfileSkeleton && !combinedError ? (
                  <UserProfileSkeleton />
                ) : userProfileData ? (
                  <UserProfileDisplay
                    userProfile={userProfileData}
                    currentUsername={currentUsername}
                    activityStats={activityStatsData}
                    isInitialLoad={isInitialProfileDataLoad || isLoadingStats} // Animate fully if initial or explicit loading
                  />
                ) : !isLoadingStats && !isFetchingStats && !userProfileData && !combinedError ? (
                  <div
                    className="p-4 md:p-6 text-center text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-center"
                    style={{ minHeight: '180px' }}
                  >
                    Profile for "<strong>{currentUsername}</strong>" not found or is not available.
                  </div>
                ) : null}
              </motion.div>

              {/* 2. Pull Request Section */}
              <motion.div variants={sectionVariants}>
                <PullRequestSection
                  currentUsername={currentUsername}
                  featuredPRs={featuredPRsData}
                  loadingPRs={showPRSkeleton} // Use specific skeleton flag
                  sessionStatus={sessionStatus}
                />
              </motion.div>

              {/* 3. Activity Tabs Section */}
              <motion.div variants={sectionVariants}>
                <ActivityTabs
                  currentUsername={currentUsername}
                  contributionBreakdown={contributionBreakdown}
                  loadingStats={showProfileSkeleton} // Tie to profile skeleton for now
                  sessionStatus={sessionStatus}
                />
              </motion.div>

              {/* 4. Statistics Grid Section */}
              <motion.div variants={sectionVariants}>
                <StatisticsGrid
                  blocks={dndBlocks}
                  loadingStats={showProfileSkeleton} // Tie to profile skeleton for now
                  sessionStatus={sessionStatus}
                  dndSensors={dndStatSensors}
                  onDragStart={handleDragStartSB}
                  onDragEnd={handleDragEndSB}
                  onDragCancel={handleDragCancelSB}
                  activeBlockId={activeStatBlockId}
                  activeBlockData={activeSBData}
                  currentUsername={currentUsername}
                  error={combinedError}
                  userProfile={userProfileData}
                />
              </motion.div>
            </motion.div>
          ) : sessionStatus === 'unauthenticated' && currentUsername && !combinedError ? (
            <div
              className="my-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-600 dark:text-yellow-300 rounded-md shadow-sm text-center flex items-center justify-center"
              style={{ minHeight: '100px' }}
            >
              Please sign in to view the full profile for <strong className="font-semibold">{currentUsername}</strong>.
            </div>
          ) : null}

          {(!currentUsername || (sessionStatus === 'unauthenticated' && !combinedError)) && (
            <AuthPrompt
              sessionStatus={sessionStatus}
              loadingStats={isLoadingStats}
              loadingPRs={isLoadingPRs}
            />
          )}
        </div>
      </div>
    </>
  );
}
