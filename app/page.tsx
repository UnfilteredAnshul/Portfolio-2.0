"use client";
import React from 'react'
import Link from 'next/link'
import Hero3D from '../components/Hero3D'
import { motion } from 'framer-motion'

export default function HomePage() {

  return (
    <section style={{ background: '#000' }}>
      <div className="hero" id="home" style={{ position: 'relative' }}>
        <Hero3D />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="portrait">
            <img
              src="/images/portrait-trans.png"
              alt="Portrait"
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
            />
          </div>

          <div className="big-letters">ANSHUL</div>

          <div className="fixed-right-cats">
            {['Development', 'AI & Automation', 'Content Creation', 'Video Editing', 'Trading'].map((txt) => (
              <div key={txt} className="cat-link">
                {txt}
              </div>
            ))}
          </div>
          
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 20 }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#888' }}>Scroll down</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fff' }}>My Work</span>
            <div style={{ width: '1px', height: '30px', background: '#fff', marginTop: '0.5rem' }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}
