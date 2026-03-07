// ---------------------------------------------------------------------------
// marketLinker.js — Link events to relevant market instruments
// Rules-based engine: maps category + country to financial instruments.
// ---------------------------------------------------------------------------

// ---- Instrument Definitions ------------------------------------------------

const INSTRUMENTS = {
  // Currencies
  'DXY': { name: 'US Dollar Index (DXY)', type: 'currency' },
  'EUR/USD': { name: 'EUR/USD', type: 'currency' },
  'GBP/USD': { name: 'GBP/USD', type: 'currency' },
  'USD/JPY': { name: 'USD/JPY', type: 'currency' },
  'USD/CNY': { name: 'USD/CNY', type: 'currency' },
  'USD/INR': { name: 'USD/INR', type: 'currency' },
  'USD/TRY': { name: 'USD/TRY', type: 'currency' },
  'USD/BRL': { name: 'USD/BRL', type: 'currency' },
  'USD/RUB': { name: 'USD/RUB', type: 'currency' },
  'USD/KRW': { name: 'USD/KRW', type: 'currency' },
  'USD/NGN': { name: 'USD/NGN', type: 'currency' },
  'USD/VND': { name: 'USD/VND', type: 'currency' },
  'USD/SAR': { name: 'USD/SAR', type: 'currency' },

  // Bonds
  'UST10Y': { name: 'US 10Y Treasury', type: 'bond' },
  'BUND10Y': { name: 'German Bund 10Y', type: 'bond' },
  'GILT10Y': { name: 'UK Gilt 10Y', type: 'bond' },
  'JGB10Y': { name: 'Japan JGB 10Y', type: 'bond' },
  'CGB10Y': { name: 'China CGB 10Y', type: 'bond' },

  // Indices
  'SPX': { name: 'S&P 500', type: 'index' },
  'STOXX50': { name: 'Euro Stoxx 50', type: 'index' },
  'FTSE100': { name: 'FTSE 100', type: 'index' },
  'NIKKEI': { name: 'Nikkei 225', type: 'index' },
  'CSI300': { name: 'CSI 300', type: 'index' },
  'SENSEX': { name: 'BSE Sensex', type: 'index' },
  'KOSPI': { name: 'KOSPI', type: 'index' },

  // Commodities
  'BRENT': { name: 'Brent Crude', type: 'commodity' },
  'WTI': { name: 'WTI Crude', type: 'commodity' },
  'NATGAS': { name: 'Natural Gas (Henry Hub)', type: 'commodity' },
  'GOLD': { name: 'Gold (XAU)', type: 'commodity' },
  'COPPER': { name: 'Copper', type: 'commodity' },
  'WHEAT': { name: 'Wheat', type: 'commodity' },
  'LNG': { name: 'LNG (JKM)', type: 'commodity' },
};

const I = (key) => INSTRUMENTS[key];

// ---- Country -> Instrument Mapping -----------------------------------------

const COUNTRY_INSTRUMENTS = {
  'United States': { currency: I('DXY'), bond: I('UST10Y'), index: I('SPX') },
  'China': { currency: I('USD/CNY'), bond: I('CGB10Y'), index: I('CSI300') },
  'Japan': { currency: I('USD/JPY'), bond: I('JGB10Y'), index: I('NIKKEI') },
  'Germany': { currency: I('EUR/USD'), bond: I('BUND10Y'), index: I('STOXX50') },
  'United Kingdom': { currency: I('GBP/USD'), bond: I('GILT10Y'), index: I('FTSE100') },
  'France': { currency: I('EUR/USD'), bond: I('BUND10Y'), index: I('STOXX50') },
  'India': { currency: I('USD/INR'), index: I('SENSEX') },
  'Brazil': { currency: I('USD/BRL') },
  'Russia': { currency: I('USD/RUB') },
  'Turkey': { currency: I('USD/TRY') },
  'South Korea': { currency: I('USD/KRW'), index: I('KOSPI') },
  'Nigeria': { currency: I('USD/NGN') },
  'Vietnam': { currency: I('USD/VND') },
  'Saudi Arabia': { currency: I('USD/SAR') },
};

// ---- Category -> Instrument Rules ------------------------------------------

const CATEGORY_RULES = {
  'Central Banks & Monetary Policy': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    const instruments = [];
    if (ci?.currency) instruments.push(ci.currency);
    if (ci?.bond) instruments.push(ci.bond);
    if (ci?.index) instruments.push(ci.index);
    if (instruments.length === 0) instruments.push(I('DXY'), I('UST10Y'));
    return instruments;
  },
  'Macroeconomics': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    const instruments = [];
    if (ci?.currency) instruments.push(ci.currency);
    if (ci?.index) instruments.push(ci.index);
    if (instruments.length === 0) instruments.push(I('SPX'));
    return instruments;
  },
  'Trade & Sanctions': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    const instruments = [I('DXY')];
    if (ci?.currency && ci.currency !== I('DXY')) instruments.push(ci.currency);
    return instruments;
  },
  'Energy & Commodities': () => {
    return [I('BRENT'), I('WTI'), I('NATGAS')];
  },
  'Markets & Financial Conditions': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    const instruments = [];
    if (ci?.index) instruments.push(ci.index);
    if (ci?.bond) instruments.push(ci.bond);
    if (instruments.length === 0) instruments.push(I('SPX'), I('UST10Y'));
    return instruments;
  },
  'Geopolitics & Conflict': (country) => {
    const instruments = [I('GOLD'), I('BRENT')];
    const ci = COUNTRY_INSTRUMENTS[country];
    if (ci?.currency) instruments.push(ci.currency);
    return instruments;
  },
  'Government Policy & Regulation': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    const instruments = [];
    if (ci?.currency) instruments.push(ci.currency);
    if (ci?.index) instruments.push(ci.index);
    if (instruments.length === 0) instruments.push(I('SPX'));
    return instruments;
  },
  'Supply Chains & Logistics': () => {
    return [I('COPPER'), I('BRENT')];
  },
  'Technology & Strategic Infrastructure': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    return ci?.index ? [ci.index] : [I('SPX')];
  },
  'Water, Food & Resource Security': () => {
    return [I('WHEAT'), I('GOLD')];
  },
  'Official Data Releases': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    const instruments = [];
    if (ci?.currency) instruments.push(ci.currency);
    if (ci?.bond) instruments.push(ci.bond);
    if (instruments.length === 0) instruments.push(I('DXY'), I('UST10Y'));
    return instruments;
  },
  'Institutional Research / Reports': (country) => {
    const ci = COUNTRY_INSTRUMENTS[country];
    return ci?.index ? [ci.index] : [I('SPX')];
  },
};

// ---- Public API ------------------------------------------------------------

/**
 * Link market instruments to an event based on its category and country.
 * Modifies event in place, adding `relatedMarketInstruments`.
 */
export function linkMarkets(event) {
  if (!event.category) return event;

  const ruleFn = CATEGORY_RULES[event.category];
  if (!ruleFn) return event;

  const instruments = ruleFn(event.primaryCountry);
  if (instruments.length > 0) {
    event.relatedMarketInstruments = instruments.filter(Boolean);
  }

  return event;
}

/**
 * Get all available instruments for browsing.
 */
export function getAllInstruments() {
  return Object.values(INSTRUMENTS);
}
