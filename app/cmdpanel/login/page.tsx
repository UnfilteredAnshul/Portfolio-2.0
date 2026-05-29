"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#000',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '3rem',
  width: '100%',
  maxWidth: '420px',
  textAlign: 'center',
}

const headingStyle: React.CSSProperties = {
  color: '#fff',
  fontSize: '1.5rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
}

const subStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.85rem',
  marginBottom: '2rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '1.2rem',
  textAlign: 'center',
  letterSpacing: '0.3em',
  outline: 'none',
  marginBottom: '1rem',
  boxSizing: 'border-box',
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '14px 24px',
  background: '#fff',
  border: 'none',
  borderRadius: '8px',
  color: '#333',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
}

const errorStyle: React.CSSProperties = {
  color: '#ff4444',
  fontSize: '0.8rem',
  marginBottom: '1rem',
}

export default function AdminLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'google' | 'totp'>('google')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tempToken, setTempToken] = useState('')

  useEffect(() => {
    setTempToken(searchParams.get('token') || '')
    if (searchParams.get('step') === 'totp') setStep('totp')
    const err = searchParams.get('error')
    if (err) {
      const messages: Record<string, string> = {
        unauthorized: 'This Google account is not authorized. Use the admin email.',
        audience: 'OAuth client mismatch. Contact admin.',
        token_exchange: 'Google token exchange failed. Try again.',
        invalid_token: 'Invalid Google token. Try again.',
        config: 'Server configuration error.',
        missing_code: 'Missing authorization code.',
        server_error: 'Server error. Try again.',
        access_denied: 'Access denied by Google.',
        invalid_grant: 'Authorization expired or invalid. Try again.',
        invalid_client: 'OAuth client ID or secret is wrong on the server.',
      }
      setError(messages[err] || `Error: ${err}`)
    }
  }, [searchParams])

  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!totpCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode.trim(), tempToken }),
      })
      const data = await res.json()
      if (data.success) router.push('/cmdpanel/manager?session=new')
      else {
        console.error('TOTP error:', data)
        setError(data?.error || 'Verification failed')
      }
    } catch (err) {
      console.error('TOTP fetch error:', err)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={containerStyle}>
      <div style={cardStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        {step === 'google' ? (
          <>
            <h1 style={headingStyle}>Admin Access</h1>
            <p style={subStyle}>Sign in with your Google account</p>
            <button onClick={() => {
                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
                const redirectUri = `${window.location.origin}/api/auth/callback`
                const params = new URLSearchParams({
                  client_id: clientId,
                  redirect_uri: redirectUri,
                  response_type: 'code',
                  scope: 'openid email profile',
                  access_type: 'online',
                  prompt: 'select_account',
                })
                window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
              }}
              style={btnStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign in with Google
            </button>
          </>
        ) : (
          <form onSubmit={handleTotpSubmit}>
            <h1 style={headingStyle}>Two-Factor Auth</h1>
            <p style={subStyle}>Enter the code from your authenticator app</p>
            <input
              style={inputStyle}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              onContextMenu={e => {
                e.preventDefault()
                navigator.clipboard.readText().then(text => {
                  setTotpCode(text.replace(/\D/g, '').slice(0, 6))
                }).catch(() => {})
              }}
            />
            <button
              type="submit"
              style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', color: '#fff', opacity: loading ? 0.5 : 1 }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
