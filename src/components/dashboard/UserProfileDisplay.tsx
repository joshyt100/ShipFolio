import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  Archive,
  CalendarDays,
  TrendingUp,
  Flame,
  Briefcase, // Example if you wanted to show 'Company'
} from "lucide-react";
import type { UserProfile, ContributionActivityStats } from "./types";

interface UserProfileDisplayProps {
  userProfile: UserProfile | null;
  currentUsername: string;
  activityStats?: ContributionActivityStats;
  // Added for potential use, as it's common in GitHub profiles
  isDarkTheme?: boolean; // If not globally available, pass as prop
}

const StatDisplayCard = ({
  icon,
  title,
  value,
  details,
  iconBgColor = "bg-sky-100 dark:bg-sky-700/40",
  iconTextColor = "text-sky-600 dark:text-sky-300",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  details?: string;
  iconBgColor?: string;
  iconTextColor?: string;
}) => (
  <div className="flex items-center p-2.5 bg-white dark:bg-neutral-800/60 rounded-lg border border-neutral-200/80 dark:border-neutral-700/70 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div
      className={`mr-2.5 flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full ${iconBgColor}`}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: `h-3.5 w-3.5 ${iconTextColor}`,
      })}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-tighter truncate">
        {title}
      </p>
      <div className="flex items-baseline">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
          {value}
        </p>
        {details && (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-1 truncate">
            {details}
          </span>
        )}
      </div>
    </div>
  </div>
);

export function UserProfileDisplay({
  userProfile,
  currentUsername,
  activityStats,
  isDarkTheme, // Assuming this might be available for more consistent styling if needed elsewhere
}: UserProfileDisplayProps) {
  if (!userProfile) return null;

  const showLongestStreak = !!(activityStats?.longestStreak && activityStats.longestStreak.days > 0);
  const showBusiestDay = !!(activityStats?.busiestDayOfWeek?.day);
  const showPeakCommitDay = !!(activityStats?.mostCommitsSingleDay && activityStats.mostCommitsSingleDay.count > 0);

  const hasAnyActivityHighlights = showLongestStreak || showBusiestDay || showPeakCommitDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }}
      className="mb-5" // Slightly more margin bottom
    >
      <Card className="overflow-hidden shadow-lg bg-white/90 dark:bg-neutral-900/90 border-neutral-200/90 dark:border-neutral-700/80 backdrop-blur-lg">
        <CardContent className="p-3.5 sm:p-4"> {/* Responsive padding */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <Avatar className="h-16 w-16 sm:h-18 sm:w-18 border-2 shadow-md border-white dark:border-neutral-600 flex-shrink-0">
              <AvatarImage
                src={userProfile.avatar_url || "/placeholder.svg"}
                alt={userProfile.name || currentUsername}
              />
              <AvatarFallback className="font-semibold text-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                {(userProfile.login || currentUsername)
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                  {userProfile.name || userProfile.login}
                </h2>
                <a
                  href={`https://github.com/${currentUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex self-start sm:self-center"
                  aria-label={`${currentUsername}'s GitHub Profile`}
                >
                  <Badge
                    variant="outline"
                    className="py-0.5 px-2 text-xs cursor-pointer transition-all duration-200 border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-700/60 dark:hover:bg-neutral-600/70 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                  >
                    <Github className="h-3 w-3 mr-1.5" /> {currentUsername}
                  </Badge>
                </a>
              </div>

              {userProfile.company && (
                <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  <Briefcase className="h-3 w-3 mr-1.5 text-neutral-400 dark:text-neutral-500" />
                  <span>{userProfile.company}</span>
                </div>
              )}

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2.5 line-clamp-2"> {/* Allow two lines for bio */}
                {userProfile.bio || "No biography provided."}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-7 text-xs px-2.5 border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:bg-neutral-600/60 text-neutral-700 dark:text-neutral-200 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => window.open(`https://github.com/${currentUsername}`, "_blank")}
                  >
                    <Github className="h-3.5 w-3.5 mr-1.5" /> Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-7 text-xs px-2.5 border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-700/50 dark:hover:bg-neutral-600/60 text-neutral-700 dark:text-neutral-200 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => window.open(`https://github.com/${currentUsername}?tab=repositories`, "_blank")}
                  >
                    <Archive className="h-3.5 w-3.5 mr-1.5" /> Repos ({userProfile.public_repos ?? 0})
                  </Button>
                </div>

                {activityStats && hasAnyActivityHighlights && (
                  <div className="flex-grow grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:flex lg:justify-end gap-2 mt-2 sm:mt-0 sm:ml-auto">
                    {showLongestStreak && activityStats.longestStreak && (
                      <StatDisplayCard
                        icon={<Flame />}
                        title="Streak"
                        value={`${activityStats.longestStreak.days}d`}
                        iconBgColor="bg-orange-100 dark:bg-orange-500/30"
                        iconTextColor="text-orange-500 dark:text-orange-400"
                      />
                    )}
                    {showBusiestDay && activityStats.busiestDayOfWeek && (
                      <StatDisplayCard
                        icon={<CalendarDays />}
                        title="Busiest"
                        value={activityStats.busiestDayOfWeek.day.substring(0, 3)}
                        iconBgColor="bg-blue-100 dark:bg-blue-500/30"
                        iconTextColor="text-blue-500 dark:text-blue-400"
                      />
                    )}
                    {showPeakCommitDay && activityStats.mostCommitsSingleDay && (
                      <StatDisplayCard
                        icon={<TrendingUp />}
                        title="Peak Day"
                        value={activityStats.mostCommitsSingleDay.count}
                        details={`on ${activityStats.mostCommitsSingleDay.date.split(',')[0]}`} // Shortened date
                        iconBgColor="bg-emerald-100 dark:bg-emerald-500/30"
                        iconTextColor="text-emerald-600 dark:text-emerald-400"
                      />
                    )}
                  </div>
                )}

                {activityStats && !hasAnyActivityHighlights && (
                  <div className="mt-2 sm:mt-0 sm:ml-auto">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                      No recent activity highlights.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
