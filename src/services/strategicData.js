// ---------------------------------------------------------------------------
// strategicData.js — Strategic layer data for the map
// GeoJSON-ready data for waterways, chokepoints, and known infrastructure.
// Layers that cannot be reliably sourced are flagged as "dataset required".
// ---------------------------------------------------------------------------

// ---- Strategic Waterways (sourced: publicly known coordinates) ------------

export const STRATEGIC_WATERWAYS = [
  { name: 'Strait of Hormuz', lat: 26.56, lng: 56.25, type: 'chokepoint', note: '~21% of global oil transit' },
  { name: 'Suez Canal', lat: 30.46, lng: 32.35, type: 'canal', note: '~12% of global trade' },
  { name: 'Panama Canal', lat: 9.08, lng: -79.68, type: 'canal', note: '~5% of global trade' },
  { name: 'Strait of Malacca', lat: 2.50, lng: 101.80, type: 'chokepoint', note: '~25% of global trade' },
  { name: 'Bab el-Mandeb', lat: 12.58, lng: 43.33, type: 'chokepoint', note: 'Red Sea gateway, ~10% of global trade' },
  { name: 'Bosporus Strait', lat: 41.12, lng: 29.05, type: 'chokepoint', note: 'Black Sea access' },
  { name: 'Dardanelles', lat: 40.21, lng: 26.40, type: 'chokepoint', note: 'Aegean-Marmara link' },
  { name: 'Taiwan Strait', lat: 24.00, lng: 119.50, type: 'chokepoint', note: 'Critical semiconductor shipping route' },
  { name: 'Cape of Good Hope', lat: -34.36, lng: 18.47, type: 'route', note: 'Alternative to Suez' },
  { name: 'Danish Straits', lat: 55.70, lng: 12.60, type: 'chokepoint', note: 'Baltic Sea access' },
  { name: 'Strait of Gibraltar', lat: 35.97, lng: -5.35, type: 'chokepoint', note: 'Mediterranean-Atlantic gateway' },
  { name: 'Lombok Strait', lat: -8.47, lng: 115.72, type: 'chokepoint', note: 'Alternative to Malacca' },
  { name: 'Northern Sea Route (entry)', lat: 72.00, lng: 40.00, type: 'route', note: 'Arctic shipping route — seasonal' },
];

// ---- Major Ports (sourced: publicly known) --------------------------------

export const MAJOR_PORTS = [
  { name: 'Shanghai', lat: 31.23, lng: 121.47, country: 'CN', throughput: '#1 globally' },
  { name: 'Singapore', lat: 1.26, lng: 103.83, country: 'SG', throughput: '#2 globally' },
  { name: 'Ningbo-Zhoushan', lat: 29.87, lng: 121.88, country: 'CN', throughput: '#3 globally' },
  { name: 'Shenzhen', lat: 22.54, lng: 114.05, country: 'CN', throughput: 'Major container port' },
  { name: 'Guangzhou', lat: 23.08, lng: 113.32, country: 'CN', throughput: 'Major container port' },
  { name: 'Busan', lat: 35.10, lng: 129.04, country: 'KR', throughput: 'East Asia hub' },
  { name: 'Rotterdam', lat: 51.95, lng: 4.13, country: 'NL', throughput: 'Europe #1' },
  { name: 'Antwerp', lat: 51.30, lng: 4.28, country: 'BE', throughput: 'Europe #2' },
  { name: 'Hamburg', lat: 53.53, lng: 9.97, country: 'DE', throughput: 'Northern Europe hub' },
  { name: 'Los Angeles', lat: 33.74, lng: -118.27, country: 'US', throughput: 'Americas #1' },
  { name: 'Long Beach', lat: 33.75, lng: -118.19, country: 'US', throughput: 'Americas #2' },
  { name: 'Dubai / Jebel Ali', lat: 25.02, lng: 55.06, country: 'AE', throughput: 'Middle East #1' },
  { name: 'Port Said', lat: 31.26, lng: 32.30, country: 'EG', throughput: 'Suez Canal gateway' },
  { name: 'Mumbai / Nhava Sheva', lat: 18.95, lng: 72.95, country: 'IN', throughput: 'India #1' },
  { name: 'Tanjung Pelepas', lat: 1.37, lng: 103.55, country: 'MY', throughput: 'Malacca hub' },
  { name: 'Piraeus', lat: 37.94, lng: 23.63, country: 'GR', throughput: 'Mediterranean hub' },
  { name: 'Santos', lat: -23.95, lng: -46.30, country: 'BR', throughput: 'South America #1' },
  { name: 'Durban', lat: -29.87, lng: 31.05, country: 'ZA', throughput: 'Sub-Saharan Africa #1' },
];

// ---- Layers That Require External Datasets --------------------------------

export const DATASET_REQUIRED_LAYERS = [
  {
    layer: 'Pipeline Routes',
    description: 'Major oil and gas pipeline geometry (Nord Stream, TurkStream, Keystone, TAPI, etc.)',
    status: 'dataset_required',
    candidateSources: ['Global Energy Monitor', 'OpenStreetMap', 'Manual GeoJSON curation'],
  },
  {
    layer: 'Undersea Cables',
    description: 'Submarine telecommunications cable routes',
    status: 'dataset_required',
    candidateSources: ['TeleGeography submarinecablemap.com (free GeoJSON available)'],
  },
  {
    layer: 'Military Bases',
    description: 'Major military installations worldwide',
    status: 'dataset_required',
    candidateSources: ['SIPRI', 'Public OSINT databases', 'Manual curation from open sources'],
  },
  {
    layer: 'Nuclear Sites',
    description: 'Nuclear reactors and enrichment facilities',
    status: 'dataset_required',
    candidateSources: ['IAEA PRIS database (public)'],
  },
  {
    layer: 'AI Data Centers / Semiconductor Hubs',
    description: 'Major AI compute facilities and semiconductor fabrication plants',
    status: 'dataset_required',
    candidateSources: ['Manual curation required — no single open dataset'],
  },
  {
    layer: 'Water Stress Index',
    description: 'Country and regional water stress scores',
    status: 'dataset_required',
    candidateSources: ['WRI Aqueduct (free API available)'],
  },
  {
    layer: 'Energy Dependency',
    description: 'Country-level energy import/export ratios',
    status: 'dataset_required',
    candidateSources: ['IEA', 'World Bank Open Data', 'Our World in Data'],
  },
  {
    layer: 'Trade Dependency',
    description: 'Bilateral trade matrices and trade openness',
    status: 'dataset_required',
    candidateSources: ['UN COMTRADE', 'World Bank WITS'],
  },
  {
    layer: 'Commodity Exposure',
    description: 'Country commodity production and export profiles',
    status: 'dataset_required',
    candidateSources: ['World Bank', 'UNCTAD'],
  },
  {
    layer: 'Sanctions Exposure',
    description: 'Active sanctions lists and affected entities',
    status: 'dataset_required',
    candidateSources: ['OFAC SDN List', 'EU Sanctions Registry'],
  },
  {
    layer: 'Shipping Route Geometry',
    description: 'Major maritime trade route polylines',
    status: 'dataset_required',
    candidateSources: ['MarineTraffic', 'Manual GeoJSON curation'],
  },
];

// ---- Helper: get all available map layers ---------------------------------

export function getMapLayers() {
  return {
    live: [
      { id: 'events', name: 'News Events', available: true },
      { id: 'major', name: 'Major Events', available: true },
      { id: 'official', name: 'Official Statements', available: true },
      { id: 'market', name: 'Market-Linked Events', available: true },
      { id: 'conflict', name: 'Conflict Hotspots', available: true },
    ],
    strategic: [
      { id: 'waterways', name: 'Strategic Waterways', available: true, count: STRATEGIC_WATERWAYS.length },
      { id: 'ports', name: 'Major Ports', available: true, count: MAJOR_PORTS.length },
      { id: 'pipelines', name: 'Pipelines', available: false, reason: 'Dataset required' },
      { id: 'cables', name: 'Undersea Cables', available: false, reason: 'Dataset required' },
      { id: 'military', name: 'Military Bases', available: false, reason: 'Dataset required' },
      { id: 'nuclear', name: 'Nuclear Sites', available: false, reason: 'Dataset required' },
      { id: 'ai_semiconductor', name: 'AI / Semiconductor Hubs', available: false, reason: 'Dataset required' },
    ],
    risk: [
      { id: 'water_stress', name: 'Water Stress', available: false, reason: 'Dataset required' },
      { id: 'energy_dep', name: 'Energy Dependency', available: false, reason: 'Dataset required' },
      { id: 'trade_dep', name: 'Trade Dependency', available: false, reason: 'Dataset required' },
      { id: 'commodity_exp', name: 'Commodity Exposure', available: false, reason: 'Dataset required' },
      { id: 'sanctions_exp', name: 'Sanctions Exposure', available: false, reason: 'Dataset required' },
      { id: 'shipping_exp', name: 'Shipping Exposure', available: false, reason: 'Dataset required' },
    ],
  };
}
