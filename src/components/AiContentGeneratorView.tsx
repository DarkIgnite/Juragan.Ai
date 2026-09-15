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
  CheckCircle2,
  Square,
  Smartphone,
  ExternalLink,
  Tag,
  LayoutTemplate,
  Leaf,
  Flame,
  Layers,
  X,
  Share2,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiContentGeneratorViewProps {
  currentUser: UserAccount;
  products: Product[];
}

export type PromoTemplateId = 'pinterest-arch' | 'olive-bistro' | 'terracotta-sale' | 'modern-clean';

interface TemplateConfig {
  id: PromoTemplateId;
  name: string;
  Icon: React.ElementType;
  tagline: string;
  badgeTag?: string;
  layoutStyle: 'arch' | 'card' | 'banner' | 'clean';
  colors: {
    bg: string;
    textDark: string;
    primary: string;
    secondary: string;
    accent: string;
    priceBg: string;
    priceText: string;
    ctaBg: string;
    ctaText: string;
    archBorder: string;
  };
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'pinterest-arch',
    name: 'Artisan Arch (Pinterest)',
    Icon: LayoutTemplate,
    tagline: 'Krem & Arch Melengkung',
    badgeTag: 'Format Pinterest',
    layoutStyle: 'arch',
    colors: {
      bg: '#FAF6ED',
      textDark: '#1C1B18',
      primary: '#C25E25', // Terracotta
      secondary: '#4A5D2E', // Olive Green
      accent: '#E5A93C', // Mustard
      priceBg: '#4A5D2E',
      priceText: '#FFFFFF',
      ctaBg: '#1C1B18',
      ctaText: '#FAF6ED',
      archBorder: '#C25E25',
    },
  },
  {
    id: 'olive-bistro',
    name: 'Olive Sage Bistro',
    Icon: Leaf,
    tagline: 'Zaitun & Emas Lembut',
    layoutStyle: 'arch',
    colors: {
      bg: '#F5F7F2',
      textDark: '#1E2818',
      primary: '#4A5D2E',
      secondary: '#C25E25',
      accent: '#D4A338',
      priceBg: '#C25E25',
      priceText: '#FFFFFF',
      ctaBg: '#4A5D2E',
      ctaText: '#FFFFFF',
      archBorder: '#4A5D2E',
    },
  },
  {
    id: 'terracotta-sale',
    name: 'Terracotta Promo',
    Icon: Flame,
    tagline: 'Burnt Orange & Diskon',
    layoutStyle: 'card',
    colors: {
      bg: '#FDF7F2',
      textDark: '#261208',
      primary: '#C84C1C',
      secondary: '#D97706',
      accent: '#F59E0B',
      priceBg: '#C84C1C',
      priceText: '#FFFFFF',
      ctaBg: '#261208',
      ctaText: '#FFFFFF',
      archBorder: '#C84C1C',
    },
  },
  {
    id: 'modern-clean',
    name: 'Studio Minimalis',
    Icon: Layers,
    tagline: 'Bersih & Kontras Modern',
    layoutStyle: 'clean',
    colors: {
      bg: '#F8FAFC',
      textDark: '#0F172A',
      primary: '#059669',
      secondary: '#0284C7',
      accent: '#F59E0B',
      priceBg: '#059669',
      priceText: '#FFFFFF',
      ctaBg: '#0F172A',
      ctaText: '#FFFFFF',
      archBorder: '#E2E8F0',
    },
  },
];

interface PostGuideModalState {
  isOpen: boolean;
  platform: 'instagram' | 'tiktok';
  targetUrl: string;
  caption: string;
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
  const [selectedTemplate, setSelectedTemplate] = useState<PromoTemplateId>('pinterest-arch');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [postGuide, setPostGuide] = useState<PostGuideModalState>({
    isOpen: false,
    platform: 'instagram',
    targetUrl: '',
    caption: '',
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

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
          tone: selectedTemplate === 'terracotta-sale' ? 'persuasif' : 'santai',
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

  useEffect(() => {
    if (selectedProduct) {
      handleGenerate();
    }
  }, [selectedProductId, selectedTemplate]);

  // High-resolution Canvas generator matching the Pinterest / Artisan Arch aesthetic
  const generatePosterBlob = async (forceRatio?: '1:1' | '9:16'): Promise<Blob | null> => {
    const ratioToUse = forceRatio || aspectRatio;
    const width = 1080;
    const height = ratioToUse === '9:16' ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const c = activeTemplate.colors;

    // 1. Draw Canvas Background (Warm Cream / Linen base)
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, width, height);

    // Decorative subtle geometric dots
    ctx.save();
    ctx.fillStyle = c.primary;
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(60 + i * 20, 60, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width - 140 + i * 20, height - 60, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Calculate Arch Frame Dimensions
    let archW: number;
    let archH: number;
    let archX: number;
    let archY: number;
    let radius: number;

    if (ratioToUse === '9:16') {
      archW = 860;
      archH = 960;
      archX = (width - archW) / 2;
      archY = 320;
      radius = archW / 2;
    } else {
      archW = 680;
      archH = 550;
      archX = (width - archW) / 2;
      archY = 200;
      radius = archW / 2;
    }

    // 3. Draw Product Image inside Arch Cutout
    await new Promise<void>((resolve) => {
      if (!selectedProduct?.imageUrl) {
        ctx.save();
        ctx.fillStyle = '#E5E0D5';
        ctx.beginPath();
        drawArchPath(ctx, archX, archY, archW, archH, radius);
        ctx.fill();
        ctx.restore();
        resolve();
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          ctx.save();
          ctx.beginPath();
          drawArchPath(ctx, archX, archY, archW, archH, radius);
          ctx.clip();

          const imgRatio = img.width / img.height;
          const targetRatio = archW / archH;
          let renderW = archW;
          let renderH = archH;
          let offsetX = archX;
          let offsetY = archY;

          if (imgRatio > targetRatio) {
            renderW = archH * imgRatio;
            offsetX = archX - (renderW - archW) / 2;
          } else {
            renderH = archW / imgRatio;
            offsetY = archY - (renderH - archH) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

          // Subtle gradient at the bottom of the arch
          const bottomGrad = ctx.createLinearGradient(0, archY + archH - 160, 0, archY + archH);
          bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
          bottomGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
          ctx.fillStyle = bottomGrad;
          ctx.fillRect(archX, archY + archH - 160, archW, 160);

          ctx.restore();
          resolve();
        } catch {
          resolve();
        }
      };
      img.onerror = () => resolve();
      img.src = selectedProduct.imageUrl;
    });

    // 4. Draw Arch Border
    ctx.save();
    ctx.strokeStyle = c.archBorder;
    ctx.lineWidth = 10;
    ctx.beginPath();
    drawArchPath(ctx, archX, archY, archW, archH, radius);
    ctx.stroke();
    ctx.restore();

    // 5. Header: Clean typography without emojis
    ctx.save();
    ctx.fillStyle = c.textDark;
    ctx.textAlign = 'center';

    const storePillY = ratioToUse === '9:16' ? 90 : 54;
    ctx.font = '600 22px sans-serif';
    ctx.fillText(`• ${currentUser.storeName.toUpperCase()} •`, width / 2, storePillY);

    const titleY = ratioToUse === '9:16' ? 180 : 124;
    ctx.font = '900 56px sans-serif';
    ctx.fillStyle = c.primary;
    ctx.fillText('MENU SPESIAL', width / 2, titleY);

    const subY = titleY + 44;
    ctx.font = '600 22px sans-serif';
    ctx.fillStyle = c.textDark;
    ctx.fillText('CITA RASA TERBAIK • REKOMENDASI JUARA', width / 2, subY);
    ctx.restore();

    // 6. Floating Promo Seal (Clean vector badge)
    if (promoText) {
      const stickerX = archX + archW - 40;
      const stickerY = archY + 40;
      const stickerR = 75;

      ctx.save();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(stickerX, stickerY, stickerR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(stickerX, stickerY, stickerR - 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = c.textDark;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('PROMO', stickerX, stickerY - 16);
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = c.primary;
      const cleanPromo = promoText.slice(0, 14);
      ctx.fillText(cleanPromo, stickerX, stickerY + 14);
      ctx.restore();
    }

    // 7. Bottom Content
    let bottomStartY = archY + archH + (ratioToUse === '9:16' ? 50 : 30);

    ctx.save();
    ctx.fillStyle = c.textDark;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(selectedProduct?.name || 'Produk Favorit', width / 2, bottomStartY);

    const hookY = bottomStartY + 64;
    const hook = generatedContent?.hook || 'Pilihan lezat dengan bahan berkualitas tinggi.';
    ctx.font = 'normal 26px sans-serif';
    ctx.fillStyle = '#4A4639';
    ctx.fillText(hook.slice(0, 56) + (hook.length > 56 ? '...' : ''), width / 2, hookY);
    ctx.restore();

    // Price Badge
    const priceY = hookY + 46;
    const priceFormatted = formatRupiah(selectedProduct?.sellingPrice || 0);
    const badgeW = 340;
    const badgeH = 74;
    const badgeX = (width - badgeW) / 2;

    ctx.save();
    ctx.fillStyle = c.priceBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, priceY, badgeW, badgeH, 37);
    ctx.fill();

    ctx.fillStyle = c.priceText;
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(priceFormatted, width / 2, priceY + badgeH / 2);
    ctx.restore();

    // Clean CTA Bar (No phone emoji)
    const ctaH = 80;
    const ctaY = height - (ratioToUse === '9:16' ? 120 : 90);
    const ctaMargin = 70;
    const ctaW = width - ctaMargin * 2;

    ctx.save();
    ctx.fillStyle = c.ctaBg;
    ctx.beginPath();
    ctx.roundRect(ctaMargin, ctaY, ctaW, ctaH, 24);
    ctx.fill();

    ctx.fillStyle = c.ctaText;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const wa = currentUser.whatsapp || '08xxxxxxxxxx';
    ctx.fillText(`Pesan via WhatsApp: ${wa}`, width / 2, ctaY + ctaH / 2);
    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const drawArchPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    const bottomRadius = 24;
    ctx.beginPath();
    ctx.arc(x + r, y + r, r, Math.PI, 0, false);
    ctx.lineTo(x + w, y + h - bottomRadius);
    ctx.arcTo(x + w, y + h, x + w - bottomRadius, y + h, bottomRadius);
    ctx.lineTo(x + bottomRadius, y + h);
    ctx.arcTo(x, y + h, x, y + h - bottomRadius, bottomRadius);
    ctx.closePath();
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
        a.download = `poster-${selectedTemplate}-${selectedProduct.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        try {
          confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        showNotice(`Poster gaya "${activeTemplate.name}" berhasil diunduh.`);
      }
    } catch {
      showNotice('Silakan coba unduh lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Share WhatsApp (Langsung buka chat dengan teks & unduh foto)
  const handleShareWhatsApp = async () => {
    if (!selectedProduct) return;
    const text = `Halo Kak! Ada penawaran dari *${currentUser.storeName}*:\n\n*${selectedProduct.name}*\nHarga: *${formatRupiah(selectedProduct.sellingPrice)}*\nPromo: *${promoText}*\n\n${generatedContent?.hook || ''}\n\nSilakan pesan sekarang ya Kak.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    await handleDownload();
    showNotice('WhatsApp terbuka dan foto promo telah diunduh.');
  };

  // 3. Share Instagram (Buka Instagram sungguhan + Web Share API + Unduh foto + Salin caption)
  const handleShareInstagram = async () => {
    if (!selectedProduct) return;
    setIsExporting(true);
    try {
      const fullCaption = `${generatedContent?.hook || ''}\n\n${generatedContent?.caption || ''}\n\nHarga: ${formatRupiah(selectedProduct.sellingPrice)}\nToko: ${currentUser.storeName}\n\n${(generatedContent?.hashtags || []).join(' ')}`;

      // 1. Salin caption otomatis
      try {
        await navigator.clipboard.writeText(fullCaption);
      } catch {
        // clipboard fallback
      }

      // 2. Buat Blob file gambar
      const blob = await generatePosterBlob();
      let file: File | null = null;
      const fileName = `poster-instagram-${selectedProduct.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      if (blob) {
        file = new File([blob], fileName, { type: 'image/png' });
      }

      // 3. Coba Web Share API (jika di perangkat mobile, ini langsung membuka Instagram post creator)
      let sharedViaNative = false;
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: selectedProduct.name,
            text: fullCaption,
          });
          sharedViaNative = true;
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.warn('Native share failed:', err);
          }
        }
      }

      // 4. Jika desktop/browser biasa: Unduh file & buka langsung halaman Instagram
      if (!sharedViaNative) {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        // Buka Instagram langsung di tab baru
        window.open('https://www.instagram.com/', '_blank');

        // Buka panduan bantuan langsung
        setPostGuide({
          isOpen: true,
          platform: 'instagram',
          targetUrl: 'https://www.instagram.com/',
          caption: fullCaption,
        });
      }

      showNotice('Instagram dibuka. Foto telah diunduh dan caption tersalin di clipboard.');
    } catch {
      showNotice('Gagal menyiapkan postingan Instagram.');
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Share TikTok (Buka TikTok Upload sungguhan + format 9:16 + Web Share API + unduh foto + salin caption)
  const handleShareTikTok = async () => {
    if (!selectedProduct) return;
    setIsExporting(true);
    try {
      if (aspectRatio !== '9:16') {
        setAspectRatio('9:16');
      }

      const ttCaption = `Promo ${selectedProduct.name} hanya ${formatRupiah(selectedProduct.sellingPrice)}. ${promoText} ${(generatedContent?.hashtags || []).slice(0, 4).join(' ')}`;

      // 1. Salin caption TikTok
      try {
        await navigator.clipboard.writeText(ttCaption);
      } catch {
        // clipboard fallback
      }

      // 2. Generate blob 9:16
      const blob = await generatePosterBlob('9:16');
      let file: File | null = null;
      const fileName = `poster-tiktok-${selectedProduct.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      if (blob) {
        file = new File([blob], fileName, { type: 'image/png' });
      }

      // 3. Coba Web Share API
      let sharedViaNative = false;
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: selectedProduct.name,
            text: ttCaption,
          });
          sharedViaNative = true;
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.warn('Native share TikTok failed:', err);
          }
        }
      }

      // 4. Jika desktop/browser biasa: Unduh file 9:16 & buka langsung halaman TikTok Upload
      if (!sharedViaNative) {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        // Buka langsung creator upload TikTok resmi
        window.open('https://www.tiktok.com/upload', '_blank');

        // Tampilkan modal bantuan
        setPostGuide({
          isOpen: true,
          platform: 'tiktok',
          targetUrl: 'https://www.tiktok.com/upload',
          caption: ttCaption,
        });
      }

      showNotice('TikTok Upload dibuka. Poster 9:16 diunduh dan caption tersalin.');
    } catch {
      showNotice('Gagal menyiapkan postingan TikTok.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCaption = () => {
    if (!generatedContent) return;
    const text = `${generatedContent.caption}\n\n${(generatedContent.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showNotice('Naskah caption berhasil disalin ke clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      {/* 1. KOTAK KONTROL FORMULIR SIMPEL */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Desain Foto Promosi &amp; Caption</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                Format Poster Kuliner
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pilih produk dan template poster, AI otomatis membuat grafis promosi siap tayang.
            </p>
          </div>

          {/* Format Rasio */}
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

        {/* Input Baris: Produk + Info Promo + Tombol Refresh */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3.5 items-end">
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
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. HASIL DESAIN FOTO & TOMBOL BERBAGI */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* KOLOM KIRI: Visual Foto Promo Sesuai Contoh Pinterest (5 Kolom) */}
        <div className="md:col-span-5 flex flex-col items-center">
          {/* PILIHAN TEMPLATE FOTO DENGAN VECTOR ICON */}
          <div className="w-full max-w-sm mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Pilih Template Desain:
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {activeTemplate.tagline}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TEMPLATES.map((t) => {
                const IconComponent = t.Icon;
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-zinc-900 text-white shadow-xs scale-[1.02]'
                        : 'bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 ${
                        isSelected ? 'text-white' : 'text-zinc-500'
                      }`}
                    />
                    <span className="text-[11px] leading-tight font-medium text-center truncate w-full">
                      {t.name}
                    </span>
                    {t.badgeTag && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-800 font-medium border border-zinc-200 tracking-tight">
                        {t.badgeTag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* KARTU PREVIEW FOTO PROMO (Sesuai Gaya Pinterest Arch & Linen) */}
          <div
            style={{ backgroundColor: activeTemplate.colors.bg }}
            className={`w-full max-w-sm relative rounded-2xl overflow-hidden shadow-sm border border-zinc-200 select-none p-4 flex flex-col justify-between ${
              aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'
            }`}
          >
            {/* Header Toko & Judul Atas */}
            <div className="text-center pt-1">
              <div className="text-[10px] font-bold tracking-widest text-zinc-700 uppercase">
                • {currentUser.storeName} •
              </div>
              <h2
                style={{ color: activeTemplate.colors.primary }}
                className="text-lg font-black tracking-tight mt-0.5 uppercase"
              >
                MENU SPESIAL
              </h2>
              <div className="text-[9px] font-medium text-zinc-600 tracking-wide">
                CITA RASA TERBAIK • REKOMENDASI JUARA
              </div>
            </div>

            {/* JENDELA ARCH FOTO (Signature Bentuk Melengkung Pinterest) */}
            <div className="relative mx-auto w-full flex-1 my-2 flex items-center justify-center">
              <div
                style={{ borderColor: activeTemplate.colors.archBorder }}
                className="relative w-4/5 h-full max-h-56 sm:max-h-64 rounded-t-[999px] rounded-b-xl border-4 overflow-hidden shadow-xs bg-zinc-100"
              >
                {selectedProduct?.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-white p-2 text-center">
                    <Store className="w-8 h-8 mb-1 text-zinc-300" />
                    <span className="text-xs font-bold">{selectedProduct?.name}</span>
                  </div>
                )}

                {/* Bayangan halus di bawah arch */}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Floating Sticker Promo (Top Right of Arch) */}
              {promoText && (
                <div
                  style={{
                    backgroundColor: activeTemplate.colors.accent,
                    color: activeTemplate.colors.textDark,
                  }}
                  className="absolute -top-1.5 right-3 w-14 h-14 rounded-full border-2 border-white shadow-sm flex flex-col items-center justify-center p-1 text-center animate-in zoom-in-95 duration-200 z-10"
                >
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-80 leading-none">
                    PROMO
                  </span>
                  <span
                    style={{ color: activeTemplate.colors.primary }}
                    className="text-[11px] font-black leading-tight truncate max-w-[48px]"
                  >
                    {promoText}
                  </span>
                </div>
              )}
            </div>

            {/* Bawah: Nama Produk, Deskripsi, Badge Harga, & CTA WhatsApp */}
            <div className="space-y-2 text-center pb-1">
              <div>
                <h3
                  style={{ color: activeTemplate.colors.textDark }}
                  className="text-sm sm:text-base font-extrabold line-clamp-1 leading-tight"
                >
                  {selectedProduct?.name}
                </h3>
                <p className="text-[10px] text-zinc-600 line-clamp-1 mt-0.5">
                  {generatedContent?.hook || 'Pilihan lezat dengan bahan berkualitas tinggi.'}
                </p>
              </div>

              {/* Badge Harga Bulat / Pill */}
              <div className="flex justify-center">
                <div
                  style={{
                    backgroundColor: activeTemplate.colors.priceBg,
                    color: activeTemplate.colors.priceText,
                  }}
                  className="px-4 py-1 rounded-full text-xs sm:text-sm font-mono font-extrabold shadow-2xs tracking-wide"
                >
                  {formatRupiah(selectedProduct?.sellingPrice || 0)}
                </div>
              </div>

              {/* Tombol Pesan WhatsApp di Footer Poster */}
              <div
                style={{
                  backgroundColor: activeTemplate.colors.ctaBg,
                  color: activeTemplate.colors.ctaText,
                }}
                className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pesan Sekarang via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Tombol Share & Teks Siap Kirim (7 Kolom) */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Card Tombol Share Langsung */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-zinc-900 block">
              1. Publikasikan &amp; Bagikan Langsung:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight flex items-center gap-1">
                    <span>Kirim ke WhatsApp</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                  </div>
                  <div className="text-[10px] opacity-80 font-normal">Buka chat &amp; unduh foto</div>
                </div>
              </button>

              {/* Instagram (Buka Instagram sungguhan + Salin caption + Unduh foto) */}
              <button
                onClick={handleShareInstagram}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight flex items-center gap-1">
                    <span>Buka &amp; Post ke Instagram</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                  </div>
                  <div className="text-[10px] opacity-80 font-normal">Unduh foto, salin teks &amp; buka IG</div>
                </div>
              </button>

              {/* TikTok (Buka TikTok Upload sungguhan + Format 9:16 + Unduh foto + Salin caption) */}
              <button
                onClick={handleShareTikTok}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight flex items-center gap-1">
                    <span>Buka &amp; Post ke TikTok</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                  </div>
                  <div className="text-[10px] opacity-80 font-normal">Format 9:16, buka TikTok Studio</div>
                </div>
              </button>

              {/* Unduh File PNG Saja */}
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-zinc-600 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight">
                    {isExporting ? 'Memproses...' : 'Unduh Poster (PNG)'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-normal">Resolusi tinggi 1080px</div>
                </div>
              </button>
            </div>
          </div>

          {/* Card Teks Caption AI */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                <span>2. Naskah Caption Siap Pakai:</span>
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

      {/* MODAL PANDUAN LANGSUNG POSTING INSTAGRAM / TIKTOK */}
      {postGuide.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-zinc-200 space-y-4 animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl text-white ${
                    postGuide.platform === 'instagram'
                      ? 'bg-gradient-to-tr from-pink-600 to-purple-600'
                      : 'bg-zinc-900'
                  }`}
                >
                  {postGuide.platform === 'instagram' ? (
                    <Instagram className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {postGuide.platform === 'instagram'
                      ? 'Membuka Postingan Instagram'
                      : 'Membuka Unggahan TikTok'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Langkah praktis untuk menerbitkan poster promosi Anda
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPostGuide((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist Langkah Praktis */}
            <div className="space-y-2.5 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900">1. Foto Poster Telah Diunduh:</span>
                  <p className="text-zinc-600 mt-0.5">
                    File gambar telah tersimpan di folder Download perangkat Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900">2. Naskah Caption Telah Disalin:</span>
                  <p className="text-zinc-600 mt-0.5">
                    Teks promosi beserta tagar sudah siap ditempel (paste) di kolom caption.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900">
                    3. Buka Tab {postGuide.platform === 'instagram' ? 'Instagram' : 'TikTok'}:
                  </span>
                  <p className="text-zinc-600 mt-0.5">
                    {postGuide.platform === 'instagram'
                      ? 'Klik tombol Buat Post (+) di Instagram, pilih foto yang baru diunduh, lalu tempel (Paste) caption.'
                      : 'Halaman TikTok Studio/Upload terbuka. Unggah foto vertikal dan tempel caption.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => window.open(postGuide.targetUrl, '_blank')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka {postGuide.platform === 'instagram' ? 'Instagram' : 'TikTok'} Lagi</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(postGuide.caption);
                  showNotice('Naskah caption disalin kembali ke clipboard.');
                }}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Ulang Teks</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
