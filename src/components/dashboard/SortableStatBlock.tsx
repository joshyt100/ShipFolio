// components/dashboard/SortableStatBlock.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block } from "@/app/dashboard/types";

interface SortableStatBlockProps {
  block: Block;
  isDragging?: boolean; // To indicate if this specific block is the one being dragged by DragOverlay
  // isOver is provided by useSortable for drop target indication
}

export function SortableStatBlock({ block, isDragging: isBeingDraggedByOverlay }: SortableStatBlockProps) {
  const { id, title, content, icon: blockIcon, colorIndex } = block;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // This is true when this item is the source of a drag operation
    isOver,     // This is true when a draggable is over this sortable item
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease",
    touchAction: "none", // Recommended for draggable items
    opacity: isDragging ? 0.7 : 1, // Style for the original item when it's being dragged
    zIndex: isDragging ? 1000 : "auto", // Ensure dragging item is on top
  };

  const safeColorIndex = colorIndex % 3; // Ensure it's 0, 1, or 2
  let gradientClasses = "";
  let iconContainerClasses = "";

  if (safeColorIndex === 0) {
    // Neutral
    gradientClasses =
      "from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700";
    iconContainerClasses =
      "bg-gradient-to-br from-neutral-600 to-neutral-800 text-white dark:from-neutral-400 dark:to-neutral-100 dark:text-black";
  } else if (safeColorIndex === 1) {
    // Sky
    gradientClasses =
      "from-sky-200 to-sky-300 dark:from-sky-800 dark:to-sky-700";
    iconContainerClasses =
      "bg-gradient-to-br from-sky-600 to-sky-800 text-white dark:from-sky-400 dark:to-sky-100 dark:text-black";
  } else {
    // Emerald
    gradientClasses =
      "from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700";
    iconContainerClasses =
      "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white dark:from-emerald-400 dark:to-emerald-100 dark:text-black";
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}> {/* attributes for sortable, not listeners */}
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300 group",
          "bg-white border-neutral-200 text-neutral-900",
          "dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100",
          isBeingDraggedByOverlay // Use the prop for overlay-specific styling if needed
            ? "ring-2 ring-blue-500 shadow-2xl dark:ring-blue-400" // Style if this is the item in overlay
            : isDragging // Style for the source item when it is being dragged
              ? "ring-1 ring-blue-400 opacity-70 shadow-lg" // Original item style when dragging
              : "shadow-md dark:shadow-black/40",
          isOver && !isDragging && "ring-1 ring-neutral-400 dark:ring-neutral-500", // Highlight drop target
          "hover:shadow-xl dark:hover:shadow-black/50"
        )}
      >
        <div
          {...listeners} // listeners for the drag handle
          className="absolute top-1.5 right-1.5 p-1.5 cursor-grab active:cursor-grabbing touch-none z-10 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
          aria-label="Drag stat card"
        >
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <GripVertical className="h-5 w-5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-white border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200"
              >
                Drag to reorder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div
          className={cn(
            "absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b",
            gradientClasses
          )}
        />
        <CardHeader className="pb-2 pl-5 pr-10 pt-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-lg shadow-md",
                iconContainerClasses
              )}
            >
              {blockIcon}
            </div>
            <CardTitle className="text-sm font-semibold md:text-base">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pl-5 pr-10 pb-4 pt-1">
          <div className="text-2xl md:text-3xl font-bold">{content}</div>
        </CardContent>
      </Card>
    </div>
  );
}
