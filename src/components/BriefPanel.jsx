import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from './Toast';
import ContentStudio from './ContentStudio';
import { generateContent, generateDataEnrichedContent } from '../services/contentGenerator';
import { fetchContextData, extractDataCitations } from '../services/contextDataService';
import MiniChart from './charts/MiniChart';

// --- Collapsible section block with smooth transition -----------------------

function SectionBlock({ heading, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(defaultOpen ? 'none' : '0px');

  useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
      // After transition, set to none so dynamic content isn't clipped
      const timer = setTimeout(() => setMaxHeight('none'), 300);
      return () => clearTimeout(timer);
    } else {
      // Force a reflow so the transition animates from current height
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
        requestAnimationFrame(() => setMaxHeight('0px'));
      }
    }
  }, [open]);

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left group cursor-pointer"
      >
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6 4l8 6-8 6V4z" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400/80 group-hover:text-amber-400 transition-colors">
          {heading}
        </h3>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight }}
      >
        <div className="mt-2.5 pl-5 text-gray-300 text-sm leading-relaxed whitespace-pre-line">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Format brief as text ---------------------------------------------------

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

// --- Share dropdown ---------------------------------------------------------

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

// --- Quick action buttons ---------------------------------------------------

const QUICK_ACTIONS = [
  {
    key: 'x',
    label: 'X Post',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 01-8.49 8.49L5 18l-3 1 1-3-2.76-6.75a6 6 0 018.49-8.49L20.24 12.24z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v8a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM8 17v4M16 17v4M12 17v4M7 7V4a1 1 0 011-1h8a1 1 0 011 1v3" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'script',
    label: 'Video Script',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'thread',
    label: 'Thread',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

function QuickActions({ item, onContentGenerated }) {
  const handleQuickAction = useCallback(
    async (actionKey) => {
      if (!item) return;

      try {
        const content = generateContent(item);
        if (onContentGenerated) onContentGenerated(content);

        // Extract the relevant text for the action
        let text = '';
        switch (actionKey) {
          case 'x':
            text = content?.socialPosts?.x || '';
            break;
          case 'linkedin':
            text = content?.socialPosts?.linkedin || '';
            break;
          case 'instagram':
            text = content?.socialPosts?.instagram || '';
            break;
          case 'script': {
            const s = content?.videoScripts?.['60s'];
            text = s ? `HOOK:\n${s.hook}\n\nBODY:\n${s.body}\n\nCTA:\n${s.cta}` : '';
            break;
          }
          case 'thread':
            text = content?.thread
              ? content.thread.map((p, i) => `${i + 1}/${content.thread.length} ${p}`).join('\n\n')
              : '';
            break;
          case 'newsletter':
            text = content?.newsletter
              ? `Subject: ${content.newsletter.subject}\n\n${content.newsletter.body}`
              : '';
            break;
        }

        if (text) {
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
          const action = QUICK_ACTIONS.find((a) => a.key === actionKey);
          toast(`${action?.label || 'Content'} copied to clipboard`);
        }
      } catch {
        toast('Failed to generate content');
      }
    },
    [item, onContentGenerated],
  );

  return (
    <div className="flex items-center gap-0.5">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.key}
          onClick={() => handleQuickAction(action.key)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-white/5 transition-colors duration-200 cursor-pointer"
          aria-label={action.label}
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}

// --- Tab bar ----------------------------------------------------------------

function TabBar({ activeTab, onTabChange, dataEnriched = false }) {
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
      <button
        onClick={() => onTabChange('brief')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
          activeTab === 'brief'
            ? 'bg-emerald-500/15 text-emerald-400'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Brief
        {dataEnriched && <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />}
      </button>
      <button
        onClick={() => onTabChange('data')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
          activeTab === 'data'
            ? 'bg-sky-500/15 text-sky-400'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Data
      </button>
      <button
        onClick={() => onTabChange('studio')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
          activeTab === 'studio'
            ? 'bg-emerald-500/15 text-emerald-400'
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Content Studio
      </button>
    </div>
  );
}

// --- Main BriefPanel --------------------------------------------------------

function BriefPanel({ brief, item, onClose }) {
  const panelRef = useRef(null);
  const [activeTab, setActiveTab] = useState('brief');
  const [content, setContent] = useState(null);
  const [studioFullScreen, setStudioFullScreen] = useState(false);
  const [tone, setTone] = useState('analyst');
  const [contextData, setContextData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataCitations, setDataCitations] = useState([]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        if (studioFullScreen) {
          setStudioFullScreen(false);
        } else {
          onClose?.();
        }
      }
    },
    [onClose, studioFullScreen],
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

  // Generate content or fetch data when switching tabs
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      if (tab === 'studio' && !content && item) {
        try {
          const generated = dataCitations.length > 0
            ? generateDataEnrichedContent(item, dataCitations)
            : generateContent(item);
          setContent(generated);
        } catch {
          toast('Failed to generate content');
        }
      }
      if (tab === 'data' && !contextData && !dataLoading && item) {
        setDataLoading(true);
        fetchContextData(item)
          .then((data) => {
            setContextData(data);
            const citations = extractDataCitations(data);
            setDataCitations(citations);
            setDataLoading(false);
            // Re-generate content with data if it was already generated
            if (content && item && citations.length > 0) {
              try {
                setContent(generateDataEnrichedContent(item, citations));
              } catch { /* keep existing content */ }
            }
          })
          .catch(() => {
            setDataLoading(false);
            toast('Failed to fetch contextual data');
          });
      }
    },
    [content, item, contextData, dataLoading],
  );

  // Handle content generated from quick actions
  const handleContentGenerated = useCallback((generated) => {
    setContent(generated);
  }, []);

  // Reset content when item changes
  useEffect(() => {
    setContent(null);
    setContextData(null);
    setDataCitations([]);
    setDataLoading(false);
    setActiveTab('brief');
  }, [item]);

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
        className="fixed z-50 outline-none flex flex-col bg-[#0F0F18]/95 backdrop-blur-xl inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[520px] md:border-l md:border-white/10 md:shadow-2xl"
      >
        {/* Gradient accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 shrink-0" />

        {/* Header */}
        <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 border-b border-white/5">
          <div className="flex items-start justify-between gap-3 mb-3">
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
              <h2 className="text-lg md:text-xl font-bold text-gray-100 leading-snug tracking-tight">
                {brief.title}
              </h2>
              <p className="mt-1.5 text-xs md:text-sm text-gray-400 leading-relaxed">
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

          {/* Quick actions row */}
          <div className="flex items-center justify-between gap-2">
            <QuickActions item={item} onContentGenerated={handleContentGenerated} />
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} dataEnriched={dataCitations.length > 0} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
          {activeTab === 'brief' && (
            <>
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

              {/* Data Insights (shown when data is fetched) */}
              {dataCitations.length > 0 && (
                <SectionBlock heading="Data Insights">
                  <div className="space-y-2">
                    {dataCitations.map((c, i) => (
                      <div key={i} className="flex items-baseline gap-2">
                        <span className="shrink-0 text-sky-400 font-bold text-sm">{c.value}</span>
                        <span className="text-gray-400 text-sm">{c.name}</span>
                        <span className="text-[9px] text-gray-600 ml-auto shrink-0">{c.source}, {c.date}</span>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400/80 mb-2.5">
                  What to Watch Next
                </h3>
                <ul className="space-y-2.5 pl-1">
                  {brief.watchNext.map((watchItem, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed"
                    >
                      <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                      <span>{watchItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Data citations summary */}
              {dataCitations.length > 0 && (
                <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-3">Key Data Points</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {dataCitations.map((c, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 truncate">{c.name}</p>
                        <p className="text-sm font-bold text-gray-100">{c.value}</p>
                        <p className="text-[9px] text-gray-600">{c.source} &middot; {c.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {dataLoading && (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <div className="skeleton h-3 w-32" />
                        <div className="skeleton h-3 w-16" />
                      </div>
                      <div className="skeleton h-6 w-20" />
                      <div className="skeleton h-[140px] w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              )}

              {/* Charts grid */}
              {!dataLoading && contextData?.indicators?.length > 0 && (
                <div className="space-y-4">
                  {contextData.indicators.map((indicator, i) => (
                    <MiniChart
                      key={indicator.id}
                      title={indicator.name}
                      data={indicator.data}
                      unit={indicator.unit}
                      chartType={indicator.chartType}
                      source={indicator.source}
                      latestValue={indicator.latestValue}
                      latestDate={indicator.latestDate}
                      country={indicator.country}
                      color={i % 4 === 0 ? 'emerald' : i % 4 === 1 ? 'sky' : i % 4 === 2 ? 'amber' : 'red'}
                      height={140}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!dataLoading && contextData && contextData.indicators.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="h-10 w-10 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <p className="text-sm font-medium">No contextual data found</p>
                  <p className="text-xs mt-1 text-gray-600">No matching indicators for this event</p>
                </div>
              )}

              {/* Matched count footer */}
              {contextData && contextData.indicators.length > 0 && (
                <p className="text-[10px] text-gray-600 text-center">
                  Showing {contextData.indicators.length} of {contextData.matchedCount} matched indicators &middot; Country: {contextData.countryCode}
                </p>
              )}
            </div>
          )}

          {activeTab === 'studio' && (
            <ContentStudio
              item={item}
              content={content}
              tone={tone}
              onToneChange={setTone}
              isFullScreen={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4 safe-area-bottom">
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>{brief.wordCount.toLocaleString()} words</p>
            <p>Generated {timestamp}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Studio full-screen button */}
            <button
              onClick={() => {
                if (!content && item) {
                  try {
                    const generated = generateContent(item);
                    setContent(generated);
                  } catch {
                    toast('Failed to generate content');
                  }
                }
                setStudioFullScreen(true);
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Open Studio
            </button>

            {/* Mobile: bottom close button */}
            <button
              onClick={onClose}
              className="md:hidden px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </aside>

      {/* Full-screen Content Studio overlay */}
      {studioFullScreen && (
        <ContentStudio
          item={item}
          content={content}
          onClose={() => setStudioFullScreen(false)}
          isFullScreen={true}
          tone={tone}
          onToneChange={setTone}
        />
      )}
    </>
  );
}

export default BriefPanel;
