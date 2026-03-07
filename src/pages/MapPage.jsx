// ---------------------------------------------------------------------------
// MapPage.jsx — 2D Interactive Map Explorer
// Layers: events, waterways, ports. Filters: severity, category, region, source.
// Timeline slider. Strategic overlays with dataset-required flags.
// ---------------------------------------------------------------------------

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { SEVERITY, CATEGORIES, REGIONS } from '../services/eventModel.js';
import { STRATEGIC_WATERWAYS, MAJOR_PORTS, getMapLayers } from '../services/strategicData.js';
import 'leaflet/dist/leaflet.css';

function MapPage({ events, onSelectEvent }) {
  // Map-specific filters
  const [mapSeverity, setMapSeverity] = useState(0);
  const [mapCategory, setMapCategory] = useState('');
  const [mapRegion, setMapRegion] = useState('');
  const [timelineHours, setTimelineHours] = useState(168); // 7 days default

  // Layer toggles
  const [showEvents, setShowEvents] = useState(true);
  const [showWaterways, setShowWaterways] = useState(true);
  const [showPorts, setShowPorts] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const layers = getMapLayers();

  // Filter + geolocate events
  const mappableEvents = useMemo(() => {
    const now = new Date();
    return events.filter(e => {
      if (!e.coordinates?.lat || !e.coordinates?.lng) return false;
      if (mapSeverity && e.severity < mapSeverity) return false;
      if (mapCategory && e.category !== mapCategory) return false;
      if (mapRegion && e.primaryRegion !== mapRegion && !e.secondaryRegions?.includes(mapRegion)) return false;
      const hoursAgo = (now - new Date(e.publishedAt)) / (1000 * 60 * 60);
      if (hoursAgo > timelineHours) return false;
      return true;
    });
  }, [events, mapSeverity, mapCategory, mapRegion, timelineHours]);

  const unmappableCount = events.length - events.filter(e => e.coordinates?.lat && e.coordinates?.lng).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100">Map Explorer</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{mappableEvents.length} events shown</span>
          {unmappableCount > 0 && (
            <span className="text-amber-400 text-xs">{unmappableCount} ungeolocated</span>
          )}
        </div>
      </div>

      {/* Map filters bar */}
      <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <div className="flex items-center gap-1">
            {[
              { label: 'All', value: 0 },
              { label: 'Material+', value: 2 },
              { label: 'Major', value: 3 },
            ].map(opt => (
              <button key={opt.value} onClick={() => setMapSeverity(opt.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  mapSeverity === opt.value
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                    : 'bg-[#0A0A0F] text-gray-400 border border-gray-700 hover:border-gray-500'
                }`}>{opt.label}</button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-700" />

          {/* Category */}
          <select value={mapCategory} onChange={e => setMapCategory(e.target.value)}
            className="bg-[#0A0A0F] rounded-lg px-2 py-1 text-xs text-gray-300 border border-gray-700 outline-none cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Region */}
          <select value={mapRegion} onChange={e => setMapRegion(e.target.value)}
            className="bg-[#0A0A0F] rounded-lg px-2 py-1 text-xs text-gray-300 border border-gray-700 outline-none cursor-pointer">
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <div className="w-px h-5 bg-gray-700" />

          {/* Layer toggle */}
          <button onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              showLayerPanel ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' : 'bg-[#0A0A0F] text-gray-400 border border-gray-700'
            }`}>
            Layers
          </button>
        </div>

        {/* Timeline slider */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-500 shrink-0">Timeline:</span>
          <input type="range" min={1} max={336} value={timelineHours}
            onChange={e => setTimelineHours(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          <span className="text-xs text-gray-400 tabular-nums shrink-0 w-16 text-right">
            {timelineHours < 24 ? `${timelineHours}h` : `${Math.round(timelineHours / 24)}d`}
          </span>
        </div>
      </div>

      {/* Layer panel */}
      {showLayerPanel && (
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-3 space-y-3">
          <LayerGroup title="Live Layers">
            <LayerToggle label="News Events" active={showEvents} onChange={setShowEvents} color="bg-emerald-400" />
          </LayerGroup>
          <LayerGroup title="Strategic Layers">
            <LayerToggle label={`Waterways & Chokepoints (${STRATEGIC_WATERWAYS.length})`} active={showWaterways} onChange={setShowWaterways} color="bg-sky-400" />
            <LayerToggle label={`Major Ports (${MAJOR_PORTS.length})`} active={showPorts} onChange={setShowPorts} color="bg-purple-400" />
            {layers.strategic.filter(l => !l.available).map(l => (
              <div key={l.id} className="flex items-center gap-2 text-xs text-gray-600 pl-6">
                <span className="w-2 h-2 rounded-full bg-gray-700" />
                {l.name} <span className="text-amber-500/60 ml-1">Dataset required</span>
              </div>
            ))}
          </LayerGroup>
          <LayerGroup title="Risk / Context Layers">
            {layers.risk.map(l => (
              <div key={l.id} className="flex items-center gap-2 text-xs text-gray-600 pl-6">
                <span className="w-2 h-2 rounded-full bg-gray-700" />
                {l.name} <span className="text-amber-500/60 ml-1">Dataset required</span>
              </div>
            ))}
          </LayerGroup>
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-800/60" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
        <MapContainer center={[25, 10]} zoom={2} className="h-full w-full"
          style={{ background: '#0A0A0F' }} zoomControl={true} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={18}
          />

          {/* Event markers */}
          {showEvents && mappableEvents.map(event => (
            <EventMarker key={event.eventId} event={event} onSelect={onSelectEvent} />
          ))}

          {/* Strategic waterways */}
          {showWaterways && STRATEGIC_WATERWAYS.map(w => (
            <CircleMarker key={w.name} center={[w.lat, w.lng]} radius={6}
              fillColor="#38bdf8" color="#0ea5e9" weight={2} fillOpacity={0.6}>
              <Tooltip direction="top" className="dark-tooltip">
                <div className="text-xs">
                  <div className="font-bold">{w.name}</div>
                  <div className="text-gray-500">{w.type} - {w.note}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Major ports */}
          {showPorts && MAJOR_PORTS.map(p => (
            <CircleMarker key={p.name} center={[p.lat, p.lng]} radius={4}
              fillColor="#a78bfa" color="#8b5cf6" weight={1} fillOpacity={0.6}>
              <Tooltip direction="top" className="dark-tooltip">
                <div className="text-xs">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-gray-500">{p.country} - {p.throughput}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <LegendDot color="bg-red-500" label="Major" />
        <LegendDot color="bg-amber-500" label="Material" />
        <LegendDot color="bg-gray-400" label="Routine" />
        {showWaterways && <LegendDot color="bg-sky-400" label="Waterway" />}
        {showPorts && <LegendDot color="bg-purple-400" label="Port" />}
      </div>
    </div>
  );
}

function EventMarker({ event, onSelect }) {
  const severity = event.severity || SEVERITY.ROUTINE;
  const color = severity >= SEVERITY.MAJOR ? '#ef4444' : severity >= SEVERITY.MATERIAL ? '#f59e0b' : '#9ca3af';
  const radius = severity >= SEVERITY.MAJOR ? 10 : severity >= SEVERITY.MATERIAL ? 7 : 5;

  return (
    <CircleMarker center={[event.coordinates.lat, event.coordinates.lng]}
      radius={radius} fillColor={color} color={color} weight={1} fillOpacity={0.7}
      eventHandlers={{ click: () => onSelect?.(event) }}>
      <Popup>
        <div className="text-xs max-w-64">
          <div className="font-bold text-gray-900 mb-1 leading-snug">{event.headline}</div>
          <div className="text-gray-600 mb-1 line-clamp-2">{event.executiveSummary}</div>
          <div className="flex items-center gap-2 text-gray-500">
            <span>{event.category}</span>
            {event.primaryCountry && <span>{event.primaryCountry}</span>}
            {event.sourceCount > 1 && <span>{event.sourceCount} sources</span>}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function LayerGroup({ title, children }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function LayerToggle({ label, active, onChange, color }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white pl-1">
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
        active ? 'bg-emerald-500/20 border-emerald-500' : 'border-gray-600'
      }`}>
        {active && <span className="text-emerald-400 text-[10px]">&#10003;</span>}
      </div>
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </label>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      {label}
    </div>
  );
}

export default MapPage;
