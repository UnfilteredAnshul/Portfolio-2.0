'use client';
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import Hero3D from '../../components/Hero3D'

const checkVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1, transition: { duration: 0.5, delay: 0.1, ease: 'easeInOut' } },
}

export default function ContactClient() {
  const formRef = useRef<HTMLFormElement>(null)
  const botRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [rateLimited, setRateLimited] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (botRef.current?.value) return
    const form = formRef.current
    if (!form) return

    const lastSent = localStorage.getItem('contact_last_sent')
    if (lastSent) {
      const elapsed = Date.now() - parseInt(lastSent)
      if (elapsed < FIVE_DAYS) {
        const remaining = FIVE_DAYS - elapsed
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
        setTimeLeft(days > 0 ? `${days}d ${hours}h` : `${hours}h`)
        setRateLimited(true)
        return
      }
    }

    setLoading(true)
    setError('')
    const formData = new FormData(form)
    formData.append('access_key', '8ec472af-4a13-4a80-b6d4-a82e5a415064')
    formData.append('from_name', formData.get('name') as string)
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
      if (res.ok) {
        localStorage.setItem('contact_last_sent', Date.now().toString())
        setSubmitted(true)
        setTimeout(() => { setSubmitted(false); form.reset() }, 3000)
      } else {
        setError('Something went wrong')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ minHeight: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <Hero3D />
      <div style={{ position: 'relative', zIndex: 10, padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Contact Me</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', lineHeight: 1.6 }}>Have a project in mind? Let's work together to bring your ideas to life.</p>
        </motion.div>
        <motion.form ref={formRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit}
          style={{ width: '100%', maxWidth: 520, background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '2.5rem', display: 'grid', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <input ref={botRef} name='botcheck' type='text' style={{ display: 'none' }} tabIndex={-1} autoComplete='off' />
          <div><label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>Your Name</label>
            <input name='name' placeholder='John Doe' required style={{ width: '100%', padding: '0.9rem 1.25rem', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s ease' }} /></div>
          <div><label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>Email</label>
            <input name='email' placeholder='john@example.com' type='email' required style={{ width: '100%', padding: '0.9rem 1.25rem', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s ease' }} /></div>
          <div><label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>Subject</label>
            <input name='subject' placeholder='Project Inquiry' required style={{ width: '100%', padding: '0.9rem 1.25rem', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.3s ease' }} /></div>
          <div><label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>Message</label>
            <textarea name='message' placeholder='Tell me about your project...' rows={5} required style={{ width: '100%', padding: '0.9rem 1.25rem', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', resize: 'vertical', minHeight: '120px', transition: 'border-color 0.3s ease' }} /></div>
          <motion.button type='submit' disabled={loading} whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.98 }}
            style={{ padding: '0.9rem 2rem', background: loading ? 'rgba(255,255,255,0.3)' : '#fff', color: '#000', border: 'none', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'all 0.3s ease' }}>
            {loading ? (<span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Sending</span>) : 'Send Message'}</motion.button>
          {error && <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>{error}</motion.p>}
          <AnimatePresence>{submitted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(8px)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 20 }}>
              <svg width='64' height='64' viewBox='0 0 64 64' fill='none'>
                <motion.circle cx='32' cy='32' r='30' stroke='#4ade80' strokeWidth='3' fill='none' initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: 'easeInOut' }} />
                <motion.path d='M20 32l8 8 16-16' stroke='#4ade80' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' fill='none' variants={checkVariants} initial='hidden' animate='visible' />
              </svg>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ color: '#4ade80', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Message Sent!</motion.p>
            </motion.div>
          )}</AnimatePresence>

          <AnimatePresence>
            {rateLimited && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.92)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center',
                  zIndex: 20,
                }}
              >
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                  Wait for a reply or contact directly on{' '}
                  <a
                    href="https://www.instagram.com/shutup.krish/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    Instagram
                  </a>
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>
                  (Comparatively faster replies)
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', marginTop: '1rem' }}>
                  Try again in {timeLeft}
                </p>
                <button
                  onClick={() => setRateLimited(false)}
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.6rem 2rem',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Got it
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  )
}