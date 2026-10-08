import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, purpose } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกอีเมลให้ถูกต้อง' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isPurposeSignup = purpose === 'signup';

    // Check if user already exists in profiles or auth.users
    let userExists = false;
    try {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        userExists = true;
      } else {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        userExists = Boolean(usersData?.users?.some((u: any) => u.email?.toLowerCase() === cleanEmail));
      }
    } catch (checkErr) {
      console.warn('Error checking user existence:', checkErr);
    }

    // 1. If trying to sign in, but user is not registered / never logged in with Gmail
    if (!isPurposeSignup && !userExists) {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อน',
        requireSignup: true,
      }, { status: 404 });
    }

    // 2. If trying to sign up, but email already has an account
    if (isPurposeSignup && userExists) {
      return NextResponse.json({
        success: false,
        error: 'อีเมลนี้มีบัญชีในระบบอยู่แล้ว กรุณากด "เข้าสู่ระบบ"',
        alreadyRegistered: true,
      }, { status: 400 });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old unused OTPs for this email
    await supabaseAdmin
      .from('email_otps')
      .delete()
      .eq('email', cleanEmail)
      .is('used_at', null);

    // Insert new OTP
    const { error: insertError } = await supabaseAdmin
      .from('email_otps')
      .insert({
        email: cleanEmail,
        otp_code: otpCode,
        full_name: fullName || null,
        purpose: purpose || 'signin',
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('OTP insert error:', insertError);
      return NextResponse.json({ success: false, error: 'ไม่สามารถสร้าง OTP ได้ กรุณาลองใหม่' }, { status: 500 });
    }

    // Send OTP email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Book Sangdai <onboarding@resend.dev>',
      to: [email],
      subject: `${otpCode} - รหัส OTP สำหรับเข้าสู่ระบบ Book Sangdai`,
      html: `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#111111;padding:32px 32px 24px;text-align:center;">
      <div style="width:52px;height:52px;background:rgba(255,255,255,0.12);border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:26px;">📚</span>
      </div>
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0;">Book Sangdai</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:6px 0 0;">Digital Library & E-Book Store</p>
    </div>
    
    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="color:#1a1a2e;font-size:18px;font-weight:700;margin:0 0 8px;">
        ${isPurposeSignup ? '🎉 ยืนยันการสมัครสมาชิก' : '🔐 รหัสยืนยันตัวตน'}
      </h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
        ${isPurposeSignup ? `สวัสดีคุณ <strong>${fullName || email}</strong>,<br/>กรอกรหัส OTP ด้านล่างเพื่อสร้างบัญชีและเริ่มใช้งาน Book Sangdai` : 'กรอกรหัส OTP ด้านล่างเพื่อเข้าสู่ระบบบัญชีของคุณ'}
      </p>
      
      <!-- OTP Code Box -->
      <div style="background:#f8f8fa;border:2px dashed #e5e7eb;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="color:#9ca3af;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px;">รหัส OTP ของคุณ</p>
        <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#111111;font-family:'Courier New',monospace;">${otpCode}</div>
        <p style="color:#ef4444;font-size:12px;font-weight:600;margin:12px 0 0;">⏱ หมดอายุใน 10 นาที</p>
      </div>
      
      <!-- Warning -->
      <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:14px 16px;margin:0 0 24px;">
        <p style="color:#92400e;font-size:12px;margin:0;line-height:1.6;">
          ⚠️ <strong>อย่าแชร์รหัสนี้กับผู้อื่น</strong> — ทีมงาน Book Sangdai จะไม่มีวันขอรหัส OTP จากคุณ
        </p>
      </div>
      
      <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
        หากคุณไม่ได้ร้องขอรหัสนี้ กรุณาเพิกเฉยต่ออีเมลนี้ได้เลย<br/>
        บัญชีของคุณจะยังคงปลอดภัย
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background:#f8f8fa;padding:20px 32px;text-align:center;border-top:1px solid #f0f0f0;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">© 2026 Book Sangdai (บุ๊คสร้างได้)</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    if (emailError) {
      console.error('Resend email error:', emailError);
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบอีเมลของคุณหรือลองใหม่' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `ส่งรหัส OTP ไปยัง ${email} เรียบร้อยแล้ว (หมดอายุใน 10 นาที)` 
    });

  } catch (err: any) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
