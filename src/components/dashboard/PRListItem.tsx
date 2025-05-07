"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  GripVertical,
  Clock,
  ArrowUpRight,
  GitPullRequest,
  GitMerge,
  XCircle,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRStatusBadge } from "./PRStatusBadge";
import type { VirtualizedPRItem } from "@/app/dashboard/types";
import { PR_ITEM_ESTIMATED_HEIGHT } from "@/app/dashboard/types";

interface PRListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: VirtualizedPRItem;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const PRListItem = React.forwardRef<HTMLDivElement, PRListItemProps>(
  ({ item, isDragging, isOverlay, style, ...props }, ref) => {
    const getInitials = (name: string) =>
      (name || "NN").substring(0, 2).toUpperCase();

    const itemOuterStyle: React.CSSProperties = {
      ...style,
      height: `${PR_ITEM_ESTIMATED_HEIGHT}px`,
      paddingTop: "4px",
      paddingBottom: "4px",
    };

    const isMerged = item.state === "merged";
    const isOpen = item.state === "open";
    const isClosedUnmerged = item.state === "closed" && !isMerged;

    // For debugging - you can add this to check what data is being received
    // console.log(`PR #${item.number} data:`, { 
    //   comments: item.commentsCount,
    //   approvals: item.approvedReviewsCount 
    // });

    const formattedDate = useMemo(() => {
      if (!item.createdAt) return "Date N/A";
      const date = new Date(item.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }, [item.createdAt]);

    const grabHandleProps = !isOverlay ? props : {};

    const StateIcon = useMemo(() => {
      if (isMerged) return GitMerge;
      if (isOpen) return GitPullRequest;
      return XCircle;
    }, [isMerged, isOpen]);

    // Ensure we have valid numbers for comments and approvals
    const commentsCount = typeof item.commentsCount === 'number' ? item.commentsCount : 0;
    const approvedReviewsCount = typeof item.approvedReviewsCount === 'number' ? item.approvedReviewsCount : 0;

    return (
      <div
        ref={ref}
        style={itemOuterStyle}
        {...(isOverlay ? {} : props)}
        className={cn("w-full outline-none focus:outline-none", isOverlay && "z-50")}
      >
        <Card
          className={cn(
            "grid grid-cols-[auto_1fr] gap-2 h-full overflow-hidden relative group p-2",
            "transition-all duration-200 ease-in-out",
            "hover:shadow-md dark:hover:shadow-black/30",
            "bg-white border border-neutral-200 hover:border-neutral-300",
            "dark:bg-neutral-800/60 dark:border-neutral-700/80 dark:hover:border-neutral-600",
            isDragging && !isOverlay &&
            "ring-2 ring-sky-500 opacity-80 shadow-lg dark:ring-sky-400",
            isOverlay &&
            "shadow-xl scale-102 !opacity-100 ring-2 ring-sky-600 dark:ring-sky-500"
          )}
        >
          {/* Left border indicator */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1",
              isMerged && "bg-purple-500 dark:bg-purple-600",
              isOpen && "bg-green-500 dark:bg-green-600",
              isClosedUnmerged && "bg-red-500 dark:bg-red-600"
            )}
          />

          {/* Grip Handle */}
          <div
            {...grabHandleProps}
            className={cn(
              "flex items-start px-2 pt-1 touch-none",
              "bg-neutral-50 group-hover:bg-neutral-100 dark:bg-neutral-800 dark:group-hover:bg-neutral-700/60",
              isOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing"
            )}
          >
            <GripVertical className="h-4 w-4 text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-2 min-w-0">
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={item.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link"
                  title={item.title || "Untitled PR"}
                >
                  <h3 className="font-medium text-[15px] leading-tight text-neutral-800 group-hover/link:text-sky-600 dark:text-neutral-100 dark:group-hover/link:text-sky-400 line-clamp-2">
                    {item.title || "No Title Provided"}
                  </h3>
                </a>
              </div>
              <PRStatusBadge status={item.state} />
            </div>

            {/* Repo info */}
            {(item.repository?.name || item.number != null) && (
              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                <StateIcon
                  className={cn(
                    "h-3.5 w-3.5 mr-1.5",
                    isMerged && "text-purple-500 dark:text-purple-400",
                    isOpen && "text-green-500 dark:text-green-400",
                    isClosedUnmerged && "text-red-500 dark:text-red-400"
                  )}
                />
                {item.repository?.name && (
                  <a
                    href={item.repository.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate font-medium"
                    title={item.repository.name}
                  >
                    {item.repository.name}
                  </a>
                )}
                {item.number != null && (
                  <span
                    className={cn(
                      "font-mono text-neutral-400 dark:text-neutral-500",
                      item.repository?.name ? "ml-1.5" : ""
                    )}
                  >
                    #{item.number}
                  </span>
                )}
              </div>
            )}

            {/* Metadata row */}
            <div className="flex items-center justify-between border-t pt-2 border-neutral-100 dark:border-neutral-700/50">
              {/* Author */}
              {item.user?.login && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-neutral-200 dark:border-neutral-600 ring-1 ring-white dark:ring-neutral-800">
                    <AvatarImage src={item.user.avatar_url || "/placeholder.svg"} alt={item.user.login} />
                    <AvatarFallback className="text-[10px] font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                      {getInitials(item.user.login)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate text-neutral-700 dark:text-neutral-200">
                    {item.user.login}
                  </span>
                </div>
              )}

              {/* Date and Stats */}
              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formattedDate}</span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{commentsCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Comments</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{approvedReviewsCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Approvals</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {item.url && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md transition-colors text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                          aria-label="Open PR on GitHub"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Open on GitHub</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);

PRListItem.displayName = "PRListItem";
