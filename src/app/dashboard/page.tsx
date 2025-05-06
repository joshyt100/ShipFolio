"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import GitHubCalendar from "react-github-calendar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Star,
  GitFork,
  GitPullRequest,
  Archive,
  Code,
  GripVertical,
  Github,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Calendar,
  Moon,
  Sun,
  Link,
  Clock,
  Check,
  X,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ModeToggle } from "~/components/mode-toggle/ModeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

// Define monochrome color schemes for stat cards
const monochromeSchemes = [
  {
    light: {
      gradient: "from-gray-200 to-gray-300",
      shadow: "shadow-gray-300/20",
      icon: "bg-gradient-to-br from-gray-600 to-gray-800",
      border: "border-gray-300",
      bg: "bg-white",
      text: "text-gray-900",
    },
    dark: {
      gradient: "from-gray-800 to-gray-900",
      shadow: "shadow-black/40",
      icon: "bg-gradient-to-br from-gray-500 to-white",
      border: "border-gray-800",
      bg: "bg-gray-900",
      text: "text-white",
    },
  },
  {
    light: {
      gradient: "from-gray-300 to-gray-400",
      shadow: "shadow-gray-400/20",
      icon: "bg-gradient-to-br from-gray-700 to-black",
      border: "border-gray-300",
      bg: "bg-white",
      text: "text-gray-900",
    },
    dark: {
      gradient: "from-gray-700 to-gray-800",
      shadow: "shadow-black/40",
      icon: "bg-gradient-to-br from-gray-400 to-gray-200",
      border: "border-gray-700",
      bg: "bg-gray-900",
      text: "text-white",
    },
  },
  {
    light: {
      gradient: "from-gray-100 to-gray-200",
      shadow: "shadow-gray-200/20",
      icon: "bg-gradient-to-br from-gray-500 to-gray-700",
      border: "border-gray-200",
      bg: "bg-white",
      text: "text-gray-900",
    },
    dark: {
      gradient: "from-gray-900 to-black",
      shadow: "shadow-black/40",
      icon: "bg-gradient-to-br from-gray-600 to-gray-400",
      border: "border-gray-900",
      bg: "bg-black",
      text: "text-white",
    },
  },
]

interface Block {
  id: string
  title: string
  content: string
  icon: React.ReactNode
  colorIndex: number
}

interface PullRequest {
  id: number
  title: string
  number: number
  url: string
  state: "open" | "closed" | "merged"
  createdAt: string
  repository: {
    name: string
    url: string
  }
  user: {
    login: string
    avatar_url: string
  }
}

export default function DashboardPage() {
  // You can change this to any GitHub username
  const [username, setUsername] = useState("ThePrimeagen")

  // Theme state (light/dark)
  const [isDarkTheme, setIsDarkTheme] = useState(true)

  // Mock session for preview purposes
  const session = null
  const status = "unauthenticated"

  const sensors = useSensors(useSensor(PointerSensor))
  const [blocks, setBlocks] = useState<Block[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [featuredPRs, setFeaturedPRs] = useState<PullRequest[]>([])
  const [loadingPRs, setLoadingPRs] = useState(true)

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
    // Save theme preference to localStorage
    localStorage.setItem("github-dashboard-theme", !isDarkTheme ? "dark" : "light")
  }

  // Load theme preference from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("github-dashboard-theme")
    if (savedTheme) {
      setIsDarkTheme(savedTheme === "dark")
    } else {
      // Default to dark theme if no preference is saved
      setIsDarkTheme(true)
    }
  }, [])

  // Helper function to safely fetch data with error handling
  async function safeFetch(url: string) {
    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch ${url}: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  // Fetch featured PRs
  useEffect(() => {
    async function fetchFeaturedPRs() {
      setLoadingPRs(true)
      try {
        // Fetch user's PRs
        const prs = await safeFetch(
          `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=updated&order=desc&per_page=5`,
        )

        if (prs.items && Array.isArray(prs.items)) {
          // Process and format PR data
          const formattedPRs = await Promise.all(
            prs.items.map(async (pr: any) => {
              // Extract repo name and owner from repository_url
              const repoUrlParts = pr.repository_url.split("/")
              const repoName = repoUrlParts[repoUrlParts.length - 1]
              const repoOwner = repoUrlParts[repoUrlParts.length - 2]

              // Determine PR state (open, closed, or merged)
              let state: "open" | "closed" | "merged" = pr.state as "open" | "closed"

              if (state === "closed") {
                try {
                  // Check if PR was merged
                  const prDetails = await safeFetch(
                    `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pr.number}`,
                  )
                  if (prDetails.merged) {
                    state = "merged"
                  }
                } catch (error) {
                  console.error("Failed to fetch PR details:", error)
                }
              }

              return {
                id: pr.id,
                title: pr.title,
                number: pr.number,
                url: pr.html_url,
                state: state,
                createdAt: pr.created_at,
                repository: {
                  name: `${repoOwner}/${repoName}`,
                  url: `https://github.com/${repoOwner}/${repoName}`,
                },
                user: {
                  login: pr.user.login,
                  avatar_url: pr.user.avatar_url,
                },
              }
            }),
          )

          setFeaturedPRs(formattedPRs)
        }
      } catch (error) {
        console.error("Failed to fetch featured PRs:", error)
        setFeaturedPRs([])
      } finally {
        setLoadingPRs(false)
      }
    }

    if (username) {
      fetchFeaturedPRs()
    }
  }, [username, refreshing])

  // fetch profile + repos + languages
  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      setError(null)

      try {
        // Initialize with default values in case the API calls fail
        let profile
        let repos = []

        try {
          profile = await safeFetch(`https://api.github.com/users/${username}`)
          setUserProfile(profile)
        } catch (err) {
          console.error("Failed to fetch user profile:", err)
          // Set default profile values if fetch fails
          profile = {
            followers: 0,
            public_gists: 0,
            public_repos: 0,
            avatar_url: "",
            name: username,
            bio: "",
          }
          setUserProfile(profile)
        }

        try {
          repos = await safeFetch(`https://api.github.com/users/${username}/repos?per_page=100`)
          // Ensure repos is an array
          if (!Array.isArray(repos)) {
            console.warn("Repos response is not an array:", repos)
            repos = []
          }
        } catch (err) {
          console.error("Failed to fetch repos:", err)
          repos = [] // Ensure repos is an array even on failure
        }

        const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0)
        const totalForks = repos.reduce((sum: number, r: any) => sum + (r.forks_count || 0), 0)

        // const langTotals: Record<string, number> = {}
        //
        // // Only try to fetch languages if we have repos
        // if (repos.length > 0) {
        //   try {
        //     await Promise.all(
        //       repos.map(async (r: any) => {
        //         try {
        //           const langs = await safeFetch(r.languages_url)
        //           for (const [lang, bytes] of Object.entries<number>(langs)) {
        //             langTotals[lang] = (langTotals[lang] || 0) + bytes
        //           }
        //         } catch (err) {
        //           console.error(`Failed to fetch languages for ${r.name}:`, err)
        //           // Continue with other repos
        //         }
        //       }),
        //     )
        //   } catch (err) {
        //     console.error("Failed processing languages:", err)
        //     // Continue with empty languages
        //   }
        // }
        //
        // const topLangs =
        //   Object.entries(langTotals)
        //     .sort(([, a], [, b]) => b - a)
        //     .slice(0, 3)
        //     .map(([lang]) => lang)
        //     .join(", ") || "N/A"

        setBlocks([
          {
            id: "followers",
            title: "Followers",
            content: profile.followers.toLocaleString(),
            icon: <Users className="h-5 w-5" />,
            colorIndex: 0,
          },
          {
            id: "stars",
            title: "Stars Earned",
            content: totalStars.toLocaleString(),
            icon: <Star className="h-5 w-5" />,
            colorIndex: 1,
          },
          {
            id: "forks",
            title: "Forks",
            content: totalForks.toLocaleString(),
            icon: <GitFork className="h-5 w-5" />,
            colorIndex: 2,
          },
          {
            id: "prs",
            title: "Pull Requests",
            content: profile.public_gists.toLocaleString(),
            icon: <GitPullRequest className="h-5 w-5" />,
            colorIndex: 0,
          },
          {
            id: "repos",
            title: "Public Repos",
            content: profile.public_repos.toLocaleString(),
            icon: <Archive className="h-5 w-5" />,
            colorIndex: 1,
          },
          {
            id: "languages",
            title: "Top Languages",
            // content: topLangs,
            content: "N/A",
            icon: <Code className="h-5 w-5" />,
            colorIndex: 2,
          },
        ])
      } catch (error) {
        console.error("Failed to load GitHub stats:", error)
        setError("Failed to load GitHub stats. GitHub API rate limits may have been exceeded.")

        // Set default blocks with placeholders
        setBlocks([
          {
            id: "followers",
            title: "Followers",
            content: "N/A",
            icon: <Users className="h-5 w-5" />,
            colorIndex: 0,
          },
          {
            id: "stars",
            title: "Stars Earned",
            content: "N/A",
            icon: <Star className="h-5 w-5" />,
            colorIndex: 1,
          },
          {
            id: "forks",
            title: "Forks",
            content: "N/A",
            icon: <GitFork className="h-5 w-5" />,
            colorIndex: 2,
          },
          {
            id: "prs",
            title: "Pull Requests",
            content: "N/A",
            icon: <GitPullRequest className="h-5 w-5" />,
            colorIndex: 0,
          },
          {
            id: "repos",
            title: "Public Repos",
            content: "N/A",
            icon: <Archive className="h-5 w-5" />,
            colorIndex: 1,
          },
          {
            id: "languages",
            title: "Top Languages",
            content: "N/A",
            icon: <Code className="h-5 w-5" />,
            colorIndex: 2,
          },
        ])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    loadStats()
  }, [username, refreshing])

  // show skeleton while loading
  if (status === "loading" || loading) {
    return (
      <div
        className={`min-h-screen ${isDarkTheme ? "bg-black" : "bg-white"} p-6 ${isDarkTheme ? "text-white" : "text-black"}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Skeleton className={`h-10 w-64 mb-2 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
              <Skeleton className={`h-4 w-48 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
            </div>
            <Skeleton className={`h-10 w-32 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
          </div>

          <Skeleton className={`h-64 w-full mb-8 rounded-xl ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card
                  key={i}
                  className={`overflow-hidden ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
                >
                  <CardHeader className="pb-2">
                    <Skeleton className={`h-8 w-8 rounded-md ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                    <Skeleton className={`h-4 w-24 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className={`h-8 w-16 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    )
  }

  // reorder logic
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      setBlocks(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  const activeBlock = blocks.find((b) => b.id === activeId)

  const refreshData = () => {
    try {
      setRefreshing(true)
    } catch (error) {
      console.error("Error refreshing data:", error)
      setRefreshing(true)
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkTheme ? "bg-black" : "bg-white"} ${isDarkTheme ? "text-white" : "text-black"} p-6`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDarkTheme ? "text-white" : "text-black"}`}>
              GitHub Portfolio Dashboard
            </h1>
            <p className={`${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
              Visualize and organize your GitHub statistics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <ModeToggle />
            </div>
            <Button
              variant="outline"
              className={`${isDarkTheme
                ? "border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-300"
                : "border-gray-200 bg-white hover:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                const newUsername = prompt("Enter GitHub username:", username)
                if (newUsername) setUsername(newUsername)
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Change User
            </Button>
            <Button
              onClick={refreshData}
              disabled={refreshing}
              className={`${isDarkTheme ? "bg-white hover:bg-gray-200 text-black" : "bg-black hover:bg-gray-800 text-white"
                } border-0`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </motion.div>

        {/* User Profile Card */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card
              className={`${isDarkTheme ? "bg-gray-900/50 border-gray-800" : "bg-gray-50 border-gray-200"
                } backdrop-blur-sm overflow-hidden`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <Avatar
                    className={`h-24 w-24 border-2 ${isDarkTheme ? "border-white/20" : "border-black/10"} shadow-lg`}
                  >
                    <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} alt={username} />
                    <AvatarFallback className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`}>
                      {username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold mb-1">{userProfile.name || username}</h2>
                    <Badge
                      variant="outline"
                      className={`mb-3 py-1.5 ${isDarkTheme ? "border-gray-700 bg-gray-800/80" : "border-gray-300 bg-gray-100"
                        }`}
                    >
                      <Github className="h-3.5 w-3.5 mr-1" />
                      {username}
                    </Badge>
                    <p className={`${isDarkTheme ? "text-gray-400" : "text-gray-600"} mb-4 max-w-2xl`}>
                      {userProfile.bio || "No bio available"}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${isDarkTheme
                          ? "border-gray-700 bg-gray-800/80 hover:bg-gray-700"
                          : "border-gray-300 bg-white hover:bg-gray-100"
                          }`}
                        onClick={() => window.open(`https://github.com/${username}`, "_blank")}
                      >
                        <Github className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${isDarkTheme
                          ? "border-gray-700 bg-gray-800/80 hover:bg-gray-700"
                          : "border-gray-300 bg-white hover:bg-gray-100"
                          }`}
                        onClick={() => window.open(`https://github.com/${username}?tab=repositories`, "_blank")}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Repositories
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Alert
              variant="destructive"
              className={`mb-6 ${isDarkTheme
                ? "border-gray-800 bg-gray-900/50 text-gray-300"
                : "border-gray-300 bg-gray-100 text-gray-700"
                }`}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-2">
                <p className="text-sm">
                  GitHub API has rate limits for unauthenticated requests. Try again later or sign in with GitHub for
                  higher limits.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className={`mt-2 ${isDarkTheme
                    ? "border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 text-gray-200"
                    : "border-gray-300 bg-gray-200/30 hover:bg-gray-200/50 text-gray-800"
                    }`}
                  onClick={() => {
                    try {
                      alert("Authentication not configured in preview mode")
                    } catch (error) {
                      console.error("Authentication not configured:", error)
                    }
                  }}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Sign in with GitHub
                </Button>
              </div>
            </Alert>
          </motion.div>
        )}

        {/* Featured PRs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Featured Pull Requests</h2>
            <Button
              variant="ghost"
              size="sm"
              className={`${isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
              onClick={() => window.open(`https://github.com/${username}?tab=pulls`, "_blank")}
            >
              View All
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>

          {loadingPRs ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className={`${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className={`h-10 w-10 rounded-full ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                      <div className="flex-1">
                        <Skeleton className={`h-5 w-3/4 mb-2 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                        <Skeleton className={`h-4 w-1/2 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredPRs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {featuredPRs.map((pr, index) => (
                  <motion.div
                    key={pr.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className={`overflow-hidden ${isDarkTheme
                        ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                        : "bg-white border-gray-200 hover:border-gray-300"
                        } 
                      transition-all duration-200 hover:shadow-md`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-1 self-stretch ${pr.state === "open"
                              ? "bg-green-500"
                              : pr.state === "merged"
                                ? "bg-purple-500"
                                : "bg-red-500"
                              }`}
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className={`${pr.state === "open"
                                  ? "border-green-500 bg-green-500/10 text-green-500"
                                  : pr.state === "merged"
                                    ? "border-purple-500 bg-purple-500/10 text-purple-500"
                                    : "border-red-500 bg-red-500/10 text-red-500"
                                  }`}
                              >
                                {pr.state === "open" ? (
                                  <>
                                    <GitPullRequest className="h-3 w-3 mr-1" /> Open
                                  </>
                                ) : pr.state === "merged" ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" /> Merged
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 mr-1" /> Closed
                                  </>
                                )}
                              </Badge>
                              <span className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                                <Link className="h-3 w-3 inline mr-1" />
                                <a
                                  href={pr.repository.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {pr.repository.name}
                                </a>
                              </span>
                              <span className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(pr.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <h3 className="font-medium mb-1">
                              <a href={pr.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {pr.title}
                              </a>
                            </h3>

                            <div className="flex items-center mt-2">
                              <Avatar className="h-5 w-5 mr-2">
                                <AvatarImage src={pr.user.avatar_url || "/placeholder.svg"} alt={pr.user.login} />
                                <AvatarFallback className={isDarkTheme ? "bg-gray-700" : "bg-gray-200"}>
                                  {pr.user.login.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{pr.user.login}</span>
                              <span className={`ml-auto text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                                #{pr.number}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className={`${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
              <CardContent className="p-6 text-center">
                <p className={`${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                  No pull requests found for this user.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList
              className={`${isDarkTheme ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}
            >
              <TabsTrigger
                value="overview"
                className={`${isDarkTheme
                  ? "data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                  : "data-[state=active]:bg-gray-100 data-[state=active]:text-black"
                  }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="contributions"
                className={`${isDarkTheme
                  ? "data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                  : "data-[state=active]:bg-gray-100 data-[state=active]:text-black"
                  }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Contributions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card
                className={`${isDarkTheme ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
                  } backdrop-blur-sm overflow-hidden`}
              >
                <CardHeader>
                  <CardTitle>Yearly Contribution Activity</CardTitle>
                  <CardDescription className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>
                    Your GitHub contribution calendar over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 ${isDarkTheme ? "bg-black/50" : "bg-gray-50"} rounded-lg`}>
                    <GitHubCalendar
                      username={username}
                      theme={{
                        light: isDarkTheme
                          ? ["#1e1e1e", "#333333", "#666666", "#999999", "#cccccc"]
                          : ["#ebedf0", "#c6cbd1", "#7d8590", "#424a53", "#1f2328"],
                        dark: isDarkTheme
                          ? ["#1e1e1e", "#333333", "#666666", "#999999", "#cccccc"]
                          : ["#ebedf0", "#c6cbd1", "#7d8590", "#424a53", "#1f2328"],
                      }}
                      colorScheme={isDarkTheme ? "dark" : "light"}
                      errorMessage={
                        <Alert
                          className={`${isDarkTheme
                            ? "bg-gray-900/50 border-gray-800 text-gray-300"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                            }`}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Couldn't load contribution data</AlertTitle>
                          <AlertDescription>
                            There was an error loading the GitHub contribution data. Please try again later or sign in
                            with GitHub.
                          </AlertDescription>
                        </Alert>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="contributions">
              <Card className={`${isDarkTheme ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}>
                <CardHeader>
                  <CardTitle>Contribution Breakdown</CardTitle>
                  <CardDescription className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>
                    Sign in for private contribution metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>Commits</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className={`h-2 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>Pull Requests</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <Progress value={42} className={`h-2 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>Issues</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <Progress value={25} className={`h-2 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>Code Reviews</span>
                        <span className="font-medium">63%</span>
                      </div>
                      <Progress value={63} className={`h-2 ${isDarkTheme ? "bg-gray-800" : "bg-gray-200"}`} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className={`${isDarkTheme
                      ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                      : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                      }`}
                    onClick={() => {
                      try {
                        alert("Authentication not configured in preview mode")
                      } catch (error) {
                        console.error("Authentication not configured:", error)
                      }
                    }}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Sign in for detailed metrics
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold mb-2">GitHub Statistics</h2>
          <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"} mb-4`}>
            Drag and drop cards to customize your dashboard
          </p>
          <Separator className={isDarkTheme ? "bg-gray-800" : "bg-gray-200"} />
        </motion.div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <SortableBlock block={block} isDragging={activeId === block.id} isDarkTheme={isDarkTheme} />
                </motion.div>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeBlock && (
              <Card
                className={`${isDarkTheme
                  ? "bg-gray-900/90 backdrop-blur-sm border-gray-800"
                  : "bg-white/90 backdrop-blur-sm border-gray-200"
                  } overflow-hidden shadow-xl`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${isDarkTheme
                        ? monochromeSchemes[activeBlock.colorIndex].dark.icon
                        : monochromeSchemes[activeBlock.colorIndex].light.icon
                        } ${isDarkTheme ? "text-white" : "text-white"}`}
                    >
                      {activeBlock.icon}
                    </div>
                    <CardTitle className="text-base">{activeBlock.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeBlock.content}</div>
                </CardContent>
              </Card>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

function SortableBlock({
  block,
  isDragging,
  isDarkTheme,
}: {
  block: Block
  isDragging: boolean
  isDarkTheme: boolean
}) {
  const { id, title, content, icon, colorIndex } = block
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none" as const,
  }
  const colorScheme = isDarkTheme ? monochromeSchemes[colorIndex].dark : monochromeSchemes[colorIndex].light

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={`relative cursor-move ${isDarkTheme ? "bg-gray-900/50 backdrop-blur-sm border-gray-800" : "bg-white backdrop-blur-sm border-gray-200"
          } overflow-hidden 
                   hover:shadow-lg transition-all duration-300 ${colorScheme.shadow} 
                   ${isDragging ? "opacity-50" : ""}`}
      >
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`${isDarkTheme
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
                Drag to reorder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colorScheme.gradient}`}></div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorScheme.icon} text-white`}>{icon}</div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{content}</div>
        </CardContent>
      </Card>
    </div>
  )
}

