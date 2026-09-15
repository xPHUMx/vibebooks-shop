import { Book } from "@/types";

export const STUDENT_INFO = {
  name: "นายเกียรติภูมิ หารศรีนาถ",
  nameEn: "Kiatphum Hansrinath",
  studentId: "64332110242-2",
  brand: "VibeBooks",
};

export const BOOKS: Book[] = [
  {
    id: "media-player-pro",
    title: "Media Player PRO Engineering",
    subtitle: "Audio/Video DSP & Streaming Architecture",
    series: "Lab 1 Engineering Series",
    labNumber: 1,
    category: "multimedia",
    price: 199,
    originalPrice: 390,
    rating: 4.9,
    ratingCount: 128,
    description: "คู่มือสถาปัตยกรรมระบบเครื่องเล่นสื่อมัลติมีเดียขั้นสูง เจาะลึก Web Audio API, AudioContext DSP, Equalizer 10 แบนด์, Visualizer Spectrum และ Canvas Rendering สำหรับ Production",
    highlights: [
      "สถาปัตยกรรม Low-Latency Audio Streaming Pipeline",
      "การสร้าง Equalizer 10-Band BiquadFilter Node",
      "การ Render Visualizer Spectrum ด้วย HTML5 Canvas",
      "ระบบ Playlist State Management & Defensive Error Handling",
    ],
    specs: {
      release: "v2.4 (2026)",
      pages: 120,
      format: "PDF (Digital Master Edition)",
      level: "Intermediate - Advanced",
    },
    fileName: "Media_Player_PRO_Engineering.pdf",
    fileSize: "24.8 MB",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM_oIxvJVl88ICp_yW_qmkG9qIXIXgpzB-YciRw31eXbz0l4sLoGSWyWD4Kjpxw_u0dJB2ex0NAliraFkOO-5u-EHaq0s_PP_NwIXVKoO_y6n_IfJw6ew-9QIc_mgTFxY4AWArbaR54Jzq6eP2-QuBgARjB-GgqqWj1VxGRngJu4S-0Gg-uy5yRF8tkg15eQGxdZQ_ntloxMYlrbS6tt5YEJ7qBf5SorH6LjVkfcVuwhfUjhPyciIc",
    curator: STUDENT_INFO.name,
  },
  {
    id: "mystic-tarot-altar",
    title: "Mystic Tarot Altar System",
    subtitle: "3D Interactive Tarot & AI Divination",
    series: "Lab 2 Creative AI Series",
    labNumber: 2,
    category: "creative-ai",
    price: 259,
    originalPrice: 450,
    rating: 5.0,
    ratingCount: 204,
    description: "ศาสตร์และศิลป์การพัฒนาแท่นบูชาเสมือนจริงและระบบทำนายไพ่ทาโรต์ 3D ผสานงานออกแบบ Glassmorphism ระดับลึก การสุ่มไพ่ 78 ใบ Celtic Cross และการสร้างคำทำนายด้วย AI Prompt Engineering",
    highlights: [
      "การสร้างแท่นบูชาเสมือนจริง 3D ด้วย Three.js และ Card Flip",
      "อัลกอริทึม Celtic Cross & 3-Card Spread สุ่มแบบไม่ซ้ำซ้อน",
      "ระบบ Prompt Engineering ถอดรหัสความหมายไพ่เชิงจิตวิทยา",
      "Defensive Fallback Mechanism เมื่อไฟล์ asset ขัดข้อง",
    ],
    specs: {
      release: "v3.1 (2026)",
      pages: 145,
      format: "PDF (Digital Master Edition)",
      level: "All Levels & Creators",
    },
    fileName: "Mystic_Tarot_Altar_System.pdf",
    fileSize: "32.4 MB",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKzuxjOOrpIA70b5MolLQkqvEiwuiqm45tvssofQz_uTfphOHbJ52Mjfo4wwzeaAmsi6kE_sTutXNlgDTk4bxSdfC87WmyLcxD81WohWdIRDdRN9upxu6tqPMEk49JrjkOKMXD3hhlRqdmZrHbDTlL98IBcNxVL5l1pm18UrC4smvAmWis-wBgO9c8L2x00GHfQ14nl1cx4xVM7Yu1ErDUzTs0kU7jhVE2Opt1iVK1is295SWl_XGM",
    curator: STUDENT_INFO.name,
  },
  {
    id: "taskmaster-pro",
    title: "TaskMaster PRO Architecture",
    subtitle: "Bento Dashboard & Kanban Architecture",
    series: "Lab 3 Productivity Systems",
    labNumber: 3,
    category: "productivity",
    price: 179,
    originalPrice: 320,
    rating: 4.8,
    ratingCount: 95,
    description: "การพัฒนาระบบบริหารจัดการภารกิจระดับองค์กร Bento Dashboard & Kanban Board ระบบ Multi-theme, Chart Analytics, Data Integrity และความปลอดภัยรหัสผ่านระดับสากล",
    highlights: [
      "การจัดเลย์เอาต์ Bento Grid Responsive สไตล์โมเดิร์น",
      "Kanban Drag-and-Drop พร้อมสถานะงานแบบเรียลไทม์",
      "ความปลอดภัย 100% Parameterized Query & PBKDF2 Password Hashing",
      "การป้องกัน Windows Database Lock และ Soft Delete Architecture",
    ],
    specs: {
      release: "v2.0 (2026)",
      pages: 110,
      format: "PDF (Digital Master Edition)",
      level: "Intermediate - Fullstack",
    },
    fileName: "TaskMaster_PRO_Architecture.pdf",
    fileSize: "18.2 MB",
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEl26e_b72nBw9yv4H4e7YyA9B8t5Zz8q_xR6q3F7w1L6s4V2j1K9n8P7m6T5r4W3q2X1z0Y9b8A7c6D5e4F3g2H1j0K9l8M7n6P5q4R3s2T1u0V9w8X7y6Z5a4B3c2D1e0F9g8H7j6K5l4M3n2P1q0R9s8T7u6V5w4X3y2Z1",
    curator: STUDENT_INFO.name,
  },
];

export function getBookById(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id || b.labNumber.toString() === id);
}
