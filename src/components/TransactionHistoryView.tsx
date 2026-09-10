import React, { useState } from 'react';
import { SaleTransaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { ShoppingCart, Plus, Search, Calendar, CreditCard, User } from 'lucide-react';

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

  const filtered = transactions.filter((t) => {
    const matchesQuery =
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMethod = selectedMethod === 'Semua' || t.paymentMethod === selectedMethod;
    return matchesQuery && matchesMethod;
  });

  const totalOmzet = filtered.reduce((sum, t) => sum + t.totalPrice, 0);
  const totalProfit = filtered.reduce((sum, t) => sum + t.profit, 0);

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900">
              Riwayat Transaksi Penjualan
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
              {transactions.length} Transaksi
            </span>
          </div>
          <p className="text-xs text-zinc-700 mt-1 max-w-2xl">
            Catatan pembukuan penjualan terstruktur yang langsung menjadi sumber data pembelajaran AI Advisor.
          </p>
        </div>

        <button
          id="btn-add-sale-header"
          onClick={onOpenAddSale}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Penjualan Baru</span>
        </button>
      </div>

      {/* Filter and Quick Stats Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari produk atau nama pembeli..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['Semua', 'QRIS', 'Tunai', 'Transfer Bank', 'Marketplace'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedMethod === method
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Produk</th>
                <th className="px-4 py-3.5">Qty</th>
                <th className="px-4 py-3.5">Total Omzet</th>
                <th className="px-4 py-3.5">Laba Bersih</th>
                <th className="px-4 py-3.5">Metode Bayar</th>
                <th className="px-5 py-3.5">Pelanggan / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-5 py-4 font-mono text-zinc-600 whitespace-nowrap">
                    {formatDateIndo(t.date)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-900">
                    {t.productName}
                  </td>
                  <td className="px-4 py-4 font-mono text-zinc-700">
                    {t.quantity} unit
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-900 font-mono">
                    {formatRupiah(t.totalPrice)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-emerald-700 font-mono">
                    +{formatRupiah(t.profit)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {t.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    <div>{t.customerName || '-'}</div>
                    {t.notes && <div className="text-[10px] text-zinc-700 italic">{t.notes}</div>}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-700 text-xs">
                    Belum ada riwayat transaksi yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
