import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'otplib'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    const secret = process.env.TOTP_SECRET

    if (!secret)
      return NextResponse.json({ error: '2FA not configured' }, { status: 500 })
    if (!code)
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const isValid = verify({ token: code, secret })
    if (!isValid)
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Verification failed' }, { status: 500 })
  }
}
