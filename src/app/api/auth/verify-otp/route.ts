import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, otpCode, fullName, purpose, agreedTerms, agreedPrivacy } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    // Fetch valid OTP record
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('email_otps')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp_code', otpCode.trim())
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json({ 
        success: false, 
        error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอรหัสใหม่' 
      }, { status: 401 });
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('email_otps')
      .update({ used_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    // Check if user exists in auth.users
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let authUser: any;

    if (existingUser) {
      // User exists — sign them in by generating a magic link session
      authUser = existingUser;

      // Update consent audit if user confirmed consent
      if (agreedTerms && agreedPrivacy) {
        const nowIso = new Date().toISOString();
        try {
          await supabaseAdmin.from('profiles').update({
            terms_accepted_at: nowIso,
            privacy_accepted_at: nowIso,
          }).eq('id', authUser.id);
        } catch {}
      }
    } else {
      // If user does not exist and purpose is not signup, reject!
      const isPurposeSignup = purpose === 'signup' || otpRecord.purpose === 'signup';
      if (!isPurposeSignup) {
        return NextResponse.json({
          success: false,
          error: 'ไม่มีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อน',
          requireSignup: true,
        }, { status: 404 });
      }

      // New user — create account with a random secure password (OTP is the auth, not password)
      const randomPassword = `OTP_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      const displayName = fullName || otpRecord.full_name || email.split('@')[0];

      const nowIso = new Date().toISOString();
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: randomPassword,
        email_confirm: true, // Auto-confirm since OTP is our verification
        user_metadata: {
          full_name: displayName,
          avatar_url: '',
          auth_method: 'otp',
          terms_accepted_at: nowIso,
          privacy_accepted_at: nowIso,
        },
      });

      if (createError || !newUser.user) {
        console.error('Create user error:', createError);
        return NextResponse.json({ success: false, error: 'ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่' }, { status: 500 });
      }

      authUser = newUser.user;

      // Create profile record with consent audit fields
      const displayNameFinal = fullName || otpRecord.full_name || email.split('@')[0];
      const profileData: any = {
        id: authUser.id,
        email: email.toLowerCase(),
        full_name: displayNameFinal,
        avatar_url: '',
        role: 'user',
        merchant_status: 'NONE',
        created_at: nowIso,
        terms_accepted_at: nowIso,
        privacy_accepted_at: nowIso,
      };

      try {
        await supabaseAdmin.from('profiles').upsert(profileData, { onConflict: 'id' });
      } catch (profileErr) {
        // Fallback without consent columns if table doesn't have them yet
        console.warn('Profile upsert with consent failed, falling back to base columns:', profileErr);
        await supabaseAdmin.from('profiles').upsert({
          id: authUser.id,
          email: email.toLowerCase(),
          full_name: displayNameFinal,
          avatar_url: '',
          role: 'user',
          merchant_status: 'NONE',
          created_at: nowIso,
        }, { onConflict: 'id' });
      }
    }

    // Generate a short-lived session token via admin API
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/profile`,
      },
    });

    if (sessionError || !sessionData?.properties?.action_link) {
      console.error('Generate link error:', sessionError);
      return NextResponse.json({ success: false, error: 'ไม่สามารถสร้าง session ได้ กรุณาลองใหม่' }, { status: 500 });
    }

    // Extract hashed token from the magic link for client-side session exchange
    const actionLink = sessionData.properties.action_link;
    const url = new URL(actionLink);
    const token = url.searchParams.get('token');
    const tokenHash = sessionData.properties.hashed_token;

    return NextResponse.json({ 
      success: true,
      userId: authUser.id,
      email: authUser.email,
      fullName: authUser.user_metadata?.full_name || fullName || email.split('@')[0],
      avatarUrl: authUser.user_metadata?.avatar_url || '',
      isNewUser: !existingUser,
      // Client will use this token to exchange for a real session
      token,
      tokenHash,
      actionLink,
    });

  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
