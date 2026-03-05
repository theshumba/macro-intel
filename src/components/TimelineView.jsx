import { useMemo } from 'react';
import ImpactBadge from './ImpactBadge';
import CategoryBadge from './CategoryBadge';

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getHoursAgo(date) {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
}

function dotColor(score) {
  if (score >= 7) return 'bg-red-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-gray-500';
}

const TIME_BUCKETS = [
  { label: 'Last 6 Hours', maxHours: 6 },
  { label: '6-12 Hours', maxHours: 12 },
  { label: '12-24 Hours', maxHours: 24 },
  { label: '24-48 Hours', maxHours: 48 },
  { label: '48+ Hours', maxHours: Infinity },
];

function TimelineView({ items = [], onSelect, selectedId }) {
  const grouped = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    const buckets = TIME_BUCKETS.map((b) => ({ ...b, items: [] }));

    sorted.forEach((item) => {
      const hours = getHoursAgo(item.publishedAt);
      for (const bucket of buckets) {
        if (hours < bucket.maxHours) {
          bucket.items.push(item);
          break;
        }
      }
    });

    return buckets.filter((b) => b.items.length > 0);
  }, [items]);

  const stats = useMemo(() => {
    const last24h = items.filter((i) => getHoursAgo(i.publishedAt) < 24).length;
    const highImpact = items.filter((i) => i.impactScore >= 7).length;
    const catCounts = {};
    items.forEach((i) => {
      catCounts[i.category] = (catCounts[i.category] || 0) + 1;
    });
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    return { last24h, highImpact, topCat: topCat?.[0] || 'N/A' };
  }, [items]);

  return (
    <div className="pb-16 md:pb-0">
      {/* Quick stats */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 text-xs text-gray-400">
        <span>
          <span className="text-gray-200 font-semibold">{stats.last24h}</span> events in 24h
        </span>
        <span className="text-gray-700">|</span>
        <span>
          <span className="text-red-400 font-semibold">{stats.highImpact}</span> high impact
        </span>
        <span className="text-gray-700">|</span>
        <span>
          Top: <span className="text-emerald-400 font-semibold">{stats.topCat}</span>
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-emerald-500/20" />

        {grouped.map((bucket) => (
          <div key={bucket.label} className="mb-6">
            {/* Time bucket header */}
            <div className="sticky top-16 z-10 flex items-center gap-3 mb-3 ml-0">
              <div className="w-[31px] flex justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border-2 border-emerald-500/60" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70 bg-[#0A0A0F] px-2 py-0.5 rounded">
                {bucket.label}
              </span>
            </div>

            {/* Events */}
            <div className="space-y-3">
              {bucket.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 ml-0">
                  {/* Timeline dot + connector */}
                  <div className="w-[31px] flex flex-col items-center shrink-0 pt-4">
                    <div className={`w-3 h-3 rounded-full ${dotColor(item.impactScore)} shadow-sm`} />
                  </div>

                  {/* Event card */}
                  <button
                    onClick={() => onSelect(item)}
                    className={`flex-1 text-left p-3 sm:p-4 rounded-xl transition-all cursor-pointer ${
                      selectedId === item.id
                        ? 'bg-[#12121A] border border-emerald-500/40 ring-1 ring-emerald-500/20'
                        : 'bg-[#12121A] border border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CategoryBadge category={item.category} />
                      <ImpactBadge score={item.impactScore} />
                      <span className="ml-auto text-xs text-gray-500 tabular-nums">
                        {timeAgo(item.publishedAt)}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm font-bold text-gray-100 leading-snug mb-1.5">
                      {item.headline}
                    </h3>

                    {/* Summary */}
                    {item.summary && (
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-2">
                        {item.summary}
                      </p>
                    )}

                    {/* Source */}
                    <div className="text-xs text-gray-500 font-medium">
                      {item.source}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimelineView;
