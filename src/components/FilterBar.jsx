const IMPACT_RANGES = [
  { label: "Low", value: "low", range: "1-3" },
  { label: "Medium", value: "medium", range: "4-6" },
  { label: "High", value: "high", range: "7-10" },
];

const DATE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "3 Days", value: "3days" },
  { label: "Week", value: "week" },
  { label: "All", value: "all" },
];

function FilterBar({ filters, onFilterChange, categories, regions, collapsed }) {
  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFilterChange({
      category: "",
      region: "",
      impact: "",
      dateRange: "all",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.region ||
    filters.impact ||
    (filters.dateRange && filters.dateRange !== "all") ||
    filters.search;

  return (
    <div className={`bg-[#12121A] border border-gray-800 rounded-xl p-3 sm:p-4 transition-all ${collapsed ? 'hidden sm:block' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
        {/* Dropdowns row */}
        <div className="flex gap-2">
          <select
            value={filters.category || ""}
            onChange={(e) => updateFilter("category", e.target.value)}
            className={`flex-1 sm:flex-none bg-[#0A0A0F] rounded-lg px-3 py-2 text-sm outline-none cursor-pointer transition-colors duration-200 ${
              filters.category
                ? "border-2 border-emerald-500 text-emerald-300"
                : "border border-gray-700 text-gray-300"
            }`}
          >
            <option value="">All Categories</option>
            {(categories || []).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.region || ""}
            onChange={(e) => updateFilter("region", e.target.value)}
            className={`flex-1 sm:flex-none bg-[#0A0A0F] rounded-lg px-3 py-2 text-sm outline-none cursor-pointer transition-colors duration-200 ${
              filters.region
                ? "border-2 border-emerald-500 text-emerald-300"
                : "border border-gray-700 text-gray-300"
            }`}
          >
            <option value="">All Regions</option>
            {(regions || []).map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-gray-700 hidden sm:block" />

        {/* Impact + Date row */}
        <div className="flex flex-wrap gap-2 sm:gap-3 sm:items-center">
          <div className="flex items-center gap-1">
            {IMPACT_RANGES.map(({ label, value, range }) => (
              <button
                key={value}
                onClick={() => updateFilter("impact", filters.impact === value ? "" : value)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  filters.impact === value
                    ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500"
                    : "bg-[#0A0A0F] text-gray-400 border border-gray-700 hover:border-gray-500"
                }`}
              >
                {label}
                <span className="text-gray-500 ml-1 hidden sm:inline">{range}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-700 hidden sm:block" />

          <div className="flex items-center gap-1">
            {DATE_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => updateFilter("dateRange", value)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  (filters.dateRange || "all") === value
                    ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500"
                    : "bg-[#0A0A0F] text-gray-400 border border-gray-700 hover:border-gray-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-700 hidden sm:block" />

        {/* Search + Clear */}
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search headlines..."
              className={`w-full bg-[#0A0A0F] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors duration-200 ${
                filters.search
                  ? "border-2 border-emerald-500"
                  : "border border-gray-700 focus:border-gray-500"
              }`}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              &#x1F50D;
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-gray-700 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
