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
import type { VirtualizedPRItem } from "./types";
import { PR_ITEM_ESTIMATED_HEIGHT } from "./types";

interface PRListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: VirtualizedPRItem;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: React.CSSProperties;
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

    const StateIcon = useMemo(() => {
      if (isMerged) return GitMerge;
      if (isOpen) return GitPullRequest;
      return XCircle;
    }, [isMerged, isOpen]);

    const commentsCount = typeof item.commentsCount === "number" ? item.commentsCount : 0;
    const approvedReviewsCount = typeof item.approvedReviewsCount === "number" ? item.approvedReviewsCount : 0;

    return (
      <div
        ref={ref}
        style={itemOuterStyle}
        {...(isOverlay ? {} : props)}
        className={cn("w-full", isOverlay && "z-50")}
      >
        <Card
          className={cn(
            "grid grid-cols-[auto_1fr] gap-2 h-full relative p-2",
            isDragging && !isOverlay && "ring-2 ring-sky-500 opacity-80",
            isOverlay && "ring-2 ring-sky-600 scale-105"
          )}
        >
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1",
              isMerged && "bg-purple-500 dark:bg-purple-600",
              isOpen && "bg-green-500 dark:bg-green-600",
              isClosedUnmerged && "bg-red-500 dark:bg-red-600"
            )}
          />

          <div
            className={cn(
              "flex items-start px-2 pt-1",
              isOverlay ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={item.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h3 className="text-sm font-medium text-foreground line-clamp-2">
                    {item.title || "No Title Provided"}
                  </h3>
                </a>
              </div>
              <PRStatusBadge status={item.state} />
            </div>

            {(item.repository?.name || item.number != null) && (
              <div className="flex items-center text-xs text-muted-foreground">
                <StateIcon
                  className={cn(
                    "h-3.5 w-3.5 mr-1.5",
                    isMerged && "text-purple-500",
                    isOpen && "text-green-500",
                    isClosedUnmerged && "text-red-500"
                  )}
                />
                {item.repository?.name && (
                  <a
                    href={item.repository.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate"
                  >
                    {item.repository.name}
                  </a>
                )}
                {item.number != null && (
                  <span className={cn("font-mono", item.repository?.name && "ml-1.5")}>
                    #{item.number}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-2">
              {item.user?.login && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={item.user.avatar_url || "/placeholder.svg"}
                      alt={item.user.login}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(item.user.login)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {item.user.login}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
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

