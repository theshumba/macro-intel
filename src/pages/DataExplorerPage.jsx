// ---------------------------------------------------------------------------
// DataExplorerPage.jsx — Browse country-level economic indicators + trade data
// Search by country, view structured data with source attribution.
// Live trade data from WITS, UK Trade Tariff, UN Comtrade.
// ---------------------------------------------------------------------------

import { useState, useEffect, useMemo } from 'react';
import { getAllContextData, searchContextData, getAvailableCountries } from '../services/contextEngine.js';
import { fetchWitsTariff, fetchWitsTradeProfile, fetchComtradeReleases } from '../services/tradeApis.js';

const INDICATOR_LABELS = {
  waterStress: 'Water Stress',
  energyDependency: 'Energy Dependency',
  tradeOpenness: 'Trade Openness',
  gdpGrowth: 'GDP Growth',
  debtToGdp: 'Debt-to-GDP',
  sanctionsExposure: 'Sanctions Exposure',
};

function DataExplorerPage() {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [comtradeReleases, setComtradeReleases] = useState(null);
  const [releasesLoading, setReleasesLoading] = useState(true);

  const countries = useMemo(() => getAvailableCountries(), []);
  const data = useMemo(() => searchContextData(search), [search]);

  // Fetch Comtrade releases on mount
  useEffect(() => {
    fetchComtradeReleases()
      .then(setComtradeReleases)
      .catch(() => setComtradeReleases({ releases: [] }))
      .finally(() => setReleasesLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100">Data Explorer</h1>
        <span className="text-xs text-gray-500">{countries.length} countries &middot; 4 data sources</span>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedCountry(null); }}
          placeholder="Search countries..."
          className="w-full bg-[#12121A] border border-gray-800/60 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-colors"
        />
        {search && (
          <button onClick={() => { setSearch(''); setSelectedCountry(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Country Grid + Comtrade sidebar */}
      {!selectedCountry && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Country cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.map(d => (
                <button key={d.country} onClick={() => setSelectedCountry(d.country)}
                  className="text-left bg-[#12121A] rounded-xl border border-gray-800/60 p-4 hover:border-emerald-500/30 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors">{d.country}</h3>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniIndicator label="GDP Growth" value={d.gdpGrowth?.value} />
                    <MiniIndicator label="Water Stress" value={d.waterStress?.value} />
                    <MiniIndicator label="Energy Dep." value={d.energyDependency?.value} />
                    <MiniIndicator label="Sanctions" value={d.sanctionsExposure?.value} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comtrade Releases sidebar */}
          <div>
            <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trade Data Releases</h3>
                <span className="text-[10px] text-gray-600">UN Comtrade</span>
              </div>
              {releasesLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-6 w-full" />)}
                </div>
              ) : comtradeReleases?.releases?.length > 0 ? (
                <div className="divide-y divide-gray-800/40 max-h-[500px] overflow-y-auto">
                  {comtradeReleases.releases.slice(0, 20).map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.02] transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-300 truncate">{r.country}</p>
                        <p className="text-[10px] text-gray-600">{r.flowDesc} &middot; {r.year}</p>
                      </div>
                      {r.releaseDate && (
                        <span className="text-[10px] text-gray-600 shrink-0 ml-2">
                          {new Date(r.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-3 text-xs text-gray-600">No release data available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Country Detail View */}
      {selectedCountry && (
        <CountryDetail
          country={selectedCountry}
          data={data.find(d => d.country === selectedCountry)}
          onBack={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
}

function CountryDetail({ country, data, onBack }) {
  const [tradeProfile, setTradeProfile] = useState(null);
  const [tariffData, setTariffData] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(true);

  // Fetch WITS trade data for this country
  useEffect(() => {
    setTradeLoading(true);
    Promise.all([
      fetchWitsTradeProfile(country).catch(() => null),
      fetchWitsTariff(country).catch(() => null),
    ]).then(([profile, tariff]) => {
      setTradeProfile(profile);
      setTariffData(tariff);
    }).finally(() => setTradeLoading(false));
  }, [country]);

  if (!data) return null;

  return (
    <div className="space-y-4">
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to all countries
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Context Indicators */}
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-5">
          <h2 className="text-xl font-bold text-gray-100 mb-1">{country}</h2>
          <p className="text-xs text-gray-600 mb-5">Economic context indicators with source attribution</p>

          <div className="space-y-3">
            {Object.entries(INDICATOR_LABELS).map(([key, label]) => {
              const indicator = data[key];
              if (!indicator) return null;
              return (
                <div key={key} className="flex items-baseline justify-between bg-[#0A0A0F] rounded-lg px-4 py-3 border border-gray-800/40">
                  <div>
                    <div className="text-sm text-gray-300 font-medium">{label}</div>
                    {indicator.score != null && (
                      <div className="text-[10px] text-gray-600 mt-0.5">Score: {indicator.score}/5</div>
                    )}
                    {indicator.ratio != null && (
                      <div className="text-[10px] text-gray-600 mt-0.5">Ratio: {indicator.ratio}</div>
                    )}
                    {indicator.importRatio != null && (
                      <div className="text-[10px] text-gray-600 mt-0.5">Import ratio: {indicator.importRatio}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-100 font-semibold">{indicator.value}</div>
                    <div className="text-[10px] text-gray-600 mt-0.5">{indicator.source}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trade Data (WITS) */}
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-5">
          <h3 className="text-lg font-bold text-gray-100 mb-1">Trade Profile</h3>
          <p className="text-xs text-gray-600 mb-5">Live data from World Bank WITS</p>

          {tradeLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {tradeProfile ? (
                <>
                  {tradeProfile.totalExports != null && (
                    <TradeRow label="Total Exports" value={formatTradeValue(tradeProfile.totalExports)} source={tradeProfile.source} year={tradeProfile.year} />
                  )}
                  {tradeProfile.totalImports != null && (
                    <TradeRow label="Total Imports" value={formatTradeValue(tradeProfile.totalImports)} source={tradeProfile.source} year={tradeProfile.year} />
                  )}
                  {tradeProfile.tradeBalance != null && (
                    <TradeRow
                      label="Trade Balance"
                      value={formatTradeValue(tradeProfile.tradeBalance)}
                      source={tradeProfile.source}
                      year={tradeProfile.year}
                      highlight={tradeProfile.tradeBalance >= 0 ? 'emerald' : 'red'}
                    />
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-600">WITS trade data not available for {country}.</p>
              )}

              {tariffData ? (
                <TradeRow
                  label="Avg. Applied Tariff"
                  value={`${tariffData.averageTariff.toFixed(1)}%`}
                  source={tariffData.source}
                  year={tariffData.year}
                />
              ) : (
                <p className="text-xs text-gray-600">Tariff data not available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TradeRow({ label, value, source, year, highlight }) {
  const color = highlight === 'emerald' ? 'text-emerald-400' : highlight === 'red' ? 'text-red-400' : 'text-gray-100';
  return (
    <div className="flex items-baseline justify-between bg-[#0A0A0F] rounded-lg px-4 py-3 border border-gray-800/40">
      <div>
        <div className="text-sm text-gray-300 font-medium">{label}</div>
        {year && <div className="text-[10px] text-gray-600 mt-0.5">{year}</div>}
      </div>
      <div className="text-right">
        <div className={`text-sm font-semibold ${color}`}>{value}</div>
        <div className="text-[10px] text-gray-600 mt-0.5">{source}</div>
      </div>
    </div>
  );
}

function formatTradeValue(val) {
  if (val === null || val === undefined) return 'N/A';
  const abs = Math.abs(val);
  const prefix = val < 0 ? '-' : '';
  if (abs >= 1e12) return `${prefix}$${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${prefix}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${prefix}$${(abs / 1e6).toFixed(0)}M`;
  return `${prefix}$${abs.toLocaleString()}`;
}

function MiniIndicator({ label, value }) {
  return (
    <div className="text-xs">
      <span className="text-gray-600">{label}: </span>
      <span className="text-gray-400 font-medium">{value || 'N/A'}</span>
    </div>
  );
}

export default DataExplorerPage;
