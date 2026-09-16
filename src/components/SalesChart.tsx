import React, { useState, useRef } from 'react';
import { SaleTransaction, Product } from '../types';
import { formatRupiah, formatNumber, formatDateIndo } from '../utils/formatters';
import {
  TrendingUp,
  BarChart2,
  PieChart,
  ShoppingBag,
  CreditCard,
  Banknote,
  Building2,
  Store,
} from 'lucide-react';

interface SalesChartProps {
  transactions: SaleTransaction[];
  products: Product[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ transactions, products }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const daysCount = timeRange === '7d' ? 7 : 14;

  // Build daily data series for the past N days
  const dailyData = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(d);

    const txsOnDay = transactions.filter((t) => t.date === dateStr);
    const totalOmzet = txsOnDay.reduce((sum, t) => sum + t.totalPrice, 0);
    const totalProfit = txsOnDay.reduce((sum, t) => sum + t.profit, 0);

    return {
      date: dateStr,
      label: dayName,
      totalOmzet,
      totalProfit,
      count: txsOnDay.length,
    };
  });

  // Add breathing room above highest sales point so peak data dots and tooltips never touch the border
  const rawMax = Math.max(...dailyData.map((d) => d.totalOmzet), 100000);
  const maxOmzet = Math.ceil((rawMax * 1.15) / 50000) * 50000;

  // Chart coordinate math with safe top & bottom margins
  const chartHeight = 185;
  const chartWidth = 560;
  const paddingX = 42;
  const paddingTop = 32;
  const paddingBottom = 26;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const points = dailyData.map((d, i) => {
    const x = paddingX + (i / (dailyData.length - 1)) * innerWidth;
    const y = chartHeight - paddingBottom - (d.totalOmzet / maxOmzet) * innerHeight;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${chartHeight - paddingBottom} L ${points[0].x},${chartHeight - paddingBottom} Z`;

  // Top products calculation
  const productSalesMap = products
    .map((prod) => {
      const matchedTxs = transactions.filter((t) => t.productId === prod.id);
      const totalQty = matchedTxs.reduce((sum, t) => sum + t.quantity, 0);
      const totalRevenue = matchedTxs.reduce((sum, t) => sum + t.totalPrice, 0);
      return {
        product: prod,
        totalQty,
        totalRevenue,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const maxProductRevenue = Math.max(...productSalesMap.map((p) => p.totalRevenue), 1);

  // Smooth mouse move over SVG with zero flicker
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;

    // Find closest point along X axis
    let closestIndex = 0;
    let minDistance = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setHoveredPointIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  const activePoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  // Payment Breakdown data
  const paymentMethods = [
    { name: 'QRIS', icon: CreditCard, color: 'bg-emerald-500', barColor: '#10b981' },
    { name: 'Transfer Bank', icon: Building2, color: 'bg-blue-500', barColor: '#3b82f6' },
    { name: 'Tunai', icon: Banknote, color: 'bg-amber-500', barColor: '#f59e0b' },
    { name: 'Marketplace', icon: Store, color: 'bg-purple-500', barColor: '#a855f7' },
  ] as const;

  const totalAllTxs = transactions.length || 1;
  const totalAllRevenue = transactions.reduce((sum, t) => sum + t.totalPrice, 0) || 1;

  const paymentStats = paymentMethods.map((pm) => {
    const matched = transactions.filter((t) => t.paymentMethod === pm.name);
    const count = matched.length;
    const revenue = matched.reduce((sum, t) => sum + t.totalPrice, 0);
    const percentage = Math.round((revenue / totalAllRevenue) * 100);
    return {
      ...pm,
      count,
      revenue,
      percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Main Trend Line Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Tren Penjualan Harian
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Omzet Harian
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Grafik pergerakan omzet dan transaksi riil toko.
            </p>
          </div>

          {/* Segmented Control for range */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                timeRange === '14d'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              14 Hari
            </button>
          </div>
        </div>

        {/* SVG Chart Container with Glitch-Free Continuous Hover */}
        <div className="relative w-full select-none pt-1">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-48 sm:h-56 cursor-crosshair overflow-visible"
          >
            <defs>
              <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - paddingBottom - ratio * innerHeight;
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    className="text-zinc-100 dark:text-zinc-800"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-zinc-400 dark:fill-zinc-500 font-mono"
                  >
                    {Math.round((maxOmzet * ratio) / 1000)}k
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill="url(#omzetGradient)" />

            {/* Smooth Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical Guide Line on hover */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={chartHeight - paddingBottom}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="opacity-70"
              />
            )}

            {/* Static & Active Data Dots */}
            {points.map((p, idx) => {
              const isActive = hoveredPointIndex === idx;
              return (
                <g key={p.date}>
                  {/* Subtle outer glow when active */}
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="9"
                      className="fill-emerald-500/20 stroke-none"
                    />
                  )}
                  {/* The dot itself */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isActive ? '5' : '3.5'}
                    className={`transition-all duration-150 ${
                      isActive
                        ? 'fill-emerald-600 stroke-white dark:stroke-zinc-900 stroke-2'
                        : 'fill-white dark:fill-zinc-900 stroke-emerald-600 dark:stroke-emerald-400 stroke-2'
                    }`}
                  />
                  {/* Day Labels at the bottom */}
                  <text
                    x={p.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className={`text-[9px] font-medium transition-colors ${
                      isActive ? 'fill-emerald-700 dark:fill-emerald-400 font-bold' : 'fill-zinc-400 dark:fill-zinc-500'
                    }`}
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Smart Edge-Clamped & Flipped Tooltip (Never Clipped by Borders) */}
          {activePoint && (() => {
            const isNearTop = (activePoint.y / chartHeight) < 0.40;
            const isNearLeft = (activePoint.x / chartWidth) < 0.22;
            const isNearRight = (activePoint.x / chartWidth) > 0.78;

            const horizontalTransform = isNearLeft
              ? 'translate-x-0'
              : isNearRight
              ? '-translate-x-full'
              : '-translate-x-1/2';

            const verticalTransform = isNearTop
              ? 'translate-y-3.5'
              : '-translate-y-full -mt-2.5';

            return (
              <div
                className={`absolute z-30 pointer-events-none px-3 py-2 bg-zinc-900/95 dark:bg-zinc-800/95 backdrop-blur-xs text-white rounded-xl shadow-xl text-xs border border-zinc-800 dark:border-zinc-700 transition-all duration-75 whitespace-nowrap ${horizontalTransform} ${verticalTransform}`}
                style={{
                  left: isNearLeft
                    ? `${Math.max(2, (activePoint.x / chartWidth) * 100 - 2)}%`
                    : isNearRight
                    ? `${Math.min(98, (activePoint.x / chartWidth) * 100 + 2)}%`
                    : `${(activePoint.x / chartWidth) * 100}%`,
                  top: `${(activePoint.y / chartHeight) * 100}%`,
                }}
              >
                <div className="font-medium text-zinc-300 text-[10px]">
                  {formatDateIndo(activePoint.date)}
                </div>
                <div className="text-emerald-400 font-bold text-sm leading-tight">
                  {formatRupiah(activePoint.totalOmzet)}
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-between gap-3 mt-0.5">
                  <span>{activePoint.count} Transaksi</span>
                  <span className="text-emerald-300 font-medium">
                    Laba: +{formatRupiah(activePoint.totalProfit)}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Breakdown per Produk & Preferensi Pembayaran (Clean & Non-Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Products Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Kontribusi Omzet per Produk
            </h4>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Urutan Terlaris</span>
          </div>

          <div className="space-y-3.5">
            {productSalesMap.map(({ product, totalQty, totalRevenue }, index) => {
              const pct = Math.round((totalRevenue / maxProductRevenue) * 100);
              return (
                <div key={product.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          #{index + 1}
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatRupiah(totalRevenue)}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px] ml-1.5">
                        ({totalQty} {product.unit})
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0
                          ? 'bg-emerald-500'
                          : index === 1
                          ? 'bg-emerald-400'
                          : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preferensi Pembayaran Pembeli - Pure Informational / Non-Clickable presentation */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Preferensi Pembayaran Pembeli
              </h4>
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Statistik Metode</span>
            </div>

            {/* Proportional Segmented Bar */}
            <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex gap-0.5 my-3">
              {paymentStats.map((pm) =>
                pm.percentage > 0 ? (
                  <div
                    key={pm.name}
                    className={`h-full ${pm.color}`}
                    style={{ width: `${pm.percentage}%` }}
                    title={`${pm.name}: ${pm.percentage}%`}
                  />
                ) : null
              )}
            </div>

            {/* Clean Static Breakdown List (No clickable cards) */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paymentStats.map((pm) => {
                return (
                  <div
                    key={pm.name}
                    className="py-2.5 flex items-center justify-between text-xs cursor-default"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${pm.color} shrink-0`} />
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{pm.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {pm.count} transaksi
                      </span>
                      <div className="w-24">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block font-mono text-[11px]">
                          {formatRupiah(pm.revenue)}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                          {pm.percentage}% dari total
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>💡 Transaksi digital (QRIS &amp; Transfer) berkontribusi mayoritas terhadap omzet.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
