// ---------------------------------------------------------------------------
// contextEngine.js — Country-level context data for event enrichment
// Attaches structured context (water stress, energy dependency, trade openness,
// sanctions exposure) to events based on their primary country.
// All data from public sources with clear attribution.
// ---------------------------------------------------------------------------

// ---- Country Context Database -----------------------------------------------
// Static dataset from World Bank, WRI Aqueduct, UNCTAD, OFAC (2023-2024 data)

const COUNTRY_CONTEXT = {
  'United States': {
    waterStress: { value: 'Low-Medium', score: 1.8, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Net exporter (oil/gas)', importRatio: 0.08, source: 'EIA 2023' },
    tradeOpenness: { value: '27%', ratio: 0.27, source: 'World Bank 2023' },
    gdpGrowth: { value: '2.5%', source: 'BEA 2024' },
    debtToGdp: { value: '123%', source: 'CBO 2024' },
    sanctionsExposure: { value: 'Issuer (OFAC)', source: 'US Treasury' },
  },
  'China': {
    waterStress: { value: 'High', score: 3.4, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Net importer (70% oil)', importRatio: 0.70, source: 'IEA 2023' },
    tradeOpenness: { value: '38%', ratio: 0.38, source: 'World Bank 2023' },
    gdpGrowth: { value: '5.2%', source: 'NBS China 2024' },
    debtToGdp: { value: '83%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Targeted (tech/military)', source: 'OFAC/EU' },
  },
  'Japan': {
    waterStress: { value: 'Low', score: 1.2, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'High importer (88% energy)', importRatio: 0.88, source: 'IEA 2023' },
    tradeOpenness: { value: '47%', ratio: 0.47, source: 'World Bank 2023' },
    gdpGrowth: { value: '1.9%', source: 'Cabinet Office 2024' },
    debtToGdp: { value: '255%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low', source: 'MOFA Japan' },
  },
  'Germany': {
    waterStress: { value: 'Low-Medium', score: 1.6, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'High importer (63% energy)', importRatio: 0.63, source: 'Eurostat 2023' },
    tradeOpenness: { value: '95%', ratio: 0.95, source: 'World Bank 2023' },
    gdpGrowth: { value: '-0.3%', source: 'Destatis 2024' },
    debtToGdp: { value: '64%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low (EU sanctions issuer)', source: 'EU Council' },
  },
  'United Kingdom': {
    waterStress: { value: 'Medium', score: 2.1, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Net importer (36% energy)', importRatio: 0.36, source: 'DESNZ 2023' },
    tradeOpenness: { value: '67%', ratio: 0.67, source: 'World Bank 2023' },
    gdpGrowth: { value: '0.1%', source: 'ONS 2024' },
    debtToGdp: { value: '101%', source: 'OBR 2024' },
    sanctionsExposure: { value: 'Low (sanctions issuer)', source: 'FCDO' },
  },
  'India': {
    waterStress: { value: 'Extremely High', score: 4.3, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'High importer (85% oil)', importRatio: 0.85, source: 'IEA 2023' },
    tradeOpenness: { value: '49%', ratio: 0.49, source: 'World Bank 2023' },
    gdpGrowth: { value: '8.2%', source: 'MoSPI 2024' },
    debtToGdp: { value: '83%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low', source: 'MEA India' },
  },
  'Russia': {
    waterStress: { value: 'Low', score: 0.9, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Major exporter (oil/gas)', importRatio: -0.5, source: 'IEA 2023' },
    tradeOpenness: { value: '46%', ratio: 0.46, source: 'World Bank 2023' },
    gdpGrowth: { value: '3.6%', source: 'Rosstat 2024' },
    debtToGdp: { value: '22%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Severe (comprehensive)', source: 'OFAC/EU/UK' },
  },
  'Brazil': {
    waterStress: { value: 'Low-Medium', score: 1.5, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Net exporter (pre-salt oil)', importRatio: -0.1, source: 'ANP 2023' },
    tradeOpenness: { value: '39%', ratio: 0.39, source: 'World Bank 2023' },
    gdpGrowth: { value: '2.9%', source: 'IBGE 2024' },
    debtToGdp: { value: '87%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low', source: 'Itamaraty' },
  },
  'Turkey': {
    waterStress: { value: 'High', score: 3.2, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'High importer (75% energy)', importRatio: 0.75, source: 'IEA 2023' },
    tradeOpenness: { value: '72%', ratio: 0.72, source: 'World Bank 2023' },
    gdpGrowth: { value: '4.5%', source: 'TurkStat 2024' },
    debtToGdp: { value: '35%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Moderate (CAATSA risk)', source: 'OFAC' },
  },
  'Nigeria': {
    waterStress: { value: 'High', score: 3.0, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Net exporter (oil)', importRatio: -0.3, source: 'NNPC 2023' },
    tradeOpenness: { value: '28%', ratio: 0.28, source: 'World Bank 2023' },
    gdpGrowth: { value: '2.7%', source: 'NBS Nigeria 2024' },
    debtToGdp: { value: '38%', source: 'DMO Nigeria 2024' },
    sanctionsExposure: { value: 'Low', source: 'CBN' },
  },
  'France': {
    waterStress: { value: 'Medium', score: 2.4, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Nuclear-powered (70%), imports gas', importRatio: 0.44, source: 'RTE 2023' },
    tradeOpenness: { value: '73%', ratio: 0.73, source: 'World Bank 2023' },
    gdpGrowth: { value: '0.7%', source: 'INSEE 2024' },
    debtToGdp: { value: '112%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low (EU sanctions issuer)', source: 'EU Council' },
  },
  'Iran': {
    waterStress: { value: 'Extremely High', score: 4.7, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Major exporter (oil/gas)', importRatio: -0.6, source: 'OPEC 2023' },
    tradeOpenness: { value: '42%', ratio: 0.42, source: 'World Bank 2022' },
    gdpGrowth: { value: '5.4%', source: 'CBI Iran 2024' },
    debtToGdp: { value: '32%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Severe (comprehensive)', source: 'OFAC/EU/UK' },
  },
  'Vietnam': {
    waterStress: { value: 'Medium', score: 2.0, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Transitioning to importer', importRatio: 0.15, source: 'IEA 2023' },
    tradeOpenness: { value: '186%', ratio: 1.86, source: 'World Bank 2023' },
    gdpGrowth: { value: '6.5%', source: 'GSO Vietnam 2024' },
    debtToGdp: { value: '37%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low', source: 'MOFA Vietnam' },
  },
  'South Korea': {
    waterStress: { value: 'Medium-High', score: 2.6, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'High importer (92% energy)', importRatio: 0.92, source: 'KEEI 2023' },
    tradeOpenness: { value: '97%', ratio: 0.97, source: 'World Bank 2023' },
    gdpGrowth: { value: '2.2%', source: 'Bank of Korea 2024' },
    debtToGdp: { value: '54%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low', source: 'MOFA Korea' },
  },
  'Saudi Arabia': {
    waterStress: { value: 'Extremely High', score: 5.0, source: 'WRI Aqueduct 2023' },
    energyDependency: { value: 'Major exporter (#1 oil)', importRatio: -0.8, source: 'OPEC 2023' },
    tradeOpenness: { value: '68%', ratio: 0.68, source: 'World Bank 2023' },
    gdpGrowth: { value: '-0.8%', source: 'GASTAT 2024' },
    debtToGdp: { value: '26%', source: 'IMF 2024' },
    sanctionsExposure: { value: 'Low', source: 'SAMA' },
  },
};

// ---- Context Attachment ---------------------------------------------------

/**
 * Get structured context data for an event's primary country.
 * Returns null if country not found or no context available.
 */
export function getCountryContext(countryName) {
  if (!countryName) return null;
  return COUNTRY_CONTEXT[countryName] || null;
}

/**
 * Attach context data to an event during ingestion.
 * Modifies the event in place, adding a `countryContext` field.
 */
export function attachContext(event) {
  if (!event.primaryCountry) return event;
  const context = getCountryContext(event.primaryCountry);
  if (context) {
    event.countryContext = context;
  }
  return event;
}

/**
 * Get list of countries with context data available.
 */
export function getAvailableCountries() {
  return Object.keys(COUNTRY_CONTEXT).sort();
}

/**
 * Get all context data for browsing (Data Explorer).
 */
export function getAllContextData() {
  return Object.entries(COUNTRY_CONTEXT).map(([country, data]) => ({
    country,
    ...data,
  }));
}

/**
 * Search context data by country name.
 */
export function searchContextData(query) {
  if (!query) return getAllContextData();
  const q = query.toLowerCase();
  return getAllContextData().filter(d =>
    d.country.toLowerCase().includes(q)
  );
}
