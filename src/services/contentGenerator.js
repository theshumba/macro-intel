// ---------------------------------------------------------------------------
// contentGenerator.js
// Template-based multi-format content generator for macro intelligence events.
// Produces social posts, video scripts, threads, and newsletter snippets in
// three tones (analyst, casual, hot-take). No external API required.
// ---------------------------------------------------------------------------

// ── Category-specific hooks and language ─────────────────────────────────────

const CATEGORY_HOOKS = {
  'Monetary Policy': {
    analyst: [
      'The rate cycle just shifted.',
      'Central bank signalling has repriced.',
      'The forward guidance recalibration begins.',
      'Monetary policy divergence is widening.',
    ],
    casual: [
      'Interest rates just changed the game.',
      'The central bank made its move.',
      'Your mortgage rate might be about to shift.',
      'The money printers have a new playbook.',
    ],
    hotTake: [
      'The rate decision everyone saw coming just changed everything.',
      'Central bankers are playing chicken with the economy.',
      'This rate move will age very badly.',
      'The policy mistake is now priced in.',
    ],
  },
  'Trade & Tariffs': {
    analyst: [
      'Global supply chains face reconfiguration.',
      'Trade architecture is being rewritten.',
      'Tariff escalation enters a new phase.',
      'Bilateral trade dynamics are shifting.',
    ],
    casual: [
      'A trade war just escalated.',
      'The price of everything you buy might change.',
      'Supply chains are being rerouted right now.',
      'Two economies just drew a line in the sand.',
    ],
    hotTake: [
      'This tariff will backfire spectacularly.',
      'Nobody is pricing in the second-order effects of this.',
      'The trade war just went from rhetoric to reality.',
      'Consumers will pay for this — literally.',
    ],
  },
  Sanctions: {
    analyst: [
      'Economic coercion instruments have been deployed.',
      'Sanctions architecture is expanding.',
      'Compliance requirements are intensifying.',
      'The geopolitical pressure campaign escalates.',
    ],
    casual: [
      'A major economy just got cut off.',
      'The financial weapon just got used again.',
      'Sanctions are squeezing harder now.',
      'Money flows are being forcibly rerouted.',
    ],
    hotTake: [
      'These sanctions will accelerate de-dollarization faster than anyone expects.',
      "Sanctions only work until they don't.",
      'This is economic warfare with a polite name.',
      'The unintended consequences here will be massive.',
    ],
  },
  'Energy Markets': {
    analyst: [
      'Energy supply dynamics are being recalibrated.',
      'The energy security calculus has shifted.',
      'Crude benchmarks face repricing.',
      'Energy transition timelines are under pressure.',
    ],
    casual: [
      'Oil prices are about to move.',
      'Energy markets just got a wake-up call.',
      'Your energy bill is connected to this.',
      'The fuel that powers everything just got disrupted.',
    ],
    hotTake: [
      "Energy independence was always a myth — this proves it.",
      "Ignore this at your portfolio's peril.",
      "The energy crisis everyone forgot about isn't over.",
      'This changes the math on every energy investment.',
    ],
  },
  Commodities: {
    analyst: [
      'Commodity supply-demand fundamentals are shifting.',
      'Raw material pricing reflects new realities.',
      'Inventory dynamics signal a structural change.',
      'Commodity markets are repricing risk.',
    ],
    casual: [
      'The raw materials that build everything just moved.',
      'Commodity prices are telling us something big.',
      'From mines to markets, things are shifting.',
      'The stuff your stuff is made from just got more expensive.',
    ],
    hotTake: [
      "The commodity supercycle isn't a theory anymore.",
      'Everyone is looking at equities — the real story is in commodities.',
      'This commodity move will ripple for years.',
      'The physical world just reminded financial markets it exists.',
    ],
  },
  FX: {
    analyst: [
      'Currency markets are repricing rate differentials.',
      'FX volatility signals a regime shift.',
      'Exchange rate dynamics reflect capital flow rotation.',
      'The carry trade calculus has changed.',
    ],
    casual: [
      'Your currency just lost (or gained) purchasing power.',
      'Money is moving across borders fast right now.',
      'Exchange rates are telling a bigger story.',
      'The currency market just made a statement.',
    ],
    hotTake: [
      'This FX move is the canary in the coal mine.',
      'Currency wars are back and nobody is ready.',
      "The dollar's role is being questioned in real-time.",
      'This is what capital flight looks like in slow motion.',
    ],
  },
  Equities: {
    analyst: [
      'Risk appetite is being recalibrated across equity markets.',
      'Earnings expectations face revision.',
      'Equity valuations reflect updated macro assumptions.',
      'Market repricing signals shifting growth consensus.',
    ],
    casual: [
      "The stock market just reacted — here's why it matters.",
      'Investor sentiment just shifted.',
      'Stocks are telling us something about the economy.',
      "Markets moved — and it's not just noise.",
    ],
    hotTake: [
      'This rally (or sell-off) is built on sand.',
      'The smart money already repositioned before this headline.',
      'Equity markets are pricing in a fantasy.',
      'The next correction starts with exactly this kind of news.',
    ],
  },
  'Sovereign Risk': {
    analyst: [
      'Sovereign creditworthiness is under reassessment.',
      'Fiscal sustainability concerns are intensifying.',
      'Sovereign spreads reflect updated risk premia.',
      'Debt dynamics are entering a critical phase.',
    ],
    casual: [
      "A country's ability to pay its debts is in question.",
      'Government finances just hit a rough patch.',
      'When nations struggle with debt, everyone feels it.',
      'Sovereign risk sounds abstract until it hits your investments.',
    ],
    hotTake: [
      'This is how sovereign defaults start — slowly, then all at once.',
      'The debt spiral that everyone ignored is now undeniable.',
      "Fiscal math doesn't care about politics.",
      'Rating agencies are going to be 6 months late on this — as usual.',
    ],
  },
  'Emerging Markets': {
    analyst: [
      'EM differentiation is the defining theme.',
      'Capital flow dynamics across emerging markets are shifting.',
      'Emerging market resilience is being tested.',
      'The EM risk premium is being repriced.',
    ],
    casual: [
      'Emerging markets are at a crossroads.',
      'The developing world just sent a signal to investors.',
      'Growth economies are feeling the pressure.',
      'What happens in emerging markets affects everyone.',
    ],
    hotTake: [
      'EM is either the biggest opportunity or the biggest trap right now.',
      'The West is ignoring this EM story — big mistake.',
      "Emerging market contagion doesn't care about your diversification.",
      'This EM move will be studied in textbooks.',
    ],
  },
};

// ── Hashtag generation maps ──────────────────────────────────────────────────

const CATEGORY_HASHTAGS = {
  'Monetary Policy': ['MonetaryPolicy', 'InterestRates', 'CentralBank', 'FedWatch', 'RateDecision'],
  'Trade & Tariffs': ['TradeWar', 'Tariffs', 'GlobalTrade', 'SupplyChain', 'TradePolicy'],
  Sanctions: ['Sanctions', 'Geopolitics', 'EconomicWarfare', 'Compliance', 'ForeignPolicy'],
  'Energy Markets': ['Energy', 'OilPrices', 'Crude', 'EnergyMarkets', 'OPEC'],
  Commodities: ['Commodities', 'RawMaterials', 'Mining', 'Agriculture', 'SupplyDemand'],
  FX: ['Forex', 'CurrencyMarkets', 'FX', 'DollarIndex', 'ExchangeRates'],
  Equities: ['Stocks', 'Equities', 'Markets', 'WallStreet', 'Investing'],
  'Sovereign Risk': ['SovereignDebt', 'FiscalPolicy', 'CreditRisk', 'Bonds', 'GovernmentDebt'],
  'Emerging Markets': ['EmergingMarkets', 'EM', 'FrontierMarkets', 'GlobalGrowth', 'Investing'],
};

const REGION_HASHTAGS = {
  'North America': ['US', 'NorthAmerica', 'FederalReserve'],
  Europe: ['Europe', 'EU', 'ECB', 'Eurozone'],
  Asia: ['Asia', 'AsiaPacific', 'China', 'Japan'],
  'Asia-Pacific': ['Asia', 'AsiaPacific', 'APAC'],
  'Middle East': ['MiddleEast', 'GCC', 'MENA'],
  'Middle East & Africa': ['MENA', 'MiddleEast', 'Africa'],
  'Latin America': ['LatAm', 'LatinAmerica', 'EmergingMarkets'],
  Africa: ['Africa', 'FrontierMarkets', 'AfricanEconomy'],
  Global: ['GlobalEconomy', 'Macro', 'WorldEconomy'],
};

const UNIVERSAL_HASHTAGS = ['MacroIntel', 'Geopolitics', 'GlobalMarkets', 'Economics'];

// ── Impact-aware urgency language ────────────────────────────────────────────

const URGENCY = {
  critical: {
    analyst: ['Market-moving development.', 'Critical inflection point.', 'Systemic implications emerging.'],
    casual: ['This is big.', 'Pay attention to this one.', 'This changes things.'],
    hotTake: ['This is the story of the week.', 'Drop everything and read this.', 'The alarm bells are ringing.'],
  },
  high: {
    analyst: ['Significant macro signal.', 'Material repricing catalyst.', 'Notable policy shift.'],
    casual: ['This matters more than people think.', 'Keep an eye on this.', "Here's what you need to know."],
    hotTake: ['Most people will miss this.', 'The implications here are massive.', 'This is being underplayed.'],
  },
  moderate: {
    analyst: ['A developing situation worth monitoring.', 'Incremental but directionally important.', 'Adding to the macro mosaic.'],
    casual: ['Something to keep on your radar.', 'Not a crisis, but not nothing either.', 'Context matters here.'],
    hotTake: ["The signal is in what they're NOT saying.", "This looks small — it isn't.", 'Connect the dots on this one.'],
  },
  low: {
    analyst: ['Background noise with potential.', 'A data point for the mosaic.', 'Worth noting for portfolio context.'],
    casual: ['Quick update you should know about.', 'Not headline news, but still relevant.', 'A small move with bigger implications.'],
    hotTake: ["Everyone will ignore this — and they'll regret it.", 'The seeds of the next big story.', 'File this under "told you so" for later.'],
  },
};

// ── CTA templates ────────────────────────────────────────────────────────────

const CTAS = {
  analyst: [
    'Follow for institutional-grade macro intelligence.',
    'Subscribe for daily macro analysis.',
    'More analysis on our macro intelligence feed.',
    'Stay positioned — follow for real-time macro signals.',
  ],
  casual: [
    'Follow for more macro breakdowns.',
    'Like this? Follow for daily econ updates.',
    'Share this if it helped you understand what\'s happening.',
    'Follow for the economics that actually affects your life.',
  ],
  hotTake: [
    'Follow if you want the takes nobody else is giving you.',
    'Agree? Disagree? Drop your take below.',
    'Follow for the macro hot takes your timeline needs.',
    'Repost this before everyone else catches on.',
  ],
};

// ── Newsletter subject lines ─────────────────────────────────────────────────

const NEWSLETTER_SUBJECTS = {
  analyst: [
    'Macro Brief: {headline}',
    'Intelligence Update: {category} Signal from {region}',
    '{category} Alert: {headline}',
  ],
  casual: [
    'What just happened in {region} (and why it matters)',
    '{category} update you need to see',
    'The {region} story everyone should be watching',
  ],
  hotTake: [
    'Hot Take: {headline}',
    'The {category} story nobody is talking about',
    'Why {region} just changed the game',
  ],
};

// ── Helper utilities ─────────────────────────────────────────────────────────

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function impactTier(score) {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'moderate';
  return 'low';
}

function countWords(text) {
  if (!text) return 0;
  return text.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean).length;
}

/**
 * Truncate text at a word boundary to fit within a character limit.
 * Appends ellipsis if truncation occurs.
 */
export function truncateToLimit(text, limit) {
  if (!text || text.length <= limit) return text;
  const truncated = text.slice(0, limit - 1);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace === -1) return truncated.slice(0, limit - 1) + '\u2026';
  return truncated.slice(0, lastSpace) + '\u2026';
}

/**
 * Generate relevant hashtags from event category, region, and keywords.
 * Returns an array of hashtag strings (without leading #).
 */
export function generateHashtags(item, count = 10) {
  const { category = 'Equities', region = 'Global', keywords = [] } = item || {};

  const pool = new Set();

  // Category-specific hashtags
  const catTags = CATEGORY_HASHTAGS[category] || CATEGORY_HASHTAGS['Equities'];
  catTags.forEach(t => pool.add(t));

  // Region hashtags
  const regTags = REGION_HASHTAGS[region] || REGION_HASHTAGS['Global'];
  regTags.forEach(t => pool.add(t));

  // Keyword-derived hashtags (capitalize, remove spaces/special chars)
  keywords.forEach(kw => {
    const clean = kw
      .split(/[\s-]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
    if (clean.length >= 3 && clean.length <= 30) {
      pool.add(clean);
    }
  });

  // Universal hashtags
  UNIVERSAL_HASHTAGS.forEach(t => pool.add(t));

  const arr = Array.from(pool);
  // Shuffle and take requested count
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

/**
 * Format an array of points into thread-style posts, each under maxPerPost characters.
 * Returns an array of { text, charCount } objects.
 */
export function formatAsThread(points, maxPerPost = 280) {
  const posts = [];
  for (let i = 0; i < points.length; i++) {
    const prefix = (i + 1) + '/' + points.length + ' ';
    const available = maxPerPost - prefix.length;
    const content = truncateToLimit(points[i], available);
    const text = prefix + content;
    posts.push({ text, charCount: text.length });
  }
  return posts;
}

// ── Internal content builders ────────────────────────────────────────────────

function getHooks(category, tone) {
  const catHooks = CATEGORY_HOOKS[category] || CATEGORY_HOOKS['Equities'];
  return catHooks[tone] || catHooks.analyst;
}

function getUrgency(score, tone) {
  const tier = impactTier(score);
  const pool = URGENCY[tier][tone] || URGENCY[tier].analyst;
  return pickRandom(pool);
}

function getCta(tone) {
  return pickRandom(CTAS[tone] || CTAS.analyst);
}

function buildInsight(item, tone) {
  const { headline, summary, category, region, impactScore } = item;
  const tier = impactTier(impactScore);

  if (tone === 'analyst') {
    if (tier === 'critical' || tier === 'high') {
      return headline + '. The ' + category.toLowerCase() + ' implications for ' + region + ' are significant and will likely force repricing across related asset classes. ' + (summary ? summary.split('.').slice(0, 2).join('.') + '.' : '');
    }
    return headline + '. This ' + category.toLowerCase() + ' development in ' + region + ' warrants monitoring as it adds to the evolving macro picture. ' + (summary ? summary.split('.')[0] + '.' : '');
  }

  if (tone === 'casual') {
    if (tier === 'critical' || tier === 'high') {
      return headline + '. In plain terms: this is a big deal for ' + region + ' and the ripple effects will reach everyone. ' + (summary ? summary.split('.')[0] + '.' : '');
    }
    return headline + ". Here's the short version: something shifted in " + region + "'s " + category.toLowerCase() + " landscape and it's worth paying attention to. " + (summary ? summary.split('.')[0] + '.' : '');
  }

  // hot-take
  if (tier === 'critical' || tier === 'high') {
    return headline + '. And yet most of your timeline is talking about something else entirely. The ' + category.toLowerCase() + ' signal out of ' + region + ' is screaming — are you listening? ' + (summary ? summary.split('.')[0] + '.' : '');
  }
  return headline + ". This looks minor on the surface. It isn't. The " + category.toLowerCase() + ' dynamic playing out in ' + region + " is a preview of what's coming. " + (summary ? summary.split('.')[0] + '.' : '');
}

function buildContext(item, tone) {
  const { category, region, impactScore, inflationBias, growthBias } = item;

  if (tone === 'analyst') {
    const inflation = inflationBias === 'inflationary' ? 'upward price pressure' : inflationBias === 'disinflationary' ? 'easing price dynamics' : 'neutral price implications';
    const growth = growthBias === 'positive' ? 'supportive growth signals' : growthBias === 'negative' ? 'headwinds to growth' : 'mixed growth implications';
    return 'The macro backdrop features ' + inflation + ' and ' + growth + '. This ' + category.toLowerCase() + ' event in ' + region + ' registers at ' + impactScore + '/10 on our impact scale, making it a ' + impactTier(impactScore) + '-tier signal for asset allocation.';
  }

  if (tone === 'casual') {
    const inflation = inflationBias === 'inflationary' ? 'prices could go up because of this' : inflationBias === 'disinflationary' ? 'this could actually help bring prices down' : 'the impact on prices is a mixed bag';
    const growth = growthBias === 'positive' ? 'on the bright side, growth looks okay' : growthBias === 'negative' ? 'and growth is taking a hit too' : 'and the growth picture is still unclear';
    return "Here's the context: " + inflation + '. Also, ' + growth + '. We rate this a ' + impactScore + '/10 for how much it matters to markets.';
  }

  // hot-take
  const inflation = inflationBias === 'inflationary' ? "Inflation isn't done with you yet" : inflationBias === 'disinflationary' ? 'At least inflation might ease — small consolation' : 'The inflation debate continues and nobody has the answer';
  const growth = growthBias === 'positive' ? 'Growth data says one thing, sentiment says another' : growthBias === 'negative' ? 'Growth is weakening and pretending otherwise is expensive' : 'Growth is a coin flip and anyone who says otherwise is selling something';
  return inflation + '. ' + growth + ". Impact score: " + impactScore + "/10. That's not a drill.";
}

function buildWhyItMatters(item, tone) {
  const { category, region, impactScore } = item;
  const tier = impactTier(impactScore);

  if (tone === 'analyst') {
    if (tier === 'critical') return 'This ' + category.toLowerCase() + ' development carries systemic implications for ' + region + ' and potentially global markets. Portfolio rebalancing and hedging adjustments should be considered immediately.';
    if (tier === 'high') return 'A material signal for ' + region + ' ' + category.toLowerCase() + ' positioning. The transmission mechanism to broader markets is direct and should be factored into tactical allocation.';
    return 'An incremental but directionally important data point for the ' + region + ' ' + category.toLowerCase() + ' outlook. Worth monitoring for portfolio-level implications.';
  }

  if (tone === 'casual') {
    if (tier === 'critical') return 'Why should you care? Because this ' + category.toLowerCase() + ' shift in ' + region + " affects everything from job markets to the price of your groceries. It's that connected.";
    if (tier === 'high') return "This matters because what happens in " + region + "'s " + category.toLowerCase() + " space doesn't stay there. The effects spread to currencies, stocks, and eventually your wallet.";
    return "It's worth knowing about because even smaller " + category.toLowerCase() + ' shifts in ' + region + ' can snowball into bigger trends over time.';
  }

  // hot-take
  if (tier === 'critical') return 'This is the kind of ' + category.toLowerCase() + ' event that makes careers and breaks portfolios. ' + region + " just sent a signal that the market hasn't fully digested yet.";
  if (tier === 'high') return 'While everyone debates headlines, the real story is this ' + category.toLowerCase() + ' move in ' + region + ". By the time it's consensus, the trade is over.";
  return 'Small move, big implications. The ' + category.toLowerCase() + ' dynamic in ' + region + ' is a leading indicator that the macro tourists will discover in three months.';
}

function buildMarketImplications(item, tone) {
  const { category, region, impactScore } = item;

  if (tone === 'analyst') {
    return 'Market transmission: ' + category + ' signals from ' + region + ' will propagate through correlated asset classes. Rate-sensitive instruments, FX pairs tied to the region, and sector-specific equities face the most direct repricing. Position sizing should reflect the ' + impactTier(impactScore) + '-tier impact assessment.';
  }

  if (tone === 'casual') {
    return 'What does this mean for markets? Expect movement in currencies tied to ' + region + ', stocks in the ' + category.toLowerCase() + " space, and possibly bond yields. The bigger the impact (this one's a " + impactScore + '/10), the wider the ripple.';
  }

  // hot-take
  return 'The market will take two days to figure out what this means. By then the move is done. ' + category + ' in ' + region + ' at ' + impactScore + "/10 impact — this is a setup, not just a headline.";
}

// ── Social post generators ───────────────────────────────────────────────────

function generateXPost(item, tone) {
  const hooks = getHooks(item.category, tone);
  const hook = pickRandom(hooks);
  const urgency = getUrgency(item.impactScore, tone);
  const tags = generateHashtags(item, 3).map(function(t) { return '#' + t; }).join(' ');

  // Build the tweet body
  var insight;
  if (tone === 'analyst') {
    insight = item.headline + '. ' + impactTier(item.impactScore) + '-tier ' + item.category.toLowerCase() + ' signal from ' + item.region + '.';
  } else if (tone === 'casual') {
    insight = item.headline + ". Here's what it means for you.";
  } else {
    insight = item.headline + '. And nobody is talking about it.';
  }

  var fullText = hook + ' ' + insight + ' ' + urgency + ' ' + tags;

  // Truncate to fit 280 chars
  if (fullText.length <= 280) {
    return { text: fullText, charCount: fullText.length };
  }

  // Preserve hashtags, truncate middle
  var tagLen = tags.length + 1;
  var available = 280 - tagLen - 1;
  var body = truncateToLimit(hook + ' ' + insight + ' ' + urgency, available);
  var text = body + ' ' + tags;
  return { text: text, charCount: text.length };
}

function generateLinkedInPost(item, tone) {
  var hook = pickRandom(getHooks(item.category, tone));
  var urgency = getUrgency(item.impactScore, tone);
  var tags = generateHashtags(item, 5).map(function(t) { return '#' + t; }).join(' ');

  var body;
  if (tone === 'analyst') {
    body = hook + '\n\n' + item.headline + '.\n\n' + (item.summary || ('A ' + impactTier(item.impactScore) + '-impact development in the ' + item.category.toLowerCase() + ' space affecting ' + item.region + '.')) + '\n\n' + urgency + ' The ' + item.category.toLowerCase() + ' signal from ' + item.region + ' registers at ' + item.impactScore + '/10 on our macro impact scale. This carries direct implications for asset allocation across fixed income, currencies, and risk assets in the region.\n\nKey vectors: ' + ((item.keywords || []).slice(0, 4).join(', ') || item.category) + '.\n\n' + getCta(tone) + '\n\n' + tags;
  } else if (tone === 'casual') {
    body = hook + '\n\n' + item.headline + '.\n\n' + (item.summary || ("Something just shifted in " + item.region + "'s " + item.category.toLowerCase() + ' landscape.')) + '\n\n' + urgency + ' In plain terms, this is a ' + item.impactScore + '/10 on the "does this actually matter" scale. And the answer is yes.\n\nWhat to watch: how ' + item.region + ' responds and whether this spreads to other markets.\n\n' + getCta(tone) + '\n\n' + tags;
  } else {
    body = hook + '\n\n' + item.headline + '.\n\n' + (item.summary || ("The " + item.category.toLowerCase() + " landscape just shifted under everyone's feet.")) + '\n\n' + urgency + ' Impact score: ' + item.impactScore + "/10. Most analysts will update their models next week. By then, the market will have moved.\n\nThe real question: who was positioned for this and who gets caught flat-footed?\n\n" + getCta(tone) + '\n\n' + tags;
  }

  // LinkedIn: 500-800 chars target
  if (body.length > 800) {
    var lines = body.split('\n\n');
    while (lines.join('\n\n').length > 800 && lines.length > 4) {
      lines.splice(Math.floor(lines.length / 2), 1);
    }
    body = lines.join('\n\n');
  }

  return { text: body, charCount: body.length };
}

function generateInstagramPost(item, tone) {
  var hook = pickRandom(getHooks(item.category, tone));
  var tags = generateHashtags(item, 15).map(function(t) { return '#' + t; }).join(' ');
  var tier = impactTier(item.impactScore);

  var impactEmoji = tier === 'critical' ? '\u{1F6A8}' : tier === 'high' ? '\u26A0\uFE0F' : tier === 'moderate' ? '\u{1F4CA}' : '\u{1F4CC}';
  var regionEmojiMap = {
    'North America': '\u{1F1FA}\u{1F1F8}',
    Europe: '\u{1F1EA}\u{1F1FA}',
    Asia: '\u{1F30F}',
    'Asia-Pacific': '\u{1F30F}',
    'Middle East': '\u{1F54C}',
    'Middle East & Africa': '\u{1F30D}',
    'Latin America': '\u{1F30E}',
    Africa: '\u{1F30D}',
    Global: '\u{1F310}',
  };

  var rEmoji = regionEmojiMap[item.region] || '\u{1F310}';

  var body;
  if (tone === 'analyst') {
    body = impactEmoji + ' ' + hook + '\n\n' + item.headline + '\n\n' + rEmoji + ' Region: ' + item.region + '\n\u{1F4C9} Category: ' + item.category + '\n\u{1F4CA} Impact: ' + item.impactScore + '/10\n\n' + (item.summary ? item.summary.split('.').slice(0, 2).join('.') + '.' : ('A ' + tier + '-impact ' + item.category.toLowerCase() + ' signal worth tracking.')) + '\n\n' + getCta(tone) + '\n\n' + tags;
  } else if (tone === 'casual') {
    body = impactEmoji + ' ' + hook + '\n\n' + item.headline + '\n\n' + rEmoji + ' ' + item.region + ' | ' + item.category + ' | ' + item.impactScore + '/10\n\n' + (item.summary ? item.summary.split('.')[0] + '.' : ('Big moves in ' + item.category.toLowerCase() + '.')) + " Here's why this matters to you \u{1F447}\n\n" + getCta(tone) + '\n\n' + tags;
  } else {
    body = impactEmoji + '\u{1F525} ' + hook + '\n\n' + item.headline + '\n\n' + rEmoji + ' ' + item.region + ' | Impact: ' + item.impactScore + '/10\n\n' + (item.summary ? item.summary.split('.')[0] + '.' : ('The ' + item.category.toLowerCase() + ' landscape just changed.')) + " The mainstream won't cover this properly for days.\n\n" + getCta(tone) + '\n\n' + tags;
  }

  // Instagram: 300-500 chars target (excluding hashtags)
  var bodyWithoutTags = body.replace(tags, '').trim();
  if (bodyWithoutTags.length > 500) {
    var lines = body.split('\n\n');
    while (lines.join('\n\n').length > 500 + tags.length + 2 && lines.length > 3) {
      lines.splice(lines.length - 2, 1);
    }
    body = lines.join('\n\n');
  }

  return { text: body, charCount: body.length };
}

// ── Video script generators ──────────────────────────────────────────────────

function generateScript(item, duration, tone) {
  var hook = pickRandom(getHooks(item.category, tone));
  var cta = getCta(tone);

  var hookText, bodyText, ctaText;

  if (duration === '30s') {
    // One hook + one key point + CTA
    if (tone === 'analyst') {
      hookText = hook + ' ' + item.headline + '.';
      bodyText = 'This ' + impactTier(item.impactScore) + '-impact ' + item.category.toLowerCase() + ' signal from ' + item.region + ' has direct implications for portfolio positioning. ' + (item.summary ? item.summary.split('.')[0] + '.' : 'Markets are recalibrating.');
      ctaText = cta;
    } else if (tone === 'casual') {
      hookText = hook + ' ' + item.headline + '.';
      bodyText = "Here's what you need to know: something just shifted in " + item.region + ' that affects ' + item.category.toLowerCase() + ' markets. ' + (item.summary ? item.summary.split('.')[0] + '.' : 'And it matters more than you think.');
      ctaText = cta;
    } else {
      hookText = hook + ' ' + item.headline + '.';
      bodyText = 'Nobody is talking about this yet, but the ' + item.category.toLowerCase() + ' move out of ' + item.region + ' is a ' + item.impactScore + ' out of 10. ' + (item.summary ? item.summary.split('.')[0] + '.' : 'Let that sink in.');
      ctaText = cta;
    }
  } else if (duration === '60s') {
    // Hook + context + why it matters + CTA
    hookText = hook + ' ' + item.headline + '.';

    if (tone === 'analyst') {
      bodyText = buildContext(item, tone) + ' ' + buildWhyItMatters(item, tone) + ' The transmission to related asset classes is already underway.';
    } else if (tone === 'casual') {
      bodyText = 'So what actually happened? ' + (item.summary || (item.headline + '.')) + ' ' + buildContext(item, tone) + ' ' + buildWhyItMatters(item, tone);
    } else {
      bodyText = (item.summary || (item.headline + '.')) + ' ' + buildContext(item, tone) + ' ' + buildWhyItMatters(item, tone);
    }
    ctaText = cta;
  } else {
    // 90s: Hook + context + deep dive + market implications + CTA
    hookText = hook + ' ' + item.headline + '.';

    if (tone === 'analyst') {
      bodyText = buildContext(item, tone) + '\n\n' + buildInsight(item, tone) + '\n\n' + buildWhyItMatters(item, tone) + '\n\n' + buildMarketImplications(item, tone);
    } else if (tone === 'casual') {
      bodyText = 'Let me break this down. ' + buildContext(item, tone) + '\n\n' + buildInsight(item, tone) + '\n\n' + buildWhyItMatters(item, tone) + '\n\n' + buildMarketImplications(item, tone);
    } else {
      bodyText = buildContext(item, tone) + '\n\n' + buildInsight(item, tone) + '\n\n' + buildWhyItMatters(item, tone) + '\n\n' + buildMarketImplications(item, tone);
    }
    ctaText = cta;
  }

  var fullScript = hookText + ' ' + bodyText + ' ' + ctaText;
  var wc = countWords(fullScript);

  return {
    hook: hookText,
    body: bodyText,
    cta: ctaText,
    wordCount: wc,
  };
}

// ── Thread generator ─────────────────────────────────────────────────────────

function generateThread(item, tone) {
  var tags = generateHashtags(item, 4).map(function(t) { return '#' + t; }).join(' ');
  var cta = getCta(tone);
  var hook = pickRandom(getHooks(item.category, tone));

  var points = [];

  // Post 1: Hook/headline
  if (tone === 'analyst') {
    points.push(hook + ' ' + item.headline + '. Thread on the macro implications.');
  } else if (tone === 'casual') {
    points.push(hook + ' ' + item.headline + '. Let me explain why this matters (thread).');
  } else {
    points.push(hook + ' ' + item.headline + '. A thread on why everyone should be paying attention.');
  }

  // Post 2: What happened
  if (tone === 'analyst') {
    points.push((item.summary || (item.headline + '.')) + ' Impact assessment: ' + item.impactScore + '/10 (' + impactTier(item.impactScore) + '-tier). Region: ' + item.region + '. Category: ' + item.category + '.');
  } else if (tone === 'casual') {
    points.push('What happened: ' + (item.summary || (item.headline + '.')) + " On a scale of 1-10 for how much this matters, it's a " + item.impactScore + '.');
  } else {
    points.push((item.summary || (item.headline + '.')) + ' ' + item.impactScore + "/10 impact score. If that doesn't get your attention, nothing will.");
  }

  // Post 3: Context
  points.push(buildContext(item, tone));

  // Post 4: Why it matters
  points.push(buildWhyItMatters(item, tone));

  // Post 5: Market implications
  points.push(buildMarketImplications(item, tone));

  // Post 6 (optional): Additional insight for high-impact
  if (item.impactScore >= 6) {
    if (tone === 'analyst') {
      points.push('Key vectors to monitor: ' + ((item.keywords || []).slice(0, 4).join(', ') || item.category) + '. The ' + (item.inflationBias || 'neutral') + ' inflation bias and ' + (item.growthBias || 'mixed') + ' growth signal compound the complexity.');
    } else if (tone === 'casual') {
      points.push('Things to watch: ' + ((item.keywords || []).slice(0, 3).join(', ') || 'how markets react') + '. The inflation angle (' + (item.inflationBias || 'unclear') + ') makes this even more interesting.');
    } else {
      points.push('The keywords nobody is searching yet: ' + ((item.keywords || []).slice(0, 3).join(', ') || item.category) + ". Remember this post when it's front-page news.");
    }
  }

  // Final post: CTA + hashtags
  points.push(cta + ' ' + tags);

  // Format into thread with numbering and char limits
  return { posts: formatAsThread(points) };
}

// ── Newsletter snippet generator ─────────────────────────────────────────────

function generateNewsletter(item, tone) {
  var subjectTemplates = NEWSLETTER_SUBJECTS[tone] || NEWSLETTER_SUBJECTS.analyst;
  var subject = pickRandom(subjectTemplates)
    .replace('{headline}', item.headline)
    .replace('{category}', item.category)
    .replace('{region}', item.region);

  var body;

  if (tone === 'analyst') {
    body = [
      '**' + item.headline + '**',
      '',
      (item.summary || ('A ' + impactTier(item.impactScore) + '-impact ' + item.category.toLowerCase() + ' development has emerged from ' + item.region + '.')),
      '',
      buildContext(item, tone),
      '',
      '**Why This Matters**',
      '',
      buildWhyItMatters(item, tone),
      '',
      '**Key Takeaway:** ' + buildMarketImplications(item, tone),
      '',
      '**Impact Assessment:** ' + item.impactScore + '/10 | **Region:** ' + item.region + ' | **Category:** ' + item.category,
      '',
      '---',
      getCta(tone),
    ].join('\n');
  } else if (tone === 'casual') {
    body = [
      '## ' + item.headline,
      '',
      (item.summary || ("Something just happened in " + item.region + " that's worth your attention.")),
      '',
      buildContext(item, tone),
      '',
      '**Why should you care?**',
      '',
      buildWhyItMatters(item, tone),
      '',
      '**Bottom line:** ' + buildMarketImplications(item, tone),
      '',
      'Impact: ' + item.impactScore + '/10 | ' + item.region + ' | ' + item.category,
      '',
      getCta(tone),
    ].join('\n');
  } else {
    body = [
      '## ' + item.headline,
      '',
      getUrgency(item.impactScore, tone),
      '',
      (item.summary || ('The ' + item.category.toLowerCase() + ' signal out of ' + item.region + ' is louder than the headlines suggest.')),
      '',
      buildContext(item, tone),
      '',
      '**The real story:**',
      '',
      buildWhyItMatters(item, tone),
      '',
      '**What the market is missing:** ' + buildMarketImplications(item, tone),
      '',
      'Impact: ' + item.impactScore + '/10 | ' + item.region + ' | ' + item.category,
      '',
      getCta(tone),
    ].join('\n');
  }

  return {
    subject: subject,
    body: body,
    wordCount: countWords(body),
  };
}

// ── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate multi-format, multi-tone content from a macro intelligence event.
 *
 * @param {object} item - Event item with headline, summary, source, region,
 *   category, impactScore, keywords, inflationBias, growthBias, publishedAt.
 * @returns {object} Structured content across social, scripts, thread,
 *   newsletter formats in analyst/casual/hotTake tones.
 */
export function generateContent(item) {
  var {
    headline = '',
    summary = '',
    source = '',
    region = 'Global',
    category = 'Equities',
    impactScore = 5,
    keywords = [],
    inflationBias = 'neutral',
    growthBias = 'mixed',
    publishedAt = new Date(),
  } = item || {};

  // Normalize the item with defaults applied
  var normalizedItem = {
    headline: headline,
    summary: summary,
    source: source,
    region: region,
    category: category,
    impactScore: impactScore,
    keywords: keywords,
    inflationBias: inflationBias,
    growthBias: growthBias,
    publishedAt: publishedAt,
  };

  // ── Social Posts ──────────────────────────────────────────────────────────
  var social = {
    x: {
      analyst: generateXPost(normalizedItem, 'analyst'),
      casual: generateXPost(normalizedItem, 'casual'),
      hotTake: generateXPost(normalizedItem, 'hotTake'),
    },
    linkedin: {
      analyst: generateLinkedInPost(normalizedItem, 'analyst'),
      casual: generateLinkedInPost(normalizedItem, 'casual'),
      hotTake: generateLinkedInPost(normalizedItem, 'hotTake'),
    },
    instagram: {
      analyst: generateInstagramPost(normalizedItem, 'analyst'),
      casual: generateInstagramPost(normalizedItem, 'casual'),
      hotTake: generateInstagramPost(normalizedItem, 'hotTake'),
    },
  };

  // ── Video Scripts ────────────────────────────────────────────────────────
  var scripts = {
    '30s': {
      analyst: generateScript(normalizedItem, '30s', 'analyst'),
      casual: generateScript(normalizedItem, '30s', 'casual'),
      hotTake: generateScript(normalizedItem, '30s', 'hotTake'),
    },
    '60s': {
      analyst: generateScript(normalizedItem, '60s', 'analyst'),
      casual: generateScript(normalizedItem, '60s', 'casual'),
      hotTake: generateScript(normalizedItem, '60s', 'hotTake'),
    },
    '90s': {
      analyst: generateScript(normalizedItem, '90s', 'analyst'),
      casual: generateScript(normalizedItem, '90s', 'casual'),
      hotTake: generateScript(normalizedItem, '90s', 'hotTake'),
    },
  };

  // ── Threads ──────────────────────────────────────────────────────────────
  var thread = {
    analyst: generateThread(normalizedItem, 'analyst'),
    casual: generateThread(normalizedItem, 'casual'),
    hotTake: generateThread(normalizedItem, 'hotTake'),
  };

  // ── Newsletter Snippets ──────────────────────────────────────────────────
  var newsletter = {
    analyst: generateNewsletter(normalizedItem, 'analyst'),
    casual: generateNewsletter(normalizedItem, 'casual'),
    hotTake: generateNewsletter(normalizedItem, 'hotTake'),
  };

  return {
    social: social,
    scripts: scripts,
    thread: thread,
    newsletter: newsletter,
    generatedAt: new Date(),
    sourceEvent: {
      headline: headline,
      category: category,
      region: region,
      impactScore: impactScore,
    },
  };
}

export default generateContent;
