import { useState, useCallback, useMemo } from 'react';
import { toast } from './Toast';

// --- Tone selector pills ---------------------------------------------------

const TONES = ['Analyst', 'Casual', 'Hot-Take'];

function ToneSelector({ tone, onToneChange }) {
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
      {TONES.map((t) => (
        <button
          key={t}
          onClick={() => onToneChange(t.toLowerCase())}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
            tone === t.toLowerCase()
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// --- Clipboard helper -------------------------------------------------------

async function copyToClipboard(text) {
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
  toast('Copied to clipboard');
}

// --- Copy button ------------------------------------------------------------

function CopyButton({ text, label = 'Copy', className = '' }) {
  return (
    <button
      onClick={() => copyToClipboard(text)}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-emerald-400 hover:bg-white/5 transition-colors duration-200 cursor-pointer ${className}`}
      aria-label={label}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      {label}
    </button>
  );
}

// --- Character count bar ----------------------------------------------------

function CharCountBar({ count, limit }) {
  const pct = Math.min((count / limit) * 100, 100);
  const over = count > limit;

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-red-500' : 'bg-emerald-500/60'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono ${over ? 'text-red-400' : 'text-gray-500'}`}>
        {count}/{limit}
      </span>
    </div>
  );
}

// --- Tabbed inner component -------------------------------------------------

function TabbedCard({ title, icon, tabs, renderTab }) {
  const [active, setActive] = useState(tabs[0]?.key || '');
  const activeTab = tabs.find((t) => t.key === active) || tabs[0];

  return (
    <div className="bg-[#12121A] border border-gray-800 rounded-xl hover:border-gray-600 transition-colors duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200 cursor-pointer ${
              active === tab.key
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {renderTab(activeTab)}
      </div>
    </div>
  );
}

// --- Simple card wrapper ----------------------------------------------------

function SimpleCard({ title, icon, children }) {
  return (
    <div className="bg-[#12121A] border border-gray-800 rounded-xl hover:border-gray-600 transition-colors duration-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
        </div>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

// --- Social Posts card ------------------------------------------------------

const SOCIAL_LIMITS = { x: 280, linkedin: 3000, instagram: 2200 };

function SocialPostsCard({ content }) {
  const socialPosts = content?.socialPosts;
  if (!socialPosts) return null;

  const tabs = [
    { key: 'x', label: 'X' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'instagram', label: 'Instagram' },
  ].filter((t) => socialPosts[t.key]);

  return (
    <TabbedCard
      title="Social Posts"
      icon={
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      }
      tabs={tabs}
      renderTab={(tab) => {
        const text = socialPosts[tab.key] || '';
        const limit = SOCIAL_LIMITS[tab.key] || 280;
        return (
          <div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{text}</p>
            <CharCountBar count={text.length} limit={limit} />
            <div className="mt-2 flex justify-end">
              <CopyButton text={text} label="Copy" />
            </div>
          </div>
        );
      }}
    />
  );
}

// --- Video Scripts card -----------------------------------------------------

function VideoScriptsCard({ content }) {
  const scripts = content?.videoScripts;
  if (!scripts) return null;

  const tabs = [
    { key: '30s', label: '30s' },
    { key: '60s', label: '60s' },
    { key: '90s', label: '90s' },
  ].filter((t) => scripts[t.key]);

  return (
    <TabbedCard
      title="Video Scripts"
      icon={
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      }
      tabs={tabs}
      renderTab={(tab) => {
        const script = scripts[tab.key];
        if (!script) return null;
        const fullText = `HOOK:\n${script.hook}\n\nBODY:\n${script.body}\n\nCTA:\n${script.cta}`;
        const wordCount = fullText.split(/\s+/).filter(Boolean).length;

        return (
          <div className="space-y-3">
            {[
              { label: 'Hook', text: script.hook, color: 'text-emerald-400' },
              { label: 'Body', text: script.body, color: 'text-amber-400' },
              { label: 'CTA', text: script.cta, color: 'text-sky-400' },
            ].map((section) => (
              <div key={section.label}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${section.color}`}>
                  {section.label}
                </span>
                <p className="mt-1 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {section.text}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] text-gray-500 font-mono">{wordCount} words</span>
              <CopyButton text={fullText} label="Copy Script" />
            </div>
          </div>
        );
      }}
    />
  );
}

// --- Thread card ------------------------------------------------------------

function ThreadCard({ content }) {
  const thread = content?.thread;
  if (!thread || !thread.length) return null;

  const fullText = thread.map((post, i) => `${i + 1}/${thread.length} ${post}`).join('\n\n');

  return (
    <SimpleCard
      title="Thread"
      icon={
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      }
    >
      <div className="relative pl-4">
        {/* Connecting line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/60 via-emerald-500/30 to-transparent" />

        <div className="space-y-3">
          {thread.map((post, i) => (
            <div key={i} className="relative flex items-start gap-3">
              {/* Dot on the line */}
              <div className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-[#12121A] z-10" />
              <div className="flex-1">
                <span className="text-[10px] font-mono text-emerald-500/70 mr-1.5">
                  {i + 1}/{thread.length}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">{post}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <CopyButton text={fullText} label="Copy All" />
      </div>
    </SimpleCard>
  );
}

// --- Newsletter card --------------------------------------------------------

function NewsletterCard({ content }) {
  const newsletter = content?.newsletter;
  if (!newsletter) return null;

  const fullText = `Subject: ${newsletter.subject}\n\n${newsletter.body}`;

  return (
    <SimpleCard
      title="Newsletter"
      icon={
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      }
    >
      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Subject</span>
          <p className="mt-1 text-sm font-medium text-gray-100">{newsletter.subject}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Body</span>
          <p className="mt-1 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{newsletter.body}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <CopyButton text={fullText} label="Copy" />
      </div>
    </SimpleCard>
  );
}

// --- Event brief summary (full-screen left sidebar) -------------------------

function EventBrief({ item }) {
  if (!item) return null;

  return (
    <div className="space-y-4">
      <div>
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 mb-2">
          {item.category || 'General'}
        </span>
        <h2 className="text-lg font-bold text-gray-100 leading-snug">{item.headline}</h2>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{item.source}</span>
        <span className="h-1 w-1 rounded-full bg-gray-600" />
        <span>{item.region}</span>
        {item.impactScore && (
          <>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span className={`font-medium ${item.impactScore >= 7 ? 'text-red-400' : item.impactScore >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
              Impact {item.impactScore}/10
            </span>
          </>
        )}
      </div>

      {item.summary && (
        <p className="text-sm text-gray-400 leading-relaxed">{item.summary}</p>
      )}
    </div>
  );
}

// --- Main ContentStudio component -------------------------------------------

function ContentStudio({ item, content, onClose, isFullScreen = false, tone = 'analyst', onToneChange }) {
  const [localTone, setLocalTone] = useState(tone);
  const activeTone = onToneChange ? tone : localTone;
  const handleToneChange = onToneChange || setLocalTone;

  // Pick the content for the active tone (if tone-keyed) or use as-is
  const toneContent = useMemo(() => {
    if (!content) return null;
    // If content is keyed by tone, pick the right one
    if (content[activeTone]) return content[activeTone];
    return content;
  }, [content, activeTone]);

  const handleCopyAll = useCallback(() => {
    if (!toneContent) return;
    const parts = [];

    if (toneContent.socialPosts) {
      parts.push('=== SOCIAL POSTS ===');
      if (toneContent.socialPosts.x) parts.push(`X:\n${toneContent.socialPosts.x}`);
      if (toneContent.socialPosts.linkedin) parts.push(`LinkedIn:\n${toneContent.socialPosts.linkedin}`);
      if (toneContent.socialPosts.instagram) parts.push(`Instagram:\n${toneContent.socialPosts.instagram}`);
    }

    if (toneContent.videoScripts) {
      parts.push('\n=== VIDEO SCRIPTS ===');
      for (const [dur, script] of Object.entries(toneContent.videoScripts)) {
        parts.push(`${dur}:\nHook: ${script.hook}\nBody: ${script.body}\nCTA: ${script.cta}`);
      }
    }

    if (toneContent.thread) {
      parts.push('\n=== THREAD ===');
      toneContent.thread.forEach((post, i) => {
        parts.push(`${i + 1}. ${post}`);
      });
    }

    if (toneContent.newsletter) {
      parts.push('\n=== NEWSLETTER ===');
      parts.push(`Subject: ${toneContent.newsletter.subject}\n${toneContent.newsletter.body}`);
    }

    copyToClipboard(parts.join('\n\n'));
  }, [toneContent]);

  // No content state
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg className="h-10 w-10 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm font-medium">Generating content...</p>
        <p className="text-xs mt-1 text-gray-600">Click the Content Studio tab to generate</p>
      </div>
    );
  }

  // Full-screen overlay
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#0A0A0F]/95 backdrop-blur-xl flex flex-col">
        {/* Full-screen top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-100 uppercase tracking-wider">Content Studio</h2>
            <ToneSelector tone={activeTone} onToneChange={handleToneChange} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors duration-200 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy All
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors duration-200 cursor-pointer"
              aria-label="Close full-screen studio"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Full-screen body: event brief on left, content grid on right */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Event Brief (30%) */}
          <div className="hidden md:flex w-[30%] border-r border-white/5 p-6 overflow-y-auto flex-col">
            <EventBrief item={item} />
          </div>

          {/* Right: Content Grid (70%) */}
          <div className="flex-1 md:w-[70%] overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl">
              <SocialPostsCard content={toneContent} />
              <VideoScriptsCard content={toneContent} />
              <ThreadCard content={toneContent} />
              <NewsletterCard content={toneContent} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline (embedded in BriefPanel)
  return (
    <div className="space-y-4">
      {/* Tone selector */}
      <div className="flex items-center justify-between">
        <ToneSelector tone={activeTone} onToneChange={handleToneChange} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4">
        <SocialPostsCard content={toneContent} />
        <VideoScriptsCard content={toneContent} />
        <ThreadCard content={toneContent} />
        <NewsletterCard content={toneContent} />
      </div>
    </div>
  );
}

export default ContentStudio;
