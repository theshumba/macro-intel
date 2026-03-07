import { useState, useEffect, useMemo } from 'react';
import MacroCard from './charts/MacroCard';
import MiniChart from './charts/MiniChart';
import { fetchMacroSnapshot } from '../services/dataApis';
import { fetchWorldBank } from '../services/dataApis';
import { fetchLiveMarketBatch, fetchTradeSnapshot } from '../services/tradeApis';
import { fetchYahooMarketBatch, fetchCryptoMarkets, fetchFearGreedIndex, fetchBisPolicyRates } from '../services/worldMonitorApis';

// ---- G20 country list for macro table --------------------------------------

const G20_COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'China', code: 'CN' },
  { name: 'Japan', code: 'JP' },
  { name: 'Germany', code: 'DE' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'India', code: 'IN' },
  { name: 'France', code: 'FR' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Italy', code: 'IT' },
  { name: 'Canada', code: 'CA' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Australia', code: 'AU' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Argentina', code: 'AR' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'Russia', code: 'RU' },
];

// ---- Helpers ----------------------------------------------------------------

function formatFREDValue(data) {
  if (!data || !Array.isArray(data) || data.length === 0) return { value: null, sparkData: [], change: null, direction: 'flat' };

  const latest = data[0].value;
  const sparkData = [...data].reverse().map(d => ({ date: d.date, value: d.value }));

  // Compute change vs previous
  let change = null;
  let direction = 'flat';
  if (data.length >= 2 && data[1].value !== null) {
    const diff = latest - data[1].value;
    change = diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
    direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  }

  return { value: latest, sparkData, change, direction };
}

function formatPrice(val) {
  if (val === null || val === undefined) return '--';
  if (Math.abs(val) >= 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return val.toFixed(2);
}

function cellColor(val, reverse = false) {
  if (val === null || val === undefined) return 'text-gray-500';
  if (reverse) return val > 0 ? 'text-red-400' : val < 0 ? 'text-emerald-400' : 'text-gray-400';
  return val > 0 ? 'text-emerald-400' : val < 0 ? 'text-red-400' : 'text-gray-400';
}

// ---- Economic Calendar component --------------------------------------------

function EconomicCalendar({ calendar }) {
  if (!calendar?.economicCalendar?.length) {
    return (
      <div className="bg-[#12121A] border border-gray-800/60 rounded-xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Economic Calendar</h3>
        <p className="text-sm text-gray-600">No calendar data available. Set VITE_FINNHUB_KEY in .env for economic events.</p>
      </div>
    );
  }

  const events = calendar.economicCalendar
    .filter(e => e.event)
    .slice(0, 15);

  return (
    <div className="bg-[#12121A] border border-gray-800/60 rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Economic Calendar</h3>
      </div>
      <div className="divide-y divide-gray-800/40">
        {events.map((event, i) => {
          const impact = event.impact === 'high' ? 'bg-red-500' : event.impact === 'medium' ? 'bg-amber-500' : 'bg-gray-600';
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
              <div className={`h-2 w-2 rounded-full ${impact} shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-300 truncate">{event.event}</p>
                <p className="text-[10px] text-gray-600">{event.country} &middot; {event.date}</p>
              </div>
              <div className="text-right shrink-0">
                {event.actual !== undefined && (
                  <p className="text-xs font-medium text-gray-200">{event.actual}</p>
                )}
                {event.estimate !== undefined && (
                  <p className="text-[10px] text-gray-500">Est: {event.estimate}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- G20 Macro Table --------------------------------------------------------

function MacroTable({ data, loading }) {
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    if (!data.length) return [];
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir]);

  const columns = [
    { key: 'name', label: 'Country', align: 'left' },
    { key: 'gdpGrowth', label: 'GDP Growth %', align: 'right' },
    { key: 'inflation', label: 'CPI %', align: 'right' },
    { key: 'unemployment', label: 'Unemp %', align: 'right' },
    { key: 'tradeGdp', label: 'Trade/GDP %', align: 'right' },
  ];

  const sortArrow = (key) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  return (
    <div className="bg-[#12121A] border border-gray-800/60 rounded-xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">G20 Macro Overview</h3>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800/60">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {col.label}{sortArrow(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.code} className="border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-200">{row.name}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${cellColor(row.gdpGrowth)}`}>
                    {row.gdpGrowth !== null ? `${row.gdpGrowth.toFixed(1)}%` : '--'}
                  </td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${cellColor(row.inflation, true)}`}>
                    {row.inflation !== null ? `${row.inflation.toFixed(1)}%` : '--'}
                  </td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${cellColor(row.unemployment, true)}`}>
                    {row.unemployment !== null ? `${row.unemployment.toFixed(1)}%` : '--'}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-gray-400">
                    {row.tradeGdp !== null ? `${row.tradeGdp.toFixed(0)}%` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Main MarketsView -------------------------------------------------------

export default function MarketsView() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [g20Data, setG20Data] = useState([]);
  const [g20Loading, setG20Loading] = useState(true);
  const [liveMarkets, setLiveMarkets] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [tradeData, setTradeData] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(true);
  const [yahooData, setYahooData] = useState(null);
  const [yahooLoading, setYahooLoading] = useState(true);
  const [cryptoData, setCryptoData] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [bisRates, setBisRates] = useState(null);

  // Fetch macro snapshot
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchMacroSnapshot();
        if (!cancelled) setSnapshot(data);
      } catch (err) {
        console.warn('[MarketsView] Snapshot fetch failed:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Auto-refresh every 15 minutes
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Fetch G20 macro table data (World Bank — no key needed)
  useEffect(() => {
    let cancelled = false;

    async function loadG20() {
      setG20Loading(true);
      try {
        const codes = G20_COUNTRIES.map(c => c.code).join(';');
        const [gdp, cpi, unemp, trade] = await Promise.all([
          fetchWorldBank('NY.GDP.MKTP.KD.ZG', codes, '2022:2024').catch(() => []),
          fetchWorldBank('FP.CPI.TOTL.ZG', codes, '2022:2024').catch(() => []),
          fetchWorldBank('SL.UEM.TOTL.ZS', codes, '2022:2024').catch(() => []),
          fetchWorldBank('NE.TRD.GNFS.ZS', codes, '2022:2024').catch(() => []),
        ]);

        // Get latest value per country for each indicator
        function getLatest(data, countryCode) {
          const countryData = data
            .filter(d => d.countryCode === countryCode && d.value !== null)
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));
          return countryData[0]?.value ?? null;
        }

        const rows = G20_COUNTRIES.map(c => ({
          name: c.name,
          code: c.code,
          gdpGrowth: getLatest(gdp, c.code),
          inflation: getLatest(cpi, c.code),
          unemployment: getLatest(unemp, c.code),
          tradeGdp: getLatest(trade, c.code),
        }));

        if (!cancelled) setG20Data(rows);
      } catch (err) {
        console.warn('[MarketsView] G20 fetch failed:', err.message);
      } finally {
        if (!cancelled) setG20Loading(false);
      }
    }

    loadG20();
    return () => { cancelled = true; };
  }, []);

  // Fetch live Alpha Vantage market data
  useEffect(() => {
    let cancelled = false;
    async function loadLive() {
      setLiveLoading(true);
      try {
        const data = await fetchLiveMarketBatch();
        if (!cancelled && data) setLiveMarkets(data);
      } catch (err) {
        console.warn('[MarketsView] Live markets fetch failed:', err.message);
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }
    loadLive();
    // Refresh every 30 min (Alpha Vantage rate limits)
    const interval = setInterval(loadLive, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Fetch Yahoo Finance, crypto, BIS in parallel
  useEffect(() => {
    let cancelled = false;
    async function loadExtras() {
      const [yahoo, crypto, fg, bis] = await Promise.all([
        fetchYahooMarketBatch().catch(() => null),
        fetchCryptoMarkets().catch(() => null),
        fetchFearGreedIndex().catch(() => null),
        fetchBisPolicyRates().catch(() => null),
      ]);
      if (!cancelled) {
        setYahooData(yahoo);
        setYahooLoading(false);
        setCryptoData(crypto);
        setFearGreed(fg);
        setBisRates(bis);
      }
    }
    loadExtras();
    return () => { cancelled = true; };
  }, []);

  // Fetch trade data (WITS, UK Tariff, Comtrade)
  useEffect(() => {
    let cancelled = false;
    async function loadTrade() {
      setTradeLoading(true);
      try {
        const data = await fetchTradeSnapshot();
        if (!cancelled) setTradeData(data);
      } catch (err) {
        console.warn('[MarketsView] Trade data fetch failed:', err.message);
      } finally {
        if (!cancelled) setTradeLoading(false);
      }
    }
    loadTrade();
    return () => { cancelled = true; };
  }, []);

  // Extract FRED card data
  const cards = useMemo(() => {
    if (!snapshot?.macro) return [];

    const items = [
      { title: 'Fed Funds Rate', ...formatFREDValue(snapshot.macro.fedFundsRate), unit: '%' },
      { title: 'CPI Index', ...formatFREDValue(snapshot.macro.cpi), unit: '' },
      { title: 'VIX', ...formatFREDValue(snapshot.macro.vix), unit: '' },
      { title: 'WTI Crude Oil', ...formatFREDValue(snapshot.macro.oilWTI), unit: '$/bbl' },
      { title: 'Gold', ...formatFREDValue(snapshot.macro.gold), unit: '$/oz' },
      { title: '10Y-2Y Spread', ...formatFREDValue(snapshot.macro.yieldSpread), unit: 'bps' },
    ];

    return items;
  }, [snapshot]);

  // Chart data from FRED series
  const chartSeries = useMemo(() => {
    if (!snapshot?.macro) return [];

    const series = [];

    if (snapshot.macro.yieldSpread?.length) {
      series.push({
        title: '10Y-2Y Yield Spread',
        data: [...snapshot.macro.yieldSpread].reverse().map(d => ({ date: d.date, value: d.value })),
        unit: '%',
        chartType: 'area',
        color: snapshot.macro.yieldSpread[0]?.value < 0 ? 'red' : 'emerald',
      });
    }

    if (snapshot.macro.oilWTI?.length) {
      series.push({
        title: 'WTI Crude Oil (30-day)',
        data: [...snapshot.macro.oilWTI].reverse().map(d => ({ date: d.date, value: d.value })),
        unit: '$/bbl',
        chartType: 'line',
        color: 'amber',
      });
    }

    if (snapshot.macro.vix?.length) {
      series.push({
        title: 'VIX Volatility (30-day)',
        data: [...snapshot.macro.vix].reverse().map(d => ({ date: d.date, value: d.value })),
        unit: '',
        chartType: 'area',
        color: snapshot.macro.vix[0]?.value > 25 ? 'red' : 'sky',
      });
    }

    if (snapshot.macro.gold?.length) {
      series.push({
        title: 'Gold Price (30-day)',
        data: [...snapshot.macro.gold].reverse().map(d => ({ date: d.date, value: d.value })),
        unit: '$/oz',
        chartType: 'line',
        color: 'amber',
      });
    }

    return series;
  }, [snapshot]);

  // Check if FRED key is missing
  const hasFredKey = !!(import.meta.env.VITE_FRED_API_KEY);

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 md:pb-0">
      {/* Row 1: Macro Pulse Cards */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Macro Pulse</h3>
        {!hasFredKey && !loading && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-3">
            <p className="text-xs text-amber-400">Set <code className="bg-white/5 px-1 rounded">VITE_FRED_API_KEY</code> in your .env file for live FRED data. <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">Get a free key</a></p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <MacroCard key={i} title="" loading={true} index={i} />
            ))
          ) : cards.length > 0 ? (
            cards.map((card, i) => (
              <MacroCard
                key={card.title}
                title={card.title}
                value={card.value !== null ? formatPrice(card.value) : null}
                unit={card.unit}
                change={card.change}
                changeDirection={card.direction}
                sparkData={card.sparkData}
                noKey={card.value === null && !hasFredKey}
                index={i}
              />
            ))
          ) : (
            Array.from({ length: 6 }).map((_, i) => (
              <MacroCard key={i} title={['Fed Funds', 'CPI', 'VIX', 'WTI Oil', 'Gold', 'Yield Spread'][i]} noKey={true} index={i} />
            ))
          )}
        </div>
      </div>

      {/* Row 2: Interactive Charts */}
      {chartSeries.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Market Charts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartSeries.map((series) => (
              <MiniChart
                key={series.title}
                title={series.title}
                data={series.data}
                unit={series.unit}
                chartType={series.chartType}
                color={series.color}
                source="FRED"
                latestValue={series.data[series.data.length - 1]?.value}
                latestDate={series.data[series.data.length - 1]?.date}
                height={160}
              />
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Live Market Prices (Alpha Vantage) */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Live Rates</h3>
        {liveLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-4">
                <div className="skeleton h-4 w-20 mb-2" />
                <div className="skeleton h-6 w-16" />
              </div>
            ))}
          </div>
        ) : liveMarkets ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {liveMarkets.forex.map(fx => (
              <div key={fx.pair} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{fx.pair}</div>
                <div className="text-lg font-bold text-gray-100 tabular-nums">{fx.rate.toFixed(4)}</div>
                <div className="text-[10px] text-gray-600 mt-1">Bid: {fx.bidPrice.toFixed(4)} / Ask: {fx.askPrice.toFixed(4)}</div>
              </div>
            ))}
            {liveMarkets.equities.map(eq => (
              <div key={eq.symbol} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{eq.symbol}</div>
                <div className="text-lg font-bold text-gray-100 tabular-nums">${eq.price.toFixed(2)}</div>
                <div className={`text-xs tabular-nums mt-1 ${eq.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {eq.change >= 0 ? '+' : ''}{eq.change.toFixed(2)} ({eq.changePercent})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#12121A] border border-gray-800/60 rounded-xl p-4">
            <p className="text-xs text-gray-600">Set <code className="bg-white/5 px-1 rounded">VITE_ALPHA_VANTAGE_KEY</code> in .env for live forex and equity prices.</p>
          </div>
        )}
      </div>

      {/* Row 4: G20 Macro Table */}
      <MacroTable data={g20Data} loading={g20Loading} />

      {/* Row 5: Trade Data (WITS, UK Tariff, Comtrade) */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Trade Intelligence</h3>
        {tradeLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#12121A] border border-gray-800/60 rounded-xl p-5">
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-6 w-full" />)}</div>
            </div>
            <div className="bg-[#12121A] border border-gray-800/60 rounded-xl p-5">
              <div className="skeleton h-4 w-32 mb-3" />
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-6 w-full" />)}</div>
            </div>
          </div>
        ) : tradeData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UN Comtrade Releases */}
            <div className="bg-[#12121A] border border-gray-800/60 rounded-xl overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest Trade Data Releases</h4>
                <span className="text-[10px] text-gray-600">UN Comtrade</span>
              </div>
              <div className="divide-y divide-gray-800/40">
                {tradeData.comtradeReleases.releases.length > 0 ? (
                  tradeData.comtradeReleases.releases.slice(0, 10).map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-300 truncate">{r.country}</p>
                        <p className="text-[10px] text-gray-600">{r.flowDesc} &middot; {r.year}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {r.releaseDate && <p className="text-[10px] text-gray-500">{new Date(r.releaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                        {r.totalRecords && <p className="text-[10px] text-gray-600">{r.totalRecords.toLocaleString()} records</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-xs text-gray-600">No release data available.</p>
                )}
              </div>
            </div>

            {/* UK Tariff Samples */}
            <div className="bg-[#12121A] border border-gray-800/60 rounded-xl overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">UK Tariff Lookup</h4>
                <span className="text-[10px] text-gray-600">UK Trade Tariff Service</span>
              </div>
              <div className="divide-y divide-gray-800/40">
                {['steel', 'semiconductors'].map(key => {
                  const sample = tradeData.ukTariffSamples[key];
                  if (!sample?.results?.length) return null;
                  return (
                    <div key={key} className="px-4 py-3">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">"{key}"</p>
                      {sample.results.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-baseline justify-between py-1">
                          <p className="text-xs text-gray-300 truncate flex-1 mr-2" dangerouslySetInnerHTML={{ __html: item.description }} />
                          <span className="text-[10px] text-gray-600 tabular-nums shrink-0">{item.goodsNomenclatureItemId}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Row 6: Yahoo Finance Global Indices & Commodities */}
      {yahooData && (
        <div className="space-y-4">
          {yahooData.indices.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Global Indices</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {yahooData.indices.map(q => (
                  <div key={q.symbol} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 truncate mb-1">{q.name}</div>
                    <div className="text-sm font-bold text-gray-100 tabular-nums">{formatPrice(q.price)}</div>
                    <div className={`text-xs tabular-nums mt-0.5 ${q.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {q.change >= 0 ? '+' : ''}{q.changePercent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yahooData.commodities.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Commodities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {yahooData.commodities.map(q => (
                  <div key={q.symbol} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 truncate mb-1">{q.name}</div>
                    <div className="text-sm font-bold text-gray-100 tabular-nums">{q.currency === 'USD' ? '$' : ''}{formatPrice(q.price)}</div>
                    <div className={`text-xs tabular-nums mt-0.5 ${q.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {q.change >= 0 ? '+' : ''}{q.changePercent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {yahooData.forex.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Forex (Yahoo)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {yahooData.forex.map(q => (
                  <div key={q.symbol} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 mb-1">{q.name}</div>
                    <div className="text-sm font-bold text-gray-100 tabular-nums">{q.price?.toFixed(4)}</div>
                    <div className={`text-xs tabular-nums mt-0.5 ${q.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {q.change >= 0 ? '+' : ''}{q.changePercent}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 7: Crypto Prices */}
      {cryptoData?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Cryptocurrency</h3>
            {fearGreed?.[0] && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">Fear & Greed:</span>
                <span className={`text-xs font-bold tabular-nums ${
                  fearGreed[0].value >= 75 ? 'text-emerald-400' :
                  fearGreed[0].value >= 50 ? 'text-gray-200' :
                  fearGreed[0].value >= 25 ? 'text-amber-400' : 'text-red-400'
                }`}>{fearGreed[0].value} — {fearGreed[0].label}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {cryptoData.map(c => (
              <div key={c.id} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-3">
                <div className="text-[10px] text-gray-500 mb-1">{c.symbol}</div>
                <div className="text-sm font-bold text-gray-100 tabular-nums">
                  ${c.price >= 1 ? c.price.toLocaleString(undefined, {maximumFractionDigits: 0}) : c.price.toFixed(4)}
                </div>
                <div className={`text-xs tabular-nums mt-0.5 ${c.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {c.change24h >= 0 ? '+' : ''}{c.change24h?.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 8: BIS Central Bank Policy Rates */}
      {bisRates?.length > 0 && (
        <div className="bg-[#12121A] border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Central Bank Policy Rates</h3>
            <span className="text-[10px] text-gray-600">BIS</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4">
            {bisRates.slice(0, 18).map(r => (
              <div key={r.country} className="bg-[#0A0A0F] rounded-lg px-3 py-2 border border-gray-800/40">
                <div className="text-[10px] text-gray-500 truncate">{r.country}</div>
                <div className="text-sm font-bold text-gray-100 tabular-nums">{r.rate.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 9: Economic Calendar */}
      <EconomicCalendar calendar={snapshot?.calendar} />

      {/* Market News */}
      {snapshot?.news?.finnhub?.length > 0 && (
        <div className="bg-[#12121A] border border-gray-800/60 rounded-xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Market News</h3>
          </div>
          <div className="divide-y divide-gray-800/40">
            {snapshot.news.finnhub.slice(0, 10).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <p className="text-sm text-gray-200 leading-snug line-clamp-2">{item.headline}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-gray-500">{item.source}</span>
                  {item.datetime && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-gray-700" />
                      <span className="text-[10px] text-gray-600">
                        {new Date(item.datetime * 1000).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
