import React, { useState } from 'react';
import { Product, SaleTransaction, UserAccount, AdvisorAnalysisResponse, AdvisorInsight } from '../types';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Tag,
  Package,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Info,
  Mic,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { getAiHeaders } from '../lib/geminiKey';

interface AiAdvisorViewProps {
  currentUser: UserAccount;
  products: Product[];
  transactions: SaleTransaction[];
  onNavigateToContent: () => void;
  onOpenAddProduct: () => void;
  onOpenAddSale: () => void;
  onOpenVoiceConsultation?: () => void;
  onOpenApiSetup?: () => void;
  apiConnected?: boolean;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  currentUser,
  products,
  transactions,
  onNavigateToContent,
  onOpenAddProduct,
  onOpenAddSale,
  onOpenVoiceConsultation,
  onOpenApiSetup,
  apiConnected,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AdvisorAnalysisResponse | null>(null);
  const [sourceType, setSourceType] = useState<string>('gemini-3.1-flash-lite');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAdvisorAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: getAiHeaders(),
        body: JSON.stringify({
          storeProfile: {
            storeName: currentUser.storeName,
            ownerName: currentUser.name,
            category: currentUser.category,
            city: currentUser.city,
          },
          products,
          transactions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setAnalysisData(resJson.data);
        setSourceType(resJson.source || 'gemini-3.1-flash-lite');
      } else {
        throw new Error('Format data analisis tidak sesuai.');
      }
    } catch (err: any) {
      console.warn('Gagal memanggil AI Advisor server:', err);
      setErrorMsg('Koneksi terganggu. Sistem beralih ke analisis lokal cadangan.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial analysis on first mount if not loaded
  React.useEffect(() => {
    if (!analysisData) {
      runAdvisorAnalysis();
    }
  }, [currentUser.id]);

  const getPriorityStyle = (priority: AdvisorInsight['priority']) => {
    switch (priority) {
      case 'high':
        return {
          dot: 'bg-rose-500',
          badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60',
          accent: 'border-rose-500 dark:border-rose-400',
        };
      case 'medium':
        return {
          dot: 'bg-amber-500',
          badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
          accent: 'border-amber-500 dark:border-amber-400',
        };
      case 'low':
      default:
        return {
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
          accent: 'border-emerald-500 dark:border-emerald-400',
        };
    }
  };

  const getInsightIcon = (type: AdvisorInsight['type']) => {
    switch (type) {
      case 'restock':
        return <Package className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'promo':
        return <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'pricing':
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Action Bar - Spacious & Clean */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-amber-500 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              AI Advisor Bisnis Juragan
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {sourceType.includes('gemini') ? 'Google Gemini AI' : 'Smart Heuristic (Lokal)'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Rekomendasi taktis otomatis berdasarkan {products.length} produk dan riwayat penjualan toko Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenApiSetup && (
            <button
              onClick={onOpenApiSetup}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                apiConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
              }`}
              title="Periksa atau atur API Key Gemini"
            >
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>{apiConnected ? 'Gemini AI Aktif' : 'Atur API Key'}</span>
            </button>
          )}

          {onOpenVoiceConsultation && (
            <button
              id="btn-open-voice-advisor"
              onClick={onOpenVoiceConsultation}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 active:scale-[0.98] transition-all shadow-xs border border-zinc-200/90 dark:border-zinc-700 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Konsultasi Suara</span>
            </button>
          )}

          <button
            id="btn-run-ai-advisor"
            onClick={runAdvisorAnalysis}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Menganalisis...' : 'Analisis Ulang'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-10 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Menganalisis pola transaksi &amp; stok toko Anda...
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Menghitung perputaran stok, margin laba, dan rekomendasi promo.
            </p>
          </div>
          <div className="w-40 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mx-auto overflow-hidden">
            <div className="w-1/2 h-full bg-emerald-500 rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Insight Cards Grid */}
      {!loading && analysisData && (
        <div className="space-y-4">
          {/* Header Summary Score - Clean & Uncluttered */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {analysisData.summaryTitle || `Diagnosis Kesehatan Toko`}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Kondisi Bisnis: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{analysisData.overallScore}</span>
                </p>
              </div>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Evaluasi {products.length} produk &amp; {transactions.length} transaksi</span>
            </div>
          </div>

          {/* Cards Display - Breathable & Modern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.insights.map((insight) => {
              const style = getPriorityStyle(insight.priority);

              return (
                <div
                  key={insight.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Title + Priority Chip */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                          {insight.title}
                        </h4>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${style.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {insight.badge}
                      </span>
                    </div>

                    {/* Insight Description */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {insight.description}
                    </p>

                    {/* Actionable Recommendation - Elegant Left Accent */}
                    <div className={`pl-3 border-l-2 py-0.5 space-y-0.5 ${style.accent}`}>
                      <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200 block">
                        Saran Langkah:
                      </span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {insight.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Shortcut */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end">
                    {insight.type === 'restock' ? (
                      <button
                        onClick={onOpenAddProduct}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors group cursor-pointer"
                      >
                        <span>{insight.actionLabel || 'Cek & Restock Produk'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : insight.type === 'promo' || insight.type === 'trend' ? (
                      <button
                        onClick={onNavigateToContent}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group cursor-pointer"
                      >
                        <span>{insight.actionLabel || 'Buat Konten Promosi'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        onClick={onOpenAddSale}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer"
                      >
                        <span>{insight.actionLabel || 'Catat Penjualan'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
