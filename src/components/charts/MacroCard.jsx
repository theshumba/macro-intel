import SparkLine from './SparkLine';

const DIRECTION_STYLES = {
  up: { arrow: '\u2191', color: 'text-emerald-400', sparkColor: '#10b981' },
  down: { arrow: '\u2193', color: 'text-red-400', sparkColor: '#ef4444' },
  flat: { arrow: '\u2192', color: 'text-gray-400', sparkColor: '#6b7280' },
};

export default function MacroCard({
  title,
  value,
  unit = '',
  change,
  changeDirection = 'flat',
  sparkData = [],
  loading = false,
  noKey = false,
  index = 0,
}) {
  const dir = DIRECTION_STYLES[changeDirection] || DIRECTION_STYLES.flat;

  if (loading) {
    return (
      <div
        className="animate-card-enter bg-[#12121A] border border-gray-800/60 rounded-xl p-4"
        style={{ animationDelay: `${index * 0.08}s` }}
      >
        <div className="skeleton h-3 w-20 mb-3" />
        <div className="skeleton h-7 w-16 mb-2" />
        <div className="skeleton h-4 w-12" />
      </div>
    );
  }

  if (noKey) {
    return (
      <div
        className="animate-card-enter bg-[#12121A] border border-gray-800/60 rounded-xl p-4 opacity-50"
        style={{ animationDelay: `${index * 0.08}s` }}
      >
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">{title}</h4>
        <p className="text-xs text-gray-600">API key required</p>
        <p className="text-[10px] text-gray-700 mt-1">Set in .env file</p>
      </div>
    );
  }

  const displayValue = value !== null && value !== undefined ? value : '--';

  return (
    <div
      className="animate-card-enter bg-[#12121A] border border-gray-800/60 rounded-xl p-4 hover:border-gray-600 transition-colors duration-200 overflow-hidden"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-emerald-500/40 to-transparent -mx-4 -mt-4 mb-3" />

      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </h4>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gray-100 tabular-nums">{displayValue}</span>
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
          </div>
          {change !== undefined && change !== null && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${dir.color}`}>
              <span>{dir.arrow}</span>
              <span>{change}</span>
            </div>
          )}
        </div>

        {sparkData.length > 1 && (
          <SparkLine data={sparkData} color={dir.sparkColor} width={72} height={28} />
        )}
      </div>
    </div>
  );
}
