import React from 'react';
import { X, CheckCircle2, ShieldCheck, Cpu, KeyRound, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SetupApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConnected: boolean;
}

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

export const SetupApiModal: React.FC<SetupApiModalProps> = ({
  isOpen,
  onClose,
  apiConnected,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOutCurve }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            id="modal-api-setup"
            initial={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
            exit={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            transition={{ duration: 0.22, ease: easeOutCurve }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    Konfigurasi Gemini AI API
                  </h3>
                  <p className="text-xs text-zinc-700">
                    Arsitektur Server-Side Proxy Juragan.AI
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-colors tactile-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-zinc-600">
              {/* Status Alert */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  apiConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {apiConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Cpu className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-xs">
                    {apiConnected
                      ? 'Koneksi Gemini API Aktif (Google GenAI)'
                      : 'Mode Cerdas Lokal (Heuristic Fallback) Aktif'}
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">
                    {apiConnected
                      ? 'Server Express berhasil terhubung dengan Google GenAI SDK. Analisis bisnis dan pembuatan konten diproses langsung oleh Gemini AI.'
                      : 'Jika API key belum diisi, Juragan.AI secara otomatis mengaktifkan Smart Heuristic Engine (analisis margin, perputaran inventori, dan template copy teruji). Aplikasi tetap 100% berfungsi tanpa error/crash.'}
                  </p>
                </div>
              </div>

              {/* Setup Guide */}
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">
                  Cara Konfigurasi di Google AI Studio:
                </h4>
                <ol className="space-y-2 text-xs text-zinc-700 list-decimal pl-4">
                  <li>
                    Buka menu <strong>Settings</strong> di panel samping Google AI Studio.
                  </li>
                  <li>
                    Pilih tab <strong>Secrets</strong>.
                  </li>
                  <li>
                    Tambahkan variable bernama <strong>GEMINI_API_KEY</strong> dengan nilai API Key Google Gemini Anda.
                  </li>
                  <li>
                    Platform akan menginjeksi environment variable tersebut ke container server-side tanpa mengekspos kunci ke browser client.
                  </li>
                </ol>
              </div>

              {/* Security & Reliability badges */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Zero Key Exposure
                  </div>
                  <p className="text-[11px] text-zinc-700 mt-0.5">
                    Kunci API hanya disimpan di server backend (/api/*).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Zero-Downtime Fallback
                  </div>
                  <p className="text-[11px] text-zinc-700 mt-0.5">
                    Tetap mulus dan responsif meski jaringan lambat.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors tactile-btn"
              >
                Mengerti &amp; Lanjutkan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

