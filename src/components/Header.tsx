import React, { useState, useRef, useEffect } from 'react';
import { UserAccount } from '../types';
import {
  Sparkles,
  ShieldCheck,
  KeyRound,
  ArrowRightLeft,
  ChevronDown,
  User,
  LogOut,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentUser: UserAccount;
  onOpenRoleSwitcher: () => void;
  onOpenApiSetup: () => void;
  onOpenGoogleAuth: () => void;
  apiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenRoleSwitcher,
  onOpenApiSetup,
  onOpenGoogleAuth,
  apiConnected,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === 'admin';

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-zinc-200/80 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand - Clean & Minimalist */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-zinc-900 tracking-tight">
              Juragan<span className="text-emerald-600">.AI</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden sm:inline-block">
              {isAdmin ? 'Admin Portal' : currentUser.storeName}
            </span>
          </div>
        </div>

        {/* Right Section: Minimal Profile Control */}
        <div className="relative" ref={menuRef}>
          <button
            id="btn-profile-dropdown"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 bg-zinc-50/60 hover:bg-zinc-100/80 transition-all tactile-btn"
          >
            {/* User Avatar */}
            {currentUser.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-200 shadow-xs"
              />
            ) : (
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs ${currentUser.avatarColor}`}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
            )}

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-zinc-900 leading-none">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5 leading-none">
                {isAdmin ? 'Super Admin' : 'Juragan UMKM'}
              </div>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-3 z-50 space-y-3"
              >
                {/* User Header Info */}
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    {currentUser.photoUrl ? (
                      <img
                        src={currentUser.photoUrl}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-zinc-200"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold ${currentUser.avatarColor}`}
                      >
                        {isAdmin ? <ShieldCheck className="w-5 h-5" /> : currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {currentUser.email}
                      </div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-200/70 text-zinc-700">
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      currentUser.isGoogleLinked
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                        : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50'
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-zinc-400">Hubungkan</span>
                    )}
                  </button>
                </div>

                {/* Primary Menu Options */}
                <div className="space-y-1 border-t border-zinc-100 pt-2">
                  <button
                    id="btn-switch-account-menu"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenRoleSwitcher();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors text-left"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Ganti Akun &amp; Role Demo</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenApiSetup();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Status AI Gemini</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
