const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  ImageRun, Header, Footer, PageNumber, PageBreak
} = require('docx');

const ASSETS_DIR = path.join(__dirname, '..', 'scratch', 'report_assets');
const OUTPUT_FILE = path.join(__dirname, '..', 'รายงานมินิโปรเจ็ค_BOOK_SANGDAI_บุ๊คสั่งได้.docx');

// Ensure logo is copied
const logoSrc = path.join(__dirname, '..', 'public', 'icon.png');
const logoDest = path.join(ASSETS_DIR, 'ui_app_logo.png');
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, logoDest);
}

// Helper: Read Image buffer safely
function getImageBuffer(fileName) {
  const filePath = path.join(ASSETS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}

// Typography Styles
const FONT_TH = 'TH Sarabun New';
const COLOR_PRIMARY = '0F172A';
const COLOR_SECONDARY = '0284C7';
const COLOR_TEXT = '1E293B';
const COLOR_MUTED = '64748B';

// Paragraph Helpers
function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT_TH,
        size: 38, // 19pt
        bold: true,
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

function createChapterHeading(chapterNum, title) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 280, after: 80 },
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: `บทที่ ${chapterNum}`,
          font: FONT_TH,
          size: 36, // 18pt
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [
        new TextRun({
          text: title,
          font: FONT_TH,
          size: 32, // 16pt
          bold: true,
          color: COLOR_SECONDARY,
        }),
      ],
    }),
  ];
}

function createH2(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text,
        font: FONT_TH,
        size: 30, // 15pt
        bold: true,
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

function createH3(text) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    heading: HeadingLevel.HEADING_3,
    children: [
      new TextRun({
        text,
        font: FONT_TH,
        size: 28, // 14pt
        bold: true,
        color: COLOR_SECONDARY,
      }),
    ],
  });
}

function createP(text, indent = true) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 320 },
    indent: indent ? { firstLine: 480 } : undefined,
    children: [
      new TextRun({
        text,
        font: FONT_TH,
        size: 28, // 14pt
        color: COLOR_TEXT,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(
      new TextRun({
        text: boldPrefix + ' ',
        font: FONT_TH,
        size: 28,
        bold: true,
        color: COLOR_PRIMARY,
      })
    );
  }
  children.push(
    new TextRun({
      text,
      font: FONT_TH,
      size: 28,
      color: COLOR_TEXT,
    })
  );

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 300 },
    children,
  });
}

function createImageFigure(fileName, caption, width = 520, height = 310) {
  const buf = getImageBuffer(fileName);
  if (!buf) {
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: `[ไม่พบไฟล์ภาพ: ${fileName}]`,
            font: FONT_TH,
            size: 24,
            color: 'EF4444',
            italic: true,
          }),
        ],
      }),
    ];
  }

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 60 },
      children: [
        new ImageRun({
          data: buf,
          transformation: { width, height },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 140 },
      children: [
        new TextRun({
          text: caption,
          font: FONT_TH,
          size: 24, // 12pt
          bold: true,
          color: COLOR_MUTED,
        }),
      ],
    }),
  ];
}

function createCustomTable(headers, rows, colWidths = []) {
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: 'CBD5E1',
  };

  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
  };

  const headerCells = headers.map((h, i) => {
    return new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: '1E293B', type: ShadingType.CLEAR },
      borders,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: FONT_TH,
              size: 26,
              bold: true,
              color: 'FFFFFF',
            }),
          ],
        }),
      ],
    });
  });

  const bodyRows = rows.map((r, rowIdx) => {
    const bgColor = rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    const cells = r.map((c, colIdx) => {
      return new TableCell({
        width: colWidths[colIdx] ? { size: colWidths[colIdx], type: WidthType.DXA } : undefined,
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        borders,
        children: [
          new Paragraph({
            alignment: colIdx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: c,
                font: FONT_TH,
                size: 24,
                color: COLOR_TEXT,
              }),
            ],
          }),
        ],
      });
    });
    return new TableRow({ children: cells });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...bodyRows],
  });
}

console.log('Building document structure...');

// -------------------------------------------------------------
// DOCUMENT CONTENT ASSEMBLY
// -------------------------------------------------------------
const docChildren = [];

// ==================== 1. COVER PAGE ====================
if (getImageBuffer('ui_app_logo.png')) {
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 150 },
      children: [
        new ImageRun({
          data: getImageBuffer('ui_app_logo.png'),
          transformation: { width: 100, height: 100 },
        }),
      ],
    })
  );
}

docChildren.push(
  createTitle('รายงานโครงงานคอมพิวเตอร์ (มินิโปรเจ็ค)'),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text: 'ระบบคลังผลงานและหนังสือดิจิทัล "BOOK SANGDAI (บุ๊คสั่งได้)"',
        font: FONT_TH,
        size: 34,
        bold: true,
        color: COLOR_SECONDARY,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 300 },
    children: [
      new TextRun({
        text: 'Digital-Store & Personal Vault Multi-Platform Web Application',
        font: FONT_TH,
        size: 26,
        italic: true,
        color: COLOR_MUTED,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 60 },
    children: [
      new TextRun({
        text: 'จัดทำโดย',
        font: FONT_TH,
        size: 28,
        bold: true,
        color: COLOR_PRIMARY,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text: 'นายเกียรติภูมิ หารศรีนาถ',
        font: FONT_TH,
        size: 30,
        bold: true,
        color: COLOR_TEXT,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 300 },
    children: [
      new TextRun({
        text: 'รหัสนักศึกษา: 64332110242-2',
        font: FONT_TH,
        size: 28,
        bold: true,
        color: COLOR_PRIMARY,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 60 },
    children: [
      new TextRun({
        text: 'รายงานนี้เป็นส่วนหนึ่งของวิชา หัวข้อเลือกสรรทางคอมพิวเตอร์ซอฟต์แวร์',
        font: FONT_TH,
        size: 28,
        color: COLOR_TEXT,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text: 'สาขาวิชา วิศวกรรมคอมพิวเตอร์ (ECP4N)',
        font: FONT_TH,
        size: 28,
        bold: true,
        color: COLOR_TEXT,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 100 },
    children: [
      new TextRun({
        text: 'ภาคการศึกษาที่ 1 ปีการศึกษา 2569',
        font: FONT_TH,
        size: 28,
        color: COLOR_MUTED,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==================== ABSTRACT & ACKNOWLEDGEMENTS ====================
docChildren.push(
  createTitle('บทคัดย่อ'),
  createP(
    'โครงงานนี้มีวัตถุประสงค์เพื่อพัฒนาแพลตฟอร์มคลังสินค้าและหนังสือดิจิทัลภายใต้ชื่อ "BOOK SANGDAI (บุ๊คสั่งได้)" ซึ่งเป็นระบบจัดการและจำหน่ายทรัพยากรดิจิทัล (Digital Store & Creator Vault) สำหรับครีเอเตอร์และผู้ใช้งานทั่วไป โดยนำเทคโนโลยีสมัยใหม่มาประยุกต์ใช้งานร่วมกันอย่างมีประสิทธิภาพ ได้แก่ Next.js 14 App Router, TypeScript, Tailwind CSS, ฐานข้อมูล PostgreSQL บน Supabase, ระบบส่งอีเมลยืนยันตัวตนด้วยรหัส OTP อายุ 2 นาที ผ่าน Resend API, และระบบชำระเงินดิจิทัลผ่าน PromptPay QR Code พร้อมการตรวจสอบสลิปโอนเงิน (Slip Verification Gateway)'
  ),
  createP(
    'จุดเด่นสำคัญของระบบประกอบด้วย: (1) ระบบความปลอดภัย Strict Registration และประตูอ่านข้อตกลงการใช้งานตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA Consent Reading Gate) แบบ 100% สกอร์, (2) คลังดิจิทัลส่วนตัว (My Library Vault) ที่รองรับการอ่านไฟล์ PDF โดยตรงบนเบราว์เซอร์ (In-Browser Reader) และดาวน์โหลดไฟล์มาสเตอร์, (3) ระบบความปลอดภัยในการลบผลงานด้วยรหัส Catalog Code ยืนยัน, (4) ศูนย์รายงานสถิติยอดขาย (Merchant & Admin Report Center) ที่รักษาความถูกต้องของข้อมูลธุรกรรมแม้ลูกค้าลบคลังสินค้า, และ (5) สถาปัตยกรรมแบบ Multi-Platform ที่สามารถแปลงเว็บแอปพลิเคชันเป็น Mobile App (Capacitor สำหรับ iOS/Android) และ Windows Desktop App (.exe Installer ผ่าน Electron) โดยเชื่อมโยงข้อมูลจากคลาวด์ Vercel แบบเรียลไทม์'
  ),
  new Paragraph({
    spacing: { before: 140, after: 100 },
    children: [
      new TextRun({
        text: 'คำสำคัญ: ',
        font: FONT_TH,
        size: 28,
        bold: true,
        color: COLOR_PRIMARY,
      }),
      new TextRun({
        text: 'Digital Store, คลังหนังสือดิจิทัล, Next.js 14, Supabase, PromptPay, Capacitor, Electron, PDPA Consent, Multi-Agent System',
        font: FONT_TH,
        size: 28,
        color: COLOR_TEXT,
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==================== CHAPTER 1 ====================
docChildren.push(
  ...createChapterHeading(1, 'บทนำ (Introduction)'),
  createH2('1.1 ความเป็นมาและความสำคัญของปัญหา (Background and Significance)'),
  createP(
    'ในยุคดิจิทัลปัจจุบัน การซื้อขายและบริโภคสื่อความรู้และทรัพยากรดิจิทัล (Digital Assets) เช่น E-Book, UI Kit, ซอร์สโค้ด, และเทมเพลตโปรแกรม มีการเติบโตขึ้นอย่างรวดเร็ว อย่างไรก็ตาม แพลตฟอร์มจำหน่ายหนังสือและผลงานดิจิทัลส่วนใหญ่มักประสบปัญหาด้านความสะดวกในการใช้งาน ข้อจำกัดในการเปิดอ่านไฟล์ที่ต้องพึ่งพาแอปพลิเคชันบุคคลที่สาม รวมถึงปัญหาความปลอดภัยในระบบชำระเงินและการจัดการสิทธิ์ในทรัพย์สินทางปัญญา'
  ),
  createP(
    'นอกจากนี้ ร้านค้าและครีเอเตอร์ขนาดกลางและขนาดย่อมมักขาดเครื่องมือในการตรวจสอบสลิปโอนเงินที่มีประสิทธิภาพ ส่งผลให้เกิดความล่าช้าในการส่งมอบไฟล์งานดิจิทัลให้แก่ผู้ซื้อ ยิ่งไปกว่านั้น กฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของประเทศไทยได้กำหนดให้ผู้ให้บริการต้องได้รับความยินยอมอย่างชัดแจ้งจากผู้ใช้งานก่อนการเก็บรวบรวมข้อมูลส่วนบุคคล ซึ่งหลายระบบยังขาดกลไกการบังคับอ่านข้อตกลงที่แท้จริง'
  ),
  createP(
    'จากปัญหาดังกล่าว ผู้จัดทำจึงได้พัฒนาโครงงาน "BOOK SANGDAI (บุ๊คสั่งได้)" เพื่อเป็นแพลตฟอร์มคลังสินค้าและหนังสือดิจิทัลที่ทันสมัย ใช้งานง่าย มีความปลอดภัยสูง รองรับการอ่าน E-Book ภายในเบราว์เซอร์ พร้อมระบบตรวจสอบสลิป PromptPay อัตโนมัติ และต่อยอดสู่การใช้งานบนมือถือและเดสก์ท็อปได้อย่างสมบูรณ์แบบ'
  ),

  createH2('1.2 วัตถุประสงค์ของโครงงาน (Objectives)'),
  createBullet('เพื่อออกแบบและพัฒนาเว็บแอปพลิเคชันคลังผลงานและหนังสือดิจิทัล "BOOK SANGDAI" ด้วย Next.js 14 และ Supabase', '1.'),
  createBullet('เพื่อพัฒนาระบบชำระเงินผ่าน PromptPay QR Code พร้อมระบบอัปโหลดและตรวจสอบสลิปโอนเงิน (Slip Verification Gateway)', '2.'),
  createBullet('เพื่อพัฒนาระบบคลังหนังสือดิจิทัลส่วนตัว (My Library Vault) ที่มี In-Browser PDF Reader ป้องกันการดาวน์โหลดซ้ำซ้อนและเปิดอ่านได้ทันที', '3.'),
  createBullet('เพื่อพัฒนาระบบความปลอดภัยและการยินยอมข้อมูลส่วนบุคคล (PDPA / EULA Consent Reading Gate 100%) และรหัสยืนยัน OTP 2 นาที', '4.'),
  createBullet('เพื่อพัฒนาระบบศูนย์รายงานสถิติยอดขาย (Report Center) วิเคราะห์รายได้, ช่องทางการขาย (Funnel), และส่งออกรายงาน CSV', '5.'),
  createBullet('เพื่อต่อยอดสถาปัตยกรรมระบบสู่ Mobile Application (Capacitor) และ Desktop Application (Electron Installer .exe)', '6.'),

  createH2('1.3 ขอบเขตของโครงงาน (Project Scope)'),
  createP('ระบบ Book Sangdai ครอบคลุมการทำงานของผู้ใช้งาน 4 บทบาทหลัก (Actors):'),
  createBullet('สามารถค้นหา กรองสินค้า 8 หมวดหมู่, สั่งซื้อทันที, ชำระเงิน PromptPay QR, อัปโหลดสลิป และติดตามสถานะออเดอร์', '1. ผู้ซื้อ / ผู้เยี่ยมชม (Guest & Buyer):'),
  createBullet('เข้าสู่ระบบด้วย Gmail OTP (อายุ 2 นาที) หรือ Google OAuth, ผ่านการอ่านข้อตกลง 100%, เข้าถึงคลัง My Library, อ่าน PDF, โหลดไฟล์มาสเตอร์, และลบผลงานด้วยรหัส Catalog Code', '2. สมาชิกที่ลงทะเบียน (Registered Member):'),
  createBullet('สมัครเปิดร้านค้า, อัปโหลดสินค้า 8 หมวดหมู่, ตรวจสอบสลิปโอนเงินและอนุมัติปล่อยไฟล์, ดูศูนย์รายงานสถิติยอดขาย (Gross Revenue, AOV, Funnel, Ranking), และลบรายการธุรกรรมด้วยรหัส Order ID', '3. ร้านค้า / ครีเอเตอร์ (Merchant):'),
  createBullet('แดชบอร์ดภาพรวมรายได้ทั้งระบบ (Platform GMV), ตรวจสอบและอนุมัติใบสมัครร้านค้า, จัดการระงับผู้ใช้งาน, และส่งออก Master CSV Audit Trail', '4. ผู้ดูแลระบบส่วนกลาง (Super Admin):'),

  createH2('1.4 ประโยชน์ที่คาดว่าจะได้รับ (Expected Benefits)'),
  createBullet('ผู้ซื้อได้รับประสบการณ์สั่งซื้อสินค้าดิจิทัลที่รวดเร็ว ชำระเงินสะดวก และเปิดอ่านหนังสือในคลังได้ทันทีโดยไม่ต้องลงแอปเพิ่ม', '1.'),
  createBullet('ร้านค้ามีศูนย์รวมการจัดการสินค้าดิจิทัลและเครื่องมือตรวจสลิปที่ปลอดภัย ลดเวลาในการอนุมัติออเดอร์', '2.'),
  createBullet('มีระบบศูนย์รายงานสถิติที่ช่วยให้ร้านค้าเข้าใจพฤติกรรมลูกค้าและยอดขายได้อย่างแม่นยำ', '3.'),
  createBullet('เป็นต้นแบบของระบบที่ปฏิบัติตามกฎหมาย PDPA อย่างเคร่งครัดด้วย Consent Reading Gate', '4.'),
  createBullet('ได้รับความรู้เชิงลึกด้านการผสานรวม Web, Mobile (Capacitor), และ Desktop (Electron) จากโค้ดเบสเดียวกัน', '5.'),

  new Paragraph({ children: [new PageBreak()] })
);

// ==================== CHAPTER 2 ====================
docChildren.push(
  ...createChapterHeading(2, 'ทฤษฎีและเทคโนโลยีที่เกี่ยวข้อง (Theories and Technologies)'),
  createH2('2.1 สถาปัตยกรรม Web Application ยุคใหม่ (Next.js 14 App Router)'),
  createP(
    'Next.js 14 เป็น React Framework ระดับองค์กรที่นำสถาปัตยกรรม App Router มาใช้งาน โดยแบ่งการประมวลผลออกเป็น Server Components และ Client Components ช่วยเพิ่มประสิทธิภาพในการเรนเดอร์หน้าเว็บ (Server-Side Rendering: SSR) และลดขนาด JavaScript Bundle ที่ส่งไปยังเบราว์เซอร์ของผู้ใช้ ทำให้หน้าเว็บโหลดได้อย่างรวดเร็ว มีประสิทธิภาพด้าน SEO และมีความปลอดภัยในการซ่อนกุญแจลับ (API Keys) ไว้บนเซิร์ฟเวอร์'
  ),

  createH2('2.2 ภาษา TypeScript และระบบ Tailwind CSS Styling'),
  createP(
    'TypeScript ช่วยเพิ่มความแข็งแกร่งให้กับโครงสร้างโค้ดด้วยระบบ Static Type Checking ป้องกันข้อผิดพลาดประเภท Type Mismatch ในระหว่างการพัฒนา และทำให้การแลกเปลี่ยนข้อมูลระหว่าง Frontend และ Backend API มีความสอดคล้องกัน 100% ส่วน Tailwind CSS เป็น Utility-First CSS Framework ที่ช่วยให้การจัดรูปแบบหน้าจอมีความสวยงาม ยืดหยุ่น รองรับการแสดงผลทุกขนาดหน้าจอ (Responsive Design) และรองรับการทำ Dark Mode ได้อย่างราบรื่น'
  ),

  createH2('2.3 ฐานข้อมูล PostgreSQL และแพลตฟอร์ม Supabase'),
  createP(
    'Supabase เป็นแพลตฟอร์ม Backend-as-a-Service (BaaS) แบบโอเพนซอร์สที่ทำงานบนฐานข้อมูลเชิงสัมพันธ์ PostgreSQL โดยโครงงานนี้เลือกใช้ฟีเจอร์หลัก 4 ประการ ได้แก่:'
  ),
  createBullet('PostgreSQL Database สำหรับจัดเก็บตารางข้อมูลผู้ใช้, ผลงานดิจิทัล, คำสั่งซื้อ, รายการสั่งซื้อ, และประวัติการยินยอม PDPA', '1.'),
  createBullet('Row Level Security (RLS) การกำหนดนโยบายความปลอดภัยระดับแถว เพื่อให้มั่นใจว่าผู้ใช้แต่ละคนสามารถเข้าถึงได้เฉพาะข้อมูลของตนเองเท่านั้น', '2.'),
  createBullet('Supabase Storage Buckets สำหรับจัดเก็บไฟล์รูปภาพสลิปโอนเงิน (slips) และโลโก้ร้านค้าอย่างปลอดภัย', '3.'),
  createBullet('Supabase Auth & Database Webhooks สำหรับจัดการเซสชันและการเชื่อมต่อ Google OAuth Single Sign-On', '4.'),

  createH2('2.4 ระบบยืนยันตัวตนและการส่งอีเมลความเร็วสูง (Resend API & Gmail OTP)'),
  createP(
    'เพื่อความปลอดภัยสูงสุดและป้องกันการสแปมระบบ โครงงานได้เลือกใช้บริการ Resend API ในการส่งรหัสผ่านใช้ครั้งเดียว (One-Time Password: OTP) จำนวน 6 หลัก ไปยังกล่องข้อความ Gmail ของผู้ใช้ โดยกำหนดระยะเวลาหมดอายุของรหัสไว้อย่างรัดกุมที่ 2 นาที (120 วินาที) พร้อมเทมเพลตอีเมลสไตล์ Minimalist ที่แสดงตัวเลขแบบตารางไทล์สีขาวชัดเจน'
  ),

  createH2('2.5 พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) และ EULA'),
  createP(
    'เพื่อให้สอดคล้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ระบบได้พัฒนากลไก "Consent Reading Gate" โดยผู้ใช้จะต้องเลื่อนอ่านข้อตกลงและเงื่อนไข (EULA) รวมถึงนโยบายความเป็นส่วนตัว (PDPA Privacy Policy) จนครบ 100% ของพื้นที่เนื้อหา ปุ่มยืนยันจึงจะปลดล็อกให้สามารถกดสมัครสมาชิกหรือเปิดใช้งานบัญชีได้ พร้อมทำการประทับเวลา (Timestamp) ลงในฐานข้อมูล Supabase เพื่อใช้เป็นหลักฐาน Audit Trail'
  ),

  createH2('2.6 สถาปัตยกรรม Multi-Platform: Mobile (Capacitor) & Desktop (Electron)'),
  createP(
    'โครงงานนำแนวคิด Single Source of Truth มาปรับใช้ โดยการนำโดเมนเว็บแอปพลิเคชันหลัก (https://booksangdai.vercel.app) มาเชื่อมโยงเข้ากับ Native Runtimes:'
  ),
  createBullet('Capacitor (โดย Ionic) ทำหน้าที่ห่อหุ้มเว็บแอปพลิเคชันเป็น Mobile Native Container สำหรับ Android และ iOS รองรับฟังก์ชัน Hardware และ Safe Area', '1. Mobile App:'),
  createBullet('Electron ทำหน้าที่สร้างแอปพลิเคชันเดสก์ท็อปสำหรับ Windows และ macOS โดยใช้ Chromium + Node.js พร้อมระบบความปลอดภัย Sandbox และสร้างไฟล์ติดตั้ง .exe ด้วย electron-builder', '2. Desktop App:'),

  createH2('2.7 กระบวนการพัฒนาซอฟต์แวร์แบบ Multi-Agent AI System'),
  createP(
    'ในการพัฒนาโครงงานนี้ ได้ประยุกต์ใช้โมเดลการทำงานร่วมกันของ 5 AI Sub-Agents ตามหลักการแบ่งหน้าที่ (Separation of Concerns):'
  ),
  createBullet('วางแผนข้อกำหนดความต้องการ (PRD) และจัดการ User Stories', '1. Product Manager Agent:'),
  createBullet('ออกแบบ Wireframe, Color Tokens, Typography, และ Component Design System', '2. UI/UX Designer Agent:'),
  createBullet('พัฒนา Client Components, Next.js Pages, Responsive Layouts, และ State Management', '3. Frontend Developer Agent:'),
  createBullet('ออกแบบ Database Schema, เขียนคำสั่ง SQL Editor, พัฒนา Route Handlers และ API Security', '4. Backend Developer Agent:'),
  createBullet('ตรวจสอบคุณภาพโค้ด, ตรวจสอบช่องโหว่ความปลอดภัย, ทำ Type Checking และรัน Test Cases', '5. QA / Tester Agent:'),

  new Paragraph({ children: [new PageBreak()] })
);

// ==================== CHAPTER 3 ====================
docChildren.push(
  ...createChapterHeading(3, 'การวิเคราะห์และออกแบบระบบ (System Analysis and Design)'),
  createH2('3.1 การวิเคราะห์ความต้องการของระบบ (System Requirements)'),
  createH3('3.1.1 ข้อกำหนดเชิงหน้าที่ (Functional Requirements)'),
  createBullet('ระบบต้องรองรับการเลือกดูและกรองสินค้าตามหมวดหมู่มาตรฐาน 8 หมวดหมู่ได้อย่างถูกต้อง', 'FR-01:'),
  createBullet('ระบบต้องสร้างคำสั่งซื้อและออกรหัส PromptPay QR Code พร้อมกำหนดสถานะเริ่มต้นเป็น PENDING', 'FR-02:'),
  createBullet('ระบบต้องรองรับการอัปโหลดสลิปโอนเงินเข้า Supabase Storage และแจ้งเตือนร้านค้า', 'FR-03:'),
  createBullet('ระบบต้องอนุญาตให้ร้านค้าตรวจสอบรูปสลิปและกดยืนยันอนุมัติเพื่อเปลี่ยนสถานะเป็น PAID', 'FR-04:'),
  createBullet('ระบบต้องปลดล็อกสิทธิ์ดาวน์โหลดและเปิดอ่าน E-book ในคลัง My Library เมื่อออเดอร์เป็น PAID', 'FR-05:'),
  createBullet('ระบบต้องบังคับเลื่อนอ่านข้อตกลง PDPA/EULA ครบ 100% ก่อนกดยอมรับ', 'FR-06:'),
  createBullet('ระบบต้องตรวจสอบว่ามีอีเมลในฐานข้อมูลก่อนส่ง OTP 2 นาที เพื่อป้องกันการขอ OTP สุ่มสี่สุ่มห้า', 'FR-07:'),
  createBullet('ระบบต้องมีศูนย์รายงานสถิติยอดขาย (Report Center) สำหรับร้านค้าและแอดมิน', 'FR-08:'),
  createBullet('ระบบต้องรักษาประวัติยอดขายและธุรกรรมของร้านค้าไว้ครบถ้วน แม้ลูกค้าลบหนังสือออกจากคลังส่วนตัว', 'FR-09:'),

  createH3('3.1.2 ข้อกำหนดที่ไม่ใช่เชิงหน้าที่ (Non-Functional Requirements)'),
  createBullet('ระบบต้องตอบสนองคำสั่งซื้อและโหลดหน้าแรกภายในเวลาไม่เกิน 2.5 วินาที', 'NFR-01 (Performance):'),
  createBullet('ระบบต้องเข้ารหัสข้อมูลสำคัญ ใช้ HTTPS และกำหนดสิทธิ์ Row Level Security บนฐานข้อมูล', 'NFR-02 (Security):'),
  createBullet('ระบบต้องรองรับการแสดงผลแบบ Responsive บนโทรศัพท์มือถือ, แท็บเล็ต, และคอมพิวเตอร์', 'NFR-03 (Usability):'),
  createBullet('ระบบต้องทำงานได้ต่อเนื่อง (High Availability) ผ่านโครงสร้างพื้นฐานระดับโลกของ Vercel และ Supabase', 'NFR-04 (Reliability):'),

  createH2('3.2 แผนภาพการใช้งานระบบ (Use Case Diagram)'),
  createP('แผนภาพ Use Case แสดงขอบเขตหน้าที่และปฏิสัมพันธ์ระหว่างผู้ใช้แต่ละกลุ่มกับระบบ Book Sangdai:'),
  ...createImageFigure('diagram_usecase.png', 'รูปที่ 3.1: Use Case Diagram ของระบบ Book Sangdai', 540, 360),

  createH2('3.3 แผนภาพกิจกรรมการทำงาน (Activity Diagram)'),
  createP('แผนภาพ Activity แสดงลำดับขั้นตอนการดำเนินงานทางธุรกิจ ตั้งแต่การเลือกดูสินค้า จนกระทั่งร้านค้าตรวจสอบสลิปและส่งมอบไฟล์:'),
  ...createImageFigure('diagram_activity.png', 'รูปที่ 3.2: Activity Diagram แสดงกระบวนการสั่งซื้อ ชำระเงิน และตรวจสอบสลิป', 520, 480),

  createH2('3.4 แผนภาพความสัมพันธ์ข้อมูล (Entity-Relationship Diagram: ERD)'),
  createP('โครงสร้างฐานข้อมูลเชิงสัมพันธ์ของระบบประกอบด้วย 6 ตารางหลักที่เชื่อมโยงกัน:'),
  ...createImageFigure('diagram_er.png', 'รูปที่ 3.3: Entity-Relationship (ER) Diagram ของระบบ Book Sangdai', 540, 360),

  createH3('พจนานุกรมข้อมูล (Data Dictionary)'),
  createP('ตารางที่ 3.1 แสดงรายละเอียดโครงสร้างตารางหลักในฐานข้อมูล:'),
  createCustomTable(
    ['ชื่อตาราง (Table)', 'ฟังก์ชันและหน้าที่การทำงาน', 'คีย์หลัก (PK)', 'ความสัมพันธ์ (Relations)'],
    [
      ['PROFILES', 'จัดเก็บข้อมูลผู้ใช้, สิทธิ์ (Role), ร้านค้า, โลโก้, วันที่ยอมรับ PDPA', 'id (UUID)', '1:N กับ ORDERS, 1:N กับ PRODUCTS'],
      ['PRODUCTS', 'จัดเก็บผลงานดิจิทัล, หมวดหมู่, ราคาขาย, ราคาลด, ชื่อไฟล์แนบ', 'id (TEXT Slug)', 'N:1 กับ PROFILES, 1:N กับ ORDER_ITEMS'],
      ['ORDERS', 'จัดเก็บคำสั่งซื้อ, ยอดเงินรวม, สถานะ (PENDING/PAID), URL สลิป', 'id (TEXT)', 'N:1 กับ PROFILES, 1:N กับ ORDER_ITEMS'],
      ['ORDER_ITEMS', 'จัดเก็บรายการสินค้าแต่ละชิ้นในคำสั่งซื้อ และสถานะการซ่อนคลัง', 'id (UUID)', 'N:1 กับ ORDERS, N:1 กับ PRODUCTS'],
      ['EMAIL_OTPS', 'จัดเก็บรหัสยืนยัน 6 หลัก, อีเมลปลายทาง, อายุรหัส 2 นาที', 'id (UUID)', 'ใช้ตรวจสอบก่อนเข้าสู่ระบบ'],
      ['COMMUNITY_COMMENTS', 'จัดเก็บรีวิว, คะแนนดาว (1-5), ยอดกดถูกใจ, ตรา Verified Buyer', 'id (UUID)', 'N:1 กับ PROFILES, N:1 กับ PRODUCTS'],
    ],
    [2200, 4000, 1800, 2400]
  ),

  createH2('3.5 แผนภาพลำดับขั้นตอนการทำงาน (Sequence Diagram)'),
  createP('แผนภาพ Sequence แสดงการแลกเปลี่ยนข้อความ (Message Passing) ระหว่างส่วนประกอบต่างๆ:'),
  ...createImageFigure('diagram_sequence.png', 'รูปที่ 3.4: Sequence Diagram แสดงลำดับขั้นตอนการสั่งซื้อ ตรวจสลิป และเปิดอ่าน E-book', 540, 370),

  createH2('3.6 แผนภาพโครงสร้างคลาส (Class Diagram)'),
  createP('แผนภาพ Class แสดงโครงสร้าง Interfaces, Types, Context Providers, และ Services ในโปรเจกต์:'),
  ...createImageFigure('diagram_class.png', 'รูปที่ 3.5: Class Diagram แสดงโครงสร้างโมเดลข้อมูลและคอนโทรลเลอร์', 540, 370),

  createH2('3.7 แผนผังเว็บไซต์และการเชื่อมโยงหน้าจอ (Site Map & UI Flow)'),
  createP('แผนผัง Site Map แสดงเส้นทางการนำทาง (Navigation Flow) ทั้งหมดในระบบ:'),
  ...createImageFigure('diagram_sitemap.png', 'รูปที่ 3.6: Site Map & UI Navigation Flow ของระบบ Book Sangdai', 540, 370),

  new Paragraph({ children: [new PageBreak()] })
);

// ==================== CHAPTER 4 ====================
docChildren.push(
  ...createChapterHeading(4, 'การพัฒนาและการทดสอบระบบ (Implementation and Testing)'),
  createH2('4.1 สถาปัตยกรรมระบบการพัฒนาจริง (System Implementation Stack)'),
  createP(
    'ระบบ Book Sangdai ได้รับการพัฒนาขึ้นโดยเชื่อมโยงเทคโนโลยีระดับชั้นนำเข้าด้วยกัน โค้ดส่วนหน้าเว็บ (Frontend) ถูกพัฒนาด้วย Next.js 14 และจัดรูปแบบด้วย Tailwind CSS ให้ความรู้สึกเรียบหรูระดับพรีเมียม (Apple-Style Minimalist Design) เชื่อมต่อกับ Backend API ผ่าน Next.js Route Handlers และจัดเก็บข้อมูลแบบเรียลไทม์บนคลาวด์ Supabase โดยมีเซิร์ฟเวอร์หลักให้บริการอยู่ที่โดเมน https://booksangdai.vercel.app'
  ),

  createH2('4.2 หน้าจอผลการทำงานของระบบ (User Interface Demonstration)'),
  createP('ภาพแสดงส่วนต่อประสานกับผู้ใช้งาน (UI Screenshots) จริงของระบบ Book Sangdai:'),

  createH3('4.2.1 หน้าหลักของร้านค้าและแถบเลือกหมวดหมู่ 8 หมวดหมู่ (Storefront & Category Rails)'),
  createP('หน้าแรกแสดงแถบเลือกหมวดหมู่แนวตั้ง (Vertical Cards) พร้อมกล่องไอคอนขนาด 56-64px และปุ่ม "ดูทั้งหมด >" รวมถึงการ์ดผลงานที่แสดงป้ายส่วนลดสีแดง (-X%) ชัดเจน:'),
  ...createImageFigure('ui_homepage.png', 'รูปที่ 4.1: หน้าแรกของร้านค้า (Storefront) แสดงสินค้าแนะนำและป้ายลดราคา', 520, 290),
  ...createImageFigure('ui_categories_badges.png', 'รูปที่ 4.2: แถบเลือกหมวดหมู่ 8 หมวดหมู่ และการ์ดแสดงป้ายลดราคา (-51%)', 520, 290),

  createH3('4.2.2 ระบบยืนยันตัวตน และประตูอ่านข้อตกลง 100% (Auth Modal & Consent Reading Gate)'),
  createP('หน้าต่างเข้าสู่ระบบด้วย Gmail OTP 2 นาที พร้อมตัวเลือก "จดจำฉันไว้ในระบบ" (Remember Me) และโมดอลอ่านข้อตกลง PDPA/EULA ที่บังคับเลื่อนอ่านจนครบ 100%:'),
  ...createImageFigure('ui_auth_modal.png', 'รูปที่ 4.3: หน้าต่างเข้าสู่ระบบ (Auth Modal) พร้อมตัวเลือกจดจำอีเมล', 520, 290),
  ...createImageFigure('ui_consent_gate.png', 'รูปที่ 4.4: ประตูการอ่านข้อตกลง (Consent Reading Gate) เลื่อนอ่านครบ 100%', 520, 290),

  createH3('4.2.3 ขั้นตอนการสั่งซื้อ และหน้าชำระเงิน PromptPay QR'),
  createP('หน้าชำระเงิน (Checkout) สรุปยอดเงินพร้อมกรอกข้อมูลผู้รับไฟล์ และหน้าแสดง PromptPay QR Code พร้อมแถบเตือนสีแดงกุหลาบ "ห้ามปิดหน้านี้เด็ดขาด":'),
  ...createImageFigure('ui_checkout.png', 'รูปที่ 4.5: หน้าต่างสรุปคำสั่งซื้อและกรอกข้อมูลผู้รับไฟล์ (/checkout)', 520, 290),
  ...createImageFigure('ui_payment_qr.png', 'รูปที่ 4.6: หน้าชำระเงิน แสดง PromptPay QR Code พร้อมระบบนับเวลาถอยหลัง', 520, 290),
  ...createImageFigure('ui_payment_warning.png', 'รูปที่ 4.7: แถบเตือนความปลอดภัย "ห้ามปิดหน้านี้เด็ดขาด" ป้องกันการทำรายการไม่สำเร็จ', 520, 290),

  createH3('4.2.4 คลังหนังสือดิจิทัลส่วนตัว (My Library Vault) และ In-Browser PDF Reader'),
  createP('หน้าคลัง My Library แยกแท็บ "คลังหนังสือพร้อมอ่าน" (PAID) และ "รายการรออนุมัติสลิป" (PENDING) พร้อมระบบเปิดอ่าน PDF ในตัว และระบบลบผลงานด้วยรหัส Catalog Code ยืนยัน:'),
  ...createImageFigure('ui_library_vault.png', 'รูปที่ 4.8: หน้าคลังหนังสือดิจิทัลส่วนตัว (My Library Vault)', 520, 290),
  ...createImageFigure('ui_pdf_reader.png', 'รูปที่ 4.9: In-Browser PDF Reader เปิดอ่าน E-book ภายในระบบได้อย่างคมชัด', 520, 290),
  ...createImageFigure('ui_vault_danger_delete.png', 'รูปที่ 4.10: ระบบความปลอดภัยในการลบผลงานออกจากคลัง (Danger Zone Catalog Code Gate)', 520, 290),

  createH3('4.2.5 ระบบจัดการร้านค้า และศูนย์รายงานสถิติ (Merchant Portal & Report Center)'),
  createP('พอร์ทัลร้านค้าสำหรับจัดการรายการสินค้า 8 หมวดหมู่ และตรวจสอบสลิปโอนเงินเพื่ออนุมัติปล่อยไฟล์เข้าคลังลูกค้า:'),
  ...createImageFigure('ui_merchant_products.png', 'รูปที่ 4.11: หน้าจอพอร์ทัลร้านค้า แสดงรายการสินค้าและเครื่องมือจัดการ', 520, 290),

  createH3('4.2.6 ระบบผู้ดูแลระบบส่วนกลาง (Admin Portal)'),
  createP('แดชบอร์ดภาพรวมสำหรับแอดมิน ติดตามยอดขายรวมทั้งระบบ (GMV), อนุมัติร้านค้า, และจัดการสิทธิ์ผู้ใช้งาน:'),
  ...createImageFigure('ui_admin_dashboard.png', 'รูปที่ 4.12: แดชบอร์ดผู้ดูแลระบบส่วนกลาง (Admin Dashboard Overview)', 520, 290),
  ...createImageFigure('ui_admin_users.png', 'รูปที่ 4.13: ตารางจัดการสิทธิ์ผู้ใช้งานและร้านค้าในระบบ', 520, 290),

  createH2('4.3 ผลการทดสอบระบบ (System Testing Results)'),
  createP('ผลการทดสอบระบบและเกณฑ์มาตรฐานการตรวจสอบคุณภาพ (Quality Assurance Audit) ทั้ง 12 ชุดการทดสอบ:'),
  createCustomTable(
    ['ชุดการทดสอบ (Test Suite)', 'ขอบเขตที่ตรวจสอบ', 'จำนวนเคส', 'ผลการทดสอบจริง'],
    [
      ['Suite 1: Auth & OTP Gate', 'ตรวจสอบการบล็อกเมลที่ไม่มีในระบบ, ส่ง OTP 2 นาที, และ Remember Me', '5 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 2: PDPA Consent Gate', 'การเลื่อนอ่านครบ 100%, ปลดล็อกปุ่มยอมรับ, บันทึก Timestamp ลง Supabase', '4 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 3: Cart & Checkout', 'การคำนวณราคา, ป้ายลดราคา (-X%), การป้องกันปิดหน้าชำระเงิน', '6 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 4: PromptPay Slip Verification', 'สร้าง QR, อัปโหลดสลิปเข้า Storage, ร้านค้าตรวจสลิปและอนุมัติออเดอร์', '5 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 5: My Library Vault', 'เปิดสิทธิ์อัตโนมัติเมื่อเป็น PAID, แยกแท็บ Pending, In-Browser Reader', '4 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 6: Secure Vault Deletion', 'การยืนยันรหัส Catalog Code สีแดง, Soft Hide ไม่กระทบยอดขายร้านค้า', '4 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 7: Merchant Report Center', 'คำนวณ Gross Revenue, AOV, Funnel, Ranking, และการลบธุรกรรมด้วย Order ID', '6 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 8: Unified Category Taxonomy', 'ความตรงกันของ 8 หมวดหมู่ระหว่างหน้าร้าน, เมนูร้านค้า, และแอดมิน', '5 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 9: Admin Master Audit', 'การตรวจสอบยอด GMV รวม, การอนุมัติร้านค้า, และการ Export CSV ภาษาไทย', '4 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 10: Legacy Cleanup', 'การลบไฟล์และโค้ดเก่า vibebooks และ MIT App Inventor ทั้งหมด', '5 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 11: Architecture Diagrams', 'ความถูกต้องของ Mermaid Diagrams ทั้ง 6 ชุดตามมาตรฐาน UML', '5 เคส', '✅ ผ่าน 100% (PASS)'],
      ['Suite 12: Multi-Platform Apps', 'คอมไพล์ Windows .exe (Installer/Portable) และ Android Project (Capacitor)', '5 เคส', '✅ ผ่าน 100% (PASS)'],
    ],
    [3200, 4400, 1400, 1800]
  ),

  new Paragraph({ children: [new PageBreak()] })
);

// ==================== CHAPTER 5 ====================
docChildren.push(
  ...createChapterHeading(5, 'สรุปผล ปัญหา และข้อเสนอแนะ (Conclusion and Recommendations)'),
  createH2('5.1 สรุปผลการดำเนินงาน (Conclusion)'),
  createP(
    'การพัฒนาโครงงานมินิโปรเจ็ค "BOOK SANGDAI (บุ๊คสั่งได้)" บรรลุตามวัตถุประสงค์ที่กำหนดไว้ทุกประการ โดยสามารถสร้างระบบคลังผลงานและหนังสือดิจิทัลที่มีความสมบูรณ์แบบ ทั้งในด้านความสวยงามของส่วนต่อประสาน (UI/UX Design), ความรวดเร็วในการประมวลผล (Next.js 14 SSR), ความปลอดภัยของข้อมูล (Supabase RLS & Consent Reading Gate), และการชำระเงินที่ตอบโจทย์ผู้ใช้งานชาวไทยผ่าน PromptPay QR Code'
  ),
  createP(
    'นอกจากนี้ โครงงานยังประสบความสำเร็จในการขยายขอบเขตการใช้งานสู่แพลตฟอร์มอุปกรณ์พกพา (Mobile App ผ่าน Capacitor) และคอมพิวเตอร์ตั้งโต๊ะ (Windows Desktop App ผ่าน Electron .exe) ทำให้ผู้ใช้สามารถเข้าถึงผลงานดิจิทัลได้จากทุกอุปกรณ์อย่างไร้รอยต่อ'
  ),

  createH2('5.2 ปัญหา อุปสรรค และแนวทางการแก้ไข (Bug Resolutions Log)'),
  createBullet('แก้ไขโดยเพิ่ม Single-Flight Deduplication และสถานะ isProfileSyncing เพื่อรอการ Callback จาก Supabase ให้เสร็จสิ้น 100% ก่อนตัดสินใจเปิดหน้าต่าง', '1. ปัญหาข้อตกลงเด้งซ้ำซ้อนตอนล็อกอิน Google OAuth:'),
  createBullet('แก้ไขโดยนำคีย์ localStorage ที่เคยแคชไว้ออก และใช้ฟิลด์ terms_accepted_at ในฐานข้อมูลเป็น Single Source of Truth เท่านั้น', '2. ปัญหาการ Bypass ข้อตกลงผ่าน LocalStorage:'),
  createBullet('แก้ไขโดยพัฒนาระบบ Soft Hide (is_hidden_by_customer) ซ่อนจากคลังผู้ใช้เท่านั้น แต่ยังคงเรคอร์ดธุรกรรมไว้ในฐานข้อมูลเพื่อให้รายงานสถิติของร้านค้าถูกต้อง', '3. ปัญหายอดขายร้านค้าหายเมื่อลูกค้าลบหนังสือในคลัง:'),
  createBullet('แก้ไขโดยสร้างโมดอล Danger Zone ยืนยันรหัส Order ID สีแดงหนา เพื่อป้องกันความผิดพลาดและบันทึกประวัติการลบ', '4. ปัญหาความปลอดภัยในการลบธุรกรรมฝั่งร้านค้า:'),
  createBullet('แก้ไขโดยนำเข้าไฟล์ไอคอนจริง และแปลงเป็น Static Assets ครบทุกขนาด (.ico, .png, manifest) ป้องกัน 500 error บน Vercel Edge Server', '5. ปัญหา Favicon ไม่แสดงผลบน Vercel Deployment:'),

  createH2('5.3 ข้อเสนอแนะและแนวทางการพัฒนาต่อยอด (Future Recommendations)'),
  createBullet('เชื่อมต่อระบบตรวจสลิปโอนเงินด้วย AI Vision / OCR หรือ SlipOK API เพื่อยืนยันยอดเงินจากธนาคารแบบอัตโนมัติ 100% ทันทีโดยไม่ต้องรอร้านค้ากดอนุมัติ', '1. ระบบตรวจสอบสลิปอัตโนมัติ (Automated OCR Slip Verification):'),
  createBullet('เพิ่มระบบ Bookmark, ไฮไลต์ข้อความ, บันทึกหน้าที่อ่านค้างไว้ (Reading Progress Sync) ใน In-Browser Reader', '2. ระบบจดจำหน้าหนังสือที่อ่านค้างไว้ (Reading Progress Sync):'),
  createBullet('เพิ่มระบบเสียงบรรยายและแปลงข้อความเป็นเสียง (Text-to-Speech: TTS) สำหรับหนังสือ E-book เพื่อผู้พิการทางสายตา', '3. ระบบ Audio E-Book & Text-to-Speech:'),
  createBullet('พัฒนาการแจ้งเตือนแบบพุช (Native Push Notifications) บน Mobile App เมื่อคำสั่งซื้อได้รับการอนุมัติ', '4. ระบบการแจ้งเตือน Native Push Notifications:'),

  new Paragraph({ children: [new PageBreak()] })
);

// ==================== REFERENCES & APPENDICES ====================
docChildren.push(
  createTitle('บรรณานุกรม (References)'),
  createP('Next.js Documentation. (2024). App Router and Server Components. Vercel Inc. สืบค้นเมื่อ 8 ตุลาคม 2569, จาก https://nextjs.org/docs', false),
  createP('Supabase Documentation. (2024). PostgreSQL Database, Row Level Security, and Storage Buckets. Supabase Inc. สืบค้นเมื่อ 8 ตุลาคม 2569, จาก https://supabase.com/docs', false),
  createP('Capacitor Documentation. (2024). Cross-Platform Native Runtime for Web Apps. Ionic Framework. สืบค้นเมื่อ 8 ตุลาคม 2569, จาก https://capacitorjs.com/docs', false),
  createP('Electron Documentation. (2024). Build Cross-Platform Desktop Apps with JavaScript. OpenJS Foundation. สืบค้นเมื่อ 8 ตุลาคม 2569, จาก https://www.electronjs.org/docs', false),
  createP('Resend Documentation. (2024). Modern Email API for Developers. Resend Inc. สืบค้นเมื่อ 8 ตุลาคม 2569, จาก https://resend.com/docs', false),
  createP('สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล. (2562). พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA). ราชกิจจานุเบกษา.', false),

  new Paragraph({ children: [new PageBreak()] }),

  createTitle('ภาคผนวก (Appendices)'),
  createH2('ภาคผนวก ก: คำสั่ง SQL สำหรับ Supabase SQL Editor'),
  createP('คำสั่งปรับปรุงโครงสร้างฐานข้อมูลสำหรับรองรับตาราง OTP, ประวัติการยินยอม PDPA, และระบบความปลอดภัย:'),
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_logo_url TEXT;\n\nCREATE TABLE IF NOT EXISTS public.email_otps (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    email TEXT NOT NULL,\n    otp_code VARCHAR(6) NOT NULL,\n    purpose VARCHAR(20) NOT NULL DEFAULT 'signin',\n    expires_at TIMESTAMPTZ NOT NULL,\n    used_at TIMESTAMPTZ,\n    created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_hidden_by_customer BOOLEAN DEFAULT FALSE;\nALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_deleted_by_merchant BOOLEAN DEFAULT FALSE;`,
        font: 'Consolas',
        size: 20,
        color: '0369A1',
      }),
    ],
  }),

  createH2('ภาคผนวก ข: คำสั่งการคอมไพล์โปรแกรมติดตั้ง (.exe)'),
  createP('คำสั่งสำหรับแพ็กเกจเป็นไฟล์ติดตั้ง Windows Desktop ด้วย electron-builder:'),
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text: `npm run desktop:dist           # สร้างทั้งตัว Setup (.exe) และ Portable (.exe)\nnpm run desktop:dist:portable  # สร้างเฉพาะ Portable (.exe)`,
        font: 'Consolas',
        size: 20,
        color: '0369A1',
      }),
    ],
  })
);

// -------------------------------------------------------------
// BUILD DOCUMENT WITH PACKER
// -------------------------------------------------------------
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT_TH,
          size: 28,
          color: COLOR_TEXT,
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch = 1440 twips
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'BOOK SANGDAI (บุ๊คสั่งได้) — รายงานมินิโปรเจ็ค ECP4N',
                  font: FONT_TH,
                  size: 20,
                  color: COLOR_MUTED,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_TH,
                  size: 22,
                  color: COLOR_MUTED,
                }),
              ],
            }),
          ],
        }),
      },
      children: docChildren,
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT_FILE, buffer);
  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`SUCCESS! Word document generated: ${OUTPUT_FILE} (${sizeMB} MB, ${buffer.length} bytes)`);
});
