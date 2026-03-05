import { useState, useMemo, useCallback, useEffect } from "react";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import NewsList from "./components/NewsList";
import BriefPanel from "./components/BriefPanel";
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
  }, [loadFeeds]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.region && item.region !== filters.region) return false;

      if (filters.impact) {
        const score = item.impactScore;
        if (filters.impact === "low" && score > 3) return false;
        if (filters.impact === "medium" && (score < 4 || score > 6)) return false;
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

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header
        lastUpdated={lastUpdated}
        itemCount={filteredItems.length}
        onRefresh={loadFeeds}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          categories={CATEGORIES}
          regions={REGIONS}
        />

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Fetching global intelligence feeds...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            Failed to load feeds: {error}
          </div>
        )}

        {!loading && (
          <NewsList
            items={filteredItems}
            onSelect={handleSelect}
            selectedId={selectedId}
          />
        )}
      </main>

      <BriefPanel brief={brief} onClose={handleCloseBrief} />
    </div>
  );
}

export default App;
