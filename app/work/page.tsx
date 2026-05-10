"use client";
import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import dataAll from '../../data/projects.json'
import Hero3D from '../../components/Hero3D'

export default function WorkPage() {
  const [category, setCategory] = useState<string>('All')
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  
  const categories = useMemo(() => ['All', ...Array.from(new Set(dataAll.map((p: any) => p.category).filter(Boolean)))], [])
  const filtered = useMemo(() => {
    const pinned = dataAll.filter((p: any) => p.pinned)
    const notPinned = dataAll.filter((p: any) => !p.pinned)
    if (category === 'All') return [...pinned, ...notPinned]
    return [...pinned.filter((p: any) => p.category === category), ...notPinned.filter((p: any) => p.category === category)]
  }, [category])
  
  return (
    <section style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D />
      
      <div style={{ position: 'relative', zIndex: 10, padding: '6rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Work</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem' }}>
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
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
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
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
          {filtered.map((p: any, index: number) => (
            <motion.a 
              key={p.slug} 
              href={`/project/${p.slug}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredSlug(p.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              style={{ 
                display: 'block', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                background: 'rgba(10, 10, 10, 0.8)',
                textDecoration: 'none',
                border: hoveredSlug === p.slug ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                transition: 'all 0.3s ease'
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
                    transform: hoveredSlug === p.slug ? 'scale(1.05)' : 'scale(1)',
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
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '...' : ''}</p>
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
                    {p.category}
                  </span>
                )}
              </div>
            </motion.a>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem' }}>No projects found in this category.</p>
          </div>
        )}
      </div>
    </section>
  )
}