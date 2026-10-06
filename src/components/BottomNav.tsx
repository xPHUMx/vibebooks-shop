'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { profile, user } = useAuth();

  const isStore = pathname === '/';
  const isLibrary = pathname.startsWith('/library');
  const isCommunity = pathname.startsWith('/community');
  const isAdmin = pathname.startsWith('/admin');
  const isMerchant = pathname.startsWith('/merchant');
  const isProfile = pathname.startsWith('/profile');

  return (
    <nav className="fixed bottom-4 inset-x-0 z-40 px-4 pb-safe flex justify-center pointer-events-none md:hidden">
      <div className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-full bg-white/90 backdrop-blur-2xl border border-black/[0.08] shadow-level-2 w-full max-w-sm">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-300 ease-out active:scale-90 group ${
            isStore
              ? 'text-white bg-black font-semibold shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isStore ? 'scale-110' : 'group-hover:scale-105'}`}>
            storefront
          </span>
          <span className="text-[10px] mt-0.5 font-medium">หน้าร้าน</span>
        </Link>

        <Link
          href="/library"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-300 ease-out active:scale-90 group ${
            isLibrary
              ? 'text-white bg-black font-semibold shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isLibrary ? 'scale-110' : 'group-hover:scale-105'}`}>
            folder_special
          </span>
          <span className="text-[10px] mt-0.5 font-medium">คลังไฟล์</span>
        </Link>

        {/* Cart Trigger */}
        <button
          onClick={openCart}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full text-muted-slate hover:text-charcoal relative transition-all duration-300 ease-out active:scale-90 group"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:scale-105">
            shopping_bag
          </span>
          <span className="text-[10px] mt-0.5 font-medium">ตะกร้า</span>
          {totalItems > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center animate-scale-in">
              {totalItems}
            </span>
          )}
        </button>

        <Link
          href="/community"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-300 ease-out active:scale-90 group ${
            isCommunity
              ? 'text-white bg-black font-semibold shadow-sm'
              : 'text-muted-slate hover:text-charcoal'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isCommunity ? 'scale-110' : 'group-hover:scale-105'}`}>
            forum
          </span>
          <span className="text-[10px] mt-0.5 font-medium">รีวิว</span>
        </Link>

        {profile?.role === 'admin' ? (
          <Link
            href="/admin"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-300 ease-out active:scale-90 group ${
              isAdmin
                ? 'text-white bg-accent-coral font-semibold shadow-sm'
                : 'text-muted-slate hover:text-charcoal'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isAdmin ? 'scale-110' : 'group-hover:scale-105'}`}>
              shield_person
            </span>
            <span className="text-[10px] mt-0.5 font-medium">แอดมิน</span>
          </Link>
        ) : profile?.role === 'merchant' ? (
          <Link
            href="/merchant"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-300 ease-out active:scale-90 group ${
              isMerchant
                ? 'text-white bg-amber-600 font-semibold shadow-sm'
                : 'text-muted-slate hover:text-charcoal'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isMerchant ? 'scale-110' : 'group-hover:scale-105'}`}>
              store
            </span>
            <span className="text-[10px] mt-0.5 font-medium">พ่อค้า</span>
          </Link>
        ) : (
          <Link
            href="/profile"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-300 ease-out active:scale-90 group ${
              isProfile
                ? 'text-white bg-black font-semibold shadow-sm'
                : 'text-muted-slate hover:text-charcoal'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isProfile ? 'scale-110' : 'group-hover:scale-105'}`}>
              person
            </span>
            <span className="text-[10px] mt-0.5 font-medium">โปรไฟล์</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
