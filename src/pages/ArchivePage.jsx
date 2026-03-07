// ---------------------------------------------------------------------------
// ArchivePage.jsx — Searchable historical event archive
// Full-text search, filters, event lifecycle log.
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from 'react';
import { getEvents, getArchiveStats } from '../services/archiveDb.js';
import EventCard from '../components/EventCard.jsx';
import { CATEGORIES, REGIONS } from '../services/eventModel.js';

function ArchivePage({ onSelectEvent, selectedEventId }) {
  const [archiveEvents, setArchiveEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const loadArchive = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getEvents({
        search: search || undefined,
        category: categoryFilter || undefined,
        region: regionFilter || undefined,
        severity: severityFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setArchiveEvents(result.events);
      setTotal(result.total);
    } catch (err) {
      console.warn('[archive] Load failed:', err.message);
    }
    setLoading(false);
  }, [search, categoryFilter, regionFilter, severityFilter, page]);

  useEffect(() => {
    loadArchive();
  }, [loadArchive]);

  useEffect(() => {
    getArchiveStats().then(setStats).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100">Event Archive</h1>
        {stats && (
          <span className="text-sm text-gray-500">{stats.total} total events stored</span>
        )}
      </div>

      {/* Search + Filters */}
      <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-3 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search events, countries, categories, sources..."
              className="w-full bg-[#0A0A0F] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none border border-gray-700 focus:border-emerald-500/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">&#x1F50D;</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
            className="bg-[#0A0A0F] rounded-lg px-3 py-1.5 text-sm text-gray-300 border border-gray-700 outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select
            value={regionFilter}
            onChange={e => { setRegionFilter(e.target.value); setPage(0); }}
            className="bg-[#0A0A0F] rounded-lg px-3 py-1.5 text-sm text-gray-300 border border-gray-700 outline-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={severityFilter}
            onChange={e => { setSeverityFilter(Number(e.target.value)); setPage(0); }}
            className="bg-[#0A0A0F] rounded-lg px-3 py-1.5 text-sm text-gray-300 border border-gray-700 outline-none cursor-pointer"
          >
            <option value={0}>All Severity</option>
            <option value={1}>Routine+</option>
            <option value={2}>Material+</option>
            <option value={3}>Major only</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading archive...</div>
      ) : archiveEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No archived events found.</p>
          <p className="text-sm">Events are archived automatically as they are ingested.</p>
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-500 mb-2">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {archiveEvents.map((event, i) => (
              <EventCard
                key={event.eventId}
                event={event}
                onSelect={onSelectEvent}
                isSelected={event.eventId === selectedEventId}
                index={i}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-sm bg-[#12121A] border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-[#12121A] border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ArchivePage;
