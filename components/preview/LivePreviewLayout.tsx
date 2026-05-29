"use client";
import React from 'react'
import { motion } from 'framer-motion'
import { ProjectCardPreview } from './ProjectCardPreview'

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

export function LivePreviewLayout({ draft, children }: { draft: DraftPreview | null; children: React.ReactNode }) {
  const hasAnyField = !!(draft?.title?.trim() || draft?.category?.trim() || draft?.description?.trim() || draft?.preview?.trim() || draft?.date?.trim())
  const isPreview = !!draft && hasAnyField

  if (!isPreview) return <>{children}</>

  return (
    <div>
      <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        Project Card Live Preview
      </p>
      <ProjectCardPreview draft={draft} />
    </div>
  )
}
