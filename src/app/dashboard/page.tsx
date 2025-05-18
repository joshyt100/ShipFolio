"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  Users,
  Star,
  GitFork,
  Archive,
  Code,
  AlertCircle,
  Calendar as CalendarIcon,
  GitCommit,
  GitPullRequest,
  Eye,
  type LucideIcon,
} from "lucide-react";

import {
  Block,
  ContributionTypeStat,
  PullRequest,
} from "@/components/dashboard/types";

// Lazy‑loaded dashboard pieces (keeps import list tidy)
import { DashboardLoadingScreen } from "@/components/dashboard/DashboardLoadingScreen";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserProfileDisplay } from "@/components/dashboard/UserProfileDisplay";
import { DashboardErrorAlert } from "@/components/dashboard/DashboardErrorAlert";
import { PullRequestSection } from "@/components/dashboard/PullRequestSection";
import { ActivityTabs } from "@/components/dashboard/ActivityTabs";
import { StatisticsGrid } from "@/components/dashboard/StatisticsGrid";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";

import { api } from "~/trpc/react";

/* ────────────────────────────────
 *  Skeleton + framer‑motion helpers
 * ───────────────────────────────*/

const UserProfileSkeleton = () => (
  <div
    className="animate-pulse bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-4 md:p-6 mb-6 shadow-sm"
    style={{ minHeight: "180px" }}
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="h-20 w-20 md:h-24 md:w-24 bg-neutral-300 dark:bg-neutral-700 rounded-full shrink-0" />
      <div className="flex-1 w-full">
        <div className="h-6 md:h-7 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2 sm:w-48 mb-2" />
        <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4 sm:w-64 mb-1.5" />
        <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-full sm:w-1/2 md:w-1/3" />
      </div>
    </div>
    <div className="mt-3 sm:mt-4 space-y-2">
      <div className="h-3.5 bg-neutral-300 dark:bg-neutral-700 rounded w-full" />
      <div className="h-3.5 bg-neutral-300 dark:bg-neutral-700 rounded w-5/6" />
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
  GitCommit,
  GitPullRequest,
  Eye,
  AlertCircle,
  Users,
  Star,
  GitFork,
  Archive,
  Code,
  CalendarIcon,
};

/* ────────────────────────────────
 *              Page
 * ───────────────────────────────*/

export default function DashboardPage() {
  /* —— Auth/session —— */
  const { status: sessionStatus } = useSession();

  /* —— Local UI state —— */
  const [currentUsername, setUsernameInternal] = useState("ThePrimeagen");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [activeStatBlockId, setActiveStatBlockId] = useState<string | null>(null);
  const [isInitialProfileDataLoad, setIsInitialProfileDataLoad] = useState(true);

  /* —— DnD sensors —— */
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  /* ──────────────────── tRPC hooks ──────────────────── */
  const trpcCtx = api.useUtils();

  // Mutation for refreshing GitHub data
  const {
    mutateAsync: refreshGitHubData,
    isLoading: isRefreshing,
  } = api.github.refreshGitHubData.useMutation({
    onSuccess: async (_, { username }) => {
      // Bust caches so the latest data is fetched automatically
      await Promise.all([
        trpcCtx.github.getUserProfileAndStats.invalidate({ username }),
        trpcCtx.github.getUserPullRequests.invalidate({ username }),
      ]);
    },
  });

  // Queries (auto‑disabled until session ready)
  const statsQuery = api.github.getUserProfileAndStats.useQuery(
    { username: currentUsername },
    {
      enabled: !!currentUsername && sessionStatus === "authenticated",
      onSuccess: () => setIsInitialProfileDataLoad(false),
    }
  );

  const prsQuery = api.github.getUserPullRequests.useQuery(
    { username: currentUsername },
    { enabled: !!currentUsername && sessionStatus === "authenticated" }
  );

  /* ──────────────────── Derived data ──────────────────── */
  const userProfile = statsQuery.data?.userProfile ?? null;
  const basicStats = statsQuery.data?.basicStats as
    | {
      followers: number;
      totalStars: number;
      totalForks: number;
      publicRepos: number;
      publicGists: number;
      yearsOnGitHub: string;
    }
    | null;
  const contributionBreakdownRaw = statsQuery.data?.contributionBreakdown ?? [];
  const activityStats = statsQuery.data?.activityStats ?? null;
  const featuredPRs = prsQuery.data ?? [];

  const contributionBreakdown: ContributionTypeStat[] = useMemo(() => {
    return (contributionBreakdownRaw as any[]).map((item) => ({
      ...item,
      icon: item.iconName && iconMap[item.iconName]
        ? React.createElement(iconMap[item.iconName], { className: "h-4 w-4" })
        : <AlertCircle className="h-4 w-4" />,
    }));
  }, [contributionBreakdownRaw]);

  const statBlocks: Block[] = useMemo(() => {
    if (!basicStats) return [];
    return [
      { id: "followers", title: "Followers", content: basicStats.followers.toLocaleString(), icon: <Users className="h-4 w-4" />, colorIndex: 0 },
      { id: "stars", title: "Total Stars", content: basicStats.totalStars.toLocaleString(), icon: <Star className="h-4 w-4" />, colorIndex: 1 },
      { id: "forks", title: "Total Forks", content: basicStats.totalForks.toLocaleString(), icon: <GitFork className="h-4 w-4" />, colorIndex: 2 },
      { id: "public_repos", title: "Public Repos", content: basicStats.publicRepos.toLocaleString(), icon: <Archive className="h-4 w-4" />, colorIndex: 0 },
      { id: "public_gists", title: "Public Gists", content: basicStats.publicGists.toLocaleString(), icon: <Code className="h-4 w-4" />, colorIndex: 1 },
      { id: "years", title: "Years on GitHub", content: basicStats.yearsOnGitHub, icon: <CalendarIcon className="h-4 w-4" />, colorIndex: 2 },
    ];
  }, [basicStats]);

  // Allow drag‑and‑drop re‑ordering
  const [dndBlocks, setDndBlocks] = useState<Block[]>(statBlocks);
  useEffect(() => setDndBlocks(statBlocks), [statBlocks]);

  /* ──────────────────── Theme helpers ──────────────────── */
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

  /* ──────────────────── Username helpers ──────────────────── */
  const setUsername = (nu: string) => {
    const trimmed = nu.trim();
    if (trimmed && trimmed !== currentUsername) {
      setUsernameInternal(trimmed);
      setIsInitialProfileDataLoad(true);
    }
  };

  const askForUsername = () => {
    const nu = prompt("Enter GitHub username:", currentUsername);
    if (nu) setUsername(nu);
  };

  /* ──────────────────── Refresh‑all helper ──────────────────── */
  const refreshAll = useCallback(async () => {
    if (!currentUsername || sessionStatus !== "authenticated") return;
    setIsInitialProfileDataLoad(true);
    try {
      await refreshGitHubData({ username: currentUsername });
    } catch (err) {
      console.error("GitHub refresh failed", err);
    }
  }, [currentUsername, sessionStatus, refreshGitHubData]);

  /* ──────────────────── DnD callbacks ──────────────────── */
  const handleDragStartSB = useCallback(
    (e: DragStartEvent) => setActiveStatBlockId(e.active.id as string),
    []
  );

  const handleDragEndSB = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    setActiveStatBlockId(null);
    if (over && active.id !== over.id) {
      setDndBlocks((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        return oldIdx !== -1 && newIdx !== -1 ? arrayMove(items, oldIdx, newIdx) : items;
      });
    }
  }, []);

  const handleDragCancelSB = useCallback(() => setActiveStatBlockId(null), []);

  const activeSBData = useMemo(
    () => dndBlocks.find((b) => b.id === activeStatBlockId),
    [activeStatBlockId, dndBlocks]
  );

  /* ──────────────────── Early rendering states ──────────────────── */
  const loadingInitial =
    (statsQuery.isLoading && !statsQuery.data) ||
    (prsQuery.isLoading && !prsQuery.data) ||
    sessionStatus === "loading";

  if (loadingInitial) return <DashboardLoadingScreen />;

  const combinedError = statsQuery.error?.message ?? prsQuery.error?.message ?? null;

  const showProfileSkeleton = statsQuery.isFetching && !statsQuery.isLoading;
  const showPRSkeleton = prsQuery.isFetching && !prsQuery.isLoading;

  /* ──────────────────── Render ──────────────────── */
  return (
    <>
      <DashboardHeader
        currentUsername={currentUsername}
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
        onUsernameChange={askForUsername}
        onRefreshAll={refreshAll}
        refreshing={isRefreshing || statsQuery.isFetching || prsQuery.isFetching}
        loadingStats={statsQuery.isFetching}
        loadingPRs={prsQuery.isFetching}
        sessionStatus={sessionStatus}
      />

      <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 p-3 mt-12">
        <div className="max-w-[87rem] mx-auto">
          <DashboardErrorAlert
            error={combinedError}
            currentUsername={currentUsername}
            refreshing={isRefreshing || statsQuery.isFetching || prsQuery.isFetching}
          />

          {sessionStatus === "authenticated" && currentUsername ? (
            <motion.div
              key={currentUsername}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 md:space-y-6"
            >
              {/* Profile */}
              <motion.div variants={sectionVariants}>
                {showProfileSkeleton && !combinedError ? (
                  <UserProfileSkeleton />
                ) : userProfile ? (
                  <UserProfileDisplay
                    userProfile={userProfile as UserProfile}
                    currentUsername={currentUsername}
                    activityStats={activityStats}
                    isInitialLoad={isInitialProfileDataLoad}
                  />
                ) : null}
              </motion.div>

              {/* PRs */}
              <motion.div variants={sectionVariants}>
                <PullRequestSection
                  currentUsername={currentUsername}
                  featuredPRs={featuredPRs as PullRequest[]}
                  loadingPRs={showPRSkeleton}
                  sessionStatus={sessionStatus}
                />
              </motion.div>

              {/* Contribution breakdown */}
              <motion.div variants={sectionVariants}>
                <ActivityTabs
                  currentUsername={currentUsername}
                  contributionBreakdown={contributionBreakdown}
                  loadingStats={showProfileSkeleton}
                  sessionStatus={sessionStatus}
                />
              </motion.div>

              {/* Statistics grid */}
              <motion.div variants={sectionVariants}>
                <StatisticsGrid
                  blocks={dndBlocks}
                  loadingStats={showProfileSkeleton}
                  sessionStatus={sessionStatus}
                  dndSensors={dndSensors}
                  onDragStart={handleDragStartSB}
                  onDragEnd={handleDragEndSB}
                  onDragCancel={handleDragCancelSB}
                  activeBlockId={activeStatBlockId}
                  activeBlockData={activeSBData}
                  currentUsername={currentUsername}
                  error={combinedError}
                  userProfile={userProfile as UserProfile | null}
                />
              </motion.div>
            </motion.div>
          ) : sessionStatus === "unauthenticated" && currentUsername && !combinedError ? (
            <div
              className="my-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-600 dark:text-yellow-300 rounded-md shadow-sm text-center flex items-center justify-center"
              style={{ minHeight: "100px" }}
            >
              Please sign in to view the full profile for <strong className="font-semibold">{currentUsername}</strong>.
            </div>
          ) : null}

          {/* Auth prompt */}
          {(!currentUsername || (sessionStatus === "unauthenticated" && !combinedError)) && (
            <AuthPrompt
              sessionStatus={sessionStatus}
              loadingStats={statsQuery.isLoading}
              loadingPRs={prsQuery.isLoading}
            />
          )}
        </div>
      </div>
    </>
  );
}

