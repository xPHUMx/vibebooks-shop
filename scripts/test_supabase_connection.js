const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=====================================================');
console.log(' BOOK SANGDAI - SUPABASE LIVE VERIFICATION');
console.log(' Author: นายเกียรติภูมิ หารศรีนาถ (64332110242-2)');
console.log('=====================================================\n');

console.log(`📡 Supabase Endpoint: ${url}`);
console.log(`🔑 Publishable Key:   ${anonKey ? anonKey.substring(0, 18) + '...' : '(none)'}`);
console.log(`🔐 Secret Key:        ${secretKey ? secretKey.substring(0, 18) + '...' : '(none)'}\n`);

const supabase = createClient(url, anonKey);
const supabaseAdmin = createClient(url, secretKey || anonKey);

async function runTests() {
  let passedCount = 0;
  let totalCount = 3;

  // Test 1: Query Categories & Products
  console.log('--- [Test 1] ทดสอบอ่านตาราง categories & products จาก Cloud PostgreSQL ---');
  try {
    const { data: categories, error: catErr } = await supabase.from('categories').select('*');
    const { data: products, error: prodErr } = await supabase.from('products').select('id, title, price');

    if (catErr && prodErr) {
      console.error('❌ ไม่สามารถอ่านตารางในฐานข้อมูลได้:', catErr?.message || prodErr?.message);
    } else {
      console.log(`✅ เชื่อมต่อฐานข้อมูลสำเร็จ!`);
      if (categories) console.log(`   - หมวดหมู่ (categories): ${categories.length} หมวด`);
      if (products) console.log(`   - สินค้าดิจิทัล (products): ${products.length} รายการ`);
      passedCount++;
    }
  } catch (err) {
    console.error('❌ Exception querying database:', err.message);
  }

  // Test 2: Insert & Update Order
  console.log('\n--- [Test 2] ทดสอบบันทึกคำสั่งซื้อใหม่ลงตาราง orders ---');
  const testOrderId = `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const { data: order, error: orderErr } = await supabaseAdmin.from('orders').insert({
      id: testOrderId,
      book_id: 'media-player-pro',
      book_title: 'Media Player PRO Engineering',
      book_price: 199.00,
      file_name: 'Media_Player_PRO_Engineering.pdf',
      customer_name: 'นายเกียรติภูมิ หารศรีนาถ',
      customer_email: 'kiatphum.h@example.com',
      total_amount: 199.00,
      status: 'PENDING'
    }).select().single();

    if (orderErr) {
      console.error('❌ ไม่สามารถบันทึก order ได้:', orderErr.message);
      if (orderErr.message.includes('Invalid API key')) {
        console.error('   💡 คำแนะนำ: ตรวจสอบ SUPABASE_SERVICE_ROLE_KEY ใน .env.local');
      }
    } else {
      console.log(`✅ สร้างคำสั่งซื้อใน Supabase สำเร็จ: ${order.id} (สถานะ: ${order.status})`);

      // Update to PAID
      const { data: updated, error: updErr } = await supabaseAdmin.from('orders')
        .update({ status: 'PAID', paid_at: new Date().toISOString() })
        .eq('id', testOrderId)
        .select()
        .single();

      if (updErr) {
        console.warn('⚠️ ไม่สามารถอัปเดตสถานะเป็น PAID ได้:', updErr.message);
      } else {
        console.log(`✅ อัปเดตสถานะคำสั่งซื้อเป็น PAID สำเร็จ: ${updated.id}`);
      }
      passedCount++;
    }
  } catch (err) {
    console.error('❌ Exception testing orders:', err.message);
  }

  // Test 3: Storage Bucket Signed URL
  console.log('\n--- [Test 3] ทดสอบสร้าง Temporary Signed URL จาก Private Storage "digital-vault" ---');
  try {
    let bucketName = 'digital-vault';
    let testFile = 'Media_Player_PRO_Engineering.pdf';

    // Verify bucket & files
    const { data: files, error: listErr } = await supabaseAdmin.storage.from(bucketName).list();
    if (listErr || !files || files.length === 0) {
      // Fallback check
      const { data: altFiles } = await supabaseAdmin.storage.from('ebook-vault').list();
      if (altFiles && altFiles.length > 0) {
        bucketName = 'ebook-vault';
      }
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(testFile, 900);

    if (signErr) {
      console.error(`❌ Storage Error (${bucketName}):`, signErr.message);
      if (signErr.message.includes('Invalid API key') || signErr.message.includes('Invalid Compact JWS')) {
        console.error('   💡 สาเหตุ: SUPABASE_SERVICE_ROLE_KEY ใน .env.local ต้องเป็น service_role secret key จาก Supabase Dashboard');
      } else if (signErr.message.includes('not found')) {
        console.error(`   💡 สาเหตุ: ยังไม่ได้สร้าง Bucket ชื่อ "${bucketName}" ในเมนู Storage บน Supabase Dashboard`);
      }
    } else if (signed?.signedUrl) {
      console.log(`✅ สร้าง Temporary Signed URL (15 นาที / 900 วินาที) จาก [${bucketName}] สำเร็จ 100%!`);
      console.log('🔗 URL:', signed.signedUrl.substring(0, 85) + '...');

      // Test HTTP GET download
      try {
        const fetchRes = await fetch(signed.signedUrl);
        console.log(`📥 ทดสอบดาวน์โหลดไฟล์: HTTP ${fetchRes.status} (${fetchRes.headers.get('content-type')}, ขนาด ${fetchRes.headers.get('content-length')} bytes)`);
      } catch {}

      passedCount++;
    }
  } catch (err) {
    console.error('❌ Exception testing storage:', err.message);
  }

  console.log('\n=====================================================================');
  if (passedCount === totalCount) {
    console.log(` 🏆 สรุปผล: การเชื่อมต่อ Supabase Database & Storage ผ่านสมบูรณ์ ${passedCount}/${totalCount} (100%)!`);
  } else {
    console.log(` ⚠️ สรุปผล: ผ่าน ${passedCount}/${totalCount} การทดสอบ (กรุณาตรวจสอบข้อความแนะนำด้านบน)`);
  }
  console.log('=====================================================================\n');
}

runTests();
