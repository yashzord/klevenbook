import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Email links land here with a one-time code; swap it for a session, then continue.
// https://supabase.com/docs/guides/auth/server-side/nextjs (PKCE code exchange)
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin))
  }
  return NextResponse.redirect(new URL('/login/forgot?expired=1', url.origin))
}
