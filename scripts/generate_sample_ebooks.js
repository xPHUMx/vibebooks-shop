const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createEbook(title, subtitle, lab, category, filename) {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Page 1: Cover Page
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Dark obsidian background
  page1.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.08, 0.07, 0.12),
  });

  // Top header accent line
  page1.drawRectangle({
    x: 50,
    y: height - 60,
    width: width - 100,
    height: 3,
    color: rgb(0.55, 0.36, 0.96),
  });

  // Series tag
  page1.drawText(`VIBEBOOKS DIGITAL MASTER EDITION - LAB ${lab}`, {
    x: 50,
    y: height - 100,
    size: 11,
    font: fontBold,
    color: rgb(0.3, 0.84, 0.96),
  });

  // Main Title
  page1.drawText(title, {
    x: 50,
    y: height - 150,
    size: 26,
    font: fontBold,
    color: rgb(0.96, 0.96, 1.0),
  });

  // Subtitle
  page1.drawText(subtitle, {
    x: 50,
    y: height - 185,
    size: 14,
    font: fontRegular,
    color: rgb(0.7, 0.68, 0.82),
  });

  // Central decorative badge
  page1.drawRectangle({
    x: 50,
    y: height - 480,
    width: width - 100,
    height: 250,
    color: rgb(0.12, 0.11, 0.18),
  });

  page1.drawText("TECHNICAL ARCHITECTURE & SPECIFICATION GUIDE", {
    x: 75,
    y: height - 280,
    size: 12,
    font: fontBold,
    color: rgb(0.82, 0.74, 1.0),
  });

  const highlights = [
    "- Systematic Software Design Patterns & Layer Separation",
    "- Production-Ready Implementation Pipelines",
    "- Defensive Programming & High-Security Data Handling",
    "- Full Academic Documentation & Verification Pipeline"
  ];

  let hy = height - 320;
  for (const h of highlights) {
    page1.drawText(h, {
      x: 75,
      y: hy,
      size: 10,
      font: fontRegular,
      color: rgb(0.8, 0.8, 0.88),
    });
    hy -= 25;
  }

  // Author Metadata
  page1.drawText("Author & Lead Developer:", {
    x: 50,
    y: 160,
    size: 11,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.95),
  });

  page1.drawText("Kiatphum Hansrinath (Kiatphum H.)", {
    x: 50,
    y: 140,
    size: 13,
    font: fontBold,
    color: rgb(0.3, 0.84, 0.96),
  });

  page1.drawText("Student ID: 64332110242-2 - Advanced Web & AI Engineering", {
    x: 50,
    y: 120,
    size: 10,
    font: fontRegular,
    color: rgb(0.65, 0.65, 0.75),
  });

  // Footer License
  page1.drawText("CONFIDENTIAL & LICENSED SINGLE-USER COPY - VERIFIED VIBEBOOKS VAULT", {
    x: 50,
    y: 50,
    size: 8,
    font: fontRegular,
    color: rgb(0.45, 0.42, 0.52),
  });

  // Page 2: Table of Contents & Chapter Breakdown
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.08, 0.07, 0.12),
  });

  page2.drawText("TABLE OF CONTENTS & SYNOPSIS", {
    x: 50,
    y: height - 80,
    size: 16,
    font: fontBold,
    color: rgb(0.96, 0.96, 1.0),
  });

  const chapters = [
    "Chapter 1: Executive Summary & Project Requirements",
    "Chapter 2: Core Engineering Architecture & State Management",
    "Chapter 3: API Integration & Data Integrity Protocols",
    "Chapter 4: Security Verification & Supply Chain Safety",
    "Chapter 5: Deployment Strategy (Vercel & Mobile WebViewer)",
    "Chapter 6: Conclusion & Academic Reflection"
  ];

  let cy = height - 140;
  chapters.forEach((ch, idx) => {
    page2.drawText(`${idx + 1}.  ${ch}`, {
      x: 50,
      y: cy,
      size: 11,
      font: fontRegular,
      color: rgb(0.85, 0.85, 0.92),
    });
    cy -= 45;
  });

  const pdfBytes = await pdfDoc.save();

  const outDir = path.join(__dirname, '..', 'public', 'books');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, pdfBytes);
  console.log('Created E-book PDF:', filePath, `(${pdfBytes.length} bytes)`);

  const vaultDir = path.join(__dirname, '..', 'supabase', 'storage_vault_files');
  if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
  fs.writeFileSync(path.join(vaultDir, filename), pdfBytes);
}

async function main() {
  await createEbook(
    "Media Player PRO Engineering",
    "Audio/Video DSP & Streaming Architecture (Lab 1)",
    1,
    "Multimedia",
    "Media_Player_PRO_Engineering.pdf"
  );

  await createEbook(
    "Mystic Tarot Altar System",
    "3D Interactive Tarot & AI Divination (Lab 2)",
    2,
    "Creative AI",
    "Mystic_Tarot_Altar_System.pdf"
  );

  await createEbook(
    "TaskMaster PRO Architecture",
    "Bento Dashboard & Kanban Architecture (Lab 3)",
    3,
    "Productivity",
    "TaskMaster_PRO_Architecture.pdf"
  );

  console.log("All 3 E-book PDFs generated successfully!");
}

main().catch(console.error);
