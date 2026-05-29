"use client";
import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useProjects } from '../../lib/projects-context'
import { ProjectModal, Project } from '../../components/ProjectModal'
import Hero3D from '../../components/Hero3D'
import { useCategories } from '../../lib/use-categories'
import { formatDate, stripHtml } from '../../lib/format-date'

export default function WorkClient() {
  const { projects } = useProjects()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category')
  const categories = useCategories()
  const [category, setCategory] = useState<string>(initialCategory || 'All')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  const filterCategories = useMemo(() => ['All', ...categories], [categories])
  
  const sorted = useMemo(() => {
    const pinned = projects.filter((p) => p.pinned)
    const notPinned = [...projects.filter((p) => !p.pinned)].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return [...pinned, ...notPinned]
  }, [projects])

  const visible = useMemo(() => {
    const filtered = category === 'All' ? sorted : sorted.filter((p) => p.category === category)
    if (category !== 'All') return filtered
    if (showAll) return filtered
    return filtered.filter((p) => p.pinned)
  }, [category, showAll, sorted])

  return (
    <section style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D scale={showAll ? 1.6 : 1} />
      
      <div style={{ position: 'relative', zIndex: 10, padding: showAll ? '6rem 2rem 7rem' : '6rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Work</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem' }}>
            {showAll ? visible.length : `${visible.length} shown`} project{visible.length !== 1 ? 's' : ''}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
        >
          <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Filter:</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {filterCategories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setShowAll(false) }}
                style={{ 
                  padding: '8px 16px', 
                  background: category === c ? '#fff' : 'rgba(255, 255, 255, 0.1)', 
                  color: category === c ? '#000' : '#fff',
                  border: category === c ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {visible.map((p, index) => (
            <motion.div 
              key={p.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedProject(p)}
              style={{ 
                display: 'block', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                background: 'rgba(10, 10, 10, 0.8)',
                textDecoration: 'none',
                border: hoveredId === p.id ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{ height: 220, background: '#111', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={p.preview} 
                  alt={p.title} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: hoveredId === p.id ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.4s ease'
                  }} 
                />
                {p.pinned && (
                  <span style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    padding: '4px 10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    borderRadius: '4px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    Pinned
                  </span>
                )}
              </div>
              <div style={{ padding: '1.25rem' }}>
                <strong style={{ fontSize: '1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: '#fff' }}>{p.title}</strong>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{stripHtml(p.description).slice(0, 80)}{stripHtml(p.description).length > 80 ? '...' : ''}</p>
                  {p.category && (
                  <span style={{ 
                    display: 'inline-block',
                    marginTop: '0.75rem',
                    padding: '4px 10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    borderRadius: '4px'
                  }}>
                    {p.category} • {formatDate(p.date)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem' }}>No projects found in this category.</p>
          </div>
        )}

        {category === 'All' && sorted.some((p) => !p.pinned) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', marginTop: '3rem' }}
          >
            <motion.button
              onClick={() => setShowAll(!showAll)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 40px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {showAll ? `Show Less` : `Show More`}
            </motion.button>
          </motion.div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  )
}
