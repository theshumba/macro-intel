// ---------------------------------------------------------------------------
// EventCard.jsx — Severity-based event card
// Routine: headline + summary + sources
// Material: + what happened
// Major: + why this matters
// ---------------------------------------------------------------------------

import { SEVERITY } from '../services/eventModel.js';

function timeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SeverityBadge({ severity }) {
  const config = {
    [SEVERITY.ROUTINE]: { label: 'Routine', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    [SEVERITY.MATERIAL]: { label: 'Material', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    [SEVERITY.MAJOR]: { label: 'Major', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const c = config[severity] || config[SEVERITY.ROUTINE];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${c.color}`}>
      {c.label}
    </span>
  );
}

function CategoryTag({ category }) {
  return (
    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
      {category}
    </span>
  );
}

function SourcePill({ source }) {
  const tierColors = {
    1: 'text-sky-400',
    2: 'text-gray-300',
    3: 'text-yellow-400',
    4: 'text-purple-400',
  };
  return (
    <span className={`text-xs ${tierColors[source.tier] || 'text-gray-400'}`}>
      {source.name}
    </span>
  );
}

function ConfidenceDot({ confidence }) {
  const colors = {
    confirmed: 'bg-emerald-400',
    reported: 'bg-amber-400',
    unconfirmed: 'bg-gray-400',
    conflicting: 'bg-red-400',
  };
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[confidence] || colors.reported}`}
      title={confidence} />
  );
}

function EventCard({ event, onSelect, isSelected, index }) {
  const severity = event.severity || SEVERITY.ROUTINE;
  const barColor = severity >= SEVERITY.MAJOR ? 'bg-red-500'
    : severity >= SEVERITY.MATERIAL ? 'bg-amber-500'
    : 'bg-gray-600';

  const sourceNames = event.sources?.map(s => s.name) || [];
  const uniqueSources = [...new Set(sourceNames)];

  return (
    <article
      onClick={() => onSelect?.(event)}
      style={index !== undefined ? { animationDelay: `${Math.min(index * 0.05, 0.5)}s` } : undefined}
      className={`animate-card-enter bg-[#12121A] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group relative ${
        isSelected
          ? 'border border-emerald-500/50 animate-pulse-glow'
          : 'border border-gray-800/60 hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
      }`}
    >
      {/* Severity color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`} />

      <div className="p-4 pl-5">
        {/* Header: severity + category + confidence + region */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <SeverityBadge severity={severity} />
          <CategoryTag category={event.category} />
          <ConfidenceDot confidence={event.confidence} />
          {event.sourceCount > 1 && (
            <span className="text-[10px] text-gray-500 font-medium">
              {event.sourceCount} sources
            </span>
          )}
          <span className="ml-auto text-xs text-gray-500">
            {event.primaryRegion || ''}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-snug mb-1.5 group-hover:text-white transition-colors">
          {event.headline}
        </h3>

        {/* Executive Summary */}
        {event.executiveSummary && (
          <p className="text-sm text-gray-400 leading-relaxed mb-2 line-clamp-2">
            {event.executiveSummary}
          </p>
        )}

        {/* Tags */}
        {event.subcategoryTags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {event.subcategoryTags.slice(0, 4).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 text-[10px]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: sources + country + time */}
        <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            {uniqueSources.slice(0, 2).map(name => (
              <span key={name} className="font-medium truncate">{name}</span>
            ))}
            {uniqueSources.length > 2 && (
              <span>+{uniqueSources.length - 2}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {event.primaryCountry && (
              <span className="font-medium">{event.primaryCountry}</span>
            )}
            <span className="tabular-nums">{timeAgo(event.publishedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
