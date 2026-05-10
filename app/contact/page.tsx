"use client";
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Hero3D from '../../components/Hero3D'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D />
      
      <div style={{ position: 'relative', zIndex: 10, padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Contact</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Have a project in mind? Let's work together to bring your ideas to life.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          style={{ width: '100%', maxWidth: 500, display: 'grid', gap: '1.5rem' }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>Your Name</label>
            <input 
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '1rem 1.25rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                color: '#fff', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>Email</label>
            <input 
              placeholder="john@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '1rem 1.25rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                color: '#fff', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>Message</label>
            <textarea 
              placeholder="Tell me about your project..."
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '1rem 1.25rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                color: '#fff', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>
          
          <motion.button 
            type="submit" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              padding: '1rem 2rem', 
              background: '#fff', 
              color: '#000', 
              border: 'none',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            {submitted ? '✓ Sent!' : 'Send Message'}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '4rem', textAlign: 'center' }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', marginBottom: '1rem' }}>Or reach out directly</p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="mailto:contact.unfiltered.anshul@gmail.com"
              style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Email
            </a>
            <a 
              href="tel:+919322309947"
              style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Phone
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}