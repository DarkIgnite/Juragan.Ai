import React from 'react';
import { UserAccount, Product, SaleTransaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { SalesChart } from './SalesChart';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Share2,
  Plus,
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface JuraganDashboardViewProps {
  currentUser: UserAccount;
  products: Product[];
  transactions: SaleTransaction[];
  onNavigateToAdvisor: () => void;
  onNavigateToContent: () => void;
  onNavigateToProducts: (filter?: 'all' | 'low-stock', highlightId?: string) => void;
  onNavigateToTransactions: () => void;
  onOpenAddProduct: () => void;
  onOpenAddSale: () => void;
}

export const JuraganDashboardView: React.FC<JuraganDashboardViewProps> = ({
  currentUser,
  products,
  transactions,
  onNavigateToAdvisor,
  onNavigateToContent,
  onNavigateToProducts,
  onNavigateToTransactions,
  onOpenAddProduct,
  onOpenAddSale,
}) => {
  const totalOmzet = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
  const totalLaba = transactions.reduce((sum, t) => sum + t.profit, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.minStockAlert);

  // Top selling product calculation
  const productCountMap = products
    .map((p) => {
      const qty = transactions
        .filter((t) => t.productId === p.id)
        .reduce((sum, t) => sum + t.quantity, 0);
      return { product: p, qty };
    })
    .sort((a, b) => b.qty - a.qty);

  const topSeller = productCountMap[0];

  return (
    <div className="space-y-6">
      {/* Clean, Non-Verbose Welcome Header */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
              Halo, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {currentUser.storeName}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ringkasan omzet, laba, dan stok hari ini.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-quick-add-sale"
            onClick={onOpenAddSale}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xs tactile-btn"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Catat Penjualan</span>
          </button>
          <button
            id="btn-quick-add-product"
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xs tactile-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive Clickable Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Omzet -> navigates to transactions */}
        <div
          id="card-stat-omzet"
          onClick={onNavigateToTransactions}
          className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all group tactile-btn"
          title="Klik untuk melihat riwayat semua transaksi penjualan"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 group-hover:text-emerald-700 transition-colors">
              Total Omzet Toko
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-2 font-mono">
            {formatRupiah(totalOmzet)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
            <span>{transactions.length} pesanan</span>
            <span className="text-emerald-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Lihat Riwayat <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Laba Bersih -> navigates to transactions */}
        <div
          id="card-stat-laba"
          onClick={onNavigateToTransactions}
          className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group tactile-btn"
          title="Klik untuk melihat rincian laba transaksi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 group-hover:text-indigo-700 transition-colors">
              Estimasi Laba Bersih
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-2 font-mono">
            +{formatRupiah(totalLaba)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
            <span>Margin: {Math.round((totalLaba / (totalOmzet || 1)) * 100)}%</span>
            <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Rincian Laba <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Produk Terlaris -> navigates to products view with highlight */}
        <div
          id="card-stat-terlaris"
          onClick={() => onNavigateToProducts('all', topSeller?.product.id)}
          className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all group tactile-btn"
          title="Klik untuk melihat produk terlaris di katalog"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 group-hover:text-amber-700 transition-colors">
              Produk Terlaris
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {topSeller?.product.imageUrl && (
              <img
                src={topSeller.product.imageUrl}
                alt={topSeller.product.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-200 shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="text-sm font-bold text-zinc-900 truncate">
              {topSeller ? topSeller.product.name : '-'}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
            <span>Terjual {topSeller ? topSeller.qty : 0} {topSeller?.product.unit}</span>
            <span className="text-amber-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Katalog <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Status Inventori -> navigates to low-stock filtered products view! */}
        <div
          id="card-stat-inventori"
          onClick={() => onNavigateToProducts(lowStockItems.length > 0 ? 'low-stock' : 'all')}
          className={`bg-white rounded-2xl border p-5 shadow-xs cursor-pointer transition-all group tactile-btn ${
            lowStockItems.length > 0
              ? 'border-rose-200 hover:border-rose-400 hover:bg-rose-50/20'
              : 'border-zinc-200/80 hover:border-emerald-300'
          }`}
          title="Klik untuk langsung membuka daftar produk yang menipis"
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                lowStockItems.length > 0 ? 'text-rose-700 font-semibold' : 'text-zinc-600'
              }`}
            >
              Status Inventori
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                lowStockItems.length > 0
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {lowStockItems.length > 0 ? (
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div
            className={`text-xl font-bold mt-2 ${
              lowStockItems.length > 0 ? 'text-rose-600' : 'text-zinc-900'
            }`}
          >
            {lowStockItems.length > 0
              ? `${lowStockItems.length} Produk Menipis`
              : 'Stok Aman'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
            <span>
              {lowStockItems.length > 0 ? 'Perlu Restock Segera' : `${products.length} produk siap`}
            </span>
            <span
              className={`font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 ${
                lowStockItems.length > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'
              }`}
            >
              {lowStockItems.length > 0 ? 'Cek Stok Menipis' : 'Lihat Produk'} <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* AI Quick Callouts - Simplified & Punchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: AI Advisor */}
        <div className="bg-linear-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Gemini AI Advisor
              </span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="text-sm font-bold">Rekomendasi Restock &amp; Harga</h3>
            <p className="text-xs text-zinc-300">
              Dapatkan analisis cerdas untuk stok menipis dan penetapan margin laba toko Anda.
            </p>
          </div>
          <div className="pt-3">
            <button
              onClick={onNavigateToAdvisor}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] transition-all tactile-btn"
            >
              <span>Konsultasi AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: AI Content Generator */}
        <div className="bg-linear-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white border border-white/30">
                Pemasaran Kilat
              </span>
              <Share2 className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="text-sm font-bold">Pembuat Konten Otomatis</h3>
            <p className="text-xs text-emerald-100">
              Buat caption Instagram, TikTok, dan broadcast WhatsApp dari produk Anda dalam 3 detik.
            </p>
          </div>
          <div className="pt-3">
            <button
              onClick={onNavigateToContent}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-emerald-950 hover:bg-emerald-50 active:scale-[0.98] transition-all tactile-btn"
            >
              <span>Buat Caption</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Sales Analytics Charts */}
      <SalesChart transactions={transactions} products={products} />
    </div>
  );
};
