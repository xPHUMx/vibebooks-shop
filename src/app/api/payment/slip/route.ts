import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, attachOrderSlip, updateOrderStatus } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, slipData, autoVerify } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let finalSlipUrl = slipData || '';

    // If slipData is base64 and Supabase Storage admin client is configured, upload to storage
    if (slipData && slipData.startsWith('data:image')) {
      try {
        const admin = createAdminClient();
        if (admin) {
          const matches = slipData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileExt = mimeType.split('/')[1] || 'jpg';
            const storagePath = `slips/${orderId}_${Date.now()}.${fileExt}`;

            // Ensure bucket exists and upload
            const { data: uploadData, error: uploadErr } = await admin.storage
              .from('digital-vault')
              .upload(storagePath, buffer, {
                contentType: mimeType,
                upsert: true,
              });

            if (!uploadErr && uploadData) {
              // digital-vault is a private bucket, so generate a signed URL (10 years)
              const { data: signedUrlData, error: signErr } = await admin.storage
                .from('digital-vault')
                .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10);

              if (!signErr && signedUrlData?.signedUrl) {
                finalSlipUrl = signedUrlData.signedUrl;
              } else {
                // Proxy fallback URL
                finalSlipUrl = `/api/slip/${orderId}`;
              }
            }
          }
        }
      } catch (uploadException) {
        console.warn('Storage slip upload exception, keeping base64/payload:', uploadException);
      }
    }

    // Attach slip to order
    const updatedWithSlip = await attachOrderSlip(orderId, finalSlipUrl);

    // If autoVerify is true (e.g. from SlipOK or demo test), also mark PAID
    if (autoVerify) {
      const verified = await updateOrderStatus(orderId, 'PAID');
      return NextResponse.json({
        success: true,
        message: 'แนบสลิปและยืนยันการชำระเงินสำเร็จ (Verified & Approved)',
        order: verified,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'แนบหลักฐานการโอนเงินเรียบร้อย รอพ่อค้า/แอดมินยืนยันรายการ',
      order: updatedWithSlip,
    });
  } catch (error) {
    console.error('Slip attachment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการแนบสลิปโอนเงิน' },
      { status: 500 }
    );
  }
}
