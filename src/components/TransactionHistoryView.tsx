import React, { useState } from 'react';
import { SaleTransaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import {
  ReceiptText,
  Plus,
  Search,
  CreditCard,
  Banknote,
  QrCode,
  Store,
  User,
  Clock,
  TrendingUp,
  LayoutList,
  Table as TableIcon,
} from 'lucide-react';

interface TransactionHistoryViewProps {
  transactions: SaleTransaction[];
  onOpenAddSale: () => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  transactions,
  onOpenAddSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Semua');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = transactions.filter((t) => {
    const matchesQuery =
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMethod = selectedMethod === 'Semua' || t.paymentMethod === selectedMethod;
    return matchesQuery && matchesMethod;
  });

  const totalOmzet = filtered.reduce((sum, t) => sum + t.totalPrice, 0);
  const totalProfit = filtered.reduce((sum, t) => sum + t.profit, 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'QRIS':
        return <QrCode className="w-4 h-4 text-rose-600" />;
      case 'Tunai':
        return <Banknote className="w-4 h-4 text-emerald-600" />;
      case 'Transfer Bank':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Store className="w-4 h-4 text-amber-600" />;
    }
  };

  const getMethodBg = (method: string) => {
    switch (method) {
      case 'QRIS':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Tunai':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Transfer Bank':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header Card (Facebook/Instagram Style) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Riwayat Penjualan</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {transactions.length} Transaksi
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Aktivitas pembukuan harian yang otomatis dianalisis oleh AI Advisor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Tampilan Feed Kartu (Social Style)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-add-sale-header"
            onClick={onOpenAddSale}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Penjualan</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar (Facebook Post Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Omzet Terfilter</div>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
            {formatRupiah(totalOmzet)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total Laba Bersih</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            +{formatRupiah(totalProfit)}
          </div>
        </div>
      </div>

      {/* Clean Search & Payment Method Pills */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-3 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          <input
            id="input-search-transactions"
            type="text"
            placeholder="Cari nama menu atau nama pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>

        {/* Method Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['Semua', 'QRIS', 'Tunai', 'Transfer Bank', 'Marketplace'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedMethod === method
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
            <ReceiptText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Belum ada transaksi ditemukan</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Gunakan tombol &quot;Catat Penjualan&quot; atau sesuaikan kata kunci pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedMethod('Semua');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Social Media Activity Feed Cards (Facebook/Instagram Activity style) */
        <div className="space-y-2.5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getMethodBg(
                    t.paymentMethod
                  )}`}
                >
                  {getMethodIcon(t.paymentMethod)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.productName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {t.quantity} unit
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                      {formatDateIndo(t.date)}
                    </span>
                    <span>•</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getMethodBg(
                        t.paymentMethod
                      )}`}
                    >
                      {t.paymentMethod}
                    </span>
                    {t.customerName && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-300">
                          <User className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                          {t.customerName}
                        </span>
                      </>
                    )}
                  </div>

                  {t.notes && (
                    <div className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg px-2.5 py-1 inline-block border border-zinc-200/60 dark:border-zinc-800 italic">
                      &quot;{t.notes}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Right Price & Profit */}
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-800 flex sm:flex-col items-baseline sm:items-end justify-between">
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {formatRupiah(t.totalPrice)}
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  +{formatRupiah(t.profit)} laba
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Menu &amp; Qty</th>
                  <th className="px-3 py-3">Metode</th>
                  <th className="px-3 py-3">Total Omzet</th>
                  <th className="px-3 py-3">Laba Bersih</th>
                  <th className="px-4 py-3">Pelanggan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {formatDateIndo(t.date)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {t.productName} ({t.quantity} unit)
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getMethodBg(t.paymentMethod)}`}>
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(t.totalPrice)}
                    </td>
                    <td className="px-3 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatRupiah(t.profit)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {t.customerName || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
