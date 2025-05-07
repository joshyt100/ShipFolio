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
import { SortableStatBlock } from "./SortableStatBlock";
import { cn } from "@/lib/utils";
import type { Block, UserProfile } from "@/app/dashboard/types";
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
  activeBlockData: Block | undefined; // The actual data for the block being dragged (for overlay)
  currentUsername: string;
  error: string | null;
  userProfile: UserProfile | null; // For "No statistics to display" message
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
      )}
      >
        <div className={cn("absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b", gradientClasses)} />
        <CardHeader className="pb-2 pl-5 pr-4 pt-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-lg shadow-md", iconContainerClasses)}>
              {icon}
            </div>
            <CardTitle className="text-sm font-semibold md:text-base">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pl-5 pr-4 pb-4 pt-1">
          <div className="text-2xl md:text-3xl font-bold">{content}</div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
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
                  <SortableStatBlock block={b} isDragging={activeBlockId === b.id} />
                </motion.div>
              ))}
              {/* Skeletons for initial loading of stats before blocks are populated */}
              {loadingStats && blocks.length === 0 && sessionStatus === 'authenticated' &&
                Array(5).fill(0).map((_, i) => (
                  <Card key={`stat-skeleton-${i}`} className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="pb-2 pl-5 pr-10 pt-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg bg-neutral-300 dark:bg-neutral-700" />
                        <Skeleton className="h-4 w-24 bg-neutral-300 dark:bg-neutral-700" />
                      </div>
                    </CardHeader>
                    <CardContent className="pl-5 pr-10 pb-4 pt-1">
                      <Skeleton className="h-8 w-16 bg-neutral-300 dark:bg-neutral-700" />
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
        !loadingStats && !error && !userProfile && sessionStatus === "authenticated" && (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            No statistics to display for this user, or user not found.
          </p>
        )
      )}
    </>
  );
}
