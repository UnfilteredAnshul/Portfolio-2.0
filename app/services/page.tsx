"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Hero3D from '../../components/Hero3D'
import data from '../../data/projects.json'

type Project = typeof data[number]

const services = [
  { 
    title: 'Development', 
    icon: '💻',
    desc: 'Full-stack web development using modern frameworks like Next.js, React, and Node.js. Building responsive, performant applications with clean code architecture.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
  },
  { 
    title: 'AI & Automation', 
    icon: '🤖',
    desc: 'Implementing AI solutions for business automation. From chatbots to workflow automation, leveraging cutting-edge AI tools to streamline operations.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
  },
  { 
    title: 'Content Creation', 
    icon: '🎬',
    desc: 'Creating engaging content for streaming, social media, and YouTube. Stream design, overlays, thumbnails, and full content strategies.',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3037c9bb?w=800'
  },
  { 
    title: 'Video Editing', 
    icon: '🎥',
    desc: 'Professional video editing using Premiere Pro, After Effects, and Da Vinci Resolve. Color grading, motion graphics, and post-production services.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800'
  },
  { 
    title: 'Trading', 
    icon: '📈',
    desc: 'Technical analysis and trading strategies for financial markets. Strategy development, backtesting, and market research services.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
  }
]

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<typeof services[number] | null>(null)
  const all = data as Project[]
  const pinned = useMemo(() => all.filter(p => p.pinned).slice(0, 4), [all])
  const twoCopies = useMemo(() => [...pinned, ...pinned], [pinned])
  const trackRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const outer = outerRef.current
    if (!track || !outer) return

    let animationId: number
    let lastTime = 0
    const speed = 0.08

    const animate = (currentTime: number) => {
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
    return (
      <motion.div 
        style={{ 
          minWidth: '280px', 
          height: '160px', 
          display: 'flex', 
          background: '#0a0a0a',
          flexShrink: 0,
          borderRadius: '12px',
          marginRight: '1rem'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <Link href={`/project/${item.slug}`} style={{ flex: 3, position: 'relative', overflow: 'hidden', borderRadius: '12px 0 0 12px' }}>
          <img src={item.preview} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Link>
        <div style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '0 12px 12px 0' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>{item.title}</h4>
            <p style={{ marginTop: '0.25rem', color: '#666', fontSize: '0.7rem', lineHeight: 1.4 }}>{item.description.slice(0, 50)}{item.description.length > 50 ? '…' : ''}</p>
            {item.category && (
              <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.4rem', background: '#1a1a1a', color: '#888', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            What can I do for you?
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', maxWidth: '1400px', margin: '0 auto 4rem', padding: '0 2rem' }}>
          {services.map((service, index) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => setSelectedService(service)}
              style={{ 
                padding: '1.25rem', 
                background: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{service.icon}</div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: '#fff' }}>
                {service.title}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem', lineHeight: 1.5, margin: 0, textAlign: 'center' }}>
                {service.desc.slice(0, 60)}...
              </p>
            </motion.div>
          ))}
        </div>

        <div style={{ marginBottom: '2rem', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>Featured Work</h2>
          <div ref={outerRef} style={{ overflow: 'hidden', width: '100%' }}>
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
              whileHover={{ scale: 1.05 }}
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
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                backdropFilter: 'blur(4px)'
              }}
            >
              Close
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
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '12px 32px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: 'pointer'
                  }}
                >
                  Get in Touch
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}