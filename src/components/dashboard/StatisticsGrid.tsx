// components/dashboard/StatisticsGrid.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type Sensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { SortableStatBlock } from "./SortableStatBlock"; // Ensure this component also gets styling updates
import { cn } from "@/lib/utils";
import type { Block, UserProfile } from "./types"; // Adjusted path if necessary
import type { SessionContextValue } from "next-auth/react";


interface StatisticsGridProps {
  blocks: Block[];
  loadingStats: boolean;
  sessionStatus: SessionContextValue["status"];
  dndSensors: Sensors;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  activeBlockId: string | null;
  activeBlockData: Block | undefined;
  currentUsername: string;
  error: string | null;
  userProfile: UserProfile | null;
}

export function StatisticsGrid({
  blocks,
  loadingStats,
  sessionStatus,
  dndSensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  activeBlockId,
  activeBlockData,
  currentUsername,
  error,
  userProfile,
}: StatisticsGridProps) {

  // This function renders the block being dragged.
  // Apply similar padding and font size changes to your SortableStatBlock.tsx component.
  const renderActiveBlockOverlay = () => {
    if (!activeBlockData) return null;
    const { icon, title, content, colorIndex } = activeBlockData;
    const safeColorIndex = colorIndex % 3;
    let gradientClasses = "";
    let iconContainerClasses = "";

    if (safeColorIndex === 0) {
      gradientClasses = "from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700";
      iconContainerClasses = "bg-gradient-to-br from-neutral-600 to-neutral-800 text-white dark:from-neutral-400 dark:to-neutral-100 dark:text-black";
    } else if (safeColorIndex === 1) {
      gradientClasses = "from-sky-200 to-sky-300 dark:from-sky-800 dark:to-sky-700";
      iconContainerClasses = "bg-gradient-to-br from-sky-600 to-sky-800 text-white dark:from-sky-400 dark:to-sky-100 dark:text-black";
    } else {
      gradientClasses = "from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700";
      iconContainerClasses = "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white dark:from-emerald-400 dark:to-emerald-100 dark:text-black";
    }

    return (
      <Card className={cn(
        "overflow-hidden shadow-2xl cursor-grabbing transition-opacity backdrop-blur-md bg-white/80 border-neutral-200 text-neutral-900",
        "dark:bg-neutral-900/80 dark:border-neutral-800 dark:text-neutral-100"
        // Consider min-height if content varies greatly and you want uniform dragging preview height
        // e.g., style={{ minHeight: '100px' }} or a Tailwind class like `h-28`
      )}
      >
        <div className={cn("absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b", gradientClasses)} />
        {/* Reduced padding in CardHeader: pb-1.5, pl-4, pt-3 */}
        <CardHeader className="pb-1.5 pl-4 pr-3 pt-3"> {/* Adjusted padding */}
          <div className="flex items-center gap-2.5"> {/* Slightly reduced gap */}
            {/* Reduced padding for icon container: p-2 */}
            <div className={cn("p-2 rounded-md shadow", iconContainerClasses)}> {/* Adjusted padding & rounding */}
              {icon} {/* Assuming icon is already sized e.g. h-4 w-4 */}
            </div>
            {/* Reduced font size for CardTitle: text-xs md:text-sm */}
            <CardTitle className="text-xs font-medium md:text-sm">{title}</CardTitle> {/* Adjusted font size & weight */}
          </div>
        </CardHeader>
        {/* Reduced padding and font size in CardContent */}
        <CardContent className="pl-4 pr-3 pb-3 pt-0.5"> {/* Adjusted padding */}
          {/* Reduced font size for content: text-lg md:text-xl */}
          <div className="text-lg md:text-xl font-bold">{content}</div> {/* Adjusted font size */}
        </CardContent>
      </Card>
    );
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">
          GitHub Statistics Overview
        </h2>
        <p className="text-sm mb-4 text-neutral-600 dark:text-neutral-400">
          Drag and drop to reorder your statistics cards.
        </p>
        <Separator className="mb-6 bg-neutral-200 dark:bg-neutral-800" />
      </motion.div>

      {blocks.length > 0 || (loadingStats && sessionStatus === 'authenticated') ? (
        <DndContext
          sensors={dndSensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={rectSortingStrategy}
          >
            {/* Ensure this grid layout and gap are what you desire with smaller cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {blocks.map((b, index) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.5 + index * 0.05, // Stagger animation
                  }}
                >
                  {/* IMPORTANT: Ensure SortableStatBlock applies similar "smaller" styling */}
                  {/* (padding, font sizes) as defined in renderActiveBlockOverlay */}
                  <SortableStatBlock block={b} isDragging={activeBlockId === b.id} />
                </motion.div>
              ))}
              {/* Skeletons for initial loading, adjusted for smaller size */}
              {loadingStats && blocks.length === 0 && sessionStatus === 'authenticated' &&
                Array(6).fill(0).map((_, i) => ( // Show 6 skeletons for 2/3 col layout
                  <Card key={`stat-skeleton-${i}`} className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    {/* Adjusted padding in CardHeader */}
                    <CardHeader className="pb-1.5 pl-4 pr-3 pt-3">
                      <div className="flex items-center gap-2.5">
                        {/* Adjusted skeleton icon size */}
                        <Skeleton className="h-8 w-8 rounded-md bg-neutral-300 dark:bg-neutral-700" /> {/* Matches p-2 icon container with h-4 icon */}
                        {/* Adjusted skeleton title size */}
                        <Skeleton className="h-3.5 w-20 bg-neutral-300 dark:bg-neutral-700" />
                      </div>
                    </CardHeader>
                    {/* Adjusted padding in CardContent */}
                    <CardContent className="pl-4 pr-3 pb-3 pt-0.5">
                      {/* Adjusted skeleton content size */}
                      <Skeleton className="h-6 w-12 bg-neutral-300 dark:bg-neutral-700" />
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </SortableContext>
          <DragOverlay>
            {activeBlockId && activeBlockData ? renderActiveBlockOverlay() : null}
          </DragOverlay>
        </DndContext>
      ) : (
        !loadingStats && !error && userProfile === null && sessionStatus === "authenticated" && ( // Check userProfile for more accurate message
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            No statistics found for this user.
          </p>
        )
      )}
      {/* Show a message if there's an error and no blocks, even if not loading */}
      {!loadingStats && error && blocks.length === 0 && (
        <p className="text-center text-red-500 dark:text-red-400 py-8">
          Could not load statistics. {error.includes("rate limit") ? "GitHub API rate limit likely exceeded." : ""}
        </p>
      )}
    </>
  );
}
