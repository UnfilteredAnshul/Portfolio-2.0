import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { requireAdmin } from '../../../../lib/api-auth'

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError.error

  try {
    const secret = process.env.TOTP_SECRET
    if (!secret)
      return NextResponse.json({ error: '2FA not configured' }, { status: 500 })

    const email = process.env.ADMIN_EMAIL || 'admin'
    const encodedLabel = encodeURIComponent(`AnshulRajpal:${email}`)
    const encodedIssuer = encodeURIComponent('AnshulRajpal')
    const otpauth = `otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}`
    const qrDataUrl = await QRCode.toDataURL(otpauth)

    return NextResponse.json({ secret, qrDataUrl, otpauth })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Setup failed' }, { status: 500 })
  }
}
