function Header({ lastUpdated, itemCount, onRefresh, filtersOpen, onToggleFilters }) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <header className="border-b border-gray-800 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold tracking-widest text-gray-100">
            MACRO INTEL
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">
            Global Economics & Geopolitical Intelligence
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex flex-col items-end text-sm">
            <span className="text-gray-500">Last updated</span>
            <span className="text-gray-300 tabular-nums">{formattedTime}</span>
          </div>

          {typeof itemCount === "number" && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              {itemCount} items
            </span>
          )}

          {/* Mobile: filter toggle */}
          <button
            onClick={onToggleFilters}
            className="sm:hidden p-2 rounded-lg bg-[#12121A] border border-gray-800 text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
            aria-label="Toggle filters"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={filtersOpen ? "M6 18L18 6M6 6l12 12" : "M3 4h18M3 12h18M3 20h18"} />
            </svg>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-[#12121A] border border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer"
            title="Refresh data"
          >
            <span className="text-lg leading-none">&#8635;</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
