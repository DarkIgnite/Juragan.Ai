import React, { useState, useEffect } from 'react';
import { Product, UserAccount, ContentGenerationResult } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Instagram,
  MessageCircle,
  Video,
  Download,
  Store,
  Flame,
  CheckCircle2,
  Square,
  Smartphone,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiContentGeneratorViewProps {
  currentUser: UserAccount;
  products: Product[];
}

export const AiContentGeneratorView: React.FC<AiContentGeneratorViewProps> = ({
  currentUser,
  products,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [promoText, setPromoText] = useState<string>('Promo Spesial Hari Ini');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setCopied(false);

    try {
      const response = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          platform: aspectRatio === '9:16' ? 'tiktok' : 'instagram',
          tone: 'santai',
          specialOffer: promoText,
          storeName: currentUser.storeName,
        }),
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          setGeneratedContent(resJson.data);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat konten AI:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate initially on mount or when product changes
  useEffect(() => {
    if (selectedProduct) {
      handleGenerate();
    }
  }, [selectedProductId]);

  // High-resolution Canvas generator to download PNG
  const generatePosterBlob = async (): Promise<Blob | null> => {
    const width = 1080;
    const height = aspectRatio === '9:16' ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background base
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    // Draw product image
    await new Promise<void>((resolve) => {
      if (!selectedProduct?.imageUrl) {
        // Fallback gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(1, '#059669');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        resolve();
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const imgRatio = img.width / img.height;
          const targetRatio = width / height;
          let renderW = width;
          let renderH = height;
          let offsetX = 0;
          let offsetY = 0;

          if (imgRatio > targetRatio) {
            renderW = height * imgRatio;
            offsetX = -(renderW - width) / 2;
          } else {
            renderH = width / imgRatio;
            offsetY = -(renderH - height) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

          // Top dark gradient
          const topGrad = ctx.createLinearGradient(0, 0, 0, 240);
          topGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
          topGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = topGrad;
          ctx.fillRect(0, 0, width, 240);

          // Bottom dark gradient
          const bottomH = aspectRatio === '9:16' ? 950 : 620;
          const bottomGrad = ctx.createLinearGradient(0, height - bottomH, 0, height);
          bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
          bottomGrad.addColorStop(0.35, 'rgba(0,0,0,0.65)');
          bottomGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
          ctx.fillStyle = bottomGrad;
          ctx.fillRect(0, height - bottomH, width, bottomH);

          resolve();
        } catch {
          resolve();
        }
      };
      img.onerror = () => {
        resolve();
      };
      img.src = selectedProduct.imageUrl;
    });

    const padding = 64;

    // Header Store Pill
    const headerY = padding + 16;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(padding, headerY, 440, 72, 36);
    ctx.fill();

    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 28px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentUser.storeName, padding + 28, headerY + 36);
    ctx.restore();

    // Special Promo Tag (Top Right)
    if (promoText) {
      ctx.save();
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      const tagW = 320;
      ctx.roundRect(width - padding - tagW, headerY, tagW, 72, 36);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🔥 ${promoText}`, width - padding - tagW / 2, headerY + 36);
      ctx.restore();
    }

    // Call to action button at bottom
    const ctaHeight = 76;
    const ctaY = height - padding - ctaHeight;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(padding, ctaY, width - padding * 2, ctaHeight, 24);
    ctx.fill();

    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const wa = currentUser.whatsapp || '08xxxxxxxxxx';
    ctx.fillText(`📲 Pesan Sekarang via WhatsApp: ${wa}`, width / 2, ctaY + ctaHeight / 2);
    ctx.restore();

    // Tagline / Description
    let descY = ctaY - 28;
    const hookText = generatedContent?.hook || 'Rekomendasi terbaik dengan harga hemat khusus hari ini!';
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.font = 'normal 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(hookText.slice(0, 55) + (hookText.length > 55 ? '...' : ''), padding, descY);
    ctx.restore();

    // Product Name
    const titleY = descY - 48;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(selectedProduct?.name || 'Produk Unggulan', padding, titleY);
    ctx.restore();

    // Price Badge
    const priceH = 82;
    const priceY = titleY - 68 - priceH;
    const priceFormatted = formatRupiah(selectedProduct?.sellingPrice || 0);

    ctx.save();
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(padding, priceY, 360, priceH, 22);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(priceFormatted, padding + 32, priceY + priceH / 2);

    // Stock tag
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(padding + 380, priceY, 200, priceH, 22);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Stok ${selectedProduct?.stock} ${selectedProduct?.unit}`, padding + 380 + 100, priceY + priceH / 2);
    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  // 1. Download PNG
  const handleDownload = async () => {
    if (!selectedProduct) return;
    try {
      setIsExporting(true);
      const blob = await generatePosterBlob();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promo-${selectedProduct.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        try {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        showNotice('✅ Foto promo berhasil diunduh!');
      }
    } catch {
      showNotice('⚠️ Silakan coba unduh lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Share ke WhatsApp
  const handleShareWhatsApp = async () => {
    if (!selectedProduct) return;
    const text = `Halo Kak! Ada promo dari *${currentUser.storeName}*:\n\n✨ *${selectedProduct.name}*\n💰 Harga: *${formatRupiah(selectedProduct.sellingPrice)}*\n🏷️ Promo: *${promoText}*\n\n${generatedContent?.hook || ''}\n\nPesan sekarang ya Kak! 🙏`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    handleDownload();
    showNotice('💬 WhatsApp terbuka & foto promo diunduh!');
  };

  // 3. Share ke Instagram
  const handleShareInstagram = async () => {
    if (!selectedProduct) return;
    const fullCaption = `${generatedContent?.hook || ''}\n\n${generatedContent?.caption || ''}\n\n🏷️ Harga: ${formatRupiah(selectedProduct.sellingPrice)}\n📍 Toko: ${currentUser.storeName}\n\n${(generatedContent?.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullCaption);
    await handleDownload();
    showNotice('📸 Foto promo diunduh & Caption disalin untuk Instagram!');
  };

  // 4. Share ke TikTok
  const handleShareTikTok = async () => {
    if (!selectedProduct) return;
    const ttCaption = `Promo ${selectedProduct.name} cuma ${formatRupiah(selectedProduct.sellingPrice)}! ${promoText} 🔥 ${(generatedContent?.hashtags || []).slice(0, 4).join(' ')}`;
    navigator.clipboard.writeText(ttCaption);
    if (aspectRatio !== '9:16') setAspectRatio('9:16');
    await handleDownload();
    showNotice('🎵 Foto 9:16 diunduh & Caption TikTok disalin!');
  };

  // Copy caption only
  const handleCopyCaption = () => {
    if (!generatedContent) return;
    const text = `${generatedContent.caption}\n\n${(generatedContent.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showNotice('📋 Teks caption berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      {/* 1. KOTAK PEMBUATAN SIMPEL & TIDAK CROWDED */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Bikin Foto Promosi &amp; Caption</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pilih produk tokomu, AI langsung otomatis mendesain foto promosi dan teks siap posting.
            </p>
          </div>

          {/* Format Rasio Simpel */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                aspectRatio === '1:1'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Feed (1:1)</span>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Story/TikTok (9:16)</span>
            </button>
          </div>
        </div>

        {/* Baris Input Simpel: Produk + Info Promo + Tombol Refresh */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3.5 items-end">
          {/* Pilih Produk */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Produk yang Dipromosikan
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatRupiah(p.sellingPrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Tulisan Promo */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Teks Promo / Diskon
            </label>
            <input
              type="text"
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              placeholder="Contoh: Diskon 20%, Beli 2 Gratis 1"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Tombol Buat Ulang */}
          <div className="sm:col-span-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Memuat...' : 'Perbarui'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notifikasi */}
      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. HASIL DESAIN FOTO & TOMBOL BERBAGI (LEGA & JELAS) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* KOLOM KIRI: Visual Foto Promo (5 Kolom) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div
            className={`w-full max-w-sm relative rounded-2xl overflow-hidden shadow-sm border border-zinc-200 bg-zinc-900 select-none ${
              aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'
            }`}
          >
            {/* Foto Produk */}
            {selectedProduct?.imageUrl ? (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-800 text-white p-4 text-center">
                <Store className="w-10 h-10 mb-2 text-emerald-200" />
                <span className="text-sm font-bold">{selectedProduct?.name}</span>
              </div>
            )}

            {/* Gradient Bayangan */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none ${
              aspectRatio === '9:16' ? 'h-3/5' : 'h-1/2'
            }`} />

            {/* Atas: Nama Toko & Promo */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1.5 z-10">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-zinc-900 shadow-2xs">
                <Store className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[130px]">{currentUser.storeName}</span>
                <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
              </div>

              {promoText && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                  <Flame className="w-3 h-3 text-amber-300" />
                  <span className="truncate max-w-[110px]">{promoText}</span>
                </div>
              )}
            </div>

            {/* Bawah: Harga, Judul, & Tagline */}
            <div className="absolute bottom-3 inset-x-3 space-y-2 z-10 text-white">
              {/* Badge Harga */}
              <div className="flex items-center gap-1.5">
                <span className="px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 text-white font-mono shadow-xs">
                  {formatRupiah(selectedProduct?.sellingPrice || 0)}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                  Stok: {selectedProduct?.stock} {selectedProduct?.unit}
                </span>
              </div>

              {/* Nama Produk */}
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight drop-shadow-xs line-clamp-1">
                {selectedProduct?.name}
              </h3>

              {/* Tagline AI */}
              <p className="text-[11px] text-zinc-200 line-clamp-2 leading-relaxed">
                {generatedContent?.hook || 'Pilihan terbaik dengan harga hemat spesial untukmu!'}
              </p>

              {/* Tombol Pesan WA di gambar */}
              <div className="pt-0.5">
                <div className="w-full py-1.5 px-2.5 rounded-lg bg-white text-zinc-900 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>Pesan via WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Tombol Share & Teks Siap Kirim (7 Kolom) */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Card Tombol Share Langsung */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-zinc-900 block">
              1. Bagikan Langsung:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight">Kirim ke WhatsApp</div>
                  <div className="text-[10px] opacity-80 font-normal">Buka chat &amp; unduh foto</div>
                </div>
              </button>

              {/* Instagram */}
              <button
                onClick={handleShareInstagram}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight">Post ke Instagram</div>
                  <div className="text-[10px] opacity-80 font-normal">Unduh + salin caption</div>
                </div>
              </button>

              {/* TikTok */}
              <button
                onClick={handleShareTikTok}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight">Bagikan ke TikTok</div>
                  <div className="text-[10px] opacity-80 font-normal">Format 9:16 + tagar</div>
                </div>
              </button>

              {/* Unduh File PNG Saja */}
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-zinc-600 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight">
                    {isExporting ? 'Memproses...' : 'Unduh Gambar (PNG)'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">Simpan foto ke galeri</div>
                </div>
              </button>
            </div>
          </div>

          {/* Card Teks Caption AI */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">
                2. Naskah Caption Siap Pakai:
              </span>

              <button
                onClick={handleCopyCaption}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-zinc-400 animate-pulse">
                Sedang menyusun kata-kata promosi terbaik...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {generatedContent?.caption || 'Pilih produk untuk membuat caption promosi otomatis.'}
                </div>

                {/* Hashtag Ringkas */}
                {generatedContent?.hashtags && (
                  <div className="flex flex-wrap gap-1">
                    {generatedContent.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-zinc-100 text-zinc-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
