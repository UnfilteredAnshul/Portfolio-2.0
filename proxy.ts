import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (pathname.startsWith('/cmdpanel')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || ''

    const adminIp = process.env.ADMIN_IP
    if (adminIp && clientIp !== adminIp)
      return new NextResponse(null, { status: 404, statusText: 'Not Found' })

    if (pathname === '/cmdpanel/login') {
      const sessionCookie = request.cookies.get('admin_session')?.value
      if (sessionCookie) {
        const payload = await verifySession(sessionCookie)
        if (payload)
          return NextResponse.redirect(new URL('/cmdpanel/manager', request.url))
      }
      return response
    }

    if (pathname === '/cmdpanel/setup-2fa')
      return response

    const sessionCookie = request.cookies.get('admin_session')?.value
    if (!sessionCookie)
      return NextResponse.redirect(new URL('/cmdpanel/login', request.url))

    const payload = await verifySession(sessionCookie)
    if (!payload)
      return NextResponse.redirect(new URL('/cmdpanel/login', request.url))

    if (payload.ip && payload.ip !== clientIp) {
      const res = NextResponse.redirect(new URL('/cmdpanel/login', request.url))
      res.cookies.set('admin_session', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|_vercel).*)'],
}
