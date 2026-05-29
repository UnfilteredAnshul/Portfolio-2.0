"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { stripHtml } from '../../lib/format-date'
import { AnimatedSkeleton, TextSkeleton } from './AnimatedSkeleton'
import { ImageEditor } from './ImageEditor'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay, DragStartEvent, DragEndEvent, MeasuringStrategy,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, horizontalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraftPreview {
  title?: string
  category?: string
  description?: string
  preview?: string
  date?: string
  pinned?: boolean
  video?: string
  screenshots?: string[]
}

interface UploadedFile {
  name: string
  size: number
  url: string
  fileId: string
  type: string
  thumbnail?: string
}

function FilmstripItem({
  file, index, activeIndex, total, onPositionChange, onSelect,
}: {
  file: UploadedFile
  index: number
  activeIndex: number
  total: number
  onPositionChange: (index: number, pos: number) => void
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.url })
  const [inputVal, setInputVal] = useState(String(index + 1))
  useEffect(() => { setInputVal(String(index + 1)) }, [index])

  const commitPosition = () => {
    const val = parseInt(inputVal, 10)
    if (!isNaN(val) && val >= 1 && val <= total && val !== index + 1) onPositionChange(index, val)
    else setInputVal(String(index + 1))
  }

  return (
    <div ref={setNodeRef} {...attributes} style={{
      transform: CSS.Transform.toString(transform),
      transition: transition ?? undefined,
      opacity: isDragging ? 0.3 : 1,
      position: 'relative',
      zIndex: isDragging ? 10 : 1,
      display: 'flex', alignItems: 'center', gap: '0.25rem',
      padding: '3px 5px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
      border: index === activeIndex ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
      background: index === activeIndex ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
    }} onClick={onSelect}>
      <span {...listeners} style={{
        color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', cursor: 'grab',
        padding: '2px', touchAction: 'none', lineHeight: 1,
      }}>⠿</span>
      <input type="number" min={1} max={total} value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={commitPosition}
        onKeyDown={(e) => { if (e.key === 'Enter') commitPosition() }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 28, padding: '2px 4px', background: 'rgba(255,255,255,0.08)',
          border: index === activeIndex ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px', color: '#fff', fontSize: '0.7rem', fontWeight: 600,
          textAlign: 'center', outline: 'none',
          MozAppearance: 'textfield', appearance: 'textfield',
        }} />
      {file.type?.startsWith('video/') ? (
        <div style={{
          position: 'relative', width: 34, height: 26, borderRadius: '4px',
          overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.08)',
        }}>
          {file.thumbnail ? (
            <img src={file.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : null}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.45rem', color: '#fff',
            }}>▶</div>
          </div>
        </div>
      ) : (
        <img src={file.url} alt=""
          style={{ width: 34, height: 26, borderRadius: '4px', objectFit: 'cover', flexShrink: 0, background: '#111' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
      )}
    </div>
  )
}

export function FullProjectPreview({ draft, uploadedFiles = [], onMediaReorder }: {
  draft: DraftPreview
  uploadedFiles?: UploadedFile[]
  onMediaReorder?: (files: UploadedFile[]) => void
}) {
  const { title, category, description, preview, date, pinned } = draft ?? {}

  const mediaItems = useMemo(() => {
    const items: { type: 'image' | 'video'; src: string }[] = []
    if (preview?.trim()) items.push({ type: 'image', src: preview })
    if (draft?.screenshots) draft.screenshots.forEach((s) => items.push({ type: 'image', src: s }))
    if (draft?.video?.trim()) items.push({ type: 'video', src: draft.video })
    return items
  }, [preview, draft?.screenshots, draft?.video])

  const [currentIndex, setCurrentIndex] = useState(0)
  const current = mediaItems[currentIndex]

  const activeUploadedIndex = useMemo(() => {
    const item = mediaItems[currentIndex]
    if (!item) return 0
    return uploadedFiles.findIndex(f => f.url === item.src)
  }, [currentIndex, mediaItems, uploadedFiles])

  const prev = useCallback(() => setCurrentIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length), [mediaItems.length])
  const next = useCallback(() => setCurrentIndex((i) => (i + 1) % mediaItems.length), [mediaItems.length])

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const showFilmstrip = uploadedFiles.length > 1 && !!onMediaReorder

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const oldIdx = uploadedFiles.findIndex((f) => f.url === active.id)
      const newIdx = uploadedFiles.findIndex((f) => f.url === over.id)
      if (oldIdx !== -1 && newIdx !== -1) {
        const next = arrayMove(uploadedFiles, oldIdx, newIdx)
        const movedUrl = uploadedFiles[oldIdx].url
        onMediaReorder?.(next)
        const movedFile = next.find(f => f.url === movedUrl)
        const imagesInNext = next.filter(f => !f.type?.startsWith('video/'))
        if (movedFile?.type?.startsWith('video/')) {
          setCurrentIndex(imagesInNext.length)
        } else {
          setCurrentIndex(imagesInNext.findIndex(f => f.url === movedUrl))
        }
      }
    }
    setActiveDragId(null)
  }, [uploadedFiles, onMediaReorder])

  const handlePositionChange = useCallback((index: number, newPos: number) => {
    const clamped = Math.max(1, Math.min(uploadedFiles.length, newPos))
    if (clamped === index + 1) return
    const next = arrayMove(uploadedFiles, index, clamped - 1)
    const movedUrl = uploadedFiles[index].url
    onMediaReorder?.(next)
    setCurrentIndex(next.findIndex((f) => f.url === movedUrl))
  }, [uploadedFiles, onMediaReorder])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
      style={{
        width: '100%',
        height: '75vh',
        background: '#0a0a0a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <style>{`
        .pvw-desc-scrollbar::-webkit-scrollbar { width: 4px; }
        .pvw-desc-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .pvw-desc-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .pvw-filmstrip::-webkit-scrollbar { height: 2px; }
        .pvw-filmstrip::-webkit-scrollbar-track { background: transparent; }
        .pvw-filmstrip::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        .pvw-filmstrip input[type=number]::-webkit-inner-spin-button,
        .pvw-filmstrip input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <div style={{ flex: 2, overflow: 'hidden', position: 'relative', background: '#111', minHeight: 0 }}>
        {current ? (
          current.type === 'video' ? (
            <iframe key={current.src} src={`https://drive.google.com/file/d/${current.src.match(/[?&]id=([^&]+)/)?.[1] || ''}/preview`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media" allowFullScreen />
          ) : (
            <ImageEditor src={current.src} alt={title || ''} />
          )
        ) : (
          <AnimatedSkeleton height="100%" borderRadius="0" />
        )}

        {mediaItems.length > 1 && (
          <>
            <button onMouseDown={(e) => { e.stopPropagation(); prev() }}
              style={{
                position: 'absolute', left: '1rem', top: 'calc(50% + 24px)', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)',
              }}>◀</button>
            <button onMouseDown={(e) => { e.stopPropagation(); next() }}
              style={{
                position: 'absolute', right: '1rem', top: 'calc(50% + 24px)', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)',
              }}>▶</button>
          </>
        )}
      </div>

      {showFilmstrip && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={(e: DragStartEvent) => setActiveDragId(String(e.active.id))}
          onDragEnd={handleDragEnd}>
          <SortableContext items={uploadedFiles.map((f) => f.url)} strategy={horizontalListSortingStrategy}>
            <div className="pvw-filmstrip" style={{
              background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '0.35rem 0.5rem',
              display: 'flex', gap: '0.25rem', alignItems: 'center', overflowX: 'auto',
            }}>
              {uploadedFiles.map((file, i) => (
                <FilmstripItem key={file.url} file={file} index={i} activeIndex={activeUploadedIndex} total={uploadedFiles.length}
                  onPositionChange={handlePositionChange}
                  onSelect={() => {
                    const images = uploadedFiles.filter(f => !f.type?.startsWith('video/'))
                    if (file.type?.startsWith('video/')) setCurrentIndex(images.length)
                    else setCurrentIndex(images.findIndex(f => f.url === file.url))
                  }} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeDragId ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '3px 5px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>⠿</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>
                  {uploadedFiles.findIndex((f) => f.url === activeDragId) + 1}
                </span>
                <div style={{ width: 34, height: 26, borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }} />
              </motion.div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="pvw-desc-scrollbar" style={{
        padding: '1.5rem 2rem', overflowY: 'auto', flex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
          {title?.trim() ? (
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', margin: 0 }}>
              {title}
            </h2>
          ) : (
            <TextSkeleton width="50%" height={24} />
          )}
          {category?.trim() && (
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {category}
            </span>
          )}
        </div>

        {description?.trim() ? (
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}
            dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TextSkeleton width="100%" height={12} />
            <TextSkeleton width="95%" height={12} />
            <TextSkeleton width="80%" height={12} />
            <TextSkeleton width="60%" height={12} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
