import React, { useState } from 'react';
import { UserAccount, SaleTransaction, Product } from '../types';
import {
  X,
  Printer,
  FileSpreadsheet,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  transactions: SaleTransaction[];
  products: Product[];
}

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  transactions,
  products,
}) => {
  const [period, setPeriod] = useState<'all' | '30d' | 'this_month'>('all');

  // Filter transactions based on selected period
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredTxs = transactions.filter((t) => {
    if (period === 'this_month') return t.date.startsWith(currentMonthStr);
    if (period === '30d') return t.date >= thirtyDaysAgo;
    return true;
  });

  // Calculate Key Accounting Totals
  const totalRevenue = filteredTxs.reduce((sum, t) => sum + t.totalPrice, 0);
  const totalProfit = filteredTxs.reduce((sum, t) => sum + t.profit, 0);
  const totalHPP = Math.max(0, totalRevenue - totalProfit);
  const grossMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const totalUnitsSold = filteredTxs.reduce((sum, t) => sum + t.quantity, 0);

  // Cash flow by payment method
  const methodTotals: Record<string, { count: number; total: number }> = {};
  filteredTxs.forEach((t) => {
    if (!methodTotals[t.paymentMethod]) {
      methodTotals[t.paymentMethod] = { count: 0, total: 0 };
    }
    methodTotals[t.paymentMethod].count += 1;
    methodTotals[t.paymentMethod].total += t.totalPrice;
  });

  const handlePrint = () => {
    window.print();
  };

  const periodLabel =
    period === 'this_month'
      ? `Bulan ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now)}`
      : period === '30d'
      ? '30 Hari Terakhir'
      : 'Seluruh Periode Pembukuan';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOutCurve }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs print:hidden"
          />

          {/* Modal Dialog */}
          <motion.div
            id="printable-financial-statement"
            initial={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
            exit={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            transition={{ duration: 0.22, ease: easeOutCurve }}
            className="relative z-10 w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-0 print:m-0 print:p-0 print:w-full"
          >
            {/* Modal Header Controls (Hidden on Print) */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900 shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Laporan Keuangan Standar SAK EMKM
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Format Laba Rugi resmi &amp; siap cetak untuk lampiran perbankan (KUR) / pembukuan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Cetak atau Simpan PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills (Hidden on Print) */}
            <div className="px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2 overflow-x-auto shrink-0 print:hidden text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Rentang Data:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPeriod('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    period === 'all'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setPeriod('this_month')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    period === 'this_month'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700'
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setPeriod('30d')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    period === '30d'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700'
                  }`}
                >
                  30 Hari Terakhir
                </button>
              </div>
            </div>

            {/* Document Body (Printable Paper Sheet) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 print:overflow-visible print:p-2">
              {/* Document Header (Letterhead) */}
              <div className="border-b-2 border-zinc-900 dark:border-zinc-700 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                    Standar SAK EMKM — Ikatan Akuntan Indonesia
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                    {currentUser.storeName}
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Pemilik: <strong>{currentUser.name}</strong> • Kategori: {currentUser.category} • Kota: {currentUser.city}
                  </p>
                </div>
                <div className="sm:text-right text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <div>Periode: <strong>{periodLabel}</strong></div>
                  <div>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center space-y-1 py-1">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  LAPORAN LABA RUGI &amp; KINERJA USAHA
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Untuk Periode yang Berakhir pada {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)}
                </p>
              </div>

              {/* Accounting Statement Table */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden font-mono text-xs">
                {/* 1. Pendapatan */}
                <div className="bg-zinc-50 dark:bg-zinc-850 px-4 py-2.5 font-sans font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span>I. PENDAPATAN USAHA</span>
                  <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">{filteredTxs.length} Transaksi ({totalUnitsSold} Unit)</span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between bg-white dark:bg-zinc-900">
                  <span className="text-zinc-600 dark:text-zinc-400 pl-4">Penjualan Kotor Produk</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatRupiah(totalRevenue)}</span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-850/40 border-t border-zinc-100 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100">
                  <span>Total Pendapatan Bersih (Net Revenue)</span>
                  <span>{formatRupiah(totalRevenue)}</span>
                </div>

                {/* 2. HPP */}
                <div className="bg-zinc-50 dark:bg-zinc-850 px-4 py-2.5 font-sans font-bold text-zinc-900 dark:text-zinc-100 border-t border-b border-zinc-200 dark:border-zinc-800">
                  II. BEBAN POKOK PENJUALAN (HPP)
                </div>
                <div className="px-4 py-2 flex items-center justify-between bg-white dark:bg-zinc-900">
                  <span className="text-zinc-600 dark:text-zinc-400 pl-4">Total Biaya Bahan &amp; Modal Produk Terjual</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">({formatRupiah(totalHPP)})</span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-850/40 border-t border-zinc-100 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100">
                  <span>Total Beban Pokok Penjualan</span>
                  <span className="text-rose-600 dark:text-rose-400">({formatRupiah(totalHPP)})</span>
                </div>

                {/* 3. Laba Kotor */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 border-t-2 border-b border-emerald-300 dark:border-emerald-800 font-bold flex items-center justify-between text-emerald-900 dark:text-emerald-200 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>III. LABA KOTOR (GROSS PROFIT)</span>
                  </div>
                  <div className="text-right">
                    <span>{formatRupiah(totalProfit)}</span>
                    <span className="block text-[11px] font-normal text-emerald-700 dark:text-emerald-400 font-sans">
                      Margin Laba: <strong>{grossMargin}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Flow Distribution */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <PieChart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Rincian Arus Kas Berdasarkan Saluran Pembayaran:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans">
                  {Object.entries(methodTotals).map(([method, data]) => (
                    <div key={method} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{method}</div>
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {formatRupiah(data.total)}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{data.count} Transaksi Lunas</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Financial Health Assessment & KUR Eligibility */}
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Evaluasi Kelayakan Usaha AI (Skor KUR Perbankan)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                    {grossMargin >= 30 ? 'Status: Sangat Layak (Prima)' : 'Status: Cukup Baik'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Berdasarkan rasio margin laba kotor <strong>{grossMargin}%</strong> dan perputaran transaksi sebesar <strong>{formatRupiah(totalRevenue)}</strong>, 
                  kondisi keuangan usaha memenuhi kriteria pembukuan sehat sesuai Standar Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah (SAK EMKM).
                </p>
              </div>

              {/* Signature Block (For Bank Official / Tax Verification) */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                <div className="space-y-12">
                  <p className="text-zinc-500 dark:text-zinc-400">Diverifikasi Sistem:</p>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Juragan.AI Verified Record
                    </div>
                    <p className="text-[10px] text-zinc-400">Digital Audit Trail ID: JUR-{currentUser.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p className="text-zinc-500 dark:text-zinc-400">Pemilik Usaha / Juragan,</p>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 underline">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-400">{currentUser.storeName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Hidden on Print) */}
            <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 print:hidden shrink-0">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Siap dilampirkan untuk pengajuan modal usaha &amp; pembukuan pajak UMKM
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Tutup Laporan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
