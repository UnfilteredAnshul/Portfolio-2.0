"use client";
import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export function AnimatedSkeleton({ width = '100%', height = '100%', borderRadius = '8px', style }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.02) 100%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  )
}

export function TextSkeleton({ width = '60%', height = 14 }: { width?: string | number; height?: number }) {
  return <AnimatedSkeleton width={width} height={height} borderRadius="4px" />
}

export function CardSkeleton() {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', background: 'rgba(10,10,10,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <AnimatedSkeleton height={180} borderRadius="0" />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <TextSkeleton width="75%" height={16} />
        <TextSkeleton width="100%" height={12} />
        <TextSkeleton width="40%" height={12} />
        <div style={{ marginTop: '0.25rem' }}>
          <AnimatedSkeleton width={100} height={24} borderRadius="4px" />
        </div>
      </div>
    </div>
  )
}
