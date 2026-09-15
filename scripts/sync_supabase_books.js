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

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncBooks() {
  const updates = [
    {
      id: 'media-player-pro',
      title: 'FastPlayer PRO (Media Player Engineering)',
      subtitle: 'PyQt6 & QtMultimedia Desktop Engineering (ใบงานที่ 1)',
      description: 'คู่มือสถาปัตยกรรม Desktop Media Player ระดับพรีเมียม พัฒนาด้วย Python, PyQt6 (QtMultimedia) ตามเกณฑ์ใบงานที่ 1'
    },
    {
      id: 'mystic-tarot-altar',
      title: 'Mystic Tarot 3-Card Oracle',
      subtitle: 'Celestial Altar System & AI Divination (ใบงานที่ 2)',
      description: 'คู่มือและสถาปัตยกรรมระบบทำนายไพ่ทาโรต์ 3 ใบ (อดีต / ปัจจุบัน / อนาคต) ระดับเดสก์ท็อป พัฒนาด้วย Python 3.14, PyQt6 ตามเกณฑ์ใบงานที่ 2'
    },
    {
      id: 'taskmaster-pro',
      title: 'TaskManagerPRO & Bento Kanban',
      subtitle: 'Bento Dashboard & Secure SQLite Architecture (ใบงานที่ 3 & 4)',
      description: 'คู่มือและสถาปัตยกรรมระบบบริหารจัดการภารกิจระดับองค์กร Bento Dashboard & Kanban Board ตามเกณฑ์ใบงานที่ 3 และ 4'
    }
  ];

  for (const u of updates) {
    const { error } = await supabaseAdmin.from('books').update({
      title: u.title,
      subtitle: u.subtitle,
      description: u.description
    }).eq('id', u.id);
    if (error) console.error('Error updating ' + u.id, error.message);
    else console.log('Synced Supabase book:', u.id, '->', u.title);
  }
}

syncBooks().then(() => console.log('Books sync finished!'));
