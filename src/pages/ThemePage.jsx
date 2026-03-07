// ---------------------------------------------------------------------------
// ThemePage.jsx — Filtered view for a specific category/theme
// Shows all events for the category + thematic context.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard.jsx';
import { SEVERITY, CATEGORIES } from '../services/eventModel.js';

function ThemePage({ events, onSelectEvent, selectedEventId }) {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);

  const themeEvents = useMemo(() => {
    return events.filter(e => e.category === decodedCategory)
      .sort((a, b) => b.severity - a.severity || new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [events, decodedCategory]);

  const stats = useMemo(() => {
    const major = themeEvents.filter(e => e.severity >= SEVERITY.MAJOR).length;
    const material = themeEvents.filter(e => e.severity === SEVERITY.MATERIAL).length;
    const regions = {};
    const countries = new Set();
    for (const e of themeEvents) {
      if (e.primaryRegion) {
        regions[e.primaryRegion] = (regions[e.primaryRegion] || 0) + 1;
      }
      if (e.primaryCountry) countries.add(e.primaryCountry);
    }
    const tags = {};
    for (const e of themeEvents) {
      for (const t of (e.subcategoryTags || [])) {
        tags[t] = (tags[t] || 0) + 1;
      }
    }
    return {
      major, material,
      regions: Object.entries(regions).sort((a, b) => b[1] - a[1]),
      countries: [...countries],
      tags: Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 12),
    };
  }, [themeEvents]);

  const isValidCategory = CATEGORIES.includes(decodedCategory);

  if (!isValidCategory) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-gray-100">Unknown Category</h1>
        <p className="text-gray-400">Category "{decodedCategory}" not recognized.</p>
        <Link to="/" className="text-emerald-400 text-sm hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">Dashboard</Link>
          <span className="text-xs text-gray-600 mx-1.5">/</span>
          <span className="text-xs text-gray-400">Themes</span>
          <h1 className="text-xl font-bold text-gray-100 mt-1">{decodedCategory}</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-100 tabular-nums">{themeEvents.length}</div>
          <div className="text-xs text-gray-500">events</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Major" value={stats.major} color="text-red-400" />
        <MiniStat label="Material" value={stats.material} color="text-amber-400" />
        <MiniStat label="Countries" value={stats.countries.length} color="text-sky-400" />
        <MiniStat label="Regions" value={stats.regions.length} color="text-purple-400" />
      </div>

      {/* Tags */}
      {stats.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stats.tags.map(([tag, count]) => (
            <span key={tag} className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400 border border-gray-700">
              {tag} <span className="text-gray-600 ml-0.5">{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Regional spread */}
      {stats.regions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {stats.regions.map(([r, count]) => (
            <Link key={r} to={`/region/${encodeURIComponent(r)}`}
              className="bg-[#12121A] rounded-lg px-3 py-2 border border-gray-800/40 hover:border-emerald-500/30 transition-colors flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate">{r}</span>
              <span className="text-sm text-gray-300 font-medium tabular-nums ml-2">{count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Events */}
      {themeEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No events for this category.</p>
          <p className="text-sm">Try expanding your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {themeEvents.map((event, i) => (
            <EventCard
              key={event.eventId}
              event={event}
              onSelect={onSelectEvent}
              isSelected={event.eventId === selectedEventId}
              index={i}
            />
          ))}
        </div>
      )}

      {/* All categories nav */}
      <div className="border-t border-gray-800/60 pt-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">All Categories</div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <Link key={c} to={`/theme/${encodeURIComponent(c)}`}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                c === decodedCategory
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                  : 'bg-[#0A0A0F] text-gray-400 border border-gray-700 hover:border-gray-500'
              }`}>
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = 'text-gray-100' }) {
  return (
    <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

export default ThemePage;
