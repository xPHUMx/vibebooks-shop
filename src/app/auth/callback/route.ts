import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorMsg = requestUrl.searchParams.get('error_description') || requestUrl.searchParams.get('error');
  
  let next = requestUrl.searchParams.get('next') || '/profile';
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\') || next === '/auth/login' || next === '/') {
    next = '/profile';
  }

  // If OAuth error returned from provider
  if (errorMsg) {
    console.error('OAuth Callback Error:', errorMsg);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMsg)}`, requestUrl.origin)
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  let projectRef = 'oklgdsscwdnukeyjerdc';
  try {
    if (supabaseUrl) {
      projectRef = new URL(supabaseUrl).hostname.split('.')[0] || projectRef;
    }
  } catch {}
  const storageKey = `sb-${projectRef}-auth-token`;

  if (code) {
    const cookieStore = cookies();
    const cookiesToSetList: Array<{ name: string; value: string; options?: any }> = [];

    // Create server client to exchange the OAuth code
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookiesToSetList.push({ name, value, options });
            try {
              cookieStore.set({ name, value, ...options });
            } catch {}
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.warn('Server OAuth code exchange error:', error.message);
      return NextResponse.redirect(
        new URL(`/auth/login?code=${encodeURIComponent(code)}&error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    if (data?.user) {
      // 1. Sync user data into public.profiles database table
      try {
        const adminSupabase = createAdminClient();
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          'User';
        const avatarUrl =
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.picture ||
          '';

        await adminSupabase.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('Profile sync warning in OAuth callback:', profileErr);
      }

      // 2. Prepare session JSON and HTML bridge to guarantee persistence
      const sessionJson = JSON.stringify(data.session);
      const targetUrl = new URL(next, requestUrl.origin).toString();

      const bridgeHtml = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>เข้าสู่ระบบสำเร็จ - Book Sangdai</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #fbfbfd;
      color: #1d1d1f;
    }
    .bridge-box {
      text-align: center;
      padding: 36px 32px;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.08);
      max-width: 380px;
      width: 90%;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3.5px solid rgba(0,0,0,0.08);
      border-top-color: #0071e3;
      border-radius: 50%;
      animation: spin 0.7s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
      margin: 0 auto 18px;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    h2 { margin: 0 0 8px; font-size: 17px; font-weight: 700; }
    p { margin: 0; font-size: 13px; color: #86868b; }
  </style>
</head>
<body>
  <div class="bridge-box">
    <div class="spinner"></div>
    <h2>เข้าสู่ระบบ Google สำเร็จ</h2>
    <p>กำลังซิงค์โปรไฟล์และพาคุณไปยังบัญชีผู้ใช้...</p>
  </div>
  <script>
    (function() {
      try {
        var sKey = ${JSON.stringify(storageKey)};
        var sVal = ${JSON.stringify(sessionJson)};
        var dest = ${JSON.stringify(targetUrl)};

        // Persist to localStorage for client components
        localStorage.setItem(sKey, sVal);
        localStorage.removeItem('book_sangdai_demo_user');

        // Persist to document.cookie with 1 year max-age
        var maxAge = 60 * 60 * 24 * 365;
        document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sVal) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';

        // Redirect immediately
        window.location.replace(dest);
      } catch (e) {
        console.error('Session bridge error:', e);
        window.location.replace(${JSON.stringify(targetUrl)});
      }
    })();
  </script>
</body>
</html>`;

      const response = new NextResponse(bridgeHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      });

      // Write explicit cookie for projectRef
      response.cookies.set({
        name: storageKey,
        value: sessionJson,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });

      // Write any additional cookies tracked by @supabase/ssr
      cookiesToSetList.forEach(({ name, value, options }) => {
        try {
          response.cookies.set({ name, value, ...options, path: '/', sameSite: 'lax' });
        } catch {}
      });

      return response;
    }
  }

  // Fallback redirect if no code was provided
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

