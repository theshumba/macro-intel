// ---------------------------------------------------------------------------
// Navigation.jsx — Main navigation for multi-page intelligence platform
// Desktop: horizontal nav bar. Mobile: bottom tab bar.
// ---------------------------------------------------------------------------

import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/',
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
    to: '/events',
    label: 'Events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/map',
    label: 'Map',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/markets',
    label: 'Markets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-6 4 4 5-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/monitor',
    label: 'Monitor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <path d="M12 12l4-4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/data',
    label: 'Data',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 7c0 2.21-3.582 4-8 4S4 9.21 4 7s3.582-4 8-4 8 1.79 8 4z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/archive',
    label: 'Archive',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function Navigation() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-emerald-400 bg-emerald-500/10'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 relative ${
      isActive ? 'text-emerald-400' : 'text-gray-500'
    }`;

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1 rounded-xl border border-gray-700/50 bg-[#0A0A0F] p-1">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#12121A]/95 backdrop-blur-sm border-t border-gray-800/60 flex items-center justify-around h-14 safe-area-bottom">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={mobileLinkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-emerald-400" />
                )}
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default Navigation;
