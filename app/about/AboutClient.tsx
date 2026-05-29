"use client";
import React from 'react'
import { motion } from 'framer-motion'
import Hero3D from '../../components/Hero3D'

export default function AboutClient() {
  return (
    <section style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D />
      
      <div style={{ position: 'relative', zIndex: 10, padding: '6rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem', background: 'rgba(10, 10, 10, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Anshul Rajpal</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>Full Stack Dev • AI & Automation • Content Creator • Video Editor • Algo Trader</p>
          </div>
          <motion.a 
            href="https://docs.google.com/document/d/13ptY8dRRdw4OOX0QGe599bq7225Ofa9p/edit?usp=sharing&ouid=107496386399474844171&rtpof=true&sd=true" 
            target="_blank" 
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#fff', 
              color: '#000', 
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textDecoration: 'none',
              display: 'inline-block',
              borderRadius: '8px'
            }}
          >
            Download My Resume
          </motion.a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '2rem', background: 'rgba(10, 10, 10, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1rem' }}>About Me</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            I am a versatile creative professional with a diverse skill set spanning web development, content creation, video editing, and financial trading. Over the years, I have had the privilege of working with international clients across multiple industries, delivering high-quality work that exceeds expectations. My journey began in 2019 when I started as a freelancer, and since then, I have continuously evolved, adapting to new technologies and mastering various tools to stay at the forefront of digital innovation. Whether it's building websites, crafting compelling visual content, editing professional videos, or analyzing market trends. I approach every project with dedication, creativity, and a problem-solving mindset. I believe in smart working, efficient time management, and delivering results that make a real impact.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '2rem', background: 'rgba(10, 10, 10, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1.5rem' }}>Experience</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Web Developer / Full Stack Dev (Freelancer)</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>2019 - Present</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>Building modern, performant websites and web applications for international clients.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Social Media Manager / Content Creator</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>2024 - Present</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>Managing social media presence and creating engaging content for fun.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Algo Trader</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>2025 - Present</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>Algorithmic trading using automated strategies, market analysis, and risk management.</p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Professional Video Editor (Freelancer)</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>2019 - 2023</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>Video editing for various clients and for fun. Mastery in Major editing softwares.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}
        >
          <div style={{ flex: '1 1 300px', background: 'rgba(10, 10, 10, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1rem' }}>Education</h2>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Computer Science Majors</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>2024 • 8.14 CGPI</span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>HSC</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>2021 • 82.5%</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>SSC</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>2019 • 73%</span>
              </div>
            </div>
          </div>
          <div style={{ flex: '1 1 300px', background: 'rgba(10, 10, 10, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1rem' }}>Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {['Full Stack Dev', 'Vibe Coding', 'Video Editing', 'Content Creation', 'Leadership', 'Streaming', 'Algo Trading'].map((skill) => (
                <span 
                  key={skill}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    color: '#fff', 
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ background: 'rgba(10, 10, 10, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1rem' }}>Personal Information</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', lineHeight: 2 }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Location:</span> Amberath, Thane - 421503<br/>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Email:</span> contact.unfiltered.anshul@gmail.com<br/>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Age:</span> 23<br/>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Nationality:</span> Indian<br/>
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Languages:</span> English, Hindi, Sindhi, Marathi
          </p>
        </motion.div>
      </div>
    </section>
  )
}
