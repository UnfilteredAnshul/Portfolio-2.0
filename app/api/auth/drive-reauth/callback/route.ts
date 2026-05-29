import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return new NextResponse(`
        <!DOCTYPE html><html><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
        <div style="text-align:center"><h1 style="color:#ff4444">Authorization Failed</h1>
        <p style="color:rgba(255,255,255,0.5)">${error === 'access_denied' ? 'Access denied' : error}</p>
        <a href="/cmdpanel/manager" style="color:#4ade80">Back to Manager</a></div></body></html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    if (!code) {
      return new NextResponse(`
        <!DOCTYPE html><html><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
        <div style="text-align:center"><h1 style="color:#ff4444">Missing Code</h1>
        <a href="/cmdpanel/manager" style="color:#4ade80">Back to Manager</a></div></body></html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return new NextResponse('OAuth not configured', { status: 500 })
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/drive-reauth/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.refresh_token) {
      const msg = tokenData.error_description || tokenData.error || 'Failed to get refresh token'
      return new NextResponse(`
        <!DOCTYPE html><html><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
        <div style="text-align:center"><h1 style="color:#ff4444">Token Exchange Failed</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:0.85rem">${msg}</p>
        <a href="/cmdpanel/manager" style="color:#4ade80">Back to Manager</a></div></body></html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    const rt = tokenData.refresh_token

    return new NextResponse(`
      <!DOCTYPE html><html><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
      <div style="text-align:center;max-width:560px;padding:2rem">
        <h1 style="color:#4ade80;font-size:1.3rem;margin-bottom:0.5rem">New Token Obtained</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin-bottom:1.5rem">
          Copy this and update your <strong>.env.local</strong> or Vercel env vars:
        </p>
        <pre style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:1rem;color:rgba(255,255,255,0.8);font-size:0.7rem;text-align:left;overflow-wrap:break-word;white-space:pre-wrap;word-break:break-all;margin-bottom:1.5rem">
GOOGLE_REFRESH_TOKEN=${rt}
        </pre>
        <div style="display:flex;gap:0.75rem;justify-content:center">
          <button onclick="navigator.clipboard.writeText('${rt}');this.textContent='Copied!'"
            style="padding:10px 20px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;cursor:pointer;font-size:0.85rem">
            Copy Token
          </button>
          <a href="/cmdpanel/manager"
            style="padding:10px 20px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;text-decoration:none;font-size:0.85rem">
            Back to Manager
          </a>
        </div>
      </div></body></html>
    `, { headers: { 'Content-Type': 'text/html' } })
  } catch {
    return new NextResponse('Server error', { status: 500 })
  }
}
