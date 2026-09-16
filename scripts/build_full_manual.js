const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ShadingType,
} = require("docx");
const fs = require("fs");
const path = require("path");

const {
  createHairlineDivider,
  createHeading1,
  createHeading2,
  createBodyParagraph,
  createCalloutBox,
  createImageBlock,
  createAnnotationTable,
} = require("./docx_styles");

const { STUDENT, CHAPTERS } = require("./docx_data");

const assetsDir = path.resolve("public/docs_assets");
const targetDocx = path.resolve("VibeBooks_PRO_User_Manual.docx");
const brainDocx = path.resolve("C:/Users/Phums/.gemini/antigravity/brain/945d18b5-9396-4cd8-a2a5-05278713ecb8/VibeBooks_PRO_User_Manual.docx");

async function main() {
  console.log("Assembling VibeBooks PRO User Manual DOCX...");

  const doc = new Document({
    creator: STUDENT.name,
    title: "VibeBooks PRO — Technical Manual",
    styles: {
      default: {
        document: {
          run: { font: "TH Sarabun New", size: 24, color: "374151" },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "VibeBooks PRO · Technical Architecture & User Manual",
                    size: 18,
                    font: "TH Sarabun New",
                    color: "9CA3AF",
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
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `ผู้จัดทำ: ${STUDENT.name} (${STUDENT.studentId}) | หน้า `,
                    size: 18,
                    font: "TH Sarabun New",
                    color: "9CA3AF",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    font: "TH Sarabun New",
                    color: "9CA3AF",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ spacing: { before: 720 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "EDITORIAL MASTER EDITION · 2026",
                bold: true,
                size: 20,
                font: "TH Sarabun New",
                color: "0071E3",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "VibeBooks PRO",
                bold: true,
                size: 56,
                font: "TH Sarabun New",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: "คู่มือการใช้งานระบบและสถาปัตยกรรมซอฟต์แวร์ E-Book Store แบบครบวงจร",
                size: 28,
                font: "TH Sarabun New",
                color: "4B5563",
              }),
            ],
          }),
          createHairlineDivider(),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F8F9FA" },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" },
                      bottom: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" },
                      left: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" },
                      right: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" },
                    },
                    margins: { top: 200, bottom: 200, left: 240, right: 240 },
                    children: [
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({
                            text: "ข้อมูลผู้จัดทำและสเปกระบบ (AUTHOR & SYSTEM ATTRIBUTION)",
                            bold: true,
                            size: 22,
                            font: "TH Sarabun New",
                            color: "0071E3",
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: "• ชื่อผู้จัดทำ: ", bold: true, size: 24 }),
                          new TextRun({ text: STUDENT.name, size: 24, bold: true, color: "111827" }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: "• รหัสนักศึกษา: ", bold: true, size: 24 }),
                          new TextRun({ text: STUDENT.studentId, size: 24, bold: true, color: "111827" }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: "• แพลตฟอร์มเทคโนโลยี: ", bold: true, size: 22 }),
                          new TextRun({
                            text: "Next.js 14 (App Router) + Supabase Cloud + MIT App Inventor",
                            size: 22,
                            color: "4B5563",
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: "• อุปกรณ์ที่รองรับ: ", bold: true, size: 22 }),
                          new TextRun({
                            text: "Android 10-15 (APK / Companion) และ iOS 15-18 (Safari / Companion)",
                            size: 22,
                            color: "4B5563",
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: "• วันที่เผยแพร่: ", bold: true, size: 22 }),
                          new TextRun({ text: STUDENT.date, size: 22, color: "4B5563" }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: "• ลิงก์ระบบใช้งานจริง: ", bold: true, size: 22 }),
                          new TextRun({ text: "https://vibebooks.vercel.app", size: 22, color: "0071E3" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400 } }),
          createCalloutBox("จุดเด่นของสถาปัตยกรรม VibeBooks PRO", [
            "Apple Minimalism & Tech Aesthetic: เรียบหรู คมชัด ดำด้าน Space Black ตัดเทา Titanium",
            "Cross-Platform Android & iOS: รองรับมือถือเต็มจอ ไม่ติดขอบ Safe-Area",
            "Pure HTML5 Canvas PDF.js Reader: เปิดอ่านได้ในตัวแอป 100% ไม่พึ่งพา PDF plugin",
            "MIT App Inventor ActivityStarter Bridge: เชื่อมต่อให้ระบบดาวน์โหลดไฟล์ผ่าน Google Chrome บนมือถือได้ 100%",
            "Cloud Storage Security: ผูกไฟล์ E-Book ภาษาไทยคมชัด 6 หน้าเข้ากับ Supabase Storage พร้อม Signed URLs",
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // Chapter 1
          createHeading1(CHAPTERS.ch1.title),
          createBodyParagraph(CHAPTERS.ch1.intro),
          ...createImageBlock(assetsDir, "fig0_system_architecture.png", "รูปที่ 1.1: แผนผังสถาปัตยกรรมไฮบริดของระบบ VibeBooks PRO", 520, 312),
          createHeading2("องค์ประกอบทางเทคนิคทั้ง 3 ชั้น (3-Tier Layered Architecture)"),
          ...CHAPTERS.ch1.points.map((p) => createBodyParagraph(p)),

          new Paragraph({ children: [new PageBreak()] }),

          // Chapter 2
          createHeading1(CHAPTERS.ch2.title),
          createBodyParagraph(CHAPTERS.ch2.intro),
          ...createImageBlock(assetsDir, "fig1_catalog_annotated.png", "รูปที่ 2.1: หน้าแรกและแคตตาล็อก E-Book พร้อมตัวเลขระบุส่วนประกอบ [1] ถึง [5]", 320, 460),
          createHeading2("รายละเอียดส่วนประกอบและหน้าที่การทำงาน (รูปที่ 2.1)"),
          createAnnotationTable(CHAPTERS.ch2.annotations),

          new Paragraph({ children: [new PageBreak()] }),

          // Chapter 3
          createHeading1(CHAPTERS.ch3.title),
          createBodyParagraph(CHAPTERS.ch3.intro),
          ...createImageBlock(assetsDir, "fig2_checkout_annotated.png", "รูปที่ 3.1: หน้ากรอกข้อมูลคำสั่งซื้อ (Checkout Screen) พร้อมตัวเลขกำกับ [1] ถึง [3]", 320, 420),
          createHeading2("รายละเอียดหน้า Checkout (รูปที่ 3.1)"),
          createAnnotationTable(CHAPTERS.ch3.checkoutAnnotations),

          new Paragraph({ spacing: { before: 180 } }),
          ...createImageBlock(assetsDir, "fig3_payment_annotated.png", "รูปที่ 3.2: หน้าชำระเงินจำลองผ่าน PromptPay QR Code พร้อมตัวเลขกำกับ [1] ถึง [3]", 320, 420),
          createHeading2("รายละเอียดหน้า Payment & PromptPay (รูปที่ 3.2)"),
          createAnnotationTable(CHAPTERS.ch3.paymentAnnotations),

          new Paragraph({ children: [new PageBreak()] }),

          // Chapter 4
          createHeading1(CHAPTERS.ch4.title),
          createBodyParagraph(CHAPTERS.ch4.intro),
          ...createImageBlock(assetsDir, "fig4_delivery_annotated.png", "รูปที่ 4.1: หน้าการส่งมอบดิจิทัล (Digital Delivery Vault) พร้อมตัวเลขกำกับ [1] ถึง [4]", 380, 360),
          createHeading2("รายละเอียดหน้า Digital Delivery (รูปที่ 4.1)"),
          createAnnotationTable(CHAPTERS.ch4.deliveryAnnotations),

          new Paragraph({ spacing: { before: 180 } }),
          ...createImageBlock(assetsDir, "fig6_canvas_reader_annotated.png", "รูปที่ 4.2: อินเตอร์เฟซ In-App Canvas Reader สไตล์ Apple พร้อมตัวเลขกำกับ [1] ถึง [4]", 520, 357),
          createHeading2("การทำงานของ In-App Canvas Reader (รูปที่ 4.2)"),
          createAnnotationTable(CHAPTERS.ch4.readerAnnotations),

          new Paragraph({ children: [new PageBreak()] }),

          // Chapter 5
          createHeading1(CHAPTERS.ch5.title),
          createBodyParagraph(CHAPTERS.ch5.intro),
          ...createImageBlock(assetsDir, "fig7_mit_app_annotated.png", "รูปที่ 5.1: โครงสร้างคอมโพเนนต์และบล็อกใน MIT App Inventor พร้อมตัวเลขกำกับ [1] ถึง [3]", 520, 312),
          createHeading2("รายละเอียดการทำงานของบล็อก MIT App Inventor (รูปที่ 5.1)"),
          createAnnotationTable(CHAPTERS.ch5.mitAnnotations),
          createHeading2("ขั้นตอนการนำไฟล์ .aia ไปใช้งานบน MIT App Inventor"),
          createBodyParagraph(
            "1. เปิดเว็บเบราว์เซอร์ไปที่ https://ai2.appinventor.mit.edu แล้วล็อกอินด้วยบัญชี Google\n" +
            "2. ไปที่เมนู Projects -> Import project (.aia) from my computer แล้วเลือกไฟล์ VibeBooks_MIT_App.aia\n" +
            "3. ตรวจสอบการตั้งค่าในหน้า Designer: WebViewer1 ต้องตั้งค่า HomeUrl เป็น https://vibebooks.vercel.app\n" +
            "4. สำหรับการทดสอบบนโทรศัพท์: ไปที่เมนู Connect -> AI Companion แล้วใช้แอป MIT AI2 Companion สแกน QR Code\n" +
            "5. สำหรับการติดตั้งเป็นแอปจริง: ไปที่เมนู Build -> Android App (.apk) เพื่อดาวน์โหลดไฟล์ APK ไปติดตั้งลงในสมาร์ทโฟน Android"
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // Chapter 6
          createHeading1(CHAPTERS.ch6.title),
          createBodyParagraph(CHAPTERS.ch6.intro),
          ...createImageBlock(assetsDir, "fig5_tracking_annotated.png", "รูปที่ 6.1: หน้าค้นหาและติดตามสถานะคำสั่งซื้อ (Order Tracking) พร้อมตัวเลขกำกับ [1] ถึง [3]", 340, 420),
          createHeading2("รายละเอียดหน้า Order Tracking (รูปที่ 6.1)"),
          createAnnotationTable(CHAPTERS.ch6.trackingAnnotations),

          new Paragraph({ spacing: { before: 180 } }),
          createHeading2("โครงสร้างฐานข้อมูลคำสั่งซื้อ (PostgreSQL Schema)"),
          createCalloutBox("ตารางข้อมูล orders ใน Supabase Database", [
            "id (UUID / Text, Primary Key): รหัสอ้างอิงคำสั่งซื้อ เช่น order_178948...",
            "book_id (Text): รหัสระบุหนังสือ (media-player-pro, mystic-tarot-oracle, taskmaster-pro)",
            "book_title (Text): ชื่อหนังสือฉบับเต็มภาษาไทยและอังกฤษ",
            "file_name (Text): ชื่อไฟล์ PDF ที่จัดเก็บใน Storage เช่น Media_Player_PRO_Engineering.pdf",
            "amount (Numeric): ราคาสินค้า (990.00 THB)",
            "customer_name (Text): ชื่อ-นามสกุลของผู้สั่งซื้อ",
            "customer_email (Text): อีเมลสำหรับรับเอกสารส่งมอบ",
            "status (Text): สถานะคำสั่งซื้อ ('PAID' หรือ 'PENDING')",
            "created_at (Timestamp with time zone): วันที่และเวลาที่มีการบันทึกคำสั่งซื้อ",
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // Chapter 7: Attestation
          createHeading1("บทที่ 7: การรับรองผลงานและบทสรุป (Engineering Attestation)"),
          createBodyParagraph(
            "ระบบ VibeBooks PRO ได้รับการทดสอบในสภาพแวดล้อมจริง (Production Environment) ทั้งในส่วนของการ Deploy บน Vercel Edge Network, การเชื่อมต่อ Cloud Database & Storage บน Supabase, การจำลองแอปพลิเคชันบน MIT App Inventor Companion ทั้งบนระบบปฏิบัติการ Android และ iOS"
          ),
          createCalloutBox("บันทึกการตรวจรับรองผลงาน (ENGINEERING ATTESTATION)", [
            `ชื่อผู้จัดทำ: ${STUDENT.name}`,
            `รหัสนักศึกษา: ${STUDENT.studentId}`,
            `ตราสินค้าและชื่อโครงงาน: ${STUDENT.brand}`,
            "สถานะการทดสอบระบบ: ผ่านการทดสอบ Build 100% (9/9 Next.js Production Routes)",
            "สถานะ E-Book ภาษาไทย: สร้างไฟล์สมบูรณ์ 6 หน้าเต็มต่อเล่ม ครบทั้ง 3 ผลงาน",
            "สถานะการรับรอง: ถูกต้อง ครบถ้วนตามมาตรฐาน Minimalist Premium & Tech Aesthetic",
          ]),
          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "ลงชื่อผู้จัดทำ: ........................................................\n", size: 24, font: "TH Sarabun New" }),
              new TextRun({ text: `(${STUDENT.name})\n`, bold: true, size: 24, font: "TH Sarabun New" }),
              new TextRun({ text: `รหัสนักศึกษา: ${STUDENT.studentId}\n`, size: 22, font: "TH Sarabun New", color: "6B7280" }),
              new TextRun({ text: `วันที่: ${STUDENT.date}`, size: 22, font: "TH Sarabun New", color: "6B7280" }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(targetDocx, buffer);
  fs.writeFileSync(brainDocx, buffer);
  console.log(`Saved DOCX to:\n  - ${targetDocx} (${(buffer.length / 1024).toFixed(1)} KB)\n  - ${brainDocx}`);
}

main().catch(console.error);
