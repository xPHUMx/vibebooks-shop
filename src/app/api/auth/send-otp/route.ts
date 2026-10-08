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
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

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
      subject: `${otpCode} - รหัส OTP สำหรับเข้าสู่ระบบ Book Sangdai (หมดอายุใน 2 นาที)`,
      html: `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:36px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #ededf0;">
    <!-- Header with Brand Icon Production -->
    <div style="background:#111111;padding:32px 32px 26px;text-align:center;">
      <div style="width:56px;height:56px;border-radius:15px;margin:0 auto 14px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.2);background:#000000;">
        <img src="https://raw.githubusercontent.com/xPHUMx/vibebooks-shop/main/public/icon.jpg" width="56" height="56" alt="Book Sangdai Icon" style="width:56px;height:56px;object-fit:cover;display:block;" />
      </div>
      <h1 style="color:#ffffff;font-size:21px;font-weight:700;margin:0;letter-spacing:-0.02em;">Book Sangdai</h1>
      <p style="color:rgba(255,255,255,0.65);font-size:12px;margin:5px 0 0;font-weight:400;">Ultra-Refined Digital Store & Creator Vault</p>
    </div>
    
    <!-- Body -->
    <div style="padding:32px 28px 28px;">
      <h2 style="color:#111111;font-size:17px;font-weight:700;margin:0 0 8px;letter-spacing:-0.01em;">
        ${isPurposeSignup ? '🎉 ยืนยันการสมัครสมาชิกใหม่' : '🔐 รหัสยืนยันตัวตน (OTP)'}
      </h2>
      <p style="color:#666668;font-size:13px;margin:0 0 22px;line-height:1.6;">
        ${isPurposeSignup ? `สวัสดีคุณ <strong>${fullName || email}</strong>,<br/>กรอกรหัสยืนยันด้านล่างเพื่อเปิดใช้งานบัญชีของคุณ` : 'กรอกรหัสยืนยัน 6 หลักด้านล่างเพื่อเข้าสู่ระบบ Book Sangdai'}
      </p>
      
      <!-- Minimalist OTP Number Card -->
      <div style="background:#fafafc;border:1px solid #e8e8ed;border-radius:18px;padding:24px 16px;text-align:center;margin:0 0 22px;">
        <p style="color:#86868b;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">
          รหัส OTP ของคุณ
        </p>

        <!-- Clean Individual Digit Tiles -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            ${otpCode.split('').map(digit => `
              <td style="padding:0 3px;">
                <div style="width:40px;height:48px;line-height:48px;background:#ffffff;border:1px solid #dcdcde;border-radius:10px;font-size:24px;font-weight:700;color:#111111;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
                  ${digit}
                </div>
              </td>
            `).join('')}
          </tr>
        </table>

        <!-- 2-Minute Expiry Pill -->
        <div style="margin-top:16px;">
          <span style="display:inline-block;padding:4px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:9999px;color:#dc2626;font-size:11px;font-weight:600;">
            ⏱ รหัสมีอายุ 2 นาที
          </span>
        </div>
      </div>
      
      <!-- Security Notice -->
      <div style="background:#fdf8f6;border-left:3px solid #f97316;border-radius:6px;padding:12px 14px;margin:0 0 22px;">
        <p style="color:#9a3412;font-size:12px;margin:0;line-height:1.5;">
          🛡️ <strong>โปรดรักษาความปลอดภัย:</strong> ห้ามส่งต่อรหัสนี้ให้ผู้อื่น ทีมงานจะไม่ติดต่อขอรหัส OTP จากท่าน
        </p>
      </div>
      
      <p style="color:#999999;font-size:11px;margin:0;line-height:1.5;text-align:center;">
        หากท่านไม่ได้เป็นผู้ทำรายการนี้ สามารถละเว้นอีเมลฉบับนี้ได้ทันที
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background:#fafafc;padding:18px 24px;text-align:center;border-top:1px solid #eeeeef;">
      <p style="color:#999999;font-size:11px;margin:0;">
        © 2026 Book Sangdai (บุ๊คสั่งได้) • All Rights Reserved.
      </p>
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
      message: `ส่งรหัส OTP ไปยัง ${email} เรียบร้อยแล้ว (หมดอายุใน 2 นาที)` 
    });

  } catch (err: any) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
