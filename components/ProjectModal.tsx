"use client";
import React, { useMemo, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export interface Project {
  id: string
  title: string
  description: string
  preview: string
  pinned: boolean
  category?: string
  screenshots?: string[]
  video?: string
  date: string
}

function getProjectMedia(project: Project) {
  const seed = project.id.replace(/[^a-z0-9]/gi, '')
  return [
    { type: 'image' as const, src: `https://picsum.photos/seed/${seed}-1/1200/675`, aspect: '16:9' as const },
    { type: 'image' as const, src: `https://picsum.photos/seed/${seed}-2/600/1067`, aspect: '9:16' as const },
    { type: 'image' as const, src: `https://picsum.photos/seed/${seed}-3/1200/675`, aspect: '16:9' as const },
    { type: 'video' as const, src: 'https://www.w3schools.com/html/mov_bbb.mp4', aspect: '16:9' as const },
  ]
}

export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const media = useMemo(() => getProjectMedia(project), [project])
  const [currentIndex, setCurrentIndex] = useState(0)
  const item = media[currentIndex]
  const modalRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)

  const prev = useCallback(() => setCurrentIndex((i) => (i - 1 + media.length) % media.length), [media.length])
  const next = useCallback(() => setCurrentIndex((i) => (i + 1) % media.length), [media.length])

  const toggleTheaterMode = useCallback(() => {
    if (!modalRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      modalRef.current.requestFullscreen()
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!mediaRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      mediaRef.current.requestFullscreen()
    }
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <style>{`
        .desc-scrollbar::-webkit-scrollbar { width: 4px; }
        .desc-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .desc-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .desc-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
      <motion.div 
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ 
          width: '75vw',
          height: '75vh',
          background: '#0a0a0a', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={mediaRef} style={{ flex: 2, overflow: 'hidden', position: 'relative', background: '#111', minHeight: 0 }}>
          {item.type === 'video' ? (
            <video
              key={item.src}
              src={item.src}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          ) : (
            <img
              key={item.src}
              src={item.src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
          )}

          {media.length > 1 && (
            <>
              <button onClick={prev} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, backdropFilter: 'blur(4px)'
              }}>
                ◀
              </button>
              <button onClick={next} style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, backdropFilter: 'blur(4px)'
              }}>
                ▶
              </button>
            </>
          )}

          <div style={{
            position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '0.5rem', zIndex: 10
          }}>
            {media.map((_, i) => (
              <div key={i} style={{
                width: i === currentIndex ? '20px' : '8px', height: '4px',
                borderRadius: '2px', background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s', cursor: 'pointer'
              }} onClick={() => setCurrentIndex(i)} />
            ))}
          </div>

          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 20 }}>
            <button onClick={toggleFullscreen} style={{
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: '8px 14px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              backdropFilter: 'blur(4px)', lineHeight: 1
            }}>
              Fullscreen
            </button>
            <button onClick={toggleTheaterMode} style={{
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: '8px 14px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              backdropFilter: 'blur(4px)', lineHeight: 1
            }}>
              Theater Mode
            </button>
            <button onClick={onClose} style={{
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', padding: '8px 14px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              backdropFilter: 'blur(4px)', lineHeight: 1
            }}>
              {'✕'}
            </button>
          </div>
        </div>

        <div className="desc-scrollbar" style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>
              {project.title}
            </h2>
            {project.category && (
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {project.category}
              </span>
            )}
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}
            dangerouslySetInnerHTML={{ __html: project.description }} />
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            This project involved extensive research, iterative prototyping, and close collaboration with stakeholders to ensure every detail aligned with the vision. From initial concept to final delivery, the process was driven by a commitment to quality, performance, and user experience.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Technologies used spanned the full modern web stack, with particular emphasis on responsive design, accessibility standards, and scalable architecture. Performance benchmarks were measured and optimized throughout development, resulting in fast load times and smooth interactions across all devices.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Post-launch analytics showed significant improvement in user engagement metrics, with bounce rate decreasing by 40% and average session duration increasing by over two minutes. Client feedback highlighted the intuitive interface and polished visual design as standout elements of the final product.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
