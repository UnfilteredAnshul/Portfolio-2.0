"use client"

import { useEffect, useState } from 'react'

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
  maxWidth: '480px',
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
  marginBottom: '1.5rem',
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
  width: '100%',
  padding: '12px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.9rem',
  cursor: 'pointer',
}

const successStyle: React.CSSProperties = {
  color: '#4ade80',
  fontSize: '0.9rem',
  marginBottom: '1rem',
}

export default function Setup2FA() {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/setup-2fa')
      .then(res => res.json())
      .then(data => {
        if (data.qrDataUrl) {
          setQrDataUrl(data.qrDataUrl)
          setSecret(data.secret)
        } else {
          setError('Something went wrong')
        }
      })
      .catch(() => setError('Something went wrong'))
      .finally(() => setLoading(false))
  }, [])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setVerified(true)
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
    <section style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Set Up Two-Factor Auth</h1>

        {loading && !verified && (
          <p style={subStyle}>Loading...</p>
        )}

        {error && (
          <p style={{ color: '#ff4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>
        )}

        {verified ? (
          <>
            <p style={successStyle}>2FA verified successfully!</p>
            <p style={subStyle}>
              Add these to your <strong>Vercel env vars</strong> (or .env.local) if not already set:
            </p>
            <pre style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem',
              textAlign: 'left',
              overflowX: 'auto',
            }}>
              {`TOTP_SECRET=${secret}\nTOTP_ENABLED=true`}
            </pre>
          </>
        ) : (
          <>
            <p style={subStyle}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>

            {qrDataUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img src={qrDataUrl} alt="2FA QR Code" style={{ borderRadius: '8px', maxWidth: '200px' }} />
              </div>
            )}

            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginBottom: '1rem' }}>
              Or enter key manually: <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{secret}</span>
            </p>

            <form onSubmit={handleVerify}>
              <input
                style={inputStyle}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
              />
              <button
                type="submit"
                style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
