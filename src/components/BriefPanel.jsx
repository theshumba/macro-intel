import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from './Toast';

function SectionBlock({ heading, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left group cursor-pointer"
      >
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6 4l8 6-8 6V4z" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400/80 group-hover:text-amber-400 transition-colors">
          {heading}
        </h3>
      </button>
      {open && (
        <div className="mt-2 pl-5 text-gray-300 text-sm leading-relaxed whitespace-pre-line">
          {children}
        </div>
      )}
    </div>
  );
}

function formatBriefAsText(brief) {
  if (!brief) return '';
  const divider = '\u2014'.repeat(40);
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

function ShareDropdown({ brief }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopy = async () => {
    const text = formatBriefAsText(brief);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    toast('Brief copied to clipboard');
    setOpen(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: brief.title,
          text: brief.executiveSummary,
        });
      } catch {}
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Share brief"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#1A1A24] border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px] z-10">
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Brief
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Share
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function BriefPanel({ brief, onClose }) {
  const panelRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (brief) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [brief, handleKeyDown]);

  useEffect(() => {
    if (brief && panelRef.current) {
      panelRef.current.focus();
    }
  }, [brief]);

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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: slide-out on desktop, full-screen on mobile */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Macro briefing panel"
        className="fixed z-50 outline-none flex flex-col bg-[#0F0F18] inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[480px] md:border-l md:border-white/10 md:shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-white/5">
          {/* Mobile: back arrow */}
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors md:hidden cursor-pointer"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="text-base md:text-lg font-bold text-gray-100 leading-snug">
              {brief.title}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-gray-400 leading-relaxed">
              {brief.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ShareDropdown brief={brief} />
            {/* Desktop: close X */}
            <button
              onClick={onClose}
              className="hidden md:block p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close briefing panel"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
          <SectionBlock heading="Executive Summary">
            {brief.executiveSummary}
          </SectionBlock>

          <SectionBlock heading="What Happened">
            {brief.sections.whatHappened}
          </SectionBlock>

          <SectionBlock heading="Why It Matters">
            {brief.sections.whyItMatters}
          </SectionBlock>

          <SectionBlock heading="Market Implications">
            {brief.sections.marketImplications}
          </SectionBlock>

          <SectionBlock heading="Policy Context" defaultOpen={false}>
            {brief.sections.policyContext}
          </SectionBlock>

          <SectionBlock heading="Structural Outlook (6-18 Months)" defaultOpen={false}>
            {brief.sections.structuralOutlook}
          </SectionBlock>

          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400/80 mb-2">
              What to Watch Next
            </h3>
            <ul className="space-y-2 pl-1">
              {brief.watchNext.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed"
                >
                  <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4 safe-area-bottom">
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>{brief.wordCount.toLocaleString()} words</p>
            <p>Generated {timestamp}</p>
          </div>

          {/* Mobile: bottom close button */}
          <button
            onClick={onClose}
            className="md:hidden px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}

export default BriefPanel;
