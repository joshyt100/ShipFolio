// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";

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
  AlertCircle, // Used for Issues Opened
  Calendar as CalendarIcon,
  GitCommit,
  Eye,
  GitPullRequest,
} from "lucide-react";

import { fetchGitHubGraphQL } from "@/lib/github-graphql";
import {
  type Block,
  type UserProfile,
  type PullRequest,
  type LanguageStat,
  type ContributionTypeStat,
  type GraphQLUserStatsData,
  type GraphQLUserPullRequestsData,
  USER_STATS_QUERY,
  USER_PULL_REQUESTS_QUERY,
  MAX_TOP_LANGUAGES_DISPLAY,
} from "../../components/dashboard/types"; // Assuming types.ts is in the same directory or adjust path

// Import new components
import { DashboardLoadingScreen } from "@/components/dashboard/DashboardLoadingScreen";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserProfileDisplay } from "@/components/dashboard/UserProfileDisplay";
import { DashboardErrorAlert } from "@/components/dashboard/DashboardErrorAlert";
import { PullRequestSection } from "@/components/dashboard/PullRequestSection";
import { ActivityTabs } from "@/components/dashboard/ActivityTabs";
import { StatisticsGrid } from "@/components/dashboard/StatisticsGrid";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";
// TopLanguagesCard is commented out, so no active import needed for it unless it's used.

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [currentUsername, _setUsernameInternal] = useState("ThePrimeagen"); // Default user
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark or read from preference

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [featuredPRs, setFeaturedPRs] = useState<PullRequest[]>([]);
  const [topLanguages, setTopLanguages] = useState<LanguageStat[]>([]);
  const [contributionBreakdown, setContributionBreakdown] = useState<ContributionTypeStat[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPRs, setLoadingPRs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeStatBlockId, setActiveStatBlockId] = useState<string | null>(null);

  const setUsername = (newUsername: string) => {
    if (newUsername && newUsername.trim() && newUsername.trim() !== currentUsername) {
      setError(null); // Clear previous errors
      _setUsernameInternal(newUsername.trim());
      // Data fetching will be triggered by useEffect dependencies on currentUsername
    }
  };

  const handleUsernameChange = () => {
    const nu = prompt("Enter GitHub username:", currentUsername);
    if (nu && nu.trim()) {
      setUsername(nu.trim());
    }
  };

  // Theme persistence
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

  // Refresh logic
  useEffect(() => {
    if (refreshing && !loadingStats && !loadingPRs) {
      setRefreshing(false);
    }
  }, [refreshing, loadingStats, loadingPRs]);

  const refreshAll = useCallback(() => {
    setError(null);
    setRefreshing(true);
    // Data fetching useEffects will pick up 'refreshing' or 'currentUsername' change
  }, []);


  // Fetch Pull Requests
  useEffect(() => {
    async function fetchPRs() {
      if (!currentUsername || sessionStatus !== "authenticated" || !session) {
        setFeaturedPRs([]); setLoadingPRs(false);
        if (sessionStatus === "unauthenticated" && currentUsername && !error) {
          setError("Please sign in to view pull requests.");
        }
        return;
      }
      setLoadingPRs(true);
      setError(null); // Clear previous PR errors before new fetch

      try {
        const prSearchString = `author:${currentUsername} type:pr sort:updated-desc`;
        const gqlResponse = await fetchGitHubGraphQL<GraphQLUserPullRequestsData>(
          USER_PULL_REQUESTS_QUERY,
          { searchQueryString: prSearchString, first: 15 },
          session
        );

        if (gqlResponse?.search?.edges) {
          const formattedPRs: PullRequest[] = gqlResponse.search.edges
            .map(edge => {
              if (!edge?.node || edge.node.databaseId === null || !edge.node.author) return null;
              let state: PullRequest["state"] = "closed";
              if (edge.node.state === "OPEN") state = "open";
              else if (edge.node.merged || edge.node.state === "MERGED") state = "merged"; // Check merged boolean as well
              return {
                id: edge.node.databaseId, title: edge.node.title, number: edge.node.number,
                url: edge.node.url, state: state, createdAt: edge.node.createdAt,
                repository: { name: edge.node.repository.nameWithOwner, url: edge.node.repository.url },
                user: { login: edge.node.author.login, avatar_url: edge.node.author.avatarUrl },
              };
            }).filter((pr): pr is PullRequest => pr !== null);
          setFeaturedPRs(formattedPRs);
        } else {
          setFeaturedPRs([]);
          if (gqlResponse && (!gqlResponse.search || typeof gqlResponse.search.edges === 'undefined')) {
            console.warn("GraphQL PR response structure unexpected or empty:", gqlResponse);
            if (!error) setError("Could not retrieve pull requests. Data might be malformed or unavailable.");
          }
        }
      } catch (e: any) {
        console.error("Featured PRs fetch error (GraphQL):", e);
        if (!error) setError(e.message || "Failed to fetch pull requests.");
        setFeaturedPRs([]);
      } finally {
        setLoadingPRs(false);
      }
    }

    if (currentUsername && sessionStatus === 'authenticated') {
      fetchPRs();
    } else if (sessionStatus === 'loading') {
      setLoadingPRs(true); // Show loading if session is loading
    } else {
      setLoadingPRs(false);
      setFeaturedPRs([]);
      if (sessionStatus === "unauthenticated" && currentUsername && !error) {
        setError("Please sign in to view pull requests.");
      }
    }
  }, [currentUsername, refreshing, session, sessionStatus, error]); // Added error to dependency to avoid re-fetching if error is already set from other sources.

  // Fetch User Stats and Related Data (Profile, Languages, Contributions)
  useEffect(() => {
    async function loadUserStatsAndRelatedData() {
      if (!currentUsername || sessionStatus !== "authenticated" || !session) {
        setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]); setLoadingStats(false);
        if (sessionStatus === "unauthenticated" && currentUsername && !error) {
          setError("Please sign in to fetch user data.");
        }
        return;
      }
      setLoadingStats(true);
      setError(null); // Clear previous stats errors
      // Clear data before fetching new user's data
      setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]);


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
            const years = Math.floor(memberForMs / (1000 * 60 * 60 * 24 * 365.25));
            if (years < 0) yearsOnGitHubText = "N/A"; // Should not happen
            else if (years < 1) yearsOnGitHubText = "< 1 year";
            else yearsOnGitHubText = `${years} year${years !== 1 ? "s" : ""}`;
          }

          setBlocks([
            { id: "followers", title: "Followers", content: (profileData.followers.totalCount || 0).toLocaleString(), icon: <Users className="h-5 w-5" />, colorIndex: 0 },
            { id: "stars", title: "Total Stars Received", content: totalStars.toLocaleString(), icon: <Star className="h-5 w-5" />, colorIndex: 1 },
            { id: "forks", title: "Total Forks Received", content: totalForks.toLocaleString(), icon: <GitFork className="h-5 w-5" />, colorIndex: 2 },
            { id: "public_repos", title: "Public Repos", content: (profileData.repositories.totalCount || 0).toLocaleString(), icon: <Archive className="h-5 w-5" />, colorIndex: 0 },
            { id: "public_gists", title: "Public Gists", content: (profileData.gists.totalCount || 0).toLocaleString(), icon: <Code className="h-5 w-5" />, colorIndex: 1 },
            { id: "years_on_github", title: "Years on GitHub", content: yearsOnGitHubText, icon: <CalendarIcon className="h-5 w-5" />, colorIndex: 2 },
          ]);

          // Process languages
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
            .map(([name, data]) => ({
              name, size: data.size, color: data.color,
              percentage: totalLanguageSize > 0 ? parseFloat(((data.size / totalLanguageSize) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.size - a.size)
            .slice(0, MAX_TOP_LANGUAGES_DISPLAY);
          setTopLanguages(sortedLanguages);

          // Process Contribution Breakdown
          if (profileData.contributionsCollection) {
            const contribs = profileData.contributionsCollection;
            const rawBreakdown = [
              { type: "commits" as const, label: "Commits", count: contribs.totalCommitContributions, icon: <GitCommit className="h-4 w-4" />, colorClass: "bg-sky-500" },
              { type: "pullRequests" as const, label: "Pull Requests Created", count: contribs.totalPullRequestContributions, icon: <GitPullRequest className="h-4 w-4" />, colorClass: "bg-purple-500" },
              { type: "reviews" as const, label: "Code Reviews", count: contribs.totalPullRequestReviewContributions, icon: <Eye className="h-4 w-4" />, colorClass: "bg-teal-500" },
              { type: "issues" as const, label: "Issues Opened", count: contribs.totalIssueContributions, icon: <AlertCircle className="h-4 w-4" />, colorClass: "bg-orange-500" },
            ];
            const totalBreakdownContributions = rawBreakdown.reduce((sum, item) => sum + item.count, 0);
            const formattedBreakdown: ContributionTypeStat[] = rawBreakdown.map(item => ({
              ...item,
              percentage: totalBreakdownContributions > 0 ? parseFloat(((item.count / totalBreakdownContributions) * 100).toFixed(1)) : 0,
            })).sort((a, b) => b.count - a.count); // Sort by count desc
            setContributionBreakdown(formattedBreakdown);
          } else {
            setContributionBreakdown([]);
          }

        } else {
          setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]);
          if (!error) setError(`User "${currentUsername}" not found or data is inaccessible.`);
        }
      } catch (e: any) {
        console.error("User stats/related data fetch error (GraphQL):", e);
        if (!error) setError(e.message || "Failed to load user profile.");
        setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]);
      } finally {
        setLoadingStats(false);
      }
    }
    if (currentUsername && sessionStatus === 'authenticated') {
      loadUserStatsAndRelatedData();
    } else if (sessionStatus === 'loading') {
      setLoadingStats(true); // Show loading if session is loading
    } else {
      setLoadingStats(false);
      setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]);
      if (sessionStatus === "unauthenticated" && currentUsername && !error) {
        setError("Please sign in to view user statistics.");
      }
    }
    // }, [currentUsername, refreshing, session, sessionStatus]); // Removed 'error' from deps here to allow re-fetch on user change even if prior error
  }, [currentUsername, refreshing, session, sessionStatus, error]);


  // DND for Stat Blocks
  const dndStatSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragStartSB = useCallback((event: DragStartEvent) => setActiveStatBlockId(event.active.id as string), []);
  const handleDragEndSB = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStatBlockId(null);
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return oldIndex !== -1 && newIndex !== -1 ? arrayMove(items, oldIndex, newIndex) : items;
      });
    }
  }, []);
  const handleDragCancelSB = useCallback(() => setActiveStatBlockId(null), []);
  const activeSBData = useMemo(() => blocks.find((b) => b.id === activeStatBlockId), [activeStatBlockId, blocks]);


  // Initial loading state for the whole page
  if (sessionStatus === 'loading' || ((loadingStats || loadingPRs) && !refreshing && !error && !userProfile && featuredPRs.length === 0)) {
    // More robust initial loading: check if essential data isn't there yet and we are loading
    return <DashboardLoadingScreen />;
  }

  return (
    <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 p-4 md:p-6">
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

        {userProfile && (
          <UserProfileDisplay userProfile={userProfile} currentUsername={currentUsername} />
        )}

        <DashboardErrorAlert error={error} currentUsername={currentUsername} refreshing={refreshing} />

        <PullRequestSection
          currentUsername={currentUsername}
          featuredPRs={featuredPRs}
          loadingPRs={loadingPRs}
          sessionStatus={sessionStatus}
        />

        <ActivityTabs
          currentUsername={currentUsername}
          contributionBreakdown={contributionBreakdown}
          loadingStats={loadingStats}
        />

        {/* TopLanguagesCard would be part of ActivityTabs or a separate section if active */}

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

        <AuthPrompt sessionStatus={sessionStatus} loadingStats={loadingStats} loadingPRs={loadingPRs} />

      </div>
    </div>
  );
}
