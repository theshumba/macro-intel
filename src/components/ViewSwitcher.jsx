const VIEWS = [
  {
    id: 'globe',
    label: 'Globe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    id: 'list',
    label: 'List',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M12 3v18" strokeLinecap="round" />
        <circle cx="12" cy="6" r="2" fill="currentColor" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="18" r="2" fill="currentColor" />
        <path d="M14 6h5M14 12h5M14 18h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'markets',
    label: 'Markets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-6 4 4 5-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function ViewSwitcher({ view, onViewChange }) {
  return (
    <>
      {/* Desktop: horizontal pill group with sliding indicator */}
      <div className="hidden md:flex rounded-xl border border-gray-700/50 overflow-hidden relative bg-[#0A0A0F] p-1 gap-1">
        <div
          className="absolute top-1 bottom-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 transition-all duration-300 ease-out"
          style={{
            width: `calc(${100 / VIEWS.length}% - 4px)`,
            left: `calc(${(VIEWS.findIndex(v => v.id === view) * 100) / VIEWS.length}% + 2px)`,
          }}
        />
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2 rounded-lg ${
              view === v.id
                ? 'text-emerald-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* Mobile: fixed bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#12121A]/95 backdrop-blur-sm border-t border-gray-800/60 flex items-center justify-around h-14 safe-area-bottom">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 cursor-pointer relative ${
              view === v.id
                ? 'text-emerald-400'
                : 'text-gray-500'
            }`}
          >
            {view === v.id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-emerald-400" />
            )}
            {v.icon}
            <span className="text-[10px] font-medium">{v.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default ViewSwitcher;
