// ---------------------------------------------------------------------------
// EventDetailPanel.jsx — Severity-based event detail view
// Replaces BriefPanel with factual, source-driven display.
// ---------------------------------------------------------------------------

import { useEffect } from 'react';
import { SEVERITY } from '../services/eventModel.js';
import { generateSummary } from '../services/summaryEngine.js';

function EventDetailPanel({ event, onClose }) {
  // Close on ESC
  useEffect(() => {
    if (!event) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  if (!event) return null;

  const summary = generateSummary(event);
  const severity = event.severity || SEVERITY.ROUTINE;

  const severityLabel = { 1: 'Routine', 2: 'Material', 3: 'Major' };
  const severityColor = {
    1: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
    2: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    3: 'text-red-400 border-red-500/30 bg-red-500/10',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-backdrop-fade"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full md:w-[560px] bg-[#0A0A0F] border-l border-gray-800/60 z-50 overflow-y-auto animate-panel-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0F]/95 backdrop-blur-md border-b border-gray-800/40 p-4 flex items-start justify-between gap-3 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${severityColor[severity]}`}>
              {severityLabel[severity]}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
              {event.category}
            </span>
            {event.confidence && (
              <span className="text-[10px] text-gray-500 capitalize">{event.confidence}</span>
            )}
            {event.sourceCount > 1 && (
              <span className="text-[10px] text-gray-500">{event.sourceCount} sources</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Headline */}
          <h2 className="text-lg font-bold text-gray-100 leading-tight">
            {event.headline}
          </h2>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {event.primaryCountry && (
              <span className="font-medium">{event.primaryCountry}</span>
            )}
            {event.primaryRegion && (
              <span>{event.primaryRegion}</span>
            )}
            {event.crossRegionFlag && (
              <span className="text-amber-400">Cross-region</span>
            )}
            <span className="tabular-nums">{summary.time}</span>
          </div>

          {/* Executive Summary */}
          <Section title="Summary">
            <p className="text-sm text-gray-300 leading-relaxed">
              {summary.executiveSummary}
            </p>
          </Section>

          {/* What Happened (severity 2+) */}
          {summary.whatHappened && (
            <Section title="What happened">
              <ul className="space-y-1.5">
                {summary.whatHappened.map((point, i) => (
                  <li key={i} className="text-sm text-gray-300 leading-relaxed flex gap-2">
                    <span className="text-emerald-400 mt-0.5 shrink-0">-</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Why This Matters (severity 3 only) */}
          {summary.whyThisMatters && (
            <Section title="Why this matters">
              <p className="text-sm text-gray-300 leading-relaxed">
                {summary.whyThisMatters}
              </p>
            </Section>
          )}

          {/* Linked Context Data (severity 3 only) */}
          {summary.linkedContext?.length > 0 && (
            <Section title="Linked data">
              <div className="space-y-2">
                {summary.linkedContext.map((item, i) => (
                  <div key={i} className="flex items-baseline justify-between text-sm bg-[#12121A] rounded-lg px-3 py-2 border border-gray-800/40">
                    <span className="text-gray-400">{item.indicator_name || item.name}</span>
                    <div className="text-right">
                      <span className="text-gray-200 font-medium">{item.value}</span>
                      <span className="text-gray-500 text-xs ml-2">{item.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Tags */}
          {event.subcategoryTags?.length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {event.subcategoryTags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs border border-gray-700/50">
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Sources */}
          <Section title="Sources">
            <div className="space-y-2">
              {event.sources?.map((source, i) => (
                <div key={i} className="flex items-baseline justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <TierDot tier={source.tier} />
                    <span className="text-gray-300 font-medium truncate">{source.name}</span>
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-xs shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      Source
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Location info */}
          {event.coordinates && (
            <Section title="Location">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Coordinates: {event.coordinates.lat.toFixed(3)}, {event.coordinates.lng.toFixed(3)}</div>
                <div>Confidence: {event.locationConfidence}</div>
                {event.secondaryCountries?.length > 0 && (
                  <div>Also involves: {event.secondaryCountries.join(', ')}</div>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

function TierDot({ tier }) {
  const colors = { 1: 'bg-sky-400', 2: 'bg-gray-300', 3: 'bg-yellow-400', 4: 'bg-purple-400' };
  const labels = { 1: 'Official', 2: 'Reputable', 3: 'Discovery', 4: 'Market' };
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${colors[tier] || colors[2]}`}
      title={`Tier ${tier}: ${labels[tier] || 'Unknown'}`}
    />
  );
}

export default EventDetailPanel;
