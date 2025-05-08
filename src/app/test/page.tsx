"use client"
import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useVirtualizer } from "@tanstack/react-virtual"
import { GripVertical, GitPullRequest, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// --- LocalStorage Key ---
const STORAGE_KEY = "virtualizedSortedPRList"

// --- Default Data (Fallback) ---
const initialDummyPRs = Array.from({ length: 200 }, (_, i) => ({
  id: `pr-${i + 1}`,
  title: `Improve performance of feature ${i + 1}`,
  author: `user${i % 10}`,
  status: i % 4 === 0 ? "open" : i % 4 === 1 ? "review" : i % 4 === 2 ? "approved" : "merged",
  date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
}))

// --- Status Badge Component ---
function StatusBadge({ status }) {
  const statusConfig = {
    open: { label: "Open", variant: "outline" },
    review: { label: "In Review", variant: "secondary" },
    approved: { label: "Approved", variant: "default" },
    merged: { label: "Merged", variant: "success" },
  }

  const config = statusConfig[status] || statusConfig.open

  return (
    <Badge
      variant={config.variant}
      className={cn(
        status === "merged" && "bg-green-500 hover:bg-green-600",
        status === "approved" && "bg-blue-500 hover:bg-blue-600",
      )}
    >
      {config.label}
    </Badge>
  )
}

// --- Reusable Item Component ---
function Item({ item, isDragging, isOverlay, style, forwardedRef, ...props }) {
  const itemStyle = {
    ...style,
    opacity: isDragging && !isOverlay ? 0.5 : 1,
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div
      ref={forwardedRef}
      style={itemStyle}
      className={cn(
        "w-full h-[90px] box-border transition-all duration-200",
        isDragging && !isOverlay ? "z-10" : "",
        isOverlay ? "z-50" : "",
      )}
      {...(!isOverlay ? props : {})}
    >
      <Card
        className={cn(
          "h-full border shadow-sm hover:shadow transition-all duration-200",
          isDragging && !isOverlay ? "ring-2 ring-primary/20 bg-primary/5" : "",
          isOverlay ? "shadow-lg bg-background border-primary/20" : "",
        )}
      >
        <CardContent className="p-0 h-full">
          <div className="flex items-center h-full px-4 gap-3">
            <div
              className={cn(
                "flex items-center justify-center h-full cursor-grab active:cursor-grabbing",
                isOverlay ? "cursor-grabbing" : "",
              )}
              {...(!isOverlay ? props : {})}
            >
              <GripVertical className="text-muted-foreground h-5 w-5" />
            </div>

            <div className="flex-shrink-0">
              <GitPullRequest className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-grow min-w-0">
              <div className="font-medium text-sm truncate">{item.title}</div>
              <div className="text-xs text-muted-foreground mt-1">#{item.id}</div>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{item.date}</span>
                </div>

                <StatusBadge status={item.status} />
              </div>
            </div>

            <div className="flex-shrink-0 ml-auto">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(item.author)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- SortableItem Component ---
function SortableItem({ item, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    pointerEvents: isDragging ? "none" : "auto",
    width: "100%",
    height: "100%",
  }

  return (
    <Item
      forwardedRef={setNodeRef}
      style={style}
      item={item}
      isDragging={isDragging}
      isOverlay={false}
      {...attributes}
      {...listeners}
    />
  )
}

// --- Main Page Component ---
export default function TestPage() {
  const [items, setItems] = useState(initialDummyPRs)
  const [activeId, setActiveId] = useState(null)
  const parentRef = useRef(null) // Ref for the scrollable container

  // --- LocalStorage Load/Save Hooks ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedItems = localStorage.getItem(STORAGE_KEY)
        if (storedItems) {
          const parsedItems = JSON.parse(storedItems)
          if (Array.isArray(parsedItems)) {
            setItems(parsedItems)
            console.log("Loaded item order from localStorage.")
          } else {
            console.warn("Invalid data found in localStorage, using default.")
          }
        } else {
          console.log("No previous state found in localStorage, using default.")
        }
      } catch (error) {
        console.error("Failed to load or parse items from localStorage:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Failed to save items to localStorage:", error)
      }
    }
  }, [items])

  // --- Active Item Memo ---
  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [activeId, items])

  // --- Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  )

  // --- Virtualizer ---
  const ITEM_HEIGHT = 98 // Increased height for the new card design (90px + padding)
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  // --- Drag Handlers ---
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id)
        const newIndex = currentItems.findIndex((item) => item.id === over.id)

        if (oldIndex === -1 || newIndex === -1) {
          console.warn("Could not find items for drag and drop.")
          return currentItems
        }
        return arrayMove(currentItems, oldIndex, newIndex)
      })
    }
  }, [])

  // --- Virtual Items Calculation ---
  const virtualItems = rowVirtualizer.getVirtualItems()

  // --- Drop Animation ---
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  }

  // --- Render Logic ---
  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pull Requests</h1>
            <p className="text-slate-500 mt-1">Drag and drop to reorder, changes are saved automatically</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {items.length} PRs
          </Badge>
        </div>

        {/* Scrollable Container */}
        <div ref={parentRef} className="max-h-[700px] w-full overflow-auto rounded-lg border bg-white shadow-sm">
          {/* DndContext */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
            measuring={{
              droppable: { strategy: MeasuringStrategy.Always },
            }}
          >
            {/* SortableContext */}
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {/* Virtualizer Height Container */}
              <div className="relative w-full p-2" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
                {/* Render Virtual Items */}
                {virtualItems.map((virtualRow) => {
                  const item = items[virtualRow.index]
                  if (!item) return null // Safety check

                  const wrapperStyle = {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    padding: "4px",
                  }

                  return (
                    <div key={item.id} style={wrapperStyle} data-index={virtualRow.index}>
                      <SortableItem item={item} index={virtualRow.index} />
                    </div>
                  )
                })}
              </div>
            </SortableContext>

            {/* DragOverlay */}
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem ? (
                <div style={{ width: "100%", padding: "4px" }}>
                  <Item item={activeItem} isDragging isOverlay />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </main>
  )
}

