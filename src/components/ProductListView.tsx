import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatRupiah, calculateMargin } from '../utils/formatters';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Sparkles,
  ShoppingCart,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface ProductListViewProps {
  products: Product[];
  initialFilter?: 'all' | 'low-stock';
  highlightProductId?: string;
  onOpenAddProduct: () => void;
  onOpenAddSaleForProduct: (product: Product) => void;
  onGenerateContentForProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  initialFilter = 'all',
  highlightProductId,
  onOpenAddProduct,
  onOpenAddSaleForProduct,
  onGenerateContentForProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState<'all' | 'low-stock'>(initialFilter);

  // Sync initialFilter prop if it changes
  useEffect(() => {
    if (initialFilter) {
      setStockFilter(initialFilter);
    }
  }, [initialFilter]);

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesStock = stockFilter === 'all' || p.stock <= p.minStockAlert;
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">
              Katalog &amp; Stok Produk
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
              {products.length} Produk
            </span>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                {lowStockCount} Menipis
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Kelola harga jual, HPP, serta pantau persediaan stok produk.
          </p>
        </div>

        <button
          id="btn-add-product-header"
          onClick={onOpenAddProduct}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xs shrink-0 tactile-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          <input
            id="input-search-products"
            type="text"
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>

        {/* Stock Filter & Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all tactile-btn ${
              stockFilter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Semua Stok
          </button>

          <button
            id="filter-low-stock"
            onClick={() => setStockFilter('low-stock')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all tactile-btn ${
              stockFilter === 'low-stock'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stok Menipis ({lowStockCount})</span>
          </button>

          <div className="w-[1px] h-5 bg-zinc-200 mx-1 shrink-0" />

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all tactile-btn ${
                selectedCategory === cat && stockFilter === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table with Images */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Produk</th>
                <th className="px-4 py-3.5">HPP (Modal)</th>
                <th className="px-4 py-3.5">Harga Jual</th>
                <th className="px-4 py-3.5">Margin Laba</th>
                <th className="px-4 py-3.5">Sisa Stok</th>
                <th className="px-5 py-3.5 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                    Tidak ada produk yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const margin = calculateMargin(p.sellingPrice, p.costPrice);
                  const profit = p.sellingPrice - p.costPrice;
                  const isLowStock = p.stock <= p.minStockAlert;
                  const isHighlighted = highlightProductId === p.id;

                  return (
                    <tr
                      key={p.id}
                      id={`product-row-${p.id}`}
                      className={`transition-colors ${
                        isHighlighted
                          ? 'bg-amber-50/80 ring-2 ring-amber-400/50'
                          : isLowStock
                          ? 'bg-rose-50/25 hover:bg-rose-50/50'
                          : 'hover:bg-zinc-50/60'
                      }`}
                    >
                      {/* Thumbnail Image, Name & Category */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-11 h-11 rounded-xl object-cover ring-1 ring-zinc-200/80 shadow-2xs shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                              <span className="truncate">{p.name}</span>
                              {isHighlighted && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900 shrink-0">
                                  Terlaris ⭐
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              {p.category} • Satuan: {p.unit}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* HPP */}
                      <td className="px-4 py-3.5 font-mono text-zinc-600">
                        {formatRupiah(p.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="px-4 py-3.5 font-semibold text-zinc-900 font-mono">
                        {formatRupiah(p.sellingPrice)}
                      </td>

                      {/* Margin */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              margin >= 30
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {margin}%
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            (+{formatRupiah(profit)})
                          </span>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isLowStock ? 'text-rose-600 font-bold' : 'text-zinc-900'
                            }`}
                          >
                            {p.stock} {p.unit}
                          </span>
                          {isLowStock && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              Menipis (&le;{p.minStockAlert})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick Action buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => onOpenAddSaleForProduct(p)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors tactile-btn"
                            title="Catat Penjualan Produk Ini"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onGenerateContentForProduct(p)}
                            className="p-1.5 rounded-lg text-indigo-700 hover:bg-indigo-50 transition-colors tactile-btn"
                            title="Buat Konten Promosi Produk Ini"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors tactile-btn"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
