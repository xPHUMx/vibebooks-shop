const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve('public/docs_assets');
fs.mkdirSync(outDir, { recursive: true });

async function generateCanvasReaderAnnotated() {
  const width = 800;
  const height = 550;

  const svgContent = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0c"/>
  
  <!-- Top Glass Header Bar -->
  <rect x="0" y="0" width="${width}" height="60" fill="#161617" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="25" y="16" width="28" height="28" rx="7" fill="#0071e3"/>
  <text x="39" y="35" fill="#ffffff" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle">📖</text>
  <text x="65" y="32" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Media_Player_PRO_Engineering.pdf</text>
  <text x="65" y="48" fill="#86868b" font-family="Arial, sans-serif" font-size="10">ผู้จัดทำ: นายเกียรติภูมิ หารศรีนาถ (64332110242-2) • VibeBooks PRO</text>

  <!-- Top Right Actions -->
  <rect x="580" y="16" width="110" height="28" rx="14" fill="rgba(255,255,255,0.08)"/>
  <text x="635" y="34" fill="#f5f5f7" font-family="Arial" font-size="11" font-weight="500" text-anchor="middle">เลื่อนต่อเนื่อง</text>

  <circle cx="715" cy="30" r="14" fill="rgba(255,255,255,0.08)"/>
  <text x="715" y="34" fill="#ffffff" font-family="Arial" font-size="12" text-anchor="middle">📤</text>

  <rect x="740" y="16" width="45" height="28" rx="14" fill="rgba(255,255,255,0.12)"/>
  <text x="762" y="34" fill="#ffffff" font-family="Arial" font-size="11" font-weight="bold" text-anchor="middle">ปิด ✕</text>

  <!-- Canvas Paper Container -->
  <rect x="150" y="80" width="500" height="390" rx="8" fill="#ffffff" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  
  <!-- Page Header Tag -->
  <rect x="150" y="80" width="500" height="24" rx="0" fill="#2c2c2e"/>
  <text x="165" y="96" fill="#86868b" font-family="monospace" font-size="10">หน้า 1 จาก 6</text>
  <text x="635" y="96" fill="#2997ff" font-family="Arial" font-size="10" text-anchor="end">Apple Technical White Paper</text>

  <!-- Simulated Content of Page 1 -->
  <rect x="175" y="120" width="130" height="18" rx="9" fill="#0071e3"/>
  <text x="240" y="133" fill="#ffffff" font-family="Arial" font-size="8.5" font-weight="bold" text-anchor="middle">TECHNICAL WHITE PAPER</text>
  
  <text x="175" y="160" fill="#111827" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Media Player PRO</text>
  <text x="175" y="180" fill="#4b5563" font-family="Arial, sans-serif" font-size="11">สถาปัตยกรรมระบบเครื่องเล่นมัลติมีเดียประสิทธิภาพสูง</text>

  <rect x="175" y="200" width="450" height="85" rx="6" fill="#f4f4f7" stroke="#e5e7eb" stroke-width="1"/>
  <text x="190" y="222" fill="#0071e3" font-family="Arial" font-size="9.5" font-weight="bold">ฮาร์ดแวร์และเทคโนโลยีสถาปัตยกรรม (SYSTEM SPECS)</text>
  <text x="190" y="242" fill="#374151" font-family="Arial" font-size="9">• Audio Engine: Pygame 2.5 + Mutagen Realtime ID3 Decoder</text>
  <text x="190" y="258" fill="#374151" font-family="Arial" font-size="9">• GUI: CustomTkinter Metal Dark Theme (Hardware Accelerated)</text>
  <text x="190" y="274" fill="#374151" font-family="Arial" font-size="9">• Waveform: Pure Canvas Fast DSP RMS Visualizer</text>

  <!-- Dark Terminal Card -->
  <rect x="175" y="300" width="450" height="85" rx="6" fill="#111827"/>
  <text x="190" y="320" fill="#60a5fa" font-family="monospace" font-size="8.5"># Initializing FastPlayer Audio Pipeline</text>
  <text x="190" y="338" fill="#34d399" font-family="monospace" font-size="9">pygame.mixer.pre_init(frequency=44100, size=-16, channels=2, buffer=512)</text>
  <text x="190" y="356" fill="#9ca3af" font-family="monospace" font-size="9">player = FastAudioCore(playlist=music_library)</text>
  <text x="190" y="374" fill="#fbbf24" font-family="monospace" font-size="9">player.play_stream(track_id="01_lossless_audio.flac")</text>

  <!-- Attestation -->
  <text x="175" y="415" fill="#6b7280" font-family="Arial" font-size="8">ผู้จัดทำ: นายเกียรติภูมิ หารศรีนาถ (รหัสนักศึกษา: 64332110242-2)</text>
  <text x="625" y="415" fill="#6b7280" font-family="Arial" font-size="8" text-anchor="end">หน้า 1 / 6</text>

  <!-- Floating Bottom Pill -->
  <rect x="270" y="490" width="260" height="42" rx="21" fill="rgba(28,28,30,0.92)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <circle cx="295" cy="511" r="13" fill="rgba(255,255,255,0.1)"/>
  <text x="295" y="515" fill="#ffffff" font-family="Arial" font-size="13" text-anchor="middle">◀</text>
  <text x="340" y="515" fill="#f5f5f7" font-family="monospace" font-size="11" text-anchor="middle">1 / 6 หน้า</text>
  <circle cx="385" cy="511" r="13" fill="rgba(255,255,255,0.1)"/>
  <text x="385" y="515" fill="#ffffff" font-family="Arial" font-size="13" text-anchor="middle">▶</text>

  <circle cx="430" cy="511" r="13" fill="rgba(255,255,255,0.1)"/>
  <text x="430" y="515" fill="#ffffff" font-family="Arial" font-size="13" text-anchor="middle">🔍-</text>
  <text x="465" y="515" fill="#f5f5f7" font-family="monospace" font-size="11" text-anchor="middle">120%</text>
  <circle cx="505" cy="511" r="13" fill="rgba(255,255,255,0.1)"/>
  <text x="505" y="515" fill="#ffffff" font-family="Arial" font-size="13" text-anchor="middle">🔍+</text>

  <!-- Number Badges -->
  <g transform="translate(15, 10)">
    <circle cx="16" cy="16" r="14" fill="#0071e3" stroke="#ffffff" stroke-width="2"/>
    <text x="16" y="21" font-size="13" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  </g>

  <g transform="translate(125, 70)">
    <circle cx="16" cy="16" r="14" fill="#0071e3" stroke="#ffffff" stroke-width="2"/>
    <text x="16" y="21" font-size="13" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  </g>

  <g transform="translate(240, 480)">
    <circle cx="16" cy="16" r="14" fill="#0071e3" stroke="#ffffff" stroke-width="2"/>
    <text x="16" y="21" font-size="13" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  </g>

  <g transform="translate(755, 10)">
    <circle cx="16" cy="16" r="14" fill="#0071e3" stroke="#ffffff" stroke-width="2"/>
    <text x="16" y="21" font-size="13" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
  </g>
</svg>
`);

  await sharp(svgContent).png().toFile(path.join(outDir, 'fig6_canvas_reader_annotated.png'));
  console.log('Generated: fig6_canvas_reader_annotated.png');
}

async function generateMitAppAnnotated() {
  const width = 800;
  const height = 480;

  const svgContent = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#111317"/>
  
  <text x="40" y="45" fill="#f5f5f7" font-family="Arial, sans-serif" font-size="18" font-weight="bold">MIT App Inventor — โครงสร้างบล็อกและการเชื่อมต่อ WebViewer</text>
  <text x="40" y="70" fill="#86868b" font-family="Arial, sans-serif" font-size="12">รองรับทั้ง Android APK และ iOS Companion พร้อม ActivityStarter Bridge</text>

  <!-- Block 1: Screen1.BackPressed -->
  <rect x="40" y="100" width="340" height="150" rx="12" fill="#7a5500" stroke="#ffd15c" stroke-width="1.5"/>
  <rect x="50" y="110" width="190" height="26" rx="6" fill="#d99b00"/>
  <text x="60" y="127" fill="#ffffff" font-family="Arial" font-size="11" font-weight="bold">when Screen1.BackPressed do</text>
  
  <rect x="65" y="145" width="295" height="40" rx="6" fill="#005b96"/>
  <text x="75" y="162" fill="#ffffff" font-family="Arial" font-size="10.5" font-weight="bold">if call WebViewer1.CanGoBack then</text>
  <text x="90" y="177" fill="#81d4fa" font-family="Arial" font-size="10">call WebViewer1.GoBack</text>

  <rect x="65" y="195" width="295" height="40" rx="6" fill="#b71c1c"/>
  <text x="75" y="212" fill="#ffffff" font-family="Arial" font-size="10.5" font-weight="bold">else</text>
  <text x="90" y="227" fill="#ffcdd2" font-family="Arial" font-size="10">call close application</text>

  <!-- Block 2: WebViewer1.WebViewStringChange -->
  <rect x="400" y="100" width="360" height="230" rx="12" fill="#0071e3" stroke="#60a5fa" stroke-width="1.5"/>
  <rect x="410" y="110" width="280" height="26" rx="6" fill="#005bb5"/>
  <text x="420" y="127" fill="#ffffff" font-family="Arial" font-size="11" font-weight="bold">when WebViewer1.WebViewStringChange do</text>
  
  <rect x="425" y="145" width="315" height="40" rx="6" fill="#004385"/>
  <text x="435" y="162" fill="#ffffff" font-family="Arial" font-size="10.5" font-weight="bold">if length(WebViewer1.WebViewString) &gt; 5 then</text>
  <text x="450" y="177" fill="#90caf9" font-family="Arial" font-size="10">set ActivityStarter1.Action to "android.intent.action.VIEW"</text>

  <rect x="425" y="195" width="315" height="40" rx="6" fill="#004385"/>
  <text x="435" y="212" fill="#90caf9" font-family="Arial" font-size="10">set ActivityStarter1.DataUri to WebViewer1.WebViewString</text>

  <rect x="425" y="245" width="315" height="40" rx="6" fill="#2e7d32"/>
  <text x="435" y="265" fill="#ffffff" font-family="Arial" font-size="10.5" font-weight="bold">call ActivityStarter1.StartActivity</text>
  <text x="435" y="278" fill="#a5d6a7" font-family="Arial" font-size="9">เรียกเบราว์เซอร์หลักดาวน์โหลดไฟล์ PDF เข้าเครื่องทันที</text>

  <!-- Summary Components Table -->
  <rect x="40" y="350" width="720" height="85" rx="10" fill="#1c1c1e" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="60" y="375" fill="#f5f5f7" font-family="Arial" font-size="12" font-weight="bold">คอมโพเนนต์หลักที่ใช้ใน MIT App Inventor:</text>
  <text x="60" y="398" fill="#86868b" font-family="Arial" font-size="10.5">• WebViewer1: HomeUrl = "https://vibebooks.vercel.app", IgnoreSslErrors = False, Height/Width = Fill Parent</text>
  <text x="60" y="418" fill="#86868b" font-family="Arial" font-size="10.5">• ActivityStarter1: Action = "android.intent.action.VIEW", ใช้เปิดลิงก์ดาวน์โหลดและไฟล์ภายนอกอัตโนมัติ</text>

  <!-- Number Badges -->
  <g transform="translate(15, 90)">
    <circle cx="16" cy="16" r="14" fill="#0071e3" stroke="#ffffff" stroke-width="2"/>
    <text x="16" y="21" font-size="13" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
  </g>

  <g transform="translate(375, 90)">
    <circle cx="16" cy="16" r="14" fill="#0071e3" stroke="#ffffff" stroke-width="2"/>
    <text x="16" y="21" font-size="13" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
  </g>

  <g transform="translate(15, 340)">
    <circle cx="16" cy="16" r="14" fill="#0071e3" stroke="#ffffff" stroke-width="2"/>
    <text x="16" y="21" font-size="13" font-family="Arial" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
  </g>
</svg>
`);

  await sharp(svgContent).png().toFile(path.join(outDir, 'fig7_mit_app_annotated.png'));
  console.log('Generated: fig7_mit_app_annotated.png');
}

async function run() {
  await generateCanvasReaderAnnotated();
  await generateMitAppAnnotated();
}
run().catch(console.error);
