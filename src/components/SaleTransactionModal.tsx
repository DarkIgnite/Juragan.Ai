import React, { useState } from 'react';
import { Product, SaleTransaction } from '../types';
import { X, ShoppingCart, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface SaleTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  products: Product[];
  onSaveTransaction: (tx: Omit<SaleTransaction, 'id'>) => void;
}

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

const PAYMENT_METHODS: Array<'QRIS' | 'Tunai' | 'Transfer Bank' | 'Marketplace'> = [
  'QRIS',
  'Tunai',
  'Transfer Bank',
  'Marketplace',
];

export const SaleTransactionModal: React.FC<SaleTransactionModalProps> = ({
  isOpen,
  onClose,
  userId,
  products,
  onSaveTransaction,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Tunai' | 'Transfer Bank' | 'Marketplace'>('QRIS');
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = selectedProduct?.sellingPrice || 0;
  const costPrice = selectedProduct?.costPrice || 0;
  const totalPrice = unitPrice * quantity;
  const totalProfit = (unitPrice - costPrice) * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Pilih produk terlebih dahulu.');
      return;
    }
    if (quantity <= 0) {
      setError('Jumlah terjual minimal 1.');
      return;
    }

    onSaveTransaction({
      userId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice,
      totalPrice,
      profit: totalProfit,
      date,
      paymentMethod,
      customerName: customerName.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOutCurve }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            id="modal-add-sale"
            initial={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
            exit={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            transition={{ duration: 0.22, ease: easeOutCurve }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    Catat Penjualan Baru
                  </h3>
                  <p className="text-xs text-zinc-700">
                    Input transaksi riil untuk memperbarui omzet, laba, &amp; stok toko.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-colors tactile-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Product */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Pilih Produk Terjual <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-sale-product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatRupiah(p.sellingPrice)} (Sisa: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Jumlah Terjual (Qty)
              </label>
              <input
                id="input-sale-qty"
                type="number"
                min="1"
                required
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Tanggal Transaksi
              </label>
              <input
                id="input-sale-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Payment Method & Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                id="select-sale-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nama Pembeli / Saluran
              </label>
              <input
                id="input-sale-customer"
                type="text"
                placeholder="Contoh: Bu Ratna / WA Story"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Live Calculation Summary */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-zinc-700">
              <span>Harga Satuan:</span>
              <span className="font-medium text-zinc-900">{formatRupiah(unitPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Total Nilai Omzet:</span>
              <span className="font-bold text-emerald-800 text-sm">{formatRupiah(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 pt-1 border-t border-emerald-200/60 font-medium">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Estimasi Laba Bersih:
              </span>
              <span className="font-semibold">+{formatRupiah(totalProfit)}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Batal
            </button>
            <button
              id="btn-submit-sale"
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5 tactile-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Transaksi
            </button>
          </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
