import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/api-auth'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DRIVE_BASE = 'https://www.googleapis.com/drive/v3/files/'
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink'

let cachedToken: { accessToken: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.error || 'Failed to get access token')

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000 - 60000,
  }

  return data.access_token
}

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError.error

  try {
    const { name, type, data } = await request.json()
    if (!name || !type || !data) {
      return NextResponse.json({ error: 'Missing file data' }, { status: 400 })
    }

    const buffer = Buffer.from(data, 'base64')
    const sizeLimit = 350 * 1024 * 1024
    if (buffer.length > sizeLimit) {
      return NextResponse.json({ error: `File too large (${(buffer.length / 1048576).toFixed(1)} MB). Max 350 MB.` }, { status: 400 })
    }

    const accessToken = await getAccessToken()
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!rootId) return NextResponse.json({ error: 'GOOGLE_DRIVE_FOLDER_ID not set' }, { status: 500 })

    const boundary = `drive_boundary_${Math.random().toString(36).slice(2)}`

    const metadataStr = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: [rootId] })}\r\n`
    const fileHeader = `--${boundary}\r\nContent-Type: ${type}\r\n\r\n`
    const footer = `\r\n--${boundary}--\r\n`

    const body = Buffer.concat([
      Buffer.from(metadataStr, 'utf-8'),
      Buffer.from(fileHeader, 'utf-8'),
      buffer,
      Buffer.from(footer, 'utf-8'),
    ])

    const uploadRes = await fetch(DRIVE_UPLOAD, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    })

    const uploadResult = await uploadRes.json()
    if (!uploadRes.ok) {
      return NextResponse.json({ error: uploadResult.error?.message || 'Drive upload failed' }, { status: uploadRes.status })
    }

    const fileId = uploadResult.id

    const permRes = await fetch(`${DRIVE_BASE}${fileId}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    })

    let permError: string | null = null
    if (!permRes.ok) {
      const permErr = await permRes.json()
      permError = permErr.error?.message || permErr.error || 'Permission error'
    }

    const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`

    return NextResponse.json({ url, fileId, permError })
  } catch (error: any) {
    console.error('Upload error:', error)
    const message = error?.message || error?.toString() || 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
