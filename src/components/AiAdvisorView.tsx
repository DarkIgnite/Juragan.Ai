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

interface AiAdvisorViewProps {
  currentUser: UserAccount;
  products: Product[];
  transactions: SaleTransaction[];
  onNavigateToContent: () => void;
  onOpenAddProduct: () => void;
  onOpenAddSale: () => void;
  onOpenVoiceConsultation?: () => void;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  currentUser,
  products,
  transactions,
  onNavigateToContent,
  onOpenAddProduct,
  onOpenAddSale,
  onOpenVoiceConsultation,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AdvisorAnalysisResponse | null>(null);
  const [sourceType, setSourceType] = useState<string>('gemini-3.8-flash');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAdvisorAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setSourceType(resJson.source || 'gemini-3.8-flash');
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
          border: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20',
          badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
      case 'medium':
        return {
          border: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20',
          badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'low':
      default:
        return {
          border: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20',
          badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
    }
  };

  const getInsightIcon = (type: AdvisorInsight['type']) => {
    switch (type) {
      case 'restock':
        return <Package className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'pricing':
        return <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Trigger */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-amber-500 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              AI Advisor Bisnis Juragan
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              {sourceType.includes('gemini') ? 'Gemini 3.8 Flash' : 'Smart Heuristic'}
            </span>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-400 mt-1 max-w-2xl">
            Sistem mengirim ringkasan data produk ({products.length} item) dan transaksi penjualan
            terkini ke server AI untuk menghasilkan rekomendasi operasional, restock, dan strategi promo yang konkret.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenVoiceConsultation && (
            <button
              id="btn-open-voice-advisor"
              onClick={onOpenVoiceConsultation}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 active:scale-[0.98] transition-all shadow-xs border border-zinc-200/90 dark:border-zinc-700 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Konsultasi Suara AI</span>
            </button>
          )}

          <button
            id="btn-run-ai-advisor"
            onClick={runAdvisorAnalysis}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Menganalisis Toko...' : 'Analisis Ulang Sekarang'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Juragan.AI sedang membaca pola toko Anda...
            </h4>
            <p className="text-xs text-zinc-700 dark:text-zinc-400 mt-1">
              Menghitung perputaran stok, margin laba bersih, dan memprediksi produk berpotensi kehabisan.
            </p>
          </div>
          <div className="w-48 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mx-auto overflow-hidden">
            <div className="w-1/2 h-full bg-emerald-500 rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Insight Cards Grid */}
      {!loading && analysisData && (
        <div className="space-y-4">
          {/* Header Summary Score */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {analysisData.summaryTitle || `Diagnosis Kesehatan: ${currentUser.storeName}`}
                </h3>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Status Saat Ini: <strong className="text-emerald-900 dark:text-emerald-400">{analysisData.overallScore}</strong>
                </p>
              </div>
            </div>
            <div className="text-xs text-zinc-700 dark:text-zinc-400">
              Evaluasi {products.length} produk &amp; {transactions.length} riwayat transaksi
            </div>
          </div>

          {/* Cards Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.insights.map((insight) => {
              const style = getPriorityStyle(insight.priority);

              return (
                <div
                  key={insight.id}
                  className={`bg-white dark:bg-zinc-900 rounded-2xl border p-5 transition-all hover:shadow-xs flex flex-col justify-between ${style.border}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 shadow-2xs">
                          {getInsightIcon(insight.type)}
                        </div>
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {insight.title}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.badge}`}
                      >
                        {insight.badge}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {insight.description}
                    </p>

                    <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 text-xs">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                        Rekomendasi Tindakan:
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">{insight.recommendation}</span>
                    </div>
                  </div>

                  {/* Bottom Action Shortcut */}
                  <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-400 uppercase tracking-wider">
                      Prioritas: {insight.priority.toUpperCase()}
                    </span>

                    {insight.type === 'restock' ? (
                      <button
                        onClick={onOpenAddProduct}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        {insight.actionLabel || 'Cek & Restock Produk'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : insight.type === 'promo' || insight.type === 'trend' ? (
                      <button
                        onClick={onNavigateToContent}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        {insight.actionLabel || 'Buat Konten Promosi'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={onOpenAddSale}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                      >
                        {insight.actionLabel || 'Catat Penjualan'}
                        <ArrowRight className="w-3.5 h-3.5" />
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
