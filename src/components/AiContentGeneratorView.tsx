import React, { useState, useEffect } from 'react';
import { Product, UserAccount, ContentGenerationResult } from '../types';
import { formatRupiah } from '../utils/formatters';
import { getAiHeaders } from '../lib/geminiKey';
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
  Crown,
  Heart,
  Zap,
  ShoppingBag,
  Cpu,
  Sprout,
  Palette,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiContentGeneratorViewProps {
  currentUser: UserAccount;
  products: Product[];
}

export type PromoTemplateId =
  | 'pinterest-arch'
  | 'olive-bistro'
  | 'terracotta-sale'
  | 'midnight-luxury'
  | 'pastel-bakery'
  | 'street-food-neon'
  | 'modern-clean'
  | 'batik-nusantara'
  | 'cyber-teal'
  | 'fresh-agro';

export type TemplateLayoutStyle = 'arch' | 'card' | 'luxury' | 'neon' | 'clean' | 'circle';

interface TemplateConfig {
  id: PromoTemplateId;
  name: string;
  category: string;
  Icon: React.ElementType;
  tagline: string;
  badgeTag?: string;
  headline: string;
  subheadline: string;
  layoutStyle: TemplateLayoutStyle;
  isDark?: boolean;
  colors: {
    bg: string;
    textDark: string;
    textMuted: string;
    primary: string;
    secondary: string;
    accent: string;
    accentText?: string;
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
    name: 'Artisan Arch',
    category: 'Cafe & Bakery',
    Icon: LayoutTemplate,
    tagline: 'Krem Linen & Arch Melengkung',
    badgeTag: 'Pinterest',
    headline: 'MENU SPESIAL',
    subheadline: 'CITA RASA TERBAIK • REKOMENDASI JUARA',
    layoutStyle: 'arch',
    colors: {
      bg: '#FAF6ED',
      textDark: '#1C1B18',
      textMuted: '#57534E',
      primary: '#C25E25', // Terracotta
      secondary: '#4A5D2E', // Olive Green
      accent: '#E5A93C', // Mustard
      accentText: '#1C1B18',
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
    category: 'Healthy & Cafe',
    Icon: Leaf,
    tagline: 'Zaitun & Emas Lembut',
    badgeTag: 'Organik',
    headline: 'PILIHAN SEHAT',
    subheadline: 'SEGAR • HIGIENIS • KUALITAS TERBAIK',
    layoutStyle: 'arch',
    colors: {
      bg: '#F5F7F2',
      textDark: '#1E2818',
      textMuted: '#4E5D46',
      primary: '#4A5D2E',
      secondary: '#C25E25',
      accent: '#D4A338',
      accentText: '#1E2818',
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
    category: 'Diskon Kilat',
    Icon: Flame,
    tagline: 'Burnt Orange & Flash Sale',
    badgeTag: 'Diskon',
    headline: 'DISKON SPESIAL',
    subheadline: 'HEMAT HARI INI • JANGAN SAMPAI KEHABISAN',
    layoutStyle: 'card',
    colors: {
      bg: '#FDF7F2',
      textDark: '#261208',
      textMuted: '#6C3C24',
      primary: '#C84C1C',
      secondary: '#D97706',
      accent: '#F59E0B',
      accentText: '#261208',
      priceBg: '#C84C1C',
      priceText: '#FFFFFF',
      ctaBg: '#261208',
      ctaText: '#FFFFFF',
      archBorder: '#C84C1C',
    },
  },
  {
    id: 'midnight-luxury',
    name: 'Midnight Luxury',
    category: 'Premium & Elegan',
    Icon: Crown,
    tagline: 'Emas Mewah & Hitam Obsidian',
    badgeTag: 'Elegan',
    headline: 'EXCLUSIVE EDITION',
    subheadline: 'KUALITAS TINGGI • KEMEWAHAN SEJATI',
    layoutStyle: 'luxury',
    isDark: true,
    colors: {
      bg: '#111215',
      textDark: '#F8FAFC',
      textMuted: '#94A3B8',
      primary: '#F59E0B', // Amber Gold
      secondary: '#FBBF24',
      accent: '#D97706',
      accentText: '#FFFFFF',
      priceBg: '#F59E0B',
      priceText: '#0F172A',
      ctaBg: '#F8FAFC',
      ctaText: '#0F172A',
      archBorder: '#D97706',
    },
  },
  {
    id: 'pastel-bakery',
    name: 'Pastel Bakery',
    category: 'Kue, Boba & Manis',
    Icon: Heart,
    tagline: 'Soft Rose & Honey Manis',
    badgeTag: 'Manis',
    headline: 'SWEET DELIGHTS',
    subheadline: 'MANISNYA PAS • BIKIN MOOD HAPPY',
    layoutStyle: 'circle',
    colors: {
      bg: '#FFF5F7',
      textDark: '#4C1D2F',
      textMuted: '#834057',
      primary: '#E11D48',
      secondary: '#FB7185',
      accent: '#FBBF24',
      accentText: '#4C1D2F',
      priceBg: '#E11D48',
      priceText: '#FFFFFF',
      ctaBg: '#4C1D2F',
      ctaText: '#FFFFFF',
      archBorder: '#FB7185',
    },
  },
  {
    id: 'street-food-neon',
    name: 'Street Food Pop',
    category: 'Geprek & Street Food',
    Icon: Zap,
    tagline: 'Kuning & Merah Enerjik',
    badgeTag: 'Hot',
    headline: 'SUPER LEZAT',
    subheadline: 'PEDAS GURIH • BIKIN KETAGIHAN',
    layoutStyle: 'neon',
    colors: {
      bg: '#FEFCE8',
      textDark: '#18181B',
      textMuted: '#52525B',
      primary: '#DC2626',
      secondary: '#F59E0B',
      accent: '#FACC15',
      accentText: '#18181B',
      priceBg: '#DC2626',
      priceText: '#FFFFFF',
      ctaBg: '#18181B',
      ctaText: '#FEFCE8',
      archBorder: '#18181B',
    },
  },
  {
    id: 'modern-clean',
    name: 'Studio Minimalis',
    category: 'Minimalis Modern',
    Icon: Layers,
    tagline: 'Putih Bersih & Emerald Kontras',
    badgeTag: 'Clean',
    headline: 'BEST COLLECTION',
    subheadline: 'DESAIN BERKELAS • KUALITAS TERBAIK',
    layoutStyle: 'clean',
    colors: {
      bg: '#F8FAFC',
      textDark: '#0F172A',
      textMuted: '#475569',
      primary: '#059669',
      secondary: '#0284C7',
      accent: '#F59E0B',
      accentText: '#0F172A',
      priceBg: '#059669',
      priceText: '#FFFFFF',
      ctaBg: '#0F172A',
      ctaText: '#FFFFFF',
      archBorder: '#CBD5E1',
    },
  },
  {
    id: 'batik-nusantara',
    name: 'Batik Nusantara',
    category: 'Heritage & Kriya',
    Icon: ShoppingBag,
    tagline: 'Cokelat Kayu & Emas Tembaga',
    badgeTag: 'Etnik',
    headline: 'KARYA NUSANTARA',
    subheadline: 'WARISAN BUDAYA • SENTUHAN MODERN',
    layoutStyle: 'arch',
    colors: {
      bg: '#FAF3EA',
      textDark: '#29180C',
      textMuted: '#634731',
      primary: '#854D0E',
      secondary: '#A16207',
      accent: '#D97706',
      accentText: '#FFFFFF',
      priceBg: '#854D0E',
      priceText: '#FFFFFF',
      ctaBg: '#29180C',
      ctaText: '#FAF3EA',
      archBorder: '#854D0E',
    },
  },
  {
    id: 'cyber-teal',
    name: 'Cyber Tech',
    category: 'Gadget & Distro',
    Icon: Cpu,
    tagline: 'Dark Navy & Neon Cyan',
    badgeTag: 'Cyber',
    headline: 'NEW ARRIVAL',
    subheadline: 'PERFORMA TINGGI • GAYA MAKSIMAL',
    layoutStyle: 'neon',
    isDark: true,
    colors: {
      bg: '#0A0F1D',
      textDark: '#FFFFFF',
      textMuted: '#94A3B8',
      primary: '#06B6D4',
      secondary: '#3B82F6',
      accent: '#10B981',
      accentText: '#0A0F1D',
      priceBg: '#06B6D4',
      priceText: '#0A0F1D',
      ctaBg: '#06B6D4',
      ctaText: '#0A0F1D',
      archBorder: '#06B6D4',
    },
  },
  {
    id: 'fresh-agro',
    name: 'Fresh Agro',
    category: 'Segar & Organik',
    Icon: Sprout,
    tagline: 'Hijau Daun & Lemon Segar',
    badgeTag: 'Fresh',
    headline: 'SEGAR & ALAMI',
    subheadline: 'DIPETIK SEGAR • KUALITAS TERJAMIN',
    layoutStyle: 'card',
    colors: {
      bg: '#F0FDF4',
      textDark: '#14532D',
      textMuted: '#166534',
      primary: '#16A34A',
      secondary: '#65A30D',
      accent: '#FACC15',
      accentText: '#14532D',
      priceBg: '#16A34A',
      priceText: '#FFFFFF',
      ctaBg: '#14532D',
      ctaText: '#FFFFFF',
      archBorder: '#16A34A',
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
        headers: getAiHeaders(),
        body: JSON.stringify({
          product: selectedProduct,
          platform: aspectRatio === '9:16' ? 'tiktok' : 'instagram',
          tone: getToneFromTemplate(selectedTemplate),
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

  const getToneFromTemplate = (tId: PromoTemplateId): string => {
    switch (tId) {
      case 'terracotta-sale':
      case 'street-food-neon':
        return 'persuasif';
      case 'midnight-luxury':
        return 'profesional';
      case 'pastel-bakery':
        return 'ramah';
      case 'cyber-teal':
        return 'modern';
      case 'batik-nusantara':
        return 'elegan';
      case 'fresh-agro':
        return 'segar';
      default:
        return 'santai';
    }
  };

  const drawFramePath = (
    ctx: CanvasRenderingContext2D,
    style: TemplateLayoutStyle,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    if (style === 'arch') {
      const bottomRadius = 24;
      ctx.arc(x + r, y + r, r, Math.PI, 0, false);
      ctx.lineTo(x + w, y + h - bottomRadius);
      ctx.arcTo(x + w, y + h, x + w - bottomRadius, y + h, bottomRadius);
      ctx.lineTo(x + bottomRadius, y + h);
      ctx.arcTo(x, y + h, x, y + h - bottomRadius, bottomRadius);
      ctx.closePath();
    } else if (style === 'circle') {
      const circleR = Math.min(w, h) / 2;
      ctx.arc(x + w / 2, y + h / 2, circleR, 0, Math.PI * 2);
      ctx.closePath();
    } else if (style === 'luxury') {
      ctx.roundRect(x, y, w, h, 28);
    } else if (style === 'neon') {
      ctx.roundRect(x, y, w, h, 36);
    } else if (style === 'clean') {
      ctx.roundRect(x, y, w, h, 24);
    } else {
      ctx.roundRect(x, y, w, h, 44);
    }
  };

  // High-resolution Canvas generator matching the selected template layout and colors
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

    // 1. Draw Canvas Background
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, width, height);

    // Decorative subtle geometric dots
    ctx.save();
    ctx.fillStyle = activeTemplate.isDark ? '#F8FAFC' : c.primary;
    ctx.globalAlpha = activeTemplate.isDark ? 0.08 : 0.12;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(60 + i * 20, 60, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width - 140 + i * 20, height - 60, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Calculate Frame Dimensions according to layoutStyle and aspect ratio
    const is916 = ratioToUse === '9:16';
    let frameW: number;
    let frameH: number;
    let frameX: number;
    let frameY: number;
    let radius: number;

    if (activeTemplate.layoutStyle === 'circle') {
      if (is916) {
        frameW = 740;
        frameH = 740;
        frameX = (width - frameW) / 2;
        frameY = 360;
      } else {
        // Feed 1:1 - compact circle so bottom content never gets cut off
        frameW = 400;
        frameH = 400;
        frameX = (width - frameW) / 2;
        frameY = 175;
      }
      radius = frameW / 2;
    } else if (is916) {
      frameW = 860;
      frameH = 920;
      frameX = (width - frameW) / 2;
      frameY = 320;
      radius = frameW / 2;
    } else {
      // Feed 1:1 - compact height so bottom content has generous breathing room
      frameW = 620;
      frameH = 410;
      frameX = (width - frameW) / 2;
      frameY = 175;
      radius = frameW / 2;
    }

    // 2b. If neon pop style, draw solid offset shadow behind frame
    if (activeTemplate.layoutStyle === 'neon') {
      ctx.save();
      ctx.fillStyle = '#18181B';
      const shadowOffset = is916 ? 16 : 12;
      drawFramePath(ctx, activeTemplate.layoutStyle, frameX + shadowOffset, frameY + shadowOffset, frameW, frameH, radius);
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw Product Image inside Cutout
    await new Promise<void>((resolve) => {
      if (!selectedProduct?.imageUrl) {
        ctx.save();
        ctx.fillStyle = activeTemplate.isDark ? '#1E293B' : '#E5E0D5';
        drawFramePath(ctx, activeTemplate.layoutStyle, frameX, frameY, frameW, frameH, radius);
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
          drawFramePath(ctx, activeTemplate.layoutStyle, frameX, frameY, frameW, frameH, radius);
          ctx.clip();

          const imgRatio = img.width / img.height;
          const targetRatio = frameW / frameH;
          let renderW = frameW;
          let renderH = frameH;
          let offsetX = frameX;
          let offsetY = frameY;

          if (imgRatio > targetRatio) {
            renderW = frameH * imgRatio;
            offsetX = frameX - (renderW - frameW) / 2;
          } else {
            renderH = frameW / imgRatio;
            offsetY = frameY - (renderH - frameH) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

          // Subtle gradient at the bottom of the photo frame
          const bottomGrad = ctx.createLinearGradient(0, frameY + frameH - 160, 0, frameY + frameH);
          bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
          bottomGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
          ctx.fillStyle = bottomGrad;
          ctx.fillRect(frameX, frameY + frameH - 160, frameW, 160);

          ctx.restore();
          resolve();
        } catch {
          resolve();
        }
      };
      img.onerror = () => resolve();
      img.src = selectedProduct.imageUrl;
    });

    // 4. Draw Frame Border
    ctx.save();
    if (activeTemplate.layoutStyle === 'neon') {
      ctx.strokeStyle = c.archBorder;
      ctx.lineWidth = is916 ? 12 : 9;
      drawFramePath(ctx, activeTemplate.layoutStyle, frameX, frameY, frameW, frameH, radius);
      ctx.stroke();
    } else if (activeTemplate.layoutStyle === 'luxury') {
      ctx.strokeStyle = c.archBorder;
      ctx.lineWidth = is916 ? 8 : 6;
      drawFramePath(ctx, activeTemplate.layoutStyle, frameX, frameY, frameW, frameH, radius);
      ctx.stroke();

      // Delicate inner gold border
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 2;
      drawFramePath(
        ctx,
        activeTemplate.layoutStyle,
        frameX + (is916 ? 10 : 8),
        frameY + (is916 ? 10 : 8),
        frameW - (is916 ? 20 : 16),
        frameH - (is916 ? 20 : 16),
        Math.max(8, radius - 10)
      );
      ctx.stroke();
    } else {
      ctx.strokeStyle = c.archBorder;
      ctx.lineWidth = is916 ? 10 : 8;
      drawFramePath(ctx, activeTemplate.layoutStyle, frameX, frameY, frameW, frameH, radius);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Header: Clean typography adapted to template tone & format ratio
    ctx.save();
    ctx.fillStyle = activeTemplate.isDark ? '#94A3B8' : (c.textMuted || c.textDark);
    ctx.textAlign = 'center';

    const storePillY = is916 ? 90 : 44;
    ctx.font = is916 ? '600 22px sans-serif' : '600 18px sans-serif';
    ctx.fillText(`• ${currentUser.storeName.toUpperCase()} •`, width / 2, storePillY);

    const titleY = is916 ? 180 : 100;
    ctx.font = is916 ? '900 56px sans-serif' : '900 44px sans-serif';
    ctx.fillStyle = c.primary;
    ctx.fillText(activeTemplate.headline, width / 2, titleY);

    const subY = titleY + (is916 ? 44 : 34);
    ctx.font = is916 ? '600 22px sans-serif' : '600 17px sans-serif';
    ctx.fillStyle = activeTemplate.isDark ? '#94A3B8' : c.textDark;
    ctx.fillText(activeTemplate.subheadline, width / 2, subY);
    ctx.restore();

    // 6. Floating Promo Seal (Clean vector badge)
    if (promoText) {
      const stickerX = frameX + frameW - (is916 ? 40 : 25);
      const stickerY = frameY + (is916 ? 40 : 25);
      const stickerR = is916 ? 75 : 56;

      ctx.save();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(stickerX, stickerY, stickerR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = is916 ? 4 : 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(stickerX, stickerY, stickerR - (is916 ? 6 : 4), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = c.accentText || c.textDark;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = is916 ? 'bold 20px sans-serif' : 'bold 16px sans-serif';
      ctx.fillText('PROMO', stickerX, stickerY - (is916 ? 16 : 12));
      ctx.font = is916 ? '900 24px sans-serif' : '900 18px sans-serif';
      ctx.fillStyle = c.primary;
      const cleanPromo = promoText.slice(0, 14);
      ctx.fillText(cleanPromo, stickerX, stickerY + (is916 ? 14 : 10));
      ctx.restore();
    }

    // 7. Bottom Content - Proportional & Never Cut Off
    const bottomStartY = frameY + frameH + (is916 ? 48 : 26);

    ctx.save();
    ctx.fillStyle = c.textDark;
    ctx.font = is916 ? 'bold 48px sans-serif' : 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(selectedProduct?.name || 'Produk Favorit', width / 2, bottomStartY);

    const hookY = bottomStartY + (is916 ? 64 : 48);
    const hook = generatedContent?.hook || 'Pilihan lezat dengan bahan berkualitas tinggi.';
    ctx.font = is916 ? 'normal 26px sans-serif' : 'normal 21px sans-serif';
    ctx.fillStyle = activeTemplate.isDark ? '#94A3B8' : (c.textMuted || '#4A4639');
    ctx.fillText(hook.slice(0, 56) + (hook.length > 56 ? '...' : ''), width / 2, hookY);
    ctx.restore();

    // Price Badge
    const priceY = hookY + (is916 ? 46 : 34);
    const priceFormatted = formatRupiah(selectedProduct?.sellingPrice || 0);
    const badgeW = is916 ? 340 : 300;
    const badgeH = is916 ? 74 : 62;
    const badgeX = (width - badgeW) / 2;

    ctx.save();
    ctx.fillStyle = c.priceBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, priceY, badgeW, badgeH, badgeH / 2);
    ctx.fill();

    ctx.fillStyle = c.priceText;
    ctx.font = is916 ? 'bold 40px sans-serif' : 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(priceFormatted, width / 2, priceY + badgeH / 2);
    ctx.restore();

    // Clean CTA Bar
    const ctaH = is916 ? 80 : 70;
    const ctaMargin = 70;
    const ctaW = width - ctaMargin * 2;
    const ctaY = height - (is916 ? 120 : 88);

    ctx.save();
    ctx.fillStyle = c.ctaBg;
    ctx.beginPath();
    ctx.roundRect(ctaMargin, ctaY, ctaW, ctaH, 20);
    ctx.fill();

    ctx.fillStyle = c.ctaText;
    ctx.font = is916 ? 'bold 28px sans-serif' : 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const wa = currentUser.whatsapp || '08xxxxxxxxxx';
    ctx.fillText(`Pesan via WhatsApp: ${wa}`, width / 2, ctaY + ctaH / 2);
    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  useEffect(() => {
    if (selectedProduct) {
      handleGenerate();
    }
  }, [selectedProductId, selectedTemplate]);

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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Desain Foto Promosi &amp; Caption</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Format Poster Kuliner
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Pilih produk dan template poster, AI otomatis membuat grafis promosi siap tayang.
            </p>
          </div>

          {/* Format Rasio */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-auto shrink-0">
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                aspectRatio === '1:1'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Feed (1:1)</span>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Produk yang Dipromosikan
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-zinc-900 dark:text-zinc-100">
                  {p.name} — {formatRupiah(p.sellingPrice)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Teks Promo / Diskon
            </label>
            <input
              type="text"
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              placeholder="Contoh: Diskon 20%, Beli 2 Gratis 1"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. HASIL DESAIN FOTO & TOMBOL BERBAGI */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* KOLOM KIRI: Visual Foto Promo Sesuai Contoh Pinterest (5 Kolom) */}
        <div className="md:col-span-5 flex flex-col items-center">
          {/* PILIHAN TEMPLATE FOTO DENGAN VECTOR ICON & PALETTE WARNA */}
          <div className="w-full max-w-sm mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Tema Desain (10 Pilihan):</span>
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate max-w-[150px]">
                {activeTemplate.tagline}
              </span>
            </div>

            {/* Grid 10 Template dengan Color Swatches */}
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-1.5 bg-zinc-50/90 dark:bg-zinc-950/70 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              {TEMPLATES.map((t) => {
                const IconComponent = t.Icon;
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs ring-2 ring-zinc-900 dark:ring-zinc-100'
                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <IconComponent
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-amber-300 dark:text-amber-600' : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        />
                        <span className="text-[11px] font-bold truncate">
                          {t.name}
                        </span>
                      </div>
                      {t.badgeTag && (
                        <span
                          className={`text-[8px] px-1 py-0.2 rounded font-semibold shrink-0 ${
                            isSelected
                              ? 'bg-zinc-800 dark:bg-zinc-200 text-amber-300 dark:text-amber-700 border border-zinc-700 dark:border-zinc-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {t.badgeTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100/30 dark:border-zinc-800/60">
                      <span
                        className={`text-[9px] truncate ${
                          isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        {t.category}
                      </span>
                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: t.colors.primary }}
                          title="Warna Utama"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: t.colors.accent }}
                          title="Warna Aksen"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: t.colors.bg }}
                          title="Warna Background"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KARTU PREVIEW FOTO PROMO (Sesuai Gaya Desain & Palet Warna yang Dipilih) */}
          <div
            style={{ backgroundColor: activeTemplate.colors.bg }}
            className={`w-full max-w-sm relative rounded-2xl overflow-hidden shadow-sm border border-zinc-200 select-none flex flex-col justify-between transition-colors duration-300 ${
              aspectRatio === '9:16' ? 'aspect-[9/16] p-4' : 'aspect-square p-2.5 sm:p-3'
            }`}
          >
            {/* Header Toko & Judul Atas */}
            <div className={`text-center shrink-0 ${aspectRatio === '9:16' ? 'pt-1' : 'pt-0.5'}`}>
              <div
                className={`font-bold tracking-widest uppercase ${
                  aspectRatio === '9:16' ? 'text-[10px]' : 'text-[8.5px]'
                } ${activeTemplate.isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                • {currentUser.storeName} •
              </div>
              <h2
                style={{ color: activeTemplate.colors.primary }}
                className={`font-black tracking-tight uppercase font-sans ${
                  aspectRatio === '9:16' ? 'text-lg mt-0.5' : 'text-sm sm:text-base mt-0'
                }`}
              >
                {activeTemplate.headline}
              </h2>
              <div
                className={`font-medium tracking-wide ${
                  aspectRatio === '9:16' ? 'text-[9px]' : 'text-[7.5px]'
                } ${activeTemplate.isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                {activeTemplate.subheadline}
              </div>
            </div>

            {/* JENDELA FOTO DENGAN VARIASI BENTUK FRAME (Flexible & Responsive) */}
            <div
              className={`relative mx-auto w-full flex-1 min-h-0 flex items-center justify-center ${
                aspectRatio === '9:16' ? 'my-2' : 'my-1'
              }`}
            >
              <div
                style={{ borderColor: activeTemplate.colors.archBorder }}
                className={`relative overflow-hidden bg-zinc-100 transition-all duration-300 ${
                  activeTemplate.layoutStyle === 'arch'
                    ? aspectRatio === '9:16'
                      ? 'w-4/5 h-full max-h-56 sm:max-h-64 rounded-t-[999px] rounded-b-xl border-4 shadow-xs'
                      : 'w-3/4 h-full max-h-32 sm:max-h-36 rounded-t-[999px] rounded-b-lg border-3 shadow-xs'
                    : activeTemplate.layoutStyle === 'circle'
                    ? aspectRatio === '9:16'
                      ? 'w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 shadow-md'
                      : 'w-28 h-28 sm:w-32 sm:h-32 rounded-full border-3 shadow-md'
                    : activeTemplate.layoutStyle === 'luxury'
                    ? aspectRatio === '9:16'
                      ? 'w-4/5 h-full max-h-56 sm:max-h-64 rounded-2xl border-2 ring-2 ring-amber-400/40 shadow-xl'
                      : 'w-3/4 h-full max-h-32 sm:max-h-36 rounded-xl border-2 ring-2 ring-amber-400/40 shadow-md'
                    : activeTemplate.layoutStyle === 'neon'
                    ? aspectRatio === '9:16'
                      ? 'w-4/5 h-full max-h-56 sm:max-h-64 rounded-2xl border-3 border-zinc-900 shadow-[5px_5px_0px_#18181b]'
                      : 'w-3/4 h-full max-h-32 sm:max-h-36 rounded-xl border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b]'
                    : activeTemplate.layoutStyle === 'clean'
                    ? aspectRatio === '9:16'
                      ? 'w-4/5 h-full max-h-56 sm:max-h-64 rounded-2xl border-2 shadow-xs'
                      : 'w-3/4 h-full max-h-32 sm:max-h-36 rounded-xl border-2 shadow-xs'
                    : aspectRatio === '9:16'
                    ? 'w-4/5 h-full max-h-56 sm:max-h-64 rounded-3xl border-4 shadow-md'
                    : 'w-3/4 h-full max-h-32 sm:max-h-36 rounded-2xl border-3 shadow-md'
                }`}
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
                    <Store className={`${aspectRatio === '9:16' ? 'w-8 h-8 mb-1' : 'w-6 h-6 mb-0.5'} text-zinc-300`} />
                    <span className="text-xs font-bold">{selectedProduct?.name}</span>
                  </div>
                )}

                {/* Bayangan halus di bawah foto */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Floating Sticker Promo (Top Right of Photo) */}
              {promoText && (
                <div
                  style={{
                    backgroundColor: activeTemplate.colors.accent,
                    color: activeTemplate.colors.accentText || activeTemplate.colors.textDark,
                  }}
                  className={`absolute rounded-full border-2 border-white shadow-sm flex flex-col items-center justify-center p-0.5 text-center animate-in zoom-in-95 duration-200 z-10 ${
                    aspectRatio === '9:16'
                      ? '-top-1.5 right-3 w-14 h-14'
                      : '-top-1 right-2 sm:right-5 w-10 h-10'
                  }`}
                >
                  <span
                    className={`font-bold uppercase tracking-wider opacity-80 leading-none ${
                      aspectRatio === '9:16' ? 'text-[8px]' : 'text-[6.5px]'
                    }`}
                  >
                    PROMO
                  </span>
                  <span
                    style={{ color: activeTemplate.colors.primary }}
                    className={`font-black leading-tight truncate ${
                      aspectRatio === '9:16' ? 'text-[11px] max-w-[48px]' : 'text-[8.5px] max-w-[34px]'
                    }`}
                  >
                    {promoText}
                  </span>
                </div>
              )}
            </div>

            {/* Bawah: Nama Produk, Deskripsi, Badge Harga, & CTA WhatsApp (Never Cut Off) */}
            <div
              className={`text-center shrink-0 ${
                aspectRatio === '9:16' ? 'space-y-2 pb-1' : 'space-y-1 sm:space-y-1.5 pb-0'
              }`}
            >
              <div>
                <h3
                  style={{ color: activeTemplate.colors.textDark }}
                  className={`font-extrabold line-clamp-1 leading-tight ${
                    aspectRatio === '9:16' ? 'text-sm sm:text-base' : 'text-xs sm:text-[13px]'
                  }`}
                >
                  {selectedProduct?.name}
                </h3>
                <p
                  className={`line-clamp-1 ${
                    aspectRatio === '9:16' ? 'text-[10px] mt-0.5' : 'text-[8.5px] mt-0.2'
                  } ${activeTemplate.isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
                >
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
                  className={`rounded-full font-mono font-extrabold shadow-2xs tracking-wide ${
                    aspectRatio === '9:16'
                      ? 'px-4 py-1 text-xs sm:text-sm'
                      : 'px-3 py-0.5 text-[10px] sm:text-xs'
                  }`}
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
                className={`w-full rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs ${
                  aspectRatio === '9:16'
                    ? 'py-1.5 px-3 text-[11px]'
                    : 'py-1 px-2.5 text-[9px] sm:text-[10px]'
                }`}
              >
                <MessageCircle
                  className={`${aspectRatio === '9:16' ? 'w-3.5 h-3.5' : 'w-3 h-3'} text-emerald-400 shrink-0`}
                />
                <span>Pesan Sekarang via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Tombol Share & Teks Siap Kirim (7 Kolom) */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Card Tombol Share Langsung */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
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
                className="p-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
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
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
                <div className="text-left">
                  <div className="leading-tight">
                    {isExporting ? 'Memproses...' : 'Unduh Poster (PNG)'}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Resolusi tinggi 1080px</div>
                </div>
              </button>
            </div>
          </div>

          {/* Card Teks Caption AI */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>2. Naskah Caption Siap Pakai:</span>
              </span>

              <button
                onClick={handleCopyCaption}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500 animate-pulse">
                Sedang menyusun kata-kata promosi terbaik...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {generatedContent?.caption || 'Pilih produk untuk membuat caption promosi otomatis.'}
                </div>

                {/* Hashtag Ringkas */}
                {generatedContent?.hashtags && (
                  <div className="flex flex-wrap gap-1">
                    {generatedContent.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
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
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-5 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in zoom-in-95">
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
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {postGuide.platform === 'instagram'
                      ? 'Membuka Postingan Instagram'
                      : 'Membuka Unggahan TikTok'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Langkah praktis untuk menerbitkan poster promosi Anda
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPostGuide((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist Langkah Praktis */}
            <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">1. Foto Poster Telah Diunduh:</span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                    File gambar telah tersimpan di folder Download perangkat Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">2. Naskah Caption Telah Disalin:</span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Teks promosi beserta tagar sudah siap ditempel (paste) di kolom caption.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    3. Buka Tab {postGuide.platform === 'instagram' ? 'Instagram' : 'TikTok'}:
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
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
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka {postGuide.platform === 'instagram' ? 'Instagram' : 'TikTok'} Lagi</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(postGuide.caption);
                  showNotice('Naskah caption disalin kembali ke clipboard.');
                }}
                className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
