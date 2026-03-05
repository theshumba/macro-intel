import { useMemo } from 'react';
import ImpactBadge from './ImpactBadge';
import CategoryBadge from './CategoryBadge';

function getImpactTier(score) {
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function avg(nums) {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function SummaryCard({ title, children }) {
  return (
    <div className="bg-[#12121A] border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

function TiltArrow({ direction }) {
  const styles = {
    up: 'bg-red-500/15 text-red-400',
    down: 'bg-emerald-500/15 text-emerald-400',
    flat: 'bg-gray-500/15 text-gray-400',
  };
  const arrows = { up: '\u2191', down: '\u2193', flat: '\u2192' };
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-lg font-bold ${styles[direction]}`}>
      {arrows[direction]}
    </span>
  );
}

function HBar({ label, value, max, color = 'bg-emerald-500', suffix = '' }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 4) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-32 sm:w-40 truncate shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-gray-800/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-300 tabular-nums w-8 text-right shrink-0">
        {value}{suffix}
      </span>
    </div>
  );
}

function DashboardView({ items = [], onSelect, selectedId }) {
  const stats = useMemo(() => {
    const high = items.filter((i) => i.impactScore >= 7).length;
    const medium = items.filter((i) => i.impactScore >= 4 && i.impactScore < 7).length;
    const low = items.filter((i) => i.impactScore < 4).length;

    const inflationary = items.filter((i) => i.inflationBias === 'inflationary').length;
    const disinflationary = items.filter((i) => i.inflationBias === 'disinflationary').length;
    const inflationNeutral = items.filter((i) => i.inflationBias === 'neutral').length;
    const inflationTilt = inflationary > disinflationary ? 'up' : disinflationary > inflationary ? 'down' : 'flat';

    const positive = items.filter((i) => i.growthBias === 'positive').length;
    const negative = items.filter((i) => i.growthBias === 'negative').length;
    const growthMixed = items.filter((i) => i.growthBias === 'mixed').length;
    const growthTilt = positive > negative ? 'up' : negative > positive ? 'down' : 'flat';

    const categoryMap = {};
    items.forEach((i) => {
      if (!categoryMap[i.category]) categoryMap[i.category] = { count: 0, scores: [] };
      categoryMap[i.category].count++;
      categoryMap[i.category].scores.push(i.impactScore);
    });
    const categories = Object.entries(categoryMap)
      .map(([name, data]) => ({ name, count: data.count, avgImpact: avg(data.scores) }))
      .sort((a, b) => b.count - a.count);

    const regionMap = {};
    items.forEach((i) => {
      if (!regionMap[i.region]) regionMap[i.region] = { count: 0, scores: [] };
      regionMap[i.region].count++;
      regionMap[i.region].scores.push(i.impactScore);
    });
    const regions = Object.entries(regionMap)
      .map(([name, data]) => ({ name, count: data.count, avgImpact: avg(data.scores) }))
      .sort((a, b) => b.count - a.count);

    const topItems = [...items]
      .sort((a, b) => b.impactScore - a.impactScore || new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 5);

    const topCategory = categories[0]?.name || 'N/A';
    const maxRegionCount = Math.max(...regions.map((r) => r.count), 1);
    const maxCatCount = Math.max(...categories.map((c) => c.count), 1);

    return { high, medium, low, inflationary, disinflationary, inflationNeutral, inflationTilt, positive, negative, growthMixed, growthTilt, categories, regions, topItems, topCategory, maxRegionCount, maxCatCount };
  }, [items]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 md:pb-0">
      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="Event Count">
          <div className="text-2xl font-bold text-gray-100">{items.length}</div>
          <div className="flex gap-3 text-xs">
            <span className="text-red-400">{stats.high} high</span>
            <span className="text-amber-400">{stats.medium} med</span>
            <span className="text-gray-500">{stats.low} low</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Inflation Pulse">
          <div className="flex items-center gap-3">
            <TiltArrow direction={stats.inflationTilt} />
            <span className="text-sm text-gray-300">
              {stats.inflationTilt === 'up' ? 'Inflationary' : stats.inflationTilt === 'down' ? 'Disinflationary' : 'Balanced'}
            </span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-red-400">{stats.inflationary} up</span>
            <span className="text-emerald-400">{stats.disinflationary} down</span>
            <span className="text-gray-500">{stats.inflationNeutral} neutral</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Growth Signal">
          <div className="flex items-center gap-3">
            <TiltArrow direction={stats.growthTilt === 'up' ? 'up' : stats.growthTilt === 'down' ? 'down' : 'flat'} />
            <span className="text-sm text-gray-300">
              {stats.growthTilt === 'up' ? 'Positive' : stats.growthTilt === 'down' ? 'Negative' : 'Mixed'}
            </span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-400">{stats.positive} pos</span>
            <span className="text-red-400">{stats.negative} neg</span>
            <span className="text-gray-500">{stats.growthMixed} mixed</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Top Category">
          <div className="text-lg font-bold text-gray-100">{stats.topCategory}</div>
          <div className="text-xs text-gray-500">
            {stats.categories[0]?.count || 0} events
          </div>
        </SummaryCard>
      </div>

      {/* Row 2: Regional Heat */}
      <div className="bg-[#12121A] border border-gray-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Regional Distribution
        </h3>
        <div className="space-y-2.5">
          {stats.regions.map((r) => (
            <HBar
              key={r.name}
              label={r.name}
              value={r.count}
              max={stats.maxRegionCount}
              color={r.avgImpact >= 7 ? 'bg-red-500/80' : r.avgImpact >= 4 ? 'bg-amber-500/80' : 'bg-emerald-500/80'}
            />
          ))}
        </div>
      </div>

      {/* Row 3: Category Distribution */}
      <div className="bg-[#12121A] border border-gray-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Category Breakdown
        </h3>
        <div className="space-y-2.5">
          {stats.categories.map((c) => (
            <HBar
              key={c.name}
              label={c.name}
              value={c.count}
              max={stats.maxCatCount}
              color={c.avgImpact >= 7 ? 'bg-red-500/80' : c.avgImpact >= 4 ? 'bg-amber-500/80' : 'bg-emerald-500/80'}
              suffix={` (${c.avgImpact.toFixed(1)})`}
            />
          ))}
        </div>
      </div>

      {/* Row 4: High Impact Events */}
      <div className="bg-[#12121A] border border-gray-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Top Impact Events
        </h3>
        <div className="space-y-3">
          {stats.topItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${
                selectedId === item.id
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-[#0A0A0F] border border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <CategoryBadge category={item.category} />
                <ImpactBadge score={item.impactScore} />
                <span className="ml-auto text-xs text-gray-500">{item.source}</span>
              </div>
              <p className="text-sm text-gray-200 font-medium leading-snug line-clamp-2">
                {item.headline}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
