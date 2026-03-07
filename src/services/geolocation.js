// ---------------------------------------------------------------------------
// geolocation.js — Proper geolocation engine for Macro Intel
// Resolves events to coordinates using entity extraction, institution mapping,
// and infrastructure geometry. No random offsets. No fake coordinates.
// ---------------------------------------------------------------------------

import { LOCATION_CONFIDENCE } from './eventModel.js';

// ---- Country → ISO2 + Capital Coordinates ---------------------------------
// Only real, verified coordinates. No guessing.

export const COUNTRIES = {
  'united states':  { iso2: 'US', lat: 38.895, lng: -77.036, name: 'United States', region: 'North America' },
  'us':             { iso2: 'US', lat: 38.895, lng: -77.036, name: 'United States', region: 'North America' },
  'usa':            { iso2: 'US', lat: 38.895, lng: -77.036, name: 'United States', region: 'North America' },
  'america':        { iso2: 'US', lat: 38.895, lng: -77.036, name: 'United States', region: 'North America' },
  'canada':         { iso2: 'CA', lat: 45.424, lng: -75.695, name: 'Canada', region: 'North America' },
  'mexico':         { iso2: 'MX', lat: 19.432, lng: -99.133, name: 'Mexico', region: 'Latin America' },
  'brazil':         { iso2: 'BR', lat: -15.794, lng: -47.882, name: 'Brazil', region: 'Latin America' },
  'argentina':      { iso2: 'AR', lat: -34.604, lng: -58.382, name: 'Argentina', region: 'Latin America' },
  'colombia':       { iso2: 'CO', lat: 4.711, lng: -74.072, name: 'Colombia', region: 'Latin America' },
  'chile':          { iso2: 'CL', lat: -33.449, lng: -70.669, name: 'Chile', region: 'Latin America' },
  'peru':           { iso2: 'PE', lat: -12.046, lng: -77.043, name: 'Peru', region: 'Latin America' },
  'uk':             { iso2: 'GB', lat: 51.507, lng: -0.128, name: 'United Kingdom', region: 'Europe' },
  'britain':        { iso2: 'GB', lat: 51.507, lng: -0.128, name: 'United Kingdom', region: 'Europe' },
  'united kingdom': { iso2: 'GB', lat: 51.507, lng: -0.128, name: 'United Kingdom', region: 'Europe' },
  'germany':        { iso2: 'DE', lat: 52.520, lng: 13.405, name: 'Germany', region: 'Europe' },
  'france':         { iso2: 'FR', lat: 48.857, lng: 2.352, name: 'France', region: 'Europe' },
  'italy':          { iso2: 'IT', lat: 41.903, lng: 12.496, name: 'Italy', region: 'Europe' },
  'spain':          { iso2: 'ES', lat: 40.417, lng: -3.704, name: 'Spain', region: 'Europe' },
  'netherlands':    { iso2: 'NL', lat: 52.370, lng: 4.895, name: 'Netherlands', region: 'Europe' },
  'poland':         { iso2: 'PL', lat: 52.230, lng: 21.012, name: 'Poland', region: 'Europe' },
  'switzerland':    { iso2: 'CH', lat: 46.948, lng: 7.448, name: 'Switzerland', region: 'Europe' },
  'sweden':         { iso2: 'SE', lat: 59.329, lng: 18.069, name: 'Sweden', region: 'Europe' },
  'norway':         { iso2: 'NO', lat: 59.913, lng: 10.752, name: 'Norway', region: 'Europe' },
  'belgium':        { iso2: 'BE', lat: 50.850, lng: 4.352, name: 'Belgium', region: 'Europe' },
  'austria':        { iso2: 'AT', lat: 48.208, lng: 16.374, name: 'Austria', region: 'Europe' },
  'greece':         { iso2: 'GR', lat: 37.984, lng: 23.728, name: 'Greece', region: 'Europe' },
  'portugal':       { iso2: 'PT', lat: 38.722, lng: -9.139, name: 'Portugal', region: 'Europe' },
  'ireland':        { iso2: 'IE', lat: 53.350, lng: -6.260, name: 'Ireland', region: 'Europe' },
  'finland':        { iso2: 'FI', lat: 60.170, lng: 24.941, name: 'Finland', region: 'Europe' },
  'denmark':        { iso2: 'DK', lat: 55.676, lng: 12.569, name: 'Denmark', region: 'Europe' },
  'czech republic': { iso2: 'CZ', lat: 50.075, lng: 14.438, name: 'Czech Republic', region: 'Europe' },
  'romania':        { iso2: 'RO', lat: 44.426, lng: 26.103, name: 'Romania', region: 'Europe' },
  'hungary':        { iso2: 'HU', lat: 47.498, lng: 19.041, name: 'Hungary', region: 'Europe' },
  'ukraine':        { iso2: 'UA', lat: 50.450, lng: 30.524, name: 'Ukraine', region: 'Europe' },
  'russia':         { iso2: 'RU', lat: 55.756, lng: 37.617, name: 'Russia', region: 'Russia / Eurasia' },
  'kazakhstan':     { iso2: 'KZ', lat: 51.128, lng: 71.431, name: 'Kazakhstan', region: 'Russia / Eurasia' },
  'uzbekistan':     { iso2: 'UZ', lat: 41.311, lng: 69.280, name: 'Uzbekistan', region: 'Russia / Eurasia' },
  'turkey':         { iso2: 'TR', lat: 39.934, lng: 32.860, name: 'Turkey', region: 'MENA' },
  'saudi arabia':   { iso2: 'SA', lat: 24.714, lng: 46.675, name: 'Saudi Arabia', region: 'MENA' },
  'uae':            { iso2: 'AE', lat: 24.454, lng: 54.644, name: 'UAE', region: 'MENA' },
  'iran':           { iso2: 'IR', lat: 35.689, lng: 51.389, name: 'Iran', region: 'MENA' },
  'iraq':           { iso2: 'IQ', lat: 33.312, lng: 44.366, name: 'Iraq', region: 'MENA' },
  'israel':         { iso2: 'IL', lat: 31.769, lng: 35.217, name: 'Israel', region: 'MENA' },
  'egypt':          { iso2: 'EG', lat: 30.044, lng: 31.236, name: 'Egypt', region: 'MENA' },
  'qatar':          { iso2: 'QA', lat: 25.286, lng: 51.535, name: 'Qatar', region: 'MENA' },
  'kuwait':         { iso2: 'KW', lat: 29.376, lng: 47.977, name: 'Kuwait', region: 'MENA' },
  'jordan':         { iso2: 'JO', lat: 31.956, lng: 35.946, name: 'Jordan', region: 'MENA' },
  'lebanon':        { iso2: 'LB', lat: 33.889, lng: 35.495, name: 'Lebanon', region: 'MENA' },
  'morocco':        { iso2: 'MA', lat: 33.972, lng: -6.850, name: 'Morocco', region: 'MENA' },
  'tunisia':        { iso2: 'TN', lat: 36.807, lng: 10.166, name: 'Tunisia', region: 'MENA' },
  'algeria':        { iso2: 'DZ', lat: 36.753, lng: 3.059, name: 'Algeria', region: 'MENA' },
  'libya':          { iso2: 'LY', lat: 32.890, lng: 13.180, name: 'Libya', region: 'MENA' },
  'nigeria':        { iso2: 'NG', lat: 9.058, lng: 7.491, name: 'Nigeria', region: 'Sub-Saharan Africa' },
  'south africa':   { iso2: 'ZA', lat: -25.746, lng: 28.188, name: 'South Africa', region: 'Sub-Saharan Africa' },
  'kenya':          { iso2: 'KE', lat: -1.292, lng: 36.822, name: 'Kenya', region: 'Sub-Saharan Africa' },
  'ethiopia':       { iso2: 'ET', lat: 9.025, lng: 38.747, name: 'Ethiopia', region: 'Sub-Saharan Africa' },
  'ghana':          { iso2: 'GH', lat: 5.560, lng: -0.188, name: 'Ghana', region: 'Sub-Saharan Africa' },
  'tanzania':       { iso2: 'TZ', lat: -6.792, lng: 39.208, name: 'Tanzania', region: 'Sub-Saharan Africa' },
  'congo':          { iso2: 'CD', lat: -4.441, lng: 15.266, name: 'DR Congo', region: 'Sub-Saharan Africa' },
  'india':          { iso2: 'IN', lat: 28.614, lng: 77.209, name: 'India', region: 'South Asia' },
  'pakistan':        { iso2: 'PK', lat: 33.693, lng: 73.031, name: 'Pakistan', region: 'South Asia' },
  'bangladesh':     { iso2: 'BD', lat: 23.811, lng: 90.413, name: 'Bangladesh', region: 'South Asia' },
  'sri lanka':      { iso2: 'LK', lat: 6.927, lng: 79.861, name: 'Sri Lanka', region: 'South Asia' },
  'china':          { iso2: 'CN', lat: 39.904, lng: 116.407, name: 'China', region: 'East Asia' },
  'japan':          { iso2: 'JP', lat: 35.682, lng: 139.759, name: 'Japan', region: 'East Asia' },
  'south korea':    { iso2: 'KR', lat: 37.566, lng: 126.978, name: 'South Korea', region: 'East Asia' },
  'korea':          { iso2: 'KR', lat: 37.566, lng: 126.978, name: 'South Korea', region: 'East Asia' },
  'north korea':    { iso2: 'KP', lat: 39.020, lng: 125.738, name: 'North Korea', region: 'East Asia' },
  'taiwan':         { iso2: 'TW', lat: 25.033, lng: 121.565, name: 'Taiwan', region: 'East Asia' },
  'mongolia':       { iso2: 'MN', lat: 47.887, lng: 106.906, name: 'Mongolia', region: 'East Asia' },
  'indonesia':      { iso2: 'ID', lat: -6.175, lng: 106.827, name: 'Indonesia', region: 'Southeast Asia' },
  'vietnam':        { iso2: 'VN', lat: 21.028, lng: 105.854, name: 'Vietnam', region: 'Southeast Asia' },
  'thailand':       { iso2: 'TH', lat: 13.756, lng: 100.502, name: 'Thailand', region: 'Southeast Asia' },
  'philippines':    { iso2: 'PH', lat: 14.600, lng: 120.984, name: 'Philippines', region: 'Southeast Asia' },
  'malaysia':       { iso2: 'MY', lat: 3.140, lng: 101.694, name: 'Malaysia', region: 'Southeast Asia' },
  'singapore':      { iso2: 'SG', lat: 1.352, lng: 103.820, name: 'Singapore', region: 'Southeast Asia' },
  'myanmar':        { iso2: 'MM', lat: 19.764, lng: 96.158, name: 'Myanmar', region: 'Southeast Asia' },
  'cambodia':       { iso2: 'KH', lat: 11.557, lng: 104.917, name: 'Cambodia', region: 'Southeast Asia' },
  'australia':      { iso2: 'AU', lat: -35.282, lng: 149.129, name: 'Australia', region: 'Oceania' },
  'new zealand':    { iso2: 'NZ', lat: -41.287, lng: 174.776, name: 'New Zealand', region: 'Oceania' },
};

// ---- Institution → Location Mapping ---------------------------------------

const INSTITUTIONS = {
  'federal reserve':  { lat: 38.893, lng: -77.046, country: 'US', name: 'Federal Reserve', city: 'Washington, DC' },
  'the fed':          { lat: 38.893, lng: -77.046, country: 'US', name: 'Federal Reserve', city: 'Washington, DC' },
  'fomc':             { lat: 38.893, lng: -77.046, country: 'US', name: 'Federal Reserve', city: 'Washington, DC' },
  'ecb':              { lat: 50.110, lng: 8.682, country: 'DE', name: 'ECB', city: 'Frankfurt' },
  'european central bank': { lat: 50.110, lng: 8.682, country: 'DE', name: 'ECB', city: 'Frankfurt' },
  'bank of england':  { lat: 51.514, lng: -0.089, country: 'GB', name: 'Bank of England', city: 'London' },
  'boe':              { lat: 51.514, lng: -0.089, country: 'GB', name: 'Bank of England', city: 'London' },
  'bank of japan':    { lat: 35.685, lng: 139.768, country: 'JP', name: 'Bank of Japan', city: 'Tokyo' },
  'boj':              { lat: 35.685, lng: 139.768, country: 'JP', name: 'Bank of Japan', city: 'Tokyo' },
  'pboc':             { lat: 39.930, lng: 116.357, country: 'CN', name: 'PBOC', city: 'Beijing' },
  'imf':              { lat: 38.899, lng: -77.043, country: 'US', name: 'IMF', city: 'Washington, DC' },
  'world bank':       { lat: 38.900, lng: -77.042, country: 'US', name: 'World Bank', city: 'Washington, DC' },
  'oecd':             { lat: 48.862, lng: 2.272, country: 'FR', name: 'OECD', city: 'Paris' },
  'wto':              { lat: 46.227, lng: 6.141, country: 'CH', name: 'WTO', city: 'Geneva' },
  'united nations':   { lat: 40.749, lng: -73.968, country: 'US', name: 'United Nations', city: 'New York' },
  'un':               { lat: 40.749, lng: -73.968, country: 'US', name: 'United Nations', city: 'New York' },
  'nato':             { lat: 50.878, lng: 4.425, country: 'BE', name: 'NATO', city: 'Brussels' },
  'european union':   { lat: 50.843, lng: 4.383, country: 'BE', name: 'European Union', city: 'Brussels' },
  'eu':               { lat: 50.843, lng: 4.383, country: 'BE', name: 'European Union', city: 'Brussels' },
  'opec':             { lat: 48.211, lng: 16.372, country: 'AT', name: 'OPEC', city: 'Vienna' },
  'opec+':            { lat: 48.211, lng: 16.372, country: 'AT', name: 'OPEC+', city: 'Vienna' },
  'g7':               { lat: 48.857, lng: 2.352, country: 'FR', name: 'G7', city: 'Rotating' },
  'g20':              { lat: 48.857, lng: 2.352, country: 'FR', name: 'G20', city: 'Rotating' },
  'ofac':             { lat: 38.897, lng: -77.030, country: 'US', name: 'OFAC', city: 'Washington, DC' },
  'rbi':              { lat: 18.931, lng: 72.833, country: 'IN', name: 'RBI', city: 'Mumbai' },
  'reserve bank of india': { lat: 18.931, lng: 72.833, country: 'IN', name: 'RBI', city: 'Mumbai' },
};

// ---- Strategic Waterways / Chokepoints ------------------------------------

const WATERWAYS = {
  'strait of hormuz':   { lat: 26.56, lng: 56.25, name: 'Strait of Hormuz' },
  'hormuz':             { lat: 26.56, lng: 56.25, name: 'Strait of Hormuz' },
  'suez canal':         { lat: 30.46, lng: 32.35, name: 'Suez Canal' },
  'suez':               { lat: 30.46, lng: 32.35, name: 'Suez Canal' },
  'panama canal':       { lat: 9.08, lng: -79.68, name: 'Panama Canal' },
  'malacca strait':     { lat: 2.50, lng: 101.80, name: 'Strait of Malacca' },
  'malacca':            { lat: 2.50, lng: 101.80, name: 'Strait of Malacca' },
  'bab el-mandeb':      { lat: 12.58, lng: 43.33, name: 'Bab el-Mandeb' },
  'bab al-mandab':      { lat: 12.58, lng: 43.33, name: 'Bab el-Mandeb' },
  'bosporus':           { lat: 41.12, lng: 29.05, name: 'Bosporus Strait' },
  'dardanelles':        { lat: 40.21, lng: 26.40, name: 'Dardanelles' },
  'taiwan strait':      { lat: 24.00, lng: 119.50, name: 'Taiwan Strait' },
  'cape of good hope':  { lat: -34.36, lng: 18.47, name: 'Cape of Good Hope' },
  'danish straits':     { lat: 55.70, lng: 12.60, name: 'Danish Straits' },
  'red sea':            { lat: 20.00, lng: 38.00, name: 'Red Sea' },
  'south china sea':    { lat: 12.00, lng: 114.00, name: 'South China Sea' },
  'black sea':          { lat: 43.00, lng: 35.00, name: 'Black Sea' },
  'arctic':             { lat: 78.00, lng: 15.00, name: 'Arctic' },
  'northern sea route': { lat: 72.00, lng: 120.00, name: 'Northern Sea Route' },
};

// ---- Cities (for specific event locations) --------------------------------

const CITIES = {
  'washington':     { lat: 38.895, lng: -77.036, country: 'US' },
  'new york':       { lat: 40.713, lng: -74.006, country: 'US' },
  'london':         { lat: 51.507, lng: -0.128, country: 'GB' },
  'beijing':        { lat: 39.904, lng: 116.407, country: 'CN' },
  'tokyo':          { lat: 35.682, lng: 139.759, country: 'JP' },
  'brussels':       { lat: 50.850, lng: 4.352, country: 'BE' },
  'frankfurt':      { lat: 50.110, lng: 8.682, country: 'DE' },
  'davos':          { lat: 46.800, lng: 9.836, country: 'CH' },
  'geneva':         { lat: 46.204, lng: 6.144, country: 'CH' },
  'hong kong':      { lat: 22.320, lng: 114.170, country: 'HK' },
  'shanghai':       { lat: 31.230, lng: 121.474, country: 'CN' },
  'mumbai':         { lat: 19.076, lng: 72.878, country: 'IN' },
  'dubai':          { lat: 25.205, lng: 55.270, country: 'AE' },
  'riyadh':         { lat: 24.714, lng: 46.675, country: 'SA' },
  'moscow':         { lat: 55.756, lng: 37.617, country: 'RU' },
  'kyiv':           { lat: 50.450, lng: 30.524, country: 'UA' },
  'taipei':         { lat: 25.033, lng: 121.565, country: 'TW' },
  'singapore':      { lat: 1.352, lng: 103.820, country: 'SG' },
  'sydney':         { lat: -33.869, lng: 151.209, country: 'AU' },
};

// ---- Geolocation Engine ---------------------------------------------------

/**
 * Resolve geographic location for a text (headline + summary).
 * Returns: { coordinates, primaryCountry, primaryRegion, secondaryCountries,
 *            secondaryRegions, crossRegionFlag, locationConfidence }
 *
 * Resolution hierarchy:
 * 1. Waterway / chokepoint (if shipping/pipeline/route event)
 * 2. Institution (if official body mentioned)
 * 3. City (if specific city mentioned)
 * 4. Country (most common)
 * 5. null coordinates if nothing found (honest — no faking)
 */
export function geolocateEvent(text, sourceName = '') {
  const lower = (text + ' ' + sourceName).toLowerCase();

  const result = {
    coordinates: null,
    primaryCountry: '',
    secondaryCountries: [],
    primaryRegion: '',
    secondaryRegions: [],
    crossRegionFlag: false,
    locationConfidence: LOCATION_CONFIDENCE.ESTIMATED,
  };

  // Collect all matched entities
  const matchedCountries = [];
  const matchedRegions = new Set();

  // 1. Check waterways / chokepoints first
  const sortedWaterways = Object.entries(WATERWAYS)
    .sort((a, b) => b[0].length - a[0].length);
  for (const [key, data] of sortedWaterways) {
    if (lower.includes(key)) {
      result.coordinates = { lat: data.lat, lng: data.lng };
      result.primaryRegion = 'Global Maritime / Strategic Waterways';
      result.locationConfidence = LOCATION_CONFIDENCE.EXACT;
      // Still scan for countries to set secondary geography
      break;
    }
  }

  // 2. Check institutions
  if (!result.coordinates) {
    const sortedInstitutions = Object.entries(INSTITUTIONS)
      .sort((a, b) => b[0].length - a[0].length);
    for (const [key, data] of sortedInstitutions) {
      const pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(lower)) {
        result.coordinates = { lat: data.lat, lng: data.lng };
        result.locationConfidence = LOCATION_CONFIDENCE.CITY;
        // Don't break — continue scanning for countries
        break;
      }
    }
  }

  // 3. Scan for all countries mentioned
  const sortedCountries = Object.entries(COUNTRIES)
    .sort((a, b) => b[0].length - a[0].length);
  const seenISO = new Set();
  for (const [key, data] of sortedCountries) {
    const pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower) && !seenISO.has(data.iso2)) {
      seenISO.add(data.iso2);
      matchedCountries.push(data);
      matchedRegions.add(data.region);
    }
  }

  // 4. Check cities if no coordinates yet
  if (!result.coordinates) {
    const sortedCities = Object.entries(CITIES)
      .sort((a, b) => b[0].length - a[0].length);
    for (const [key, data] of sortedCities) {
      const pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(lower)) {
        result.coordinates = { lat: data.lat, lng: data.lng };
        result.locationConfidence = LOCATION_CONFIDENCE.CITY;
        break;
      }
    }
  }

  // 5. Set coordinates from first matched country if still null
  if (!result.coordinates && matchedCountries.length > 0) {
    const primary = matchedCountries[0];
    result.coordinates = { lat: primary.lat, lng: primary.lng };
    result.locationConfidence = LOCATION_CONFIDENCE.COUNTRY;
  }

  // 6. Set primary/secondary geography
  if (matchedCountries.length > 0) {
    result.primaryCountry = matchedCountries[0].iso2;
    result.secondaryCountries = matchedCountries.slice(1).map(c => c.iso2);
  }

  const regionList = [...matchedRegions];
  if (regionList.length > 0) {
    // If waterway was primary, keep it; otherwise use first country's region
    if (!result.primaryRegion) {
      result.primaryRegion = regionList[0];
    }
    result.secondaryRegions = regionList.filter(r => r !== result.primaryRegion);
    result.crossRegionFlag = regionList.length > 1;
  }

  return result;
}

// ---- Detect region from source config if geolocation found nothing --------

export function inferRegionFromSource(sourceFeed) {
  return sourceFeed?.region || '';
}
