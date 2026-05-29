import { NextRequest, NextResponse } from 'next/server'
import { createSession, createTempToken } from '../../../../lib/session'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    if (!credential)
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })

    const clientId = process.env.GOOGLE_SIGNIN_CLIENT_ID
    const adminEmail = process.env.ADMIN_EMAIL
    if (!clientId || !adminEmail)
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })

    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    const data = await res.json()

    if (!res.ok)
      return NextResponse.json({ error: data.error_description || 'Invalid token' }, { status: 401 })

    if (data.aud !== clientId)
      return NextResponse.json({ error: 'Token audience mismatch' }, { status: 401 })

    if (data.email_verified !== 'true' || data.email !== adminEmail)
      return NextResponse.json({ error: 'Unauthorized email' }, { status: 403 })

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || ''

    const totpEnabled = process.env.TOTP_ENABLED === 'true' && !!process.env.TOTP_SECRET

    if (totpEnabled) {
      const tempToken = await createTempToken(data.email)
      return NextResponse.json({ totpRequired: true, tempToken })
    }

    const session = await createSession({ email: data.email, ip, totpVerified: false })
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 500 })
  }
}
