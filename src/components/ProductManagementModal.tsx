import React, { useState } from 'react';
import { Product } from '../types';
import { X, PackagePlus, AlertCircle, TrendingUp, Image as ImageIcon, Sparkles } from 'lucide-react';
import { calculateMargin, formatRupiah } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSaveProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
}

const CATEGORIES = [
  'Makanan Olahan',
  'Camilan & Snack',
  'Minuman Segar',
  'Pakaian & Fashion',
  'Kriya & Kerajinan',
  'Pertanian & Agribisnis',
  'Lainnya',
];

const UNITS = ['pcs', 'botol', 'pack', 'toples', 'porsi', 'pouch', 'box'];

const IMAGE_PRESETS = [
  {
    name: 'Sambal Botol',
    url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Keripik / Snack',
    url: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rempah / Bumbu',
    url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Batik / Busana',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dress / Kain',
    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kopi / Minuman',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
  },
];

export const ProductManagementModal: React.FC<ProductManagementModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSaveProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [costPrice, setCostPrice] = useState<number>(15000);
  const [sellingPrice, setSellingPrice] = useState<number>(25000);
  const [stock, setStock] = useState<number>(20);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [unit, setUnit] = useState(UNITS[0]);
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [error, setError] = useState('');

  const marginPct = calculateMargin(sellingPrice, costPrice);
  const profitPerUnit = Math.max(0, sellingPrice - costPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }
    if (costPrice < 0 || sellingPrice <= 0) {
      setError('Harga jual harus lebih dari 0.');
      return;
    }
    if (stock < 0) {
      setError('Jumlah stok tidak boleh negatif.');
      return;
    }

    onSaveProduct({
      userId,
      name: name.trim(),
      category,
      costPrice,
      sellingPrice,
      stock,
      minStockAlert,
      unit,
      imageUrl: imageUrl.trim() || undefined,
    });

    setName('');
    setImageUrl(IMAGE_PRESETS[0].url);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOutCurve }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            id="modal-add-product"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: easeOutCurve }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden my-6"
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PackagePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Tambah Produk Baru
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Input katalog, foto produk, harga jual, dan stok aman.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nama Produk
                </label>
                <input
                  id="input-product-name"
                  type="text"
                  placeholder="Contoh: Sambal Bawang Super Pedas 200g"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Product Image Preset Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Pilih Foto Produk
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    className="text-[11px] font-medium text-emerald-700 hover:underline"
                  >
                    {showCustomUrlInput ? 'Pilih dari Preset' : '+ Input URL Sendiri'}
                  </button>
                </div>

                {showCustomUrlInput ? (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {IMAGE_PRESETS.map((p) => {
                      const isSelected = imageUrl === p.url;
                      return (
                        <button
                          type="button"
                          key={p.name}
                          onClick={() => setImageUrl(p.url)}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <img
                            src={p.url}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[10px] font-medium text-zinc-800 truncate">
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Kategori
                  </label>
                  <select
                    id="select-product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Satuan Jual
                  </label>
                  <select
                    id="select-product-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost Price & Selling Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Harga Pokok / Modal (HPP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-zinc-400">Rp</span>
                    <input
                      id="input-product-cost"
                      type="number"
                      min="0"
                      step="500"
                      value={costPrice || ''}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Harga Jual ke Pembeli
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-zinc-400">Rp</span>
                    <input
                      id="input-product-price"
                      type="number"
                      min="0"
                      step="500"
                      value={sellingPrice || ''}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Margin Preview */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <span className="text-zinc-600 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Margin Bersih:
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-zinc-900 font-semibold font-mono">
                    +{formatRupiah(profitPerUnit)} / {unit}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      marginPct >= 30
                        ? 'bg-emerald-100 text-emerald-800'
                        : marginPct > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {marginPct}% Margin
                  </span>
                </div>
              </div>

              {/* Stock & Low Stock Alert */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Sisa Stok Saat Ini
                  </label>
                  <input
                    id="input-product-stock"
                    type="number"
                    min="0"
                    value={stock || ''}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Batas Stok Kritis (Alert AI)
                  </label>
                  <input
                    id="input-product-min-stock"
                    type="number"
                    min="1"
                    value={minStockAlert || ''}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors tactile-btn"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-submit-save-product"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs tactile-btn"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
