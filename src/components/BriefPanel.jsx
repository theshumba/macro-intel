import { useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// BriefPanel — Slide-out panel that displays a generated macro brief.
// Renders on the right side of the viewport with a backdrop overlay.
// Tailwind-only styling. No external UI libraries.
// ---------------------------------------------------------------------------

function SectionBlock({ heading, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400/80 mb-2">
        {heading}
      </h3>
      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </div>
  );
}

function formatBriefAsText(brief) {
  if (!brief) return '';

  const divider = '—'.repeat(40);
  const lines = [
    brief.title,
    brief.subtitle,
    '',
    divider,
    'EXECUTIVE SUMMARY',
    divider,
    brief.executiveSummary,
    '',
    divider,
    'WHAT HAPPENED',
    divider,
    brief.sections.whatHappened,
    '',
    divider,
    'WHY IT MATTERS',
    divider,
    brief.sections.whyItMatters,
    '',
    divider,
    'MARKET IMPLICATIONS',
    divider,
    brief.sections.marketImplications,
    '',
    divider,
    'POLICY CONTEXT',
    divider,
    brief.sections.policyContext,
    '',
    divider,
    'STRUCTURAL OUTLOOK (6-18 MONTHS)',
    divider,
    brief.sections.structuralOutlook,
    '',
    divider,
    'WHAT TO WATCH NEXT',
    divider,
    ...brief.watchNext.map((item, i) => `${i + 1}. ${item}`),
    '',
    divider,
    `Generated: ${new Date(brief.generatedAt).toLocaleString()}`,
    `Word count: ${brief.wordCount}`,
  ];

  return lines.join('\n');
}

function BriefPanel({ brief, onClose }) {
  const panelRef = useRef(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (brief) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [brief, handleKeyDown]);

  // Focus trap: focus the panel when it opens
  useEffect(() => {
    if (brief && panelRef.current) {
      panelRef.current.focus();
    }
  }, [brief]);

  const handleCopy = async () => {
    const text = formatBriefAsText(brief);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  if (!brief) return null;

  const timestamp = brief.generatedAt
    ? new Date(brief.generatedAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Macro briefing panel"
        className={
          'fixed top-0 right-0 z-50 h-full w-full md:w-[600px] ' +
          'bg-[#0F0F18] border-l border-white/10 shadow-2xl ' +
          'transform transition-transform duration-300 ease-out ' +
          'translate-x-0 ' +
          'flex flex-col outline-none'
        }
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-white/5">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-100 leading-snug">
              {brief.title}
            </h2>
            <p className="mt-1 text-sm text-gray-400 leading-relaxed">
              {brief.subtitle}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
            aria-label="Close briefing panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Scrollable content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-0 scrollbar-thin">
          {/* Executive Summary */}
          <SectionBlock heading="Executive Summary">
            {brief.executiveSummary}
          </SectionBlock>

          {/* What Happened */}
          <SectionBlock heading="What Happened">
            {brief.sections.whatHappened}
          </SectionBlock>

          {/* Why It Matters */}
          <SectionBlock heading="Why It Matters">
            {brief.sections.whyItMatters}
          </SectionBlock>

          {/* Market Implications */}
          <SectionBlock heading="Market Implications">
            {brief.sections.marketImplications}
          </SectionBlock>

          {/* Policy Context */}
          <SectionBlock heading="Policy Context">
            {brief.sections.policyContext}
          </SectionBlock>

          {/* Structural Outlook */}
          <SectionBlock heading="Structural Outlook (6-18 Months)">
            {brief.sections.structuralOutlook}
          </SectionBlock>

          {/* What to Watch Next */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400/80 mb-2">
              What to Watch Next
            </h3>
            <ul className="space-y-2">
              {brief.watchNext.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed"
                >
                  <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          {/* Meta info */}
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>{brief.wordCount.toLocaleString()} words</p>
            <p>Generated {timestamp}</p>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ' +
              'bg-white/5 text-gray-300 border border-white/10 ' +
              'hover:bg-white/10 hover:text-gray-100 ' +
              'active:scale-[0.97] transition-all duration-150'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy to Clipboard
          </button>
        </div>
      </aside>
    </>
  );
}

export default BriefPanel;
