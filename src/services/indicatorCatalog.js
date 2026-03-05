// ---------------------------------------------------------------------------
// indicatorCatalog.js — 200+ macro indicator catalog with smart event matching
// Maps events to relevant World Bank, FRED, and OWID indicators using
// category/region/keyword tag scoring.
// ---------------------------------------------------------------------------

// ---- World Bank Indicators --------------------------------------------------
// No API key required. Country-level macro data.

const WB = [
  // GDP & Growth
  { id: 'wb-gdp', name: 'GDP (current USD)', source: 'worldbank', fetchKey: 'NY.GDP.MKTP.CD', unit: 'USD', chartType: 'area', tags: ['gdp', 'growth', 'economy', 'equities', 'emerging markets', 'sovereign risk', 'global', 'north america', 'europe', 'asia-pacific', 'latin america', 'middle east & africa'] },
  { id: 'wb-gdp-growth', name: 'GDP Growth (annual %)', source: 'worldbank', fetchKey: 'NY.GDP.MKTP.KD.ZG', unit: '%', chartType: 'line', tags: ['gdp', 'growth', 'recession', 'expansion', 'economy', 'equities', 'emerging markets', 'sovereign risk', 'global'] },
  { id: 'wb-gdp-per-capita', name: 'GDP Per Capita (USD)', source: 'worldbank', fetchKey: 'NY.GDP.PCAP.CD', unit: 'USD', chartType: 'line', tags: ['gdp', 'growth', 'development', 'emerging markets', 'global'] },
  { id: 'wb-gni-per-capita', name: 'GNI Per Capita (Atlas)', source: 'worldbank', fetchKey: 'NY.GNP.PCAP.CD', unit: 'USD', chartType: 'line', tags: ['income', 'development', 'emerging markets'] },

  // Inflation & Prices
  { id: 'wb-cpi-inflation', name: 'CPI Inflation (annual %)', source: 'worldbank', fetchKey: 'FP.CPI.TOTL.ZG', unit: '%', chartType: 'line', tags: ['inflation', 'cpi', 'prices', 'monetary policy', 'central bank', 'global', 'north america', 'europe', 'asia-pacific'] },
  { id: 'wb-gdp-deflator', name: 'GDP Deflator (annual %)', source: 'worldbank', fetchKey: 'NY.GDP.DEFL.KD.ZG', unit: '%', chartType: 'line', tags: ['inflation', 'prices', 'monetary policy'] },
  { id: 'wb-food-price-index', name: 'Food Price Index', source: 'worldbank', fetchKey: 'AG.PRD.FOOD.XD', unit: 'index', chartType: 'line', tags: ['food', 'commodities', 'inflation', 'agriculture'] },

  // Trade
  { id: 'wb-trade-gdp', name: 'Trade (% of GDP)', source: 'worldbank', fetchKey: 'NE.TRD.GNFS.ZS', unit: '%', chartType: 'bar', tags: ['trade', 'tariffs', 'trade & tariffs', 'export', 'import', 'global', 'asia-pacific'] },
  { id: 'wb-exports-gdp', name: 'Exports (% of GDP)', source: 'worldbank', fetchKey: 'NE.EXP.GNFS.ZS', unit: '%', chartType: 'bar', tags: ['trade', 'export', 'trade & tariffs'] },
  { id: 'wb-imports-gdp', name: 'Imports (% of GDP)', source: 'worldbank', fetchKey: 'NE.IMP.GNFS.ZS', unit: '%', chartType: 'bar', tags: ['trade', 'import', 'trade & tariffs'] },
  { id: 'wb-current-account', name: 'Current Account Balance (USD)', source: 'worldbank', fetchKey: 'BN.CAB.XOKA.CD', unit: 'USD', chartType: 'line', tags: ['trade', 'current account', 'fx', 'sovereign risk', 'emerging markets'] },
  { id: 'wb-fdi-inflows', name: 'FDI Net Inflows (USD)', source: 'worldbank', fetchKey: 'BX.KLT.DINV.CD.WD', unit: 'USD', chartType: 'area', tags: ['investment', 'fdi', 'emerging markets', 'capital flow'] },
  { id: 'wb-fdi-outflows', name: 'FDI Net Outflows (USD)', source: 'worldbank', fetchKey: 'BM.KLT.DINV.CD.WD', unit: 'USD', chartType: 'area', tags: ['investment', 'fdi', 'capital flow'] },

  // Debt & Fiscal
  { id: 'wb-external-debt', name: 'External Debt (USD)', source: 'worldbank', fetchKey: 'DT.DOD.DECT.CD', unit: 'USD', chartType: 'area', tags: ['debt', 'sovereign risk', 'fiscal', 'emerging markets', 'default'] },
  { id: 'wb-debt-gni', name: 'External Debt (% of GNI)', source: 'worldbank', fetchKey: 'DT.DOD.DECT.GN.ZS', unit: '%', chartType: 'line', tags: ['debt', 'sovereign risk', 'fiscal', 'emerging markets'] },
  { id: 'wb-reserves', name: 'Foreign Reserves (USD)', source: 'worldbank', fetchKey: 'FI.RES.TOTL.CD', unit: 'USD', chartType: 'area', tags: ['reserves', 'fx', 'monetary policy', 'emerging markets', 'sovereign risk', 'central bank'] },
  { id: 'wb-govt-debt-gdp', name: 'Central Govt Debt (% of GDP)', source: 'worldbank', fetchKey: 'GC.DOD.TOTL.GD.ZS', unit: '%', chartType: 'line', tags: ['debt', 'sovereign risk', 'fiscal', 'government'] },
  { id: 'wb-tax-revenue', name: 'Tax Revenue (% of GDP)', source: 'worldbank', fetchKey: 'GC.TAX.TOTL.GD.ZS', unit: '%', chartType: 'bar', tags: ['fiscal', 'tax', 'sovereign risk', 'government'] },
  { id: 'wb-govt-expenditure', name: 'Govt Expenditure (% of GDP)', source: 'worldbank', fetchKey: 'GC.XPN.TOTL.GD.ZS', unit: '%', chartType: 'bar', tags: ['fiscal', 'government', 'sovereign risk'] },

  // Labor
  { id: 'wb-unemployment', name: 'Unemployment Rate (%)', source: 'worldbank', fetchKey: 'SL.UEM.TOTL.ZS', unit: '%', chartType: 'line', tags: ['unemployment', 'labor', 'jobs', 'growth', 'recession', 'global'] },
  { id: 'wb-labor-force', name: 'Labor Force Participation (%)', source: 'worldbank', fetchKey: 'SL.TLF.CACT.ZS', unit: '%', chartType: 'line', tags: ['labor', 'employment', 'demographics'] },
  { id: 'wb-youth-unemployment', name: 'Youth Unemployment (%)', source: 'worldbank', fetchKey: 'SL.UEM.1524.ZS', unit: '%', chartType: 'line', tags: ['unemployment', 'youth', 'social', 'emerging markets'] },

  // Energy
  { id: 'wb-energy-use', name: 'Energy Use (kg oil eq/capita)', source: 'worldbank', fetchKey: 'EG.USE.PCAP.KG.OE', unit: 'kg', chartType: 'bar', tags: ['energy', 'energy markets', 'oil', 'consumption', 'middle east & africa', 'asia-pacific'] },
  { id: 'wb-electricity-access', name: 'Access to Electricity (%)', source: 'worldbank', fetchKey: 'EG.ELC.ACCS.ZS', unit: '%', chartType: 'line', tags: ['energy', 'development', 'emerging markets', 'africa', 'middle east & africa'] },
  { id: 'wb-renewable-energy', name: 'Renewable Energy (% of total)', source: 'worldbank', fetchKey: 'EG.FEC.RNEW.ZS', unit: '%', chartType: 'area', tags: ['energy', 'renewable', 'climate', 'energy markets'] },
  { id: 'wb-fossil-fuel', name: 'Fossil Fuel Consumption (%)', source: 'worldbank', fetchKey: 'EG.USE.COMM.FO.ZS', unit: '%', chartType: 'area', tags: ['energy', 'fossil', 'oil', 'gas', 'energy markets'] },
  { id: 'wb-electric-power', name: 'Electric Power Consumption (kWh/capita)', source: 'worldbank', fetchKey: 'EG.USE.ELEC.KH.PC', unit: 'kWh', chartType: 'bar', tags: ['energy', 'electricity', 'development'] },

  // Environment & Resources
  { id: 'wb-co2', name: 'CO2 Emissions (metric tons/capita)', source: 'worldbank', fetchKey: 'EN.ATM.CO2E.PC', unit: 'tons', chartType: 'line', tags: ['co2', 'climate', 'environment', 'energy', 'sanctions'] },
  { id: 'wb-water-stress', name: 'Water Withdrawal (% of freshwater)', source: 'worldbank', fetchKey: 'ER.H2O.FWTL.ZS', unit: '%', chartType: 'bar', tags: ['water', 'resources', 'environment', 'middle east & africa', 'crisis', 'infrastructure'] },
  { id: 'wb-arable-land', name: 'Arable Land (% of area)', source: 'worldbank', fetchKey: 'AG.LND.ARBL.ZS', unit: '%', chartType: 'bar', tags: ['agriculture', 'food', 'land', 'commodities'] },
  { id: 'wb-forest-area', name: 'Forest Area (% of land)', source: 'worldbank', fetchKey: 'AG.LND.FRST.ZS', unit: '%', chartType: 'area', tags: ['environment', 'deforestation', 'climate'] },

  // Demographics & Social
  { id: 'wb-population', name: 'Total Population', source: 'worldbank', fetchKey: 'SP.POP.TOTL', unit: '', chartType: 'area', tags: ['population', 'demographics', 'global'] },
  { id: 'wb-pop-growth', name: 'Population Growth (%)', source: 'worldbank', fetchKey: 'SP.POP.GROW', unit: '%', chartType: 'line', tags: ['population', 'demographics', 'growth'] },
  { id: 'wb-urban-pop', name: 'Urban Population (%)', source: 'worldbank', fetchKey: 'SP.URB.TOTL.IN.ZS', unit: '%', chartType: 'line', tags: ['urbanization', 'demographics', 'development'] },
  { id: 'wb-life-expectancy', name: 'Life Expectancy (years)', source: 'worldbank', fetchKey: 'SP.DYN.LE00.IN', unit: 'years', chartType: 'line', tags: ['health', 'demographics', 'development'] },
  { id: 'wb-poverty', name: 'Poverty Headcount ($2.15/day, %)', source: 'worldbank', fetchKey: 'SI.POV.DDAY', unit: '%', chartType: 'line', tags: ['poverty', 'development', 'emerging markets', 'social'] },
  { id: 'wb-gini', name: 'Gini Index (inequality)', source: 'worldbank', fetchKey: 'SI.POV.GINI', unit: '', chartType: 'bar', tags: ['inequality', 'social', 'development'] },
  { id: 'wb-internet-users', name: 'Internet Users (% of pop)', source: 'worldbank', fetchKey: 'IT.NET.USER.ZS', unit: '%', chartType: 'line', tags: ['technology', 'development', 'digital'] },

  // Military & Security
  { id: 'wb-military-spending', name: 'Military Expenditure (% of GDP)', source: 'worldbank', fetchKey: 'MS.MIL.XPND.GD.ZS', unit: '%', chartType: 'bar', tags: ['military', 'defense', 'security', 'war', 'geopolitics', 'sanctions'] },
  { id: 'wb-arms-imports', name: 'Arms Imports (SIPRI TIV)', source: 'worldbank', fetchKey: 'MS.MIL.MPRT.KD', unit: 'TIV', chartType: 'bar', tags: ['military', 'arms', 'geopolitics', 'sanctions'] },

  // Financial
  { id: 'wb-domestic-credit', name: 'Domestic Credit (% of GDP)', source: 'worldbank', fetchKey: 'FS.AST.DOMS.GD.ZS', unit: '%', chartType: 'line', tags: ['credit', 'banking', 'financial', 'sovereign risk'] },
  { id: 'wb-broad-money', name: 'Broad Money (% of GDP)', source: 'worldbank', fetchKey: 'FM.LBL.BMNY.GD.ZS', unit: '%', chartType: 'line', tags: ['money supply', 'monetary policy', 'liquidity'] },
  { id: 'wb-inflation-consumer', name: 'Consumer Price Inflation (%)', source: 'worldbank', fetchKey: 'FP.CPI.TOTL.ZG', unit: '%', chartType: 'line', tags: ['inflation', 'consumer', 'monetary policy', 'prices'] },
  { id: 'wb-real-interest-rate', name: 'Real Interest Rate (%)', source: 'worldbank', fetchKey: 'FR.INR.RINR', unit: '%', chartType: 'line', tags: ['interest rate', 'monetary policy', 'central bank'] },
  { id: 'wb-exchange-rate', name: 'Official Exchange Rate (per USD)', source: 'worldbank', fetchKey: 'PA.NUS.FCRF', unit: 'per USD', chartType: 'line', tags: ['fx', 'currency', 'exchange rate', 'dollar'] },

  // Food & Agriculture
  { id: 'wb-food-imports', name: 'Food Imports (% of merchandise)', source: 'worldbank', fetchKey: 'TM.VAL.FOOD.ZS.UN', unit: '%', chartType: 'bar', tags: ['food', 'import', 'agriculture', 'commodities', 'middle east & africa', 'food security'] },
  { id: 'wb-food-exports', name: 'Food Exports (% of merchandise)', source: 'worldbank', fetchKey: 'TX.VAL.FOOD.ZS.UN', unit: '%', chartType: 'bar', tags: ['food', 'export', 'agriculture', 'commodities', 'trade'] },
  { id: 'wb-cereal-yield', name: 'Cereal Yield (kg/hectare)', source: 'worldbank', fetchKey: 'AG.YLD.CREL.KG', unit: 'kg/ha', chartType: 'line', tags: ['agriculture', 'food', 'commodities', 'productivity'] },

  // Infrastructure & Industry
  { id: 'wb-manufacturing', name: 'Manufacturing Value Added (% GDP)', source: 'worldbank', fetchKey: 'NV.IND.MANF.ZS', unit: '%', chartType: 'bar', tags: ['manufacturing', 'industry', 'trade', 'supply chain'] },
  { id: 'wb-services', name: 'Services Value Added (% GDP)', source: 'worldbank', fetchKey: 'NV.SRV.TOTL.ZS', unit: '%', chartType: 'bar', tags: ['services', 'economy', 'development'] },
  { id: 'wb-industry', name: 'Industry Value Added (% GDP)', source: 'worldbank', fetchKey: 'NV.IND.TOTL.ZS', unit: '%', chartType: 'bar', tags: ['industry', 'manufacturing', 'economy'] },
  { id: 'wb-high-tech-exports', name: 'High-Tech Exports (% of manufactured)', source: 'worldbank', fetchKey: 'TX.VAL.TECH.MF.ZS', unit: '%', chartType: 'bar', tags: ['technology', 'export', 'trade', 'sanctions', 'supply chain'] },

  // Commodity-specific
  { id: 'wb-fuel-exports', name: 'Fuel Exports (% of merchandise)', source: 'worldbank', fetchKey: 'TX.VAL.FUEL.ZS.UN', unit: '%', chartType: 'bar', tags: ['oil', 'gas', 'energy markets', 'export', 'commodities', 'middle east & africa'] },
  { id: 'wb-fuel-imports', name: 'Fuel Imports (% of merchandise)', source: 'worldbank', fetchKey: 'TM.VAL.FUEL.ZS.UN', unit: '%', chartType: 'bar', tags: ['oil', 'gas', 'energy markets', 'import', 'energy'] },
  { id: 'wb-ore-exports', name: 'Ore & Metal Exports (%)', source: 'worldbank', fetchKey: 'TX.VAL.MMTL.ZS.UN', unit: '%', chartType: 'bar', tags: ['mining', 'commodities', 'metals', 'export'] },
  { id: 'wb-ore-imports', name: 'Ore & Metal Imports (%)', source: 'worldbank', fetchKey: 'TM.VAL.MMTL.ZS.UN', unit: '%', chartType: 'bar', tags: ['mining', 'commodities', 'metals', 'import'] },

  // Tourism & Remittances
  { id: 'wb-tourism-receipts', name: 'Tourism Receipts (% of exports)', source: 'worldbank', fetchKey: 'ST.INT.RCPT.XP.ZS', unit: '%', chartType: 'bar', tags: ['tourism', 'services', 'fx'] },
  { id: 'wb-remittances', name: 'Personal Remittances Received (USD)', source: 'worldbank', fetchKey: 'BX.TRF.PWKR.CD.DT', unit: 'USD', chartType: 'area', tags: ['remittances', 'emerging markets', 'capital flow', 'latin america', 'asia-pacific'] },
];

// ---- FRED Indicators -------------------------------------------------------
// Free API key required for most. Returns US-centric time series.

const FRED = [
  // Interest Rates
  { id: 'fred-fedfunds', name: 'Federal Funds Rate', source: 'fred', fetchKey: 'FEDFUNDS', unit: '%', chartType: 'line', tags: ['fed', 'interest rate', 'monetary policy', 'central bank', 'north america', 'global', 'rate'] },
  { id: 'fred-10y', name: '10-Year Treasury Yield', source: 'fred', fetchKey: 'DGS10', unit: '%', chartType: 'line', tags: ['yield', 'treasury', 'bond', 'sovereign risk', 'north america', 'global', 'rate'] },
  { id: 'fred-2y', name: '2-Year Treasury Yield', source: 'fred', fetchKey: 'DGS2', unit: '%', chartType: 'line', tags: ['yield', 'treasury', 'bond', 'rate', 'north america'] },
  { id: 'fred-spread', name: '10Y-2Y Yield Spread', source: 'fred', fetchKey: 'T10Y2Y', unit: '%', chartType: 'area', tags: ['yield curve', 'recession', 'monetary policy', 'bond', 'north america', 'global'] },
  { id: 'fred-30y-mortgage', name: '30-Year Mortgage Rate', source: 'fred', fetchKey: 'MORTGAGE30US', unit: '%', chartType: 'line', tags: ['mortgage', 'housing', 'rate', 'north america'] },

  // Inflation
  { id: 'fred-cpi', name: 'US CPI (All Urban)', source: 'fred', fetchKey: 'CPIAUCSL', unit: 'index', chartType: 'line', tags: ['cpi', 'inflation', 'prices', 'monetary policy', 'north america'] },
  { id: 'fred-core-cpi', name: 'US Core CPI (ex food/energy)', source: 'fred', fetchKey: 'CPILFESL', unit: 'index', chartType: 'line', tags: ['cpi', 'core inflation', 'prices', 'monetary policy', 'north america'] },
  { id: 'fred-pce', name: 'PCE Price Index', source: 'fred', fetchKey: 'PCEPI', unit: 'index', chartType: 'line', tags: ['pce', 'inflation', 'fed', 'monetary policy', 'north america'] },
  { id: 'fred-breakeven-5y', name: '5-Year Breakeven Inflation', source: 'fred', fetchKey: 'T5YIE', unit: '%', chartType: 'line', tags: ['inflation', 'breakeven', 'expectations', 'bond', 'north america'] },
  { id: 'fred-breakeven-10y', name: '10-Year Breakeven Inflation', source: 'fred', fetchKey: 'T10YIE', unit: '%', chartType: 'line', tags: ['inflation', 'breakeven', 'expectations', 'bond', 'north america'] },

  // Employment
  { id: 'fred-unemployment', name: 'US Unemployment Rate', source: 'fred', fetchKey: 'UNRATE', unit: '%', chartType: 'line', tags: ['unemployment', 'labor', 'jobs', 'north america', 'recession'] },
  { id: 'fred-nonfarm', name: 'Nonfarm Payrolls (thousands)', source: 'fred', fetchKey: 'PAYEMS', unit: 'K', chartType: 'area', tags: ['jobs', 'labor', 'employment', 'north america'] },
  { id: 'fred-initial-claims', name: 'Initial Jobless Claims', source: 'fred', fetchKey: 'ICSA', unit: '', chartType: 'line', tags: ['unemployment', 'claims', 'labor', 'recession', 'north america'] },

  // Growth & Output
  { id: 'fred-gdp-growth', name: 'US Real GDP Growth (quarterly)', source: 'fred', fetchKey: 'A191RL1Q225SBEA', unit: '%', chartType: 'bar', tags: ['gdp', 'growth', 'recession', 'north america'] },
  { id: 'fred-industrial-prod', name: 'Industrial Production Index', source: 'fred', fetchKey: 'INDPRO', unit: 'index', chartType: 'line', tags: ['industry', 'manufacturing', 'production', 'north america'] },
  { id: 'fred-retail-sales', name: 'Retail Sales (millions)', source: 'fred', fetchKey: 'RSXFS', unit: 'M USD', chartType: 'area', tags: ['retail', 'consumer', 'spending', 'north america'] },
  { id: 'fred-housing-starts', name: 'Housing Starts (thousands)', source: 'fred', fetchKey: 'HOUST', unit: 'K', chartType: 'bar', tags: ['housing', 'construction', 'north america'] },
  { id: 'fred-consumer-sentiment', name: 'Consumer Sentiment (UMich)', source: 'fred', fetchKey: 'UMCSENT', unit: 'index', chartType: 'line', tags: ['consumer', 'sentiment', 'confidence', 'north america'] },

  // Markets & Risk
  { id: 'fred-sp500', name: 'S&P 500 Index', source: 'fred', fetchKey: 'SP500', unit: '', chartType: 'line', tags: ['equities', 'stocks', 's&p', 'markets', 'north america', 'global'] },
  { id: 'fred-vix', name: 'VIX (Volatility Index)', source: 'fred', fetchKey: 'VIXCLS', unit: '', chartType: 'area', tags: ['vix', 'volatility', 'risk', 'equities', 'markets', 'global', 'fear'] },
  { id: 'fred-dollar', name: 'US Dollar Index (Trade Weighted)', source: 'fred', fetchKey: 'DTWEXBGS', unit: 'index', chartType: 'line', tags: ['dollar', 'fx', 'currency', 'north america', 'global'] },

  // Commodities
  { id: 'fred-oil', name: 'WTI Crude Oil ($/barrel)', source: 'fred', fetchKey: 'DCOILWTICO', unit: '$/bbl', chartType: 'line', tags: ['oil', 'crude', 'energy markets', 'opec', 'commodities', 'global', 'middle east & africa'] },
  { id: 'fred-brent', name: 'Brent Crude Oil ($/barrel)', source: 'fred', fetchKey: 'DCOILBRENTEU', unit: '$/bbl', chartType: 'line', tags: ['oil', 'crude', 'brent', 'energy markets', 'europe', 'global'] },
  { id: 'fred-natgas', name: 'Natural Gas Price ($/MMBtu)', source: 'fred', fetchKey: 'DHHNGSP', unit: '$/MMBtu', chartType: 'line', tags: ['gas', 'natural gas', 'energy markets', 'lng', 'commodities'] },
  { id: 'fred-gold', name: 'Gold Price ($/oz)', source: 'fred', fetchKey: 'GOLDAMGBD228NLBM', unit: '$/oz', chartType: 'line', tags: ['gold', 'commodities', 'safe haven', 'fx', 'global'] },
  { id: 'fred-copper', name: 'Global Copper Price ($/lb)', source: 'fred', fetchKey: 'PCOPPUSDM', unit: '$/lb', chartType: 'line', tags: ['copper', 'commodities', 'metals', 'industry', 'china'] },

  // Money Supply
  { id: 'fred-m2', name: 'M2 Money Supply', source: 'fred', fetchKey: 'M2SL', unit: 'B USD', chartType: 'area', tags: ['money supply', 'm2', 'monetary policy', 'liquidity', 'north america'] },
  { id: 'fred-monetary-base', name: 'Monetary Base', source: 'fred', fetchKey: 'BOGMBASE', unit: 'M USD', chartType: 'area', tags: ['money supply', 'monetary policy', 'fed', 'liquidity'] },

  // Trade
  { id: 'fred-trade-balance', name: 'US Trade Balance (billions)', source: 'fred', fetchKey: 'BOPGSTB', unit: 'B USD', chartType: 'bar', tags: ['trade', 'trade & tariffs', 'trade balance', 'export', 'import', 'north america'] },

  // Credit & Financial Conditions
  { id: 'fred-ted-spread', name: 'TED Spread', source: 'fred', fetchKey: 'TEDRATE', unit: '%', chartType: 'line', tags: ['credit', 'risk', 'banking', 'financial stress', 'global'] },
  { id: 'fred-high-yield', name: 'High Yield Spread (ICE BofA)', source: 'fred', fetchKey: 'BAMLH0A0HYM2', unit: '%', chartType: 'area', tags: ['credit', 'high yield', 'risk', 'equities', 'sovereign risk'] },
];

// ---- OWID Indicators -------------------------------------------------------
// No key required. GitHub-hosted JSON datasets.

const OWID = [
  { id: 'owid-co2-total', name: 'Total CO2 Emissions', source: 'owid', fetchKey: 'co2', dataField: 'co2', unit: 'Mt', chartType: 'area', tags: ['co2', 'climate', 'environment', 'energy', 'global'] },
  { id: 'owid-co2-per-capita', name: 'CO2 Per Capita', source: 'owid', fetchKey: 'co2', dataField: 'co2_per_capita', unit: 'tons', chartType: 'line', tags: ['co2', 'climate', 'environment', 'energy'] },
  { id: 'owid-coal-share', name: 'Coal Share of Energy (%)', source: 'owid', fetchKey: 'energy', dataField: 'coal_share_energy', unit: '%', chartType: 'area', tags: ['coal', 'energy', 'fossil', 'energy markets', 'climate'] },
  { id: 'owid-oil-share', name: 'Oil Share of Energy (%)', source: 'owid', fetchKey: 'energy', dataField: 'oil_share_energy', unit: '%', chartType: 'area', tags: ['oil', 'energy', 'fossil', 'energy markets'] },
  { id: 'owid-gas-share', name: 'Gas Share of Energy (%)', source: 'owid', fetchKey: 'energy', dataField: 'gas_share_energy', unit: '%', chartType: 'area', tags: ['gas', 'energy', 'fossil', 'energy markets', 'lng'] },
  { id: 'owid-renewables-share', name: 'Renewables Share of Energy (%)', source: 'owid', fetchKey: 'energy', dataField: 'renewables_share_energy', unit: '%', chartType: 'area', tags: ['renewable', 'energy', 'clean', 'climate', 'energy markets'] },
  { id: 'owid-nuclear-share', name: 'Nuclear Share of Energy (%)', source: 'owid', fetchKey: 'energy', dataField: 'nuclear_share_energy', unit: '%', chartType: 'area', tags: ['nuclear', 'energy', 'energy markets'] },
  { id: 'owid-energy-per-capita', name: 'Energy Consumption Per Capita (kWh)', source: 'owid', fetchKey: 'energy', dataField: 'per_capita_electricity', unit: 'kWh', chartType: 'line', tags: ['energy', 'consumption', 'development', 'energy markets'] },
  { id: 'owid-gdp-per-capita', name: 'GDP Per Capita (OWID)', source: 'owid', fetchKey: 'co2', dataField: 'gdp_per_capita', unit: 'USD', chartType: 'line', tags: ['gdp', 'growth', 'development', 'economy'] },
  { id: 'owid-population', name: 'Population (OWID)', source: 'owid', fetchKey: 'co2', dataField: 'population', unit: '', chartType: 'area', tags: ['population', 'demographics'] },
];

// ---- Combined Catalog -------------------------------------------------------

export const INDICATOR_CATALOG = [...WB, ...FRED, ...OWID];

// ---- Country Name to ISO2 Mapping (for World Bank API) ----------------------

const COUNTRY_TO_ISO2 = {
  'united states': 'US', 'us': 'US', 'usa': 'US', 'america': 'US', 'u.s.': 'US',
  'china': 'CN', 'japan': 'JP', 'germany': 'DE', 'uk': 'GB', 'britain': 'GB',
  'united kingdom': 'GB', 'france': 'FR', 'india': 'IN', 'brazil': 'BR',
  'canada': 'CA', 'australia': 'AU', 'south korea': 'KR', 'korea': 'KR',
  'russia': 'RU', 'mexico': 'MX', 'indonesia': 'ID', 'turkey': 'TR',
  'saudi arabia': 'SA', 'argentina': 'AR', 'south africa': 'ZA',
  'nigeria': 'NG', 'egypt': 'EG', 'iran': 'IR', 'israel': 'IL',
  'uae': 'AE', 'qatar': 'QA', 'singapore': 'SG', 'taiwan': 'TW',
  'vietnam': 'VN', 'thailand': 'TH', 'poland': 'PL', 'italy': 'IT',
  'spain': 'ES', 'colombia': 'CO', 'chile': 'CL', 'pakistan': 'PK',
  'bangladesh': 'BD', 'kenya': 'KE', 'ethiopia': 'ET', 'switzerland': 'CH',
  'european': 'EMU', 'eurozone': 'EMU', 'euro area': 'EMU',
  'eu': 'EUU', 'european union': 'EUU',
};

// Reverse: region -> default ISO2 codes to query
const REGION_ISO2 = {
  'North America': ['US', 'CA', 'MX'],
  'Europe': ['EMU', 'GB', 'DE', 'FR'],
  'Asia-Pacific': ['CN', 'JP', 'KR', 'IN'],
  'Middle East & Africa': ['SA', 'AE', 'NG', 'ZA'],
  'Latin America': ['BR', 'AR', 'CO', 'CL'],
  'Global': ['WLD'],
};

// Country name extraction from text
const COUNTRY_PATTERNS = Object.entries(COUNTRY_TO_ISO2)
  .sort((a, b) => b[0].length - a[0].length); // longest first for matching

/**
 * Extract ISO2 country code from event text.
 * Scans headline + summary for country names.
 * Falls back to region default.
 */
export function extractCountryCode(text, region) {
  const lower = (text || '').toLowerCase();

  for (const [name, code] of COUNTRY_PATTERNS) {
    const pattern = new RegExp(`\\b${name.replace(/\./g, '\\.')}\\b`, 'i');
    if (pattern.test(lower)) {
      return code;
    }
  }

  // Fall back to first code for the region
  const regionCodes = REGION_ISO2[region] || REGION_ISO2['Global'];
  return regionCodes[0];
}

/**
 * Get all relevant ISO2 codes for a region (for multi-country charts).
 */
export function getRegionCodes(region) {
  return REGION_ISO2[region] || REGION_ISO2['Global'];
}

// ---- Smart Indicator Matching -----------------------------------------------

/**
 * Score and rank indicators against an event item.
 *
 * Scoring:
 * - Exact category match:    +5 points
 * - Exact region match:      +3 points
 * - Keyword tag match:       +2 points each
 * - Headline word match:     +1 point each
 *
 * @param {object} item - Event item with category, region, headline, keywords
 * @param {number} maxResults - Max indicators to return (default 8)
 * @returns {object[]} Ranked indicators with scores
 */
export function matchIndicators(item, maxResults = 8) {
  const {
    category = '',
    region = '',
    headline = '',
    summary = '',
    keywords = [],
  } = item || {};

  const categoryLower = category.toLowerCase();
  const regionLower = region.toLowerCase();
  const headlineWords = `${headline} ${summary}`.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const keywordsLower = keywords.map(k => k.toLowerCase());

  const scored = INDICATOR_CATALOG.map(indicator => {
    let score = 0;
    const tags = indicator.tags;

    // Exact category match
    if (tags.includes(categoryLower)) score += 5;

    // Partial category match (e.g., "energy" matches "energy markets")
    const catWords = categoryLower.split(/\s+/);
    for (const word of catWords) {
      if (word.length > 2 && tags.some(t => t.includes(word))) score += 2;
    }

    // Exact region match
    if (tags.includes(regionLower)) score += 3;

    // Keyword matches
    for (const kw of keywordsLower) {
      if (tags.some(t => t.includes(kw) || kw.includes(t))) score += 2;
    }

    // Headline word matches
    for (const word of headlineWords) {
      if (tags.includes(word)) score += 1;
    }

    return { ...indicator, score };
  });

  // Filter zero-score, sort descending, deduplicate by fetchKey
  const seen = new Set();
  return scored
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(i => {
      const key = `${i.source}:${i.fetchKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, maxResults);
}

/**
 * Search the catalog by query string (for manual indicator browser).
 * Fuzzy matches against name, description, tags.
 */
export function searchIndicators(query, maxResults = 20) {
  if (!query || query.trim().length < 2) return [];

  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);

  const scored = INDICATOR_CATALOG.map(indicator => {
    let score = 0;
    const name = indicator.name.toLowerCase();
    const allText = [name, ...indicator.tags].join(' ');

    for (const word of words) {
      if (name.includes(word)) score += 3;
      if (indicator.tags.includes(word)) score += 2;
      if (allText.includes(word)) score += 1;
    }

    return { ...indicator, score };
  });

  return scored
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
