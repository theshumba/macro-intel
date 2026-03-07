// ---------------------------------------------------------------------------
// App.jsx — Main application shell for Macro Intel v5
// React Router for multi-page navigation, new ingestion engine,
// new event model, new severity-based UI.
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import FilterBar from './components/FilterBar';
import EventDetailPanel from './components/EventDetailPanel';
import Toast from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import MapPage from './pages/MapPage';
import MarketsPage from './pages/MarketsPage';
import ArchivePage from './pages/ArchivePage';
import RegionPage from './pages/RegionPage';
import CountryPage from './pages/CountryPage';
import ThemePage from './pages/ThemePage';
import { ingestAll, ingestByPollInterval, CATEGORIES_COMPAT, REGIONS_COMPAT } from './services/ingestionEngine';

const DEFAULT_FILTERS = {
  category: '',
  region: '',
  severity: '',
  dateRange: 'all',
  search: '',
};

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ---- Data loading -------------------------------------------------------

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ingestAll();
      setEvents(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Merge strategy for tiered updates: update existing events by eventId,
  // append new ones. No full re-dedup needed since ingestByPollInterval
  // already deduplicates its batch internally.
  const mergeEvents = useCallback((newEvents) => {
    setEvents(prev => {
      const eventMap = new Map(prev.map(e => [e.eventId, e]));
      for (const event of newEvents) {
        eventMap.set(event.eventId, event);
      }
      return Array.from(eventMap.values());
    });
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    // Initial load: fetch ALL feeds to avoid cold-start gaps
    loadEvents();

    // Tiered polling intervals for subsequent refreshes
    // Tier 2 (news feeds): refresh every 10 minutes
    const newsInterval = setInterval(async () => {
      console.info('[polling] Refreshing feeds with pollMinutes <= 10');
      try {
        const newEvents = await ingestByPollInterval(10);
        if (newEvents.length > 0) mergeEvents(newEvents);
      } catch (err) {
        console.warn('[polling] Tier 10min refresh failed:', err.message);
      }
    }, 10 * 60 * 1000);

    // Tier 1 (official feeds): refresh every 15 minutes
    // This also catches news feeds at the 15-min mark, which is fine
    const officialInterval = setInterval(async () => {
      console.info('[polling] Refreshing feeds with pollMinutes <= 15');
      try {
        const newEvents = await ingestByPollInterval(15);
        if (newEvents.length > 0) mergeEvents(newEvents);
      } catch (err) {
        console.warn('[polling] Tier 15min refresh failed:', err.message);
      }
    }, 15 * 60 * 1000);

    // TODO: When market tier feeds (Tier 4, pollMinutes: 1-5) are implemented,
    // add a 1-5 minute interval here:
    // const marketInterval = setInterval(async () => {
    //   const newEvents = await ingestByPollInterval(5);
    //   if (newEvents.length > 0) mergeEvents(newEvents);
    // }, 1 * 60 * 1000);

    return () => {
      clearInterval(newsInterval);
      clearInterval(officialInterval);
      // clearInterval(marketInterval);
    };
  }, [loadEvents, mergeEvents]);

  // ---- Filtering ----------------------------------------------------------

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.category && event.category !== filters.category) return false;

      if (filters.region) {
        if (event.primaryRegion !== filters.region &&
            !event.secondaryRegions?.includes(filters.region)) return false;
      }

      if (filters.severity) {
        const minSeverity = filters.severity === 'major' ? 3
          : filters.severity === 'material' ? 2 : 1;
        if (event.severity < minSeverity) return false;
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        const published = new Date(event.publishedAt);
        const hoursAgo = (now - published) / (1000 * 60 * 60);
        if (filters.dateRange === 'today' && hoursAgo > 24) return false;
        if (filters.dateRange === '3days' && hoursAgo > 72) return false;
        if (filters.dateRange === 'week' && hoursAgo > 168) return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const searchable = [
          event.headline,
          event.executiveSummary,
          event.category,
          event.primaryCountry,
          event.primaryRegion,
          ...(event.subcategoryTags || []),
          ...(event.sources?.map(s => s.name) || []),
        ].join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [events, filters]);

  // ---- Event selection ----------------------------------------------------

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(prev =>
      prev?.eventId === event.eventId ? null : event
    );
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // ---- Render -------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header
        lastUpdated={lastUpdated}
        itemCount={filteredEvents.length}
        onRefresh={loadEvents}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 pb-20 md:pb-6">
        {/* Navigation + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Navigation />
          <div className="flex-1">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              categories={CATEGORIES_COMPAT}
              regions={REGIONS_COMPAT}
              collapsed={!filtersOpen}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && events.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="skeleton h-5 w-20" />
                  <div className="skeleton h-5 w-14" />
                </div>
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="flex justify-between">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-400 text-sm">Failed to load feeds: {error}</span>
            <button
              onClick={loadEvents}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Routes */}
        {!loading || events.length > 0 ? (
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  events={filteredEvents}
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.eventId}
                />
              }
            />
            <Route
              path="/events"
              element={
                <EventsPage
                  events={filteredEvents}
                  filters={filters}
                  onFilterChange={setFilters}
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.eventId}
                />
              }
            />
            <Route
              path="/map"
              element={
                <MapPage
                  events={filteredEvents}
                  onSelectEvent={handleSelectEvent}
                />
              }
            />
            <Route path="/markets" element={<MarketsPage />} />
            <Route
              path="/archive"
              element={
                <ArchivePage
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.eventId}
                />
              }
            />
            <Route
              path="/region/:region"
              element={
                <RegionPage
                  events={filteredEvents}
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.eventId}
                />
              }
            />
            <Route
              path="/country/:country"
              element={
                <CountryPage
                  events={filteredEvents}
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.eventId}
                />
              }
            />
            <Route
              path="/theme/:category"
              element={
                <ThemePage
                  events={filteredEvents}
                  onSelectEvent={handleSelectEvent}
                  selectedEventId={selectedEvent?.eventId}
                />
              }
            />
          </Routes>
        ) : null}
      </main>

      {/* Event Detail Panel */}
      <EventDetailPanel event={selectedEvent} onClose={handleCloseDetail} />
      <Toast />
    </div>
  );
}

export default App;
