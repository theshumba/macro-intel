// ---------------------------------------------------------------------------
// CountryPage.jsx — Filtered view for a specific country
// Shows all events mentioning the country + country context.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard.jsx';
import { SEVERITY } from '../services/eventModel.js';

function CountryPage({ events, onSelectEvent, selectedEventId }) {
  const { country } = useParams();
  const decodedCountry = decodeURIComponent(country);

  const countryEvents = useMemo(() => {
    return events.filter(e =>
      e.primaryCountry === decodedCountry ||
      e.secondaryCountries?.includes(decodedCountry)
    ).sort((a, b) => b.severity - a.severity || new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [events, decodedCountry]);

  const stats = useMemo(() => {
    const major = countryEvents.filter(e => e.severity >= SEVERITY.MAJOR).length;
    const material = countryEvents.filter(e => e.severity === SEVERITY.MATERIAL).length;
    const regions = [...new Set(countryEvents.map(e => e.primaryRegion).filter(Boolean))];
    const categories = {};
    for (const e of countryEvents) {
      const c = e.category || 'Unknown';
      categories[c] = (categories[c] || 0) + 1;
    }
    const sources = new Set();
    for (const e of countryEvents) {
      for (const s of (e.sources || [])) sources.add(s.name);
    }
    return {
      major, material, regions, sources: sources.size,
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
    };
  }, [countryEvents]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">Dashboard</Link>
          <span className="text-xs text-gray-600 mx-1.5">/</span>
          <span className="text-xs text-gray-400">Countries</span>
          <h1 className="text-xl font-bold text-gray-100 mt-1">{decodedCountry}</h1>
          {stats.regions.length > 0 && (
            <div className="flex gap-1.5 mt-1">
              {stats.regions.map(r => (
                <Link key={r} to={`/region/${encodeURIComponent(r)}`}
                  className="text-xs text-emerald-400/70 hover:text-emerald-400">
                  {r}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-100 tabular-nums">{countryEvents.length}</div>
          <div className="text-xs text-gray-500">events</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Major" value={stats.major} color="text-red-400" />
        <MiniStat label="Material" value={stats.material} color="text-amber-400" />
        <MiniStat label="Sources" value={stats.sources} color="text-sky-400" />
        <MiniStat label="Categories" value={stats.categories.length} color="text-purple-400" />
      </div>

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
      {countryEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No events for {decodedCountry}.</p>
          <p className="text-sm">This country may not appear in current feeds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {countryEvents.map((event, i) => (
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

export default CountryPage;
