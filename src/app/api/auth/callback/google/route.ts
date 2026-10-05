import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  // Forward code to standard Supabase auth callback with /profile destination
  const targetUrl = new URL('/auth/callback', requestUrl.origin);
  if (code) {
    targetUrl.searchParams.set('code', code);
    targetUrl.searchParams.set('next', '/profile');
  }
  if (error) {
    targetUrl.searchParams.set('error', error);
  }

  return NextResponse.redirect(targetUrl);
}
