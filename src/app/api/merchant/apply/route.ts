import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const serverClient = createClient();
    const admin = createAdminClient();

    // 1. Authenticate user
    const { data: { user } } = await serverClient.auth.getUser();
    const body = await req.json().catch(() => ({}));
    const targetUserId = user?.id || body.userId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนสมัครเป็นพ่อค้า' },
        { status: 401 }
      );
    }

    const { storeName, storeDescription, promptPayId, storeLogoUrl } = body;

    if (!storeName || !storeName.trim()) {
      return NextResponse.json(
        { error: 'กรุณาระบุชื่อร้านค้าของคุณ' },
        { status: 400 }
      );
    }

    if (admin && targetUserId && storeLogoUrl) {
      try {
        const { data: uData } = await admin.auth.admin.getUserById(targetUserId);
        const prevMeta = uData?.user?.user_metadata || {};
        await admin.auth.admin.updateUserById(targetUserId, {
          user_metadata: { ...prevMeta, store_logo_url: storeLogoUrl }
        });
      } catch {}
    }

    if (!promptPayId || !promptPayId.trim()) {
      return NextResponse.json(
        { error: 'กรุณาระบุหมายเลขพร้อมเพย์สำหรับรับชำระเงิน' },
        { status: 400 }
      );
    }

    const client = admin || serverClient;

    // 2. Update profile with PENDING status
    const { data, error } = await client
      .from('profiles')
      .update({
        store_name: storeName.trim(),
        store_description: (storeDescription || '').trim(),
        promptpay_id: promptPayId.trim(),
        merchant_status: 'PENDING',
        merchant_applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Merchant application update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'ส่งคำขอเปิดร้านค้าเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ (Admin)',
      profile: data,
    });
  } catch (error) {
    console.error('Merchant application error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
