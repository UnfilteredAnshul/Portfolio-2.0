import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/api-auth'

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

async function findOrCreateFolder(accessToken: string, name: string, parentId: string): Promise<string> {
  const q = `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const searchRes = await fetch(`${DRIVE_BASE}?q=${encodeURIComponent(q)}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const searchResult = await searchRes.json()
  if (searchResult.files?.length > 0) return searchResult.files[0].id

  const createRes = await fetch(`${DRIVE_BASE}?supportsAllDrives=true&fields=id`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
  })
  const created = await createRes.json()
  if (!createRes.ok) throw new Error(created.error?.message || 'Failed to create folder')
  return created.id
}

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError.error

  try {
    const { files, category, title, sourceFolderId } = await request.json()
    if (!files?.length || !category || !title) {
      return NextResponse.json({ error: 'Missing files, category, or title' }, { status: 400 })
    }

    const accessToken = await getAccessToken()
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!rootId) return NextResponse.json({ error: 'GOOGLE_DRIVE_FOLDER_ID not set' }, { status: 500 })

    // Ensure category folder exists inside root
    const catFolderId = await findOrCreateFolder(accessToken, category, rootId)

    // Ensure project title folder exists inside category folder
    const projectFolderId = await findOrCreateFolder(accessToken, title, catFolderId)

    // Move and rename each file
    const parentsToRemove: string[] = []
    if (rootId && rootId !== projectFolderId) parentsToRemove.push(rootId)
    if (sourceFolderId && sourceFolderId !== projectFolderId) parentsToRemove.push(sourceFolderId)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name?.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : ''
      const newName = `#${i + 1}${ext}`

      let moveParams = ''
      if (parentsToRemove.length > 0) {
        moveParams = `&addParents=${projectFolderId}${parentsToRemove.map(id => `&removeParents=${id}`).join('')}`
      } else if (sourceFolderId === projectFolderId) {
        // Already in the right folder — just rename
      }

      const updateUrl = `${DRIVE_BASE}${file.fileId}?supportsAllDrives=true${moveParams}`
      const updateRes = await fetch(updateUrl, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (!updateRes.ok) {
        const err = await updateRes.json().catch(() => ({}))
        throw new Error(err.error?.message || `Failed to rename ${file.name}`)
      }
    }

    // Clean up old project folder if files were moved
    if (sourceFolderId && sourceFolderId !== projectFolderId) {
      try {
        const checkUrl = `${DRIVE_BASE}?q=${encodeURIComponent(`'${sourceFolderId}' in parents and trashed=false`)}&fields=files(id)`
        const checkRes = await fetch(checkUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
        const checkData = await checkRes.json()
        if (!checkData.files?.length) {
          await fetch(`${DRIVE_BASE}${sourceFolderId}?supportsAllDrives=true`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        }
      } catch { /* silent — don't block save on cleanup failures */ }
    }

    return NextResponse.json({ success: true, projectFolderId })
  } catch (error: any) {
    console.error('Organize error:', error)
    return NextResponse.json({ error: error?.message || 'Organization failed' }, { status: 500 })
  }
}
