import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const wantsJson =
      searchParams.get('json') === 'true' ||
      req.headers.get('accept')?.includes('application/json');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify payment status
    if (order.status !== 'PAID') {
      return NextResponse.json(
        { error: 'คำสั่งซื้อยังไม่ได้รับการชำระเงิน กรุณาชำระเงินก่อนดาวน์โหลด' },
        { status: 403 }
      );
    }

    // Determine target file name
    let rawFileName = order.fileName;
    if (order.items && order.items.length > 0) {
      if (productId) {
        const item = order.items.find((i) => i.productId === productId);
        if (item) rawFileName = item.fileName;
      } else {
        rawFileName = order.items[0].fileName;
      }
    }

    if (!rawFileName) {
      rawFileName = 'Media_Player_PRO_Engineering.pdf';
    }

    // Security Hardening: sanitize against path traversal
    const targetFileName = path.basename(rawFileName);

    // 1. Attempt to generate 15-minute temporary Signed URL from Supabase Storage
    let signedUrl: string | null = null;
    try {
      const admin = createAdminClient();
      if (admin) {
        const { data: vaultData } = await admin.storage
          .from('digital-vault')
          .createSignedUrl(targetFileName, 900);

        if (vaultData?.signedUrl) {
          signedUrl = vaultData.signedUrl;
        } else {
          const { data: ebookData } = await admin.storage
            .from('ebook-vault')
            .createSignedUrl(targetFileName, 900);
          if (ebookData?.signedUrl) {
            signedUrl = ebookData.signedUrl;
          }
        }
      }
    } catch (supabaseErr) {
      console.warn('Supabase signed URL notice:', supabaseErr);
    }

    // If caller wants JSON info (e.g. order delivery page)
    if (wantsJson) {
      return NextResponse.json({
        success: true,
        orderId,
        fileName: targetFileName,
        downloadUrl: signedUrl || `/api/download/${orderId}?productId=${productId || ''}`,
        signedUrl,
        expiresIn: 900,
      });
    }

    // If signed URL is available, redirect to it
    if (signedUrl) {
      return NextResponse.redirect(signedUrl);
    }

    // 2. High-reliability Fallback: Stream physical master file strictly from private storage_vault_files
    const vaultDir = path.resolve(process.cwd(), 'supabase', 'storage_vault_files');
    const resolvedPath = path.resolve(vaultDir, targetFileName);

    // Enforce path traversal protection: resolved path must be within vaultDir
    if (!resolvedPath.startsWith(vaultDir)) {
      return NextResponse.json({ error: 'Access denied: invalid file path' }, { status: 400 });
    }

    if (fs.existsSync(resolvedPath)) {
      const fileBuffer = fs.readFileSync(resolvedPath);
      const ext = path.extname(targetFileName).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.zip') contentType = 'application/zip';
      else if (ext === '.docx')
        contentType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(targetFileName)}"`,
          'Cache-Control': 'no-store, max-age=0',
          'X-Vault-Source': 'Book-Sangdai-Secure-Private-Vault',
        },
      });
    }

    // Fallback for default PDF in vault
    const defaultVaultPath = path.resolve(vaultDir, 'Media_Player_PRO_Engineering.pdf');
    if (fs.existsSync(defaultVaultPath)) {
      const fileBuffer = fs.readFileSync(defaultVaultPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(targetFileName)}"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    return NextResponse.json(
      { error: 'File temporarily unavailable in storage vault' },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('Download API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
