"use client";
import React from 'react'
import Link from 'next/link'
import Hero3D from '../components/Hero3D'
import { motion } from 'framer-motion'
import { categories } from '../lib/categories'

export default function HomeClient() {
  return (
    <section style={{ background: '#000' }}>
      <div className="hero" id="home" style={{ position: 'relative' }}>
        <Hero3D />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="portrait">
            <img
              src="/images/portrait-trans.png"
              alt="Anshul Rajpal - Full Stack Developer & Content Creator"
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
            />
          </div>

          <div className="big-letters">ANSHUL</div>

          <div className="fixed-right-cats">
            {categories.map((txt) => (
              <Link key={txt} href={`/work?category=${encodeURIComponent(txt)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="cat-link">
                  {txt}
                </div>
              </Link>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  )
}
