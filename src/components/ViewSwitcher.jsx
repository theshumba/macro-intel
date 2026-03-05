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
];

function ViewSwitcher({ view, onViewChange }) {
  return (
    <>
      {/* Desktop: horizontal pill group */}
      <div className="hidden md:flex rounded-lg border border-gray-700 overflow-hidden">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              view === v.id
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-[#12121A] text-gray-400 hover:text-gray-200'
            } ${v.id !== 'timeline' ? 'border-r border-gray-700' : ''}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Mobile: fixed bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#12121A] border-t border-gray-800 flex items-center justify-around h-14 safe-area-bottom">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors cursor-pointer ${
              view === v.id
                ? 'text-emerald-400'
                : 'text-gray-500'
            }`}
          >
            {v.icon}
            <span className="text-[10px] font-medium">{v.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default ViewSwitcher;
