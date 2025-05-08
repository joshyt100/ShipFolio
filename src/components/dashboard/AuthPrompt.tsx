// components/dashboard/AuthPrompt.tsx
import React from "react";
import { AlertCircle } from "lucide-react";
import type { SessionContextValue } from "next-auth/react";

interface AuthPromptProps {
  sessionStatus: SessionContextValue["status"];
  loadingStats: boolean;
  loadingPRs: boolean;
}

export function AuthPrompt({ sessionStatus, loadingStats, loadingPRs }: AuthPromptProps) {
  if (sessionStatus !== "authenticated" && !loadingStats && !loadingPRs) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
        <p className="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
          Please sign in
        </p>
        <p className="text-neutral-500 dark:text-neutral-400">
          Sign in with GitHub to view dashboard content.
        </p>
      </div>
    );
  }
  return null;
}
