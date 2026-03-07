// ---------------------------------------------------------------------------
// DataExplorerPage.jsx — Browse country-level economic indicators
// Search by country, view structured data with source attribution.
// ---------------------------------------------------------------------------

import { useState, useMemo } from 'react';
import { getAllContextData, searchContextData, getAvailableCountries } from '../services/contextEngine.js';

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

  const countries = useMemo(() => getAvailableCountries(), []);
  const data = useMemo(() => searchContextData(search), [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100">Data Explorer</h1>
        <span className="text-xs text-gray-500">{countries.length} countries</span>
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

      {/* Country Grid */}
      {!selectedCountry && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-5">
        <h2 className="text-xl font-bold text-gray-100 mb-5">{country}</h2>

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
    </div>
  );
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
