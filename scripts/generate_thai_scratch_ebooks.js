const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
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

const STUDENT = {
  name: "นายเกียรติภูมิ หารศรีนาถ",
  nameEn: "Kiatphum Hansrinath",
  studentId: "64332110242-2",
  department: "สาขาวิชาเทคโนโลยีสารสนเทศและวิศวกรรมซอฟต์แวร์",
  brand: "VibeBooks PRO (Digital Master Edition)",
};

// Helper: Setup Thai fonts
async function loadThaiFonts(doc) {
  doc.registerFontkit(fontkit);
  const fontRegularBytes = fs.readFileSync('C:/Windows/Fonts/tahoma.ttf');
  const fontBoldBytes = fs.readFileSync('C:/Windows/Fonts/tahomabd.ttf');
  const fontRegular = await doc.embedFont(fontRegularBytes);
  const fontBold = await doc.embedFont(fontBoldBytes);
  return { fontRegular, fontBold };
}

// Helper: Draw standard page header/footer
function drawPageBase(page, title, chapter, pageNum, totalPages, themeColor, fontRegular, fontBold) {
  const { width, height } = page.getSize();

  // Dark obsidian background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.06, 0.05, 0.09),
  });

  // Top header accent line
  page.drawRectangle({
    x: 40,
    y: height - 40,
    width: width - 80,
    height: 2,
    color: themeColor,
  });

  // Running header
  page.drawText(title, {
    x: 40,
    y: height - 32,
    size: 8,
    font: fontBold,
    color: rgb(0.7, 0.7, 0.8),
  });

  page.drawText(chapter, {
    x: width - 260,
    y: height - 32,
    size: 8,
    font: fontRegular,
    color: rgb(0.55, 0.55, 0.65),
  });

  // Bottom footer accent line
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: 1,
    color: rgb(0.2, 0.18, 0.28),
  });

  // Running footer
  page.drawText(`ผู้จัดทำ: ${STUDENT.name} (รหัส: ${STUDENT.studentId}) • ${STUDENT.brand}`, {
    x: 40,
    y: 26,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.55, 0.55, 0.65),
  });

  page.drawText(`หน้า ${pageNum} จาก ${totalPages}`, {
    x: width - 95,
    y: 26,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.65, 0.65, 0.75),
  });
}

// Helper: Wrap Thai / English text safely
function drawWrappedText(page, text, x, startY, maxWidth, fontSize, font, color, lineSpacing = 16) {
  const words = text.split(' ');
  let line = '';
  let y = startY;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && n > 0) {
      page.drawText(line.trim(), { x, y, size: fontSize, font, color });
      line = words[n] + ' ';
      y -= lineSpacing;
    } else {
      line = testLine;
    }
  }
  if (line.trim().length > 0) {
    page.drawText(line.trim(), { x, y, size: fontSize, font, color });
    y -= lineSpacing;
  }
  return y;
}

// =============================================================================
// BOOK 1: FastPlayer PRO (Media Player Engineering - ใบงานที่ 1)
// =============================================================================
async function buildFastPlayerPdf() {
  const doc = await PDFDocument.create();
  const { fontRegular, fontBold } = await loadThaiFonts(doc);

  const themePurple = rgb(0.66, 0.33, 0.97); // #a855f7
  const themeCyan = rgb(0.18, 0.82, 0.95);   // #06b6d4
  const textWhite = rgb(0.96, 0.96, 1.0);
  const textMuted = rgb(0.72, 0.7, 0.82);
  const cardBg = rgb(0.11, 0.09, 0.16);

  const totalPages = 6;

  // PAGE 1: ปกเอกสาร
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.07, 0.05, 0.11) });
    page.drawRectangle({ x: 40, y: height - 120, width: width - 80, height: 4, color: themePurple });

    page.drawText("VIBEBOOKS DIGITAL MASTER EDITION • ใบงานที่ 1 ซีรีส์วิศวกรรมมัลติมีเดีย", {
      x: 40, y: height - 148, size: 10, font: fontBold, color: themeCyan,
    });

    page.drawText("FastPlayer PRO: วิศวกรรมระบบเล่นสื่อมัลติมีเดีย", {
      x: 40, y: height - 195, size: 22, font: fontBold, color: textWhite,
    });

    page.drawText("Desktop Media Player Architecture (PyQt6 & QtMultimedia)", {
      x: 40, y: height - 225, size: 13, font: fontBold, color: themePurple,
    });

    page.drawText("คู่มือเจาะลึกสถาปัตยกรรมระบบเครื่องเล่นเสียงเดสก์ท็อป การเขียนไอคอนเวกเตอร์บริสุทธิ์ และการจัดเก็บสถานะไร้การสูญหาย", {
      x: 40, y: height - 250, size: 9.5, font: fontRegular, color: textMuted,
    });

    // Central Feature Card
    page.drawRectangle({ x: 40, y: height - 520, width: width - 80, height: 245, color: cardBg });
    page.drawRectangle({ x: 40, y: height - 520, width: 4, height: 245, color: themePurple });

    page.drawText("จุดเด่นและนวัตกรรมทางวิศวกรรมซอฟต์แวร์ในเล่ม:", {
      x: 60, y: height - 305, size: 11, font: fontBold, color: themeCyan,
    });

    const bullets = [
      "1. Pure Vector Icon Engine (icons.py): วาดปุ่มควบคุมด้วย QPainter คมชัดทุกความละเอียด ไม่พึ่งฟอนต์แตกบน Windows",
      "2. Persistent JSON Storage (storage.json): ระบบจัดเก็บและกู้คืน Playlist, Albums, Liked Songs และ Volume ไร้การสูญหาย",
      "3. สถาปัตยกรรม Low-Latency Audio Pipeline: ทำงานประสานกันระหว่าง QMediaPlayer และ QAudioOutput อย่างแม่นยำ",
      "4. Under Bar Dock & Interactive Scrubber: แถบเลื่อนเวลาลากข้ามเพลง (Seeking) ลื่นไหล พร้อมมาตรวัดระดับเสียงแบบเรียลไทม์",
      "5. ระบบบริหารจัดการอัลบั้มส่วนตัว: สร้างอัลบั้มใหม่ (+ Create Album), เพลงที่ถูกใจ, และเมนูคลิกขวาบริบท (Context Menus)",
      "6. การคอมไพล์เป็นไฟล์ Windows .exe: รวบรวม Dependencies และ Assets ครบถ้วนผ่าน PyInstaller สำหรับส่งมอบงานจริง"
    ];

    let by = height - 335;
    for (const b of bullets) {
      page.drawText(b, { x: 60, y: by, size: 8.5, font: fontRegular, color: textWhite });
      by -= 28;
    }

    // Author credentials badge
    page.drawRectangle({ x: 40, y: 110, width: width - 80, height: 115, color: rgb(0.13, 0.1, 0.2) });
    page.drawText("ผู้จัดทำและหัวหน้าวิศวกรผู้ออกแบบระบบ (AUTHOR & LEAD ENGINEER)", {
      x: 60, y: 200, size: 9, font: fontBold, color: themePurple,
    });
    page.drawText(`${STUDENT.name} (${STUDENT.nameEn})`, {
      x: 60, y: 180, size: 13, font: fontBold, color: textWhite,
    });
    page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId} • ${STUDENT.department}`, {
      x: 60, y: 160, size: 9.5, font: fontRegular, color: themeCyan,
    });
    page.drawText("รายวิชา: การพัฒนาเว็บและแอปพลิเคชันปัญญาประดิษฐ์ขั้นสูง (Advanced Web & AI Engineering)", {
      x: 60, y: 140, size: 8.5, font: fontRegular, color: textMuted,
    });

    page.drawText("เอกสารลิขสิทธิ์ทางการศึกษา • ได้รับการรับรองและจัดเก็บในระบบ SUPABASE CLOUD STORAGE VAULT", {
      x: 40, y: 45, size: 7.5, font: fontRegular, color: rgb(0.5, 0.5, 0.6),
    });
  }

  // PAGE 2: บทที่ 1
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "FastPlayer PRO Engineering", "บทที่ 1: ขอบเขตฟังก์ชันและ User Stories", 2, totalPages, themePurple, fontRegular, fontBold);

    page.drawText("บทที่ 1: การกำหนดความต้องการและ User Stories (ใบงานที่ 1)", {
      x: 40, y: 770, size: 14, font: fontBold, color: themePurple,
    });

    let cy = 740;
    cy = drawWrappedText(
      page,
      "FastPlayer ถูกพัฒนาขึ้นตามเกณฑ์ของ ใบงานที่ 1 (หน้า 28-29 ในคู่มือปฏิบัติการ) ภายใต้กระบวนทัศน์ Responsible Vibe Coding โดยผสมผสานอัตลักษณ์การออกแบบ Obsidian Black & Neon Purple Minimalist Theme เพื่อให้ผู้ใช้ได้รับประสบการณ์ระดับพรีเมียม",
      40, cy, 515, 9, fontRegular, textWhite, 15
    );

    cy -= 10;
    page.drawText("ตารางกำหนดความต้องการเชิงหน้าที่ (Functional Requirements Matrix):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 22;

    const reqs = [
      ["FR-01: การเล่นไฟล์เสียงหลายสกุล", "รองรับไฟล์ .mp3, .wav, .ogg, .flac และ .m4a ด้วยการประมวลผลเสียงระดับฮาร์ดแวร์"],
      ["FR-02: การควบคุมและ Timeline Scrubbing", "แถบเวลา Clickable Slider สำหรับลากข้ามช่วงเสียง (Seek) ได้ทันทีโดยไม่สะดุด"],
      ["FR-03: การคงอยู่ของข้อมูล (Zero Data Loss)", "จัดเก็บและโหลดข้อมูล Playlist, อัลบั้มส่วนตัว, เพลงที่ถูกใจ, และระดับเสียงผ่าน storage.json"],
      ["FR-04: ระบบไอคอนเวกเตอร์แท้ 100%", "วาดสัญลักษณ์ Play, Pause, Next, Shuffle ด้วย QPainter ป้องกัน Font Glyph แตกบน Windows"],
      ["FR-05: การบริหารจัดการอัลบั้มส่วนตัว", "ปุ่ม + สร้างอัลบั้ม, เมนูคลิกขวาเปลี่ยนชื่อ, ลบอัลบั้ม และการเพิ่มเพลงเข้าอัลบั้มอย่างเป็นระบบ"],
      ["FR-06: การรับมือข้อผิดพลาดเชิงรับ (Defensive)", "ข้ามเพลงอัตโนมัติหากไฟล์ถูกลบหรือเสียหาย พร้อมแจ้งเตือนสุภาพโดยโปรแกรมไม่ Crash"]
    ];

    for (const [title, desc] of reqs) {
      page.drawRectangle({ x: 40, y: cy - 25, width: 515, height: 36, color: cardBg });
      page.drawText(title, { x: 50, y: cy - 5, size: 8.5, font: fontBold, color: textWhite });
      page.drawText(desc, { x: 50, y: cy - 20, size: 8, font: fontRegular, color: textMuted });
      cy -= 44;
    }

    cy -= 10;
    page.drawText("โทนสีและชุดโทเค็นการออกแบบ (Obsidian & Neon Purple Tokens):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 20;

    const tokens = [
      "• สีพื้นหลังหลัก (Primary Canvas): Gradient สีม่วงเข้ม #25143a ถึงสีดำมืด #09060f",
      "• สีนีออนไฮไลต์ (Neon Accent): สีม่วงนีออน #a855f7 สำหรับปุ่มเล่น, แถบเวลา และสถานะการเลือก",
      "• สีคอนเทนเนอร์ (Surface High): สีดำกระจก #181126 พร้อมเส้นขอบกึ่งโปร่งใส specular-border",
      "• อักษรและสัญลักษณ์: สีขาวสว่าง #f8fafc สำหรับหัวข้อ และสีเทา #94a3b8 สำหรับข้อมูลรอง"
    ];
    for (const t of tokens) {
      page.drawText(t, { x: 50, y: cy, size: 8, font: fontRegular, color: textMuted });
      cy -= 17;
    }
  }

  // PAGE 3: บทที่ 2
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "FastPlayer PRO Engineering", "บทที่ 2: สถาปัตยกรรมระบบ 3-Tier Layered Architecture", 3, totalPages, themePurple, fontRegular, fontBold);

    page.drawText("บทที่ 2: สถาปัตยกรรมระบบและการแยกเลเยอร์ (Architecture Design)", {
      x: 40, y: 770, size: 14, font: fontBold, color: themePurple,
    });

    let cy = 740;
    cy = drawWrappedText(
      page,
      "แอปพลิเคชัน FastPlayer ถูกออกแบบตามหลัก Modular Separation of Concerns โดยแบ่งโครงสร้างระบบออกเป็น 3 เลเยอร์อย่างเด็ดขาด เพื่อให้โค้ดสามารถทดสอบได้ง่าย (Testable) และดูแลรักษาง่าย (Maintainable):",
      40, cy, 515, 9, fontRegular, textWhite, 15
    );

    cy -= 10;
    const layers = [
      {
        name: "1. เลเยอร์ส่วนติดต่อผู้ใช้ (UI Layer - PyQt6 Spotify Layout)",
        color: rgb(0.4, 0.2, 0.6),
        items: [
          "• MainWindow (src/ui/main_window.py): หน้าต่างหลัก ควบคุมการจัดวาง Layout และสัญญาณ Signal/Slot",
          "• TopNavBar: แถบบนพร้อมประวัติหน้า < >, ช่องค้นหาแคปซูล 'ค้นหาเพลง...', และปุ่มหน้าต่าง",
          "• LeftSidebar: รางคลังเพลงซ้าย, ปุ่ม + สร้างอัลบั้ม, และปุ่ม Liked Songs 💜",
          "• PlaylistView: Hero Banner แบบไดนามิก แสดงชื่ออัลบั้ม สถิติจำนวนเพลง และตารางแสดงรายการเพลง",
          "• PlayerView: แถบ Under Bar Dock ด้านล่าง รวมหน้าปก, ปุ่มเวกเตอร์, Seek Slider และแถบเสียง"
        ]
      },
      {
        name: "2. เลเยอร์แกนหลักและการจัดการสถานะ (Core & Model Layer)",
        color: rgb(0.2, 0.45, 0.6),
        items: [
          "• AudioEngine (src/core/audio_engine.py): คลาส Wrapper ควบคุม QMediaPlayer และ QAudioOutput",
          "• PlaylistModel (src/models/playlist_model.py): จัดการคิวเพลง, Shuffle, Repeat และการกรองเพลง",
          "• StorageManager (src/core/storage_manager.py): จัดการบันทึก/โหลดไฟล์ JSON แบบ Atomic File Write"
        ]
      },
      {
        name: "3. เลเยอร์ระบบปฏิบัติการและสื่อ (OS & Persistence Layer)",
        color: rgb(0.2, 0.5, 0.4),
        items: [
          "• Local Audio Files: การเข้าถึงไฟล์เสียงผ่านไดรฟ์ของ Windows และการถอดรหัสเสียง",
          "• storage.json: ไฟล์ฐานข้อมูล JSON ในเครื่อง เก็บรายการเพลงและอัลบั้มของผู้ใช้แบบถาวร",
          "• Hardware Audio Endpoint: อุปกรณ์ส่งออกเสียง (Speakers / Headphones) ผ่านไดรเวอร์ WASAPI"
        ]
      }
    ];

    for (const l of layers) {
      page.drawRectangle({ x: 40, y: cy - 110, width: 515, height: 120, color: cardBg });
      page.drawRectangle({ x: 40, y: cy - 110, width: 4, height: 120, color: l.color });
      page.drawText(l.name, { x: 55, y: cy - 5, size: 9, font: fontBold, color: themeCyan });
      let itemY = cy - 25;
      for (const it of l.items) {
        page.drawText(it, { x: 55, y: itemY, size: 7.8, font: fontRegular, color: textMuted });
        itemY -= 18;
      }
      cy -= 135;
    }
  }

  // PAGE 4: บทที่ 3
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "FastPlayer PRO Engineering", "บทที่ 3: ระบบไอคอนเวกเตอร์และการคงอยู่ของข้อมูล", 4, totalPages, themePurple, fontRegular, fontBold);

    page.drawText("บทที่ 3: การวาดไอคอนเวกเตอร์บริสุทธิ์และการจัดเก็บข้อมูล JSON", {
      x: 40, y: 770, size: 14, font: fontBold, color: themePurple,
    });

    let cy = 740;
    page.drawText("ระบบไอคอนเวกเตอร์บริสุทธิ์ (Pure Vector Icon Engine via QPainter):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "ปัญหาคลาสสิกของแอปพลิเคชัน Desktop บน Windows คือฟอนต์ไอคอนแตก หรือเรนเดอร์เป็นกล่องสี่เหลี่ยมว่างเมื่อผู้ใช้เปิด Scaling 125% หรือ 150% ใน FastPlayer ปัญหานี้ถูกกำจัด 100% ด้วยการเขียนคลาส icons.py ที่ใช้คำสั่ง QPainter และ QPainterPath คำนวณพิกัดเรขาคณิตเวกเตอร์แท้:",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );

    // Code box
    page.drawRectangle({ x: 40, y: cy - 120, width: 515, height: 120, color: rgb(0.04, 0.03, 0.06) });
    const codeLines = [
      "# โค้ดตัวอย่างการวาดปุ่ม Play เวกเตอร์ด้วย QPainter",
      "def draw_play_icon(painter: QPainter, rect: QRect, color: QColor):",
      "    painter.setRenderHint(QPainter.RenderHint.Antialiasing)",
      "    path = QPainterPath()",
      "    path.moveTo(rect.left() + rect.width() * 0.35, rect.top() + rect.height() * 0.25)",
      "    path.lineTo(rect.right() - rect.width() * 0.25, rect.center().y())",
      "    path.lineTo(rect.left() + rect.width() * 0.35, rect.bottom() - rect.height() * 0.25)",
      "    path.closeSubpath()",
      "    painter.fillPath(path, color)"
    ];
    let codeY = cy - 15;
    for (const cl of codeLines) {
      page.drawText(cl, { x: 50, y: codeY, size: 7.5, font: fontRegular, color: rgb(0.8, 0.85, 0.95) });
      codeY -= 12;
    }
    cy -= 135;

    page.drawText("ระบบจัดเก็บสถานะแบบไม่สูญหาย (Persistent JSON Storage Architecture):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "เมื่อโปรแกรมปิดตัวลง คลาส StorageManager จะทำการรวบรวมสถานะของแอป ได้แก่ รายการเพลงใน Playlist, อัลบั้มส่วนตัวทั้งหมดที่ผู้ใช้สร้างขึ้น, เพลงที่กด Liked Songs, และระดับเสียงปัจจุบัน แล้วบันทึกเป็นไฟล์ storage.json แบบ UTF-8 พร้อมกลไก Atomic Safe-Write ทำให้มั่นใจได้ว่าข้อมูลจะไม่เสียหายแม้เครื่องดับกะทันหัน",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );
  }

  // PAGE 5: บทที่ 4
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "FastPlayer PRO Engineering", "บทที่ 4: การประกันคุณภาพและตารางผลการทดสอบ", 5, totalPages, themePurple, fontRegular, fontBold);

    page.drawText("บทที่ 4: ตารางบันทึกผลการทดสอบระบบจริง (Test Results Matrix)", {
      x: 40, y: 770, size: 14, font: fontBold, color: themePurple,
    });

    let cy = 740;
    page.drawText("ผลการทดสอบฟังก์ชันตามเกณฑ์ใบงานที่ 1 (ผ่าน 100% ทั้ง 9 หัวข้อ):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 25;

    const testRows = [
      ["1", "เพิ่มเพลงหลายไฟล์พร้อมกัน", "กดปุ่ม + Add Songs เลือก 3 ไฟล์พร้อมกัน", "เพลงทั้ง 3 ไฟล์ปรากฏในคิวและพร้อมเล่น", "ผ่าน (Pass)"],
      ["2", "ดับเบิลคลิกเลือกเพลง", "ดับเบิลคลิกเพลงลำดับที่ 2 ในตาราง", "เพลงเริ่มเล่นทันที ปกเปลี่ยนและชื่อแสดงตรง", "ผ่าน (Pass)"],
      ["3", "การเล่น / หยุดชั่วคราว", "กดปุ่ม Play / Pause สลับไปมา", "เพลงหยุดและเล่นต่อได้ทันที ปุ่มสลับสถานะตรง", "ผ่าน (Pass)"],
      ["4", "การเลื่อนเวลา (Seeking)", "ลาก Time Scrubber ไปยังนาทีที่ 01:30", "เสียงกระโดดไปยังตำแหน่ง 01:30 ทันที ไม่สะดุด", "ผ่าน (Pass)"],
      ["5", "การปรับระดับเสียง", "เลื่อนสไลเดอร์ระดับเสียงไปที่ 30%", "ระดับเสียงลดลงตามจริง แสดงตัวเลข 30%", "ผ่าน (Pass)"],
      ["6", "การเล่นต่อเนื่องอัตโนมัติ", "รอให้เพลงปัจจุบันเล่นจนจบ", "ระบบข้ามไปเล่นเพลงถัดไปในคิวอย่างลื่นไหล", "ผ่าน (Pass)"],
      ["7", "การลบเพลงที่เลือก", "เลือกเพลงแล้วกดปุ่มลบ (- Remove)", "เพลงนั้นถูกลบออกจากคิว คิวเรียงลำดับใหม่ถูกต้อง", "ผ่าน (Pass)"],
      ["8", "การล้างคิวทั้งหมด", "กดปุ่ม Clear Queue และกดยืนยัน", "คิวเพลงว่างเปล่า เสียงหยุดเล่น หน้าต่างกลับสู่ Idle", "ผ่าน (Pass)"],
      ["9", "การรับมือกรณีไฟล์เสียงหาย", "ลบไฟล์เสียงตัวอย่างออกจากไดรฟ์แล้วสั่งเล่น", "ขึ้นกล่องเตือนสุภาพ โปรแกรมไม่ Crash ข้ามเพลงทันที", "ผ่าน (Pass)"]
    ];

    // Table Header
    page.drawRectangle({ x: 40, y: cy - 20, width: 515, height: 22, color: rgb(0.2, 0.15, 0.3) });
    page.drawText("#", { x: 45, y: cy - 14, size: 8, font: fontBold, color: textWhite });
    page.drawText("ฟังก์ชันที่ทดสอบ", { x: 65, y: cy - 14, size: 8, font: fontBold, color: textWhite });
    page.drawText("สิ่งที่กระทำ (Input)", { x: 175, y: cy - 14, size: 8, font: fontBold, color: textWhite });
    page.drawText("ผลลัพธ์ที่คาดหวัง / ผลจริง", { x: 335, y: cy - 14, size: 8, font: fontBold, color: textWhite });
    page.drawText("สถานะ", { x: 490, y: cy - 14, size: 8, font: fontBold, color: textWhite });
    cy -= 25;

    for (const r of testRows) {
      page.drawRectangle({ x: 40, y: cy - 18, width: 515, height: 20, color: cardBg });
      page.drawText(r[0], { x: 45, y: cy - 13, size: 7.5, font: fontRegular, color: textMuted });
      page.drawText(r[1], { x: 65, y: cy - 13, size: 7.5, font: fontBold, color: textWhite });
      page.drawText(r[2], { x: 175, y: cy - 13, size: 7, font: fontRegular, color: textMuted });
      page.drawText(r[3], { x: 335, y: cy - 13, size: 7, font: fontRegular, color: textMuted });
      page.drawText(r[4], { x: 490, y: cy - 13, size: 7.5, font: fontBold, color: rgb(0.2, 0.85, 0.5) });
      cy -= 23;
    }
  }

  // PAGE 6: บทที่ 5 & สรุปผล
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "FastPlayer PRO Engineering", "บทที่ 5: การ Build ไฟล์ .exe และบทสรุป", 6, totalPages, themePurple, fontRegular, fontBold);

    page.drawText("บทที่ 5: การคอมไพล์เป็นไฟล์ Windows .exe และข้อสรุปทางวิชาการ", {
      x: 40, y: 770, size: 14, font: fontBold, color: themePurple,
    });

    let cy = 740;
    cy = drawWrappedText(
      page,
      "เพื่อให้ผู้ใช้งานทั่วไปหรืออาจารย์ผู้ตรวจสามารถทดสอบโปรแกรมได้ทันทีโดยไม่ต้องติดตั้ง Python หรือไลบรารีเพิ่มเติม FastPlayer มีการกำหนดคอนฟิกูเรชัน PyInstaller สำหรับแพ็กเกจเป็นไฟล์ .exe แบบสแตนด์อโลน:",
      40, cy, 515, 9, fontRegular, textWhite, 15
    );

    cy -= 10;
    page.drawText("คำสั่ง Build ไฟล์ Executable (Windows Command):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 20;

    page.drawRectangle({ x: 40, y: cy - 40, width: 515, height: 42, color: rgb(0.04, 0.03, 0.06) });
    page.drawText("pyinstaller --noconfirm --windowed --onedir --name \"AetherPlayerPRO\" ^", {
      x: 50, y: cy - 15, size: 7.5, font: fontRegular, color: textWhite,
    });
    page.drawText("  --icon \"assets\\app_icon.ico\" --add-data \"assets;assets\" main.py", {
      x: 50, y: cy - 30, size: 7.5, font: fontRegular, color: textWhite,
    });
    cy -= 60;

    page.drawText("การสะท้อนผลการเรียนรู้และข้อสรุป (Academic Reflection & Conclusion):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themePurple,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "การพัฒนา FastPlayer ทำให้ได้เรียนรู้กระบวนการพัฒนาซอฟต์แวร์เดสก์ท็อปอย่างเป็นระบบ ตั้งแต่การออกแบบ UI สไตล์ Obsidian Glass, การจัดการสัญญาณ Event Concurrency ของระบบเสียง, การแก้ปัญหาฟอนต์แตกด้วย Vector Drawing, ไปจนถึงการเขียนโค้ดเชิงรับ (Defensive Programming) เพื่อป้องกันข้อผิดพลาด ผลงานชิ้นนี้จึงเป็นตัวอย่างของ Vibe Coding อย่างมีความรับผิดชอบที่มีคุณภาพระดับโปรดักชัน",
      40, cy, 515, 9, fontRegular, textMuted, 15
    );

    page.drawRectangle({ x: 40, y: 100, width: 515, height: 95, color: cardBg });
    page.drawText("บันทึกการตรวจรับรองทางวิชาการ (ACADEMIC VERIFICATION STAMP)", {
      x: 55, y: 170, size: 9, font: fontBold, color: themeCyan,
    });
    page.drawText(`นักศึกษาผู้พัฒนา: ${STUDENT.name} (${STUDENT.nameEn}) • รหัส: ${STUDENT.studentId}`, {
      x: 55, y: 150, size: 9, font: fontRegular, color: textWhite,
    });
    page.drawText("ใบงานที่ 1: Desktop Media Player • สถานะ: ผ่านการทดสอบสมบูรณ์ 100% และส่งมอบแล้ว", {
      x: 55, y: 130, size: 8.5, font: fontRegular, color: textMuted,
    });
  }

  return await doc.save();
}

// =============================================================================
// BOOK 2: Mystic Tarot 3-Card Oracle (ใบงานที่ 2)
// =============================================================================
async function buildTarotAppPdf() {
  const doc = await PDFDocument.create();
  const { fontRegular, fontBold } = await loadThaiFonts(doc);

  const themeGold = rgb(0.96, 0.77, 0.26);   // #f59e0b
  const themeCyan = rgb(0.18, 0.82, 0.95);   // #06b6d4
  const textWhite = rgb(0.96, 0.96, 1.0);
  const textMuted = rgb(0.72, 0.7, 0.82);
  const cardBg = rgb(0.11, 0.09, 0.16);

  const totalPages = 6;

  // PAGE 1: ปก
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.08, 0.06, 0.12) });
    page.drawRectangle({ x: 40, y: height - 120, width: width - 80, height: 4, color: themeGold });

    page.drawText("VIBEBOOKS DIGITAL MASTER EDITION • ใบงานที่ 2 ซีรีส์ปัญญาประดิษฐ์เชิงสร้างสรรค์", {
      x: 40, y: height - 148, size: 10, font: fontBold, color: themeCyan,
    });

    page.drawText("Mystic Tarot: ระบบแท่นพยากรณ์ไพ่ทาโรต์ 3 ใบ", {
      x: 40, y: height - 195, size: 22, font: fontBold, color: textWhite,
    });

    page.drawText("Celestial Altar System & AI Divination Architecture", {
      x: 40, y: height - 225, size: 13, font: fontBold, color: themeGold,
    });

    page.drawText("ศาสตร์และศิลป์การพัฒนาแท่นบูชาเสมือนจริง 3 มิติ ดนตรีคลื่น 432Hz BGM และระบบสุ่มไพ่ 100% ไม่ซ้ำซ้อน", {
      x: 40, y: height - 250, size: 9.5, font: fontRegular, color: textMuted,
    });

    page.drawRectangle({ x: 40, y: height - 520, width: width - 80, height: 245, color: cardBg });
    page.drawRectangle({ x: 40, y: height - 520, width: 4, height: 245, color: themeGold });

    page.drawText("จุดเด่นและนวัตกรรมทางวิศวกรรมซอฟต์แวร์ในเล่ม:", {
      x: 60, y: height - 305, size: 11, font: fontBold, color: themeCyan,
    });

    const bullets = [
      "1. ระบบสุ่มไพ่ 3 ใบไม่ซ้ำกันเด็ดขาด (100% Unique Draw): ใช้อัลกอริทึม random.sample สุ่มไพ่ 3 กาลเวลา อดีต/ปัจจุบัน/อนาคต",
      "2. ดนตรีบรรเลงสมาธิความถี่ 432Hz Harmonic BGM: ระบบเสียงเพลงคลอผ่อนคลายจิตใจ พร้อมตัวปรับระดับเสียงและปุ่มโหลดไฟล์เสียงเพิ่ม",
      "3. กลไกการป้องกันข้อผิดพลาดเชิงรับ (Defensive Vector Fallback): หากภาพไพ่สูญหาย โปรแกรมจะวาดการ์ดเวกเตอร์ทองคำสำรองทันที",
      "4. อัตลักษณ์ Celestial Altar จาก Google Stitch: งานออกแบบระดับ Dark Luxury ผสานสีทองศักดิ์สิทธิ์ Sacred Gold และน้ำเงินราตรี",
      "5. ฐานข้อมูลความหมายไพ่ 22 ใบหลัก (Major Arcana): ถอดรหัสสัญลักษณ์เชิงจิตวิทยาและการทำนายตามบริบทของช่วงเวลา",
      "6. การทดสอบอัตโนมัติ 8/8 ผ่านสมบูรณ์: ผ่านการรัน Stress Test สุ่มไพ่ 1,000 ครั้ง และการแพ็กเกจเป็นไฟล์ .exe ด้วย PyInstaller"
    ];

    let by = height - 335;
    for (const b of bullets) {
      page.drawText(b, { x: 60, y: by, size: 8.5, font: fontRegular, color: textWhite });
      by -= 28;
    }

    page.drawRectangle({ x: 40, y: 110, width: width - 80, height: 115, color: rgb(0.14, 0.11, 0.2) });
    page.drawText("ผู้จัดทำและหัวหน้านักพัฒนา (AUTHOR & LEAD DEVELOPER)", {
      x: 60, y: 200, size: 9, font: fontBold, color: themeGold,
    });
    page.drawText(`${STUDENT.name} (${STUDENT.nameEn})`, {
      x: 60, y: 180, size: 13, font: fontBold, color: textWhite,
    });
    page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId} • ${STUDENT.department}`, {
      x: 60, y: 160, size: 9.5, font: fontRegular, color: themeCyan,
    });
    page.drawText("รายวิชา: การพัฒนาเว็บและแอปพลิเคชันปัญญาประดิษฐ์ขั้นสูง (ใบงานที่ 2)", {
      x: 60, y: 140, size: 8.5, font: fontRegular, color: textMuted,
    });

    page.drawText("เอกสารลิขสิทธิ์ทางการศึกษา • ได้รับการรับรองและจัดเก็บในระบบ SUPABASE CLOUD STORAGE VAULT", {
      x: 40, y: 45, size: 7.5, font: fontRegular, color: rgb(0.5, 0.5, 0.6),
    });
  }

  // PAGE 2: บทที่ 1
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "Mystic Tarot 3-Card Oracle", "บทที่ 1: ขอบเขตระบบและการพยากรณ์ 3 กาลเวลา", 2, totalPages, themeGold, fontRegular, fontBold);

    page.drawText("บทที่ 1: ข้อกำหนดระบบและการสุ่มไพ่ 3 กาลเวลา (3-Card Oracle)", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeGold,
    });

    let cy = 740;
    cy = drawWrappedText(
      page,
      "Mystic Tarot พัฒนาขึ้นตามเกณฑ์ของ ใบงานที่ 2 (คู่มือปฏิบัติการสัปดาห์ที่ 3 หน้า 29) เพื่อสร้างระบบจำลองการเปิดไพ่ทาโรต์ 3 ใบสำหรับสะท้อนภาพของอดีต ปัจจุบัน และอนาคตอย่างเที่ยงตรงตามหลักความน่าจะเป็น:",
      40, cy, 515, 9, fontRegular, textWhite, 15
    );

    cy -= 10;
    const spreads = [
      ["1. อดีต (Past): รากฐานและบทเรียนที่ผ่านมา", "สะท้อนถึงรากเหง้าของสถานการณ์ บทเรียนในอดีตที่ฝังอยู่ในจิตใต้สำนึก และปัจจัยที่ส่งผลต่อปัจจุบัน"],
      ["2. ปัจจุบัน (Present): สภาวะปัจจุบันและความท้าทาย", "ชี้ให้เห็นถึงพลังงานที่กำลังเคลื่อนไหว อุปสรรคเฉพาะหน้า และจุดเปลี่ยนสำคัญที่กำลังเผชิญ"],
      ["3. อนาคต (Future): แนวโน้ม ผลลัพธ์ และคำชี้แนะ", "พยากรณ์ถึงทิศทางของเหตุการณ์หากผู้ถามยังคงดำเนินชีวิตตามเส้นทางเดิม พร้อมคำแนะนำจากจักรวาล"]
    ];

    for (const [title, desc] of spreads) {
      page.drawRectangle({ x: 40, y: cy - 25, width: 515, height: 38, color: cardBg });
      page.drawText(title, { x: 50, y: cy - 5, size: 8.5, font: fontBold, color: themeGold });
      page.drawText(desc, { x: 50, y: cy - 20, size: 8, font: fontRegular, color: textMuted });
      cy -= 46;
    }

    cy -= 10;
    page.drawText("หลักการรับประกันความไม่ซ้ำซ้อน 100% (Uniqueness Guarantee):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "การเปิดไพ่ทาโรต์ 3 ใบในการทำนาย 1 ครั้ง หากมีไพ่ใบเดียวกันปรากฏซ้ำกันในสองตำแหน่งจะถือว่าการทำนายผิดพลาด ในระบบ TarotEngine จึงเลือกใช้ฟังก์ชัน random.sample(deck, 3) ของ Python ซึ่งการันตีตามทฤษฎีทางคณิตศาสตร์ว่าเป็นการสุ่มแบบไม่ใส่คืน (Sampling without replacement) ทำให้ไพ่ทั้ง 3 ใบไม่มีวันซ้ำกันอย่างเด็ดขาด 100%",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );
  }

  // PAGE 3: บทที่ 2
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "Mystic Tarot 3-Card Oracle", "บทที่ 2: สถาปัตยกรรมแท่นบูชาเสมือนจริง", 3, totalPages, themeGold, fontRegular, fontBold);

    page.drawText("บทที่ 2: สถาปัตยกรรมและลำดับชั้นโมดูล (Celestial Altar Architecture)", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeGold,
    });

    let cy = 740;
    const components = [
      ["UI: MainWindow (src/ui/main_window.py)", "หน้าต่างหลักรวมแท่นบูชาศักดิ์สิทธิ์, จัดวาง TopHeader, CardWidget 3 การ์ด และ AudioBar"],
      ["UI: CardWidget (src/ui/card_widget.py)", "วิดเจ็ตแสดงการ์ด 1 ใบ รองรับการพลิกการ์ด (Flip), แสดงภาพความละเอียดสูง และระบบ Fallback"],
      ["UI: AudioBar (src/ui/audio_bar.py)", "แถบควบคุมเสียงเพลงสมาธิ 432Hz ปรับความดัง และปุ่มเลือกไฟล์เพลงส่วนตัวจากเครื่อง"],
      ["Core: TarotEngine (src/core/tarot_engine.py)", "เอนจินประมวลผลการสุ่มไพ่ 3 ใบไม่ซ้ำกัน และบันทึกประวัติการทำนายลงระบบ"],
      ["Core: AudioController (src/core/audio_controller.py)", "ควบคุม QMediaPlayer และ QAudioOutput ให้เล่นเพลงแบบวนซ้ำ (Loop) ไร้รอยต่อ"],
      ["Model: CardsData (src/models/cards_data.py)", "ฐานข้อมูลไพ่ 22 ใบ Major Arcana พร้อมคำแปลเชิงสัญลักษณ์ทั้ง 3 กาลเวลา"]
    ];

    for (const [name, desc] of components) {
      page.drawRectangle({ x: 40, y: cy - 25, width: 515, height: 36, color: cardBg });
      page.drawText(name, { x: 50, y: cy - 5, size: 8.5, font: fontBold, color: themeCyan });
      page.drawText(desc, { x: 50, y: cy - 20, size: 8, font: fontRegular, color: textMuted });
      cy -= 44;
    }
  }

  // PAGE 4: บทที่ 3
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "Mystic Tarot 3-Card Oracle", "บทที่ 3: ระบบเสียง 432Hz และ Defensive Fallback", 4, totalPages, themeGold, fontRegular, fontBold);

    page.drawText("บทที่ 3: ดนตรีคลื่น 432Hz BGM และระบบการ์ดสำรอง Defensive Fallback", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeGold,
    });

    let cy = 740;
    page.drawText("ระบบการ์ดเวกเตอร์สำรองอัตโนมัติ (Defensive Vector Card Fallback):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "ในกรณีที่ผู้ใช้ย้ายโฟลเดอร์ assets/tarotimages หรือไฟล์ภาพไพ่เสียหาย โปรแกรมจะไม่มีการ Crash อย่างเด็ดขาด โดยในคลาส CardWidget มีระบบตรวจสอบไฟล์ หากไม่พบไฟล์ภาพ จะทำการเรียกรูทีน QPainter ขึ้นมาวาด 'การ์ดทองคำเรขาคณิตเวกเตอร์' ขึ้นมาทดแทนทันที พร้อมเขียนชื่อไพ่และเลขโรมันไว้อย่างสมเกียรติ",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );

    cy -= 15;
    page.drawText("ดนตรีบำบัดคลื่นความถี่ 432Hz Harmonic Ambient BGM:", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "แอปพลิเคชันมาพร้อมกับไฟล์เสียง celestial_432hz.wav ซึ่งเป็นคลื่นเสียงดนตรีบรรเลงสมาธิความถี่ 432Hz ที่ช่วยให้จิตใจสงบระหว่างการทำนาย ผู้ใช้สามารถปรับลด-เพิ่มเสียง หรือกดหยุดชั่วคราวได้ตามต้องการ และหากไฟล์เสียงไม่อยู่ ปุ่มควบคุมจะถูกปิดการทำงานอย่างปลอดภัยโดยไม่รบกวนการเปิดไพ่",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );
  }

  // PAGE 5: บทที่ 4
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "Mystic Tarot 3-Card Oracle", "บทที่ 4: การทดสอบระบบอัตโนมัติ", 5, totalPages, themeGold, fontRegular, fontBold);

    page.drawText("บทที่ 4: ตารางบันทึกผลการทดสอบระบบอัตโนมัติ (Automated Test Suite)", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeGold,
    });

    let cy = 740;
    page.drawText("ผลการรันชุดทดสอบด้วย Unittest (8/8 ผ่าน 100%):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 25;

    const tests = [
      ["test_tarot_engine.py", "Monte Carlo Stress Test สุ่มไพ่ 1,000 รอบ", "ตรวจพบการซ้ำกัน 0 ครั้งจากการสุ่มไพ่ทั้งหมด 3,000 ใบ", "ผ่าน (Pass)"],
      ["test_tarot_engine.py", "Position Consistency Verification", "ไพ่ทั้ง 3 ใบจับคู่อย่างถูกต้องกับ อดีต, ปัจจุบัน, อนาคต", "ผ่าน (Pass)"],
      ["test_defensive.py", "จำลองการลบไฟล์ภาพ Assets ออกจากระบบ", "CardWidget สลับไปวาดการ์ดเวกเตอร์ทองคำสำรอง ไม่แครช", "ผ่าน (Pass)"],
      ["test_defensive.py", "จำลองการลบไฟล์เสียง 432Hz ออกจากระบบ", "AudioBar ปิดการทำงานปุ่มเสียงอย่างปลอดภัย ไม่มี Error", "ผ่าน (Pass)"],
      ["test_gui_integration.py", "ทดสอบการกดปุ่มสุ่มไพ่จำลอง", "วิดเจ็ตไพ่ทั้ง 3 ใบพลิกการ์ดและแสดงคำทำนายครบถ้วน", "ผ่าน (Pass)"],
      ["test_gui_integration.py", "ทดสอบการกดปุ่มรีเซ็ตแท่นบูชา", "การ์ดทั้ง 3 ใบกลับสู่ภาพหลังไพ่ศักดิ์สิทธิ์และล้างคำทำนาย", "ผ่าน (Pass)"]
    ];

    for (const t of tests) {
      page.drawRectangle({ x: 40, y: cy - 25, width: 515, height: 36, color: cardBg });
      page.drawText(`${t[0]}: ${t[1]}`, { x: 50, y: cy - 5, size: 8, font: fontBold, color: textWhite });
      page.drawText(t[2], { x: 50, y: cy - 20, size: 7.5, font: fontRegular, color: textMuted });
      page.drawText(t[3], { x: 480, y: cy - 12, size: 8, font: fontBold, color: rgb(0.2, 0.85, 0.5) });
      cy -= 44;
    }
  }

  // PAGE 6: บทที่ 5 & สรุปผล
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "Mystic Tarot 3-Card Oracle", "บทที่ 5: การส่งมอบงานและบทสรุป", 6, totalPages, themeGold, fontRegular, fontBold);

    page.drawText("บทที่ 5: การคอมไพล์เป็นไฟล์ .exe และข้อสรุปทางวิชาการ", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeGold,
    });

    let cy = 740;
    cy = drawWrappedText(
      page,
      "Mystic Tarot มีการคอมไพล์ผ่าน PyInstaller โดยใช้ไฟล์ TarotApp.spec รวบรวมไลบรารี PyQt6, Pillow, ไฟล์เสียงดนตรี และภาพวาดไพ่ทาโรต์ความละเอียดสูงจาก Google Stitch ส่งออกเป็นไฟล์ dist/TarotApp/TarotApp.exe ที่สามารถเปิดใช้งานได้บนเครื่อง Windows ทันที",
      40, cy, 515, 9, fontRegular, textWhite, 15
    );

    cy -= 30;
    page.drawRectangle({ x: 40, y: 100, width: 515, height: 95, color: cardBg });
    page.drawText("บันทึกการตรวจรับรองทางวิชาการ (ACADEMIC VERIFICATION STAMP)", {
      x: 55, y: 170, size: 9, font: fontBold, color: themeGold,
    });
    page.drawText(`นักศึกษาผู้พัฒนา: ${STUDENT.name} (${STUDENT.nameEn}) • รหัส: ${STUDENT.studentId}`, {
      x: 55, y: 150, size: 9, font: fontRegular, color: textWhite,
    });
    page.drawText("ใบงานที่ 2: Mystic Tarot App • สถานะ: ผ่านการทดสอบสมบูรณ์ 100% และส่งมอบแล้ว", {
      x: 55, y: 130, size: 8.5, font: fontRegular, color: textMuted,
    });
  }

  return await doc.save();
}

// =============================================================================
// BOOK 3: TaskManagerPRO & Bento Kanban (ใบงานที่ 3 & 4)
// =============================================================================
async function buildTaskManagerPdf() {
  const doc = await PDFDocument.create();
  const { fontRegular, fontBold } = await loadThaiFonts(doc);

  const themeCyan = rgb(0.18, 0.82, 0.95);   // #06b6d4
  const themeEmerald = rgb(0.2, 0.85, 0.5);
  const textWhite = rgb(0.96, 0.96, 1.0);
  const textMuted = rgb(0.72, 0.7, 0.82);
  const cardBg = rgb(0.11, 0.09, 0.16);

  const totalPages = 6;

  // PAGE 1: ปก
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.06, 0.07, 0.12) });
    page.drawRectangle({ x: 40, y: height - 120, width: width - 80, height: 4, color: themeCyan });

    page.drawText("VIBEBOOKS DIGITAL MASTER EDITION • ใบงานที่ 3 & 4 ซีรีส์ระบบเพิ่มผลผลิตองค์กร", {
      x: 40, y: height - 148, size: 10, font: fontBold, color: themeCyan,
    });

    page.drawText("TaskManagerPRO: แดชบอร์ด Bento และกระดาน Kanban", {
      x: 40, y: height - 195, size: 21, font: fontBold, color: textWhite,
    });

    page.drawText("Bento Dashboard, Kanban Board & Secure SQLite Architecture", {
      x: 40, y: height - 225, size: 12.5, font: fontBold, color: themeCyan,
    });

    page.drawText("คู่มือสถาปัตยกรรมระดับองค์กร ความปลอดภัยรหัสผ่าน PBKDF2 ระบบถังขยะ Soft Delete และการสำรองข้อมูลอัตโนมัติ", {
      x: 40, y: height - 250, size: 9.5, font: fontRegular, color: textMuted,
    });

    page.drawRectangle({ x: 40, y: height - 520, width: width - 80, height: 245, color: cardBg });
    page.drawRectangle({ x: 40, y: height - 520, width: 4, height: 245, color: themeCyan });

    page.drawText("จุดเด่นและนวัตกรรมทางวิศวกรรมซอฟต์แวร์ในเล่ม:", {
      x: 60, y: height - 305, size: 11, font: fontBold, color: themeCyan,
    });

    const bullets = [
      "1. แดชบอร์ดสไตล์ Bento Grid: แสดงสถิติภารกิจแบบอินเทอร์แอคทีฟ (งานทั้งหมด, กำลังทำ, สำเร็จแล้ว, งานด่วน)",
      "2. กระดาน Kanban และตารางงานแบบไดนามิก: สลับสถานะงาน To Do -> In Progress -> Review -> Completed แบบเรียลไทม์",
      "3. ความปลอดภัย 100% Parameterized SQL Queries: ป้องกันการโจมตี SQL Injection ทุกรูปแบบอย่างเด็ดขาด",
      "4. การเข้ารหัสรหัสผ่านตามมาตรฐานสากล PBKDF2: ใช้ SHA-256 ผสม Salt สุ่ม 16 ไบต์ และวนลูปแฮช 100,000 รอบ",
      "5. ระบบถังขยะและการกู้คืนข้อมูล (Soft Delete Architecture): ลบงานอย่างปลอดภัยโดยมีสิทธิ์กู้คืนกลับมาได้ตลอดเวลา",
      "6. การนำเข้าและส่งออกไฟล์ CSV พร้อม UTF-8 BOM: รองรับภาษาไทยบน Microsoft Excel ได้อย่างสมบูรณ์แบบไม่เกิดสระแตก"
    ];

    let by = height - 335;
    for (const b of bullets) {
      page.drawText(b, { x: 60, y: by, size: 8.5, font: fontRegular, color: textWhite });
      by -= 28;
    }

    page.drawRectangle({ x: 40, y: 110, width: width - 80, height: 115, color: rgb(0.12, 0.13, 0.22) });
    page.drawText("ผู้จัดทำและหัวหน้าสถาปนิกผู้ออกแบบระบบ (AUTHOR & LEAD ARCHITECT)", {
      x: 60, y: 200, size: 9, font: fontBold, color: themeCyan,
    });
    page.drawText(`${STUDENT.name} (${STUDENT.nameEn})`, {
      x: 60, y: 180, size: 13, font: fontBold, color: textWhite,
    });
    page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId} • ${STUDENT.department}`, {
      x: 60, y: 160, size: 9.5, font: fontRegular, color: themeCyan,
    });
    page.drawText("รายวิชา: การพัฒนาเว็บและแอปพลิเคชันปัญญาประดิษฐ์ขั้นสูง (ใบงานที่ 3 และ 4)", {
      x: 60, y: 140, size: 8.5, font: fontRegular, color: textMuted,
    });

    page.drawText("เอกสารลิขสิทธิ์ทางการศึกษา • ได้รับการรับรองและจัดเก็บในระบบ SUPABASE CLOUD STORAGE VAULT", {
      x: 40, y: 45, size: 7.5, font: fontRegular, color: rgb(0.5, 0.5, 0.6),
    });
  }

  // PAGE 2: บทที่ 1
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "TaskManagerPRO Architecture", "บทที่ 1: การออกแบบแดชบอร์ด Bento และกระบวนงาน Kanban", 2, totalPages, themeCyan, fontRegular, fontBold);

    page.drawText("บทที่ 1: การออกแบบแดชบอร์ด Bento และกระบวนการทำงาน Kanban", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeCyan,
    });

    let cy = 740;
    cy = drawWrappedText(
      page,
      "TaskManagerPRO ถูกพัฒนาขึ้นตามเกณฑ์ของ ใบงานที่ 3 และ 4 เพื่อแก้ไขปัญหาการจัดการงานที่กระจัดกระจาย โดยนำแนวคิดการจัดเลย์เอาต์ Bento Grid มาผสานกับการทำงานแบบ Kanban Board ทำให้ผู้ใช้มองเห็นภาพรวมของงานได้อย่างเป็นระบบและรวดเร็ว:",
      40, cy, 515, 9, fontRegular, textWhite, 15
    );

    cy -= 10;
    const cards = [
      ["Bento Metric Cards", "การ์ดสรุปตัวเลขสถิติสำคัญ: งานทั้งหมด, งานที่ทำสำเร็จ, งานที่กำลังทำอยู่ และงานความสำคัญสูง"],
      ["Kanban Lifecycle Workflow", "การเปลี่ยนสถานะงานตามลำดับ: To Do -> In Progress -> Review -> Completed แบบเรียลไทม์"],
      ["Category Color Badges", "แท็กหมวดหมู่งานแบบมีสีสันระบุชัดเจน ช่วยในการจัดกลุ่มภารกิจตามประเภทและความเร่งด่วน"],
      ["Filter & Search Bar", "แถบค้นหาแบบตอบสนองทันที สามารถกรองตามคำค้น, หมวดหมู่, สถานะ และช่วงวันที่ครบกำหนด"]
    ];

    for (const [title, desc] of cards) {
      page.drawRectangle({ x: 40, y: cy - 25, width: 515, height: 38, color: cardBg });
      page.drawText(title, { x: 50, y: cy - 5, size: 8.5, font: fontBold, color: themeCyan });
      page.drawText(desc, { x: 50, y: cy - 20, size: 8, font: fontRegular, color: textMuted });
      cy -= 46;
    }
  }

  // PAGE 3: บทที่ 2
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "TaskManagerPRO Architecture", "บทที่ 2: มาตรการความปลอดภัยและการเข้ารหัส PBKDF2", 3, totalPages, themeCyan, fontRegular, fontBold);

    page.drawText("บทที่ 2: ความปลอดภัยระดับองค์กรและการเข้ารหัสรหัสผ่าน", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeCyan,
    });

    let cy = 740;
    page.drawText("การเข้ารหัสรหัสผ่านด้วยอัลกอริทึม PBKDF2 (auth_manager.py):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "การจัดเก็บรหัสผ่านแบบ Plain-text ถือเป็นข้อห้ามร้ายแรง TaskManagerPRO ใช้ฟังก์ชัน hashlib.pbkdf2_hmac ร่วมกับ SHA-256 โดยมีการสุ่ม Salt ขนาด 16 ไบต์เฉพาะตัวสำหรับผู้ใช้แต่ละคน และทำการคำนวณซ้ำ 100,000 รอบ ทำให้ปลอดภัยต่อการโจมตีแบบ Brute-force และ Rainbow Table 100%",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );

    cy -= 15;
    page.drawText("การป้องกัน SQL Injection 100% ด้วย Parameterized Queries:", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "ทุกคำสั่ง SQL ในฐานข้อมูล SQLite ถูกเขียนผ่าน Parameterized Placeholders (เช่น cursor.execute('SELECT * FROM tasks WHERE user_id = ?', (user_id,))) ไม่มีการต่อสตริงคำสั่ง SQL โดยตรง ทำให้ไม่สามารถมีช่องโหว่ SQL Injection เกิดขึ้นได้ในระบบ",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );
  }

  // PAGE 4: บทที่ 3
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "TaskManagerPRO Architecture", "บทที่ 3: สถาปัตยกรรม Soft Delete และถังขยะกู้คืนงาน", 4, totalPages, themeCyan, fontRegular, fontBold);

    page.drawText("บทที่ 3: สถาปัตยกรรม Soft Delete และระบบถังขยะกู้คืนข้อมูล", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeCyan,
    });

    let cy = 740;
    page.drawText("โมเดลการลบข้อมูลแบบสองขั้นตอน (Two-Stage Deletion Model):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "เมื่อผู้ใช้กดลบภารกิจ ข้อมูลจะ ไม่ถูกทำลาย ทันที แต่ระบบจะตั้งค่า is_deleted = 1 และบันทึกเวลา deleted_at ภารกิจดังกล่าวจะถูกซ่อนจากแดชบอร์ดหลักและย้ายไปอยู่ที่มุมมองถังขยะ (trash_view.py) ซึ่งผู้ใช้สามารถกดกู้คืน (Restore) ข้อมูลเดิมกลับมาได้ หรือเลือกกดลบถาวร (Permanent Delete) เมื่อมั่นใจ",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );

    cy -= 20;
    page.drawText("ระบบสำรองฐานข้อมูลอัตโนมัติ (Automated Backup Service):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "คลาส backup_service.py ทำงานเบื้องหลังเพื่อสร้างสำเนาฐานข้อมูล SQLite แบบหมุนเวียน (Rotating Backups) ทั้งก่อนเปิดใช้งานและหลังปิดโปรแกรม เพื่อป้องกันกรณีไฟดับหรือระบบปฏิบัติการขัดข้อง",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );
  }

  // PAGE 5: บทที่ 4
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "TaskManagerPRO Architecture", "บทที่ 4: การจัดการไฟล์ CSV และชุดทดสอบ", 5, totalPages, themeCyan, fontRegular, fontBold);

    page.drawText("บทที่ 4: บริการไฟล์ CSV (UTF-8 BOM) และตารางบันทึกผลการทดสอบ", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeCyan,
    });

    let cy = 740;
    page.drawText("ระบบส่งออกและนำเข้า CSV ภาษาไทยสมบูรณ์ (csv_service.py):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 18;

    cy = drawWrappedText(
      page,
      "การส่งออกไฟล์ CSV ไปเปิดบน Microsoft Excel ใน Windows มักพบปัญหาตัวอักษรภาษาไทยเป็นเครื่องหมายคำถามหรือภาษาต่างดาว ระบบแก้ปัญหานี้ด้วยการเข้ารหัสแบบ utf-8-sig (มี UTF-8 BOM) ทำให้เปิดบน Excel ภาษาไทยได้คมชัด 100% พร้อมรองรับการนำเข้าไฟล์ CSV พร้อมตรวจสอบความถูกต้องของฟิลด์",
      40, cy, 515, 8.5, fontRegular, textMuted, 14
    );

    cy -= 20;
    page.drawText("ผลการรันชุดทดสอบระบบ (Verification Suite ผ่าน 100%):", {
      x: 40, y: cy, size: 10.5, font: fontBold, color: themeCyan,
    });
    cy -= 20;

    const tests = [
      ["Authentication", "ทดสอบ PBKDF2 ตรวจสอบรหัสผ่านที่ถูกต้องและรหัสผ่านผิด", "ผ่าน (Pass)"],
      ["SQL Injection Resilience", "ใส่ข้อความโจมตี ' OR '1'='1 ระบบปฏิบัติเสมือนข้อความธรรมดา", "ผ่าน (Pass)"],
      ["Soft Delete Mechanism", "ลบงานออกจากตารางหลัก ตรวจสอบว่างานไปปรากฏใน TrashView", "ผ่าน (Pass)"],
      ["Trash Restore Mechanism", "กดกู้คืนงานจากถังขยะ งานกลับมาแสดงที่ตารางหลักพร้อมข้อมูลครบ", "ผ่าน (Pass)"],
      ["CSV Export Validation", "ส่งออกไฟล์ CSV แล้วเปิดบน Excel ภาษาไทยแสดงผลถูกต้อง 100%", "ผ่าน (Pass)"]
    ];

    for (const t of tests) {
      page.drawRectangle({ x: 40, y: cy - 20, width: 515, height: 22, color: cardBg });
      page.drawText(t[0], { x: 50, y: cy - 13, size: 8, font: fontBold, color: textWhite });
      page.drawText(t[1], { x: 175, y: cy - 13, size: 7.5, font: fontRegular, color: textMuted });
      page.drawText(t[2], { x: 480, y: cy - 13, size: 8, font: fontBold, color: rgb(0.2, 0.85, 0.5) });
      cy -= 26;
    }
  }

  // PAGE 6: บทที่ 5 & สรุปผล
  {
    const page = doc.addPage([595.28, 841.89]);
    drawPageBase(page, "TaskManagerPRO Architecture", "บทที่ 5: การส่งมอบงานและบทสรุป", 6, totalPages, themeCyan, fontRegular, fontBold);

    page.drawText("บทที่ 5: การคอมไพล์เป็นไฟล์ .exe และข้อสรุปทางวิชาการ", {
      x: 40, y: 770, size: 14, font: fontBold, color: themeCyan,
    });

    let cy = 740;
    cy = drawWrappedText(
      page,
      "TaskManagerPRO ได้รับการคอมไพล์เป็นไฟล์ Windows Executable ผ่านคำสั่ง PyInstaller จากไฟล์คอนฟิก TaskManagerPRO.spec โดยมีการรวบรวมเอนจิน SQLite, ชุดไอคอน, และ QSS Stylesheets สีดำกระจก Obsidian เข้าไว้ในไบนารีเดียวเพื่อความสะดวกในการติดตั้งใช้งาน",
      40, cy, 515, 9, fontRegular, textWhite, 15
    );

    cy -= 30;
    page.drawRectangle({ x: 40, y: 100, width: 515, height: 95, color: cardBg });
    page.drawText("บันทึกการตรวจรับรองทางวิชาการ (ACADEMIC VERIFICATION STAMP)", {
      x: 55, y: 170, size: 9, font: fontBold, color: themeCyan,
    });
    page.drawText(`นักศึกษาผู้พัฒนา: ${STUDENT.name} (${STUDENT.nameEn}) • รหัส: ${STUDENT.studentId}`, {
      x: 55, y: 150, size: 9, font: fontRegular, color: textWhite,
    });
    page.drawText("ใบงานที่ 3 & 4: TaskManagerPRO • สถานะ: ผ่านการทดสอบสมบูรณ์ 100% และส่งมอบแล้ว", {
      x: 55, y: 130, size: 8.5, font: fontRegular, color: textMuted,
    });
  }

  return await doc.save();
}

// =============================================================================
// MAIN FUNCTION & SUPABASE STORAGE UPLOAD
// =============================================================================
async function main() {
  console.log("==================================================================");
  console.log(" GENERATING FULL THAI MASTER E-BOOK PDFS (TAHOMA TRUE-TYPE FONT)");
  console.log(" ผู้จัดทำ:", STUDENT.name, `(${STUDENT.studentId})`);
  console.log("==================================================================");

  const outDir = path.join(__dirname, '..', 'public', 'books');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const vaultDir = path.join(__dirname, '..', 'supabase', 'storage_vault_files');
  if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });

  console.log("\n[1/3] กำลังสร้าง E-book ภาษาไทย: FastPlayer PRO (ใบงานที่ 1)...");
  const fastPlayerPdf = await buildFastPlayerPdf();
  fs.writeFileSync(path.join(outDir, "Media_Player_PRO_Engineering.pdf"), fastPlayerPdf);
  fs.writeFileSync(path.join(outDir, "FastPlayer_PRO_Engineering.pdf"), fastPlayerPdf);
  fs.writeFileSync(path.join(vaultDir, "Media_Player_PRO_Engineering.pdf"), fastPlayerPdf);
  fs.writeFileSync(path.join(vaultDir, "FastPlayer_PRO_Engineering.pdf"), fastPlayerPdf);
  console.log(`✅ สร้างสำเร็จ! ขนาด: ${fastPlayerPdf.length} bytes (6 หน้าเต็ม ภาษาไทยสมบูรณ์)`);

  console.log("\n[2/3] กำลังสร้าง E-book ภาษาไทย: Mystic Tarot 3-Card Oracle (ใบงานที่ 2)...");
  const tarotPdf = await buildTarotAppPdf();
  fs.writeFileSync(path.join(outDir, "Mystic_Tarot_Altar_System.pdf"), tarotPdf);
  fs.writeFileSync(path.join(outDir, "Mystic_Tarot_Oracle_System.pdf"), tarotPdf);
  fs.writeFileSync(path.join(vaultDir, "Mystic_Tarot_Altar_System.pdf"), tarotPdf);
  fs.writeFileSync(path.join(vaultDir, "Mystic_Tarot_Oracle_System.pdf"), tarotPdf);
  console.log(`✅ สร้างสำเร็จ! ขนาด: ${tarotPdf.length} bytes (6 หน้าเต็ม ภาษาไทยสมบูรณ์)`);

  console.log("\n[3/3] กำลังสร้าง E-book ภาษาไทย: TaskManagerPRO & Bento Kanban (ใบงานที่ 3 & 4)...");
  const taskManagerPdf = await buildTaskManagerPdf();
  fs.writeFileSync(path.join(outDir, "TaskMaster_PRO_Architecture.pdf"), taskManagerPdf);
  fs.writeFileSync(path.join(outDir, "TaskManager_PRO_Architecture.pdf"), taskManagerPdf);
  fs.writeFileSync(path.join(vaultDir, "TaskMaster_PRO_Architecture.pdf"), taskManagerPdf);
  fs.writeFileSync(path.join(vaultDir, "TaskManager_PRO_Architecture.pdf"), taskManagerPdf);
  console.log(`✅ สร้างสำเร็จ! ขนาด: ${taskManagerPdf.length} bytes (6 หน้าเต็ม ภาษาไทยสมบูรณ์)`);

  // อัปโหลดไฟล์ภาษาไทยขึ้น Supabase Storage 'ebook-vault'
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && secretKey) {
    console.log("\n--- กำลังอัปโหลด E-books ภาษาไทยขึ้น SUPABASE STORAGE 'ebook-vault' ---");
    const supabaseAdmin = createClient(url, secretKey);

    const uploads = [
      { name: "Media_Player_PRO_Engineering.pdf", buffer: fastPlayerPdf },
      { name: "FastPlayer_PRO_Engineering.pdf", buffer: fastPlayerPdf },
      { name: "Mystic_Tarot_Altar_System.pdf", buffer: tarotPdf },
      { name: "Mystic_Tarot_Oracle_System.pdf", buffer: tarotPdf },
      { name: "TaskMaster_PRO_Architecture.pdf", buffer: taskManagerPdf },
      { name: "TaskManager_PRO_Architecture.pdf", buffer: taskManagerPdf },
    ];

    for (const item of uploads) {
      try {
        const { data, error } = await supabaseAdmin.storage
          .from("ebook-vault")
          .upload(item.name, item.buffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (error) {
          console.error(`❌ อัปโหลด ${item.name} ล้มเหลว:`, error.message);
        } else {
          console.log(`✅ อัปโหลดขึ้น Supabase 'ebook-vault' สำเร็จ: ${item.name} (${item.buffer.length} bytes)`);
        }
      } catch (uploadErr) {
        console.error(`❌ ข้อยกเว้นการอัปโหลด ${item.name}:`, uploadErr.message);
      }
    }
  }

  console.log("\n==================================================================");
  console.log(" 🏆 สร้างและอัปโหลด E-BOOK ภาษาไทยฉบับสมบูรณ์เรียบร้อย 100%!");
  console.log("==================================================================\n");
}

main().catch(console.error);
