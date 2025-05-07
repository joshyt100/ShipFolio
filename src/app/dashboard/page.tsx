"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import GitHubCalendar from "react-github-calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Star,
  GitFork,
  GitPullRequest,
  Archive,
  Code,
  GripVertical,
  Github,
  AlertCircle, // Used for Issues Opened
  RefreshCw,
  ExternalLink,
  BarChart3,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Clock,
  X,
  ArrowUpRight,
  GitMerge,
  Palette,
  Award,
  GitCommit, // For Commits
  Eye, // For Code Reviews
  MessageSquare, // Could be for issues too
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ModeToggle } from "~/components/mode-toggle/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fetchGitHubGraphQL } from "@/lib/github-graphql";

// --- Constants ---
const PR_LIST_STORAGE_KEY = "dashboardVPRListOrder_v3_graphql";
const PR_ITEM_ESTIMATED_HEIGHT = 128;
const MAX_TOP_LANGUAGES_DISPLAY = 6;

const GITHUB_CALENDAR_LIGHT_THEME_COLORS: [
  string,
  string,
  string,
  string,
  string
] = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const GITHUB_CALENDAR_DARK_THEME_COLORS: [
  string,
  string,
  string,
  string,
  string
] = ["#010409", "#0e4429", "#006d32", "#26a641", "#39d353"];

// --- GraphQL Queries ---
const USER_STATS_QUERY = `
  query UserStats($username: String!) {
    user(login: $username) {
      name
      login
      bio
      avatarUrl
      createdAt
      followers {
        totalCount
      }
      gists(privacy: PUBLIC) {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          stargazerCount
          forkCount
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
      contributionsCollection { # For Contribution Breakdown (defaults to last year)
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

const USER_PULL_REQUESTS_QUERY = `
  query UserPullRequests($searchQueryString: String!, $first: Int = 15) {
    search(query: $searchQueryString, type: ISSUE, first: $first) {
      issueCount
      edges {
        node {
          ... on PullRequest {
            id
            databaseId
            title
            number
            url
            state
            createdAt
            merged
            repository {
              nameWithOwner
              url
            }
            author {
              login
              avatarUrl
            }
          }
        }
      }
    }
  }
`;

// --- Interfaces & Types ---
interface Block {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  colorIndex: number;
}

interface UserProfile {
  followers: number;
  public_gists: number;
  public_repos: number;
  avatar_url: string | null;
  name: string | null;
  bio: string | null;
  login: string;
  createdAt: string;
}

interface PullRequest {
  id: number;
  title: string;
  number: number;
  url: string;
  state: "open" | "closed" | "merged";
  createdAt: string;
  repository: {
    name: string;
    url: string;
  };
  user: {
    login: string;
    avatar_url: string;
  };
}

interface VirtualizedPRItem extends PullRequest {
  id_str: string;
}
type PRState = PullRequest["state"];

interface LanguageStat {
  name: string;
  size: number;
  color: string | null;
  percentage: number;
}

// For Contribution Breakdown
interface ContributionTypeStat {
  type: "commits" | "pullRequests" | "reviews" | "issues";
  label: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  colorClass: string;
}


// --- GraphQL Response Structures ---
interface GraphQLLanguageEdge {
  size: number;
  node: {
    name: string;
    color: string | null;
  };
}
interface GraphQLRepositoryNodeForStats {
  stargazerCount: number;
  forkCount: number;
  languages: {
    edges: GraphQLLanguageEdge[] | null;
  } | null;
}

interface GraphQLContributionsCollection {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
}

interface GraphQLUserStatsData {
  user: {
    name: string | null;
    login: string;
    bio: string | null;
    avatarUrl: string;
    createdAt: string;
    followers: { totalCount: number };
    gists: { totalCount: number };
    repositories: {
      totalCount: number;
      nodes: GraphQLRepositoryNodeForStats[] | null;
    };
    contributionsCollection: GraphQLContributionsCollection | null;
  } | null;
}

interface GraphQLSearchEdge<TNode> {
  node: TNode;
}
interface GraphQLPullRequestNode {
  id: string;
  databaseId: number | null;
  title: string;
  number: number;
  url: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  createdAt: string;
  merged: boolean;
  repository: {
    nameWithOwner: string;
    url: string;
  };
  author: {
    login: string;
    avatarUrl: string;
  } | null;
}
interface GraphQLUserPullRequestsData {
  search: {
    issueCount: number;
    edges: GraphQLSearchEdge<GraphQLPullRequestNode>[] | null;
  };
}

// --- Components ---
// PRStatusBadge, PRListItem, SortablePRListItem, VirtualizedPRList, SortableStatBlock
// are assumed to be defined as in previous versions. For brevity, they are omitted here.
interface PRStatusBadgeProps {
  status: PRState;
}
function PRStatusBadge({ status }: PRStatusBadgeProps) {
  const baseClasses =
    "py-1 px-2.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-all shadow-sm";
  const iconSize = "h-3.5 w-3.5";

  const statusConfig: Record<
    PRState,
    { label: string; icon: React.ReactNode; classes: string }
  > = {
    open: {
      label: "Open",
      icon: (
        <GitPullRequest className={cn(iconSize, "text-green-700 dark:text-green-400")} />
      ),
      classes:
        "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200/70 " +
        "dark:bg-green-900/60 dark:text-green-300 dark:border-green-700/60 dark:hover:bg-green-800/60",
    },
    merged: {
      label: "Merged",
      icon: <GitMerge className={cn(iconSize, "text-white")} />,
      classes:
        "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md " +
        "hover:from-purple-600 hover:to-indigo-600 dark:from-purple-600 dark:to-indigo-600 " +
        "dark:shadow-purple-950/50 dark:hover:from-purple-700 dark:hover:to-indigo-700",
    },
    closed: {
      label: "Closed",
      icon: <X className={cn(iconSize, "text-red-700 dark:text-red-400")} />,
      classes:
        "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200/70 " +
        "dark:bg-red-900/60 dark:text-red-400 dark:border-red-700/60 dark:hover:bg-red-800/60",
    },
  };

  const config = statusConfig[status] || statusConfig.closed;
  return (
    <div className={cn(baseClasses, config.classes)}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

interface PRListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: VirtualizedPRItem;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: React.CSSProperties;
}
const PRListItem = React.forwardRef<HTMLDivElement, PRListItemProps>(
  ({ item, isDragging, isOverlay, style, ...props }, ref) => {
    const getInitials = (name: string) =>
      (name || "NN").substring(0, 2).toUpperCase();
    const itemOuterStyle: React.CSSProperties = {
      ...style,
      height: `${PR_ITEM_ESTIMATED_HEIGHT}px`,
      paddingTop: "8px",
      paddingBottom: "8px",
    };
    const isMerged = item.state === "merged";
    const isOpen = item.state === "open";
    const formattedDate = useMemo(
      () =>
        new Date(item.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      [item.createdAt]
    );

    return (
      <div
        ref={ref}
        style={itemOuterStyle}
        {...props}
        className={cn(
          "w-full outline-none focus:outline-none",
          isOverlay && "z-50"
        )}
      >
        <Card
          className={cn(
            "h-full flex overflow-hidden transition-all duration-300 ease-in-out relative group",
            "hover:shadow-lg dark:hover:shadow-black/40",
            "bg-white border-neutral-200 hover:border-neutral-300",
            "dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700",
            isDragging && !isOverlay
              ? "ring-2 ring-blue-500 opacity-80 shadow-2xl dark:ring-blue-400"
              : "",
            isOverlay
              ? "shadow-2xl scale-102 !opacity-100 ring-2 ring-blue-600 dark:ring-blue-500"
              : "",
            isMerged &&
            "border-l-4 bg-purple-50 hover:bg-purple-100/70 border-l-purple-500 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:border-l-purple-600",
            isOpen &&
            "border-l-4 bg-green-50 hover:bg-green-100/70 border-l-green-500 dark:bg-green-950/40 dark:hover:bg-green-900/50 dark:border-l-green-600",
            item.state === "closed" &&
            !isMerged &&
            "border-l-4 bg-red-50 hover:bg-red-100/70 border-l-red-500 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:border-l-red-600"
          )}
        >
          <div
            {...(!isOverlay ? props : {})}
            className={cn(
              "flex items-center justify-center px-2.5 touch-none",
              "bg-neutral-100 group-hover:bg-neutral-200 dark:bg-neutral-800/70 dark:group-hover:bg-neutral-700/80",
              isOverlay
                ? "cursor-grabbing"
                : "cursor-grab active:cursor-grabbing",
              isMerged && "bg-purple-100/50 dark:bg-purple-800/30",
              isOpen && "bg-green-100/50 dark:bg-green-800/30",
              item.state === "closed" &&
              !isMerged &&
              "bg-red-100/50 dark:bg-red-800/30"
            )}
          >
            <GripVertical className="h-5 w-5 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
          </div>

          <div className="p-3.5 flex-grow min-w-0 flex flex-col justify-between">
            <div className="mb-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-1 group/link"
                title={item.title}
              >
                <h3 className="font-semibold text-md leading-tight text-neutral-800 group-hover/link:text-blue-600 dark:text-neutral-100 dark:group-hover/link:text-blue-400 line-clamp-2">
                  {item.title}
                </h3>
              </a>
              <div className="flex items-center text-xs">
                <a
                  href={item.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  title={item.repository.name}
                >
                  <LinkIcon className="h-3 w-3 inline mr-1.5 flex-shrink-0" />
                  {item.repository.name}
                </a>
                <span className="ml-2 font-mono text-neutral-400">#{item.number}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-7 w-7 flex-shrink-0 border border-neutral-300 dark:border-neutral-700">
                  <AvatarImage
                    src={item.user.avatar_url}
                    alt={item.user.login}
                  />
                  <AvatarFallback className="text-xs font-medium bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                    {getInitials(item.user.login)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span
                    className="truncate font-medium text-neutral-700 dark:text-neutral-300"
                    title={item.user.login}
                  >
                    {item.user.login}
                  </span>
                  <div className="flex items-center whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                    <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    {formattedDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <PRStatusBadge status={item.state} />
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md transition-colors flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                        aria-label="Open PR on GitHub"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-white border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200"
                    >
                      Open on GitHub
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);
PRListItem.displayName = "PRListItem";

interface SortablePRListItemProps {
  item: VirtualizedPRItem;
}
function SortablePRListItem({ item }: SortablePRListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id_str });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease-in-out",
  };
  return (
    <PRListItem
      ref={setNodeRef}
      style={style}
      item={item}
      isDragging={!!transform}
      {...attributes}
      {...listeners}
    />
  );
}

interface VirtualizedPRListProps {
  pullRequests: PullRequest[];
  isLoading: boolean;
  usernameForEmptyMessage: string;
}
function VirtualizedPRList({ pullRequests, isLoading, usernameForEmptyMessage }: VirtualizedPRListProps) {
  const [orderedPRs, setOrderedPRs] = useState<VirtualizedPRItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newVirtualizedPRs = pullRequests.map((pr) => ({
      ...pr,
      id_str: pr.id.toString(),
    }));

    if (typeof window !== "undefined") {
      try {
        const storedOrderJSON = localStorage.getItem(PR_LIST_STORAGE_KEY);
        if (storedOrderJSON) {
          const storedIDs: string[] = JSON.parse(storedOrderJSON);
          const prMap = new Map(
            newVirtualizedPRs.map((pr) => [pr.id_str, pr])
          );
          const sortedByStoredOrder: VirtualizedPRItem[] = storedIDs.flatMap(
            (id) => {
              const prItem = prMap.get(id);
              if (prItem) {
                prMap.delete(id);
                return [prItem];
              }
              return [];
            }
          );
          setOrderedPRs([...sortedByStoredOrder, ...Array.from(prMap.values())]);
        } else {
          setOrderedPRs(newVirtualizedPRs);
        }
      } catch (e) {
        console.error("LocalStorage PR order read error:", e);
        setOrderedPRs(newVirtualizedPRs);
      }
    } else {
      setOrderedPRs(newVirtualizedPRs);
    }
  }, [pullRequests]);

  useEffect(() => {
    if (orderedPRs.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          PR_LIST_STORAGE_KEY,
          JSON.stringify(orderedPRs.map((pr) => pr.id_str))
        );
      } catch (e) {
        console.error("LocalStorage PR order write error:", e);
      }
    }
  }, [orderedPRs]);

  const activeItem = useMemo(
    () => orderedPRs.find((pr) => pr.id_str === activeId),
    [activeId, orderedPRs]
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );
  const rowVirtualizer = useVirtualizer({
    count: orderedPRs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => PR_ITEM_ESTIMATED_HEIGHT,
    overscan: 5,
    paddingEnd: 8,
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setOrderedPRs((items) => {
        const oldIdx = items.findIndex((i) => i.id_str === active.id);
        const newIdx = items.findIndex((i) => i.id_str === over.id);
        return oldIdx !== -1 && newIdx !== -1
          ? arrayMove(items, oldIdx, newIdx)
          : items;
      });
    }
  }, []);

  const handleDragCancel = useCallback(() => setActiveId(null), []);
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.7", transform: "scale(1.02)" } },
    }),
    duration: 250,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  };

  const virtualItems = rowVirtualizer.getVirtualItems();
  if (isLoading)
    return (
      <div className="space-y-3 px-2">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-[120px] w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    );
  if (!isLoading && orderedPRs.length === 0)
    return (
      <Card className="bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-6 text-center">
          <GitPullRequest className="h-12 w-12 mx-auto mb-3 text-neutral-400 dark:text-neutral-600" />
          <p className="text-lg font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            No Pull Requests
          </p>
          <p className="text-neutral-500 dark:text-neutral-400">
            {usernameForEmptyMessage
              ? `No recent pull requests found for ${usernameForEmptyMessage}.`
              : "No pull requests to display."}
          </p>
        </CardContent>
      </Card>
    );
  return (
    <div
      ref={parentRef}
      className="max-h-[calc(3.5*128px)] min-h-[128px] w-full overflow-auto rounded-lg border bg-neutral-100/60 border-neutral-300 dark:bg-black/30 dark:border-neutral-800 scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent scrollbar-thumb-neutral-400 hover:scrollbar-thumb-neutral-500 dark:scrollbar-thumb-neutral-700 dark:hover:scrollbar-thumb-neutral-600"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      >
        <SortableContext
          items={orderedPRs.map((pr) => pr.id_str)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow: VirtualItem) => {
              const item = orderedPRs[virtualRow.index];
              if (!item) return null;
              return (
                <div
                  key={item.id_str}
                  className="px-2"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <SortablePRListItem item={item} />
                </div>
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId && activeItem ? (
            <div
              className="px-2 w-full"
              style={{ height: `${PR_ITEM_ESTIMATED_HEIGHT}px` }}
            >
              <PRListItem item={activeItem} isDragging isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface SortableStatBlockProps {
  block: Block;
  isDragging: boolean;
}
function SortableStatBlock({ block, isDragging }: SortableStatBlockProps) {
  const { id, title, content, icon: blockIcon, colorIndex } = block;
  const { attributes, listeners, setNodeRef, transform, transition, isOver } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease",
    touchAction: "none",
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };
  const safeColorIndex = colorIndex % 3;
  let gradientClasses = "";
  let iconContainerClasses = "";

  if (safeColorIndex === 0) {
    gradientClasses =
      "from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700";
    iconContainerClasses =
      "bg-gradient-to-br from-neutral-600 to-neutral-800 text-white dark:from-neutral-400 dark:to-neutral-100 dark:text-black";
  } else if (safeColorIndex === 1) {
    gradientClasses =
      "from-sky-200 to-sky-300 dark:from-sky-800 dark:to-sky-700";
    iconContainerClasses =
      "bg-gradient-to-br from-sky-600 to-sky-800 text-white dark:from-sky-400 dark:to-sky-100 dark:text-black";
  } else {
    gradientClasses =
      "from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700";
    iconContainerClasses =
      "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white dark:from-emerald-400 dark:to-emerald-100 dark:text-black";
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 group",
          "bg-white border-neutral-200 text-neutral-900",
          "dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100",
          isDragging
            ? "ring-2 ring-blue-500 shadow-2xl dark:ring-blue-400"
            : "shadow-md dark:shadow-black/40",
          isOver && !isDragging && "ring-1 ring-neutral-400 dark:ring-neutral-500",
          "hover:shadow-xl dark:hover:shadow-black/50"
        )}
      >
        <div
          {...listeners}
          className="absolute top-1.5 right-1.5 p-1.5 cursor-grab active:cursor-grabbing touch-none z-10 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
          aria-label="Drag stat card"
        >
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <GripVertical className="h-5 w-5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-white border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200"
              >
                Drag to reorder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div
          className={cn("absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b", gradientClasses)}
        />
        <CardHeader className="pb-2 pl-5 pr-10 pt-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-lg shadow-md", iconContainerClasses)}>
              {blockIcon}
            </div>
            <CardTitle className="text-sm font-semibold md:text-base">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pl-5 pr-10 pb-4 pt-1">
          <div className="text-2xl md:text-3xl font-bold">{content}</div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TopLanguagesCardProps {
  languages: LanguageStat[];
  isLoading: boolean;
  username: string;
}
// function TopLanguagesCard({ languages, isLoading, username }: TopLanguagesCardProps) {
//   if (isLoading) {
//     return (
//       <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="text-black dark:text-white flex items-center">
//             <Palette className="h-5 w-5 mr-2 text-sky-500" /> Top Languages
//           </CardTitle>
//           <CardDescription className="text-neutral-600 dark:text-neutral-400">
//             Calculating language usage for {username}...
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="space-y-1.5">
//               <div className="flex justify-between text-sm">
//                 <Skeleton className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700" />
//                 <Skeleton className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700" />
//               </div>
//               <Skeleton className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     );
//   }
//
//   if (languages.length === 0) {
//     return (
//       <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
//         <CardHeader>
//           <CardTitle className="text-black dark:text-white flex items-center">
//             <Palette className="h-5 w-5 mr-2 text-sky-500" /> Top Languages
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-neutral-500 dark:text-neutral-400">No language data to display for {username}.</p>
//         </CardContent>
//       </Card>
//     );
//   }
//
//   return (
//     <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
//       <CardHeader>
//         <CardTitle className="text-black dark:text-white flex items-center">
//           <Palette className="h-5 w-5 mr-2 text-sky-500" /> Top Languages
//         </CardTitle>
//         <CardDescription className="text-neutral-600 dark:text-neutral-400">
//           Language breakdown based on repository data for {username}.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {languages.map((lang) => (
//             <div key={lang.name} className="space-y-1">
//               <div className="flex justify-between text-sm font-medium">
//                 <div className="flex items-center">
//                   {lang.color && (
//                     <span
//                       className="inline-block w-3 h-3 rounded-full mr-2"
//                       style={{ backgroundColor: lang.color }}
//                       aria-label={`${lang.name} color swatch`}
//                     />
//                   )}
//                   <span className="text-neutral-800 dark:text-neutral-200">{lang.name}</span>
//                 </div>
//                 <span className="text-neutral-600 dark:text-neutral-400">{lang.percentage}%</span>
//               </div>
//               <Progress
//                 value={lang.percentage}
//                 className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700"
//                 indicatorClassName="rounded-full"
//                 style={{ '--progress-indicator-color': lang.color || '#888888' } as React.CSSProperties}
//               />
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [currentUsername, _setUsernameInternal] = useState("ThePrimeagen");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeStatBlockId, setActiveStatBlockId] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredPRs, setFeaturedPRs] = useState<PullRequest[]>([]);
  const [loadingPRs, setLoadingPRs] = useState(true);
  const [topLanguages, setTopLanguages] = useState<LanguageStat[]>([]);
  const [contributionBreakdown, setContributionBreakdown] = useState<ContributionTypeStat[]>([]); // State for contribution breakdown

  const setUsername = (newUsername: string) => {
    _setUsernameInternal(newUsername);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("github-dashboard-theme");
    setIsDarkTheme(
      storedTheme
        ? storedTheme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme);
    localStorage.setItem("github-dashboard-theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  const toggleTheme = useCallback(() => setIsDarkTheme((prev) => !prev), []);

  useEffect(() => {
    if (refreshing && !loadingStats && !loadingPRs) {
      setRefreshing(false);
    }
  }, [refreshing, loadingStats, loadingPRs]);

  useEffect(() => {
    async function fetchPRs() {
      if (!currentUsername || sessionStatus !== "authenticated" || !session) {
        setFeaturedPRs([]); setLoadingPRs(false); return;
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
          const formattedPRs: PullRequest[] = gqlResponse.search.edges
            .map(edge => {
              if (!edge.node || edge.node.databaseId === null || !edge.node.author) return null;
              let state: PullRequest["state"] = "closed";
              if (edge.node.state === "OPEN") state = "open";
              else if (edge.node.state === "MERGED") state = "merged";
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
          }
        }
      } catch (e: any) {
        console.error("Featured PRs fetch error (GraphQL):", e);
        setError(prevError => prevError || (e.message || "Failed to fetch pull requests."));
        setFeaturedPRs([]);
      } finally {
        setLoadingPRs(false);
      }
    }
    if (currentUsername && sessionStatus === 'authenticated') fetchPRs();
    else if (sessionStatus === 'loading') setLoadingPRs(true);
    else {
      setLoadingPRs(false); setFeaturedPRs([]);
      if (sessionStatus === "unauthenticated" && currentUsername) setError(prev => prev || "Please sign in to view pull requests.");
    }
  }, [currentUsername, refreshing, session, sessionStatus]);

  useEffect(() => {
    async function loadUserStatsAndRelatedData() { // Renamed for clarity
      if (!currentUsername || sessionStatus !== "authenticated" || !session) {
        setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]); setLoadingStats(false);
        if (sessionStatus === "unauthenticated" && currentUsername) setError(prev => prev || "Please sign in to fetch user data.");
        return;
      }
      setLoadingStats(true); setTopLanguages([]); setContributionBreakdown([]); // Clear previous data
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
            if (years < 0) yearsOnGitHubText = "N/A";
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
            })).sort((a, b) => b.count - a.count); // Sort by count
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
        setError(prevError => prevError || (e.message || "Failed to load user profile."));
        setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]);
      } finally {
        setLoadingStats(false);
      }
    }
    if (currentUsername && sessionStatus === 'authenticated') loadUserStatsAndRelatedData();
    else if (sessionStatus === 'loading') setLoadingStats(true);
    else {
      setLoadingStats(false); setUserProfile(null); setBlocks([]); setTopLanguages([]); setContributionBreakdown([]);
      if (sessionStatus === "unauthenticated" && currentUsername) setError(prev => prev || "Please sign in to view user statistics.");
    }
  }, [currentUsername, refreshing, session, sessionStatus, error]);

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
  const activeSB = useMemo(() => blocks.find((b) => b.id === activeStatBlockId), [activeStatBlockId, blocks]);
  const refreshAll = useCallback(() => { setError(null); setRefreshing(true); }, []);
  const calendarDisplayTheme = { light: GITHUB_CALENDAR_LIGHT_THEME_COLORS, dark: GITHUB_CALENDAR_DARK_THEME_COLORS };

  if (sessionStatus === 'loading' || ((loadingStats || loadingPRs) && !refreshing && !error && (!userProfile || featuredPRs.length === 0))) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-neutral-200 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div> <Skeleton className="h-10 w-64 mb-2 bg-neutral-200 dark:bg-neutral-800" /> <Skeleton className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800" /> </div>
            <Skeleton className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <Skeleton className="h-56 md:h-64 w-full mb-8 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <CardHeader className="pb-2"> <Skeleton className="h-8 w-8 rounded-md bg-neutral-300 dark:bg-neutral-700" /> <Skeleton className="h-4 w-24 mt-2 bg-neutral-300 dark:bg-neutral-700" /> </CardHeader>
                <CardContent> <Skeleton className="h-8 w-16 bg-neutral-300 dark:bg-neutral-700" /> </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-black text-neutral-900 dark:text-neutral-200 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white"> GitHub Portfolio Dashboard </h1>
            <p className="text-neutral-600 dark:text-neutral-400"> Visualize and manage your GitHub presence for <span className="font-semibold text-neutral-700 dark:text-neutral-300">{currentUsername}</span> </p>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
            <Button variant="outline" className="border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300" onClick={() => { const nu = prompt("Enter GitHub username:", currentUsername); if (nu && nu.trim()) { setError(null); setUsername(nu.trim()); } }} > <ExternalLink className="h-4 w-4 mr-2" /> Change User </Button>
            <Button onClick={refreshAll} disabled={refreshing || loadingStats || loadingPRs || sessionStatus === 'loading'} className="bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black border-0 font-medium" > <RefreshCw className={`h-4 w-4 mr-2 ${refreshing || loadingStats || loadingPRs ? "animate-spin" : ""}`} /> {(refreshing || loadingStats || loadingPRs) && sessionStatus === 'authenticated' ? "Loading..." : "Refresh Data"} </Button>
          </div>
        </motion.div>

        {userProfile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
            <Card className="overflow-hidden shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <Avatar className="h-24 w-24 border-2 shadow-lg border-neutral-300 dark:border-neutral-700"> <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} alt={userProfile.name || currentUsername} /> <AvatarFallback className="font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"> {(userProfile.login || currentUsername).substring(0, 2).toUpperCase()} </AvatarFallback> </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold mb-1 text-black dark:text-white"> {userProfile.name || userProfile.login} </h2>
                    <a href={`https://github.com/${currentUsername}`} target="_blank" rel="noopener noreferrer" className="inline-block"> <Badge variant="outline" className="mb-3 py-1 px-2.5 text-xs cursor-pointer transition-colors border-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"> <Github className="h-3.5 w-3.5 mr-1.5" /> {currentUsername} </Badge> </a>
                    <p className="mb-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400"> {userProfile.bio || "No biography provided."} </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start"> <Button variant="outline" size="sm" className="border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300" onClick={() => window.open(`https://github.com/${currentUsername}`, "_blank")} > <Github className="h-4 w-4 mr-2" /> Profile </Button> <Button variant="outline" size="sm" className="border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300" onClick={() => window.open(`https://github.com/${currentUsername}?tab=repositories`, "_blank")} > <Archive className="h-4 w-4 mr-2" /> Repositories </Button> </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && !refreshing && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-6"> <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-950/50 dark:text-red-300"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error Fetching Data</AlertTitle> <AlertDescription>{error}</AlertDescription> <div className="mt-2"> <p className="text-sm"> Could not load data for {currentUsername}. API rate limits, network issues, or an invalid username might be the cause. Please try refreshing or changing the user. </p> </div> </Alert> </motion.div>)}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="mb-8">
          <div className="flex justify-between items-center mb-4"> <h2 className="text-xl font-semibold text-black dark:text-white"> Featured Pull Requests </h2> {currentUsername && (<Button variant="ghost" size="sm" className="font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100" onClick={() => window.open(`https://github.com/pulls?q=is%3Apr+author%3A${currentUsername}`, "_blank")} > View All on GitHub <ExternalLink className="ml-2 h-3.5 w-3.5" /> </Button>)} </div>
          <VirtualizedPRList pullRequests={featuredPRs} isLoading={loadingPRs && sessionStatus === 'authenticated'} usernameForEmptyMessage={currentUsername} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
                <TabsTrigger value="overview" className="text-sm font-medium rounded-md text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-white/80 dark:text-neutral-400 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 dark:hover:bg-neutral-700/60"> <CalendarIcon className="h-4 w-4 mr-2" /> Activity </TabsTrigger>
                <TabsTrigger value="contributions" className="text-sm font-medium rounded-md text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-white/80 dark:text-neutral-400 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 dark:hover:bg-neutral-700/60"> <BarChart3 className="h-4 w-4 mr-2" /> Breakdown </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <Card className="overflow-hidden shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                  <CardHeader> <CardTitle className="text-black dark:text-white"> Contribution Activity </CardTitle> <CardDescription className="text-neutral-600 dark:text-neutral-400"> GitHub contribution calendar for {currentUsername}. </CardDescription> </CardHeader>
                  <CardContent> <div className="p-3 sm:p-4 rounded-lg overflow-x-auto bg-white dark:bg-neutral-950"> {currentUsername ? (<GitHubCalendar username={currentUsername} theme={calendarDisplayTheme} blockSize={14} fontSize={12} showWeekdayLabels />) : (<p className="text-neutral-500 dark:text-neutral-400">Enter a username to see activity.</p>)} </div> </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="contributions" className="mt-4">
                <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white">Contribution Breakdown (Last Year)</CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                      Overview of different contribution types by {currentUsername}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingStats && contributionBreakdown.length === 0 ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-sm"> <Skeleton className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700" /> <Skeleton className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-700" /> </div>
                            <Skeleton className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
                          </div>
                        ))}
                      </div>
                    ) : contributionBreakdown.length > 0 ? (
                      <div className="space-y-5">
                        {contributionBreakdown.map((item) => (
                          <div key={item.type} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center text-neutral-700 dark:text-neutral-300">
                                {React.cloneElement(item.icon as React.ReactElement, { className: cn("mr-2 h-4 w-4", item.colorClass.replace('bg-', 'text-')) })}
                                {item.label}
                              </span>
                              <span className="font-medium text-black dark:text-white">
                                {item.count.toLocaleString()} ({item.percentage}%)
                              </span>
                            </div>
                            <Progress
                              value={item.percentage}
                              className={cn("h-2 rounded-full bg-neutral-200 dark:bg-neutral-700")}
                              indicatorClassName={cn("rounded-full", item.colorClass)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400">No contribution breakdown data available for {currentUsername}.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          {/* <div className="lg:col-span-1"> */}
          {/*   <TopLanguagesCard */}
          {/*     languages={topLanguages} */}
          {/*     isLoading={loadingStats && sessionStatus === 'authenticated'} */}
          {/*     username={currentUsername} */}
          {/*   /> */}
          {/* </div> */}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-6" >
          <h2 className="text-xl font-semibold mb-2 text-black dark:text-white"> GitHub Statistics Overview </h2>
          <p className="text-sm mb-4 text-neutral-600 dark:text-neutral-400"> Drag and drop to reorder your statistics cards. </p>
          <Separator className="mb-6 bg-neutral-200 dark:bg-neutral-800" />
        </motion.div>

        {blocks.length > 0 || (loadingStats && sessionStatus === 'authenticated') ? (<DndContext sensors={dndStatSensors} collisionDetection={closestCenter} onDragStart={handleDragStartSB} onDragEnd={handleDragEndSB} onDragCancel={() => setActiveStatBlockId(null)} > <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy} > <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"> {blocks.map((b, index) => (<motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 + index * 0.05, }} > <SortableStatBlock block={b} isDragging={activeStatBlockId === b.id} /> </motion.div>))} {loadingStats && blocks.length === 0 && sessionStatus === 'authenticated' && Array(5).fill(0).map((_, i) => (<Card key={`stat-skeleton-${i}`} className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"> <CardHeader className="pb-2 pl-5 pr-10 pt-4"> <div className="flex items-center gap-3"> <Skeleton className="h-10 w-10 rounded-lg bg-neutral-300 dark:bg-neutral-700" /> <Skeleton className="h-4 w-24 bg-neutral-300 dark:bg-neutral-700" /> </div> </CardHeader> <CardContent className="pl-5 pr-10 pb-4 pt-1"> <Skeleton className="h-8 w-16 bg-neutral-300 dark:bg-neutral-700" /> </CardContent> </Card>))} </div> </SortableContext> <DragOverlay> {activeSB && (() => { const safeColorIndex = activeSB.colorIndex % 3; let gradientClasses = ""; let iconContainerClasses = ""; if (safeColorIndex === 0) { gradientClasses = "from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700"; iconContainerClasses = "bg-gradient-to-br from-neutral-600 to-neutral-800 text-white dark:from-neutral-400 dark:to-neutral-100 dark:text-black"; } else if (safeColorIndex === 1) { gradientClasses = "from-sky-200 to-sky-300 dark:from-sky-800 dark:to-sky-700"; iconContainerClasses = "bg-gradient-to-br from-sky-600 to-sky-800 text-white dark:from-sky-400 dark:to-sky-100 dark:text-black"; } else { gradientClasses = "from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700"; iconContainerClasses = "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white dark:from-emerald-400 dark:to-emerald-100 dark:text-black"; } return (<Card className={cn("overflow-hidden shadow-2xl cursor-grabbing transition-opacity backdrop-blur-md bg-white/80 border-neutral-200 text-neutral-900", "dark:bg-neutral-900/80 dark:border-neutral-800 dark:text-neutral-100")} > <div className={cn("absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b", gradientClasses)} /> <CardHeader className="pb-2 pl-5 pr-4 pt-4"> <div className="flex items-center gap-3"> <div className={cn("p-2.5 rounded-lg shadow-md", iconContainerClasses)}> {activeSB.icon} </div> <CardTitle className="text-sm font-semibold md:text-base"> {activeSB.title} </CardTitle> </div> </CardHeader> <CardContent className="pl-5 pr-4 pb-4 pt-1"> <div className="text-2xl md:text-3xl font-bold"> {activeSB.content} </div> </CardContent> </Card>); })()} </DragOverlay> </DndContext>) : (!loadingStats && !error && !userProfile && sessionStatus === "authenticated" && <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">No statistics to display for this user, or user not found.</p>)}
        {sessionStatus !== "authenticated" && !loadingStats && !loadingPRs && (<div className="text-center py-10"> <AlertCircle className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" /> <p className="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">Please sign in</p> <p className="text-neutral-500 dark:text-neutral-400">Sign in with GitHub to view dashboard content.</p> </div>)}
      </div>
    </div>
  );
}
