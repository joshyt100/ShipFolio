// components/dashboard/ActivityTabs.tsx
import React from "react";
import { motion } from "framer-motion";
import GitHubCalendar from "react-github-calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, BarChart3, GitCommit, GitPullRequest, Eye, AlertCircle as IssueIcon } from "lucide-react"; // Renamed AlertCircle to IssueIcon for clarity
import { cn } from "@/lib/utils";
import type { ContributionTypeStat } from "@/app/dashboard/types";
import { GITHUB_CALENDAR_LIGHT_THEME_COLORS, GITHUB_CALENDAR_DARK_THEME_COLORS } from "@/app/dashboard/types";

interface ActivityTabsProps {
  currentUsername: string;
  contributionBreakdown: ContributionTypeStat[];
  loadingStats: boolean; // For loading state of contribution breakdown
}

export function ActivityTabs({
  currentUsername,
  contributionBreakdown,
  loadingStats,
}: ActivityTabsProps) {
  const calendarDisplayTheme = {
    light: GITHUB_CALENDAR_LIGHT_THEME_COLORS,
    dark: GITHUB_CALENDAR_DARK_THEME_COLORS,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2"> {/* Assuming TopLanguagesCard would be lg:col-span-1 */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
            <TabsTrigger
              value="overview"
              className="text-sm font-medium rounded-md text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-white/80 dark:text-neutral-400 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 dark:hover:bg-neutral-700/60"
            >
              <CalendarIcon className="h-4 w-4 mr-2" /> Activity
            </TabsTrigger>
            <TabsTrigger
              value="contributions"
              className="text-sm font-medium rounded-md text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-white/80 dark:text-neutral-400 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 dark:hover:bg-neutral-700/60"
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Breakdown
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card className="overflow-hidden shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">
                  Contribution Activity
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  GitHub contribution calendar for {currentUsername}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 sm:p-4 rounded-lg overflow-x-auto bg-white dark:bg-neutral-950">
                  {currentUsername ? (
                    <GitHubCalendar
                      username={currentUsername}
                      theme={calendarDisplayTheme}
                      blockSize={14}
                      fontSize={12}
                      showWeekdayLabels
                    />
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Enter a username to see activity.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contributions" className="mt-4">
            <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">
                  Contribution Breakdown (Last Year)
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Overview of different contribution types by {currentUsername}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStats && contributionBreakdown.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <Skeleton className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700" />
                          <Skeleton className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-700" />
                        </div>
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
                            {React.cloneElement(
                              item.icon as React.ReactElement,
                              {
                                className: cn(
                                  "mr-2 h-4 w-4",
                                  item.colorClass.replace("bg-", "text-") // Use text color for icon based on bg color
                                ),
                              }
                            )}
                            {item.label}
                          </span>
                          <span className="font-medium text-black dark:text-white">
                            {item.count.toLocaleString()} ({item.percentage}%)
                          </span>
                        </div>
                        <Progress
                          value={item.percentage}
                          className={cn(
                            "h-2 rounded-full bg-neutral-200 dark:bg-neutral-700"
                          )}
                          indicatorClassName={cn(
                            "rounded-full",
                            item.colorClass
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No contribution breakdown data available for{" "}
                    {currentUsername}.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Placeholder for TopLanguagesCard if it were active */}
      {/* <div className="lg:col-span-1">
           <TopLanguagesCard languages={topLanguages} isLoading={loadingStats} username={currentUsername} />
         </div> */}
    </motion.div>
  );
}
