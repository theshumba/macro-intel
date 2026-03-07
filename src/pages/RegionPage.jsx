// ---------------------------------------------------------------------------
// RegionPage.jsx — Filtered view for a specific geopolitical region
// Shows all events for the region + regional context summary.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard.jsx';
import { SEVERITY, REGIONS } from '../services/eventModel.js';

function RegionPage({ events, onSelectEvent, selectedEventId }) {
  const { region } = useParams();
  const decodedRegion = decodeURIComponent(region);

  const regionEvents = useMemo(() => {
    return events.filter(e =>
      e.primaryRegion === decodedRegion ||
      e.secondaryRegions?.includes(decodedRegion)
    ).sort((a, b) => b.severity - a.severity || new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [events, decodedRegion]);

  const stats = useMemo(() => {
    const major = regionEvents.filter(e => e.severity >= SEVERITY.MAJOR).length;
    const material = regionEvents.filter(e => e.severity === SEVERITY.MATERIAL).length;
    const countries = [...new Set(regionEvents.map(e => e.primaryCountry).filter(Boolean))];
    const categories = {};
    for (const e of regionEvents) {
      const c = e.category || 'Unknown';
      categories[c] = (categories[c] || 0) + 1;
    }
    return { major, material, countries, categories: Object.entries(categories).sort((a, b) => b[1] - a[1]) };
  }, [regionEvents]);

  const isValidRegion = REGIONS.includes(decodedRegion);

  if (!isValidRegion) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-gray-100">Unknown Region</h1>
        <p className="text-gray-400">Region "{decodedRegion}" not recognized.</p>
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
          <span className="text-xs text-gray-400">Regions</span>
          <h1 className="text-xl font-bold text-gray-100 mt-1">{decodedRegion}</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-100 tabular-nums">{regionEvents.length}</div>
          <div className="text-xs text-gray-500">events</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Major" value={stats.major} color="text-red-400" />
        <MiniStat label="Material" value={stats.material} color="text-amber-400" />
        <MiniStat label="Countries" value={stats.countries.length} color="text-sky-400" />
        <MiniStat label="Categories" value={stats.categories.length} color="text-purple-400" />
      </div>

      {/* Country tags */}
      {stats.countries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stats.countries.map(c => (
            <Link key={c} to={`/country/${encodeURIComponent(c)}`}
              className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 border border-gray-700 hover:border-emerald-500/50 transition-colors">
              {c}
            </Link>
          ))}
        </div>
      )}

      {/* Category breakdown */}
      {stats.categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {stats.categories.map(([cat, count]) => (
            <Link key={cat} to={`/theme/${encodeURIComponent(cat)}`}
              className="bg-[#12121A] rounded-lg px-3 py-2 border border-gray-800/40 hover:border-emerald-500/30 transition-colors flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate">{cat}</span>
              <span className="text-sm text-gray-300 font-medium tabular-nums ml-2">{count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Events */}
      {regionEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No events for this region.</p>
          <p className="text-sm">Try expanding your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {regionEvents.map((event, i) => (
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

      {/* All regions nav */}
      <div className="border-t border-gray-800/60 pt-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">All Regions</div>
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map(r => (
            <Link key={r} to={`/region/${encodeURIComponent(r)}`}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                r === decodedRegion
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                  : 'bg-[#0A0A0F] text-gray-400 border border-gray-700 hover:border-gray-500'
              }`}>
              {r}
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

export default RegionPage;
