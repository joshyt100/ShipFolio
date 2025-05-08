// components/dashboard/DashboardHeader.tsx
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "~/components/mode-toggle/ModeToggle";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { SessionContextValue } from "next-auth/react";


interface DashboardHeaderProps {
  currentUsername: string;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  onUsernameChange: () => void;
  onRefreshAll: () => void;
  refreshing: boolean;
  loadingStats: boolean;
  loadingPRs: boolean;
  sessionStatus: SessionContextValue["status"];
}

export function DashboardHeader({
  currentUsername,
  isDarkTheme,
  toggleTheme,
  onUsernameChange,
  onRefreshAll,
  refreshing,
  loadingStats,
  loadingPRs,
  sessionStatus,
}: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          GitHub Portfolio Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Visualize and manage your GitHub presence for{" "}
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            {currentUsername}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
        <Button
          variant="outline"
          className=""
          onClick={onUsernameChange}
        >
          <ExternalLink className="h-4 w-4 mr-2" /> Change User
        </Button>
        <Button
          onClick={onRefreshAll}
          disabled={refreshing || loadingStats || loadingPRs || sessionStatus === 'loading'}
          className=""
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing || loadingStats || loadingPRs ? "animate-spin" : ""
              }`}
          />
          {(refreshing || loadingStats || loadingPRs) && sessionStatus === 'authenticated'
            ? "Loading..."
            : "Refresh Data"}
        </Button>
      </div>
    </motion.div>
  );
}
