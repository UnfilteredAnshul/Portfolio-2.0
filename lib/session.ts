const SESSION_DURATION = 24 * 60 * 60 * 1000

export interface SessionPayload {
  email: string
  ip: string
  totpVerified: boolean
  exp: number
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  return bytes.buffer as ArrayBuffer
}

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(str: string): string {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

export async function createSession(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const data = b64url(JSON.stringify({ ...payload, exp: Date.now() + SESSION_DURATION }))
  const sig = await crypto.subtle.sign('HMAC', await getKey(process.env.SESSION_SECRET!), new TextEncoder().encode(data))
  return `${data}.${bytesToHex(sig)}`
}

export async function verifySession(cookie: string): Promise<SessionPayload | null> {
  const [data, sig] = cookie.split('.')
  if (!data || !sig) return null
  const secret = process.env.SESSION_SECRET
  if (!secret) return null

  const key = await getKey(secret)
  const valid = await crypto.subtle.verify('HMAC', key, hexToBytes(sig), new TextEncoder().encode(data))
  if (!valid) return null

  const payload: SessionPayload = JSON.parse(fromB64url(data))
  if (Date.now() > payload.exp) return null
  return payload
}

export async function createTempToken(email: string): Promise<string> {
  const data = b64url(JSON.stringify({ email, verifiedByGoogle: true, exp: Date.now() + 5 * 60 * 1000 }))
  const sig = await crypto.subtle.sign('HMAC', await getKey(process.env.SESSION_SECRET!), new TextEncoder().encode(data))
  return `${data}.${bytesToHex(sig)}`
}

export async function verifyTempToken(token: string): Promise<{ email: string } | null> {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const secret = process.env.SESSION_SECRET
  if (!secret) return null

  const key = await getKey(secret)
  const valid = await crypto.subtle.verify('HMAC', key, hexToBytes(sig), new TextEncoder().encode(data))
  if (!valid) return null

  const payload = JSON.parse(fromB64url(data))
  if (!payload.verifiedByGoogle || Date.now() > payload.exp) return null
  return { email: payload.email }
}
