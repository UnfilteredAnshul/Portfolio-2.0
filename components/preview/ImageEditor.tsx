"use client";
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

interface ImageEditorProps {
  src: string
  alt?: string
  style?: React.CSSProperties
}

export function ImageEditor({ src, alt = '', style }: ImageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 })
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setImageLoaded(false)
    setImageSize({ w: 0, h: 0 })
  }, [src])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setContainerSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale((prev) => Math.max(0.1, Math.min(5, prev + delta)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const fitScale = useMemo(() => {
    if (!containerSize.w || !containerSize.h || !imageSize.w || !imageSize.h) return 1
    return Math.min(containerSize.w / imageSize.w, containerSize.h / imageSize.h)
  }, [containerSize, imageSize])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { x: position.x, y: position.y }
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy })
  }, [isDragging])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageSize({ w: img.naturalWidth, h: img.naturalHeight })
    setImageLoaded(true)
  }, [])

  const zoomIn = useCallback(() => setScale((p) => Math.min(5, p + 0.25)), [])
  const zoomOut = useCallback(() => setScale((p) => Math.max(0.1, p - 0.25)), [])
  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000', ...style }}
      ref={containerRef}>
      <div style={{
        position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10,
        display: 'flex', gap: '0.25rem', flexDirection: 'column',
      }}>
        <button onMouseDown={(e) => { e.stopPropagation(); zoomIn() }}
          style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          +
        </button>
        <button onMouseDown={(e) => { e.stopPropagation(); zoomOut() }}
          style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          −
        </button>
        <span style={{
          width: 28, height: 20, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.6)', borderRadius: '4px', fontSize: '0.6rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
        }}>
          {Math.round(scale * 100)}%
        </span>
        <button onMouseDown={(e) => { e.stopPropagation(); resetView() }}
          style={{ width: 28, height: 20, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          ↺
        </button>
      </div>

      <motion.div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
        }}>
        {!imageLoaded && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', background: '#111',
          }}>
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '80%', height: '80%', borderRadius: '8px', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.03) 100%)', backgroundSize: '200% 100%' }}
            />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={() => setImageLoaded(false)}
          draggable={false}
          style={{
            maxWidth: 'none',
            maxHeight: 'none',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale * fitScale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
            willChange: 'transform',
            opacity: imageLoaded ? 1 : 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }} />
      </motion.div>
    </div>
  )
}
