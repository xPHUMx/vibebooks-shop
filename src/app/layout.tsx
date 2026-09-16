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
  title: "VibeBooks PRO — Architecture & Engineering E-books",
  description: "Minimalist Premium Tech Platform by นายเกียรติภูมิ หารศรีนาถ (64332110242-2)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark bg-black">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${inter.variable} ${notoSansThai.variable} font-sans bg-black text-[#f5f5f7] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#0071e3] selection:text-white`}
      >
        {/* Apple-style Subtle Top Ambient Spotlight */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.12),transparent_70%)]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[radial-gradient(circle,rgba(41,151,255,0.06),transparent_70%)] blur-3xl" />
        </div>

        {/* Global Fixed Apple-style Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-16 sm:pt-20 pb-28 relative z-10">
          {children}
        </main>

        {/* Floating Bottom Nav for Mobile / WebViewer */}
        <BottomNav />
      </body>
    </html>
  );
}
