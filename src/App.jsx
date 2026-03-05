import { useState, useMemo, useCallback, useEffect } from "react";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import NewsList from "./components/NewsList";
import GlobeView from "./components/GlobeView";
import DashboardView from "./components/DashboardView";
import TimelineView from "./components/TimelineView";
import BriefPanel from "./components/BriefPanel";
import ViewSwitcher from "./components/ViewSwitcher";
import Toast from "./components/Toast";
import { fetchAllFeeds, CATEGORIES, REGIONS } from "./services/feedService";
import { generateBrief } from "./services/briefGenerator";

const DEFAULT_FILTERS = {
  category: "",
  region: "",
  impact: "",
  dateRange: "all",
  search: "",
};

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [brief, setBrief] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [view, setView] = useState("globe");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllFeeds();
      setItems(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeeds();
    // Auto-refresh every 15 minutes
    const interval = setInterval(loadFeeds, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadFeeds]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.region && item.region !== filters.region) return false;

      if (filters.impact) {
        const score = item.impactScore;
        if (filters.impact === "low" && score > 3) return false;
        if (filters.impact === "medium" && (score < 4 || score > 6))
          return false;
        if (filters.impact === "high" && score < 7) return false;
      }

      if (filters.dateRange && filters.dateRange !== "all") {
        const now = new Date();
        const published = new Date(item.publishedAt);
        const hoursAgo = (now - published) / (1000 * 60 * 60);
        if (filters.dateRange === "today" && hoursAgo > 24) return false;
        if (filters.dateRange === "3days" && hoursAgo > 72) return false;
        if (filters.dateRange === "week" && hoursAgo > 168) return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const searchable = `${item.headline} ${item.summary}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [items, filters]);

  const handleSelect = useCallback((item) => {
    setSelectedId((prev) => {
      if (prev === item.id) {
        setBrief(null);
        return null;
      }
      setBrief(generateBrief(item));
      return item.id;
    });
  }, []);

  const handleCloseBrief = useCallback(() => {
    setBrief(null);
    setSelectedId(null);
  }, []);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedId) || null,
    [items, selectedId]
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header
        lastUpdated={lastUpdated}
        itemCount={filteredItems.length}
        onRefresh={loadFeeds}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 pb-20 md:pb-6">
        {/* View toggle + filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <ViewSwitcher view={view} onViewChange={setView} />
          <div className="flex-1">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              categories={CATEGORIES}
              regions={REGIONS}
              collapsed={!filtersOpen}
            />
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-5 space-y-3" style={{ animationDelay: `${i * 0.1}s` }}>
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-400 text-sm">Failed to load feeds: {error}</span>
            <button
              onClick={loadFeeds}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && (
          <div key={view} className="animate-view-enter">
            {view === "globe" && (
              <GlobeView
                items={filteredItems}
                onSelect={handleSelect}
                selectedId={selectedId}
              />
            )}

            {view === "list" && (
              <NewsList
                items={filteredItems}
                onSelect={handleSelect}
                selectedId={selectedId}
              />
            )}

            {view === "dashboard" && (
              <DashboardView
                items={filteredItems}
                onSelect={handleSelect}
                selectedId={selectedId}
              />
            )}

            {view === "timeline" && (
              <TimelineView
                items={filteredItems}
                onSelect={handleSelect}
                selectedId={selectedId}
              />
            )}
          </div>
        )}
      </main>

      <BriefPanel brief={brief} item={selectedItem} onClose={handleCloseBrief} />
      <Toast />
    </div>
  );
}

export default App;
