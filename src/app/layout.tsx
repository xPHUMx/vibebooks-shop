import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import FirstTimeConsentModal from "@/components/FirstTimeConsentModal";
import { AppProviders } from "@/providers/AppProviders";
import { STORE_INFO } from "@/lib/productsData";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#fbfbfd",
};

export const metadata: Metadata = {
  title: `${STORE_INFO.brand} (${STORE_INFO.brandTh}) — แพลตฟอร์มจำหน่ายผลงานดิจิทัลและอีบุ๊กคุณภาพ`,
  description: `ศูนย์รวมหนังสือและผลงานดิจิทัลคุณภาพ ลิขสิทธิ์แท้ 100% โดย ${STORE_INFO.curatorFull}`,
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: STORE_INFO.brand,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="bg-[#fbfbfd]">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className="font-sans bg-[#fbfbfd] text-[#1d1d1f] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#0071e3] selection:text-white"
      >
        <AppProviders>
          {/* Subtle Porcelain Ambient Lighting */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,113,227,0.04),transparent_70%)]" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[radial-gradient(circle,rgba(52,199,89,0.03),transparent_70%)] blur-3xl" />
          </div>

          {/* Liquid Glass Header */}
          <Header />

          {/* Main App Container */}
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-28 relative z-10">
            {children}
          </main>

          {/* Cart Drawer */}
          <CartDrawer />

          {/* Auth Modal */}
          <AuthModal />

          {/* First Time Visitor Legal Consent Modal */}
          <FirstTimeConsentModal />

          {/* Mobile Bottom Nav */}
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
