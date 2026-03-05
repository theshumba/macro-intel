# Macro Intel v3: Content Engine + UI Polish

## Overview

Add a full content engine for generating publishable content from events, and polish all UI/UX to feel smooth and institutional-grade.

## Content Engine

### Content Generator Service (`src/services/contentGenerator.js`)

Takes an event item + brief and generates content in all formats across 3 tones.

**Formats:**
- Social posts: X (280 chars), LinkedIn (3000 chars), Instagram (2200 chars) with hashtags
- Video scripts: 30s (~75 words), 60s (~150 words), 90s (~225 words) with hook/body/CTA
- Threads: 5-7 posts, each under 280 chars, numbered
- Newsletter: email-ready formatted paragraph

**Tones:**
- Analyst: formal, institutional language
- Casual: conversational, accessible
- Hot-Take: punchy, provocative, opinion-forward

### UI Integration (3 connected modes)

**Mode 1 - Quick Actions:** Row of platform icon buttons in BriefPanel header. Click = generate + copy + toast.

**Mode 2 - Content Studio Tab:** BriefPanel gets tabs (Brief | Content Studio). Studio shows all formats as cards with copy buttons. Tone selector at top.

**Mode 3 - Full Studio:** "Expand" button opens full-screen overlay. Event brief on left, content grid on right. Tone selector, copy-all, platform previews.

## UI Polish

**Animations:** View fade transitions, card stagger on load, BriefPanel spring slide-in, FilterBar animated collapse, skeleton loading.

**Components:** ViewSwitcher sliding indicator, Dashboard gradient bars with animated counters, NewsCard hover lift + glow, consistent shadows/borders, error retry button.

**Visual Cohesion:** Emerald primary, amber accent. Consistent border-radius, shadow palette, hover/active/focus states. Frosted glass on panels.

## Architecture

New files:
- `src/services/contentGenerator.js`
- `src/components/ContentStudio.jsx`

Modified files:
- `src/components/BriefPanel.jsx` (tabs + quick actions + studio integration)
- `src/components/ViewSwitcher.jsx` (sliding indicator)
- `src/components/NewsCard.jsx` (hover effects)
- `src/components/DashboardView.jsx` (styled charts, animated counters)
- `src/components/TimelineView.jsx` (polish)
- `src/components/FilterBar.jsx` (animated collapse)
- `src/components/Header.jsx` (polish)
- `src/components/NewsList.jsx` (skeleton + stagger)
- `src/components/GlobeView.jsx` (minor polish)
- `src/index.css` (animations, transitions, color tokens)
- `src/App.jsx` (view transitions, pass item to BriefPanel)
