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
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, secretKey);

const PRODUCTS = [
  {
    id: "liquid-glass-apple-ui-kit",
    title: "Liquid Glass Apple-Style UI Kit",
    subtitle: "240+ High-Precision Components, Liquid Optical Glass Tokens & Light/Dark System",
    category_id: "figma",
    price: 390,
    original_price: 790,
    rating: 5.0,
    rating_count: 342,
    badge: "Bestseller",
    featured: true,
    description: "ชุดระบบออกแบบระดับ Flagship ได้รับแรงบันดาลใจจากสถาปัตยกรรม Liquid Glass ของ Apple พร้อมโทเคนสี 48 เฉด, ส่วนประกอบ Auto-layout 5.0 สมบูรณ์แบบ, ไอคอนเวกเตอร์ละเอียดสูง, และเทมเพลตหน้าจอ Mobile & Web Commerce ที่พร้อมส่งต่อสู่ทีมพัฒนาทันที",
    file_name: "Liquid_Glass_Apple_UI_Kit.fig.zip",
    file_size: "48.6 MB",
    file_format: "Figma (.fig) + Tokens JSON",
    cover_image: "/products/figma-ui-kit.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "Apple Design System Official",
    merchant_promptpay: "081-234-5678",
  },
  {
    id: "media-player-pro",
    title: "FastPlayer PRO (Media Player Engineering)",
    subtitle: "PyQt6 & QtMultimedia Desktop Engineering (ใบงานที่ 1)",
    category_id: "ebook",
    price: 199,
    original_price: 390,
    rating: 4.9,
    rating_count: 128,
    badge: "Staff Pick",
    featured: true,
    description: "คู่มือสถาปัตยกรรม Desktop Media Player ระดับพรีเมียม พัฒนาด้วย Python, PyQt6 (QtMultimedia) ภายใต้แนวคิด Responsible Vibe Coding ตามเกณฑ์ใบงานที่ 1 ผสมผสาน Obsidian Black & Neon Purple Minimalist Theme, Pure Vector Icon Engine, Interactive Scrubber และ Persistent JSON Storage",
    file_name: "Media_Player_PRO_Engineering.pdf",
    file_size: "24.8 MB",
    file_format: "PDF Digital Master Edition",
    cover_image: "/images/books/media_player.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "Kiattiphun Engineering Studio",
    merchant_promptpay: "081-234-5678",
  },
  {
    id: "apex-pro-next14-boilerplate",
    title: "Apex PRO Next.js 14 E-Commerce Engine",
    subtitle: "Production-grade App Router, Supabase Auth SSR & PromptPay QR Engine",
    category_id: "code",
    price: 490,
    original_price: 990,
    badge: "Trending",
    rating: 5.0,
    rating_count: 189,
    featured: true,
    description: "โครงสร้างระบบ E-Commerce ระดับพรีเมียม Next.js 14 App Router, TypeScript, Supabase SSR Auth, Dynamic PromptPay QR Code Generation, Supabase Storage Private Buckets with Signed URLs, และหน้า Admin Dashboard เต็มรูปแบบ",
    file_name: "Apex_Pro_ECommerce_Next14.zip",
    file_size: "15.4 MB",
    file_format: "Next.js 14 + Supabase Project ZIP",
    cover_image: "/products/apex-pro.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "Next.js Architecture Labs",
    merchant_promptpay: "081-234-5678",
  },
  {
    id: "mystic-tarot-altar",
    title: "Mystic Tarot 3-Card Oracle System",
    subtitle: "Celestial Altar System & AI Divination Architecture (ใบงานที่ 2)",
    category_id: "ebook",
    price: 259,
    original_price: 450,
    rating: 5.0,
    rating_count: 204,
    badge: "Popular",
    featured: true,
    description: "คู่มือและสถาปัตยกรรมระบบทำนายไพ่ทาโรต์ 3 ใบ (อดีต / ปัจจุบัน / อนาคต) ระดับเดสก์ท็อป พัฒนาด้วย Python 3.14, PyQt6, และ PyInstaller ตามเกณฑ์ใบงานที่ 2 ผสานอัตลักษณ์ Celestial Altar (Dark Luxury & Sacred Gold) จาก Google Stitch, ดนตรีบำบัด 432Hz Harmonic Ambient BGM และ Defensive Vector Fallback",
    file_name: "Mystic_Tarot_Altar_System.pdf",
    file_size: "32.4 MB",
    file_format: "PDF Digital Master Edition",
    cover_image: "/images/books/tarot_app.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "Kiattiphun Engineering Studio",
    merchant_promptpay: "081-234-5678",
  },
  {
    id: "creator-os-notion-system",
    title: "Ultimate Creator OS & Studio Management",
    subtitle: "All-in-One Notion Architecture for High-Output Digital Creators & Agencies",
    category_id: "notion",
    price: 249,
    original_price: 490,
    rating: 4.9,
    rating_count: 167,
    badge: "New",
    featured: false,
    description: "ระบบปฏิบัติการ Notion ที่ทรงพลังที่สุดสำหรับครีเอเตอร์และสตูดิโอดิจิทัล รวบรวมระบบจัดการคอนเทนต์แบบ Omnichannel, ระบบจัดการลูกค้า CRM, สัญญาและใบเสนอราคา, การจัดการคลังไฟล์ และแดชบอร์ดการเงินรายเดือน",
    file_name: "Creator_OS_Notion_System.zip",
    file_size: "8.2 MB",
    file_format: "Notion Template Link + PDF Guide",
    cover_image: "/products/creator-branding.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "Notion Creator Hub",
    merchant_promptpay: "081-234-5678",
  },
  {
    id: "taskmaster-pro",
    title: "TaskManagerPRO & Bento Kanban Architecture",
    subtitle: "Bento Dashboard & Secure SQLite Architecture (ใบงานที่ 3 & 4)",
    category_id: "ebook",
    price: 179,
    original_price: 320,
    rating: 4.8,
    rating_count: 95,
    badge: "Essential",
    featured: false,
    description: "คู่มือและสถาปัตยกรรมระบบบริหารจัดการภารกิจระดับองค์กร Bento Dashboard & Kanban Board พัฒนาด้วย Python & PyQt6 ตามเกณฑ์ใบงานที่ 3 และ 4 ระบบ Multi-theme Glassmorphism, 100% Parameterized SQLite, PBKDF2 Password Hashing, Soft Delete / Trash Recovery และระบบสำรองข้อมูลอัตโนมัติ",
    file_name: "TaskMaster_PRO_Architecture.pdf",
    file_size: "18.2 MB",
    file_format: "PDF Digital Master Edition",
    cover_image: "/images/books/task_manager.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "Kiattiphun Engineering Studio",
    merchant_promptpay: "081-234-5678",
  },
  {
    id: "liquid-glass-3d-assets",
    title: "3D Liquid Glass Isometric Asset Pack",
    subtitle: "60+ Ultra-Crisp 4K Isometric Renders & Transparent Glass Objects for Modern UI",
    category_id: "assets",
    price: 290,
    original_price: 590,
    rating: 4.9,
    rating_count: 112,
    badge: "Trending",
    featured: false,
    description: "ชุดวัตถุ 3D แก้วเหลวความโปร่งใสสูง เรนเดอร์แบบ 4K Alpha Channel พร้อมไฟล์ Blender ต้นฉบับ สำหรับนำไปใช้ใน Hero Banner, Mobile App Cards, Feature Showcase และงานนำเสนอเพื่อเพิ่มมิติความหรูหราให้ผลิตภัณฑ์",
    file_name: "Liquid_Glass_3D_Asset_Pack.zip",
    file_size: "142 MB",
    file_format: "4K PNG Pack + Blender Source ZIP",
    cover_image: "/products/liquid-glass-mobile.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "3D Visual Studio",
    merchant_promptpay: "081-234-5678",
  },
  {
    id: "seller-centre-design-kit",
    title: "Seller Centre & Merchant Flow Kit",
    subtitle: "Enterprise B2B / Merchant Portal UI System with Data-Dense Tables & Analytics",
    category_id: "figma",
    price: 320,
    original_price: 650,
    rating: 4.8,
    rating_count: 78,
    badge: "Staff Pick",
    featured: false,
    description: "ชุดแม่แบบ UI ระบบจัดการร้านค้า (Seller Centre) สำหรับระบบอีคอมเมิร์ซและ B2B SaaS ครบครันด้วย Data Table ที่รองรับ Sorting/Filtering, แดชบอร์ดสรุปยอดขาย, หน้าจัดการคำสั่งซื้อ และระบบจัดการคลังสินค้าดิจิทัล",
    file_name: "Seller_Centre_Design_Kit.zip",
    file_size: "36.2 MB",
    file_format: "Figma File (.fig)",
    cover_image: "/products/seller-centre.png",
    curator: "นายเกียรติภูมิ หารศรีนาถ",
    merchant_name: "Apple Design System Official",
    merchant_promptpay: "081-234-5678",
  },
];

async function seed() {
  console.log('Seeding products to Supabase...');
  for (const prod of PRODUCTS) {
    const { error } = await admin.from('products').upsert(prod, { onConflict: 'id' });
    if (error) {
      console.error(`Failed to upsert ${prod.id}:`, error.message);
    } else {
      console.log(`✅ Upserted product: ${prod.id} (${prod.merchant_name})`);
    }
  }
  console.log('Seeding finished!');
}

seed();
