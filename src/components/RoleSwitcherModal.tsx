import React from 'react';
import { UserAccount } from '../types';
import { ShieldCheck, Store, Check, X, Sparkles, Building2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
}

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOutCurve }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            id="modal-role-switcher"
            initial={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
            exit={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            transition={{ duration: 0.22, ease: easeOutCurve }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">
                  Ganti Akun &amp; Role Sistem
                </h3>
                <p className="text-xs text-zinc-700">
                  Pilih peran pengguna untuk menguji hak akses (RBAC) dan fitur aplikasi.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-colors tactile-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {users.map((user) => {
                const isSelected = user.id === currentUser.id;
                const isAdmin = user.role === 'admin';

                return (
                  <div
                    key={user.id}
                    id={`card-user-${user.id}`}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className={`group relative p-4 rounded-xl border cursor-pointer text-left flex items-start gap-4 tactile-btn ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 bg-white'
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-xs ${user.avatarColor}`}
                    >
                      {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <Store className="w-5 h-5" />}
                    </div>

                    {/* Account Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-zinc-900 truncate">
                          {user.name}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isAdmin ? 'Role: Admin' : 'Role: Juragan UMKM'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-700 mt-1 font-medium">
                        {isAdmin ? 'Panel Pengawas & Analitik Seluruh Platform' : user.storeName}
                      </div>

                      <p className="text-[11px] text-zinc-700 mt-1">
                        {isAdmin
                          ? 'Fitur: Monitoring penggunaan AI platform, audit log aktivitas, statistik agregat UMKM, kelola akun.'
                          : `Sektor: ${user.category} • Lokasi: ${user.city} • Akses: AI Advisor, AI Konten, Analitik Toko.`}
                      </p>
                    </div>

                    {/* Selection Checkmark */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Data simulasi tersinkronisasi otomatis
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors tactile-btn"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

