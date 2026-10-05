'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { STORE_INFO } from '@/lib/productsData';

export default function Header() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { user, profile, openAuthModal, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] transition-all">
      <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-[20px]">local_library</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-charcoal group-hover:text-black transition-colors">
                {STORE_INFO.brand}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                Vault
              </span>
            </div>
            <span className="text-[10px] text-muted-slate font-medium hidden sm:inline">
              {STORE_INFO.brandTh} • โดย {STORE_INFO.curator}
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Liquid Glass Capsule) */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.04] text-xs font-medium text-muted-slate">
          <Link
            href="/"
            className={`px-3 py-1 rounded-full transition-all ${
              pathname === '/'
                ? 'bg-white text-charcoal font-semibold shadow-level-1'
                : 'hover:text-charcoal'
            }`}
          >
            แคตตาล็อกสินค้า
          </Link>
          <Link
            href="/library"
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              pathname.startsWith('/library')
                ? 'bg-white text-charcoal font-semibold shadow-level-1'
                : 'hover:text-charcoal'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">folder_special</span>
            คลังของฉัน
          </Link>
          <Link
            href="/community"
            className={`px-3 py-1 rounded-full transition-all ${
              pathname.startsWith('/community')
                ? 'bg-white text-charcoal font-semibold shadow-level-1'
                : 'hover:text-charcoal'
            }`}
          >
            คอมมูนิตี้
          </Link>

          {/* Merchant Capsule Button (visible for merchant or admin) */}
          {(profile?.role === 'merchant' || profile?.role === 'admin') && (
            <Link
              href="/merchant"
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/merchant')
                  ? 'bg-amber-500 text-white font-semibold shadow-level-1'
                  : 'text-amber-800 hover:text-amber-950 bg-amber-500/10'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">storefront</span>
              แดชบอร์ดพ่อค้า
            </Link>
          )}

          {/* Admin Capsule Button (visible for admin) */}
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/admin')
                  ? 'bg-accent-coral text-white font-semibold shadow-level-1'
                  : 'text-accent-coral hover:text-red-700 bg-accent-coral/10'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">shield_person</span>
              จัดการระบบ
            </Link>
          )}
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Cart Trigger Capsule */}
          <button
            onClick={openCart}
            className="h-10 px-3.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-charcoal flex items-center gap-2 transition-all active:scale-95 relative"
            title="เปิดตะกร้าสินค้า"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span className="text-xs font-semibold tabular-nums hidden sm:inline">ตะกร้า</span>
            {totalItems > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Auth Profile / Sign-in */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition-all"
              >
                <span className="text-xs font-semibold text-charcoal max-w-[100px] truncate hidden sm:inline">
                  {profile?.fullName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    profile?.role === 'admin'
                      ? 'bg-accent-coral'
                      : profile?.role === 'merchant'
                      ? 'bg-amber-600'
                      : 'bg-secondary'
                  }`}
                >
                  {profile?.role === 'admin'
                    ? '🛡️'
                    : profile?.role === 'merchant'
                    ? '🏪'
                    : profile?.fullName?.charAt(0) || '👤'}
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-squircle bg-white border border-black/[0.08] shadow-level-2 py-2 z-50 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-black/[0.06]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-charcoal truncate">{profile?.fullName}</p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            profile?.role === 'admin'
                              ? 'bg-accent-coral/10 text-accent-coral'
                              : profile?.role === 'merchant'
                              ? 'bg-amber-500/15 text-amber-800'
                              : 'bg-black/5 text-muted-slate'
                          }`}
                        >
                          {profile?.role || 'user'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-slate truncate font-mono mt-0.5">{user.email}</p>
                      {profile?.role === 'merchant' && profile?.storeName && (
                        <p className="text-[10px] text-amber-800 font-bold truncate mt-1">
                          🏪 {profile.storeName}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-charcoal hover:bg-black/[0.04]"
                      >
                        <span className="material-symbols-outlined text-[16px] text-muted-slate">person</span>
                        จัดการโปรไฟล์ (Profile)
                      </Link>

                      <Link
                        href="/library"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-charcoal hover:bg-black/[0.04]"
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">folder_special</span>
                        คลังของฉัน (My Library)
                      </Link>

                      {(profile?.role === 'merchant' || profile?.role === 'admin') && (
                        <Link
                          href="/merchant"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-900 hover:bg-amber-500/10"
                        >
                          <span className="material-symbols-outlined text-[16px] text-amber-600">storefront</span>
                          แดชบอร์ดพ่อค้า (Merchant Hub)
                        </Link>
                      )}

                      {profile?.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-charcoal hover:bg-black/[0.04]"
                        >
                          <span className="material-symbols-outlined text-[16px] text-accent-coral">dashboard</span>
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-black/[0.06] pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-accent-coral hover:bg-accent-coral/10"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="h-10 px-4 rounded-full bg-black text-white hover:bg-charcoal text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
