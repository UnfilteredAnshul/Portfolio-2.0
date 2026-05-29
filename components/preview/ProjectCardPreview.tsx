"use client";
import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { stripHtml } from '../../lib/format-date'
import { AnimatedSkeleton, TextSkeleton } from './AnimatedSkeleton'
import { ImageEditor } from './ImageEditor'

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

export function ProjectCardPreview({ draft }: { draft: DraftPreview }) {
  const [hovered, setHovered] = useState(false)
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

  const prev = useCallback(() => setCurrentIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length), [mediaItems.length])
  const next = useCallback(() => setCurrentIndex((i) => (i + 1) % mediaItems.length), [mediaItems.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(10, 10, 10, 0.8)',
        border: hovered ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        width: 385,
      }}>
      <div style={{ height: 220, background: '#111', overflow: 'hidden', position: 'relative' }}>
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
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
          }}>
            <button onMouseDown={(e) => { e.stopPropagation(); prev() }}
              style={{
                position: 'absolute', left: '0.5rem', top: 'calc(50% + 24px)', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', width: '28px', height: '28px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)', pointerEvents: 'auto',
                padding: 0,
              }}>◀</button>
            <button onMouseDown={(e) => { e.stopPropagation(); next() }}
              style={{
                position: 'absolute', right: '0.5rem', top: 'calc(50% + 24px)', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', width: '28px', height: '28px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)', pointerEvents: 'auto',
                padding: 0,
              }}>▶</button>
          </div>
        )}

        {mediaItems.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '0.35rem', zIndex: 10,
          }}>
            {mediaItems.map((_, i) => (
              <div key={i} onMouseDown={(e) => { e.stopPropagation(); setCurrentIndex(i) }}
                style={{
                  width: i === currentIndex ? '16px' : '6px', height: '3px',
                  borderRadius: '2px', background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s', cursor: 'pointer',
                }} />
            ))}
          </div>
        )}

        {pinned && (
          <span style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem',
            padding: '4px 10px', background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff', fontSize: '0.65rem', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            borderRadius: '4px', backdropFilter: 'blur(4px)', zIndex: 10,
          }}>
            Pinned
          </span>
        )}
      </div>

      <div style={{ padding: '1.25rem' }}>
        {title?.trim() ? (
          <strong style={{ fontSize: '1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: '#fff' }}>
            {title}
          </strong>
        ) : (
          <TextSkeleton width="75%" height={16} />
        )}

        {description?.trim() ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
            {stripHtml(description).slice(0, 80)}{stripHtml(description).length > 80 ? '...' : ''}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <TextSkeleton width="100%" height={12} />
            <TextSkeleton width="85%" height={12} />
          </div>
        )}

        {(category?.trim() || date?.trim()) ? (
          <span style={{
            display: 'inline-block', marginTop: '0.75rem',
            padding: '4px 10px', background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem',
            textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '4px',
          }}>
            {category || 'Category'} {date ? `• ${formatDatePreview(date)}` : ''}
          </span>
        ) : (
          <div style={{ marginTop: '0.75rem' }}>
            <AnimatedSkeleton width={100} height={24} borderRadius="4px" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function formatDatePreview(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 2) return dateStr
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const m = parseInt(parts[1], 10)
  if (m < 1 || m > 12) return dateStr
  return `${months[m - 1]}, ${parts[0]}`
}
