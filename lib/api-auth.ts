import { NextRequest } from 'next/server'
import { verifySession } from './session'

export async function requireAdmin(request: NextRequest): Promise<{ error: Response } | null> {
  const sessionCookie = request.cookies.get('admin_session')?.value
  if (!sessionCookie) {
    return { error: new Response('Unauthorized', { status: 401 }) }
  }
  const payload = await verifySession(sessionCookie)
  if (!payload) {
    return { error: new Response('Unauthorized', { status: 401 }) }
  }
  return null
}
