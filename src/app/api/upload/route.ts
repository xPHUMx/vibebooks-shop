import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function detectFileFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'PDF Document';
    case 'zip':
      return 'ZIP Archive';
    case 'fig':
      return 'Figma File';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
      return 'Image Asset';
    case 'notion':
      return 'Notion Template';
    case 'mp4':
    case 'mov':
      return 'Video Asset';
    case 'json':
      return 'JSON Config';
    default:
      return ext ? ext.toUpperCase() : 'Digital File';
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'cover'; // 'cover' | 'sample' | 'avatar' | 'store-logo' | 'file'

    if (!file) {
      return NextResponse.json({ error: 'กรุณาแนบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อ Supabase Storage Admin ได้' }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = file.name;
    const ext = originalName.split('.').pop() || 'bin';
    const cleanBaseName = originalName
      .substring(0, originalName.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueFileName = `${cleanBaseName || 'asset'}_${Date.now()}.${ext}`;

    const fileSizeStr = formatBytes(file.size);
    const fileFormatStr = detectFileFormat(originalName);

    // 1. Digital Vault Upload (Secure product download file)
    if (type === 'file') {
      const storagePath = `vault/${uniqueFileName}`;
      const { data: uploadData, error: uploadErr } = await admin.storage
        .from('digital-vault')
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (uploadErr) {
        console.error('Digital Vault upload error:', uploadErr);
        // Fallback: also try root path in digital-vault if folder path fails
        const { data: rootData, error: rootErr } = await admin.storage
          .from('digital-vault')
          .upload(uniqueFileName, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          });

        if (rootErr) {
          return NextResponse.json(
            { error: `ไม่สามารถอัปโหลดไฟล์เข้า Vault ได้: ${rootErr.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          fileName: uniqueFileName,
          originalName,
          fileSize: fileSizeStr,
          fileFormat: fileFormatStr,
          message: 'อัปโหลดไฟล์ Master เข้า Digital Vault สำเร็จ',
        });
      }

      return NextResponse.json({
        success: true,
        fileName: storagePath,
        originalName,
        fileSize: fileSizeStr,
        fileFormat: fileFormatStr,
        message: 'อัปโหลดไฟล์ Master เข้า Digital Vault สำเร็จ',
      });
    }

    // 2. Public Assets Upload (Covers, Previews/Samples, Avatars, Store Logos)
    let folder = 'covers';
    if (type === 'sample') folder = 'samples';
    else if (type === 'avatar') folder = 'avatars';
    else if (type === 'store-logo') folder = 'stores';

    const storagePath = `${folder}/${uniqueFileName}`;

    // Ensure digital-assets bucket exists, or fallback to digital-vault
    let targetBucket = 'digital-assets';
    const { error: uploadErr } = await admin.storage
      .from(targetBucket)
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.warn(`Upload to ${targetBucket} notice:`, uploadErr.message);
      // Fallback: try digital-vault
      targetBucket = 'digital-vault';
      const { error: fallbackErr } = await admin.storage
        .from(targetBucket)
        .upload(storagePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (fallbackErr) {
        // Last resort: if small image, return base64 Data URL so user is never blocked
        if (file.type.startsWith('image/') && file.size < 3 * 1024 * 1024) {
          const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
          return NextResponse.json({
            success: true,
            url: base64,
            fileName: originalName,
            originalName,
            fileSize: fileSizeStr,
            fileFormat: fileFormatStr,
            message: 'แปลงรูปภาพและเตรียมพร้อมใช้งานเรียบร้อยแล้ว',
          });
        }

        return NextResponse.json(
          { error: `ไม่สามารถอัปโหลดรูปภาพได้: ${fallbackErr.message}` },
          { status: 500 }
        );
      }
    }

    // Get public URL
    const { data: pubUrlData } = admin.storage.from(targetBucket).getPublicUrl(storagePath);
    const publicUrl = pubUrlData?.publicUrl || '';

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: storagePath,
      originalName,
      fileSize: fileSizeStr,
      fileFormat: fileFormatStr,
      message: 'อัปโหลดสำเร็จเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('API Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'เกิดข้อผิดพลาดในการประมวลผลการอัปโหลด' },
      { status: 500 }
    );
  }
}
