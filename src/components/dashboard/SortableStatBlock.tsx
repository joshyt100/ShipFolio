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
import type { Block } from "./types"; // Adjusted path if necessary

interface SortableStatBlockProps {
  block: Block;
  // isDragging prop (previously isBeingDraggedByOverlay) is removed as useSortable's isDragging is used.
}

export function SortableStatBlock({ block }: SortableStatBlockProps) {
  const { id, title, content, icon: blockIcon, colorIndex } = block;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // True when this item is the source of a drag operation
    isOver,     // True when a draggable is over this sortable item as a drop target
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease, opacity 250ms ease", // Added opacity to transition
    touchAction: "none",
    opacity: isDragging ? 0.65 : 1, // Slightly more transparent for source item
    zIndex: isDragging ? 1000 : "auto",
  };

  const safeColorIndex = colorIndex % 3;
  let gradientClasses = "";
  let iconContainerClasses = "";

  if (safeColorIndex === 0) { // Neutral
    gradientClasses = "from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700";
    iconContainerClasses = "bg-gradient-to-br from-neutral-600 to-neutral-800 text-white dark:from-neutral-400 dark:to-neutral-100 dark:text-black";
  } else if (safeColorIndex === 1) { // Sky
    gradientClasses = "from-sky-200 to-sky-300 dark:from-sky-800 dark:to-sky-700";
    iconContainerClasses = "bg-gradient-to-br from-sky-600 to-sky-800 text-white dark:from-sky-400 dark:to-sky-100 dark:text-black";
  } else { // Emerald
    gradientClasses = "from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700";
    iconContainerClasses = "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white dark:from-emerald-400 dark:to-emerald-100 dark:text-black";
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200 group h-full", // Added h-full for consistent height if in a CSS grid row
          "bg-white border-neutral-200 text-neutral-900",
          "dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100",
          isDragging
            ? "ring-1 ring-blue-500 shadow-lg" // Style for the source item (opacity handled by `style` prop)
            : "shadow-md dark:shadow-black/30", // Default shadow
          isOver && !isDragging && "ring-2 ring-sky-500 dark:ring-sky-400", // Highlight drop target
          "hover:shadow-lg dark:hover:shadow-black/40" // Slightly reduced hover shadow for subtlety
          // Consider min-height if content varies and you want a fixed minimum size
          // e.g., `min-h-[100px]` or `min-h-28`
        )}
      >
        {/* Drag Handle */}
        <div
          {...listeners}
          className="absolute top-1.5 right-1.5 p-1.5 cursor-grab active:cursor-grabbing touch-none z-20 rounded-md opacity-60 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sky-500 transition-opacity"
          aria-label="Drag stat card"
          tabIndex={0} // Make it focusable
        >
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Smaller Grip Icon */}
                <GripVertical className="h-4 w-4 text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200 transition-colors" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-white border-neutral-300 text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 text-xs"
              >
                Drag to reorder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Color Accent Bar */}
        <div
          className={cn(
            "absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b",
            gradientClasses
          )}
        />

        {/* Card Header: Adjusted padding, icon container, and title style */}
        <CardHeader className="pt-3 pb-1.5 pl-4 pr-8"> {/* pr-8 to give space for drag handle */}
          <div className="flex items-center gap-2.5"> {/* Reduced gap */}
            <div
              className={cn(
                "p-2 rounded-md shadow", // Reduced padding and rounding
                iconContainerClasses
              )}
            >
              {blockIcon} {/* Assumes icon is already sized (e.g. h-4 w-4 from DashboardPage) */}
            </div>
            <CardTitle className="text-xs font-medium md:text-sm"> {/* Adjusted font size & weight */}
              {title}
            </CardTitle>
          </div>
        </CardHeader>

        {/* Card Content: Adjusted padding and content text style */}
        <CardContent className="pt-0.5 pb-3 pl-4 pr-8"> {/* pr-8 to avoid text under handle, pt-0.5 for tighter spacing */}
          <div className="text-lg md:text-xl font-bold">{content}</div> {/* Adjusted font size */}
        </CardContent>
      </Card>
    </div>
  );
}
