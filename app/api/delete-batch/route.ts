import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/api-auth'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DRIVE_BASE = 'https://www.googleapis.com/drive/v3/files/'

let cachedToken: { accessToken: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.accessToken
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
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 - 60000 }
  return data.access_token
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError.error

  try {
    const { fileIds } = await request.json()
    if (!fileIds?.length) return NextResponse.json({ deleted: 0 })

    const accessToken = await getAccessToken()
    let deleted = 0

    for (const fileId of fileIds) {
      try {
        const deleteRes = await fetch(`${DRIVE_BASE}${fileId}?supportsAllDrives=true`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (deleteRes.ok) deleted++
      } catch { /* skip individual failures */ }
    }

    return NextResponse.json({ deleted })
  } catch (error: any) {
    console.error('Delete batch error:', error)
    return NextResponse.json({ error: error?.message || 'Batch delete failed' }, { status: 500 })
  }
}
