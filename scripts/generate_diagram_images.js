const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'scratch', 'report_assets');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper functions for drawing
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawArrow(ctx, fromx, fromy, tox, toy, label = '') {
  const headlen = 10;
  const angle = Math.atan2(toy - fromy, tox - fromx);
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(tox, toy);
  ctx.fill();

  if (label) {
    const midX = (fromx + tox) / 2;
    const midY = (fromy + toy) / 2 - 8;
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, midX, midY);
    ctx.restore();
  }
}

// 1. USE CASE DIAGRAM
function generateUseCaseDiagram() {
  const width = 1200;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // System Boundary
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  roundRect(ctx, 280, 40, 640, 720, 16, false, true);

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ระบบแพลตฟอร์มคลังหนังสือดิจิทัล (Book Sangdai System)', 600, 75);

  // Actors
  const actors = [
    { label: 'ผู้ซื้อ / ผู้เยี่ยมชม\n(Buyer / Guest)', x: 140, y: 160 },
    { label: 'สมาชิกที่ลงทะเบียน\n(Registered Member)', x: 140, y: 380 },
    { label: 'ร้านค้า / ครีเอเตอร์\n(Merchant)', x: 1060, y: 240 },
    { label: 'ผู้ดูแลระบบ\n(Super Admin)', x: 1060, y: 520 },
  ];

  actors.forEach(act => {
    // Actor Icon (Circle head + body)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(act.x, act.y - 30, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(act.x, act.y - 12);
    ctx.lineTo(act.x, act.y + 25);
    ctx.moveTo(act.x - 22, act.y + 5);
    ctx.lineTo(act.x + 22, act.y + 5);
    ctx.moveTo(act.x, act.y + 25);
    ctx.lineTo(act.x - 16, act.y + 50);
    ctx.moveTo(act.x, act.y + 25);
    ctx.lineTo(act.x + 16, act.y + 50);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const lines = act.label.split('\n');
    ctx.fillText(lines[0], act.x, act.y + 72);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(lines[1], act.x, act.y + 90);
  });

  // Use Cases
  const usecases = [
    { text: 'ค้นหาและเลือกดูผลงานตามหมวดหมู่ (8 หมวด)', y: 120 },
    { text: 'สั่งซื้อและชำระเงินผ่าน PromptPay QR', y: 180 },
    { text: 'แนบสลิปหลักฐานการโอนเงิน (Upload Slip)', y: 240 },
    { text: 'ยืนยันตัวตนด้วย Gmail OTP 2 นาที / Google OAuth', y: 300 },
    { text: 'อ่านและยินยอม PDPA & EULA 100% (Consent Gate)', y: 360 },
    { text: 'เปิดอ่าน E-book ในระบบ (In-Browser Reader)', y: 420 },
    { text: 'ดาวน์โหลดไฟล์ดิจิทัลมาสเตอร์ (.pdf / .zip)', y: 480 },
    { text: 'ลบ E-book ออกจากคลังด้วยรหัสความปลอดภัย', y: 540 },
    { text: 'ตรวจสอบสลิปและอนุมัติปล่อยไฟล์ (Verify Slip)', y: 600 },
    { text: 'ดูศูนย์รายงานสถิติยอดขาย (Report Center)', y: 660 },
    { text: 'จัดการร้านค้าและผู้ใช้ทั้งระบบ (Admin Portal)', y: 720 },
  ];

  ctx.lineWidth = 1.5;
  usecases.forEach(uc => {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#38bdf8';
    roundRect(ctx, 360, uc.y - 18, 480, 36, 18, true, true);

    ctx.fillStyle = '#1e293b';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(uc.text, 600, uc.y + 5);
  });

  // Links
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  // Guest connections
  [0, 1, 2, 3].forEach(idx => {
    ctx.beginPath();
    ctx.moveTo(190, 160);
    ctx.lineTo(360, usecases[idx].y);
    ctx.stroke();
  });

  // Member connections
  [0, 1, 2, 3, 4, 5, 6, 7].forEach(idx => {
    ctx.beginPath();
    ctx.moveTo(190, 380);
    ctx.lineTo(360, usecases[idx].y);
    ctx.stroke();
  });

  // Merchant connections
  [0, 8, 9].forEach(idx => {
    ctx.beginPath();
    ctx.moveTo(1000, 240);
    ctx.lineTo(840, usecases[idx].y);
    ctx.stroke();
  });

  // Admin connections
  [8, 9, 10].forEach(idx => {
    ctx.beginPath();
    ctx.moveTo(1000, 520);
    ctx.lineTo(840, usecases[idx].y);
    ctx.stroke();
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'diagram_usecase.png'), canvas.toBuffer('image/png'));
  console.log('Saved diagram_usecase.png');
}

// 2. ACTIVITY DIAGRAM
function generateActivityDiagram() {
  const width = 1000;
  const height = 920;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Activity Diagram: กระบวนการสั่งซื้อ ชำระเงิน และเปิดสิทธิ์คลังดิจิทัล', 500, 45);

  const steps = [
    { text: 'เริ่มต้น: ลูกค้าเข้าชมหน้าหลักและเลือกผลงานดิจิทัล', type: 'start', y: 80 },
    { text: 'กดสั่งซื้อทันที หรือ เพิ่มสินค้าลงในตะกร้า (/checkout)', type: 'action', y: 150 },
    { text: 'กรอกชื่อ, อีเมลรับไฟล์, และเบอร์โทรศัพท์', type: 'action', y: 220 },
    { text: 'สร้างคำสั่งซื้อสถานะ PENDING และสร้าง QR PromptPay', type: 'action', y: 290 },
    { text: 'ลูกค้าสแกน QR ผ่าน Mobile Banking และอัปโหลดสลิป', type: 'action', y: 370 },
    { text: 'บันทึกรูปสลิปลง Storage และแจ้งเตือนร้านค้า', type: 'action', y: 450 },
    { text: 'ร้านค้าเปิด Merchant Portal ตรวจสอบรูปสลิป', type: 'action', y: 530 },
    { text: 'สลิปถูกต้อง\nยอดเงินครบ?', type: 'decision', y: 620 },
    { text: 'อัปเดตสถานะเป็น PAID และปลดล็อกสิทธิ์ใน My Library', type: 'action', y: 730 },
    { text: 'ลูกค้าเข้าหน้า /library เพื่อเปิดอ่าน PDF หรือดาวน์โหลดไฟล์', type: 'action', y: 810 },
    { text: 'สิ้นสุดกระบวนการสำเร็จ', type: 'end', y: 880 },
  ];

  ctx.lineWidth = 1.5;

  steps.forEach((s, idx) => {
    if (s.type === 'start') {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(500, s.y, 16, 0, Math.PI * 2);
      ctx.fill();
      drawArrow(ctx, 500, s.y + 16, 500, steps[idx + 1].y - 20);
    } else if (s.type === 'end') {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(500, s.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(500, s.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(500, s.y, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.type === 'decision') {
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(500, s.y - 30);
      ctx.lineTo(600, s.y);
      ctx.lineTo(500, s.y + 30);
      ctx.lineTo(400, s.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('สลิปถูกต้อง?', 500, s.y + 4);

      // Branch Yes (down)
      drawArrow(ctx, 500, s.y + 30, 500, steps[idx + 1].y - 20, 'ใช่ (Yes)');

      // Branch No (right reject)
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      drawArrow(ctx, 600, s.y, 800, s.y, 'ไม่ถูกต้อง (No)');
      roundRect(ctx, 740, s.y + 20, 160, 40, 8, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('ยกเลิก/ขอสลิปใหม่', 820, s.y + 45);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#3b82f6';
      roundRect(ctx, 260, s.y - 20, 480, 40, 8, true, true);

      ctx.fillStyle = '#1e293b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.text, 500, s.y + 5);

      if (idx < steps.length - 1 && steps[idx + 1].type !== 'decision') {
        drawArrow(ctx, 500, s.y + 20, 500, steps[idx + 1].y - 20);
      } else if (steps[idx + 1] && steps[idx + 1].type === 'decision') {
        drawArrow(ctx, 500, s.y + 20, 500, steps[idx + 1].y - 30);
      }
    }
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'diagram_activity.png'), canvas.toBuffer('image/png'));
  console.log('Saved diagram_activity.png');
}

// 3. ER DIAGRAM
function generateERDiagram() {
  const width = 1200;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Entity-Relationship (ER) Diagram: โครงสร้างฐานข้อมูล PostgreSQL (Supabase)', 600, 45);

  const tables = [
    {
      name: 'PROFILES',
      x: 60, y: 90, w: 320, h: 260,
      fields: [
        'id : UUID (PK)',
        'email : TEXT',
        'full_name : TEXT',
        'role : TEXT (admin/merchant/user)',
        'merchant_status : TEXT',
        'store_name : TEXT',
        'store_logo_url : TEXT',
        'promptpay_id : TEXT',
        'terms_accepted_at : TIMESTAMPTZ',
        'privacy_accepted_at : TIMESTAMPTZ',
      ]
    },
    {
      name: 'PRODUCTS',
      x: 440, y: 90, w: 320, h: 280,
      fields: [
        'id : TEXT (PK)',
        'title : TEXT',
        'subtitle : TEXT',
        'category : TEXT',
        'price : NUMERIC(10,2)',
        'original_price : NUMERIC(10,2)',
        'file_name : TEXT',
        'cover_image : TEXT',
        'curator : TEXT',
        'merchant_id : UUID (FK -> profiles.id)',
      ]
    },
    {
      name: 'EMAIL_OTPS',
      x: 820, y: 90, w: 320, h: 220,
      fields: [
        'id : UUID (PK)',
        'email : TEXT',
        'otp_code : VARCHAR(6)',
        'purpose : VARCHAR(20)',
        'expires_at : TIMESTAMPTZ (2 min)',
        'used_at : TIMESTAMPTZ',
        'created_at : TIMESTAMPTZ',
      ]
    },
    {
      name: 'ORDERS',
      x: 60, y: 440, w: 340, h: 300,
      fields: [
        'id : TEXT (PK e.g. ORD-2026-8821)',
        'user_id : UUID (FK -> profiles.id)',
        'customer_name : TEXT',
        'customer_email : TEXT',
        'customer_phone : TEXT',
        'total_amount : NUMERIC(10,2)',
        'status : TEXT (PENDING/PAID/EXPIRED)',
        'slip_url : TEXT',
        'merchant_id : UUID (FK -> profiles.id)',
        'is_hidden_by_customer : BOOLEAN',
        'is_deleted_by_merchant : BOOLEAN',
      ]
    },
    {
      name: 'ORDER_ITEMS',
      x: 470, y: 460, w: 320, h: 240,
      fields: [
        'id : UUID (PK)',
        'order_id : TEXT (FK -> orders.id)',
        'product_id : TEXT (FK -> products.id)',
        'title : TEXT',
        'price : NUMERIC(10,2)',
        'file_name : TEXT',
        'is_hidden_by_customer : BOOLEAN',
      ]
    },
    {
      name: 'COMMUNITY_COMMENTS',
      x: 840, y: 460, w: 300, h: 240,
      fields: [
        'id : UUID (PK)',
        'user_id : UUID (FK -> profiles.id)',
        'product_id : TEXT (FK -> products.id)',
        'author : TEXT',
        'rating : INTEGER (1-5)',
        'content : TEXT',
        'is_verified_buyer : BOOLEAN',
      ]
    }
  ];

  tables.forEach(t => {
    // Header
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, t.x, t.y, t.w, 36, 8, true, false);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('  ' + t.name, t.x + 8, t.y + 23);

    // Body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    roundRect(ctx, t.x, t.y + 36, t.w, t.h - 36, 0, true, true);

    // Fields
    ctx.fillStyle = '#334155';
    ctx.font = '12px monospace';
    t.fields.forEach((f, idx) => {
      if (f.includes('(PK)')) {
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 12px monospace';
      } else if (f.includes('(FK')) {
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 12px monospace';
      } else {
        ctx.fillStyle = '#334155';
        ctx.font = '12px monospace';
      }
      ctx.fillText(f, t.x + 12, t.y + 60 + idx * 21);
    });
  });

  // Relationships lines
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2;

  // profiles 1 -> N products
  drawArrow(ctx, 380, 200, 440, 200, '1 : N');

  // orders 1 -> N order_items
  drawArrow(ctx, 400, 560, 470, 560, '1 : N');

  // products 1 -> N order_items
  drawArrow(ctx, 600, 370, 600, 460, '1 : N');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'diagram_er.png'), canvas.toBuffer('image/png'));
  console.log('Saved diagram_er.png');
}

// 4. SEQUENCE DIAGRAM
function generateSequenceDiagram() {
  const width = 1100;
  const height = 750;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sequence Diagram: การสั่งซื้อ อัปโหลดสลิป ตรวจสอบ และดาวน์โหลด', 550, 40);

  const lifelines = [
    { name: 'ลูกค้า\n(Customer)', x: 120 },
    { name: 'เว็บแอปส่วนหน้า\n(Next.js UI)', x: 340 },
    { name: 'ระบบหลังบ้าน\n(Next.js API)', x: 560 },
    { name: 'ฐานข้อมูล/Storage\n(Supabase)', x: 780 },
    { name: 'ร้านค้า\n(Merchant)', x: 980 },
  ];

  lifelines.forEach(ll => {
    // Box
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, ll.x - 70, 70, 140, 45, 8, true, false);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    const lines = ll.name.split('\n');
    ctx.fillText(lines[0], ll.x, 88);
    ctx.font = '11px sans-serif';
    ctx.fillText(lines[1], ll.x, 104);

    // Line
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(ll.x, 115);
    ctx.lineTo(ll.x, 700);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  const messages = [
    { from: 120, to: 340, y: 160, text: '1. สั่งซื้อสินค้าและกรอกข้อมูล (/checkout)' },
    { from: 340, to: 560, y: 200, text: '2. POST /api/orders (สร้างคำสั่งซื้อ PENDING)' },
    { from: 560, to: 780, y: 240, text: '3. บันทึกคำสั่งซื้อลงตาราง orders & order_items' },
    { from: 780, to: 340, y: 280, text: '4. ส่งคืน Order ID & PromptPay QR Payload' },
    { from: 120, to: 780, y: 340, text: '5. สแกนโอนเงิน & อัปโหลดสลิปเข้า Storage Bucket' },
    { from: 340, to: 560, y: 380, text: '6. POST /api/payment/verify-slip (อัปเดต slip_url)' },
    { from: 980, to: 560, y: 440, text: '7. ร้านค้าเปิดตรวจสลิปใน /merchant' },
    { from: 980, to: 560, y: 500, text: '8. กดยืนยันอนุมัติคำสั่งซื้อ (status = PAID)' },
    { from: 560, to: 780, y: 540, text: '9. UPDATE orders SET status = "PAID"' },
    { from: 120, to: 340, y: 600, text: '10. เปิดหน้าคลัง /library (ปลดล็อกสิทธิ์แล้ว)' },
    { from: 340, to: 780, y: 640, text: '11. สตรีมไฟล์ PDF เพื่ออ่านในระบบ / ดาวน์โหลด' },
  ];

  ctx.lineWidth = 1.5;
  messages.forEach(m => {
    ctx.strokeStyle = '#2563eb';
    ctx.fillStyle = '#2563eb';
    drawArrow(ctx, m.from, m.y, m.to, m.y);

    ctx.fillStyle = '#0f172a';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.text, (m.from + m.to) / 2, m.y - 8);
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'diagram_sequence.png'), canvas.toBuffer('image/png'));
  console.log('Saved diagram_sequence.png');
}

// 5. CLASS DIAGRAM
function generateClassDiagram() {
  const width = 1100;
  const height = 750;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Class Diagram: แผนภาพโครงสร้างโมเดลและบริการในระบบ Book Sangdai', 550, 45);

  const classes = [
    {
      name: 'DigitalProduct',
      x: 60, y: 90, w: 300, h: 260,
      attrs: ['+id: string', '+title: string', '+category: ProductCategory', '+price: number', '+originalPrice: number', '+rating: number', '+fileName: string'],
      methods: ['+getDiscountPercent(): number', '+isDiscounted(): boolean']
    },
    {
      name: 'Order',
      x: 400, y: 90, w: 300, h: 260,
      attrs: ['+id: string', '+userId: string', '+customerEmail: string', '+totalAmount: number', '+status: OrderStatus', '+slipUrl: string', '+isHiddenByCustomer: boolean'],
      methods: ['+isPaid(): boolean', '+canBeDeleted(): boolean']
    },
    {
      name: 'UserProfile',
      x: 740, y: 90, w: 300, h: 260,
      attrs: ['+id: string', '+email: string', '+fullName: string', '+role: "admin"|"merchant"|"user"', '+storeName: string', '+termsAcceptedAt: string'],
      methods: ['+hasAcceptedTerms(): boolean', '+isMerchant(): boolean', '+isAdmin(): boolean']
    },
    {
      name: 'OrderItem',
      x: 400, y: 430, w: 300, h: 220,
      attrs: ['+id: string', '+orderId: string', '+productId: string', '+title: string', '+price: number', '+fileName: string', '+isHiddenByCustomer: boolean'],
      methods: ['+getSnapshot(): object']
    },
    {
      name: 'AuthContextService',
      x: 60, y: 430, w: 300, h: 220,
      attrs: ['+user: User', '+profile: UserProfile', '+isLoading: boolean'],
      methods: ['+sendOtp(email, purpose): Promise', '+verifyOtp(email, code): Promise', '+signInWithGoogle(): Promise', '+signOut(): Promise']
    },
    {
      name: 'MerchantReportEngine',
      x: 740, y: 430, w: 300, h: 220,
      attrs: ['+orders: Order[]'],
      methods: ['+calculateGrossRevenue(): number', '+calculateProductRanking(): array', '+calculateFunnelRatios(): object', '+exportCSV(): string']
    }
  ];

  classes.forEach(c => {
    // Header
    ctx.fillStyle = '#334155';
    roundRect(ctx, c.x, c.y, c.w, 32, 6, true, false);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('«interface» ' + c.name, c.x + c.w / 2, c.y + 21);

    // Body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    roundRect(ctx, c.x, c.y + 32, c.w, c.h - 32, 0, true, true);

    // Attributes
    ctx.fillStyle = '#1e293b';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    let yPos = c.y + 50;
    c.attrs.forEach(a => {
      ctx.fillText(a, c.x + 10, yPos);
      yPos += 18;
    });

    // Divider
    ctx.beginPath();
    ctx.moveTo(c.x, yPos + 4);
    ctx.lineTo(c.x + c.w, yPos + 4);
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();
    yPos += 18;

    // Methods
    ctx.fillStyle = '#0369a1';
    ctx.font = 'italic 11px monospace';
    c.methods.forEach(m => {
      ctx.fillText(m, c.x + 10, yPos);
      yPos += 18;
    });
  });

  // Relationships
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  drawArrow(ctx, 550, 350, 550, 430, '1 contains N');
  drawArrow(ctx, 360, 200, 400, 200, 'purchased in');
  drawArrow(ctx, 740, 200, 700, 200, 'places/manages');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'diagram_class.png'), canvas.toBuffer('image/png'));
  console.log('Saved diagram_class.png');
}

// 6. SITE MAP & UI FLOW
function generateSiteMapDiagram() {
  const width = 1100;
  const height = 750;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Site Map & UI Navigation Flow: แผนผังเส้นทางหน้าจอเว็บไซต์ Book Sangdai', 550, 40);

  // Home Node
  ctx.fillStyle = '#0284c7';
  roundRect(ctx, 420, 80, 260, 48, 10, true, false);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('หน้าแรก (Storefront: /)', 550, 110);

  // Main Branches
  const branches = [
    { title: 'สั่งซื้อและชำระเงิน', path: '/checkout ➔ /payment', x: 140, y: 220, color: '#f59e0b' },
    { title: 'คลังส่วนตัว (My Library)', path: '/library (PDF Reader)', x: 420, y: 220, color: '#10b981' },
    { title: 'เข้าสู่ระบบ / ยืนยันตัวตน', path: '/auth/login (OTP & Consent)', x: 700, y: 220, color: '#8b5cf6' },
    { title: 'พอร์ทัลร้านค้า (Merchant)', path: '/merchant (Orders & Reports)', x: 260, y: 460, color: '#0ea5e9' },
    { title: 'ผู้ดูแลระบบ (Admin)', path: '/admin (Master Audit)', x: 620, y: 460, color: '#ef4444' },
  ];

  ctx.lineWidth = 1.5;

  branches.forEach(b => {
    // Arrow from Home
    if (b.y === 220) {
      drawArrow(ctx, 550, 128, b.x + 130, b.y);
    } else {
      drawArrow(ctx, 550, 270, b.x + 130, b.y);
    }

    // Box
    ctx.fillStyle = b.color;
    roundRect(ctx, b.x, b.y, 260, 56, 8, true, false);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.title, b.x + 130, b.y + 24);
    ctx.font = '11px sans-serif';
    ctx.fillText(b.path, b.x + 130, b.y + 44);
  });

  // Sub-branches
  const subnodes = [
    { text: 'สแกน QR PromptPay & อัปโหลดสลิป', x: 270, y: 340 },
    { text: 'In-Browser PDF Reader & ลบคลังปลอดภัย', x: 550, y: 340 },
    { text: 'Gmail OTP (2 นาที) & ยินยอม PDPA 100%', x: 830, y: 340 },
    { text: 'อนุมัติสลิป / จัดการสินค้า 8 หมวด / ดูสถิติยอดขาย', x: 390, y: 580 },
    { text: 'ตรวจสอบรายได้รวม GMV / อนุมัติร้านค้า / Export CSV', x: 750, y: 580 },
  ];

  subnodes.forEach((sn, idx) => {
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#cbd5e1';
    roundRect(ctx, sn.x - 130, sn.y - 18, 260, 36, 6, true, true);
    ctx.fillStyle = '#334155';
    ctx.font = '11px sans-serif';
    ctx.fillText(sn.text, sn.x, sn.y + 5);
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'diagram_sitemap.png'), canvas.toBuffer('image/png'));
  console.log('Saved diagram_sitemap.png');
}

// Run all
generateUseCaseDiagram();
generateActivityDiagram();
generateERDiagram();
generateSequenceDiagram();
generateClassDiagram();
generateSiteMapDiagram();
console.log('ALL DIAGRAMS GENERATED SUCCESSFULLY!');
