const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:/Users/Phums/.gemini/antigravity/brain/945d18b5-9396-4cd8-a2a5-05278713ecb8';
const outDir = path.resolve('public/docs_assets');
fs.mkdirSync(outDir, { recursive: true });

function createBadgeSvg(num, size = 44) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = Math.round(size * 0.42);
  const textY = cy + Math.round(fontSize * 0.35);

  return Buffer.from(`
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0071e3" stroke="#ffffff" stroke-width="2.5" filter="url(#shadow)"/>
  <text x="${cx}" y="${textY}" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${num}</text>
</svg>
`);
}

async function processScreen(sourceName, badges, outName, targetWidth = 600) {
  const srcPath = path.join(brainDir, sourceName);
  if (!fs.existsSync(srcPath)) {
    console.warn('Source image not found:', srcPath);
    return;
  }

  const meta = await sharp(srcPath).metadata();
  const scale = targetWidth / meta.width;
  const targetHeight = Math.round(meta.height * scale);

  const resized = await sharp(srcPath)
    .resize(targetWidth, targetHeight, { fit: 'contain', background: { r: 10, g: 10, b: 12, alpha: 1 } })
    .toBuffer();

  const composites = badges.map(b => ({
    input: createBadgeSvg(b.num, b.size || 42),
    top: Math.round(b.y * scale),
    left: Math.round(b.x * scale),
  }));

  // Add subtle rounded border / frame
  const finalImage = await sharp(resized)
    .composite(composites)
    .png()
    .toFile(path.join(outDir, outName));

  console.log(`Generated annotated image: ${outName} (${targetWidth}x${targetHeight})`);
}

async function generateArchitectureDiagram() {
  const width = 800;
  const height = 480;

  const svgContent = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d0d0e"/>
  
  <!-- Subtle Grid Pattern -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>

  <!-- Title Banner -->
  <text x="40" y="50" fill="#f5f5f7" font-family="Arial, sans-serif" font-size="20" font-weight="bold">VibeBooks PRO — สถาปัตยกรรมระบบไฮบริด (Hybrid Architecture)</text>
  <text x="40" y="75" fill="#86868b" font-family="Arial, sans-serif" font-size="12">Next.js 14 Web Platform + Supabase Cloud + MIT App Inventor Android/iOS</text>

  <!-- Box 1: MIT App Inventor (Client Mobile) -->
  <rect x="40" y="110" width="220" height="280" rx="16" fill="#161617" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
  <rect x="55" y="125" width="30" height="30" rx="8" fill="#0071e3"/>
  <text x="70" y="145" fill="#ffffff" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle">📱</text>
  <text x="95" y="145" fill="#ffffff" font-family="Arial" font-size="14" font-weight="bold">Mobile App (Client)</text>
  
  <rect x="55" y="175" width="190" height="50" rx="10" fill="#242426"/>
  <text x="70" y="195" fill="#2997ff" font-family="Arial" font-size="11" font-weight="bold">WebViewer Component</text>
  <text x="70" y="212" fill="#86868b" font-family="Arial" font-size="10">รันเว็บแอพ VibeBooks PRO</text>

  <rect x="55" y="235" width="190" height="50" rx="10" fill="#242426"/>
  <text x="70" y="255" fill="#30d158" font-family="Arial" font-size="11" font-weight="bold">ActivityStarter Bridge</text>
  <text x="70" y="272" fill="#86868b" font-family="Arial" font-size="10">เปิด Browser โหลดไฟล์ตรง</text>

  <rect x="55" y="295" width="190" height="75" rx="10" fill="#242426"/>
  <text x="70" y="315" fill="#ff9f0a" font-family="Arial" font-size="11" font-weight="bold">Hardware Support</text>
  <text x="70" y="332" fill="#86868b" font-family="Arial" font-size="10">• Android APK (ARM64/x86)</text>
  <text x="70" y="348" fill="#86868b" font-family="Arial" font-size="10">• iOS Companion (WKWebView)</text>

  <!-- Box 2: Next.js Platform (Edge Server) -->
  <rect x="290" y="110" width="220" height="280" rx="16" fill="#161617" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
  <rect x="305" y="125" width="30" height="30" rx="8" fill="#ffffff"/>
  <text x="320" y="145" fill="#000000" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle">▲</text>
  <text x="345" y="145" fill="#ffffff" font-family="Arial" font-size="14" font-weight="bold">Next.js 14 (Vercel)</text>

  <rect x="305" y="175" width="190" height="50" rx="10" fill="#242426"/>
  <text x="320" y="195" fill="#2997ff" font-family="Arial" font-size="11" font-weight="bold">App Router &amp; API</text>
  <text x="320" y="212" fill="#86868b" font-family="Arial" font-size="10">9 Static/Dynamic Routes</text>

  <rect x="305" y="235" width="190" height="50" rx="10" fill="#242426"/>
  <text x="320" y="255" fill="#30d158" font-family="Arial" font-size="11" font-weight="bold">In-App Canvas Engine</text>
  <text x="320" y="272" fill="#86868b" font-family="Arial" font-size="10">Mozilla PDF.js HTML5 Canvas</text>

  <rect x="305" y="295" width="190" height="75" rx="10" fill="#242426"/>
  <text x="320" y="315" fill="#bf5af2" font-family="Arial" font-size="11" font-weight="bold">API Vault Routes</text>
  <text x="320" y="332" fill="#86868b" font-family="Arial" font-size="10">• /api/pdf/[orderId]</text>
  <text x="320" y="348" fill="#86868b" font-family="Arial" font-size="10">• /api/download/[orderId]</text>

  <!-- Box 3: Cloud Database & Storage (Supabase) -->
  <rect x="540" y="110" width="220" height="280" rx="16" fill="#161617" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
  <rect x="555" y="125" width="30" height="30" rx="8" fill="#3ecf8e"/>
  <text x="570" y="145" fill="#ffffff" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle">⚡</text>
  <text x="595" y="145" fill="#ffffff" font-family="Arial" font-size="14" font-weight="bold">Supabase Cloud</text>

  <rect x="555" y="175" width="190" height="50" rx="10" fill="#242426"/>
  <text x="570" y="195" fill="#3ecf8e" font-family="Arial" font-size="11" font-weight="bold">Storage: ebook-vault</text>
  <text x="570" y="212" fill="#86868b" font-family="Arial" font-size="10">E-Book PDFs 3 เล่มหลัก</text>

  <rect x="555" y="235" width="190" height="50" rx="10" fill="#242426"/>
  <text x="570" y="255" fill="#2997ff" font-family="Arial" font-size="11" font-weight="bold">PostgreSQL DB</text>
  <text x="570" y="272" fill="#86868b" font-family="Arial" font-size="10">ตาราง orders &amp; comments</text>

  <rect x="555" y="295" width="190" height="75" rx="10" fill="#242426"/>
  <text x="570" y="315" fill="#ffd60a" font-family="Arial" font-size="11" font-weight="bold">Security &amp; Signed URLs</text>
  <text x="570" y="332" fill="#86868b" font-family="Arial" font-size="10">• 15-Min Tokenized Expiry</text>
  <text x="570" y="348" fill="#86868b" font-family="Arial" font-size="10">• Service Role Admin Auth</text>

  <!-- Connectors -->
  <path d="M 260 200 L 290 200" stroke="#0071e3" stroke-width="2.5" stroke-dasharray="4,4"/>
  <path d="M 260 260 L 290 260" stroke="#30d158" stroke-width="2.5"/>
  <path d="M 510 200 L 540 200" stroke="#3ecf8e" stroke-width="2.5"/>
  <path d="M 510 260 L 540 260" stroke="#2997ff" stroke-width="2.5" stroke-dasharray="4,4"/>

  <!-- Footer Info -->
  <text x="40" y="440" fill="#86868b" font-family="Arial" font-size="11">ผู้จัดทำ: นายเกียรติภูมิ หารศรีนาถ (รหัสนักศึกษา: 64332110242-2)</text>
  <text x="760" y="440" fill="#2997ff" font-family="Arial" font-size="11" font-weight="bold" text-anchor="end">Production Status: 100% Operational</text>
</svg>
`);

  await sharp(svgContent)
    .png()
    .toFile(path.join(outDir, 'fig0_system_architecture.png'));
  console.log('Generated architecture diagram: fig0_system_architecture.png');
}

async function run() {
  await generateArchitectureDiagram();

  // 1. Catalog screen
  await processScreen('stitch_screen_catalog.png', [
    { num: 1, x: 20, y: 15 },    // Header
    { num: 2, x: 20, y: 110 },   // Hero
    { num: 3, x: 140, y: 320 },  // 3D Carousel
    { num: 4, x: 20, y: 550 },   // Categories
    { num: 5, x: 20, y: 840 },   // Bento cards
  ], 'fig1_catalog_annotated.png', 640);

  // 2. Checkout screen
  await processScreen('stitch_screen_checkout.png', [
    { num: 1, x: 20, y: 120 },   // Order summary
    { num: 2, x: 20, y: 440 },   // Customer form
    { num: 3, x: 20, y: 880 },   // PromptPay option & Submit
  ], 'fig2_checkout_annotated.png', 640);

  // 3. Payment screen
  await processScreen('stitch_screen_payment.png', [
    { num: 1, x: 20, y: 160 },   // PromptPay QR Container
    { num: 2, x: 20, y: 560 },   // Timer & Ref ID
    { num: 3, x: 20, y: 780 },   // Simulate payment button
  ], 'fig3_payment_annotated.png', 640);

  // 4. Delivery screen
  await processScreen('stitch_screen_delivery.png', [
    { num: 1, x: 25, y: 110 },   // Verified badge & Ref
    { num: 2, x: 25, y: 370 },   // Cross-platform iOS & Android notice
    { num: 3, x: 25, y: 490 },   // In-App Canvas Reader button
    { num: 4, x: 25, y: 590 },   // Download & Copy link buttons
  ], 'fig4_delivery_annotated.png', 640);

  // 5. Tracking screen
  await processScreen('stitch_screen_tracking.png', [
    { num: 1, x: 20, y: 150 },   // Search input
    { num: 2, x: 20, y: 300 },   // Order status history
    { num: 3, x: 20, y: 560 },   // Delivery links
  ], 'fig5_tracking_annotated.png', 640);

  console.log('All annotated figures successfully generated!');
}

run().catch(console.error);
