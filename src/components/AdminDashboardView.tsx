import React, { useState, useEffect } from 'react';
import { UserAccount, Product, SaleTransaction, PlatformStats } from '../types';
import { formatRupiah, formatNumber, formatDateIndo } from '../utils/formatters';
import {
  ShieldCheck,
  Users,
  Activity,
  Sparkles,
  TrendingUp,
  Store,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface AdminDashboardViewProps {
  users: UserAccount[];
  allProducts: Product[];
  allTransactions: SaleTransaction[];
  onInspectStore: (user: UserAccount) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  allProducts,
  allTransactions,
  onInspectStore,
  onToggleUserStatus,
}) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/platform/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Gagal fetch stats admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalOmzetPlatform = allTransactions.reduce((sum, t) => sum + t.totalPrice, 0);
  const totalLabaPlatform = allTransactions.reduce((sum, t) => sum + t.profit, 0);
  const umkmUsers = users.filter((u) => u.role === 'juragan');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900">
              Panel Pengawasan &amp; Analitik Platform Nasional
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Admin Role Access
            </span>
          </div>
          <p className="text-xs text-zinc-700 mt-1 max-w-2xl">
            Memantau pertumbuhan omzet agregat UMKM, efektivitas pemanfaatan AI Gemini di seluruh toko,
            dan mengelola akun para Juragan yang terdaftar.
          </p>
        </div>

        <button
          id="btn-refresh-admin-stats"
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shrink-0 active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data Platform</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700">Total Omzet Agregat</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-2">
            {formatRupiah(totalOmzetPlatform)}
          </div>
          <p className="text-[11px] text-zinc-700 mt-1">
            Laba bersih UMKM: <strong className="text-emerald-700">{formatRupiah(totalLabaPlatform)}</strong>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700">Toko UMKM Terdaftar</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-2">
            {umkmUsers.length} Toko Aktif
          </div>
          <p className="text-[11px] text-zinc-700 mt-1">
            {allProducts.length} total produk terdaftar di katalog
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700">Total Transaksi Selesai</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-2">
            {allTransactions.length} Transaksi
          </div>
          <p className="text-[11px] text-zinc-700 mt-1">
            Rata-rata: {formatRupiah(totalOmzetPlatform / (allTransactions.length || 1))} / order
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700">Total Pemanggilan AI</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-zinc-900 mt-2">
            {stats?.totalAiCalls || 43} Permintaan
          </div>
          <p className="text-[11px] text-zinc-700 mt-1">
            Advisor: {stats?.totalAdvisorCalls || 14} • Konten: {stats?.totalContentCalls || 29}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Store Management & AI Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Toko UMKM Directory (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Kelola Pengguna &amp; Toko UMKM
            </h3>
            <span className="text-xs text-zinc-700">{umkmUsers.length} Juragan Aktif</span>
          </div>

          <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-xl overflow-hidden">
            {umkmUsers.map((user) => {
              const userTxs = allTransactions.filter((t) => t.userId === user.id);
              const userProducts = allProducts.filter((p) => p.userId === user.id);
              const userOmzet = userTxs.reduce((sum, t) => sum + t.totalPrice, 0);

              return (
                <div
                  key={user.id}
                  className="p-4 hover:bg-zinc-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-xs shrink-0 ${user.avatarColor}`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-zinc-900">
                          {user.storeName}
                        </span>
                        <span
                          onClick={() => onToggleUserStatus(user.id)}
                          className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            user.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                          title="Klik untuk mengubah status"
                        >
                          {user.status === 'verified' ? 'Terverifikasi' : 'Aktif'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-700 mt-0.5">
                        Pemilik: {user.name} • {user.city} • {user.category}
                      </div>
                      <div className="text-[11px] text-zinc-700 mt-0.5">
                        {userProducts.length} Produk • {userTxs.length} Transaksi • Omzet: <strong>{formatRupiah(userOmzet)}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-inspect-${user.id}`}
                    onClick={() => onInspectStore(user)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:scale-[0.98] transition-all self-start sm:self-center shrink-0"
                  >
                    <span>Masuk ke Toko</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI Usage Logs & Monitoring (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                Audit Log Aktivitas AI Platform
              </h3>
              <span className="text-[11px] font-mono text-zinc-700">Real-time</span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {(stats?.logs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900">{log.feature}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status === 'success' ? '200 OK (Gemini)' : 'Fallback'}
                    </span>
                  </div>
                  <div className="text-zinc-700 text-[11px]">
                    Toko: <strong>{log.store}</strong> ({log.user})
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-700 pt-0.5">
                    <span>Model: {log.model}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              SLA Keandalan Platform:
            </span>
            <strong className="text-zinc-900">99.98% Uptime</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
