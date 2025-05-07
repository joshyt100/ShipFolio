// components/dashboard/PRListItem.tsx
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { GripVertical, Link as LinkIcon, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRStatusBadge } from "./PRStatusBadge";
import type { VirtualizedPRItem } from "@/app/dashboard/types";
import { PR_ITEM_ESTIMATED_HEIGHT } from "@/app/dashboard/types";


interface PRListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: VirtualizedPRItem;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: React.CSSProperties;
  // Allow any other props to be passed to the underlying div, especially DND attributes/listeners
  [key: string]: any;
}

export const PRListItem = React.forwardRef<HTMLDivElement, PRListItemProps>(
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

    // Props for the grab handle div if not an overlay
    const grabHandleProps = !isOverlay ? props : {};


    return (
      <div
        ref={ref}
        style={itemOuterStyle}
        {...(isOverlay ? {} : props)} // Spread props on the outer div only if not overlay (Sortable attributes)
        // If it is an overlay, props will be on the grab handle area via grabHandleProps
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
            {...grabHandleProps} // Apply listeners here for the sortable item itself.
            // For overlay, this div won't have listeners.
            className={cn(
              "flex items-center justify-center px-2.5 touch-none",
              "bg-neutral-100 group-hover:bg-neutral-200 dark:bg-neutral-800/70 dark:group-hover:bg-neutral-700/80",
              isOverlay
                ? "cursor-grabbing" // Overlay is always "grabbing"
                : "cursor-grab active:cursor-grabbing", // Actual item is grab/grabbing
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
                <span className="ml-2 font-mono text-neutral-400">
                  #{item.number}
                </span>
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
