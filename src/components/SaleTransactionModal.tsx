import React, { useState } from 'react';
import { Product, SaleTransaction } from '../types';
import {
  X,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Send,
  Printer,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface SaleTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  storeName?: string;
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
  storeName = 'Juragan UMKM',
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
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [savedReceipt, setSavedReceipt] = useState<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    date: string;
    paymentMethod: string;
    customerName?: string;
    customerPhone?: string;
  } | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = selectedProduct?.sellingPrice || 0;
  const costPrice = selectedProduct?.costPrice || 0;
  const totalPrice = unitPrice * quantity;
  const totalProfit = (unitPrice - costPrice) * quantity;

  const buildWhatsAppLink = (receipt: typeof savedReceipt) => {
    if (!receipt) return '#';
    const message = [
      `🧾 *NOTA PEMBELIAN - ${storeName.toUpperCase()}*`,
      `📅 Tanggal: ${receipt.date}`,
      receipt.customerName ? `👤 Pelanggan: ${receipt.customerName}` : null,
      `----------------------------------------`,
      `*${receipt.quantity}x ${receipt.productName}*`,
      `Harga: ${formatRupiah(receipt.unitPrice)}`,
      `Total: *${formatRupiah(receipt.totalPrice)}*`,
      `Metode: *${receipt.paymentMethod}* (LUNAS)`,
      `----------------------------------------`,
      `Terima kasih telah berbelanja di *${storeName}*! 🙏`,
      `_Dikelola dengan Juragan.AI (Asisten Bisnis Digital)_`,
    ]
      .filter(Boolean)
      .join('\n');

    const cleanPhone = receipt.customerPhone?.replace(/[^0-9]/g, '') || '';
    const waPhone = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone.startsWith('62')
      ? cleanPhone
      : cleanPhone;

    const encodedMsg = encodeURIComponent(message);
    if (waPhone) {
      return `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodedMsg}`;
    }
    return `https://api.whatsapp.com/send?text=${encodedMsg}`;
  };

  const handleSave = (autoOpenWhatsApp: boolean = false) => {
    if (!selectedProduct) {
      setError('Pilih produk terlebih dahulu.');
      return;
    }
    if (quantity <= 0) {
      setError('Jumlah terjual minimal 1.');
      return;
    }

    const txData = {
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
      customerPhone: customerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSaveTransaction(txData);

    try {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#3b82f6'],
      });
    } catch {}

    const receiptObj = {
      productName: selectedProduct.name,
      quantity,
      unitPrice,
      totalPrice,
      date,
      paymentMethod,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    };

    setSavedReceipt(receiptObj);
    setError('');

    if (autoOpenWhatsApp) {
      const waUrl = buildWhatsAppLink(receiptObj);
      window.open(waUrl, '_blank');
    }
  };

  const handleResetForNewSale = () => {
    setSavedReceipt(null);
    setQuantity(1);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  const handleCloseModal = () => {
    setSavedReceipt(null);
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
            className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  {savedReceipt ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <ShoppingCart className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {savedReceipt ? 'Transaksi Berhasil Dicatat!' : 'Catat Penjualan Baru'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {savedReceipt
                      ? 'Struk digital siap dikirim ke WhatsApp pembeli atau dicetak.'
                      : 'Input transaksi riil untuk memperbarui omzet, laba, & stok toko.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors tactile-btn cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {savedReceipt ? (
              /* Success & WhatsApp Digital Receipt View */
              <div className="p-6 space-y-4">
                {/* Visual Digital Receipt Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-xs">
                  <div className="text-center pb-2 border-b border-dashed border-zinc-300 dark:border-zinc-700 font-sans">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Struk Penjualan Resmi
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase mt-0.5">
                      {storeName}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      {savedReceipt.date} • {savedReceipt.paymentMethod} (LUNAS)
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-zinc-800 dark:text-zinc-200">
                      <span>{savedReceipt.quantity}x {savedReceipt.productName}</span>
                      <span>{formatRupiah(savedReceipt.totalPrice)}</span>
                    </div>
                    {savedReceipt.customerName && (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                        Pembeli: <strong>{savedReceipt.customerName}</strong>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-dashed border-zinc-300 dark:border-zinc-700 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    <span>TOTAL BAYAR</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(savedReceipt.totalPrice)}</span>
                  </div>
                </div>

                {/* Receipt Actions */}
                <div className="space-y-2">
                  <a
                    href={buildWhatsAppLink(savedReceipt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Nota ke WhatsApp Pelanggan</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResetForNewSale}
                      className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Catat Transaksi Lain</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Transaction Input Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave(false);
                }}
                className="p-6 space-y-4"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Select Product */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Pilih Produk Terjual <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-sale-product"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white dark:bg-zinc-950 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="dark:bg-zinc-900 dark:text-zinc-100">
                        {p.name} — {formatRupiah(p.sellingPrice)} (Sisa: {p.stock} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Jumlah Terjual (Qty)
                    </label>
                    <input
                      id="input-sale-qty"
                      type="number"
                      min="1"
                      required
                      value={quantity || ''}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tanggal Transaksi
                    </label>
                    <input
                      id="input-sale-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    id="select-sale-payment"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white dark:bg-zinc-950 cursor-pointer"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method} className="dark:bg-zinc-900 dark:text-zinc-100">
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Details & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nama Pembeli (Opsional)
                    </label>
                    <input
                      id="input-sale-customer"
                      type="text"
                      placeholder="Contoh: Bu Ratna"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      No. WhatsApp (Opsional)
                    </label>
                    <input
                      id="input-sale-phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>

                {/* Live Calculation Summary */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                    <span>Harga Satuan:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatRupiah(unitPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                    <span>Total Nilai Omzet:</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 pt-1 border-t border-emerald-200/60 dark:border-emerald-900/60 font-medium">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Estimasi Laba Bersih:
                    </span>
                    <span className="font-semibold">+{formatRupiah(totalProfit)}</span>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan &amp; Buka WA</span>
                  </button>

                  <button
                    id="btn-submit-sale"
                    type="submit"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simpan Saja</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
