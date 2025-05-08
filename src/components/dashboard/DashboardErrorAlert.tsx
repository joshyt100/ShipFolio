// components/dashboard/DashboardErrorAlert.tsx
import React from "react";
import { motion } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DashboardErrorAlertProps {
  error: string | null;
  currentUsername: string;
  refreshing: boolean;
}

export function DashboardErrorAlert({
  error,
  currentUsername,
  refreshing,
}: DashboardErrorAlertProps) {
  if (!error || refreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6"
    >
      <Alert
        variant="destructive"
        className="mb-6 border-red-300 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-950/50 dark:text-red-300"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Fetching Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-2">
          <p className="text-sm">
            Could not load data for {currentUsername}. API rate limits,
            network issues, or an invalid username might be the cause. Please
            try refreshing or changing the user.
          </p>
        </div>
      </Alert>
    </motion.div>
  );
}
