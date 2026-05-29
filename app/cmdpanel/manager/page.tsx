"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { SortableList, SortableItem, SortableOverlay, DragHandle } from '../../../components/SortableList'
import raw from '../../../data/projects.json'
import Hero3D from '../../../components/Hero3D'
import { useCategories, saveCategories } from '../../../lib/use-categories'
import { formatDate, stripHtml, MONTH_NAMES } from '../../../lib/format-date'
import { FullProjectPreview } from '../../../components/preview/FullProjectPreview'
import { ProjectCardPreview } from '../../../components/preview/ProjectCardPreview'

const data = raw as Project[]
type Project = {
  id: string
  title: string
  description: string
  preview: string
  pinned: boolean
  category: string
  screenshots: string[]
  video?: string
  date: string
  projectFolderId?: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'all 0.3s ease'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: '8px'
}

const errorTextStyle: React.CSSProperties = {
  color: '#ff4444',
  fontSize: '0.7rem',
  marginTop: '4px',
  fontWeight: 500
}

const clearBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.3)',
  cursor: 'pointer',
  fontSize: '0.85rem',
  padding: '4px 6px',
  lineHeight: 1,
  flexShrink: 0,
  transition: 'color 0.2s',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function extractFileId(url: string): string {
  const m = url.match(/[?&]id=([^&]+)/)
  return m ? m[1] : ''
}

function captureVideoFrame(videoUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.src = videoUrl

    let done = false
    const finish = (dataUrl: string) => { if (!done) { done = true; resolve(dataUrl) } }

    video.onloadeddata = () => { video.currentTime = Math.min(1, (video.duration || 2) * 0.3) }
    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 160
      canvas.height = 90
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0, 160, 90)
      finish(canvas.toDataURL('image/jpeg', 0.5))
    }
    video.onerror = () => finish('')
    setTimeout(() => finish(''), 8000)
  })
}

function mergeSourceProjects(saved: Project[]): Project[] {
  const seen = new Set<string>()
  const deduped = saved.filter((p) => { const k = p.id; if (seen.has(k)) return false; seen.add(k); return true })
  const savedIds = new Set(deduped.map((p) => p.id))
  const missing = (data as Project[]).filter((p) => !savedIds.has(p.id))
  return missing.length ? [...missing, ...deduped] : deduped
}

function useLocalProjects() {
  const [projects, setProjects] = useState<Project[]>(data as Project[])
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_projects')
    if (saved) {
      try {
        setProjects(mergeSourceProjects(JSON.parse(saved) as Project[]))
      } catch { /* ignore */ }
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects))
  }, [projects])
  return [projects, setProjects] as const
}

function validateDraft(d: Partial<Project> | null, uploadedFiles?: unknown[]): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!d) return errors
  if (!d.title?.trim()) errors.title = 'Title is required'
  if (!d.category?.trim()) errors.category = 'Category is required'
  if (!d.description?.trim()) errors.description = 'Description is required'
  if (!d.date?.trim()) errors.date = 'Date is required'
  else if (!/^\d{4}-\d{2}$/.test(d.date.trim())) errors.date = 'Use YYYY-MM format'
  if (!uploadedFiles?.length && !d.preview && !d.video) errors.media = 'At least one media file is required'
  return errors
}

function errorBorder(field: string, errors: Record<string, string>) {
  return errors[field] ? { border: '1px solid #ff4444' } : {}
}

/* ───────────── ProjectRow ───────────── */
function ProjectRow({ p, editingId, startEdit, showDeleteConfirm, setShowDeleteConfirm, remove, pinProject, unpinProject }: {
  p: Project
  editingId: string | null
  startEdit: (p: Project) => void
  showDeleteConfirm: string | null
  setShowDeleteConfirm: (id: string | null) => void
  remove: (id: string) => void
  pinProject: (id: string) => void
  unpinProject: (id: string) => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px',
      background: editingId === p.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: editingId === p.id ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <DragHandle style={{ cursor: 'grab', flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.title}</span>
            {p.pinned && (
              <span style={{ padding: '2px 8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Pinned</span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.category || 'No category'} • {formatDate(p.date)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <motion.button
          onClick={() => p.pinned ? unpinProject(p.id) : pinProject(p.id)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
          {p.pinned ? 'Unpin' : 'Pin'}
        </motion.button>
        <motion.button onClick={() => startEdit(p)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
          Edit
        </motion.button>

        {showDeleteConfirm === p.id ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <motion.button onClick={() => remove(p.id)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '8px 16px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              Confirm
            </motion.button>
            <motion.button onClick={() => setShowDeleteConfirm(null)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              Cancel
            </motion.button>
          </div>
        ) : (
          <motion.button onClick={() => setShowDeleteConfirm(p.id)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ padding: '8px 16px', background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            Delete
          </motion.button>
        )}
      </div>
    </div>
  )
}

/* ───────────── PinWarning modal ───────────── */
function PinWarning({ onContinue, onCancel }: { onContinue: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)'
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '90%'
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Max Pins Reached</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          You already have 4 pinned projects. The first pinned project will be unpinned to make room. Continue?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '10px 24px', background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onContinue}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '10px 24px', background: '#fff', color: '#000',
              border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
            }}
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ───────────── CategoryManager modal ───────────── */
function CategoryManager({
  categories, onSave, onClose
}: {
  categories: string[]
  onSave: (cats: string[]) => void
  onClose: () => void
}) {
  const [cats, setCats] = useState<string[]>([...categories])
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const addNew = () => {
    const name = prompt('Enter new category name:')
    if (name?.trim() && !cats.includes(name.trim())) {
      setCats([...cats, name.trim()])
    }
  }

  const startEdit = (i: number) => {
    setEditIndex(i)
    setEditValue(cats[i])
  }

  const confirmEdit = () => {
    if (editIndex === null) return
    const trimmed = editValue.trim()
    if (!trimmed) { setEditIndex(null); return }
    const next = [...cats]
    next[editIndex] = trimmed
    setCats(next)
    setEditIndex(null)
  }

  const removeCat = (i: number) => {
    setCats(cats.filter((_, idx) => idx !== i))
    setConfirmDelete(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)'
      }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '90%',
          maxHeight: '80vh', overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Manage Categories</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <SortableList ids={cats} onReorder={(a, b) => {
          const next = [...cats]
          const ai = cats.indexOf(a)
          const bi = cats.indexOf(b)
          const [m] = next.splice(ai, 1)
          next.splice(bi, 0, m)
          setCats(next)
        }} onDragStart={(id) => setDragId(id)} onDragEnd={() => setDragId(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {cats.map((c, i) => (
              <SortableItem key={c} id={c}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '10px 12px', background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px', userSelect: 'none',
                }}>
                  <DragHandle />

                  {editIndex === i ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={confirmEdit}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditIndex(null) }}
                      autoFocus
                      style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                  ) : (
                    <span style={{ flex: 1, fontSize: '0.85rem' }}>{c}</span>
                  )}

                  {editIndex !== i && (
                    <button onClick={() => startEdit(i)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px', lineHeight: 1 }}>
                      ✎
                    </button>
                  )}

                  {confirmDelete === i ? (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => removeCat(i)} style={{ padding: '4px 10px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>Confirm</button>
                      <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(i)} style={{ padding: '4px 10px', background: 'rgba(255,68,68,0.2)', color: '#ff4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>Delete</button>
                  )}
                </div>
              </SortableItem>
            ))}
          </div>
          <SortableOverlay id={dragId}>
            {(id) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '10px 12px', background: 'rgba(255,255,255,0.12)',
                borderRadius: '8px', backdropFilter: 'blur(8px)',
              }}>
                <DragHandle />
                <span style={{ fontSize: '0.85rem' }}>{id}</span>
              </div>
            )}
          </SortableOverlay>
        </SortableList>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
          <motion.button onClick={addNew} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            + Add Category
          </motion.button>
          <motion.button onClick={() => { onSave(cats); onClose() }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '10px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ───────────── DescriptionEditor modal ───────────── */
function DescriptionEditor({ value, onSave, onClose }: { value: string; onSave: (html: string) => void; onClose: () => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false })

  const checkFormat = () => {
    setFmt({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    })
  }

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0)
    }
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current)
    }
  }

  const applyFontSize = (px: string) => {
    restoreSelection()
    document.execCommand('fontSize', false, '7')
    if (editorRef.current) {
      const els = editorRef.current.querySelectorAll('font[size="7"]')
      els.forEach((el) => {
        const span = document.createElement('span')
        span.style.fontSize = `${px}px`
        span.innerHTML = el.innerHTML
        el.parentNode?.replaceChild(span, el)
      })
    }
    editorRef.current?.focus()
  }

  const applyFontName = (name: string) => {
    restoreSelection()
    document.execCommand('fontName', false, name)
    editorRef.current?.focus()
  }

  const FONTS = [
    { label: 'Sans-Serif', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
    { label: 'Monospace', value: '"Courier New", monospace' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Trebuchet', value: '"Trebuchet MS", sans-serif' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)'
      }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px', padding: '1.5rem', maxWidth: '700px', width: '90%', height: '60vh', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Edit Description</h3>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold'); checkFormat(); editorRef.current?.focus() }}
                style={{ padding: '6px 12px', background: fmt.bold ? '#fff' : 'rgba(255,255,255,0.1)', color: fmt.bold ? '#000' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1 }}>B</button>
              <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic'); checkFormat(); editorRef.current?.focus() }}
                style={{ padding: '6px 12px', background: fmt.italic ? '#fff' : 'rgba(255,255,255,0.1)', color: fmt.italic ? '#000' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontStyle: 'italic', fontSize: '0.8rem', lineHeight: 1 }}>I</button>
              <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline'); checkFormat(); editorRef.current?.focus() }}
                style={{ padding: '6px 12px', background: fmt.underline ? '#fff' : 'rgba(255,255,255,0.1)', color: fmt.underline ? '#000' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem', lineHeight: 1 }}>U</button>
              <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 0.25rem' }}>|</span>
              <select onMouseDown={saveSelection} onChange={(e) => applyFontSize(e.target.value)}
                style={{
                  padding: '6px 10px', background: 'rgba(255,255,255,0.05)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
                }}>
                {[12, 14, 16, 18, 24, 32].map((s) => (
                  <option key={s} value={s} style={{ background: '#1a1a1a', color: '#fff' }}>{s}px</option>
                ))}
            </select>
            <select onMouseDown={saveSelection} onChange={(e) => applyFontName(e.target.value)}
              style={{
                padding: '6px 10px', background: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer'
              }}>
              <option value="" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.5)' }}>Font</option>
              {FONTS.map((f) => (
                <option key={f.value} value={f.value} style={{ background: '#1a1a1a', color: '#fff', fontFamily: f.value }}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onMouseUp={checkFormat}
          onKeyUp={checkFormat}
          style={{
            flex: 1, overflowY: 'auto',
            padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#fff', fontSize: '0.9rem', lineHeight: 1.7,
            outline: 'none', whiteSpace: 'pre-wrap'
          }}
        />

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <motion.button onClick={onClose} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            Cancel
          </motion.button>
          <motion.button onClick={() => { onSave(editorRef.current?.innerHTML || ''); onClose() }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '10px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            Done
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ───────────── Main component ───────────── */
export default function AdminProjects() {
  const [projects, setProjects] = useLocalProjects()
  const [draft, setDraft] = useState<Partial<Project> | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const pageSessionKey = 'admin_page_session'
    if (new URLSearchParams(window.location.search).get('session') === 'new') {
      localStorage.setItem(pageSessionKey, '1')
      window.history.replaceState({}, '', '/cmdpanel/manager')
    } else if (!localStorage.getItem(pageSessionKey)) {
      fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/cmdpanel/login'
      return
    }
    const handleUnload = () => localStorage.removeItem(pageSessionKey)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        localStorage.removeItem(pageSessionKey)
        window.location.reload()
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const activeUploads = useRef(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPinWarning, setShowPinWarning] = useState(false)
  const [pendingPinId, setPendingPinId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const categories = useCategories()
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showDescriptionEditor, setShowDescriptionEditor] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [customOrder, setCustomOrder] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; size: number; url: string; fileId: string; type: string; thumbnail?: string}[]>([])
  const [uploadProgress, setUploadProgress] = useState<{loaded: number; total: number; fileCount: number} | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [activeMediaIdx, setActiveMediaIdx] = useState(0)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [driveTokenBad, setDriveTokenBad] = useState(false)
  const hasSynced = useRef(false)
  const pendingDeletions = useRef<Set<string>>(new Set())
  const progressMap = useRef<Map<string, {loaded: number; total: number}>>(new Map())

  const updateProgressDisplay = () => {
    const entries = [...progressMap.current.values()]
    const totalLoaded = entries.reduce((s, e) => s + e.loaded, 0)
    const totalTotal = entries.reduce((s, e) => s + e.total, 0)
    setUploadProgress(
      activeUploads.current > 0
        ? { loaded: totalLoaded, total: totalTotal, fileCount: activeUploads.current }
        : null
    )
  }

  // Delete orphaned uploads on tab close / navigate away
  useEffect(() => {
    const cleanup = () => {
      if (pendingDeletions.current.size === 0) return
      const blob = new Blob([JSON.stringify({ fileIds: [...pendingDeletions.current] })], { type: 'application/json' })
      navigator.sendBeacon('/api/delete-batch', blob)
    }
    window.addEventListener('beforeunload', cleanup)

    return () => {
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  useEffect(() => {
    if (hasSynced.current) return
    if (projects.length === 0) return

    const lastSync = localStorage.getItem('lastDriveSync')
    if (lastSync && Date.now() - Number(lastSync) < 3 * 60 * 60 * 1000) return

    hasSynced.current = true

    const allFileIds = projects.flatMap((p) => {
      const ids: string[] = []
      if (p.preview) { const id = extractFileId(p.preview); if (id) ids.push(id) }
      if (p.screenshots) p.screenshots.forEach((s) => { const id = extractFileId(s); if (id) ids.push(id) })
      if (p.video) { const id = extractFileId(p.video); if (id) ids.push(id) }
      return ids
    })

    if (allFileIds.length === 0) {
      localStorage.setItem('lastDriveSync', String(Date.now()))
      return
    }

    fetch('/api/drive/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileIds: allFileIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.missing?.length > 0) {
          setProjects((prev) =>
            prev.map((p) => {
              const next = { ...p } as any
              const pid = extractFileId(next.preview || '')
              if (pid && data.missing.includes(pid)) delete next.preview
              if (next.screenshots) {
                next.screenshots = next.screenshots.filter(
                  (s: string) => !(extractFileId(s) && data.missing.includes(extractFileId(s)))
                )
                if (!next.screenshots.length) delete next.screenshots
              }
              const vid = extractFileId(next.video || '')
              if (vid && data.missing.includes(vid)) delete next.video
              return next as Project
            })
          )
          setSyncMessage(`${data.missing.length} media file(s) were missing from Drive and have been removed.`)
          setTimeout(() => setSyncMessage(null), 8000)
        }
        localStorage.setItem('lastDriveSync', String(Date.now()))
      })
      .catch(() => setDriveTokenBad(true))
  }, [projects])

  useEffect(() => {
    fetch('/api/drive/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileIds: [] }),
    }).catch(() => setDriveTokenBad(true))
  }, [])

  const clearField = (field: string) => {
    setDraft((d) => {
      if (!d) return d
      const next = { ...d }
      delete (next as any)[field]
      return next
    })
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadError(null)

    for (let fi = 0; fi < files.length; fi++) {
      const file = files[fi]
      const uploadId = `${Date.now()}-${fi}-${Math.random().toString(36).slice(2, 6)}`

      activeUploads.current++
      updateProgressDisplay()

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const raw = base64.split(',')[1]
        const body = JSON.stringify({
          name: file.name,
          type: file.type,
          data: raw,
          category: draft?.category || '',
          title: draft?.title || '',
        })

        progressMap.current.set(uploadId, { loaded: 0, total: body.length })
        updateProgressDisplay()

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            progressMap.current.set(uploadId, { loaded: e.loaded, total: e.total })
            updateProgressDisplay()
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText)
              if (res.url) {
                const entry = { name: file.name, size: file.size, url: res.url, fileId: res.fileId || '', type: file.type }
                if (res.fileId) pendingDeletions.current.add(res.fileId)
                setUploadedFiles((prev) => [...prev, entry])
                setDraft((d) => {
                  const base = d ?? {}
                  if (file.type?.startsWith('video/')) {
                    if (!base.video) return { ...base, video: res.url }
                    return base
                  }
                  if (!base.preview) return { ...base, preview: res.url }
                  const screenshots = [...(base.screenshots ?? []), res.url]
                  return { ...base, screenshots }
                })
                if (file.type?.startsWith('video/') && res.fileId) {
                  const capturedFileId = res.fileId
                  const blobUrl = URL.createObjectURL(file)
                  captureVideoFrame(blobUrl).then((thumb) => {
                    URL.revokeObjectURL(blobUrl)
                    if (thumb) {
                      setUploadedFiles((prev) => prev.map((f) => f.fileId === capturedFileId ? { ...f, thumbnail: thumb } : f))
                    }
                  })
                }
              }
            } catch {}
          } else {
            try {
              const err = JSON.parse(xhr.responseText)
              console.error('Upload error response:', err)
              setUploadError(err?.error || `Upload failed (${xhr.status})`)
            } catch {
              console.error('Upload failed:', xhr.status, xhr.responseText?.slice(0, 200))
              setUploadError(`Upload failed (${xhr.status})`)
            }
          }
          progressMap.current.delete(uploadId)
          activeUploads.current--
          updateProgressDisplay()
        }
        xhr.onerror = () => {
          console.error('Upload XHR error')
          setUploadError('Network error — check console')
          progressMap.current.delete(uploadId)
          activeUploads.current--
          updateProgressDisplay()
        }
        xhr.open('POST', '/api/upload')
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(body)
      }
      reader.onerror = () => {
        console.error('FileReader error')
        setUploadError('Failed to read file')
        activeUploads.current--
        updateProgressDisplay()
      }
      reader.readAsDataURL(file)
    }
  }

  const removeUploadedFile = (index: number) => {
    const file = uploadedFiles[index]
    if (!file) return
    if (file.fileId) {
      pendingDeletions.current.delete(file.fileId)
      fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: file.fileId }) })
        .catch(() => {})
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setDraft((d) => {
      if (!d) return d
      if (file.type?.startsWith('video/')) {
        const next = { ...d }
        delete next.video
        return next
      }
      const remainingImages = uploadedFiles
        .filter((_, i) => i !== index && !uploadedFiles[i].type?.startsWith('video/'))
        .map(f => f.url)
      if (remainingImages.length === 0) {
        const next = { ...d } as Partial<Project>
        delete next.preview
        delete next.screenshots
        return next
      }
      return {
        ...d,
        preview: remainingImages[0],
        screenshots: remainingImages.length > 1 ? remainingImages.slice(1) : undefined,
      }
    })
  }

  const handleSetActiveMedia = (index: number) => {
    setActiveMediaIdx(index)
    setDraft((d) => {
      if (!d) return d
      const file = uploadedFiles[index]
      if (!file) return d
      if (file.type?.startsWith('video/')) {
        return { ...d, video: file.url }
      }
      const imageUrls = uploadedFiles
        .filter((_, i) => i !== index && !uploadedFiles[i].type?.startsWith('video/'))
        .map(f => f.url)
      return {
        ...d,
        preview: file.url,
        screenshots: imageUrls.length > 0 ? imageUrls : undefined,
      }
    })
  }

  const pinnedOrder = useMemo(() => {
    return projects.filter((p) => p.pinned)
  }, [projects])

  const displayProjects = useMemo(() => {
    if (customOrder) return projects
    const pinned = projects.filter((p) => p.pinned)
    const notPinned = [...projects.filter((p) => !p.pinned)].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return [...pinned, ...notPinned]
  }, [projects, customOrder])

  const visible = showAll ? displayProjects : displayProjects.filter((p) => p.pinned)

  const handleReorder = (activeId: string, overId: string) => {
    setCustomOrder(true)
    setProjects((prev) => {
      const next = [...prev]
      const oldIdx = prev.findIndex((p) => p.id === activeId)
      const newIdx = prev.findIndex((p) => p.id === overId)
      const [moved] = next.splice(oldIdx, 1)
      next.splice(newIdx, 0, moved)
      // enforce pinned always on top
      const pinned = next.filter((p) => p.pinned)
      const unpinned = next.filter((p) => !p.pinned)
      return [...pinned, ...unpinned]
    })
    window.dispatchEvent(new Event('projects-updated'))
  }

  const sortByDefault = () => {
    setCustomOrder(false)
  }

  const addOrUpdate = async () => {
    if (!draft) return
    const errs = validateDraft(draft, uploadedFiles)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setSaveError(null)

    try {
      // Organize Drive media files into proper folder hierarchy
      let newFolderId: string | undefined
      const filesWithIds = uploadedFiles.filter(f => f.fileId)
      if (filesWithIds.length > 0) {
        const existingProject = editingId ? projects.find(p => p.id === editingId) : null
        const res = await fetch('/api/drive/organize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: filesWithIds.map(f => ({ fileId: f.fileId, name: f.name })),
            category: draft.category,
            title: draft.title,
            sourceFolderId: existingProject?.projectFolderId || undefined,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to organize media on Drive')
        }
        const orgResult = await res.json()
        newFolderId = orgResult.projectFolderId
      }

      let savedProject: Project | null = null
      setProjects((prev) => {
        let next: Project[]
        const exists = prev.find((p) => p.id === draft.id)

        if (exists) {
          next = prev.map((p) => (p.id === draft.id ? { ...(p as any), ...draft, projectFolderId: newFolderId || p.projectFolderId } as Project : p))
          savedProject = next.find((p) => p.id === draft.id) ?? null
        } else {
          const newId = draft.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
          const created = { ...(draft as Project), id: newId, projectFolderId: newFolderId }
          savedProject = created
          next = [created, ...prev]
        }

        if (draft.pinned) {
          const pinnedCount = next.filter((p) => p.pinned).length
          if (pinnedCount > 4) {
            const pinnedProjects = next.filter((p) => p.pinned)
            const nonPinnedProjects = next.filter((p) => !p.pinned)
            const lastPinned = pinnedProjects[pinnedProjects.length - 1]
            lastPinned.pinned = false
            next = [...pinnedProjects.slice(0, -1), lastPinned, ...nonPinnedProjects]
          }
        }

        const pinned = next.filter((p) => p.pinned)
        const unpinned = next.filter((p) => !p.pinned)
        return [...pinned, ...unpinned] as Project[]
      })
      if (savedProject) {
        fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedProject),
        }).catch((e) => console.error('Supabase sync error:', e))
      }
      setDraft(null)
      setEditingId(null)
      setErrors({})
      pendingDeletions.current.clear()
      window.dispatchEvent(new Event('projects-updated'))
    } catch (err: any) {
      console.error('Save error:', err)
      setSaveError(err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePinToggle = (checked: boolean) => {
    if (checked && pinnedOrder.length >= 4) {
      setShowPinWarning(true)
      return
    }
    setDraft((d) => ({ ...(d ?? {}), pinned: checked }))
  }

  const confirmPinFifo = () => {
    setShowPinWarning(false)
    if (pendingPinId) {
      setProjects((prev) => {
        const oldest = prev.find((p) => p.pinned)
        const next = prev.map((p) =>
          p.id === oldest?.id ? { ...p, pinned: false } :
          p.id === pendingPinId ? { ...p, pinned: true } : p
        )
        const pinned = next.filter((p) => p.pinned)
        const unpinned = next.filter((p) => !p.pinned)
        return [...pinned, ...unpinned]
      })
      setPendingPinId(null)
      window.dispatchEvent(new Event('projects-updated'))
    } else {
      setDraft((d) => ({ ...(d ?? {}), pinned: true }))
    }
  }

  const cancelPin = () => {
    setShowPinWarning(false)
    setPendingPinId(null)
  }

  const unpinProject = (id: string) => {
    setProjects((prev) => {
      const pinned = prev.filter((p) => p.pinned && p.id !== id)
      if (pinned.length >= 3) {
        const next = prev.map((p) => p.id === id ? { ...p, pinned: false } : p)
        const pn = next.filter((p) => p.pinned)
        const up = next.filter((p) => !p.pinned)
        return [...pn, ...up]
      }
      const unpinned = prev.filter((p) => !p.pinned || p.id === id).filter((p) => p.id !== id)
      const sorted = [...unpinned].sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0
        const db = b.date ? new Date(b.date).getTime() : 0
        return db - da
      })
      const toPin = sorted.slice(0, 3 - pinned.length)
      const toPinIds = new Set(toPin.map((p) => p.id))
      const next = prev.map((p) => {
        if (p.id === id) return { ...p, pinned: false }
        if (toPinIds.has(p.id)) return { ...p, pinned: true }
        return p
      })
      const pn = next.filter((p) => p.pinned)
      const up = next.filter((p) => !p.pinned)
      return [...pn, ...up]
    })
    window.dispatchEvent(new Event('projects-updated'))
  }

  const pinProject = (id: string) => {
    if (pinnedOrder.length >= 4) {
      setPendingPinId(id)
      setShowPinWarning(true)
      return
    }
    setProjects((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, pinned: true } : p)
      const pn = next.filter((p) => p.pinned)
      const up = next.filter((p) => !p.pinned)
      return [...pn, ...up]
    })
    window.dispatchEvent(new Event('projects-updated'))
  }

  const remove = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (editingId === id) { setEditingId(null); setDraft(null) }
    setShowDeleteConfirm(null)
    fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch((e) => console.error('Supabase delete sync error:', e))
    window.dispatchEvent(new Event('projects-updated'))
  }

  const handleMediaReorder = useCallback((files: typeof uploadedFiles) => {
    setUploadedFiles(files)
    setDraft((d) => {
      if (!d) return d
      const images = files.filter((f) => !f.type?.startsWith('video/'))
      const videos = files.filter((f) => f.type?.startsWith('video/'))
      return {
        ...d,
        preview: images[0]?.url ?? d.preview,
        screenshots: images.length > 1 ? images.slice(1).map((f) => f.url) : undefined,
        video: videos[0]?.url ?? d.video,
      }
    })
  }, [])

  const startEdit = (p: Project) => {
    setDraft({ ...p })
    setEditingId(p.id)
    setErrors({})
    const files: typeof uploadedFiles = []
    if (p.preview) files.push({ name: 'Preview', size: 0, url: p.preview, fileId: extractFileId(p.preview), type: 'image/png' })
    if (p.screenshots) p.screenshots.forEach((s, i) => files.push({ name: `Screenshot ${i + 1}`, size: 0, url: s, fileId: extractFileId(s), type: 'image/png' }))
    if (p.video) files.push({ name: 'Video', size: 0, url: p.video, fileId: extractFileId(p.video), type: 'video/mp4' })
    setUploadedFiles(files)
  }

  const clearForm = () => {
    uploadedFiles.forEach((f) => {
      if (f.fileId) {
        pendingDeletions.current.delete(f.fileId)
        fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: f.fileId }) })
          .catch(() => {})
      }
    })
    setDraft(null)
    setEditingId(null)
    setErrors({})
    setActiveMediaIdx(0)
    setUploadedFiles([])
  }

  const handleCategoriesSave = useCallback((cats: string[]) => {
    const deleted = categories.filter((c) => !cats.includes(c))
    if (deleted.length > 0) {
      setProjects((prev) =>
        prev.map((p) => deleted.includes(p.category ?? '') ? { ...p, category: 'Others' } : p)
      )
    }
    saveCategories(cats)
  }, [categories])

  const hasFormData = !!(draft?.title?.trim() || draft?.category?.trim() || draft?.description?.trim() || draft?.preview?.trim() || draft?.date?.trim() || uploadedFiles.length > 0)

  const projectsListContent = (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        All Projects
        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: '0.75rem' }}>
          {projects.length} total
          {showAll && customOrder && (
            <>
              {' • '}drag to reorder •
              <button onClick={sortByDefault} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', marginLeft: '0.3rem', fontSize: '0.75rem' }}>
                reset sort
              </button>
            </>
          )}
        </span>
      </h2>

      {showAll ? (
        <SortableList ids={displayProjects.map((p) => p.id)} onReorder={handleReorder} onDragStart={(id) => setActiveDragId(id)} onDragEnd={() => setActiveDragId(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayProjects.map((p) => (
              <SortableItem key={p.id} id={p.id}>
                <ProjectRow p={p} editingId={editingId} startEdit={startEdit} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} remove={remove} pinProject={pinProject} unpinProject={unpinProject} />
              </SortableItem>
            ))}
          </div>
          <SortableOverlay id={activeDragId}>
            {(id) => {
              const p = projects.find((x) => x.id === id)
              if (!p) return null
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '16px 20px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}>
                  <DragHandle style={{ cursor: 'grab' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{p.category || 'No category'} • {formatDate(p.date)}</div>
                  </div>
                </div>
              )
            }}
          </SortableOverlay>
        </SortableList>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visible.map((p) => (
            <ProjectRow key={p.id} p={p} editingId={editingId} startEdit={startEdit} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} remove={remove} pinProject={pinProject} unpinProject={unpinProject} />
          ))}
        </div>
      )}

      {displayProjects.length === 0 && (
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '2rem' }}>
          No projects yet. Add one above.
        </p>
      )}

      {displayProjects.some((p) => !p.pinned) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <motion.button onClick={() => setShowAll(!showAll)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ padding: '12px 32px', background: 'transparent', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
            {showAll ? 'Show Less' : 'Show More'}
          </motion.button>
        </motion.div>
      )}
    </>
  )

  return (
    <section suppressHydrationWarning style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D scale={showAll ? 1.6 : 1} />

      {showPinWarning && <PinWarning onContinue={confirmPinFifo} onCancel={cancelPin} />}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onSave={handleCategoriesSave}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      <div style={{ position: 'relative', zIndex: 10, padding: '2rem 2rem 6rem', maxWidth: '1400px', margin: '0 auto' }}>
        {syncMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 20px', background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '8px',
              marginBottom: '1rem', fontSize: '0.8rem', color: '#ffc107'
            }}
          >
            {syncMessage}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '3rem', paddingTop: '4rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Project Manager</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>{projects.length} total projects{customOrder ? ' • Custom order' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => window.location.href = '/api/auth/drive-reauth'}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', color: 'rgba(255,255,255,0.4)', padding: '8px 16px',
                  fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  const target = e.currentTarget
                  target.style.background = 'rgba(255,255,255,0.08)'; target.style.color = '#ffc107'
                  const tooltip = target.parentElement?.querySelector('.reauth-tooltip') as HTMLElement
                  if (tooltip) tooltip.style.opacity = '1'
                }}
                onMouseLeave={e => {
                  const target = e.currentTarget
                  target.style.background = 'rgba(255,255,255,0.04)'; target.style.color = 'rgba(255,255,255,0.4)'
                  const tooltip = target.parentElement?.querySelector('.reauth-tooltip') as HTMLElement
                  if (tooltip) tooltip.style.opacity = '0'
                }}
              >
                Re-auth
                {driveTokenBad && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-2px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#ff4444',
                  }} />
                )}
              </button>
              <div className="reauth-tooltip" style={{
                position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.9)', color: 'rgba(255,255,255,0.7)', padding: '6px 12px',
                borderRadius: '6px', fontSize: '0.65rem', whiteSpace: 'nowrap', pointerEvents: 'none',
                opacity: 0, transition: 'opacity 0.2s ease', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {driveTokenBad ? 'Token expired — re-auth required' : 'use it when token is expired'}
              </div>
            </div>
            <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/cmdpanel/login' }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', color: 'rgba(255,255,255,0.4)', padding: '8px 16px',
                fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              Logout
            </button>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* ──── Form ──── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'rgba(10, 10, 10, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={labelStyle}>Title</label>
                  {draft?.title && (
                    <button onClick={() => clearField('title')} style={clearBtnStyle}>✕</button>
                  )}
                </div>
                <input
                  placeholder="Project Title"
                  value={draft?.title ?? ''}
                  onChange={(e) => { setDraft((d) => ({ ...(d ?? {}), title: e.target.value })); setErrors((e) => ({ ...e, title: '' })) }}
                  style={{ ...inputStyle, ...errorBorder('title', errors) }}
                />
                {errors.title && <p style={errorTextStyle}>{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={labelStyle}>Category</label>
                  {draft?.category && (
                    <button onClick={() => clearField('category')} style={clearBtnStyle}>✕</button>
                  )}
                </div>
                <select
                  value={draft?.category ?? ''}
                  onChange={(e) => {
                    if (e.target.value === '__MANAGE_OPEN__') {
                      setShowCategoryManager(true)
                      return
                    }
                    setDraft((d) => ({ ...(d ?? {}), category: e.target.value }))
                    setErrors((e) => ({ ...e, category: '' }))
                  }}
                  style={{ ...inputStyle, cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', ...errorBorder('category', errors) }}
                >
                  <option value="" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.5)' }}>Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c} style={{ background: '#1a1a1a', color: '#fff' }}>{c}</option>
                  ))}
                  <option value="__MANAGE__" disabled style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    ── Manage Categories ──
                  </option>
                  <option value="__MANAGE_OPEN__" style={{ background: '#1a1a1a', color: '#fff', fontWeight: 600 }}>
                    ⚙ Manage Categories...
                  </option>
                </select>
                {errors.category && <p style={errorTextStyle}>{errors.category}</p>}
              </div>

              {/* Description */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={labelStyle}>Description</label>
                  {draft?.description && (
                    <button onClick={() => clearField('description')} style={clearBtnStyle}>✕</button>
                  )}
                </div>
                <div
                  onClick={() => setShowDescriptionEditor(true)}
                  style={{
                    ...inputStyle, minHeight: '60px', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', overflow: 'hidden',
                    ...errorBorder('description', errors)
                  }}
                >
                  <span style={{
                    fontSize: '0.85rem', lineHeight: 1.6, color: draft?.description ? '#fff' : 'rgba(255,255,255,0.3)',
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                  }}
                    dangerouslySetInnerHTML={{ __html: draft?.description?.trim() ? stripHtml(draft.description).slice(0, 120) + (draft.description.length > 120 ? '...' : '') : 'Click to write description...' }}
                  />
                </div>
                {errors.description && <p style={errorTextStyle}>{errors.description}</p>}
              </div>

              {showDescriptionEditor && (
                <DescriptionEditor
                  value={draft?.description ?? ''}
                  onSave={(html) => { setDraft((d) => ({ ...(d ?? {}), description: html })); setErrors((e) => ({ ...e, description: '' })) }}
                  onClose={() => setShowDescriptionEditor(false)}
                />
              )}

              {/* Date + Upload */}
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '8px' }}>
                  <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={labelStyle}>Date</label>
                    {draft?.date && (<button onClick={() => clearField('date')} style={clearBtnStyle}>✕</button>)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Media</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                  <div style={{ flex: 3, display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={draft?.date ? draft.date.split('-')[1] ?? '' : ''}
                      onChange={(e) => {
                        const y = draft?.date?.split('-')[0] || String(new Date().getFullYear())
                        setDraft((d) => ({ ...(d ?? {}), date: `${y}-${e.target.value}` }))
                        setErrors((e) => ({ ...e, date: '' }))
                      }}
                      style={{ ...inputStyle, flex: 1, cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', ...errorBorder('date', errors) }}
                    >
                      <option value="" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.5)' }}>Month</option>
                      {MONTH_NAMES.map((name, i) => (
                        <option key={i} value={String(i + 1).padStart(2, '0')} style={{ background: '#1a1a1a', color: '#fff' }}>{name}</option>
                      ))}
                    </select>
                    <select
                      value={draft?.date?.split('-')[0] ?? ''}
                      onChange={(e) => {
                        const m = draft?.date?.split('-')[1] || '01'
                        setDraft((d) => ({ ...(d ?? {}), date: `${e.target.value}-${m}` }))
                        setErrors((e) => ({ ...e, date: '' }))
                      }}
                      style={{ ...inputStyle, flex: 1, cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', ...errorBorder('date', errors) }}
                    >
                      <option value="" style={{ background: '#1a1a1a', color: 'rgba(255,255,255,0.5)' }}>Year</option>
                      {Array.from({ length: 21 }, (_, i) => 2020 + i).map((y) => (
                        <option key={y} value={y} style={{ background: '#1a1a1a', color: '#fff' }}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex' }}>
                    <label style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '12px 20px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                      <input type="file" accept="image/*,video/*" multiple hidden
                        onChange={(e) => { handleFileUpload(e.target.files); e.target.value = '' }} />
                      Upload Media
                    </label>
                  </div>
                </div>

                {uploadProgress && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress.total > 0 ? (uploadProgress.loaded / uploadProgress.total) * 100 : 0}%` }}
                        style={{ height: '100%', background: '#4ade80', borderRadius: '2px' }}
                      />
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                      {uploadProgress.fileCount > 1 && `${uploadProgress.fileCount} files uploading — `}
                      {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                    </p>
                  </div>
                )}

                {uploadError && (
                  <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>
                    {uploadError}
                  </p>
                )}

                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem', fontWeight: 500 }}>
                      Uploaded files ({uploadedFiles.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {uploadedFiles.map((file, i) => (
                        <div key={i}
                          onClick={() => handleSetActiveMedia(i)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '6px 10px',
                            background: i === activeMediaIdx ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                            border: i === activeMediaIdx ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          {(file.type?.startsWith('image/') || file.thumbnail || file.fileId || file.url?.match(/[?&]id=([^&]+)/)) ? (
                            <img src={file.thumbnail || (file.fileId ? `https://drive.google.com/thumbnail?id=${file.fileId}&sz=w200` : file.url)} alt={file.name}
                              style={{ width: 36, height: 36, borderRadius: '4px', objectFit: 'cover', flexShrink: 0, background: '#111' }}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3' }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: '4px', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                              ▶
                            </div>
                          )}
                          <span style={{ fontSize: '0.7rem', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: i === activeMediaIdx ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                            {file.name}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                            {formatFileSize(file.size)}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); removeUploadedFile(i) }}
                            style={{
                              background: 'rgba(255,68,68,0.15)', border: 'none',
                              color: '#ff4444', cursor: 'pointer', borderRadius: '4px',
                              padding: '2px 8px', fontSize: '0.6rem', fontWeight: 600, flexShrink: 0,
                            }}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors.date && <p style={errorTextStyle}>{errors.date}</p>}
                {errors.media && <p style={errorTextStyle}>{errors.media}</p>}
              </div>

              {/* Pin checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="pinned"
                  checked={draft?.pinned ?? false}
                  onChange={(e) => handlePinToggle(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fff' }}
                />
                <label htmlFor="pinned" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Pin this project?</label>
              </div>

              {/* Save / Clear */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <motion.button
                  onClick={addOrUpdate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    opacity: saving ? 0.5 : 1
                  }}
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </motion.button>

                {(draft || editingId) && (
                  <motion.button
                    onClick={clearForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    Clear
                  </motion.button>
                )}
              </div>

              {saveError && (
                <p style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: 500, textAlign: 'center' }}>
                  {saveError}
                </p>
              )}
            </div>
          </motion.div>

          {/* ──── Projects List / Live Preview ──── */}
          {draft && hasFormData ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                justifySelf: 'start',
                background: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1rem',
              }}
            >
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                Project Card Live Preview
              </p>
              <ProjectCardPreview draft={draft} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem'
              }}
            >
              {projectsListContent}
            </motion.div>
          )}
        </div>

        {draft && hasFormData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              marginTop: '2rem',
              background: 'rgba(10, 10, 10, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1rem',
            }}
          >
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Project Window Live Preview
            </p>
            <FullProjectPreview draft={draft} uploadedFiles={uploadedFiles} onMediaReorder={handleMediaReorder} />
          </motion.div>
        )}
      </div>
    </section>
  )
}