// components/dashboard/SortablePRListItem.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PRListItem } from "./PRListItem";
import type { VirtualizedPRItem } from "./types";

interface SortablePRListItemProps {
  item: VirtualizedPRItem;
}

export function SortablePRListItem({ item }: SortablePRListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // use isDragging from useSortable
  } = useSortable({ id: item.id_str });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease-in-out",
  };

  return (
    <PRListItem
      ref={setNodeRef}
      style={style}
      item={item}
      isDragging={isDragging} // Pass isDragging state
      {...attributes}
      {...listeners}
    />
  );
}
