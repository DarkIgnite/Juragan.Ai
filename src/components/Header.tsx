import React, { useState, useRef, useEffect } from 'react';
import { UserAccount } from '../types';
import {
  Sparkles,
  ShieldCheck,
  KeyRound,
  ArrowRightLeft,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Mic,
  Plus,
  Search,
  Home,
  Package,
  Share2,
  ReceiptText,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentUser: UserAccount;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenRoleSwitcher: () => void;
  onOpenApiSetup?: () => void;
  onOpenGoogleAuth: () => void;
  onOpenVoiceConsultation?: () => void;
  apiConnected: boolean;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenAddProduct?: () => void;
  onOpenAddSale?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  theme = 'light',
  onToggleTheme,
  onOpenRoleSwitcher,
  onOpenApiSetup,
  onOpenGoogleAuth,
  onOpenVoiceConsultation,
  apiConnected,
  activeTab = 'dashboard',
  onSelectTab,
  onOpenAddProduct,
  onOpenAddSale,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === 'admin';

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Store Identity (Instagram / Facebook Web style) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onSelectTab && onSelectTab(isAdmin ? 'admin-overview' : 'dashboard')}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
            title="Kembali ke Beranda"
          >
            <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center shadow-xs text-white group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Juragan<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[120px] sm:max-w-[160px]">
                {isAdmin ? 'Super Admin Portal' : currentUser.storeName}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Bar (Facebook-style segmented icons) */}
        {onSelectTab && (
          <nav className="hidden md:flex items-center justify-center gap-1 flex-1 max-w-md mx-auto">
            {isAdmin ? (
              <>
                <button
                  onClick={() => onSelectTab('admin-overview')}
                  className={`flex flex-col items-center justify-center h-12 px-5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'admin-overview' || activeTab === 'dashboard'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="Ringkasan Platform & Audit AI"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Ringkasan</span>
                  {(activeTab === 'admin-overview' || activeTab === 'dashboard') && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onSelectTab('products')}
                  className={`flex flex-col items-center justify-center h-12 px-5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'products'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="Semua Produk UMKM"
                >
                  <Package className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Katalog</span>
                  {activeTab === 'products' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onSelectTab('transactions')}
                  className={`flex flex-col items-center justify-center h-12 px-5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'transactions'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="Semua Transaksi Platform"
                >
                  <ReceiptText className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Transaksi</span>
                  {activeTab === 'transactions' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  id="nav-tab-dashboard"
                  onClick={() => onSelectTab('dashboard')}
                  className={`flex flex-col items-center justify-center h-12 px-4.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="Beranda & Feed Toko"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Beranda</span>
                  {activeTab === 'dashboard' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>

                <button
                  id="nav-tab-products"
                  onClick={() => onSelectTab('products')}
                  className={`flex flex-col items-center justify-center h-12 px-4.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'products'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="Katalog Produk & Stok"
                >
                  <Package className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Produk</span>
                  {activeTab === 'products' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>

                <button
                  id="nav-tab-advisor"
                  onClick={() => onSelectTab('advisor')}
                  className={`flex flex-col items-center justify-center h-12 px-4.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'advisor'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="AI Advisor & Analisis"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">AI Advisor</span>
                  {activeTab === 'advisor' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>

                <button
                  id="nav-tab-content"
                  onClick={() => onSelectTab('content')}
                  className={`flex flex-col items-center justify-center h-12 px-4.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'content'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="AI Pembuat Caption & Konten"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Konten</span>
                  {activeTab === 'content' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>

                <button
                  id="nav-tab-transactions"
                  onClick={() => onSelectTab('transactions')}
                  className={`flex flex-col items-center justify-center h-12 px-4.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'transactions'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100/70 hover:dark:bg-zinc-900/70'
                  }`}
                  title="Riwayat Penjualan"
                >
                  <ReceiptText className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Riwayat</span>
                  {activeTab === 'transactions' && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </button>
              </>
            )}
          </nav>
        )}

        {/* Right Section: Quick Create (+), Theme Toggle, Voice AI, and Profile Control */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Create (+) Dropdown (Facebook style) */}
          {(onOpenAddSale || onOpenAddProduct) && (
            <div className="relative" ref={createMenuRef}>
              <button
                id="btn-header-quick-create"
                onClick={() => setIsCreateMenuOpen((prev) => !prev)}
                className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-transparent dark:border-zinc-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Buat Penjualan / Produk Baru"
              >
                <Plus className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>

              <AnimatePresence>
                {isCreateMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg dark:shadow-2xl border border-zinc-200/80 dark:border-zinc-800 p-2 z-50 space-y-1"
                  >
                    {onOpenAddSale && (
                      <button
                        onClick={() => {
                          setIsCreateMenuOpen(false);
                          onOpenAddSale();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors text-left cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <div>
                          <div>Catat Penjualan</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Tambah pesanan pembeli</div>
                        </div>
                      </button>
                    )}

                    {onOpenAddProduct && (
                      <button
                        onClick={() => {
                          setIsCreateMenuOpen(false);
                          onOpenAddProduct();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-left cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div>Tambah Produk</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Input barang ke katalog</div>
                        </div>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Theme Toggle Button (Light/Dark Mode) */}
          {onToggleTheme && (
            <button
              id="btn-header-theme-toggle"
              onClick={onToggleTheme}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-transparent dark:border-zinc-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-zinc-600" />
              )}
            </button>
          )}

          {/* Voice Consultation Button (Instagram Live / Audio Wave style) */}
          {onOpenVoiceConsultation && (
            <button
              id="btn-header-voice-consultation"
              onClick={onOpenVoiceConsultation}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-blue-500/20 hover:from-emerald-500/20 hover:to-blue-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all border border-emerald-300/80 dark:border-emerald-500/40 active:scale-95 shadow-2xs cursor-pointer"
              title="Mulai Konsultasi Suara Real-time"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              </div>
              <Mic className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
              <span className="hidden sm:inline">Tanya AI</span>
            </button>
          )}

          {/* Profile Dropdown (Familiar Instagram / Facebook avatar button with active status) */}
          <div className="relative" ref={menuRef}>
            <button
              id="btn-profile-dropdown"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="relative p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer active:scale-95 flex items-center"
              title="Profil &amp; Akun Toko"
            >
              {currentUser.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full object-cover ring-1.5 ring-emerald-500 shadow-2xs"
                />
              ) : (
                <div
                  className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs ring-1.5 ring-emerald-500 ${currentUser.avatarColor}`}
                >
                  {isAdmin ? <ShieldCheck className="w-4 h-4" /> : currentUser.name.charAt(0)}
                </div>
              )}
              {/* Online Green Status Dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-2xl border border-zinc-200/80 dark:border-zinc-800 p-3 z-50 space-y-3"
                >
                  {/* User Header Info */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/70 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      {currentUser.photoUrl ? (
                        <img
                          src={currentUser.photoUrl}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${currentUser.avatarColor}`}
                        >
                          {isAdmin ? <ShieldCheck className="w-5 h-5" /> : currentUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {currentUser.email}
                        </div>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          {isAdmin ? 'Akses: Super Admin' : `${currentUser.category} • ${currentUser.city}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Google Auth Action */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenGoogleAuth();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        currentUser.isGoogleLinked
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/70'
                          : 'bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 hover:dark:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>
                          {currentUser.isGoogleLinked ? 'Akun Google Terhubung' : 'Masuk dengan Google'}
                        </span>
                      </div>
                      {currentUser.isGoogleLinked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-zinc-400">Hubungkan</span>
                      )}
                    </button>
                  </div>

                  {/* Primary Menu Options */}
                  <div className="space-y-1 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                    {/* Dark Mode Toggle in Profile Menu */}
                    {onToggleTheme && (
                      <button
                        onClick={onToggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100 hover:dark:bg-zinc-800/70 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {theme === 'dark' ? (
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Moon className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                          <span>Tema Tampilan</span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
                        </span>
                      </button>
                    )}

                    <button
                      id="btn-switch-account-menu"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenRoleSwitcher();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 hover:dark:text-zinc-100 hover:bg-zinc-100 hover:dark:bg-zinc-800/70 transition-colors text-left cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      <span>Ganti Akun &amp; Toko Demo</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
