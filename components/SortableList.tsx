"use client";
import React, { CSSProperties, ReactNode, createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
  DragOverlay, DragStartEvent, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Listeners = Record<string, (e: any) => void>

const ListenersContext = createContext<Listeners | null>(null)

/* ───────────── Sortable Item Wrapper ───────────── */
interface SortableItemProps {
  id: string
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export function SortableItem({ id, children, style, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const base: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : 1,
    ...style,
  }
  return (
    <ListenersContext.Provider value={listeners as unknown as Listeners}>
      <div ref={setNodeRef} style={base} className={className} {...attributes}>
        {children}
      </div>
    </ListenersContext.Provider>
  )
}

/* ───────────── Drag Handle ───────────── */
const handleStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.3)',
  fontSize: '0.85rem',
  lineHeight: 1,
  cursor: 'grab',
  padding: '4px',
  background: 'none',
  border: 'none',
  touchAction: 'none',
}

export function DragHandle(props: { style?: CSSProperties }) {
  const listeners = useContext(ListenersContext)
  return <span {...listeners} style={{ ...handleStyle, ...props.style }}>⠿</span>
}

/* ───────────── Ghost / DragOverlay ───────────── */
interface OverlayProps {
  id: string | null
  children: (id: string) => ReactNode
}

export function SortableOverlay({ id, children }: OverlayProps) {
  return (
    <DragOverlay dropAnimation={null}>
      {id ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)', borderRadius: '12px' }}
        >
          {children(id)}
        </motion.div>
      ) : null}
    </DragOverlay>
  )
}

/* ───────────── Sortable List Container ───────────── */
interface SortableListProps {
  ids: string[]
  onReorder: (activeId: string, overId: string) => void
  children: ReactNode
  onDragStart?: (id: string) => void
  onDragEnd?: () => void
}

export function SortableList({ ids, onReorder, children, onDragStart, onDragEnd }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (e: DragStartEvent) => {
    onDragStart?.(String(e.active.id))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
    onDragEnd?.()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}
