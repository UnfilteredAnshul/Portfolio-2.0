"use client";

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import data from '../../../data/projects.json'
import Hero3D from '../../../components/Hero3D'

interface AdminSession {
  token: string;
  expires: number;
}

const SESSION_COOKIE = 'admin_session'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

type Project = typeof data[number]

const CATEGORIES = ['Development', 'AI & Automation', 'Content Creation', 'Video Editing', 'Trading']

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

function useLocalProjects() {
  const [projects, setProjects] = useState<Project[]>(data as Project[])
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_projects')
    if (saved) {
      try {
        setProjects(JSON.parse(saved) as Project[])
      } catch {
        // ignore parse errors
      }
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects))
  }, [projects])
  return [projects, setProjects] as const
}

export default function AdminProjects() {
  const [projects, setProjects] = useLocalProjects()
  const [draft, setDraft] = useState<Partial<Project> | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = getCookie(SESSION_COOKIE)
    if (!session) {
      router.push('/admin')
      return
    }
    try {
      const decoded = JSON.parse(Buffer.from(session, 'hex').toString()) as AdminSession
      if (decoded.expires <= Date.now()) {
        deleteCookie(SESSION_COOKIE)
        router.push('/admin')
        return
      }
      setAuthenticated(true)
    } catch {
      deleteCookie(SESSION_COOKIE)
      router.push('/admin')
    }
    setChecking(false)
  }, [router])

  const handleLogout = () => {
    deleteCookie(SESSION_COOKIE)
    router.push('/admin')
  }

  const addOrUpdate = () => {
    if (!draft || !draft.slug || !draft.title) return
    setProjects((prev) => {
      let next: Project[]
      const exists = prev.find((p) => p.slug === draft.slug)
      
      if (exists) {
        next = prev.map((p) => (p.slug === draft.slug ? { ...(p as any), ...draft } as Project : p))
      } else {
        next = [{ ...(draft as Project) }, ...prev]
      }
      
      if (draft.pinned) {
        const pinnedCount = next.filter((p) => p.pinned).length
        if (pinnedCount > 4) {
          const pinnedProjects = next.filter((p) => p.pinned)
          const nonPinnedProjects = next.filter((p) => !p.pinned)
          const lastPinned = pinnedProjects[pinnedProjects.length - 1]
          lastPinned.pinned = false
          next = [lastPinned, ...pinnedProjects.slice(0, -1), ...nonPinnedProjects]
        }
      }
      
      return next as Project[]
    })
    setDraft(null)
    setEditingSlug(null)
  }

  const remove = (slug: string) => {
    setProjects((prev) => prev.filter((p) => p.slug !== slug))
    if (editingSlug === slug) {
      setEditingSlug(null)
      setDraft(null)
    }
    setShowDeleteConfirm(null)
  }

  const startEdit = (p: Project) => {
    setDraft({ ...p })
    setEditingSlug(p.slug)
  }

  const clearForm = () => {
    setDraft(null)
    setEditingSlug(null)
  }

  if (checking) {
    return (
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          Verifying access...
        </motion.p>
      </section>
    )
  }

  if (!authenticated) return null

  return (
    <section style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D />
      
      <div style={{ position: 'relative', zIndex: 10, padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingTop: '4rem' }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Project Manager</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>{projects.length} projects</p>
          </div>
          <motion.button 
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              padding: '12px 24px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              color: '#fff', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            Logout
          </motion.button>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
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
              {editingSlug ? 'Edit Project' : 'Add New Project'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Slug</label>
                <input 
                  placeholder="project-slug" 
                  value={draft?.slug ?? ''} 
                  onChange={(e) => setDraft((d) => ({ ...(d ?? {}), slug: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Title</label>
                <input 
                  placeholder="Project Title" 
                  value={draft?.title ?? ''} 
                  onChange={(e) => setDraft((d) => ({ ...(d ?? {}), title: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Description</label>
                <textarea 
                  placeholder="Project description..." 
                  value={draft?.description ?? ''} 
                  onChange={(e) => setDraft((d) => ({ ...(d ?? {}), description: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Preview Image URL</label>
                <input 
                  placeholder="https://..." 
                  value={draft?.preview ?? ''} 
                  onChange={(e) => setDraft((d) => ({ ...(d ?? {}), preview: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Video URL</label>
                <input 
                  placeholder="https://..." 
                  value={draft?.video ?? ''} 
                  onChange={(e) => setDraft((d) => ({ ...(d ?? {}), video: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Category</label>
                <select 
                  value={draft?.category ?? ''} 
                  onChange={(e) => setDraft((d) => ({ ...(d ?? {}), category: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="pinned"
                  checked={draft?.pinned ?? false} 
                  onChange={(e) => setDraft((d) => ({ ...(d ?? {}), pinned: e.target.checked }))} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fff' }}
                />
                <label htmlFor="pinned" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Pin to home</label>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <motion.button 
                  onClick={addOrUpdate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!draft?.slug || !draft?.title}
                  style={{ 
                    flex: 1,
                    padding: '14px 24px', 
                    background: '#fff', 
                    color: '#000', 
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    opacity: (!draft?.slug || !draft?.title) ? 0.5 : 1
                  }}
                >
                  {editingSlug ? 'Update' : 'Save'}
                </motion.button>
                
                {(draft || editingSlug) && (
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
            </div>
          </motion.div>

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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>All Projects</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projects.map((p, index) => (
                <motion.div 
                  key={p.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px 20px', 
                    background: editingSlug === p.slug ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: editingSlug === p.slug ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.title}</span>
                      {p.pinned && (
                        <span style={{ 
                          padding: '2px 8px', 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          Pinned
                        </span>
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: 'rgba(255, 255, 255, 0.4)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {p.slug} • {p.category || 'No category'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <motion.button 
                      onClick={() => startEdit(p)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ 
                        padding: '8px 16px', 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        color: '#fff', 
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      Edit
                    </motion.button>
                    
                    {showDeleteConfirm === p.slug ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <motion.button 
                          onClick={() => remove(p.slug)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ 
                            padding: '8px 16px', 
                            background: '#ff4444', 
                            color: '#fff', 
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          Confirm
                        </motion.button>
                        <motion.button 
                          onClick={() => setShowDeleteConfirm(null)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ 
                            padding: '8px 16px', 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            color: '#fff', 
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button 
                        onClick={() => setShowDeleteConfirm(p.slug)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ 
                          padding: '8px 16px', 
                          background: 'rgba(255, 68, 68, 0.2)', 
                          color: '#ff4444', 
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        Delete
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {projects.length === 0 && (
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '2rem' }}>
                  No projects yet. Add one above.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}