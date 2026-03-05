import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart, AreaChart, BarChart,
  Line, Area, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

// ---- Custom tooltip ---------------------------------------------------------

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;

  const val = payload[0].value;
  let formatted;
  if (unit === '%') {
    formatted = `${val.toFixed(2)}%`;
  } else if (Math.abs(val) >= 1e12) {
    formatted = `$${(val / 1e12).toFixed(2)}T`;
  } else if (Math.abs(val) >= 1e9) {
    formatted = `$${(val / 1e9).toFixed(2)}B`;
  } else if (Math.abs(val) >= 1e6) {
    formatted = `${(val / 1e6).toFixed(2)}M`;
  } else if (Math.abs(val) >= 1e3) {
    formatted = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } else {
    formatted = val.toFixed(2);
  }

  if (unit && unit !== '%' && !formatted.startsWith('$')) {
    formatted = `${formatted} ${unit}`;
  }

  return (
    <div className="bg-[#1A1A24] border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-100">{formatted}</p>
    </div>
  );
}

// ---- Format axis values -----------------------------------------------------

function formatAxisValue(val) {
  if (Math.abs(val) >= 1e12) return `${(val / 1e12).toFixed(0)}T`;
  if (Math.abs(val) >= 1e9) return `${(val / 1e9).toFixed(0)}B`;
  if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(0)}M`;
  if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(1);
}

// ---- Color palette ----------------------------------------------------------

const COLORS = {
  emerald: { stroke: '#10b981', fill: 'url(#emeraldGradient)', dot: '#34d399' },
  amber: { stroke: '#f59e0b', fill: 'url(#amberGradient)', dot: '#fbbf24' },
  red: { stroke: '#ef4444', fill: 'url(#redGradient)', dot: '#f87171' },
  sky: { stroke: '#0ea5e9', fill: 'url(#skyGradient)', dot: '#38bdf8' },
};

// ---- Source badge -----------------------------------------------------------

function SourceBadge({ source }) {
  const colors = {
    'World Bank': 'bg-sky-500/15 text-sky-400',
    'FRED': 'bg-amber-500/15 text-amber-400',
    'Our World in Data': 'bg-emerald-500/15 text-emerald-400',
  };

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${colors[source] || 'bg-gray-500/15 text-gray-400'}`}>
      {source}
    </span>
  );
}

// ---- Main MiniChart ---------------------------------------------------------

export default function MiniChart({
  title,
  data = [],
  unit = '',
  chartType = 'line',
  color = 'emerald',
  height = 180,
  source = '',
  latestValue,
  latestDate,
  country,
}) {
  const colors = COLORS[color] || COLORS.emerald;

  // Format latest value for display
  const displayValue = useMemo(() => {
    if (latestValue === null || latestValue === undefined) return 'N/A';
    const val = latestValue;
    if (unit === '%') return `${val.toFixed(1)}%`;
    if (Math.abs(val) >= 1e12) return `$${(val / 1e12).toFixed(1)}T`;
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }, [latestValue, unit]);

  // Compute trend (latest vs first)
  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (first === 0) return null;
    const pctChange = ((last - first) / Math.abs(first)) * 100;
    return {
      direction: pctChange >= 0 ? 'up' : 'down',
      pct: Math.abs(pctChange).toFixed(1),
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="bg-[#12121A] border border-gray-800/60 rounded-xl p-4" style={{ height }}>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-sm text-gray-600 mt-2">No data available</p>
      </div>
    );
  }

  const ChartComponent = chartType === 'bar' ? BarChart : chartType === 'area' ? AreaChart : LineChart;

  return (
    <div className="animate-card-enter bg-[#12121A] border border-gray-800/60 rounded-xl overflow-hidden hover:border-gray-600 transition-colors duration-200">
      {/* Header */}
      <div className="px-4 pt-3 pb-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-semibold text-gray-400 truncate">{title}</h4>
            {source && <SourceBadge source={source} />}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-100">{displayValue}</span>
            {trend && (
              <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend.direction === 'up' ? '\u2191' : '\u2193'} {trend.pct}%
              </span>
            )}
          </div>
          {(latestDate || country) && (
            <p className="text-[10px] text-gray-600 mt-0.5">
              {country && <span>{country} &middot; </span>}
              {latestDate}
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-2">
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#1f2937' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisValue}
              width={45}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />

            {chartType === 'line' && (
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: colors.dot, stroke: '#0A0A0F', strokeWidth: 2 }}
              />
            )}
            {chartType === 'area' && (
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2}
                fill={colors.fill}
                dot={false}
                activeDot={{ r: 4, fill: colors.dot, stroke: '#0A0A0F', strokeWidth: 2 }}
              />
            )}
            {chartType === 'bar' && (
              <Bar
                dataKey="value"
                fill={colors.stroke}
                radius={[2, 2, 0, 0]}
                fillOpacity={0.7}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
