// ---------------------------------------------------------------------------
// DashboardPage.jsx — Homepage intelligence dashboard
// Top global developments, regional highlights, official statements,
// market snapshot, major event panel, search, filters.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import EventCard from '../components/EventCard.jsx';
import { SEVERITY } from '../services/eventModel.js';
import 'leaflet/dist/leaflet.css';

function DashboardPage({ events, onSelectEvent, selectedEventId }) {
  // Geolocated events for map preview
  const mappableEvents = useMemo(() =>
    events.filter(e => e.coordinates?.lat && e.coordinates?.lng).slice(0, 50),
  [events]);

  // Market instruments from events
  const topInstruments = useMemo(() => {
    const counts = {};
    for (const e of events) {
      for (const inst of (e.relatedMarketInstruments || [])) {
        const key = inst.name;
        if (!counts[key]) counts[key] = { ...inst, count: 0 };
        counts[key].count++;
      }
    }
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [events]);

  // Separate events by severity and type
  const { majorEvents, materialEvents, officialStatements, recentEvents, regionBreakdown, categoryBreakdown } = useMemo(() => {
    const major = events.filter(e => e.severity >= SEVERITY.MAJOR);
    const material = events.filter(e => e.severity === SEVERITY.MATERIAL);
    const official = events.filter(e =>
      e.sources?.some(s => s.tier === 1) || e.category === 'Central Banks & Monetary Policy'
    );
    const recent = [...events].sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ).slice(0, 10);

    // Region breakdown
    const regionMap = {};
    for (const e of events) {
      const r = e.primaryRegion || 'Unknown';
      if (!regionMap[r]) regionMap[r] = { count: 0, major: 0 };
      regionMap[r].count++;
      if (e.severity >= SEVERITY.MAJOR) regionMap[r].major++;
    }

    // Category breakdown
    const catMap = {};
    for (const e of events) {
      const c = e.category || 'Unknown';
      if (!catMap[c]) catMap[c] = 0;
      catMap[c]++;
    }

    return {
      majorEvents: major,
      materialEvents: material,
      officialStatements: official.slice(0, 5),
      recentEvents: recent,
      regionBreakdown: Object.entries(regionMap).sort((a, b) => b[1].count - a[1].count),
      categoryBreakdown: Object.entries(catMap).sort((a, b) => b[1] - a[1]),
    };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Events" value={events.length} />
        <StatCard label="Major" value={majorEvents.length} color="text-red-400" />
        <StatCard label="Material" value={materialEvents.length} color="text-amber-400" />
        <StatCard label="Sources" value={countUniqueSources(events)} color="text-sky-400" />
      </div>

      {/* Dashboard widgets: Market Snapshot + Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Market Snapshot */}
        <Link to="/markets" className="block group">
          <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-4 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Market Snapshot</h3>
              <span className="text-[10px] text-gray-600 group-hover:text-emerald-400 transition-colors">View Markets →</span>
            </div>
            {topInstruments.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {topInstruments.map(inst => (
                  <div key={inst.name} className="flex items-center gap-2 bg-[#0A0A0F] rounded-lg px-2.5 py-1.5 border border-gray-800/40">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      inst.type === 'currency' ? 'bg-emerald-400' :
                      inst.type === 'bond' ? 'bg-sky-400' :
                      inst.type === 'commodity' ? 'bg-orange-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-xs text-gray-300 truncate">{inst.name}</span>
                    <span className="text-[10px] text-gray-600 ml-auto tabular-nums">{inst.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No market data linked yet.</p>
            )}
          </div>
        </Link>

        {/* Map Preview */}
        <Link to="/map" className="block group">
          <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Map</h3>
              <span className="text-[10px] text-gray-600 group-hover:text-emerald-400 transition-colors">Open Map →</span>
            </div>
            <div className="h-40 pointer-events-none">
              <MapContainer center={[25, 10]} zoom={1} className="h-full w-full"
                style={{ background: '#0A0A0F' }} zoomControl={false} dragging={false}
                scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} attributionControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {mappableEvents.map(e => (
                  <CircleMarker key={e.eventId} center={[e.coordinates.lat, e.coordinates.lng]}
                    radius={e.severity >= 3 ? 5 : e.severity >= 2 ? 4 : 3}
                    fillColor={e.severity >= 3 ? '#ef4444' : e.severity >= 2 ? '#f59e0b' : '#9ca3af'}
                    color="transparent" fillOpacity={0.8} />
                ))}
              </MapContainer>
            </div>
          </div>
        </Link>
      </div>

      {/* Major events panel */}
      {majorEvents.length > 0 && (
        <section>
          <SectionHeader title="Major Developments" count={majorEvents.length} color="text-red-400" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {majorEvents.slice(0, 4).map((event, i) => (
              <EventCard
                key={event.eventId}
                event={event}
                onSelect={onSelectEvent}
                isSelected={event.eventId === selectedEventId}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Two-column layout: Official + Regional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Official Statements */}
        <section>
          <SectionHeader title="Official Statements" count={officialStatements.length} color="text-sky-400" />
          <div className="space-y-2">
            {officialStatements.map(event => (
              <CompactEventRow
                key={event.eventId}
                event={event}
                onClick={() => onSelectEvent(event)}
                isSelected={event.eventId === selectedEventId}
              />
            ))}
            {officialStatements.length === 0 && (
              <p className="text-sm text-gray-500">No official statements in current feed.</p>
            )}
          </div>
        </section>

        {/* Regional breakdown */}
        <section>
          <SectionHeader title="By Region" />
          <div className="space-y-2">
            {regionBreakdown.map(([region, data]) => (
              <Link key={region} to={`/region/${encodeURIComponent(region)}`}
                className="flex items-center justify-between bg-[#12121A] rounded-lg px-3 py-2 border border-gray-800/40 hover:border-emerald-500/30 transition-colors">
                <span className="text-sm text-gray-300">{region}</span>
                <div className="flex items-center gap-3">
                  {data.major > 0 && (
                    <span className="text-xs text-red-400 font-medium">{data.major} major</span>
                  )}
                  <span className="text-sm text-gray-400 tabular-nums font-medium">{data.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Latest events */}
      <section>
        <SectionHeader title="Latest Events" count={recentEvents.length} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentEvents.map((event, i) => (
            <EventCard
              key={event.eventId}
              event={event}
              onSelect={onSelectEvent}
              isSelected={event.eventId === selectedEventId}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Category breakdown */}
      <section>
        <SectionHeader title="By Category" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {categoryBreakdown.map(([cat, count]) => (
            <Link key={cat} to={`/theme/${encodeURIComponent(cat)}`}
              className="bg-[#12121A] rounded-lg px-3 py-2 border border-gray-800/40 hover:border-emerald-500/30 transition-colors flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate">{cat}</span>
              <span className="text-sm text-gray-300 font-medium tabular-nums ml-2">{count}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-100' }) {
  return (
    <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function SectionHeader({ title, count, color = 'text-gray-100' }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className={`text-sm font-semibold uppercase tracking-wider ${color}`}>{title}</h2>
      {typeof count === 'number' && (
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{count}</span>
      )}
    </div>
  );
}

function CompactEventRow({ event, onClick, isSelected }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[#12121A] rounded-lg px-3 py-2.5 border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-emerald-500/50'
          : 'border-gray-800/40 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
          event.severity >= 3 ? 'bg-red-400' : event.severity >= 2 ? 'bg-amber-400' : 'bg-gray-500'
        }`} />
        <div className="min-w-0">
          <div className="text-sm text-gray-200 font-medium leading-snug line-clamp-1">{event.headline}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {event.sources?.[0]?.name || 'Unknown'} - {event.primaryRegion || ''}
          </div>
        </div>
      </div>
    </button>
  );
}

function countUniqueSources(events) {
  const names = new Set();
  for (const e of events) {
    for (const s of (e.sources || [])) {
      names.add(s.name);
    }
  }
  return names.size;
}

export default DashboardPage;
