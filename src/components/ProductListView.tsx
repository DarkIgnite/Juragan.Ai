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
  LayoutGrid,
  Table as TableIcon,
  Pencil,
} from 'lucide-react';

interface ProductListViewProps {
  products: Product[];
  initialFilter?: 'all' | 'low-stock';
  highlightProductId?: string;
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onOpenAddSaleForProduct: (product: Product) => void;
  onGenerateContentForProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  initialFilter = 'all',
  highlightProductId,
  onOpenAddProduct,
  onEditProduct,
  onOpenAddSaleForProduct,
  onGenerateContentForProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState<'all' | 'low-stock'>(initialFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header Card (Facebook/Instagram Style) */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">Katalog Produk</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700">
                  {products.length}
                </span>
                {lowStockCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    {lowStockCount} Menipis
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Koleksi menu, persediaan stok, dan kalkulator margin keuntungan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/70">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Tampilan Grid (Instagram Style)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-add-product-header"
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Clean Search & Instagram-style Filter Pills */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-3 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          <input
            id="input-search-products"
            type="text"
            placeholder="Cari nama produk atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>

        {/* Categories & Stock Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              stockFilter === 'all' && selectedCategory === 'Semua'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
            }`}
          >
            Semua ({products.length})
          </button>

          {lowStockCount > 0 && (
            <button
              id="filter-low-stock"
              onClick={() => setStockFilter(stockFilter === 'low-stock' ? 'all' : 'low-stock')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                stockFilter === 'low-stock'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stok Menipis ({lowStockCount})</span>
            </button>
          )}

          <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

          {categories
            .filter((c) => c !== 'Semua')
            .map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat ? 'Semua' : cat);
                  setStockFilter('all');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat && stockFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      {/* Main Catalog View */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">Tidak ada produk yang cocok</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau bersihkan filter yang aktif.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setStockFilter('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Instagram Marketplace Card Grid (Clean, visual, familiar) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProducts.map((p) => {
            const margin = calculateMargin(p.sellingPrice, p.costPrice);
            const profit = p.sellingPrice - p.costPrice;
            const isLowStock = p.stock <= p.minStockAlert;
            const isHighlighted = highlightProductId === p.id;

            return (
              <div
                key={p.id}
                id={`product-card-${p.id}`}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col shadow-xs hover:shadow-md ${
                  isHighlighted
                    ? 'border-amber-400 ring-2 ring-amber-300/60'
                    : isLowStock
                    ? 'border-rose-200 hover:border-rose-300'
                    : 'border-zinc-200/90 hover:border-zinc-300'
                }`}
              >
                {/* Image Aspect ratio box */}
                <div className="relative aspect-4/3 bg-zinc-100 overflow-hidden group">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/65 backdrop-blur-md text-white">
                      {p.category}
                    </span>
                    {isHighlighted && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-zinc-950 shadow-xs">
                        ⭐ Terlaris
                      </span>
                    )}
                  </div>

                  {/* Stock Pill on image */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs ${
                        isLowStock
                          ? 'bg-rose-600 text-white'
                          : 'bg-white/90 text-zinc-800'
                      }`}
                    >
                      {p.stock} {p.unit}
                    </span>
                  </div>

                  {/* Quick Edit button on top-right of image */}
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(p);
                      }}
                      className="p-1.5 rounded-full bg-white/90 hover:bg-white text-zinc-700 hover:text-blue-600 shadow-xs backdrop-blur-xs transition-all cursor-pointer"
                      title="Edit Produk"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 line-clamp-1" title={p.name}>
                      {p.name}
                    </h3>

                    {/* Price and Profit */}
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        <div className="text-xs text-zinc-400 font-medium">Harga Jual</div>
                        <div className="text-sm font-bold text-zinc-900 font-mono">
                          {formatRupiah(p.sellingPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-400 font-medium">Laba / Margin</div>
                        <div className="text-xs font-semibold text-emerald-600">
                          +{formatRupiah(profit)}{' '}
                          <span className="text-[10px] text-zinc-500">({margin}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar (Instagram Feed Action style) */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => onOpenAddSaleForProduct(p)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
                      title="Catat Penjualan Cepat"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Catat Jual</span>
                    </button>

                    <button
                      onClick={() => onEditProduct(p)}
                      className="inline-flex items-center justify-center p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                      title="Edit Produk (Foto, Nama, Harga Jual, HPP, Stok)"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onGenerateContentForProduct(p)}
                      className="inline-flex items-center justify-center p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                      title="Buat Konten Promosi AI"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="inline-flex items-center justify-center p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean Table view for users who prefer desktop spreadsheet density */
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-3 py-3">HPP</th>
                  <th className="px-3 py-3">Harga Jual</th>
                  <th className="px-3 py-3">Margin</th>
                  <th className="px-3 py-3">Stok</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                {filteredProducts.map((p) => {
                  const margin = calculateMargin(p.sellingPrice, p.costPrice);
                  const profit = p.sellingPrice - p.costPrice;
                  const isLowStock = p.stock <= p.minStockAlert;
                  const isHighlighted = highlightProductId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-50/60 transition-colors ${
                        isHighlighted ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-zinc-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-zinc-900">{p.name}</div>
                            <div className="text-[10px] text-zinc-500">{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-zinc-600">{formatRupiah(p.costPrice)}</td>
                      <td className="px-3 py-3 font-mono font-semibold text-zinc-900">{formatRupiah(p.sellingPrice)}</td>
                      <td className="px-3 py-3 font-mono text-emerald-600 font-medium">+{formatRupiah(profit)} ({margin}%)</td>
                      <td className="px-3 py-3">
                        <span className={`font-semibold ${isLowStock ? 'text-rose-600 font-bold' : 'text-zinc-800'}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => onOpenAddSaleForProduct(p)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Catat Jual"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Produk"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onGenerateContentForProduct(p)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Promosi AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
