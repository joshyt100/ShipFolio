// components/dashboard/ActivityTabs.tsx
import React from "react";
import { motion } from "framer-motion";
import GitHubCalendar from "react-github-calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  // CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContributionTypeStat } from "./types"; // Ensure this path is correct
import { GITHUB_CALENDAR_LIGHT_THEME_COLORS, GITHUB_CALENDAR_DARK_THEME_COLORS } from "./types"; // Ensure this path is correct

interface ActivityTabsProps {
  currentUsername: string;
  contributionBreakdown: ContributionTypeStat[];
  loadingStats: boolean;
  isStaticPage?: boolean; // Added for potential static page adjustments
}

export function ActivityTabs({
  currentUsername,
  contributionBreakdown,
  loadingStats,
  isStaticPage, // If you need to slightly alter behavior/appearance for static pages
}: ActivityTabsProps) {
  const calendarDisplayTheme = {
    light: GITHUB_CALENDAR_LIGHT_THEME_COLORS,
    dark: GITHUB_CALENDAR_DARK_THEME_COLORS,
  };

  // Determine if calendar should render based on username or if it's a static page with a pre-filled username
  const canRenderCalendar = currentUsername || (isStaticPage && currentUsername);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-6" // Reduced margin-bottom from mb-8
    >
      {/* Removed potentially unused outer div wrapper */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
          <TabsTrigger
            value="overview"
            className="text-xs sm:text-sm font-medium rounded-md text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-white/80 dark:text-neutral-400 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 dark:hover:bg-neutral-700/60 px-3 py-1.5" // Adjusted padding and text size
          >
            <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Activity {/* Adjusted icon size and margin */}
          </TabsTrigger>
          <TabsTrigger
            value="contributions"
            className="text-xs sm:text-sm font-medium rounded-md text-neutral-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-white/80 dark:text-neutral-400 dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-neutral-100 dark:hover:bg-neutral-700/60 px-3 py-1.5" // Adjusted padding and text size
          >
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Breakdown {/* Adjusted icon size and margin */}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"> {/* Reduced margin-top from mt-4 */}
          <Card className="overflow-hidden shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
            <CardHeader className="px-4 py-0 sm:px-5 "> {/* Reduced padding */}
              <CardTitle className="text-base sm:text-lg text-black dark:text-white"> {/* Adjusted font size */}
                Contribution Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pt-0 sm:px-3 "> {/* Reduced padding */}
              <div className="p-2 rounded-lg overflow-x-auto bg-white dark:bg-neutral-950"> {/* Reduced padding */}
                {canRenderCalendar ? (
                  <GitHubCalendar
                    username={currentUsername} // Ensured currentUsername is passed
                    theme={calendarDisplayTheme}
                    blockSize={12} // Slightly reduced block size
                    fontSize={10} // Slightly reduced font size
                    showWeekdayLabels
                  />
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">
                    {isStaticPage ? "Calendar data not available for this view." : "Enter a username to see activity."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="mt-3"> {/* Reduced margin-top */}
          <Card className="shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
            <CardHeader className="px-4  sm:px-5 "> {/* Reduced padding */}
              <CardTitle className="text-base sm:text-lg text-black dark:text-white"> {/* Adjusted font size */}
                Contribution Breakdown (Last Year)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4  sm:px-5 sm:pt-2 "> {/* Adjusted padding */}
              {loadingStats && contributionBreakdown.length === 0 ? (
                <div className="space-y-2.5"> {/* Reduced space */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-1"> {/* Reduced space */}
                      <div className="flex justify-between text-sm">
                        <Skeleton className="h-3.5 w-1/3 bg-neutral-200 dark:bg-neutral-700" />
                        <Skeleton className="h-3.5 w-1/4 bg-neutral-200 dark:bg-neutral-700" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" /> {/* Slightly thinner skeleton bar */}
                    </div>
                  ))}
                </div>
              ) : contributionBreakdown.length > 0 ? (
                <div className="space-y-3"> {/* Reduced space from space-y-5 */}
                  {contributionBreakdown.map((item) => (
                    <div key={item.type} className="space-y-1"> {/* Reduced space */}
                      <div className="flex justify-between items-center text-xs sm:text-sm"> {/* Adjusted text size */}
                        <span className="flex items-center text-neutral-700 dark:text-neutral-300">
                          {React.cloneElement(
                            item.icon as React.ReactElement,
                            {
                              className: cn(
                                "mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4", // Adjusted icon size and margin
                                item.colorClass.replace("bg-", "text-")
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
                          "h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" // Reduced height
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
                <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">
                  No contribution breakdown data available for{" "}
                  {currentUsername || "the user"}.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
