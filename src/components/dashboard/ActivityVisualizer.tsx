import React from "react";
import GitHubCalendar from "react-github-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, Cell } from "recharts"; // Added Cell for individual bar colors if <needed></needed>
import { useTheme } from "next-themes";

interface ActivityVisualizerProps {
  username: string;
  calendarData?: { date: string; count: number }[]; // Keep this if you plan to pass pre-fetched data
  longestStreak: number;
  activeDays: number;
  isDarkTheme: boolean;
}

export const ActivityVisualizer: React.FC<ActivityVisualizerProps> = ({
  username,
  // calendarData, // Uncomment if you directly pass data to GitHubCalendar
  longestStreak,
  activeDays,
  // isDarkTheme,
}) => {


  const { theme } = useTheme();
  const isDarkTheme = (theme === 'dark')

  const chartData = [
    { name: 'Longest Streak', value: longestStreak, fill: isDarkTheme ? '#FFB74D' : '#FB8C00' }, // Orange
    { name: 'Active Days', value: activeDays, fill: isDarkTheme ? '#64B5F6' : '#1976D2' },    // Blue
  ];

  // Enhanced GitHub Calendar theme for dark mode (subtler than pure green)
  const darkThemeColors = {
    level0: '#161b22', // GitHub dark background
    level1: '#0e4429',
    level2: '#006d32',
    level3: '#26a641',
    level4: '#39d353',
  };
  // A light theme example (can be customized further)
  const lightThemeColors = {
    level0: '#ebedf0', // GitHub light background
    level1: '#9be9a8',
    level2: '#40c463',
    level3: '#30a14e',
    level4: '#216e39',
  };



  return (
    <Card className="shadow-md border-neutral-200/90 dark:border-neutral-700/80 bg-white/95 dark:bg-neutral-800/90">
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold text-neutral-800 dark:text-neutral-100">
            Activity Overview
          </h3>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full mr-1.5" style={{ backgroundColor: chartData[0]?.fill }}></div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Streak:
              </span>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 ml-1">
                {longestStreak}d
              </span>
            </div>
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full mr-1.5" style={{ backgroundColor: chartData[1]?.fill }}></div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Active:
              </span>
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 ml-1">
                {activeDays}d
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4"> {/* Adjusted grid for better ratio */}
          {/* Chart Side - takes up less space */}
          <div className="h-36 sm:h-40 md:col-span-4"> {/* e.g., 4 out of 12 columns */}
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="40%" // Slightly larger inner radius for a thinner bar
                outerRadius="90%" // Adjusted outer radius
                data={chartData}
                startAngle={90}
                endAngle={-270}
                barSize={12} // Slightly thicker bar for better visibility
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: isDarkTheme ? '#333' : '#eee' }} // Softer background
                  clockWise
                  dataKey="value"
                  cornerRadius={6} // Smoother corners
                >
                  {/* Optional: Apply colors per cell if not directly in data objects */}
                  {/* {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))} */}
                </RadialBar>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkTheme ? 'rgba(40, 40, 40, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                    borderColor: isDarkTheme ? '#555' : '#ccc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: isDarkTheme ? '#eee' : '#333', marginBottom: '4px', fontWeight: '600' }}
                  itemStyle={{ color: isDarkTheme ? '#ddd' : '#555' }}
                  // get rid of the type error for props.payload.name
                  formatter={(value: number, name: string, props) => [`${value} days`, props.payload.name: string]} // Use payload name for label
                // labelFormatter={(label, payload) => payload && payload.length ? payload[0].payload.name : ''} Removed as formatter is better here
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Calendar Side - Wider */}
          <div className="md:col-span-8 pt-1"> {/* e.g., 8 out of 12 columns */}
            <GitHubCalendar
              username={username}
              // data={calendarData} // Pass pre-fetched data here if available
              theme={isDarkTheme ? darkThemeColors : lightThemeColors}
              hideColorLegend
              hideMonthLabels
              hideTotalCount // Hides the "XXX contributions in the last year"
              showWeekdayLabels={false} // Set to true if you want Mon, Wed, Fri labels
              blockSize={9} // Slightly larger blocks
              blockMargin={2.5}
              fontSize={10} // Font size for day numbers if shown (not in this config)
              style={{ color: isDarkTheme ? '#C9D1D9' : '#24292F' }} // Base text color for the calendar (e.g. month names if not hidden)
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
