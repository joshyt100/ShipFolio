// components/dashboard/DashboardLoadingScreen.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function DashboardLoadingScreen() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-neutral-200 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2 bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <Skeleton className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <Skeleton className="h-56 md:h-64 w-full mb-8 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
              >
                <CardHeader className="pb-2">
                  <Skeleton className="h-8 w-8 rounded-md bg-neutral-300 dark:bg-neutral-700" />
                  <Skeleton className="h-4 w-24 mt-2 bg-neutral-300 dark:bg-neutral-700" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 bg-neutral-300 dark:bg-neutral-700" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
