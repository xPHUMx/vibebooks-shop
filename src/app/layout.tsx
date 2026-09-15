import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeBooks PRO — Glassmorphism E-book Platform",
  description: "ระบบร้านค้าจำหน่าย E-book ออนไลน์สไตล์ Obsidian Glassmorphism โดย นายเกียรติภูมิ หารศรีนาถ (64332110242-2)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${inter.variable} ${notoSansThai.variable} font-sans bg-surface text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-on-primary`}
      >
        {/* Ambient Glowing Mesh Backdrop (Fixed Layer 0) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/20 rounded-full blur-[140px]"></div>
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary/15 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-tertiary-container/10 rounded-full blur-[160px]"></div>
        </div>

        {/* Global Fixed Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-20 pb-28 relative z-10">
          {children}
        </main>

        {/* Floating Bottom Nav for Mobile / WebViewer */}
        <BottomNav />
      </body>
    </html>
  );
}
