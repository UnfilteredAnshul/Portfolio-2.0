import { NextRequest, NextResponse } from 'next/server'
import { createSession, verifyTempToken } from '../../../../lib/session'
import { verify } from 'otplib'

export async function POST(request: NextRequest) {
  try {
    const { code, tempToken } = await request.json()
    if (!code || !tempToken)
      return NextResponse.json({ error: 'Missing code or token' }, { status: 400 })

    const payload = await verifyTempToken(tempToken)
    if (!payload)
      return NextResponse.json({ error: 'Expired or invalid token' }, { status: 401 })

    const secret = process.env.TOTP_SECRET
    if (!secret)
      return NextResponse.json({ error: '2FA not configured' }, { status: 500 })

    const isValid = verify({ token: code, secret })
    if (!isValid)
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || ''

    const session = await createSession({ email: payload.email, ip, totpVerified: true })
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Verification failed' }, { status: 500 })
  }
}
