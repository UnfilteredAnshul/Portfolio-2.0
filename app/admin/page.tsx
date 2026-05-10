"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createHash, randomBytes } from 'crypto'
import Hero3D from '../../components/Hero3D'

interface AdminSession {
  token: string;
  expires: number;
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex')
}

const SALT = process.env.NEXT_PUBLIC_ADMIN_SALT || 'portfolio_admin_salt_v1'
const STORED_HASH = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || ''

const SESSION_COOKIE = 'admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const session = getCookie(SESSION_COOKIE)
    if (session) {
      try {
        const decoded = JSON.parse(Buffer.from(session, 'hex').toString()) as AdminSession
        if (decoded.expires > Date.now()) {
          router.push('/admin/projects')
          return
        }
      } catch {
        deleteCookie(SESSION_COOKIE)
      }
    }
  }, [router])

  useEffect(() => {
    if (!locked) return
    const interval = setInterval(() => {
      setLockTimer(prev => {
        if (prev <= 1) {
          setLocked(false)
          setAttempts(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [locked])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    setLoading(true)
    setError(false)

    await new Promise(resolve => setTimeout(resolve, 500))

    const inputHash = hashPassword(password, SALT)

    if (inputHash === STORED_HASH) {
      const session: AdminSession = {
        token: generateToken(),
        expires: Date.now() + SESSION_DURATION
      }
      const encoded = Buffer.from(JSON.stringify(session)).toString('hex')
      setCookie(SESSION_COOKIE, encoded, 7)
      router.push('/admin/projects')
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(true)
      setPassword('')

      if (newAttempts >= 5) {
        setLocked(true)
        setLockTimer(60)
      }
    }
    setLoading(false)
  }

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Hero3D />
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '3rem',
        background: 'rgba(10, 10, 10, 0.9)',
        border: '1px solid #222',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: '0.5rem'
          }}>Admin Access</h1>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder={locked ? `Locked (${lockTimer}s)` : 'Enter password'}
              disabled={locked}
              autoFocus
              style={{
                width: '100%',
                padding: '1rem',
                background: '#111',
                border: error ? '1px solid #ff4444' : '1px solid #333',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = error ? '#ff4444' : '#555'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? '#ff4444' : '#333'
              }}
            />
          </div>

          {error && (
            <p style={{
              color: '#ff4444',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {locked ? `Too many attempts. Try again in ${lockTimer}s.` : 'Invalid password'}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || locked || !password}
            style={{
              width: '100%',
              padding: '1rem',
              background: locked ? '#333' : '#fff',
              color: locked ? '#666' : '#000',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              cursor: locked ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s'
            }}
          >
            {loading ? 'Verifying...' : locked ? 'Locked' : 'Access'}
          </button>
        </form>
      </div>
    </section>
  )
}