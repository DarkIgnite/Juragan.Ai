import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { X, PackagePlus, AlertCircle, TrendingUp, Image as ImageIcon, Sparkles, Pencil, Upload, Trash2 } from 'lucide-react';
import { calculateMargin, formatRupiah } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  productToEdit?: Product | null;
  onSaveProduct: (product: Omit<Product, 'id' | 'updatedAt'>, editId?: string) => void;
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
  productToEdit,
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
  const [imageInputMode, setImageInputMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(productToEdit);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategory(productToEdit.category || CATEGORIES[0]);
      setCostPrice(productToEdit.costPrice || 0);
      setSellingPrice(productToEdit.sellingPrice || 0);
      setStock(productToEdit.stock || 0);
      setMinStockAlert(productToEdit.minStockAlert ?? 5);
      setUnit(productToEdit.unit || UNITS[0]);
      setImageUrl(productToEdit.imageUrl || '');

      if (productToEdit.imageUrl?.startsWith('data:image/')) {
        setImageInputMode('upload');
      } else if (productToEdit.imageUrl && !IMAGE_PRESETS.some((p) => p.url === productToEdit.imageUrl)) {
        setImageInputMode('url');
      } else {
        setImageInputMode('preset');
      }
      setError('');
    } else {
      setName('');
      setCategory(CATEGORIES[0]);
      setCostPrice(15000);
      setSellingPrice(25000);
      setStock(20);
      setMinStockAlert(5);
      setUnit(UNITS[0]);
      setImageUrl(IMAGE_PRESETS[0].url);
      setImageInputMode('preset');
      setError('');
    }
  }, [productToEdit, isOpen]);

  const marginPct = calculateMargin(sellingPrice, costPrice);
  const profitPerUnit = Math.max(0, sellingPrice - costPrice);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto terlalu besar (maksimal 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

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

    onSaveProduct(
      {
        userId,
        name: name.trim(),
        category,
        costPrice,
        sellingPrice,
        stock,
        minStockAlert,
        unit,
        imageUrl: imageUrl.trim() || undefined,
      },
      productToEdit?.id
    );

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
            id="modal-product-management"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: easeOutCurve }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden my-6"
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                    isEditing
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isEditing ? <Pencil className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isEditing
                      ? 'Perbarui foto, nama, harga jual, HPP, atau stok toko Anda.'
                      : 'Input katalog, foto produk, harga jual, dan stok aman.'}
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

              {/* Product Image Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Foto Produk
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>

                {/* Current Image Preview & Source Switcher */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="w-14 h-14 rounded-xl bg-white border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 truncate">
                      {imageUrl ? 'Foto Terpasang' : 'Belum Ada Foto'}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">
                      Pilih dari preset, upload dari galeri HP, atau link URL
                    </p>

                    {/* Mode selection buttons */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('preset')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                          imageInputMode === 'preset'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300'
                        }`}
                      >
                        Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageInputMode('upload');
                          fileInputRef.current?.click();
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          imageInputMode === 'upload'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300'
                        }`}
                      >
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                          imageInputMode === 'url'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300'
                        }`}
                      >
                        Link URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Mode Contents */}
                {imageInputMode === 'preset' && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {IMAGE_PRESETS.map((p) => {
                      const isSelected = imageUrl === p.url;
                      return (
                        <button
                          type="button"
                          key={p.name}
                          onClick={() => setImageUrl(p.url)}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
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

                {imageInputMode === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 sm:p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 cursor-pointer text-center transition-colors flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800">
                      Klik untuk Pilih Foto dari Galeri / Kamera HP
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Mendukung format JPG, PNG, WEBP (Maksimal 5MB)
                    </span>
                  </div>
                )}

                {imageInputMode === 'url' && (
                  <input
                    type="url"
                    placeholder="Masukkan URL foto (https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
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
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs tactile-btn cursor-pointer ${
                    isEditing
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  }`}
                >
                  {isEditing ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
