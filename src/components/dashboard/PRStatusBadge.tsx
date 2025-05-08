// components/dashboard/PRStatusBadge.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { GitPullRequest, GitMerge, X } from "lucide-react";
import type { PRState } from "./types";

interface PRStatusBadgeProps {
  status: PRState;
}

export function PRStatusBadge({ status }: PRStatusBadgeProps) {
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

  const config = statusConfig[status] || statusConfig.closed; // Default to closed if status is unknown
  return (
    <div className={cn(baseClasses, config.classes)}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
