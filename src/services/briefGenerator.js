// ---------------------------------------------------------------------------
// briefGenerator.js
// Template-based macro-intelligence brief generator.
// No external AI API required — uses keyword analysis, category templates,
// and conditional logic to produce structured analytical briefings.
// ---------------------------------------------------------------------------

// ── Category template maps ──────────────────────────────────────────────────

const CATEGORY_TEMPLATES = {
  'Monetary Policy': {
    whyItMatters: {
      high: 'This decision sits at the heart of the global rate cycle. Central bank actions of this magnitude reshape yield curves, alter currency valuations, and redefine risk-asset pricing across every major asset class. Markets had partially priced this move, but the forward guidance implications could sustain volatility well beyond the announcement window.',
      medium: 'Central bank signalling continues to anchor market expectations. While this action falls within the range of consensus forecasts, the nuance in language and projected rate path will feed directly into fixed-income positioning and currency carry calculations for the coming quarter.',
      low: 'This represents an incremental data point in the broader monetary policy trajectory. While unlikely to trigger immediate re-pricing, it adds to the mosaic of evidence markets use to calibrate medium-term rate expectations.',
    },
    marketImplications: 'Rate-sensitive assets face the most direct transmission. Front-end bond yields will reprice to reflect updated terminal rate expectations, with the 2y-10y spread likely to {yieldCurveAction}. The domestic currency should {fxAction} on updated carry differentials, while equity multiples in rate-sensitive sectors — particularly real estate, utilities, and growth tech — face {equityAction}. Credit spreads may {creditAction} as funding cost recalculations propagate through corporate treasuries.',
    policyContext: 'This action must be read within the dual-mandate framework: balancing price stability against employment and growth objectives. The central bank is navigating a narrow corridor between overtightening (risking recession) and under-tightening (risking inflation re-acceleration). Forward guidance language will be parsed for any shift in the reaction function.',
    watchNext: [
      'Next scheduled rate decision and updated dot plot / rate projections',
      'Inflation prints (CPI, PCE, or regional equivalent) in the intervening period',
      'Labour market data for signs of demand cooling or resilience',
    ],
  },
  'Trade & Tariffs': {
    whyItMatters: {
      high: 'Trade policy of this scale directly rewires global supply chains. Tariff escalation at this level introduces significant cost-push inflation for importing economies, forces corporate re-sourcing decisions worth billions, and risks retaliatory cascades that could fragment the multilateral trading system further.',
      medium: 'This trade action signals shifting priorities in bilateral commercial relations. While not systemic, it will affect specific sectors and supply chains, potentially forcing margin compression for exposed firms and creating arbitrage opportunities in affected commodity flows.',
      low: 'An incremental adjustment to the trade policy landscape. The direct economic impact is contained, but it serves as a signal of the broader direction of trade relations and may presage more significant measures.',
    },
    marketImplications: 'Supply chains most exposed to the affected trade corridor face immediate repricing. Import-dependent sectors will see margin pressure from tariff pass-through, while domestic competitors may benefit from effective protection. Commodity flows through the affected corridor could reroute, creating temporary dislocations in regional pricing. FX markets will reflect updated terms-of-trade calculations, with the exporting nation\'s currency facing depreciation pressure.',
    policyContext: 'This sits within the broader context of great-power economic competition and the shift from rules-based multilateral trade toward bilateral deal-making. Retaliatory measures are the key escalation risk, with WTO dispute mechanisms increasingly sidelined.',
    watchNext: [
      'Retaliatory tariff announcements or diplomatic countermeasures from affected parties',
      'Corporate earnings guidance revisions from exposed supply-chain participants',
      'Shipping and logistics data for early signs of trade rerouting',
    ],
  },
  Sanctions: {
    whyItMatters: {
      high: 'Sanctions at this scale constitute an economic weapon with systemic reach. They sever financial linkages, disrupt energy and commodity flows, and force third-party nations into compliance choices that reshape alliance structures. Secondary sanctions risk makes this a global compliance event.',
      medium: 'This sanctions action tightens the economic pressure campaign while testing enforcement capacity. The designations target nodes in the sanctioned economy\'s financial and trade architecture, but workaround pathways and sanctions-evasion networks will partially blunt the impact.',
      low: 'A targeted sanctions adjustment that signals continued diplomatic pressure without escalating the economic confrontation materially. Compliance costs are concentrated in a narrow set of counterparties.',
    },
    marketImplications: 'Energy and commodity markets face the most immediate impact, as sanctions disrupt established supply routes and force buyers to secure alternative sources — typically at a premium. Financial institutions must rapidly screen exposure, potentially unwinding positions. Insurance and shipping costs for affected corridors will rise. Safe-haven flows may temporarily support gold, USD, and sovereign bonds from non-involved parties.',
    policyContext: 'Sanctions are a coercive tool of statecraft, deployed to alter behaviour without kinetic action. Their effectiveness depends on multilateral coordination, enforcement rigour, and the targeted economy\'s ability to find alternative partners. The historical record shows diminishing returns over time as evasion networks mature.',
    watchNext: [
      'Secondary sanctions enforcement actions against third-party facilitators',
      'Energy supply rerouting data and tanker tracking for affected commodities',
      'Diplomatic negotiations or back-channel signalling for potential de-escalation',
    ],
  },
  'Energy Markets': {
    whyItMatters: {
      high: 'Energy supply disruptions of this magnitude ripple through the entire global economy. As a primary input cost, energy price shocks feed directly into inflation, compress industrial margins, and can tip energy-importing economies into current-account crises. The geopolitical premium embedded in pricing may persist well beyond the immediate supply event.',
      medium: 'This development adjusts the supply-demand balance in a market already operating with thin spare capacity buffers. The price impact may be contained if strategic reserves or alternative suppliers can compensate, but the signal value for future energy security investment is significant.',
      low: 'A modest shift in energy market dynamics that contributes to the ongoing price discovery process. While not a systemic event, it informs medium-term expectations for production trajectories and investment cycles.',
    },
    marketImplications: 'Crude and natural gas benchmarks will reflect updated supply risk premia. Energy-intensive sectors (chemicals, airlines, manufacturing) face direct margin impact. Currency pairs of major importers vs. exporters will adjust to reflect terms-of-trade shifts. Renewable energy equities may see renewed interest if the event highlights fossil fuel supply fragility. Inflation breakevens will recalibrate.',
    policyContext: 'Energy remains the most geopolitically sensitive commodity class. Production decisions reflect a complex interplay of OPEC+ coordination, national fiscal requirements, energy transition pressures, and strategic inventory management. Spare capacity is the critical buffer variable.',
    watchNext: [
      'OPEC+ production response or emergency meeting signals',
      'Strategic petroleum reserve release announcements from major importers',
      'Real-time tanker traffic and refinery utilization data',
    ],
  },
  Commodities: {
    whyItMatters: {
      high: 'Commodity price movements of this magnitude signal fundamental shifts in global supply-demand dynamics. As essential inputs to manufacturing, agriculture, and construction, broad commodity repricing feeds through to producer prices, consumer inflation, and corporate earnings across multiple sectors and geographies.',
      medium: 'This commodity market development reflects evolving supply-demand fundamentals. The affected markets will see inventory adjustments and forward curve repricing, with downstream industries recalculating input cost assumptions.',
      low: 'An incremental update to commodity market conditions. Price movements at this scale are within normal seasonal and cyclical ranges but contribute to the broader assessment of global demand conditions.',
    },
    marketImplications: 'Physical commodity markets will see inventory repositioning, with contango/backwardation shifts signalling market expectations for supply resolution timelines. Commodity-exporting emerging markets\' currencies and sovereign bonds will react to updated terms-of-trade. Input-intensive equities face margin recalculation. Inflation expectations may adjust modestly.',
    policyContext: 'Commodity markets sit at the intersection of physical supply constraints, financial speculation, and climate-driven policy shifts. Storage dynamics, seasonal patterns, and the evolving energy transition timeline all shape the structural outlook for industrial and agricultural commodities.',
    watchNext: [
      'Warehouse stock reports and physical delivery data for supply signals',
      'Chinese PMI and import data as the marginal demand driver',
      'Weather patterns affecting agricultural or energy production regions',
    ],
  },
  FX: {
    whyItMatters: {
      high: 'Currency moves of this magnitude signal a regime shift in capital flow dynamics. FX repricing at this scale disrupts carry trade positioning, forces reserve manager rebalancing, and can trigger intervention from central banks defending exchange rate stability. The cross-border transmission to trade competitiveness and inflation is immediate.',
      medium: 'This FX development reflects recalibrating expectations for relative monetary policy paths and growth differentials. Positioning is adjusting but remains within orderly bounds. The move will feed into import price calculations and corporate hedging programmes.',
      low: 'An incremental FX adjustment consistent with evolving rate differentials and risk sentiment. Volatility remains contained, and the move is unlikely to trigger policy intervention.',
    },
    marketImplications: 'FX volatility will propagate into options pricing across major pairs, with implied vols likely to reprice for the affected corridor. Carry trade returns face recalculation as rate differentials and spot momentum shift. Export-oriented equities benefit from domestic currency weakness, while importers face headwinds. Sovereign debt in the weakening currency may see foreign outflows as unhedged returns deteriorate.',
    policyContext: 'Exchange rates reflect the intersection of monetary policy divergence, trade balances, capital account openness, and geopolitical risk positioning. Central bank intervention capacity (reserves vs. currency pressure) determines how far a move can run before policy pushback.',
    watchNext: [
      'Central bank intervention signals (verbal or actual reserve drawdowns)',
      'Options market positioning and risk reversal skew for directional bias',
      'Capital flow data and foreign reserve changes for the affected economies',
    ],
  },
  Equities: {
    whyItMatters: {
      high: 'Equity market moves of this scale reflect a fundamental repricing of growth expectations and risk appetite. Broad-based sell-offs or rallies of this magnitude signal shifting consensus on the economic outlook, potentially triggering margin calls, systematic deleveraging, or FOMO-driven inflows that amplify the initial move.',
      medium: 'Sector rotation and index-level moves at this scale reflect evolving expectations for earnings, rates, and regulation. The rotation signals where the market sees relative value shifting, providing a forward-looking indicator of economic consensus.',
      low: 'Index movements within normal daily ranges. The underlying sector composition of the move provides more signal than the headline number, with relative performance across cyclicals vs. defensives indicating risk sentiment.',
    },
    marketImplications: 'Risk sentiment transmission will propagate across correlated asset classes — credit spreads, volatility indices, and EM equities typically move in sympathy. Sector leadership signals will inform factor rotation strategies. Earnings revision breadth in the coming weeks will determine whether the move is sustained or mean-reverts. Options hedging flows may amplify directional moves around key strikes.',
    policyContext: 'Equity markets serve as both a barometer and a transmission mechanism for economic expectations. The wealth effect from equity holdings influences consumer spending, while equity valuations affect corporate financing costs and M&A activity. Policymakers monitor equity stability but rarely target it directly.',
    watchNext: [
      'Earnings revision breadth and forward guidance from bellwether companies',
      'VIX term structure for signals on expected volatility persistence',
      'Fund flow data for evidence of systematic positioning shifts',
    ],
  },
  'Sovereign Risk': {
    whyItMatters: {
      high: 'Sovereign credit events of this severity threaten contagion across connected economies and financial systems. Rising default risk reprices the cost of capital for an entire nation, chokes off investment, and can trigger capital flight that overwhelms central bank defences. Multilateral rescue packages become a live scenario.',
      medium: 'Fiscal trajectory concerns are building to a level that demands active monitoring. Credit spread widening at this pace reflects genuine uncertainty about debt sustainability, with potential rating actions on the horizon that would force index-tracking institutional sellers.',
      low: 'Sovereign risk metrics are adjusting modestly within established ranges. The fiscal situation remains manageable but the direction of travel warrants attention for early-warning signals.',
    },
    marketImplications: 'Sovereign bond spreads vs. benchmark will widen, increasing the cost of both public and private borrowing. The sovereign-bank nexus means domestic financial sector equities face correlated pressure. Local currency will depreciate as capital seeks safety, potentially triggering a doom loop of FX weakness and imported inflation. Contagion risk to similarly positioned sovereigns will be priced through spread correlation.',
    policyContext: 'Sovereign risk reflects the intersection of fiscal policy credibility, debt dynamics (level, maturity profile, currency denomination), growth trajectory, and institutional capacity. Market pricing of sovereign risk can become self-fulfilling, as rising borrowing costs worsen the fiscal arithmetic they are supposed to reflect.',
    watchNext: [
      'Rating agency reviews and outlook changes for the sovereign',
      'IMF Article IV assessment or programme negotiation signals',
      'Foreign reserve adequacy and debt rollover schedule for the next 12 months',
    ],
  },
  'Emerging Markets': {
    whyItMatters: {
      high: 'Emerging market stress at this level threatens capital flight cascading across the asset class. EM contagion historically accelerates when dollar strength, rising US rates, and domestic vulnerabilities converge. The affected economies face the "impossible trinity" pressure — unable to simultaneously maintain FX stability, monetary independence, and capital account openness.',
      medium: 'EM differentiation is the key theme. This development separates reforming economies with strong fundamentals from those with structural vulnerabilities. Capital will rotate toward EM credits with credible policy frameworks while punishing those with twin deficits or political risk.',
      low: 'A contained EM event that tests but does not breach market confidence in the broader asset class. Reform momentum and commodity price support provide buffers against systemic stress.',
    },
    marketImplications: 'EM local currency bonds face the sharpest repricing as FX risk compounds credit risk. Hard currency (USD-denominated) EM bonds will see spread widening proportional to perceived contagion risk. EM equity indices may underperform DM as risk-off flows favour home-bias. Commodity currencies will reflect updated demand expectations from EM growth downside.',
    policyContext: 'Emerging market resilience depends on the policy trilemma management: exchange rate flexibility, monetary policy credibility, and capital account management. Countries with adequate reserves, credible inflation-targeting frameworks, and manageable external debt face significantly different outcomes than those without.',
    watchNext: [
      'USD/DXY trajectory and US Treasury yields as the key EM headwind drivers',
      'IIF capital flow data for evidence of broad EM outflows vs. country-specific',
      'Central bank intervention and rate decisions in the most vulnerable EM economies',
    ],
  },
};

// ── Region context enrichment ───────────────────────────────────────────────

const REGION_CONTEXT = {
  'North America': {
    fxAction: 'strengthen on safe-haven inflows and relative rate advantage',
    yieldCurveAction: 'flatten as front-end reprices faster than term premium',
    equityAction: 'compression as discount rates rise',
    creditAction: 'widen modestly as funding costs climb',
    geopolitical: 'within the context of US-led multilateral architecture and dollar hegemony',
  },
  Europe: {
    fxAction: 'reflect updated ECB-Fed rate divergence, with EUR/USD as the key expression',
    yieldCurveAction: 'steepen as peripheral spread dynamics re-enter focus',
    equityAction: 'rotation from growth to value as rate expectations shift',
    creditAction: 'widen, particularly in the periphery where sovereign-bank linkages amplify',
    geopolitical: 'against the backdrop of EU strategic autonomy ambitions and energy security imperatives',
  },
  Asia: {
    fxAction: 'face pressure against USD, with intervention risk rising as reserves are deployed',
    yieldCurveAction: 'reprice across the curve as PBoC/BoJ policy expectations recalibrate',
    equityAction: 'reassessment, with export-oriented names benefiting from currency weakness',
    creditAction: 'differentiate between investment-grade Asian credits and higher-yield frontier issuers',
    geopolitical: 'within the US-China strategic competition framework and regional supply chain reconfiguration',
  },
  'Middle East': {
    fxAction: 'remain pegged or managed-float stable for GCC, with non-peg economies facing adjustment',
    yieldCurveAction: 'reflect oil revenue expectations and fiscal break-even recalculations',
    equityAction: 'valuation support from sovereign wealth fund deployment patterns',
    creditAction: 'remain well-supported given strong sovereign balance sheets in the GCC',
    geopolitical: 'amid shifting alliance structures and the energy transition timeline',
  },
  'Latin America': {
    fxAction: 'exhibit elevated volatility as commodity terms-of-trade and political risk interact',
    yieldCurveAction: 'remain steep given persistent inflation expectations and fiscal concerns',
    equityAction: 'pressure from combined FX and rate headwinds on foreign-investor returns',
    creditAction: 'widen as US rate hikes compress EM carry attractiveness',
    geopolitical: 'within the context of commodity supercycle positioning and nearshoring trends',
  },
  Africa: {
    fxAction: 'face depreciation pressure where reserves are thin, with parallel market premia widening',
    yieldCurveAction: 'remain elevated as inflation persistence limits scope for easing',
    equityAction: 'limited liquidity amplification, with frontier market discount deepening',
    creditAction: 'reflect restructuring risk for stressed sovereigns and IMF programme conditionality',
    geopolitical: 'amid great-power competition for mineral resources and infrastructure investment',
  },
  Global: {
    fxAction: 'adjust across major pairs as relative monetary policy expectations recalibrate',
    yieldCurveAction: 'reprice across major bond markets as the global rate cycle shifts',
    equityAction: 'reassessment as the global growth-rate trade-off recalibrates',
    creditAction: 'reprice as global financial conditions tighten or loosen',
    geopolitical: 'within the broader context of multipolar realignment and institutional fragmentation',
  },
};

// ── Inflation / growth bias modifiers ───────────────────────────────────────

const INFLATION_FRAMES = {
  inflationary:
    'The inflationary impulse embedded in this development adds upward pressure to price expectations, potentially constraining central bank flexibility and extending the restrictive policy stance.',
  disinflationary:
    'The disinflationary signal here offers potential relief to price pressures, opening space for monetary accommodation and improving the real income outlook for consumers and businesses.',
  neutral:
    'The net effect on the price level is ambiguous at this stage, with offsetting inflationary and disinflationary forces likely to leave the medium-term inflation trajectory broadly unchanged.',
};

const GROWTH_FRAMES = {
  positive:
    'On net, this is supportive of the growth outlook, potentially lifting GDP forecasts and improving the earnings trajectory for cyclical sectors.',
  negative:
    'The growth implications skew negative, adding to headwinds that may force downward revisions to GDP estimates and compress corporate earnings expectations.',
  mixed:
    'Growth implications are two-sided: near-term disruption may give way to longer-term structural adjustment, making the net GDP effect highly dependent on policy response and private sector adaptation.',
};

// ── Analytical headline transforms ──────────────────────────────────────────

const HEADLINE_PREFIXES = {
  'Monetary Policy': [
    'Rate Signal:',
    'Policy Pivot:',
    'Central Bank Watch:',
    'Monetary Crossroads:',
  ],
  'Trade & Tariffs': [
    'Trade Fault Line:',
    'Tariff Escalation:',
    'Commercial Fracture:',
    'Trade Architecture:',
  ],
  Sanctions: [
    'Sanctions Lever:',
    'Economic Coercion:',
    'Compliance Alert:',
    'Geopolitical Pressure:',
  ],
  'Energy Markets': [
    'Energy Calculus:',
    'Supply Dynamics:',
    'Energy Security:',
    'Barrel Politics:',
  ],
  Commodities: [
    'Commodity Signal:',
    'Supply-Demand Shift:',
    'Raw Materials:',
    'Commodity Pulse:',
  ],
  FX: [
    'Currency Shift:',
    'FX Regime:',
    'Exchange Rate Signal:',
    'Capital Flow:',
  ],
  Equities: [
    'Market Repricing:',
    'Risk Appetite:',
    'Equity Signal:',
    'Valuation Shift:',
  ],
  'Sovereign Risk': [
    'Fiscal Stress:',
    'Sovereign Signal:',
    'Credit Watch:',
    'Debt Dynamics:',
  ],
  'Emerging Markets': [
    'EM Divergence:',
    'Frontier Stress:',
    'EM Capital Flow:',
    'Development Crossroads:',
  ],
};

// ── Structural outlook templates ────────────────────────────────────────────

const STRUCTURAL_OUTLOOK = {
  'Monetary Policy':
    'Over the 6-18 month horizon, this {impactAdj} shift in monetary posture will propagate through credit creation, housing activity, and business investment decisions. The lagged transmission of monetary policy means the full economic impact will materialise well after the headline announcement cycle fades. Markets should be positioned for a regime where {inflationFrame} and the neutral rate debate remains unresolved.',
  'Trade & Tariffs':
    'Structurally, trade policy shifts of this nature take 6-18 months to fully manifest in supply chain reconfiguration. Early movers in re-sourcing and nearshoring will capture competitive advantages, while laggards face margin compression. The medium-term outlook depends on whether this action triggers a cascade of retaliatory measures or remains contained within the current bilateral framework.',
  Sanctions:
    'Sanctions regimes tend to tighten over time as enforcement mechanisms mature and evasion networks are identified. Over the next 6-18 months, expect secondary sanctions expansion, enhanced compliance requirements for financial intermediaries, and potential escalation to energy or technology sectors. The structural shift toward sanctions-proof financial infrastructure (alternative payment systems, commodity settlement) will accelerate.',
  'Energy Markets':
    'The 6-18 month energy outlook hinges on the investment cycle response. Upstream capital expenditure decisions made (or deferred) in response to current pricing will determine supply adequacy in 2-3 years. The transition premium — the cost of simultaneously maintaining fossil fuel supply while building renewable capacity — continues to define the structural floor for energy costs.',
  Commodities:
    'Commodity supply responses operate on multi-year cycles: mining capex takes 3-5 years to reach production, agricultural acreage adjusts annually, and inventory cycles provide only temporary buffers. The 6-18 month outlook depends on whether demand growth (led by China and India) outpaces the supply response currently in the pipeline.',
  FX:
    'Currency trends over the 6-18 month horizon will be shaped by relative monetary policy paths, trade balance evolution, and capital flow persistence. Purchasing power parity provides a gravitational anchor, but positioning and sentiment can sustain deviations for extended periods. The key structural question is whether current valuations reflect temporary policy divergence or a more durable shift in relative economic trajectories.',
  Equities:
    'The 6-18 month equity outlook is anchored by the earnings cycle. Current valuations embed specific assumptions about revenue growth, margin trajectory, and discount rates. The key risk is that the macro regime shift forces a simultaneous downgrade of earnings expectations and an upward revision to discount rates — the dreaded "double compression" scenario. Sector selection will matter more than index-level exposure.',
  'Sovereign Risk':
    'Sovereign creditworthiness over the 6-18 month horizon depends on the interaction between growth, fiscal policy, and financing conditions. A debt sustainability analysis that looks manageable at current rates can deteriorate rapidly if borrowing costs rise or growth disappoints. The key structural variable is the primary balance trajectory and the political will to pursue fiscal consolidation.',
  'Emerging Markets':
    'The EM structural outlook over 6-18 months will be driven by the DM rate cycle, commodity prices, and domestic reform momentum. Countries that have used the current cycle to build reserves, anchor inflation expectations, and advance structural reforms will be positioned to attract capital as DM yields eventually peak. The differentiation trade — long reformers, short fragile — remains the dominant EM framework.',
};

// ── Helper utilities ────────────────────────────────────────────────────────

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function impactLabel(score) {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'significant';
  if (score >= 4) return 'moderate';
  return 'modest';
}

function impactTier(score) {
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function countWords(text) {
  if (!text) return 0;
  return text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString();
}

// ── Main generator ──────────────────────────────────────────────────────────

/**
 * Generate a structured analytical macro briefing from a news item.
 *
 * @param {object} item - News item with headline, summary, source, region,
 *   category, impactScore, keywords, inflationBias, growthBias, publishedAt.
 * @returns {object} Structured brief with title, subtitle, executiveSummary,
 *   sections, watchNext, generatedAt, wordCount.
 */
export function generateBrief(item) {
  const {
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

  // Resolve templates for this category (fall back to Equities)
  const catTemplate =
    CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES['Equities'];
  const regionCtx = REGION_CONTEXT[region] || REGION_CONTEXT['Global'];
  const tier = impactTier(impactScore);
  const adj = impactLabel(impactScore);

  // ── Title: analytical re-framing ─────────────────────────────────────────
  const prefixes = HEADLINE_PREFIXES[category] || HEADLINE_PREFIXES['Equities'];
  const title = `${pickRandom(prefixes)} ${headline}`;

  // ── Subtitle: one-sentence macro framing ─────────────────────────────────
  const keywordStr =
    keywords.length > 0
      ? ` with key vectors in ${keywords.slice(0, 3).join(', ')}`
      : '';
  const subtitle = `A ${adj}-impact ${category.toLowerCase()} development in ${region}${keywordStr}, carrying ${inflationBias} price implications and ${growthBias} growth signals.`;

  // ── What Happened ────────────────────────────────────────────────────────
  const whatHappened = `${headline}. ${summary ? summary : 'Details remain developing.'} This was reported by ${source || 'open-source intelligence channels'} on ${new Date(publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. The development registers as a ${adj}-impact event (${impactScore}/10) within the ${category} category, affecting the ${region} macro landscape.`;

  // ── Why It Matters ───────────────────────────────────────────────────────
  const whyItMattersBase = catTemplate.whyItMatters[tier];
  const inflationNote = INFLATION_FRAMES[inflationBias] || INFLATION_FRAMES.neutral;
  const growthNote = GROWTH_FRAMES[growthBias] || GROWTH_FRAMES.mixed;
  const whyItMatters = `${whyItMattersBase}\n\n${inflationNote} ${growthNote}`;

  // ── Market Implications ──────────────────────────────────────────────────
  const marketImplications = catTemplate.marketImplications
    .replace('{fxAction}', regionCtx.fxAction)
    .replace('{yieldCurveAction}', regionCtx.yieldCurveAction)
    .replace('{equityAction}', regionCtx.equityAction)
    .replace('{creditAction}', regionCtx.creditAction);

  // ── Policy Context ───────────────────────────────────────────────────────
  const policyContext = `${catTemplate.policyContext} This unfolds ${regionCtx.geopolitical}.`;

  // ── Structural Outlook ───────────────────────────────────────────────────
  const outlookTemplate =
    STRUCTURAL_OUTLOOK[category] || STRUCTURAL_OUTLOOK['Equities'];
  const structuralOutlook = outlookTemplate
    .replace('{impactAdj}', adj)
    .replace('{inflationFrame}', inflationBias === 'inflationary'
      ? 'upside inflation risks persist'
      : inflationBias === 'disinflationary'
        ? 'disinflationary forces gain traction'
        : 'inflation risks remain balanced');

  // ── Executive Summary ────────────────────────────────────────────────────
  const executiveSummary = `${headline} marks a ${adj}-impact development for ${region} macro positioning. ${inflationNote} The ${category.toLowerCase()} signal carries direct implications for asset allocation across fixed income, currencies, and risk assets in the region.`;

  // ── Watch Next ───────────────────────────────────────────────────────────
  const watchNext = catTemplate.watchNext.slice(0, 3);

  // ── Assemble sections ────────────────────────────────────────────────────
  const sections = {
    whatHappened,
    whyItMatters,
    marketImplications,
    policyContext,
    structuralOutlook,
  };

  // ── Word count ───────────────────────────────────────────────────────────
  const allText = [
    title,
    subtitle,
    executiveSummary,
    ...Object.values(sections),
    ...watchNext,
  ].join(' ');
  const wordCount = countWords(allText);

  return {
    title,
    subtitle,
    executiveSummary,
    sections,
    watchNext,
    generatedAt: new Date(),
    wordCount,
  };
}

export default generateBrief;
