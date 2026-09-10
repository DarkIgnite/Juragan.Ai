import React, { useState } from 'react';
import { Product, UserAccount, SocialPlatform, ContentTone, ContentGenerationResult } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Instagram,
  MessageCircle,
  Video,
  Share2,
  Tag,
  Lightbulb,
  Clock,
  Send,
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
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [tone, setTone] = useState<ContentTone>('santai');
  const [specialOffer, setSpecialOffer] = useState<string>('Gratis Ongkir & Diskon Kilat');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [sourceType, setSourceType] = useState<string>('gemini-3.8-flash');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

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
          platform,
          tone,
          specialOffer,
          storeName: currentUser.storeName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setGeneratedContent(resJson.data);
        setSourceType(resJson.source || 'gemini-3.8-flash');
      }
    } catch (err) {
      console.warn('Gagal generate content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run generation initially if none
  React.useEffect(() => {
    if (!generatedContent && selectedProduct) {
      handleGenerate();
    }
  }, [selectedProductId, platform]);

  const copyToClipboard = () => {
    if (!generatedContent) return;
    const fullText = `${generatedContent.caption}\n\n${(generatedContent.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <Share2 className="w-4 h-4 text-amber-300" />
          </div>
          <h2 className="text-base font-semibold text-zinc-900">
            AI Content Generator untuk UMKM
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
            {sourceType.includes('gemini') ? 'Gemini 3.8 Flash' : 'Smart Copy Engine'}
          </span>
        </div>
        <p className="text-xs text-zinc-700 mt-1 max-w-2xl">
          Pilih produk dari toko Anda, tentukan saluran media sosial dan gaya bahasa, lalu biarkan AI
          meracik caption promosi persuasif yang terbukti mendatangkan pembeli.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-zinc-900 pb-2 border-b border-zinc-100">
            1. Parameter Konten
          </h3>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Pilih Produk Toko
            </label>
            <select
              id="select-content-product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatRupiah(p.sellingPrice)} (Stok: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Platform Segmented Tabs */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Platform Tujuan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-platform-ig"
                type="button"
                onClick={() => setPlatform('instagram')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all active:scale-[0.98] ${
                  platform === 'instagram'
                    ? 'border-pink-500 bg-pink-50/70 text-pink-700 font-semibold ring-1 ring-pink-500/20'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </button>

              <button
                id="btn-platform-tiktok"
                type="button"
                onClick={() => setPlatform('tiktok')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all active:scale-[0.98] ${
                  platform === 'tiktok'
                    ? 'border-zinc-900 bg-zinc-100 text-zinc-900 font-semibold ring-1 ring-black/10'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>TikTok</span>
              </button>

              <button
                id="btn-platform-wa"
                type="button"
                onClick={() => setPlatform('whatsapp')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all active:scale-[0.98] ${
                  platform === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-600/20'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Gaya Bahasa (Tone of Voice)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'santai', label: 'Santai & Akrab', desc: 'Hangat, kasual, dekat' },
                { id: 'persuasif', label: 'Persuasif & Promo', desc: 'Fokus penjualan & urgensi' },
                { id: 'profesional', label: 'Profesional & Elegan', desc: 'Kredibel, resmi, rapi' },
                { id: 'edukatif', label: 'Storytelling & Nilai', desc: 'Cerita di balik produk' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTone(t.id as any)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    tone === t.id
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-semibold'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div className="text-xs">{t.label}</div>
                  <div className="text-[10px] text-zinc-700 font-normal">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Offer Highlight */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Sorotan Promo Tambahan (Opsional)
            </label>
            <input
              id="input-special-offer"
              type="text"
              placeholder="Misal: Beli 2 Gratis 1, Subsidi Ongkir Rp10rb, dll."
              value={specialOffer}
              onChange={(e) => setSpecialOffer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Generate Button */}
          <button
            id="btn-generate-content"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : 'text-amber-300'}`} />
            {loading ? 'Meracik Teks Promosi...' : 'Buat Konten Promosi Sekarang'}
          </button>
        </div>

        {/* Right Output View (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Top Result Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-900">
                  Hasil Caption Siap Pakai
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 uppercase">
                  {platform}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-regenerate-content"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  title="Generate variasi baru"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Variasi Lain</span>
                </button>

                <button
                  id="btn-copy-content"
                  onClick={copyToClipboard}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>
            </div>

            {/* Generated Body Display */}
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 mx-auto flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-xs font-semibold text-zinc-700">
                  Merangkai kata-kata terbaik untuk produk Anda...
                </div>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                {/* Hook Box */}
                {generatedContent.hook && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs">
                    <span className="font-semibold text-amber-900 block mb-0.5 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      Hook Pembuka (Perhatian Pembeli):
                    </span>
                    <p className="text-amber-950 font-medium">{generatedContent.hook}</p>
                  </div>
                )}

                {/* Main Content Box */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 font-sans text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap select-all">
                  {generatedContent.caption}
                </div>

                {/* Hashtags */}
                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-zinc-700" />
                      Rekomendasi Hashtag:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedContent.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[11px] bg-zinc-100 text-zinc-700 border border-zinc-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-zinc-700">
                Pilih produk dan klik tombol "Buat Konten Promosi Sekarang" untuk memulai.
              </div>
            )}
          </div>

          {/* Platform Tips Banner */}
          {generatedContent?.platformTips && (
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-700 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/60">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Tips Waktu Posting:</strong> {generatedContent.platformTips}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
