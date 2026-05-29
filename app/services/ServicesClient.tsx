"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Hero3D from '../../components/Hero3D'
import { useProjects } from '../../lib/projects-context'
import { categories } from '../../lib/categories'
import { ProjectModal, Project } from '../../components/ProjectModal'

const serviceConfig: Record<string, { icon: string; desc: string; image: string }> = {
  'Full Stack Dev': {
    icon: '⚡',
    desc: 'Full-stack web development using modern frameworks like Next.js, React, and Node.js. Building responsive, performant applications with clean code architecture.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
  },
  'AI & Automation': {
    icon: '🧠',
    desc: 'Implementing AI solutions for business automation. From chatbots to workflow automation, leveraging cutting-edge AI tools to streamline operations.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
  },
  'Content Creation': {
    icon: '🎬',
    desc: 'Creating engaging content for streaming, social media, and YouTube. Stream design, overlays, thumbnails, and full content strategies.',
    image: 'https://images.unsplash.com/photo-1626968361222-291e74711449?w=800'
  },
  'Thumbnail Creation': {
    icon: '🖼️',
    desc: 'Eye-catching YouTube and social media thumbnails designed to maximize click-through rates. Custom graphics, bold typography, and brand-consistent visuals.',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800'
  },
  'Video Editing': {
    icon: '🎞️',
    desc: 'Professional video editing using Premiere Pro, After Effects, and Da Vinci Resolve. Color grading, motion graphics, and post-production services.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'
  },
  'Algo Trading': {
    icon: '📊',
    desc: 'Developing automated trading algorithms and bots for financial markets. Strategy backtesting, risk management systems, and real-time market data integration.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
  }
}

const services = categories.map(cat => ({
  title: cat,
  ...serviceConfig[cat]
}))

function TiltCard({ children, className, style, tiltLimit = 15, scale = 1.02, perspective = 1200 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; tiltLimit?: number; scale?: number; perspective?: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`)
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const xRot = (py - 0.5) * (tiltLimit * 2) * -1
    const yRot = (px - 0.5) * -(tiltLimit * 2) * -1
    setTransform(`perspective(${perspective}px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(${scale}, ${scale}, ${scale})`)
    setSpotlightPos({ x: px * 100, y: py * 100 })
  }, [tiltLimit, scale, perspective])

  const handlePointerEnter = useCallback(() => setIsHovered(true), [])

  const handlePointerLeave = useCallback(() => {
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`)
    setIsHovered(false)
  }, [perspective])

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={{
        transform,
        transition: 'transform 0.2s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        position: 'relative',
        ...style,
      }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
          overflow: 'hidden',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '200%',
            height: '200%',
            borderRadius: '50%',
            left: `${spotlightPos.x}%`,
            top: `${spotlightPos.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 40%)',
          }}
        />
      </div>
    </div>
  )
}

export default function ServicesClient() {
  const [selectedService, setSelectedService] = useState<typeof services[number] | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const all = useProjects().projects
  const pinned = useMemo(() => all.filter(p => p.pinned).slice(0, 4), [all])
  const twoCopies = useMemo(() => [...pinned, ...pinned], [pinned])
  const trackRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    const outer = outerRef.current
    if (!track || !outer) return

    let animationId: number
    let lastTime = 0
    const speed = 0.08

    const animate = (currentTime: number) => {
      if (isPausedRef.current) {
        lastTime = currentTime
        animationId = requestAnimationFrame(animate)
        return
      }
      if (!lastTime) lastTime = currentTime
      const delta = currentTime - lastTime
      lastTime = currentTime

      const currentScroll = parseFloat(track.style.transform.replace('translateX(', '').replace('px)', '')) || 0
      const newScroll = currentScroll - (delta * speed)
      const trackWidth = track.scrollWidth / 2
      
      if (Math.abs(newScroll) >= trackWidth) {
        track.style.transform = 'translateX(0px)'
      } else {
        track.style.transform = `translateX(${newScroll}px)`
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const Tile = ({ item, index }: { item: Project; index: number }) => {
    const [titleHovered, setTitleHovered] = useState(false)
    return (
      <motion.div 
        style={{ 
          minWidth: '320px', 
          height: '220px', 
          display: 'flex', 
          background: '#0a0a0a',
          flexShrink: 0,
          borderRadius: '12px',
          marginRight: '1rem',
          cursor: 'pointer'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setSelectedProject(item)}
      >
        <div style={{ flex: 6, position: 'relative', overflow: 'hidden', borderRadius: '12px 0 0 12px' }}>
          <img src={item.preview} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div
          style={{ flex: 4, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '0 12px 12px 0' }}
          onMouseEnter={() => setTitleHovered(true)}
          onMouseLeave={() => setTitleHovered(false)}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', textDecoration: titleHovered ? 'underline' : 'none', textUnderlineOffset: '3px' }}>{item.title}</h4>
            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
            {item.category && (
              <span style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.25rem 0.5rem', background: '#1a1a1a', color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {item.category}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D />
      
      <div style={{ position: 'relative', zIndex: 10, padding: '6rem 2rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Services</h1>
          <p style={{ color: '#ffffff', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            What can I do for you?
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', maxWidth: '1400px', margin: '0 auto 2rem', padding: '0 2rem' }}>
          {services.map((service, index) => (
            <TiltCard
              key={service.title}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.2 }}
                onClick={() => setSelectedService(service)}
                style={{ 
                  height: '240px',
                  padding: '1.5rem', 
                  background: 'rgba(10, 10, 10, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
                whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.3)' }}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{service.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', color: '#fff' }}>
                    {service.title}
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem', paddingTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff' }}>Featured Work</h2>
          <div ref={outerRef} style={{ overflow: 'hidden', width: '100%', padding: '8px 0' }}
            onMouseEnter={() => { isPausedRef.current = true }}
            onMouseLeave={() => { isPausedRef.current = false }}
          >
            <div ref={trackRef} style={{ display: 'flex', gap: '1rem', willChange: 'transform' }}>
              {twoCopies.map((item: Project, idx: number) => (
                <Tile key={`tile-${idx}`} item={item} index={idx % pinned.length} />
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <Link href="/contact">
            <motion.button
        whileHover={{ scale: 1.05, transition: { duration: 0, type: 'tween' } }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 40px',
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                cursor: 'pointer'
              }}
            >
              Contact Me
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {selectedService && (
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
          onClick={() => setSelectedService(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              maxWidth: 700, 
              width: '100%', 
              background: '#0a0a0a', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ height: 250, overflow: 'hidden', position: 'relative' }}>
              <img 
                src={selectedService.image} 
                alt={selectedService.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button 
              onClick={() => setSelectedService(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                lineHeight: 1
              }}
            >
              {'✕'}
            </button>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>{selectedService.icon}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>
                  {selectedService.title}
                </h2>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {selectedService.desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem' }}>
                <span>Have doubts? Check my</span>
                <Link href={`/work?category=${encodeURIComponent(selectedService.title)}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '6px 16px',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Work
                  </motion.button>
                </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                {selectedService.title === 'Full Stack Dev' && <span>Got a project in mind?</span>}
                {selectedService.title === 'AI & Automation' && <span>Have a workflow you want to automate?</span>}
                {selectedService.title === 'Content Creation' && <span>Ready to level up your content?</span>}
                {selectedService.title === 'Thumbnail Creation' && <span>Need a thumbnail that gets clicks?</span>}
                {selectedService.title === 'Video Editing' && <span>Got footage that needs editing?</span>}
                {selectedService.title === 'Algo Trading' && <span>Have a strategy you wanna automate?</span>}
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '6px 16px',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Get in Touch
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  )
}

