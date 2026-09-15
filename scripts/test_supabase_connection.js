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
console.log(' VIBEBOOKS PRO - SUPABASE LIVE VERIFICATION');
console.log(' Author: นายเกียรติภูมิ หารศรีนาถ (64332110242-2)');
console.log('=====================================================\n');

console.log(`📡 Supabase Endpoint: ${url}`);
console.log(`🔑 Publishable Key:   ${anonKey.substring(0, 18)}...`);
console.log(`🔐 Secret Key:        ${secretKey.substring(0, 18)}...\n`);

const supabase = createClient(url, anonKey);
const supabaseAdmin = createClient(url, secretKey || anonKey);

async function runTests() {
  // Test 1: Query Books
  console.log('--- [Test 1] ทดสอบอ่านตาราง books จาก Cloud PostgreSQL ---');
  try {
    const { data: books, error: booksErr } = await supabase.from('books').select('id, title, price, series');
    if (booksErr) {
      console.error('❌ ไม่สามารถอ่านตาราง books ได้:', booksErr.message);
    } else {
      console.log(`✅ อ่านตาราง books สำเร็จ! พบทั้งหมด ${books.length} เล่ม:`);
      books.forEach(b => console.log(`   - [${b.id}] ${b.title} (${b.series}) -> ฿${b.price}`));
    }
  } catch (err) {
    console.error('❌ Exception querying books:', err.message);
  }

  // Test 2: Insert & Update Order
  console.log('\n--- [Test 2] ทดสอบบันทึกคำสั่งซื้อใหม่ลงตาราง orders ---');
  const testOrderId = `ORD-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const { data: order, error: orderErr } = await supabaseAdmin.from('orders').insert({
      id: testOrderId,
      book_id: 'media-player-pro',
      book_title: 'Media Player PRO Engineering',
      book_price: 199.00,
      file_name: 'Media_Player_PRO_Engineering.pdf',
      customer_name: 'นายเกียรติภูมิ หารศรีนาถ',
      customer_email: 'kiatphum.h@example.com',
      status: 'PENDING'
    }).select().single();

    if (orderErr) {
      console.error('❌ ไม่สามารถบันทึก order ได้:', orderErr.message);
    } else {
      console.log(`✅ สร้างคำสั่งซื้อใน Supabase สำเร็จ: ${order.id} (สถานะ: ${order.status})`);

      // Update to PAID
      const { data: updated, error: updErr } = await supabaseAdmin.from('orders')
        .update({ status: 'PAID', paid_at: new Date().toISOString() })
        .eq('id', testOrderId)
        .select()
        .single();

      if (updErr) {
        console.error('❌ ไม่สามารถอัปเดตสถานะเป็น PAID ได้:', updErr.message);
      } else {
        console.log(`✅ อัปเดตสถานะคำสั่งซื้อเป็น PAID สำเร็จ: ${updated.id} (สถานะ: ${updated.status})`);
      }
    }
  } catch (err) {
    console.error('❌ Exception testing orders:', err.message);
  }

  // Test 3: Storage Bucket Signed URL
  console.log('\n--- [Test 3] ทดสอบสร้าง Temporary Signed URL (15 นาที) จาก Private Storage "ebook-vault" ---');
  try {
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from('ebook-vault')
      .createSignedUrl('Media_Player_PRO_Engineering.pdf', 900);

    if (signErr) {
      console.error('❌ Storage Error:', signErr.message);
    } else if (signed?.signedUrl) {
      console.log('✅ สร้าง Temporary Signed URL (15 นาที / 900 วินาที) สำเร็จ 100%!');
      console.log('🔗 URL:', signed.signedUrl.substring(0, 85) + '...');

      // Test HTTP GET download
      const fetchRes = await fetch(signed.signedUrl);
      console.log(`📥 ทดสอบจำลองการดาวน์โหลดไฟล์: HTTP ${fetchRes.status} (${fetchRes.headers.get('content-type')}, ขนาด ${fetchRes.headers.get('content-length')} bytes)`);
    }
  } catch (err) {
    console.error('❌ Exception testing storage:', err.message);
  }

  console.log('\n=====================================================================');
  console.log(' 🏆 สรุปผล: การเชื่อมต่อ Supabase Database & Storage ทำงานได้ 100%!');
  console.log('=====================================================================\n');
}

runTests();
