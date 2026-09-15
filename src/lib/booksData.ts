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
    title: "FastPlayer PRO (Media Player Engineering)",
    subtitle: "PyQt6 & QtMultimedia Desktop Engineering (ใบงานที่ 1)",
    series: "Lab 1 Engineering Series",
    labNumber: 1,
    category: "multimedia",
    price: 199,
    originalPrice: 390,
    rating: 4.9,
    ratingCount: 128,
    description: "คู่มือสถาปัตยกรรม Desktop Media Player ระดับพรีเมียม พัฒนาด้วย Python, PyQt6 (QtMultimedia) ภายใต้แนวคิด Responsible Vibe Coding ตามเกณฑ์ใบงานที่ 1 ผสมผสาน Obsidian Black & Neon Purple Minimalist Theme, Pure Vector Icon Engine, Interactive Scrubber และ Persistent JSON Storage",
    highlights: [
      "Pure Vector Icon Engine (icons.py): วาดสัญลักษณ์ด้วย QPainter คมชัดทุกความละเอียด DPI 100%",
      "Persistent JSON Storage (Zero Data Loss): จัดเก็บและกู้คืน Playlist, Albums, Liked Songs และ Volume",
      "Under Bar Dock: แถบควบคุมมัลติมีเดีย, ปรับระดับเสียง, และ Seek Scrubbing ลื่นไหล",
      "ระบบอัลบั้มและคิวเพลง: เพิ่ม ลบ สลับเพลง และข้ามเพลงอัตโนมัติเมื่อเพลงปัจจุบันจบ",
    ],
    specs: {
      release: "v2.5 (Lab 1 Edition)",
      pages: 120,
      format: "PDF (Digital Master Edition)",
      level: "Intermediate - Advanced",
    },
    fileName: "Media_Player_PRO_Engineering.pdf",
    fileSize: "12.5 KB (Digital Master)",
    coverImage: "/images/books/media_player.png",
    curator: STUDENT_INFO.name,
  },
  {
    id: "mystic-tarot-altar",
    title: "Mystic Tarot 3-Card Oracle",
    subtitle: "Celestial Altar System & AI Divination (ใบงานที่ 2)",
    series: "Lab 2 Creative AI Series",
    labNumber: 2,
    category: "creative-ai",
    price: 259,
    originalPrice: 450,
    rating: 5.0,
    ratingCount: 204,
    description: "คู่มือและสถาปัตยกรรมระบบทำนายไพ่ทาโรต์ 3 ใบ (อดีต / ปัจจุบัน / อนาคต) ระดับเดสก์ท็อป พัฒนาด้วย Python 3.14, PyQt6, และ PyInstaller ตามเกณฑ์ใบงานที่ 2 ผสานอัตลักษณ์ Celestial Altar (Dark Luxury & Sacred Gold) จาก Google Stitch, ดนตรีบำบัด 432Hz Harmonic Ambient BGM และ Defensive Vector Fallback",
    highlights: [
      "100% Unique Draw: สุ่มไพ่ 3 ใบไม่ซ้ำกันเด็ดขาดผ่าน random.sample",
      "Celestial Altar Dark Luxury Theme: งานออกแบบพรีเมียมสีทอง-น้ำเงินเข้มจาก Google Stitch",
      "432Hz Harmonic Ambient BGM: ควบคุมเพลงบรรเลงสมาธิพร้อมปรับระดับเสียง",
      "Defensive Vector Fallback: วาดการ์ดเวกเตอร์ทองคำสำรองอัตโนมัติหากไฟล์ภาพสูญหาย",
    ],
    specs: {
      release: "v3.2 (Lab 2 Edition)",
      pages: 145,
      format: "PDF (Digital Master Edition)",
      level: "All Levels & Creators",
    },
    fileName: "Mystic_Tarot_Altar_System.pdf",
    fileSize: "9.2 KB (Digital Master)",
    coverImage: "/images/books/tarot_app.png",
    curator: STUDENT_INFO.name,
  },
  {
    id: "taskmaster-pro",
    title: "TaskManagerPRO & Bento Kanban",
    subtitle: "Bento Dashboard & Secure SQLite Architecture (ใบงานที่ 3 & 4)",
    series: "Lab 3 & 4 Productivity Systems",
    labNumber: 3,
    category: "productivity",
    price: 179,
    originalPrice: 320,
    rating: 4.8,
    ratingCount: 95,
    description: "คู่มือและสถาปัตยกรรมระบบบริหารจัดการภารกิจระดับองค์กร Bento Dashboard & Kanban Board พัฒนาด้วย Python & PyQt6 ตามเกณฑ์ใบงานที่ 3 และ 4 ระบบ Multi-theme Glassmorphism, 100% Parameterized SQLite, PBKDF2 Password Hashing, Soft Delete / Trash Recovery และระบบสำรองข้อมูลอัตโนมัติ",
    highlights: [
      "Bento Grid Dashboard: สรุปตัวเลขสถิติภารกิจและเลย์เอาต์ Bento สไตล์โมเดิร์น",
      "Kanban Workflow: ลำดับสถานะงาน To Do -> In Progress -> Review -> Completed แบบเรียลไทม์",
      "ความปลอดภัยระดับ Enterprise: Parameterized Queries 100% และ PBKDF2 Password Hashing",
      "Soft Delete & Trash Recovery: ป้องกันข้อมูลสูญหายด้วยระบบถังขยะและกู้คืนงาน",
    ],
    specs: {
      release: "v2.8 (Lab 3 & 4 Edition)",
      pages: 135,
      format: "PDF (Digital Master Edition)",
      level: "Intermediate - Fullstack",
    },
    fileName: "TaskMaster_PRO_Architecture.pdf",
    fileSize: "8.6 KB (Digital Master)",
    coverImage: "/images/books/task_manager.png",
    curator: STUDENT_INFO.name,
  },
];

export function getBookById(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id || b.labNumber.toString() === id);
}
