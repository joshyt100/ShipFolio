"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { Ship, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "~/components/mode-toggle/ModeToggle";
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
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-12 min-w-screen px-2 lg:px-0 lg:min-w-5/6 items-center justify-between">
        {/* Logo on the left */}
        <div className="flex items-center space-x-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
            <Ship size={24} className="text-indigo-600" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ShipFolio</span>
        </div>

        {/* Dashboard controls on the right */}
        <div className="flex items-center space-x-4">
          <ModeToggle />

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onUsernameChange}
          >
            <ExternalLink className="h-4 w-4" />
            Change User
          </Button>

          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={onRefreshAll}
            disabled={
              refreshing ||
              loadingStats ||
              loadingPRs ||
              sessionStatus === "loading"
            }
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing || loadingStats || loadingPRs
                ? "animate-spin"
                : ""
                }`}
            />
            {(refreshing || loadingStats || loadingPRs) &&
              sessionStatus === "authenticated"
              ? "Loading..."
              : "Refresh Data"}
          </Button>
        </div>
      </div>
    </nav>
  );
}

