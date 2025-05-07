// components/dashboard/VirtualizedPRList.tsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GitPullRequest } from "lucide-react";
import { SortablePRListItem } from "./SortablePRListItem";
import { PRListItem } from "./PRListItem"; // For DragOverlay
import type { PullRequest, VirtualizedPRItem } from "@/app/dashboard/types";
import { PR_LIST_STORAGE_KEY, PR_ITEM_ESTIMATED_HEIGHT } from "@/app/dashboard/types";


interface VirtualizedPRListProps {
  pullRequests: PullRequest[];
  isLoading: boolean;
  usernameForEmptyMessage: string;
}

export function VirtualizedPRList({
  pullRequests,
  isLoading,
  usernameForEmptyMessage,
}: VirtualizedPRListProps) {
  const [orderedPRs, setOrderedPRs] = useState<VirtualizedPRItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newVirtualizedPRs = pullRequests.map((pr) => ({
      ...pr,
      id_str: pr.id.toString(),
    }));

    if (typeof window !== "undefined") {
      try {
        const storedOrderJSON = localStorage.getItem(PR_LIST_STORAGE_KEY);
        if (storedOrderJSON) {
          const storedIDs: string[] = JSON.parse(storedOrderJSON);
          const prMap = new Map(
            newVirtualizedPRs.map((pr) => [pr.id_str, pr])
          );
          const sortedByStoredOrder: VirtualizedPRItem[] = storedIDs.flatMap(
            (id) => {
              const prItem = prMap.get(id);
              if (prItem) {
                prMap.delete(id); // Remove from map to avoid duplicates
                return [prItem];
              }
              return [];
            }
          );
          // Add any new PRs not in stored order to the end
          setOrderedPRs([...sortedByStoredOrder, ...Array.from(prMap.values())]);
        } else {
          setOrderedPRs(newVirtualizedPRs);
        }
      } catch (e) {
        console.error("LocalStorage PR order read error:", e);
        setOrderedPRs(newVirtualizedPRs); // Fallback to fetched order
      }
    } else {
      // SSR or environment without localStorage
      setOrderedPRs(newVirtualizedPRs);
    }
  }, [pullRequests]);

  useEffect(() => {
    if (orderedPRs.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          PR_LIST_STORAGE_KEY,
          JSON.stringify(orderedPRs.map((pr) => pr.id_str))
        );
      } catch (e) {
        console.error("LocalStorage PR order write error:", e);
      }
    }
  }, [orderedPRs]);

  const activeItem = useMemo(
    () => orderedPRs.find((pr) => pr.id_str === activeId),
    [activeId, orderedPRs]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );

  const rowVirtualizer = useVirtualizer({
    count: orderedPRs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => PR_ITEM_ESTIMATED_HEIGHT,
    overscan: 5,
    paddingEnd: 8, // Add some padding at the end of the virtual list
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setOrderedPRs((items) => {
        const oldIdx = items.findIndex((i) => i.id_str === active.id);
        const newIdx = items.findIndex((i) => i.id_str === over.id);
        return oldIdx !== -1 && newIdx !== -1
          ? arrayMove(items, oldIdx, newIdx)
          : items;
      });
    }
  }, []);

  const handleDragCancel = useCallback(() => setActiveId(null), []);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.7", transform: "scale(1.02)" } },
    }),
    duration: 250,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  };

  const virtualItems = rowVirtualizer.getVirtualItems();

  if (isLoading)
    return (
      <div className="space-y-3 px-2">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-[120px] w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    );

  if (!isLoading && orderedPRs.length === 0)
    return (
      <Card className="bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-6 text-center">
          <GitPullRequest className="h-12 w-12 mx-auto mb-3 text-neutral-400 dark:text-neutral-600" />
          <p className="text-lg font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            No Pull Requests
          </p>
          <p className="text-neutral-500 dark:text-neutral-400">
            {usernameForEmptyMessage
              ? `No recent pull requests found for ${usernameForEmptyMessage}.`
              : "No pull requests to display."}
          </p>
        </CardContent>
      </Card>
    );

  return (
    <div
      ref={parentRef}
      className="max-h-[calc(3.5*128px)] min-h-[128px] w-full overflow-auto rounded-lg border bg-neutral-100/60 border-neutral-300 dark:bg-black/30 dark:border-neutral-800 scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent scrollbar-thumb-neutral-400 hover:scrollbar-thumb-neutral-500 dark:scrollbar-thumb-neutral-700 dark:hover:scrollbar-thumb-neutral-600"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} // Important for virtualized lists
      >
        <SortableContext
          items={orderedPRs.map((pr) => pr.id_str)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow: VirtualItem) => {
              const item = orderedPRs[virtualRow.index];
              if (!item) return null; // Should not happen if count is correct
              return (
                <div
                  key={item.id_str}
                  className="px-2" // Add horizontal padding for each item wrapper
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <SortablePRListItem item={item} />
                </div>
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId && activeItem ? (
            <div className="px-2 w-full" style={{ height: `${PR_ITEM_ESTIMATED_HEIGHT}px` }}>
              <PRListItem item={activeItem} isDragging isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
