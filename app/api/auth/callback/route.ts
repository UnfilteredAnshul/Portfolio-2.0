import { NextRequest, NextResponse } from 'next/server'
import { createSession, createTempToken } from '../../../../lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error)
      return NextResponse.redirect(new URL('/cmdpanel/login?error=' + error, request.url))

    if (!code)
      return NextResponse.redirect(new URL('/cmdpanel/login?error=missing_code', request.url))

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
    const adminEmail = process.env.ADMIN_EMAIL

    if (!clientId || !clientSecret || !adminEmail)
      return NextResponse.redirect(new URL('/cmdpanel/login?error=config', request.url))

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${request.nextUrl.origin}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('Token exchange error:', tokenData)
      return NextResponse.redirect(new URL('/cmdpanel/login?error=token_exchange', request.url))
    }

    const idToken = tokenData.id_token
    if (!idToken)
      return NextResponse.redirect(new URL('/cmdpanel/login?error=no_id_token', request.url))

    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    const data = await verifyRes.json()

    if (!verifyRes.ok) {
      console.error('Token info error:', await verifyRes.text().catch(() => ''))
      return NextResponse.redirect(new URL('/cmdpanel/login?error=invalid_token', request.url))
    }

    if (data.aud !== clientId)
      return NextResponse.redirect(new URL('/cmdpanel/login?error=audience', request.url))

    if (data.email_verified !== 'true' || data.email !== adminEmail)
      return NextResponse.redirect(new URL('/cmdpanel/login?error=unauthorized', request.url))

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || ''

    const totpEnabled = process.env.TOTP_ENABLED === 'true' && !!process.env.TOTP_SECRET

    if (totpEnabled) {
      const tempToken = encodeURIComponent(await createTempToken(data.email))
      const response = NextResponse.redirect(new URL(`/cmdpanel/login?step=totp&token=${tempToken}`, request.url))
      return response
    }

    const session = await createSession({ email: data.email, ip, totpVerified: false })
    const response = NextResponse.redirect(new URL('/cmdpanel/manager?session=new', request.url))
    response.cookies.set('admin_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(new URL('/cmdpanel/login?error=server_error', request.url))
  }
}
