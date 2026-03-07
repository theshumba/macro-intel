// ---------------------------------------------------------------------------
// MapPage.jsx — 2D Interactive Map (Leaflet)
// Clustered pins, severity coloring, hover summaries, click-through.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { SEVERITY } from '../services/eventModel.js';
import 'leaflet/dist/leaflet.css';

function MapPage({ events, onSelectEvent }) {
  // Filter events that have coordinates
  const mappableEvents = useMemo(() =>
    events.filter(e => e.coordinates?.lat && e.coordinates?.lng),
    [events]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100">Map Explorer</h1>
        <span className="text-sm text-gray-500">{mappableEvents.length} geolocated events</span>
      </div>

      {/* Missing coordinates notice */}
      {events.length > mappableEvents.length && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400">
          {events.length - mappableEvents.length} event(s) could not be geolocated and are not shown on the map.
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-gray-800/60" style={{ height: 'calc(100vh - 240px)', minHeight: '400px' }}>
        <MapContainer
          center={[25, 10]}
          zoom={2}
          className="h-full w-full"
          style={{ background: '#0A0A0F' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={18}
          />

          {mappableEvents.map(event => (
            <EventMarker
              key={event.eventId}
              event={event}
              onSelect={onSelectEvent}
            />
          ))}
        </MapContainer>
      </div>

      {/* Layer legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          Major
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          Material
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400" />
          Routine
        </div>
      </div>
    </div>
  );
}

function EventMarker({ event, onSelect }) {
  const severity = event.severity || SEVERITY.ROUTINE;

  const color = severity >= SEVERITY.MAJOR ? '#ef4444'
    : severity >= SEVERITY.MATERIAL ? '#f59e0b'
    : '#9ca3af';

  const radius = severity >= SEVERITY.MAJOR ? 10
    : severity >= SEVERITY.MATERIAL ? 7
    : 5;

  return (
    <CircleMarker
      center={[event.coordinates.lat, event.coordinates.lng]}
      radius={radius}
      fillColor={color}
      color={color}
      weight={1}
      fillOpacity={0.7}
      eventHandlers={{
        click: () => onSelect?.(event),
      }}
    >
      <Popup className="dark-popup">
        <div className="text-xs max-w-64">
          <div className="font-bold text-gray-900 mb-1 leading-snug">{event.headline}</div>
          <div className="text-gray-600 mb-1 line-clamp-2">{event.executiveSummary}</div>
          <div className="flex items-center gap-2 text-gray-500">
            <span>{event.category}</span>
            <span>{event.primaryCountry}</span>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default MapPage;
