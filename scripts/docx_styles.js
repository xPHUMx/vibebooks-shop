const {
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  ShadingType,
} = require("docx");
const fs = require("fs");
const path = require("path");

function createHairlineDivider() {
  return new Paragraph({
    spacing: { before: 180, after: 180 },
    border: {
      bottom: { color: "E5E7EB", space: 1, value: "single", size: 6 },
    },
  });
}

function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 32, // 16pt
        font: "TH Sarabun New",
        color: "111827",
      }),
    ],
  });
}

function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 28, // 14pt
        font: "TH Sarabun New",
        color: "0071E3",
      }),
    ],
  });
}

function createBodyParagraph(text, isBold = false) {
  return new Paragraph({
    spacing: { before: 60, after: 100, line: 320 },
    children: [
      new TextRun({
        text,
        bold: isBold,
        size: 24, // 12pt
        font: "TH Sarabun New",
        color: "374151",
      }),
    ],
  });
}

function createCalloutBox(title, items) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: "F9FAFB" },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            left: { style: BorderStyle.SINGLE, size: 16, color: "0071E3" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
          },
          margins: { top: 140, bottom: 140, left: 180, right: 180 },
          children: [
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 24,
                  font: "TH Sarabun New",
                  color: "0071E3",
                }),
              ],
            }),
            ...items.map(
              (it) =>
                new Paragraph({
                  spacing: { before: 40, after: 40, line: 300 },
                  children: [
                    new TextRun({
                      text: "• " + it,
                      size: 22,
                      font: "TH Sarabun New",
                      color: "4B5563",
                    }),
                  ],
                })
            ),
          ],
        }),
      ],
    }),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function createImageBlock(assetsDir, fileName, caption, widthPx = 520, heightPx = 320) {
  const imgPath = path.join(assetsDir, fileName);
  if (!fs.existsSync(imgPath)) {
    return [new Paragraph({ children: [new TextRun(`[Image ${fileName} not found]`)] })];
  }

  const imageBuffer = fs.readFileSync(imgPath);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 80 },
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: { width: widthPx, height: heightPx },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [
        new TextRun({
          text: caption,
          italics: true,
          size: 20,
          font: "TH Sarabun New",
          color: "6B7280",
        }),
      ],
    }),
  ];
}

function createAnnotationTable(items) {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "หมายเลข", bold: true, size: 22, font: "TH Sarabun New", color: "111827" })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 32, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "ส่วนประกอบ / ฟังก์ชัน", bold: true, size: 22, font: "TH Sarabun New", color: "111827" })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "D1D5DB" },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "คำอธิบายเชิงสถาปัตยกรรมและการใช้งาน", bold: true, size: 22, font: "TH Sarabun New", color: "111827" })],
          }),
        ],
      }),
    ],
  });

  const bodyRows = items.map((it, idx) => {
    const bgColor = idx % 2 === 0 ? "FFFFFF" : "F9FAFB";
    return new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: bgColor },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `[${it.num}]`, bold: true, size: 22, font: "TH Sarabun New", color: "0071E3" })],
            }),
          ],
        }),
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: bgColor },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [new TextRun({ text: it.component, bold: true, size: 22, font: "TH Sarabun New", color: "111827" })],
            }),
          ],
        }),
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: bgColor },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [new TextRun({ text: it.description, size: 21, font: "TH Sarabun New", color: "4B5563" })],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

module.exports = {
  createHairlineDivider,
  createHeading1,
  createHeading2,
  createBodyParagraph,
  createCalloutBox,
  createImageBlock,
  createAnnotationTable,
};
