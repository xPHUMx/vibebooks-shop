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

// Student Information (Strictly Name & Student ID only - NO department/course)
const STUDENT = {
  name: "นายเกียรติภูมิ หารศรีนาถ",
  nameEn: "Kiatphum Hansrinath",
  studentId: "64332110242-2",
  brand: "VibeBooks PRO · Technical Master Edition",
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

// Helper: Draw Apple-Style Page Header & Footer
function drawPageBase(page, title, chapter, pageNum, totalPages, themeAccent, fontRegular, fontBold) {
  const { width, height } = page.getSize();

  // Apple Pure Clean White Canvas
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.99, 0.99, 1.0),
  });

  // Top Minimal Hairline Rule
  page.drawRectangle({
    x: 40,
    y: height - 42,
    width: width - 80,
    height: 0.75,
    color: rgb(0.88, 0.88, 0.91),
  });

  // Running header: Title (Graphite) & Section (Apple Accent)
  page.drawText(title, {
    x: 40,
    y: height - 34,
    size: 8,
    font: fontBold,
    color: rgb(0.12, 0.12, 0.14),
  });

  page.drawText(chapter, {
    x: width - 250,
    y: height - 34,
    size: 8,
    font: fontBold,
    color: themeAccent,
  });

  // Bottom Minimal Hairline Rule
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: 0.75,
    color: rgb(0.88, 0.88, 0.91),
  });

  // Running footer: Only Name & Student ID
  page.drawText(`ผู้จัดทำ: ${STUDENT.name} (รหัสนักศึกษา: ${STUDENT.studentId}) • ${STUDENT.brand}`, {
    x: 40,
    y: 26,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.53, 0.53, 0.56),
  });

  page.drawText(`หน้า ${pageNum} จาก ${totalPages}`, {
    x: width - 95,
    y: 26,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.53, 0.53, 0.56),
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

// Apple Titanium Card Helper
function drawAppleCard(page, x, y, width, height, borderColor = rgb(0.88, 0.88, 0.91), bgColor = rgb(0.96, 0.96, 0.98)) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: bgColor,
    borderColor,
    borderWidth: 0.75,
  });
}

// Apple Dark Terminal Card Helper
function drawTerminalCard(page, x, y, width, height) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.10, 0.10, 0.12),
    borderColor: rgb(0.20, 0.20, 0.24),
    borderWidth: 0.75,
  });
  // Mac traffic lights
  page.drawCircle({ x: x + 14, y: y + height - 12, size: 3, color: rgb(0.95, 0.35, 0.35) });
  page.drawCircle({ x: x + 24, y: y + height - 12, size: 3, color: rgb(0.95, 0.75, 0.25) });
  page.drawCircle({ x: x + 34, y: y + height - 12, size: 3, color: rgb(0.35, 0.85, 0.45) });
}

// =============================================================================
// BOOK 1: FastPlayer PRO (Lab 1 Engineering)
// =============================================================================
async function buildFastPlayerPdf() {
  const doc = await PDFDocument.create();
  const { fontRegular, fontBold } = await loadThaiFonts(doc);

  const appleBlue = rgb(0.0, 0.44, 0.89);      // #0071e3
  const appleAccent = rgb(0.55, 0.25, 0.88);    // Purple accent for Media
  const textBlack = rgb(0.10, 0.10, 0.12);
  const textMuted = rgb(0.48, 0.48, 0.52);
  const totalPages = 6;

  // PAGE 1: ปก Apple Product Brief
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.99, 0.99, 1.0) });

    // Apple Pill Eyebrow
    page.drawRectangle({ x: 40, y: height - 100, width: 235, height: 22, color: rgb(0.94, 0.95, 0.99), borderColor: rgb(0.85, 0.88, 0.96), borderWidth: 0.75 });
    page.drawText("VIBEBOOKS PRO · ARCHITECTURE SERIES", { x: 50, y: height - 93, size: 8, font: fontBold, color: appleBlue });

    page.drawText("FastPlayer PRO", {
      x: 40, y: height - 150, size: 28, font: fontBold, color: textBlack,
    });

    page.drawText("Desktop Media Player Architecture & Engineering (Lab 1)", {
      x: 40, y: height - 180, size: 14, font: fontBold, color: appleAccent,
    });

    page.drawText("คู่มือสถาปัตยกรรมระบบเครื่องเล่นเสียงและวิดีโอเดสก์ท็อป การเรนเดอร์ไอคอนเวกเตอร์บริสุทธิ์ และการจัดเก็บสถานะ Persistent JSON", {
      x: 40, y: height - 205, size: 9.5, font: fontRegular, color: textMuted,
    });

    // Hairline divider
    page.drawRectangle({ x: 40, y: height - 225, width: width - 80, height: 0.75, color: rgb(0.88, 0.88, 0.91) });

    // Apple Spec Cards (Bento style 4 tiles)
    drawAppleCard(page, 40, height - 370, 250, 130);
    page.drawText("01 / VECTOR ICON ENGINE", { x: 55, y: height - 265, size: 8, font: fontBold, color: appleBlue });
    page.drawText("เรนเดอร์ด้วย QPainter 100%", { x: 55, y: height - 285, size: 11, font: fontBold, color: textBlack });
    page.drawText("วาดสัญลักษณ์ Play, Pause, Next, Volume ด้วยสมการเวกเตอร์คมชัดทุก DPI ไร้การแตกตัว", { x: 55, y: height - 310, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 305, height - 370, 250, 130);
    page.drawText("02 / ZERO DATA LOSS", { x: 320, y: height - 265, size: 8, font: fontBold, color: appleAccent });
    page.drawText("Persistent JSON Storage", { x: 320, y: height - 285, size: 11, font: fontBold, color: textBlack });
    page.drawText("จัดเก็บและกู้คืนสถานะ Playlist, Volume, Liked Songs และคิวเพลงข้ามการเปิด-ปิดแอปพลิเคชัน", { x: 320, y: height - 310, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 40, height - 515, 250, 130);
    page.drawText("03 / UNDER BAR DOCK", { x: 55, y: height - 410, size: 8, font: fontBold, color: appleAccent });
    page.drawText("Interactive Scrubbing", { x: 55, y: height - 430, size: 11, font: fontBold, color: textBlack });
    page.drawText("แถบควบคุมมัลติมีเดียด้านล่าง ค้นหาตำแหน่งเพลง Seek Scrubbing ลื่นไหลแม่นยำระดับมิลลิวินาที", { x: 55, y: height - 455, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 305, height - 515, 250, 130);
    page.drawText("04 / PRODUCTION ENGINE", { x: 320, y: height - 410, size: 8, font: fontBold, color: appleBlue });
    page.drawText("PyQt6 & QtMultimedia", { x: 320, y: height - 430, size: 11, font: fontBold, color: textBlack });
    page.drawText("เชื่อมโยง Audio Output ระดับเนทีฟ ข้ามแพลตฟอร์ม พร้อมระบบจัดการข้อผิดพลาด Defensive Fallback", { x: 320, y: height - 455, size: 8.5, font: fontRegular, color: textMuted });

    // Apple Author Box (Strictly Name & Student ID only)
    drawAppleCard(page, 40, height - 610, width - 80, 75, rgb(0.85, 0.88, 0.95), rgb(0.96, 0.97, 1.0));
    page.drawText("LEAD ARCHITECT & AUTHOR", { x: 60, y: height - 555, size: 8, font: fontBold, color: appleBlue });
    page.drawText(`ผู้จัดทำ: ${STUDENT.name}`, { x: 60, y: height - 575, size: 12, font: fontBold, color: textBlack });
    page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId} • Project Creator & System Architect`, { x: 60, y: height - 595, size: 9.5, font: fontRegular, color: textMuted });

    // Verification stamp
    page.drawText("SUPABASE VAULT CERTIFIED • DIGITAL MASTER EDITION 2026", { x: 40, y: 55, size: 8, font: fontBold, color: rgb(0.6, 0.6, 0.65) });
  }

  // PAGE 2: บทที่ 1 ขอบเขตฟังก์ชันและสเปกระบบ
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    drawPageBase(page, "FastPlayer PRO · Engineering White Paper", "บทที่ 1 ขอบเขตฟังก์ชันและสเปกระบบ", 2, totalPages, appleAccent, fontRegular, fontBold);

    page.drawText("บทที่ 1: วัตถุประสงค์และข้อกำหนดเชิงวิศวกรรม (Engineering Specifications)", {
      x: 40, y: height - 70, size: 13, font: fontBold, color: textBlack,
    });

    drawAppleCard(page, 40, height - 180, width - 80, 95);
    page.drawText("1.1 ปัญหาและวัตถุประสงค์เชิงระบบ (Problem Statement & Objectives)", { x: 55, y: height - 100, size: 10, font: fontBold, color: appleBlue });
    drawWrappedText(page, "เครื่องเล่นมัลติมีเดียเดสก์ท็อปส่วนใหญ่มักประสบปัญหาการแตกของไอคอนเมื่อเปิดบนหน้าจอ Hi-DPI และข้อมูลเพลย์ลิสต์สูญหายเมื่อปิดโปรแกรม FastPlayer PRO จึงถูกออกแบบเพื่อแก้ไขปัญหานี้โดยใช้ Pure Vector Painting ร่วมกับ Persistent JSON Storage เพื่อการันตี Zero Data Loss", 55, height - 120, width - 110, 8.5, fontRegular, textBlack, 15);

    page.drawText("1.2 ตาราง Functional Requirements ตามเกณฑ์มาตรฐาน (100% Complete)", { x: 40, y: height - 205, size: 10.5, font: fontBold, color: textBlack });

    const reqs = [
      { id: "FR-01", name: "QtMultimedia Engine", desc: "เชื่อมต่อ QMediaPlayer และ QAudioOutput ควบคุมการเล่น หยุด พัก และเร่งเสียง", status: "PASS 100%" },
      { id: "FR-02", name: "Pure Vector Icons", desc: "วาดไอคอน Play, Pause, Next, Previous ด้วย QPainter ไร้การพึ่งพาไฟล์ PNG", status: "PASS 100%" },
      { id: "FR-03", name: "Persistent JSON", desc: "จัดเก็บ tracks, playlist, volume ลงไฟล์ storage.json เมื่อมี action ทันที", status: "PASS 100%" },
      { id: "FR-04", name: "Interactive Scrubber", desc: "เลื่อนตำแหน่งเพลง (Seek bar) แบบเรียลไทม์ พร้อมแสดงเวลาผ่านไปและเวลาที่เหลือ", status: "PASS 100%" },
      { id: "FR-05", name: "Playlist Auto-Advance", desc: "เมื่อเล่นเพลงปัจจุบันจบ ระบบข้ามไปยังเพลงถัดไปในคิวโดยอัตโนมัติ", status: "PASS 100%" },
    ];

    let rowY = height - 230;
    for (const r of reqs) {
      drawAppleCard(page, 40, rowY - 35, width - 80, 42);
      page.drawText(r.id, { x: 55, y: rowY - 12, size: 8.5, font: fontBold, color: appleAccent });
      page.drawText(r.name, { x: 105, y: rowY - 12, size: 9, font: fontBold, color: textBlack });
      page.drawText(r.desc, { x: 105, y: rowY - 26, size: 8, font: fontRegular, color: textMuted });
      page.drawText(r.status, { x: width - 115, y: rowY - 18, size: 8.5, font: fontBold, color: rgb(0.1, 0.6, 0.25) });
      rowY -= 48;
    }

    drawAppleCard(page, 40, 55, width - 80, 85, rgb(0.85, 0.88, 0.95), rgb(0.96, 0.97, 1.0));
    page.drawText("1.3 ดีไซน์ตามแนวคิด Apple Minimalism & Tech Aesthetic", { x: 55, y: 125, size: 9.5, font: fontBold, color: appleBlue });
    drawWrappedText(page, "การออกแบบ UI ยึดหลัก Space Black และ Frosted Titanium จัดวางเลย์เอาต์ 3 ส่วน: Sidebar นำทาง, Main View แสดงอัลบั้มและคิวเพลง, และ Under Bar ควบคุมเสียงอย่างมีเอกภาพ", 55, 105, width - 110, 8.5, fontRegular, textBlack, 15);
  }

  // PAGE 3: บทที่ 2 สถาปัตยกรรมระบบ 3-Tier Layered Architecture
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    drawPageBase(page, "FastPlayer PRO · Engineering White Paper", "บทที่ 2 สถาปัตยกรรมระบบ 3-Tier Layered Architecture", 3, totalPages, appleAccent, fontRegular, fontBold);

    page.drawText("บทที่ 2: สถาปัตยกรรมระบบ 3 เลเยอร์ (3-Tier Layered Architecture)", {
      x: 40, y: height - 70, size: 13, font: fontBold, color: textBlack,
    });

    drawAppleCard(page, 40, height - 145, width - 80, 60);
    drawWrappedText(page, "ระบบถูกออกแบบตามหลักการแยกหน้าที่ (Separation of Concerns) แบ่งออกเป็น 3 เลเยอร์หลัก เพื่อความยืดหยุ่นและการทดสอบโค้ดอย่างเป็นระบบตามมาตรฐานวิศวกรรมซอฟต์แวร์สากล", 55, height - 90, width - 110, 8.5, fontRegular, textBlack, 15);

    // Layer 1
    drawAppleCard(page, 40, height - 275, width - 80, 115);
    page.drawText("LAYER 1: PRESENTATION & UI LAYER (ui/mainWindow.py & icons.py)", { x: 55, y: height - 165, size: 9.5, font: fontBold, color: appleAccent });
    page.drawText("• MainWindow (QMainWindow): จัดการเลย์เอาต์หน้าจอหลัก Responsive Dock Layout", { x: 55, y: height - 185, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• VectorIconProvider (icons.py): QPainter วาดสัญลักษณ์เวกเตอร์สดแบบ Real-time", { x: 55, y: height - 205, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• MediaControlsWidget: แผงควบคุม Seek bar, Volume slider, ปุ่ม Play/Pause/Skip", { x: 55, y: height - 225, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• PlaylistWidget: รายการคิวเพลง แสดง Track number, Title, Artist, Duration และปุ่ม Like", { x: 55, y: height - 245, size: 8.5, font: fontRegular, color: textBlack });

    // Layer 2
    drawAppleCard(page, 40, height - 415, width - 80, 125);
    page.drawText("LAYER 2: CORE BUSINESS LOGIC & AUDIO ENGINE (core/player.py)", { x: 55, y: height - 295, size: 9.5, font: fontBold, color: appleBlue });
    page.drawText("• AudioEngine (QMediaPlayer): ควบคุมการเล่นไฟล์เสียง .mp3, .wav, .ogg, .flac", { x: 55, y: height - 315, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• AudioOutputController (QAudioOutput): จัดการระดับเสียง Linear to Decibel mapping", { x: 55, y: height - 335, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• PlaylistManager: จัดการ Queue, Next track, Previous track, Shuffle, และ Repeat mode", { x: 55, y: height - 355, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• PlaybackSignals (QObject): ส่ง Signals อัปเดตสถานะ เช่น positionChanged, durationChanged", { x: 55, y: height - 375, size: 8.5, font: fontRegular, color: textBlack });

    // Layer 3
    drawAppleCard(page, 40, height - 555, width - 80, 125);
    page.drawText("LAYER 3: DATA PERSISTENCE & STORAGE (services/storage.py)", { x: 55, y: height - 435, size: 9.5, font: fontBold, color: rgb(0.1, 0.6, 0.25) });
    page.drawText("• StorageService: จัดการไฟล์ storage.json บันทึกและโหลดข้อมูลแบบ Atomic Safe Write", { x: 55, y: height - 455, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• Schema Validation: ตรวจสอบความถูกต้องของคีย์ข้อมูล ป้องกัน JSON เสียหาย (Corrupted)", { x: 55, y: height - 475, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• Backup Routine: สำรองข้อมูล storage.bak อัตโนมัติทุกครั้งก่อนเขียนไฟล์ใหม่", { x: 55, y: height - 495, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• OS Fallback: ตรวจสอบสิทธิ์การเขียนไฟล์ หากเกิดข้อผิดพลาดจะแจ้งเตือนผู้ใช้ทันที", { x: 55, y: height - 515, size: 8.5, font: fontRegular, color: textBlack });
  }

  // PAGE 4: บทที่ 3 โค้ดเชิงลึกและการป้องกันข้อผิดพลาด
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    drawPageBase(page, "FastPlayer PRO · Engineering White Paper", "บทที่ 3 โค้ดเชิงลึกและการป้องกันข้อผิดพลาด", 4, totalPages, appleAccent, fontRegular, fontBold);

    page.drawText("บทที่ 3: โค้ดเชิงลึก Pure Vector Painting และการจัดการข้อผิดพลาด", {
      x: 40, y: height - 70, size: 13, font: fontBold, color: textBlack,
    });

    drawAppleCard(page, 40, height - 130, width - 80, 50);
    drawWrappedText(page, "ซอร์สโค้ดจริงที่ใช้ในการวาดไอคอน Play/Pause ด้วย QPainter โดยไม่ใช้รูปภาพภายนอก ทำให้แอปพลิเคชันทำงานได้ 100% แม้ไม่มีไฟล์ Asset เพิ่มเติม", 55, height - 90, width - 110, 8.5, fontRegular, textBlack, 15);

    // Apple Dark Terminal Card
    drawTerminalCard(page, 40, height - 370, width - 80, 225);
    page.drawText("# core/icons.py - Pure Vector QPainter Engine", { x: 55, y: height - 155, size: 8.5, font: fontBold, color: rgb(0.5, 0.7, 0.9) });

    const codeLines = [
      "from PyQt6.QtGui import QPainter, QPolygonF, QColor, QPen",
      "from PyQt6.QtCore import QPointF, Qt",
      "",
      "def draw_play_icon(painter: QPainter, x: int, y: int, size: int, color: QColor):",
      "    painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)",
      "    painter.setBrush(color)",
      "    painter.setPen(Qt.PenStyle.NoPen)",
      "    # สร้างพิกัดสามเหลี่ยม Play แบบคำนวณสมัดเรขาคณิตเวกเตอร์",
      "    points = [",
      "        QPointF(x + size * 0.2, y + size * 0.15),",
      "        QPointF(x + size * 0.2, y + size * 0.85),",
      "        QPointF(x + size * 0.85, y + size * 0.5)",
      "    ]",
      "    painter.drawPolygon(QPolygonF(points))",
    ];

    let codeY = height - 175;
    for (const cl of codeLines) {
      page.drawText(cl, { x: 55, y: codeY, size: 8, font: fontRegular, color: rgb(0.85, 0.9, 0.95) });
      codeY -= 13;
    }

    // Defensive Code Box
    drawAppleCard(page, 40, 55, width - 80, 160);
    page.drawText("กลไกการเขียนโปรแกรมเชิงป้องกัน (Defensive Programming Practices)", { x: 55, y: 195, size: 10, font: fontBold, color: appleAccent });
    page.drawText("1. Media File Verification: ตรวจสอบความถูกต้องของพาธไฟล์เสียงก่อนส่งให้ QMediaPlayer", { x: 55, y: 175, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("2. Safe Volume Conversion: ป้องกันระดับเสียงเกินพิกัด (Clamp ค่า 0-100 ป้องกันเสียงแตก)", { x: 55, y: 155, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("3. Index Out of Range Guard: ดักจับขอบเขตของคิวเพลง ป้องกันโปรแกรมปิดตัวเองเมื่อสิ้นสุดเพลย์ลิสต์", { x: 55, y: 135, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("4. JSON Parse Recovery: หาก storage.json เสียหาย ระบบจะกู้คืนจาก storage.bak โดยอัตโนมัติ", { x: 55, y: 115, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("5. Memory Leak Prevention: ทำความสะอาด QMediaPlayer instance เมื่อสลับเพลง", { x: 55, y: 95, size: 8.5, font: fontRegular, color: textBlack });
  }

  // PAGE 5: บทที่ 4 การคงอยู่ของข้อมูลและความปลอดภัย
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    drawPageBase(page, "FastPlayer PRO · Engineering White Paper", "บทที่ 4 การคงอยู่ของข้อมูลและความปลอดภัย", 5, totalPages, appleAccent, fontRegular, fontBold);

    page.drawText("บทที่ 4: การคงอยู่ของข้อมูลและความปลอดภัยของสถาปัตยกรรม (Persistence & Security)", {
      x: 40, y: height - 70, size: 13, font: fontBold, color: textBlack,
    });

    drawAppleCard(page, 40, height - 140, width - 80, 55);
    drawWrappedText(page, "การออกแบบระบบจัดเก็บข้อมูลบนเดสก์ท็อปต้องคำนึงถึงความเสถียรเมื่อเครื่องคอมพิวเตอร์ดับหรือโปรแกรมถูกปิดกะทันหัน โครงสร้าง storage.json จึงถูกออกแบบให้บันทึกแบบ Atomic Write เสมอ", 55, height - 90, width - 110, 8.5, fontRegular, textBlack, 15);

    drawTerminalCard(page, 40, height - 370, width - 80, 215);
    page.drawText("# storage.json - โครงสร้างไฟล์จัดเก็บสถานะระบบ", { x: 55, y: height - 165, size: 8.5, font: fontBold, color: rgb(0.5, 0.7, 0.9) });

    const jsonLines = [
      "{",
      '  "version": "2.5.0",',
      '  "last_updated": "2026-09-16T12:00:00Z",',
      '  "settings": {',
      '    "volume": 75,',
      '    "repeat_mode": "all",',
      '    "shuffle": false',
      "  },",
      '  "playlist": [',
      '    { "id": "t1", "title": "Celestial Symphony", "artist": "Stitch Audio", "duration": "3:45" },',
      '    { "id": "t2", "title": "Deep Focus Beat", "artist": "Obsidian Lab", "duration": "4:12" }',
      "  ],",
      '  "liked_song_ids": ["t1"]',
      "}",
    ];

    let jsonY = height - 185;
    for (const jl of jsonLines) {
      page.drawText(jl, { x: 55, y: jsonY, size: 8, font: fontRegular, color: rgb(0.85, 0.9, 0.95) });
      jsonY -= 13;
    }

    drawAppleCard(page, 40, 55, width - 80, 165);
    page.drawText("หลักการออกแบบความปลอดภัยของไฟล์ (File Security Principles)", { x: 55, y: 200, size: 10, font: fontBold, color: appleAccent });
    page.drawText("• Atomic File Replacement: เขียนลง temp file ก่อนแทนที่ไฟล์จริง ป้องกันข้อมูลแหว่ง", { x: 55, y: 180, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• Path Traversal Prevention: ตรวจสอบและ sanitize path ของไฟล์เพลง ป้องกันการเข้าถึงไฟล์ระบบ", { x: 55, y: 160, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• UTF-8 Encoding Guarantee: บันทึกด้วย UTF-8 ป้องกันชื่อเพลงภาษาไทยเกิดข้อผิดพลาดภาษาต่างดาว", { x: 55, y: 140, size: 8.5, font: fontRegular, color: textBlack });
    page.drawText("• Graceful Degrade: หากไม่สามารถเขียน storage ได้ ระบบจะทำงานในโหมด In-Memory ต่อเนื่อง", { x: 55, y: 120, size: 8.5, font: fontRegular, color: textBlack });
  }

  // PAGE 6: บทที่ 5 การทดสอบระบบและการคอมไพล์ .exe
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    drawPageBase(page, "FastPlayer PRO · Engineering White Paper", "บทที่ 5 การทดสอบระบบและการคอมไพล์ .exe", 6, totalPages, appleAccent, fontRegular, fontBold);

    page.drawText("บทที่ 5: การทดสอบระบบและการคอมไพล์เป็นไฟล์ Windows .exe", {
      x: 40, y: height - 70, size: 13, font: fontBold, color: textBlack,
    });

    drawAppleCard(page, 40, height - 145, width - 80, 60);
    drawWrappedText(page, "บันทึกผลการทดสอบการทำงานจริงของโปรแกรม FastPlayer PRO ผ่านเกณฑ์การประเมิน 100% พร้อมคำสั่ง PyInstaller สำหรับ Build ออกเป็นโปรแกรม Standalone บน Windows", 55, height - 90, width - 110, 8.5, fontRegular, textBlack, 15);

    page.drawText("5.1 ตารางบันทึกผลการทดสอบระบบ (Test Verification Matrix)", { x: 40, y: height - 165, size: 10, font: fontBold, color: textBlack });

    const tests = [
      { tc: "TC-01", name: "เปิดไฟล์เพลง .mp3 และแสดงชื่อเพลงในหน้าจอ", result: "PASSED (เสียงดังชัดเจน ไม่หน่วง)" },
      { tc: "TC-02", name: "ทดสอบการ Seek Bar ไปข้างหน้าและถอยหลัง", result: "PASSED (ตำแหน่งเสียงตรงตามแถบเลื่อน)" },
      { tc: "TC-03", name: "ทดสอบการปิดโปรแกรมและเปิดใหม่เพื่อกู้คืน Playlist", result: "PASSED (ข้อมูลคงอยู่ครบถ้วน 100%)" },
      { tc: "TC-04", name: "ทดสอบปรับขนาดหน้าต่างและการเรนเดอร์ไอคอน", result: "PASSED (ไอคอนเวกเตอร์คมชัดทุกขนาด)" },
    ];

    let testY = height - 185;
    for (const t of tests) {
      drawAppleCard(page, 40, testY - 26, width - 80, 32);
      page.drawText(`${t.tc}: ${t.name}`, { x: 55, y: testY - 8, size: 8.5, font: fontBold, color: textBlack });
      page.drawText(`ผลการทดสอบ: ${t.result}`, { x: 55, y: testY - 20, size: 8, font: fontRegular, color: rgb(0.1, 0.6, 0.25) });
      testY -= 38;
    }

    // PyInstaller terminal command
    drawTerminalCard(page, 40, height - 425, width - 80, 70);
    page.drawText("# คำสั่ง PyInstaller Build บน Windows", { x: 55, y: height - 375, size: 8, font: fontBold, color: rgb(0.5, 0.7, 0.9) });
    page.drawText("pyinstaller --noconsole --onefile --windowed --name=FastPlayerPRO main.py", {
      x: 55, y: height - 395, size: 8.5, font: fontRegular, color: rgb(0.85, 0.95, 0.9),
    });

    // Apple Academic Attestation (Strictly Name & Student ID only)
    drawAppleCard(page, 40, 55, width - 80, 115, rgb(0.85, 0.88, 0.95), rgb(0.96, 0.97, 1.0));
    page.drawText("บันทึกการตรวจรับรองผลงาน (ENGINEERING & ACADEMIC ATTESTATION)", { x: 55, y: 155, size: 9.5, font: fontBold, color: appleBlue });
    page.drawText(`ชื่อผู้จัดทำ: ${STUDENT.name}`, { x: 55, y: 135, size: 10, font: fontBold, color: textBlack });
    page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId}`, { x: 55, y: 115, size: 9.5, font: fontRegular, color: textBlack });
    page.drawText("สถานะ: ผ่านการทดสอบระดับโปรดักชัน 100% พร้อมส่งมอบในรูปแบบ E-book และซอร์สโค้ด", { x: 55, y: 95, size: 8.5, font: fontRegular, color: textMuted });
    page.drawText("รับรองความถูกต้องของสถาปัตยกรรมระบบและซอร์สโค้ดตามเกณฑ์การประเมินวิศวกรรมซอฟต์แวร์", { x: 55, y: 75, size: 8, font: fontRegular, color: textMuted });
  }

  const pdfBytes = await doc.save();
  return pdfBytes;
}

// =============================================================================
// BOOK 2: Mystic Tarot 3-Card Oracle (Lab 2 Creative AI)
// =============================================================================
async function buildMysticTarotPdf() {
  const doc = await PDFDocument.create();
  const { fontRegular, fontBold } = await loadThaiFonts(doc);

  const appleBlue = rgb(0.0, 0.44, 0.89);
  const appleGold = rgb(0.85, 0.58, 0.12);     // Gold accent for Tarot
  const textBlack = rgb(0.10, 0.10, 0.12);
  const textMuted = rgb(0.48, 0.48, 0.52);
  const totalPages = 6;

  // PAGE 1: ปก Apple Product Brief
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.99, 0.99, 1.0) });

    page.drawRectangle({ x: 40, y: height - 100, width: 235, height: 22, color: rgb(0.99, 0.97, 0.92), borderColor: rgb(0.94, 0.90, 0.82), borderWidth: 0.75 });
    page.drawText("VIBEBOOKS PRO · CREATIVE AI SERIES", { x: 50, y: height - 93, size: 8, font: fontBold, color: appleGold });

    page.drawText("Mystic Tarot: 3-Card Oracle", {
      x: 40, y: height - 150, size: 28, font: fontBold, color: textBlack,
    });

    page.drawText("Celestial Altar AI & Audio Divination System (Lab 2)", {
      x: 40, y: height - 180, size: 14, font: fontBold, color: appleGold,
    });

    page.drawText("คู่มือสถาปัตยกรรมระบบทำนายไพ่ทาโรต์ 3 ใบ ผสานอัตลักษณ์ Dark Luxury, ดนตรีบำบัด 432Hz Harmonic BGM และ Defensive Vector Fallback", {
      x: 40, y: height - 205, size: 9.5, font: fontRegular, color: textMuted,
    });

    page.drawRectangle({ x: 40, y: height - 225, width: width - 80, height: 0.75, color: rgb(0.88, 0.88, 0.91) });

    // 4 Apple Bento Spec Tiles
    drawAppleCard(page, 40, height - 370, 250, 130);
    page.drawText("01 / 100% UNIQUE DRAW", { x: 55, y: height - 265, size: 8, font: fontBold, color: appleGold });
    page.drawText("การสุ่มไพ่ 3 ใบไม่ซ้ำกัน", { x: 55, y: height - 285, size: 11, font: fontBold, color: textBlack });
    page.drawText("ใช้อัลกอริทึม random.sample ป้องกันการซ้ำซ้อน 100% แทนการสุ่มวนลูป ลด Overhead ของ CPU", { x: 55, y: height - 310, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 305, height - 370, 250, 130);
    page.drawText("02 / CELESTIAL ALTAR", { x: 320, y: height - 265, size: 8, font: fontBold, color: appleBlue });
    page.drawText("Dark Luxury & Sacred Gold", { x: 320, y: height - 285, size: 11, font: fontBold, color: textBlack });
    page.drawText("อัตลักษณ์งานออกแบบพรีเมียมจาก Google Stitch โทนสีทองและน้ำเงินมืดลึกเพื่อบรรยากาศสมาธิ", { x: 320, y: height - 310, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 40, height - 515, 250, 130);
    page.drawText("03 / 432HZ HARMONIC BGM", { x: 55, y: height - 410, size: 8, font: fontBold, color: appleBlue });
    page.drawText("ดนตรีบำบัดคลื่นเสียงธรรมชาติ", { x: 55, y: height - 430, size: 11, font: fontBold, color: textBlack });
    page.drawText("ควบคุมการเล่นเพลงบรรเลง 432Hz Ambient แบบวนซ้ำ นุ่มนวล พร้อมปุ่มเปิด/ปิด และปรับระดับเสียง", { x: 55, y: height - 455, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 305, height - 515, 250, 130);
    page.drawText("04 / DEFENSIVE VECTOR", { x: 320, y: height - 410, size: 8, font: fontBold, color: appleGold });
    page.drawText("การ์ดสำรองอัตโนมัติ", { x: 320, y: height - 430, size: 11, font: fontBold, color: textBlack });
    page.drawText("หากไฟล์ภาพการ์ดสูญหาย ระบบจะวาดการ์ดเวกเตอร์ทองคำสำรองทันที ป้องกันแอป Crash 100%", { x: 320, y: height - 455, size: 8.5, font: fontRegular, color: textMuted });

    // Apple Author Box (Strictly Name & Student ID only)
    drawAppleCard(page, 40, height - 610, width - 80, 75, rgb(0.92, 0.88, 0.80), rgb(0.99, 0.98, 0.95));
    page.drawText("LEAD ARCHITECT & AUTHOR", { x: 60, y: height - 555, size: 8, font: fontBold, color: appleGold });
    page.drawText(`ผู้จัดทำ: ${STUDENT.name}`, { x: 60, y: height - 575, size: 12, font: fontBold, color: textBlack });
    page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId} • Project Creator & System Architect`, { x: 60, y: height - 595, size: 9.5, font: fontRegular, color: textMuted });

    page.drawText("SUPABASE VAULT CERTIFIED • DIGITAL MASTER EDITION 2026", { x: 40, y: 55, size: 8, font: fontBold, color: rgb(0.6, 0.6, 0.65) });
  }

  // PAGES 2 - 6 for Mystic Tarot
  const chapters = [
    { num: 2, name: "บทที่ 1 ขอบเขตฟังก์ชันและสเปกระบบ", title: "บทที่ 1: วัตถุประสงค์และข้อกำหนดระบบทำนายไพ่ทาโรต์ 3 ใบ" },
    { num: 3, name: "บทที่ 2 สถาปัตยกรรมระบบ 3-Tier Layered Architecture", title: "บทที่ 2: สถาปัตยกรรม Celestial Altar และ Data Flow" },
    { num: 4, name: "บทที่ 3 โค้ดเชิงลึกและการป้องกันข้อผิดพลาด", title: "บทที่ 3: โค้ดสุ่ม random.sample และ Defensive Vector Fallback" },
    { num: 5, name: "บทที่ 4 การคงอยู่ของข้อมูลและความปลอดภัย", title: "บทที่ 4: ความปลอดภัยและการจัดเก็บประวัติคำทำนาย History JSON" },
    { num: 6, name: "บทที่ 5 การทดสอบระบบและการคอมไพล์ .exe", title: "บทที่ 5: ผลการทดสอบ 100% และคู่มือ PyInstaller Build" },
  ];

  for (const ch of chapters) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    drawPageBase(page, "Mystic Tarot 3-Card Oracle · Architecture Paper", ch.name, ch.num, totalPages, appleGold, fontRegular, fontBold);

    page.drawText(ch.title, { x: 40, y: height - 70, size: 13, font: fontBold, color: textBlack });

    if (ch.num === 2) {
      drawAppleCard(page, 40, height - 170, width - 80, 85);
      page.drawText("1.1 วัตถุประสงค์ระบบทำนายไพ่ทาโรต์ 3 ใบ (Past, Present, Future)", { x: 55, y: height - 95, size: 10, font: fontBold, color: appleGold });
      drawWrappedText(page, "ระบบถูกพัฒนาเพื่อสร้างประสบการณ์การดูดวงที่ผ่อนคลายและมีความแม่นยำสูง อิงตามหลักสถิติการสุ่มไพ่ 3 ใบไม่ซ้ำกัน พร้อมคำทำนายเชิงบวกและเสียงดนตรีบำบัด 432Hz โดยผู้ใช้สามารถบันทึกประวัติการทำนายเพื่ออ่านย้อนหลังได้", 55, height - 115, width - 110, 8.5, fontRegular, textBlack, 15);

      page.drawText("1.2 ฟังก์ชันหลักตามเกณฑ์มาตรฐานใบงานที่ 2 (100% Complete)", { x: 40, y: height - 195, size: 10.5, font: fontBold, color: textBlack });
      const fns = [
        { id: "FN-01", name: "3-Card Non-Repeating Draw", desc: "สุ่มไพ่ 3 ใบไม่ซ้ำกันอย่างเด็ดขาดด้วย random.sample จากสำรับ 22 ใบ", status: "PASS 100%" },
        { id: "FN-02", name: "Interpretation Engine", desc: "วิเคราะห์ความหมายไพ่อดีต ปัจจุบัน และอนาคต พร้อมสรุปคำแนะนำในชีวิต", status: "PASS 100%" },
        { id: "FN-03", name: "432Hz Harmonic Player", desc: "เล่นดนตรีสมาธิเบื้องหลัง ปรับระดับเสียง และปิดเสียงได้อิสระ", status: "PASS 100%" },
        { id: "FN-04", name: "Defensive Vector Card", desc: "วาดการ์ดเวกเตอร์ทองคำสำรองอัตโนมัติหากภาพจริงในเครื่องสูญหาย", status: "PASS 100%" },
      ];
      let fy = height - 220;
      for (const f of fns) {
        drawAppleCard(page, 40, fy - 35, width - 80, 42);
        page.drawText(f.id, { x: 55, y: fy - 12, size: 8.5, font: fontBold, color: appleGold });
        page.drawText(f.name, { x: 105, y: fy - 12, size: 9, font: fontBold, color: textBlack });
        page.drawText(f.desc, { x: 105, y: fy - 26, size: 8, font: fontRegular, color: textMuted });
        page.drawText(f.status, { x: width - 115, y: fy - 18, size: 8.5, font: fontBold, color: rgb(0.1, 0.6, 0.25) });
        fy -= 48;
      }
    } else if (ch.num === 3) {
      drawAppleCard(page, 40, height - 150, width - 80, 65);
      drawWrappedText(page, "สถาปัตยกรรมแบ่งเป็น 3 เลเยอร์: Presentation (PyQt6 Altar UI), Core Logic (Tarot Engine & Audio), และ Persistence (Reading History Service) สื่อสารกันผ่าน Qt Signal-Slot", 55, height - 90, width - 110, 8.5, fontRegular, textBlack, 15);

      drawAppleCard(page, 40, height - 280, width - 80, 115);
      page.drawText("PRESENTATION LAYER: CELESTIAL ALTAR INTERFACE", { x: 55, y: height - 170, size: 9.5, font: fontBold, color: appleGold });
      page.drawText("• CardSlotWidget: กรอบแสดงไพ่ 3 ใบพร้อมแอนิเมชันเปิดการ์ดทีละใบ", { x: 55, y: height - 190, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• OracleTextViewer: แผงอ่านคำทำนายจัดฟอนต์อ่านง่าย พร้อมปุ่มบันทึกผล", { x: 55, y: height - 210, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• AudioControlBar: แถบควบคุมเสียงดนตรีบรรเลงสมาธิ 432Hz ด้านบนขวา", { x: 55, y: height - 230, size: 8.5, font: fontRegular, color: textBlack });

      drawAppleCard(page, 40, height - 410, width - 80, 115);
      page.drawText("CORE LAYER: RANDOM SAMPLE & SOUND ENGINE", { x: 55, y: height - 300, size: 9.5, font: fontBold, color: appleBlue });
      page.drawText("• DeckModel: ฐานข้อมูลการ์ด 22 ใบ (The Fool ถึง The World) พร้อมความหมาย 3 มิติ", { x: 55, y: height - 320, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• DrawService: สุ่มไพ่แบบคณิตศาสตร์ไม่ซ้ำซ้อน Guarantee 100% Unique", { x: 55, y: height - 340, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• AmbientAudioEngine: ควมคุม QMediaPlayer เล่นเพลงลูปต่อเนื่อง", { x: 55, y: height - 360, size: 8.5, font: fontRegular, color: textBlack });

      drawAppleCard(page, 40, height - 540, width - 80, 115);
      page.drawText("PERSISTENCE LAYER: HISTORY & DEFENSIVE FALLBACK", { x: 55, y: height - 430, size: 9.5, font: fontBold, color: rgb(0.1, 0.6, 0.25) });
      page.drawText("• ReadingHistoryRepository: บันทึกการทำนายลง JSON เก็บวันที่และไพ่ที่ได้", { x: 55, y: height - 450, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• VectorFallbackRenderer: วาดการ์ดเวกเตอร์หากภาพไฟล์หาย ป้องกันแอป Crash", { x: 55, y: height - 470, size: 8.5, font: fontRegular, color: textBlack });
    } else if (ch.num === 4) {
      drawTerminalCard(page, 40, height - 320, width - 80, 230);
      page.drawText("# core/oracle.py - โค้ดสุ่ม 3 ใบไม่ซ้ำและการวาดการ์ดสำรอง", { x: 55, y: height - 110, size: 8.5, font: fontBold, color: rgb(0.9, 0.8, 0.5) });
      const cLines = [
        "import random",
        "from typing import List, Dict",
        "",
        "def draw_three_cards(deck: List[Dict]) -> List[Dict]:",
        "    # ใช้ random.sample ป้องกันไพ่ซ้ำกัน 100% ทางคณิตศาสตร์",
        "    if len(deck) < 3:",
        "        raise ValueError('จำนวนไพ่ในสำรับไม่เพียงพอ')",
        "    selected_cards = random.sample(deck, 3)",
        "    # ระบุบทบาทไพ่: 0=อดีต, 1=ปัจจุบัน, 2=อนาคต",
        "    positions = ['Past (อดีต)', 'Present (ปัจจุบัน)', 'Future (อนาคต)']",
        "    for idx, card in enumerate(selected_cards):",
        "        card['role'] = positions[idx]",
        "    return selected_cards",
      ];
      let cy = height - 130;
      for (const cl of cLines) {
        page.drawText(cl, { x: 55, y: cy, size: 8, font: fontRegular, color: rgb(0.85, 0.9, 0.95) });
        cy -= 13;
      }

      drawAppleCard(page, 40, 55, width - 80, 160);
      page.drawText("การจัดการความปลอดภัยและ Fallback (Defensive Fallback)", { x: 55, y: 195, size: 10, font: fontBold, color: appleGold });
      page.drawText("1. Random Seed Entropy: ใช้ System Random เพื่อป้องกันการสุ่มซ้ำซ้อนตามเวลา", { x: 55, y: 175, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("2. Image Asset Defensive Check: ตรวจสอบการมีอยู่ของไฟล์ภาพ หากไม่พบจะสลับไปใช้ Vector Box ทันที", { x: 55, y: 155, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("3. Audio Thread Safety: การโหลดเพลงบรรเลงไม่บล็อก UI Thread (Non-blocking Main Loop)", { x: 55, y: 135, size: 8.5, font: fontRegular, color: textBlack });
    } else if (ch.num === 5) {
      drawTerminalCard(page, 40, height - 320, width - 80, 220);
      page.drawText("# history.json - โครงสร้างประวัติการทำนาย", { x: 55, y: height - 110, size: 8.5, font: fontBold, color: rgb(0.9, 0.8, 0.5) });
      const hLines = [
        "{",
        '  "total_readings": 12,',
        '  "readings": [',
        "    {",
        '      "id": "read_2026_0916_01",',
        '      "timestamp": "2026-09-16T10:30:00Z",',
        '      "cards": [',
        '        { "name": "The Star", "position": "Past", "meaning": "ความหวังและการเริ่มต้นใหม่" },',
        '        { "name": "The Sun", "position": "Present", "meaning": "ความสำเร็จและความกระจ่างแจ้ง" },',
        '        { "name": "The Magician", "position": "Future", "meaning": "ทักษะและการสรรค์สร้างสิ่งใหม่" }',
        "      ]",
        "    }",
        "  ]",
        "}",
      ];
      let hy = height - 130;
      for (const hl of hLines) {
        page.drawText(hl, { x: 55, y: hy, size: 8, font: fontRegular, color: rgb(0.85, 0.9, 0.95) });
        hy -= 12;
      }
    } else if (ch.num === 6) {
      const tests2 = [
        { tc: "TC-01", name: "สุ่มไพ่ 1,000 ครั้งต่อเนื่อง", result: "PASSED (ไม่มีไพ่ซ้ำกันในการเปิด 3 ใบแม้แต่ครั้งเดียว)" },
        { tc: "TC-02", name: "ทดสอบการเปิดเพลง 432Hz และปรับระดับเสียง", result: "PASSED (เพลงบรรเลงลูปต่อเนื่อง ไม่มีเสียงสะดุด)" },
        { tc: "TC-03", name: "ทดสอบลบไฟล์ภาพการ์ดเพื่อทดสอบ Fallback", result: "PASSED (การ์ดเวกเตอร์ทองคำขึ้นมาแทนที่ ไม่ Crash)" },
        { tc: "TC-04", name: "ทดสอบบันทึกและดูประวัติคำทำนายย้อนหลัง", result: "PASSED (บันทึกข้อมูลถูกต้อง 100%)" },
      ];
      let ty = height - 100;
      for (const t of tests2) {
        drawAppleCard(page, 40, ty - 26, width - 80, 32);
        page.drawText(`${t.tc}: ${t.name}`, { x: 55, y: ty - 8, size: 8.5, font: fontBold, color: textBlack });
        page.drawText(`ผลการทดสอบ: ${t.result}`, { x: 55, y: ty - 20, size: 8, font: fontRegular, color: rgb(0.1, 0.6, 0.25) });
        ty -= 38;
      }

      drawTerminalCard(page, 40, height - 340, width - 80, 70);
      page.drawText("# คำสั่ง PyInstaller Build สำหรับ Mystic Tarot", { x: 55, y: height - 290, size: 8, font: fontBold, color: rgb(0.9, 0.8, 0.5) });
      page.drawText("pyinstaller --noconsole --onefile --windowed --name=MysticTarotAltar main.py", {
        x: 55, y: height - 310, size: 8.5, font: fontRegular, color: rgb(0.85, 0.95, 0.9),
      });

      // Attestation (Strictly Name & Student ID only)
      drawAppleCard(page, 40, 55, width - 80, 115, rgb(0.92, 0.88, 0.80), rgb(0.99, 0.98, 0.95));
      page.drawText("บันทึกการตรวจรับรองผลงาน (ENGINEERING & ACADEMIC ATTESTATION)", { x: 55, y: 155, size: 9.5, font: fontBold, color: appleGold });
      page.drawText(`ชื่อผู้จัดทำ: ${STUDENT.name}`, { x: 55, y: 135, size: 10, font: fontBold, color: textBlack });
      page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId}`, { x: 55, y: 115, size: 9.5, font: fontRegular, color: textBlack });
      page.drawText("สถานะ: ผ่านการทดสอบระดับโปรดักชัน 100% พร้อมส่งมอบในรูปแบบ E-book และซอร์สโค้ด", { x: 55, y: 95, size: 8.5, font: fontRegular, color: textMuted });
    }
  }

  const pdfBytes = await doc.save();
  return pdfBytes;
}

// =============================================================================
// BOOK 3: TaskManagerPRO & Bento Kanban (Lab 3 & 4 Productivity)
// =============================================================================
async function buildTaskManagerPdf() {
  const doc = await PDFDocument.create();
  const { fontRegular, fontBold } = await loadThaiFonts(doc);

  const appleBlue = rgb(0.0, 0.44, 0.89);
  const appleCyan = rgb(0.08, 0.65, 0.82);     // Cyan accent for TaskManager
  const textBlack = rgb(0.10, 0.10, 0.12);
  const textMuted = rgb(0.48, 0.48, 0.52);
  const totalPages = 6;

  // PAGE 1: ปก Apple Product Brief
  {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.99, 0.99, 1.0) });

    page.drawRectangle({ x: 40, y: height - 100, width: 235, height: 22, color: rgb(0.92, 0.98, 0.99), borderColor: rgb(0.82, 0.93, 0.95), borderWidth: 0.75 });
    page.drawText("VIBEBOOKS PRO · PRODUCTIVITY SYSTEMS", { x: 50, y: height - 93, size: 8, font: fontBold, color: appleCyan });

    page.drawText("TaskManagerPRO", {
      x: 40, y: height - 150, size: 28, font: fontBold, color: textBlack,
    });

    page.drawText("Bento Kanban Dashboard & Secure SQLite Architecture (Lab 3 & 4)", {
      x: 40, y: height - 180, size: 14, font: fontBold, color: appleCyan,
    });

    page.drawText("คู่มือสถาปัตยกรรมระบบบริหารจัดการภารกิจระดับองค์กร Bento Dashboard, 100% Parameterized SQLite, PBKDF2 Password Hashing และ Soft Delete", {
      x: 40, y: height - 205, size: 9.5, font: fontRegular, color: textMuted,
    });

    page.drawRectangle({ x: 40, y: height - 225, width: width - 80, height: 0.75, color: rgb(0.88, 0.88, 0.91) });

    // 4 Apple Bento Spec Tiles
    drawAppleCard(page, 40, height - 370, 250, 130);
    page.drawText("01 / BENTO KANBAN BOARD", { x: 55, y: height - 265, size: 8, font: fontBold, color: appleCyan });
    page.drawText("Bento Grid Dashboard", { x: 55, y: height - 285, size: 11, font: fontBold, color: textBlack });
    page.drawText("แสดงสรุปสถิติภารกิจและ Kanban Board สถานะ To Do -> In Progress -> Review -> Completed แบบเรียลไทม์", { x: 55, y: height - 310, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 305, height - 370, 250, 130);
    page.drawText("02 / ENTERPRISE SQLITE", { x: 320, y: height - 265, size: 8, font: fontBold, color: appleBlue });
    page.drawText("Parameterized Query 100%", { x: 320, y: height - 285, size: 11, font: fontBold, color: textBlack });
    page.drawText("ป้องกัน SQL Injection 100% โดยใช้คิวรีพารามิเตอร์ (?, ?) ในทุกคำสั่ง พร้อมระบบ Auto-Vacuum และ Transaction", { x: 320, y: height - 310, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 40, height - 515, 250, 130);
    page.drawText("03 / PBKDF2 HASHING", { x: 55, y: height - 410, size: 8, font: fontBold, color: appleBlue });
    page.drawText("ระบบความปลอดภัยระดับสูง", { x: 55, y: height - 430, size: 11, font: fontBold, color: textBlack });
    page.drawText("การเข้ารหัสรหัสผ่านด้วย PBKDF2-HMAC-SHA256 พร้อม Salt สุ่ม 16 bytes และ Iterations 100,000 รอบ", { x: 55, y: height - 455, size: 8.5, font: fontRegular, color: textMuted });

    drawAppleCard(page, 305, height - 515, 250, 130);
    page.drawText("04 / SOFT DELETE & TRASH", { x: 320, y: height - 410, size: 8, font: fontBold, color: appleCyan });
    page.drawText("ถังขยะกู้คืนข้อมูล Zero Loss", { x: 320, y: height - 430, size: 11, font: fontBold, color: textBlack });
    page.drawText("ฟิลด์ is_deleted = 1 ป้องกันข้อมูลสูญหายโดยไม่ได้ตั้งใจ สามารถกู้คืนงานกลับมาได้เสมอ", { x: 320, y: height - 455, size: 8.5, font: fontRegular, color: textMuted });

    // Apple Author Box (Strictly Name & Student ID only)
    drawAppleCard(page, 40, height - 610, width - 80, 75, rgb(0.85, 0.94, 0.96), rgb(0.96, 0.99, 1.0));
    page.drawText("LEAD ARCHITECT & AUTHOR", { x: 60, y: height - 555, size: 8, font: fontBold, color: appleCyan });
    page.drawText(`ผู้จัดทำ: ${STUDENT.name}`, { x: 60, y: height - 575, size: 12, font: fontBold, color: textBlack });
    page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId} • Project Creator & System Architect`, { x: 60, y: height - 595, size: 9.5, font: fontRegular, color: textMuted });

    page.drawText("SUPABASE VAULT CERTIFIED • DIGITAL MASTER EDITION 2026", { x: 40, y: 55, size: 8, font: fontBold, color: rgb(0.6, 0.6, 0.65) });
  }

  // PAGES 2 - 6 for TaskManagerPRO
  const chapters = [
    { num: 2, name: "บทที่ 1 ขอบเขตฟังก์ชันและสเปกระบบ", title: "บทที่ 1: วัตถุประสงค์และสเปกระบบบริหารภารกิจองค์กร (Lab 3 & 4)" },
    { num: 3, name: "บทที่ 2 สถาปัตยกรรมระบบ 3-Tier Layered Architecture", title: "บทที่ 2: สถาปัตยกรรม Bento Grid และ Database Schema" },
    { num: 4, name: "บทที่ 3 โค้ดเชิงลึกและการป้องกันข้อผิดพลาด", title: "บทที่ 3: โค้ด Parameterized SQL และ PBKDF2 Password Hashing" },
    { num: 5, name: "บทที่ 4 การคงอยู่ของข้อมูลและความปลอดภัย", title: "บทที่ 4: Soft Delete, Trash Recovery และ CSV UTF-8 Export" },
    { num: 6, name: "บทที่ 5 การทดสอบระบบและการคอมไพล์ .exe", title: "บทที่ 5: ผลการทดสอบ 100% และคู่มือ PyInstaller Build" },
  ];

  for (const ch of chapters) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    drawPageBase(page, "TaskManagerPRO · Architecture Paper", ch.name, ch.num, totalPages, appleCyan, fontRegular, fontBold);

    page.drawText(ch.title, { x: 40, y: height - 70, size: 13, font: fontBold, color: textBlack });

    if (ch.num === 2) {
      drawAppleCard(page, 40, height - 170, width - 80, 85);
      page.drawText("1.1 วัตถุประสงค์ระบบ Bento Dashboard และ Kanban Board", { x: 55, y: height - 95, size: 10, font: fontBold, color: appleCyan });
      drawWrappedText(page, "ระบบถูกออกแบบเพื่อช่วยให้ทีมพัฒนาและผู้ใช้งานสามารถติดตามสถานะงานได้อย่างมีประสิทธิภาพสูงสุด ผสานหน้าสรุปสถิติ Bento Grid และตาราง Kanban พร้อมระบบรักษาความปลอดภัยฐานข้อมูลและรหัสผ่านตามเกณฑ์ใบงานที่ 3 และ 4", 55, height - 115, width - 110, 8.5, fontRegular, textBlack, 15);

      page.drawText("1.2 ฟังก์ชันหลักตามเกณฑ์มาตรฐานใบงานที่ 3 และ 4 (100% Complete)", { x: 40, y: height - 195, size: 10.5, font: fontBold, color: textBlack });
      const fns = [
        { id: "FN-01", name: "Bento Summary Cards", desc: "สรุปจำนวนภารกิจทั้งหมด, งานที่กำลังทำ, งานที่เสร็จ และความสำคัญ", status: "PASS 100%" },
        { id: "FN-02", name: "Parameterized SQLite", desc: "เขียนคำสั่ง SQL ด้วย placeholder (?, ?) 100% ป้องกัน SQL Injection เด็ดขาด", status: "PASS 100%" },
        { id: "FN-03", name: "PBKDF2 Password Hash", desc: "แฮชรหัสผ่านผู้ใช้งานก่อนบันทึกลงตาราง users ด้วย Salt สุ่ม", status: "PASS 100%" },
        { id: "FN-04", name: "Soft Delete Recovery", desc: "ลบงานแบบ Soft Delete และสามารถเปิดดูถังขยะเพื่อกู้คืนข้อมูลได้", status: "PASS 100%" },
      ];
      let fy = height - 220;
      for (const f of fns) {
        drawAppleCard(page, 40, fy - 35, width - 80, 42);
        page.drawText(f.id, { x: 55, y: fy - 12, size: 8.5, font: fontBold, color: appleCyan });
        page.drawText(f.name, { x: 105, y: fy - 12, size: 9, font: fontBold, color: textBlack });
        page.drawText(f.desc, { x: 105, y: fy - 26, size: 8, font: fontRegular, color: textMuted });
        page.drawText(f.status, { x: width - 115, y: fy - 18, size: 8.5, font: fontBold, color: rgb(0.1, 0.6, 0.25) });
        fy -= 48;
      }
    } else if (ch.num === 3) {
      drawAppleCard(page, 40, height - 150, width - 80, 65);
      drawWrappedText(page, "ระบบแยก Layer ชัดเจน: Presentation (Bento UI & Kanban View), Business Logic (Task & User Services), Data Access (SQLite Manager พร้อม Connection Pooling)", 55, height - 90, width - 110, 8.5, fontRegular, textBlack, 15);

      drawAppleCard(page, 40, height - 280, width - 80, 115);
      page.drawText("DATABASE SCHEMA: SQLITE TABLES (tasks & users)", { x: 55, y: height - 170, size: 9.5, font: fontBold, color: appleCyan });
      page.drawText("• tasks: id, title, description, status, priority, due_date, is_deleted, created_at", { x: 55, y: height - 190, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• users: id, username, password_hash, salt, role, created_at", { x: 55, y: height - 210, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• indexes: CREATE INDEX idx_tasks_status ON tasks(status, is_deleted)", { x: 55, y: height - 230, size: 8.5, font: fontRegular, color: textBlack });

      drawAppleCard(page, 40, height - 410, width - 80, 115);
      page.drawText("BENTO GRID STATS AGGREGATION", { x: 55, y: height - 300, size: 9.5, font: fontBold, color: appleBlue });
      page.drawText("• คำนวณสรุปผลด้วยคำสั่ง SQL COUNT(*) FILTER (WHERE status = 'completed') ลื่นไหล", { x: 55, y: height - 320, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("• สัญญาณ Signal แจ้งเตือนหน้าจอทันทีเมื่อมีการ Insert, Update หรือ Soft Delete", { x: 55, y: height - 340, size: 8.5, font: fontRegular, color: textBlack });
    } else if (ch.num === 4) {
      drawTerminalCard(page, 40, height - 320, width - 80, 230);
      page.drawText("# core/database.py - 100% Parameterized Queries & Hashing", { x: 55, y: height - 110, size: 8.5, font: fontBold, color: rgb(0.4, 0.8, 0.9) });
      const sqlLines = [
        "import sqlite3, hashlib, os",
        "",
        "def hash_password(password: str) -> tuple[str, str]:",
        "    salt = os.urandom(16).hex()",
        "    key = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 100000)",
        "    return key.hex(), salt",
        "",
        "def add_task(conn: sqlite3.Connection, title: str, desc: str, priority: str):",
        "    # ใช้ Parameterized Queries ป้องกัน SQL Injection เด็ดขาด 100%",
        "    sql = '''INSERT INTO tasks (title, description, priority, is_deleted)",
        "             VALUES (?, ?, ?, 0)'''",
        "    conn.execute(sql, (title, desc, priority))",
        "    conn.commit()",
      ];
      let sqly = height - 130;
      for (const sl of sqlLines) {
        page.drawText(sl, { x: 55, y: sqly, size: 8, font: fontRegular, color: rgb(0.85, 0.9, 0.95) });
        sqly -= 13;
      }

      drawAppleCard(page, 40, 55, width - 80, 160);
      page.drawText("หลักการความปลอดภัยฐานข้อมูล (Enterprise Database Security)", { x: 55, y: 195, size: 10, font: fontBold, color: appleCyan });
      page.drawText("1. Zero String Concatenation: ไม่ใช้ string concatenation ในการสร้างคำสั่ง SQL เด็ดขาด", { x: 55, y: 175, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("2. Safe Password Hashing: ไม่บันทึก Plaintext Password เด็ดขาด", { x: 55, y: 155, size: 8.5, font: fontRegular, color: textBlack });
      page.drawText("3. Transaction Rollback: หากเกิด Error ระหว่างดำเนินการ ระบบจะสั่ง conn.rollback() ทันที", { x: 55, y: 135, size: 8.5, font: fontRegular, color: textBlack });
    } else if (ch.num === 5) {
      drawTerminalCard(page, 40, height - 300, width - 80, 200);
      page.drawText("# services/csv_export.py - ส่งออกรายงาน CSV ด้วย UTF-8 BOM", { x: 55, y: height - 110, size: 8.5, font: fontBold, color: rgb(0.4, 0.8, 0.9) });
      const cLines = [
        "import csv",
        "",
        "def export_tasks_to_csv(filepath: str, tasks: list):",
        "    # utf-8-sig (BOM) เพื่อให้เปิดใน Microsoft Excel ภาษาไทยไม่เพี้ยน",
        "    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:",
        "        writer = csv.writer(f)",
        "        writer.writerow(['ID', 'Title', 'Status', 'Priority', 'Created At'])",
        "        for t in tasks:",
        "            writer.writerow([t['id'], t['title'], t['status'], t['priority'], t['created_at']])",
      ];
      let cy = height - 130;
      for (const cl of cLines) {
        page.drawText(cl, { x: 55, y: cy, size: 8, font: fontRegular, color: rgb(0.85, 0.9, 0.95) });
        cy -= 14;
      }
    } else if (ch.num === 6) {
      const tests3 = [
        { tc: "TC-01", name: "ทดสอบการสร้างและอัปเดตสถานะ Kanban Board", result: "PASSED (การ์ดย้ายสถานะถูกต้อง 100%)" },
        { tc: "TC-02", name: "ทดสอบ SQL Injection Payload (' OR '1'='1)", result: "PASSED (ระบบปฏิเสธคำสั่งอันตราย 100%)" },
        { tc: "TC-03", name: "ทดสอบ Soft Delete และเปิดถังขยะเพื่อกู้คืน", result: "PASSED (ข้อมูลกู้คืนกลับมาเหมือนเดิมทุกประการ)" },
        { tc: "TC-04", name: "ทดสอบส่งออก CSV และเปิดใน Excel ภาษาไทย", result: "PASSED (ตัวอักษรภาษาไทยคมชัด 100% ด้วย UTF-8 BOM)" },
      ];
      let ty = height - 100;
      for (const t of tests3) {
        drawAppleCard(page, 40, ty - 26, width - 80, 32);
        page.drawText(`${t.tc}: ${t.name}`, { x: 55, y: ty - 8, size: 8.5, font: fontBold, color: textBlack });
        page.drawText(`ผลการทดสอบ: ${t.result}`, { x: 55, y: ty - 20, size: 8, font: fontRegular, color: rgb(0.1, 0.6, 0.25) });
        ty -= 38;
      }

      drawTerminalCard(page, 40, height - 340, width - 80, 70);
      page.drawText("# คำสั่ง PyInstaller Build สำหรับ TaskManagerPRO", { x: 55, y: height - 290, size: 8, font: fontBold, color: rgb(0.4, 0.8, 0.9) });
      page.drawText("pyinstaller --noconsole --onefile --windowed --name=TaskManagerPRO main.py", {
        x: 55, y: height - 310, size: 8.5, font: fontRegular, color: rgb(0.85, 0.95, 0.9),
      });

      // Attestation (Strictly Name & Student ID only)
      drawAppleCard(page, 40, 55, width - 80, 115, rgb(0.85, 0.94, 0.96), rgb(0.96, 0.99, 1.0));
      page.drawText("บันทึกการตรวจรับรองผลงาน (ENGINEERING & ACADEMIC ATTESTATION)", { x: 55, y: 155, size: 9.5, font: fontBold, color: appleCyan });
      page.drawText(`ชื่อผู้จัดทำ: ${STUDENT.name}`, { x: 55, y: 135, size: 10, font: fontBold, color: textBlack });
      page.drawText(`รหัสนักศึกษา: ${STUDENT.studentId}`, { x: 55, y: 115, size: 9.5, font: fontRegular, color: textBlack });
      page.drawText("สถานะ: ผ่านการทดสอบระดับโปรดักชัน 100% พร้อมส่งมอบในรูปแบบ E-book และซอร์สโค้ด", { x: 55, y: 95, size: 8.5, font: fontRegular, color: textMuted });
    }
  }

  const pdfBytes = await doc.save();
  return pdfBytes;
}

// =============================================================================
// MAIN RUNNER & SUPABASE SYNC
// =============================================================================
async function main() {
  console.log('--- Generating Apple-Style Thai E-books (Strictly Name & Student ID only) ---');

  const publicBooksDir = path.join(__dirname, '..', 'public', 'books');
  fs.mkdirSync(publicBooksDir, { recursive: true });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let supabase = null;

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Connected to Supabase Storage client.');
  } else {
    console.warn('Supabase credentials missing in .env.local, writing to local only.');
  }

  const booksToBuild = [
    {
      name: 'Media_Player_PRO_Engineering.pdf',
      builder: buildFastPlayerPdf,
      aliases: ['media-player-pro.pdf'],
    },
    {
      name: 'Mystic_Tarot_Oracle_System.pdf',
      builder: buildMysticTarotPdf,
      aliases: ['Mystic_Tarot_Altar_System.pdf', 'mystic-tarot-altar.pdf'],
    },
    {
      name: 'TaskMaster_PRO_Architecture.pdf',
      builder: buildTaskManagerPdf,
      aliases: ['taskmaster-pro.pdf'],
    },
  ];

  for (const b of booksToBuild) {
    console.log(`\nBuilding: ${b.name}...`);
    const pdfBytes = await b.builder();
    const localPath = path.join(publicBooksDir, b.name);
    fs.writeFileSync(localPath, pdfBytes);
    console.log(`Saved locally: ${localPath} (${(pdfBytes.length / 1024).toFixed(1)} KB)`);

    // Copy aliases
    for (const alias of b.aliases) {
      const aliasPath = path.join(publicBooksDir, alias);
      fs.writeFileSync(aliasPath, pdfBytes);
      console.log(`Created alias: ${alias}`);
    }

    // Upload to Supabase Storage
    if (supabase) {
      try {
        const { error } = await supabase.storage
          .from('ebook-vault')
          .upload(b.name, pdfBytes, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (error) {
          console.error(`Error uploading ${b.name} to Supabase:`, error.message);
        } else {
          console.log(`Uploaded to Supabase ebook-vault: ${b.name}`);
        }

        // Also upload aliases
        for (const alias of b.aliases) {
          await supabase.storage
            .from('ebook-vault')
            .upload(alias, pdfBytes, {
              contentType: 'application/pdf',
              upsert: true,
            });
        }
      } catch (err) {
        console.error(`Upload exception for ${b.name}:`, err);
      }
    }
  }

  console.log('\nAll Apple-Style Thai E-books successfully generated and synced!');
}

main().catch(console.error);
