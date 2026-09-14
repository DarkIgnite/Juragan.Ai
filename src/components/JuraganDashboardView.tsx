import React, { useState } from 'react';
import { UserAccount, Product, SaleTransaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { SalesChart } from './SalesChart';
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Plus,
  ArrowRight,
  ShoppingCart,
  ChevronRight,
  Mic,
  Package,
  BarChart3,
  ReceiptText,
  Share2,
  Bot,
  Zap,
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
  onOpenVoiceConsultation?: () => void;
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
  onOpenVoiceConsultation,
}) => {
  const [showSalesChart, setShowSalesChart] = useState(true);

  const totalOmzet = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
  const totalLaba = transactions.reduce((sum, t) => sum + t.profit, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.minStockAlert);
  const marginPercentage = Math.round((totalLaba / (totalOmzet || 1)) * 100);

  // Top selling product calculation
  const productCountMap = products
    .map((p) => {
      const qty = transactions
        .filter((t) => t.productId === p.id)
        .reduce((sum, t) => sum + t.quantity, 0);
      return { product: p, qty };
    })
    .sort((a, b) => b.qty - a.qty);

  const topSellers = productCountMap.slice(0, 4);
  const recentTransactions = transactions.slice(0, 5);

  const handlePromptClick = (_promptText: string) => {
    if (onOpenVoiceConsultation) {
      onOpenVoiceConsultation();
    } else {
      onNavigateToAdvisor();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      {/* 1. TOP BAR: Store Identity & Quick Operations (Clean All-White) */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {currentUser.photoUrl ? (
            <img
              src={currentUser.photoUrl}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover ring-1 ring-zinc-200 shadow-2xs shrink-0"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-2xs ${currentUser.avatarColor}`}
            >
              {currentUser.name.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900">
                {currentUser.storeName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Toko Aktif
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pemilik: <span className="font-semibold text-zinc-700">{currentUser.name}</span> • Kategori:{' '}
              <span className="font-medium text-zinc-700">{currentUser.businessCategory}</span>
            </p>
          </div>
        </div>

        {/* Quick Operations: Catat Jual & Tambah Produk */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-quick-add-sale"
            onClick={onOpenAddSale}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Catat Penjualan</span>
          </button>

          <button
            id="btn-quick-add-product"
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* ⭐ 2. AI HIGHLIGHT SPOTLIGHT: ALL-WHITE, ELEGANT, UN-CROWDED ⭐ */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/20 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Asisten Cerdas Juragan AI</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Didukung Google Gemini AI</span>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            Tanya Apa Saja Seputar Bisnismu
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            Konsultasi stok, strategi penetapan harga, atau buat materi promosi media sosial
            cukup lewat suara bahasa Indonesia atau klik pertanyaan cepat di bawah.
          </p>
        </div>

        {/* Dynamic Store Diagnostic Insight (Clean Pill) */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <p className="text-xs text-zinc-700 truncate">
              {lowStockItems.length > 0 ? (
                <>
                  <strong className="text-zinc-900">{lowStockItems.length} produk</strong> stok menipis ({lowStockItems[0].name}). Perlu restock segera.
                </>
              ) : topSellers.length > 0 ? (
                <>
                  Menu <strong className="text-zinc-900">{topSellers[0].product.name}</strong> paling laris ({topSellers[0].qty} terjual). Margin laba {marginPercentage}%.
                </>
              ) : (
                <>Toko siap bertransaksi. Tanyakan saran penetapan harga atau strategi ke AI.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {topSellers.length > 0 && (
              <button
                onClick={onNavigateToContent}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <span>Bikin Promo</span>
                <Share2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={onNavigateToAdvisor}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
            >
              <span>Lihat Saran</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Interactive AI Bar & Main Action Buttons */}
        <div className="bg-zinc-50/80 border border-zinc-200/90 rounded-xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <button
            onClick={() => (onOpenVoiceConsultation ? onOpenVoiceConsultation() : onNavigateToAdvisor())}
            className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left text-xs text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer group"
          >
            <Bot className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="truncate">
              Tanyakan stok, laba, atau ide promosi tokomu...
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenVoiceConsultation && (
              <button
                id="hero-btn-voice-consultation"
                onClick={onOpenVoiceConsultation}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Tanya Suara</span>
              </button>
            )}

            <button
              id="hero-btn-advisor"
              onClick={onNavigateToAdvisor}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Advisor</span>
            </button>
          </div>
        </div>

        {/* Clean, Non-crowded Quick Question Chips (Light White Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] font-medium text-zinc-400 shrink-0">Pertanyaan Cepat:</span>

          <button
            onClick={() => handlePromptClick('Berapa perkiraan keuntungan saya dan menu apa yang paling untung?')}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 border border-zinc-200 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Menu paling untung?</span>
          </button>

          <button
            onClick={() => handlePromptClick('Cek produk yang stoknya hampir habis')}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-700 border border-zinc-200 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Cek produk perlu restock</span>
          </button>

          <button
            onClick={() => onNavigateToContent()}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-teal-50 text-zinc-700 hover:text-teal-800 border border-zinc-200 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Bikin caption promo WhatsApp &amp; IG</span>
          </button>

          <button
            onClick={() => handlePromptClick('Bagaimana cara menaikkan omzet toko?')}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-amber-50 text-zinc-700 hover:text-amber-800 border border-zinc-200 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Strategi naik omzet</span>
          </button>
        </div>
      </div>

      {/* 3. CORE BUSINESS METRICS (Clean 4-Card Grid, White & Crisp) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Omzet */}
        <div
          onClick={onNavigateToTransactions}
          className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs hover:border-zinc-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Total Omzet</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-zinc-900 font-mono">
            {formatRupiah(totalOmzet)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
            <span>{transactions.length} pesanan</span>
            <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Laba Bersih */}
        <div
          onClick={onNavigateToTransactions}
          className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Laba Bersih</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {marginPercentage}%
            </span>
          </div>
          <div className="text-base sm:text-xl font-bold text-emerald-600 font-mono">
            +{formatRupiah(totalLaba)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
            <span>Margin keuntungan</span>
            <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 3: Total Produk & Stok */}
        <div
          onClick={() => onNavigateToProducts('all')}
          className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs hover:border-zinc-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Katalog Produk</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-zinc-900">
            {products.length} <span className="text-xs font-normal text-zinc-500">Item</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
            <span>Menu aktif</span>
            <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 4: Peringatan Stok */}
        <div
          onClick={() => onNavigateToProducts(lowStockItems.length > 0 ? 'low-stock' : 'all')}
          className={`rounded-2xl border p-4 shadow-xs transition-all cursor-pointer group ${
            lowStockItems.length > 0
              ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
              : 'bg-white border-zinc-200/90 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Stok Menipis</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                lowStockItems.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-base sm:text-xl font-bold ${
              lowStockItems.length > 0 ? 'text-rose-600' : 'text-zinc-900'
            }`}
          >
            {lowStockItems.length}{' '}
            <span className="text-xs font-normal text-zinc-500">
              {lowStockItems.length > 0 ? 'Perlu restock' : 'Semua aman'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
            <span>{lowStockItems.length > 0 ? 'Klik untuk tinjau' : 'Kondisi stabil'}</span>
            <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. SALES CHART SECTION (Clean White, Collapsible) */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Grafik Penjualan &amp; Laba</h2>
              <p className="text-[11px] text-zinc-500">
                Tren performa keuangan berdasarkan riwayat transaksi
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSalesChart((prev) => !prev)}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {showSalesChart ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>

        {showSalesChart && (
          <div className="pt-2">
            <SalesChart transactions={transactions} products={products} />
          </div>
        )}
      </div>

      {/* 5. TWO-COLUMN DETAILS: Top Products & Recent Transactions (Clean White) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900">Menu &amp; Produk Terlaris</h3>
            </div>
            <button
              onClick={() => onNavigateToProducts('all')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Produk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topSellers.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400">
                Belum ada data produk terjual.
              </div>
            ) : (
              topSellers.map(({ product, qty }, idx) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50/80 transition-colors border border-zinc-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-bold text-zinc-400">
                      #{idx + 1}
                    </span>

                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {formatRupiah(product.sellingPrice)} • Sisa {product.stock}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {qty} terjual
                    </span>
                    <button
                      onClick={() => onNavigateToContent()}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Buat Konten Promosi Menu Ini"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900">Transaksi Terakhir</h3>
            </div>
            <button
              onClick={onNavigateToTransactions}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Riwayat Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50/80 transition-colors border border-zinc-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ReceiptText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {t.productName}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                        <span>{t.quantity} unit</span>
                        <span>•</span>
                        <span>{t.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-zinc-900 font-mono">
                      {formatRupiah(t.totalPrice)}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium font-mono">
                      +{formatRupiah(t.profit)} laba
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
