import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  ClipboardCheck,
  Check,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getStoredGeminiKey,
  setStoredGeminiKey,
  testGeminiConnection,
  ConnectionTestResult,
} from '../lib/geminiKey';

interface SetupApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConnected: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

export const SetupApiModal: React.FC<SetupApiModalProps> = ({
  isOpen,
  onClose,
  apiConnected,
  onConnectionChange,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Initialize input and run live diagnostic test when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredGeminiKey();
      setApiKeyInput(stored);
      runLiveTest(stored);
    }
  }, [isOpen]);

  const runLiveTest = async (keyToTest?: string) => {
    setTesting(true);
    setSaveSuccess(false);
    try {
      const result = await testGeminiConnection(keyToTest);
      setTestResult(result);
      if (onConnectionChange) {
        onConnectionChange(result.connected);
      }
    } catch (err: any) {
      setTestResult({
        connected: false,
        message: 'Gagal menguji koneksi: ' + (err?.message || 'Jaringan bermasalah'),
      });
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndTest = async () => {
    const trimmed = apiKeyInput.trim();
    setStoredGeminiKey(trimmed);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    await runLiveTest(trimmed);
  };

  const handleResetToEnv = async () => {
    setApiKeyInput('');
    setStoredGeminiKey('');
    await runLiveTest('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKeyInput(text.trim());
      }
    } catch {
      // Ignore clipboard read errors in unsupported browsers
    }
  };

  const isConnected = testResult ? testResult.connected : apiConnected;
  const isAqKey = testResult?.isAqKey || apiKeyInput.trim().startsWith('AQ.');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOutCurve }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            id="modal-api-setup"
            initial={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
            exit={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            transition={{ duration: 0.22, ease: easeOutCurve }}
            className="relative z-10 w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6"
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                  <KeyRound className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    Koneksi &amp; Kunci Gemini AI
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Konfigurasi Langsung API Google Gemini
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-sm text-zinc-700 dark:text-zinc-300 max-h-[78vh] overflow-y-auto">
              {/* Real-time Status Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  testing
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-300'
                    : isConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-200'
                    : 'bg-amber-50/80 dark:bg-amber-950/35 border-amber-300/80 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {testing ? (
                      <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-spin" />
                    ) : isConnected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                        {testing
                          ? 'Sedang Menguji Konektivitas Gemini API...'
                          : isConnected
                          ? 'Koneksi Gemini AI Aktif & Berfungsi'
                          : 'Koneksi Gemini Belum Terhubung'}
                        {testResult?.latencyMs && (
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                            {testResult.latencyMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed opacity-95">
                        {testing
                          ? 'Mengirim ping verifikasi ke Google GenAI model...'
                          : testResult?.message ||
                            (isConnected
                              ? 'Model AI aktif dan siap melayani konsultasi bisnis, pembuatan konten promo, dan transkripsi suara.'
                              : 'Fitur AI saat ini menggunakan Smart Heuristic Engine offline.')}
                      </p>
                      {testResult?.modelUsed && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Model Terverifikasi: <code className="bg-emerald-100/70 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">{testResult.modelUsed}</code></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => runLiveTest(apiKeyInput)}
                    disabled={testing}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                    title="Uji Ulang Koneksi"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Uji Ulang</span>
                  </button>
                </div>
              </div>

              {/* Special Warning & Solution for AQ. Key format */}
              {isAqKey && !isConnected && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Penyebab Masalah Kunci &quot;AQ.&quot; Terdeteksi:</span>
                  </div>
                  <p className="leading-relaxed">
                    Kunci API Anda saat ini memiliki format baru Google berawalan <code className="bg-rose-100 dark:bg-rose-900/60 px-1 py-0.5 rounded font-mono font-bold">AQ.</code> yang ditolak oleh gerbang publik Google dengan error <code className="bg-rose-100 dark:bg-rose-900/60 px-1 py-0.5 rounded font-mono">ACCESS_TOKEN_TYPE_UNSUPPORTED</code>.
                  </p>
                  <div className="bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      Solusi Cepat (1 Menit):
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-zinc-700 dark:text-zinc-300">
                      <li>
                        Buka{' '}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          Google AI Studio API Keys <ExternalLink className="w-3 h-3" />
                        </a>{' '}
                        atau{' '}
                        <a
                          href="https://console.cloud.google.com/apis/credentials"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          Google Cloud Console <ExternalLink className="w-3 h-3" />
                        </a>.
                      </li>
                      <li>
                        Buat API Key baru yang diawali format standar: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono font-bold text-emerald-600 dark:text-emerald-400">AIzaSy...</code>
                      </li>
                      <li>
                        Tempelkan kunci baru tersebut pada kotak input di bawah dan klik <strong>&quot;Simpan &amp; Hubungkan&quot;</strong>.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Direct API Key Input Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Input / Ganti API Key Gemini (Awalan AIzaSy...)
                  </label>
                  {getStoredGeminiKey() && (
                    <button
                      onClick={handleResetToEnv}
                      className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Hapus kunci kustom browser dan gunakan default environment server"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset ke Default
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Contoh: AIzaSyA1b2C3d4E5f6G7h8..."
                    className="w-full px-3.5 py-2.5 pr-20 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="px-2 py-1 text-[10px] font-semibold rounded bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="Tempel dari Clipboard"
                    >
                      Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      title={showKey ? 'Sembunyikan' : 'Perlihatkan'}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Kunci disimpan aman di browser dan diproksi via backend tanpa bocor ke pihak luar.
                  </span>
                  <button
                    onClick={handleSaveAndTest}
                    disabled={testing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menguji...</span>
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersimpan &amp; Aktif!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Simpan &amp; Hubungkan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Links for Getting Free API Key */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs mb-2">
                  Dapatkan API Key Google Gemini Resmi:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all text-xs font-semibold text-zinc-800 dark:text-zinc-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span>Google AI Studio</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
                  </a>

                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all text-xs font-semibold text-zinc-800 dark:text-zinc-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <span>Google Cloud Console</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                </div>
              </div>

              {/* Instructions for Settings > Secrets */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Atau Pasang di Pengaturan Project (Settings &gt; Secrets):</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Buka menu <strong>Settings</strong> di panel samping AI Studio &rarr; pilih tab <strong>Secrets</strong> &rarr; tambahkan variabel <code className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-semibold">GEMINI_API_KEY</code> dengan API Key Anda yang valid.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3.5 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Arsitektur Server-Side Proxy Juragan.AI
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
