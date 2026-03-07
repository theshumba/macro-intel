// ---------------------------------------------------------------------------
// WorldMonitorPage.jsx — Global intelligence dashboard
// Earthquakes, natural disasters, conflict, displacement, maritime,
// cyber threats, crypto, prediction markets, research feeds
// ---------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { fetchWorldMonitorSnapshot } from '../services/worldMonitorApis.js';

function WorldMonitorPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWorldMonitorSnapshot().then(d => {
      if (!cancelled) setData(d);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'natural', label: 'Natural Events' },
    { id: 'conflict', label: 'Conflict' },
    { id: 'cyber', label: 'Cyber' },
    { id: 'markets', label: 'Crypto & Markets' },
    { id: 'maritime', label: 'Maritime' },
    { id: 'intel', label: 'Intel Feed' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-100">World Monitor</h1>
        {data?.fetchedAt && (
          <span className="text-[10px] text-gray-600">
            Updated {new Date(data.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'text-gray-400 border border-gray-800 hover:border-gray-600'
            }`}>{tab.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#12121A] border border-gray-800/60 rounded-xl p-5 space-y-3">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-20 w-full" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          {activeTab === 'overview' && <OverviewTab data={data} />}
          {activeTab === 'natural' && <NaturalTab data={data} />}
          {activeTab === 'conflict' && <ConflictTab data={data} />}
          {activeTab === 'cyber' && <CyberTab data={data} />}
          {activeTab === 'markets' && <CryptoMarketsTab data={data} />}
          {activeTab === 'maritime' && <MaritimeTab data={data} />}
          {activeTab === 'intel' && <IntelTab data={data} />}
        </>
      ) : (
        <p className="text-sm text-gray-500">Failed to load world monitor data.</p>
      )}
    </div>
  );
}

// ---- Overview Tab -----------------------------------------------------------

function OverviewTab({ data }) {
  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MiniStat label="Earthquakes (24h)" value={data.earthquakes.length} color="text-orange-400" />
        <MiniStat label="Natural Events" value={data.naturalEvents.length} color="text-amber-400" />
        <MiniStat label="Disaster Alerts" value={data.gdacsAlerts.length} color="text-red-400" />
        <MiniStat label="Conflict Events" value={data.conflictEvents.length} color="text-red-400" />
        <MiniStat label="Maritime Warnings" value={data.maritimeWarnings.length} color="text-sky-400" />
        <MiniStat label="Cyber Threats" value={(data.cyberThreats.feodo?.length || 0) + (data.cyberThreats.urlhaus?.length || 0)} color="text-purple-400" />
      </div>

      {/* Grid: Recent across domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Earthquakes */}
        <MonitorCard title="Recent Earthquakes" source="USGS" color="text-orange-400">
          {data.earthquakes.slice(0, 5).map(eq => (
            <div key={eq.id} className="flex items-center justify-between py-1.5">
              <div className="min-w-0">
                <p className="text-xs text-gray-300 truncate">{eq.place}</p>
                <p className="text-[10px] text-gray-600">{timeAgo(eq.time)}{eq.tsunami ? ' — Tsunami alert' : ''}</p>
              </div>
              <span className={`text-sm font-bold tabular-nums shrink-0 ml-2 ${eq.magnitude >= 6 ? 'text-red-400' : eq.magnitude >= 5 ? 'text-amber-400' : 'text-gray-400'}`}>
                M{eq.magnitude.toFixed(1)}
              </span>
            </div>
          ))}
          {data.earthquakes.length === 0 && <p className="text-xs text-gray-600">No recent earthquakes M4.5+</p>}
        </MonitorCard>

        {/* Natural Events */}
        <MonitorCard title="Natural Events" source="NASA EONET" color="text-amber-400">
          {data.naturalEvents.slice(0, 5).map(e => (
            <div key={e.id} className="py-1.5">
              <p className="text-xs text-gray-300 truncate">{e.title}</p>
              <p className="text-[10px] text-gray-600">{e.category}{e.magnitude ? ` — ${e.magnitude} ${e.magnitudeUnit || ''}` : ''}</p>
            </div>
          ))}
          {data.naturalEvents.length === 0 && <p className="text-xs text-gray-600">No active natural events</p>}
        </MonitorCard>

        {/* Conflict */}
        <MonitorCard title="Armed Conflict" source="UCDP" color="text-red-400">
          {data.conflictEvents.slice(0, 5).map(e => (
            <div key={e.id} className="py-1.5">
              <p className="text-xs text-gray-300 truncate">{e.sideA} vs {e.sideB}</p>
              <p className="text-[10px] text-gray-600">{e.country} — {e.deaths} fatalities — {e.type}</p>
            </div>
          ))}
          {data.conflictEvents.length === 0 && <p className="text-xs text-gray-600">No recent conflict data</p>}
        </MonitorCard>

        {/* Displacement */}
        {data.displacement && (
          <MonitorCard title={`Displacement (${data.displacement.year})`} source="UNHCR" color="text-sky-400">
            {data.displacement.countries?.slice(0, 5).map(c => (
              <div key={c.country} className="flex items-center justify-between py-1.5">
                <p className="text-xs text-gray-300 truncate">{c.country}</p>
                <span className="text-xs text-gray-400 tabular-nums shrink-0 ml-2">{(c.refugees / 1e6).toFixed(1)}M</span>
              </div>
            ))}
          </MonitorCard>
        )}

        {/* Crypto */}
        <MonitorCard title="Crypto Markets" source={data.crypto[0]?.source || 'CoinGecko'} color="text-purple-400">
          {data.crypto.slice(0, 5).map(c => (
            <div key={c.id} className="flex items-center justify-between py-1.5">
              <div className="min-w-0">
                <p className="text-xs text-gray-300">{c.symbol}</p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-xs text-gray-200 tabular-nums font-medium">${c.price >= 1 ? c.price.toLocaleString(undefined, {maximumFractionDigits: 0}) : c.price.toFixed(4)}</span>
                <span className={`text-[10px] tabular-nums ml-1.5 ${c.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {c.change24h >= 0 ? '+' : ''}{c.change24h?.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </MonitorCard>

        {/* BIS Policy Rates */}
        <MonitorCard title="Central Bank Rates" source="BIS" color="text-emerald-400">
          {data.bisPolicyRates.slice(0, 6).map(r => (
            <div key={r.country} className="flex items-center justify-between py-1.5">
              <p className="text-xs text-gray-300 truncate">{r.country}</p>
              <span className="text-xs text-gray-200 tabular-nums font-medium shrink-0 ml-2">{r.rate.toFixed(2)}%</span>
            </div>
          ))}
          {data.bisPolicyRates.length === 0 && <p className="text-xs text-gray-600">BIS data unavailable</p>}
        </MonitorCard>
      </div>

      {/* Fear & Greed */}
      {data.fearGreed?.length > 0 && (
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Crypto Fear & Greed Index</h3>
            <span className="text-[10px] text-gray-600">Alternative.me</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold tabular-nums ${
              data.fearGreed[0].value >= 75 ? 'text-emerald-400' :
              data.fearGreed[0].value >= 50 ? 'text-gray-200' :
              data.fearGreed[0].value >= 25 ? 'text-amber-400' : 'text-red-400'
            }`}>{data.fearGreed[0].value}</div>
            <div>
              <p className="text-sm text-gray-300 font-medium">{data.fearGreed[0].label}</p>
              <p className="text-[10px] text-gray-600">Scale: 0 (Extreme Fear) — 100 (Extreme Greed)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Natural Tab ------------------------------------------------------------

function NaturalTab({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Earthquakes M4.5+ (24h)</h3>
            <span className="text-[10px] text-gray-600">USGS</span>
          </div>
          <div className="divide-y divide-gray-800/40 max-h-[500px] overflow-y-auto">
            {data.earthquakes.map(eq => (
              <a key={eq.id} href={eq.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-xs text-gray-300">{eq.place}</p>
                  <p className="text-[10px] text-gray-600">Depth: {eq.depth?.toFixed(0)}km — {timeAgo(eq.time)}</p>
                </div>
                <span className={`text-sm font-bold tabular-nums shrink-0 ml-2 ${eq.magnitude >= 6 ? 'text-red-400' : eq.magnitude >= 5 ? 'text-amber-400' : 'text-gray-300'}`}>
                  M{eq.magnitude.toFixed(1)}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Natural Events</h3>
            <span className="text-[10px] text-gray-600">NASA EONET</span>
          </div>
          <div className="divide-y divide-gray-800/40 max-h-[500px] overflow-y-auto">
            {data.naturalEvents.map(e => (
              <div key={e.id} className="px-4 py-2.5">
                <p className="text-xs text-gray-300">{e.title}</p>
                <p className="text-[10px] text-gray-600">{e.category}{e.magnitude ? ` — ${e.magnitude} ${e.magnitudeUnit}` : ''} — {e.date?.split('T')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.gdacsAlerts.length > 0 && (
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GDACS Disaster Alerts</h3>
            <span className="text-[10px] text-gray-600">UN GDACS</span>
          </div>
          <div className="divide-y divide-gray-800/40">
            {data.gdacsAlerts.slice(0, 15).map((a, i) => (
              <a key={i} href={a.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-xs text-gray-300 truncate">{a.title}</p>
                  <p className="text-[10px] text-gray-600">{a.country} — {a.eventType}</p>
                </div>
                {a.alertLevel && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 ml-2 ${
                    a.alertLevel === 'Red' ? 'bg-red-500/20 text-red-400' :
                    a.alertLevel === 'Orange' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>{a.alertLevel}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Conflict Tab -----------------------------------------------------------

function ConflictTab({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Armed Conflict Events</h3>
            <span className="text-[10px] text-gray-600">UCDP Uppsala</span>
          </div>
          <div className="divide-y divide-gray-800/40 max-h-[600px] overflow-y-auto">
            {data.conflictEvents.map(e => (
              <div key={e.id} className="px-4 py-2.5">
                <p className="text-xs text-gray-300">{e.sideA} vs {e.sideB}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-gray-500">{e.country}</span>
                  <span className="text-[10px] text-red-400">{e.deaths} deaths</span>
                  <span className="text-[10px] text-gray-600">{e.type}</span>
                  <span className="text-[10px] text-gray-600">{e.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.displacement && (
          <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Displacement ({data.displacement.year})</h3>
              <span className="text-[10px] text-gray-600">UNHCR</span>
            </div>
            <div className="divide-y divide-gray-800/40 max-h-[600px] overflow-y-auto">
              {data.displacement.countries?.map(c => (
                <div key={c.country} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300">{c.country}</p>
                    <p className="text-[10px] text-gray-600">
                      {c.idps > 0 ? `IDPs: ${(c.idps/1e6).toFixed(1)}M` : ''}
                      {c.asylum > 0 ? ` Asylum: ${(c.asylum/1e3).toFixed(0)}K` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-sky-400 tabular-nums font-medium shrink-0 ml-2">{(c.refugees/1e6).toFixed(2)}M refugees</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Cyber Tab --------------------------------------------------------------

function CyberTab({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">C2 Botnet Servers</h3>
            <span className="text-[10px] text-gray-600">Feodo Tracker</span>
          </div>
          <div className="divide-y divide-gray-800/40 max-h-[400px] overflow-y-auto">
            {data.cyberThreats.feodo.map((t, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-300 font-mono">{t.ip}:{t.port}</p>
                  <p className="text-[10px] text-gray-600">{t.malware} — {t.country}</p>
                </div>
                <span className="text-[10px] text-gray-600 shrink-0 ml-2">{t.lastOnline?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Malicious URLs</h3>
            <span className="text-[10px] text-gray-600">URLhaus</span>
          </div>
          <div className="divide-y divide-gray-800/40 max-h-[400px] overflow-y-auto">
            {data.cyberThreats.urlhaus.map((u, i) => (
              <div key={i} className="px-4 py-2">
                <p className="text-xs text-gray-300 font-mono truncate">{u.url}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] ${u.status === 'online' ? 'text-red-400' : 'text-gray-600'}`}>{u.status}</span>
                  <span className="text-[10px] text-gray-600">{u.threat}</span>
                  {u.tags?.map(t => <span key={t} className="text-[10px] text-purple-400">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Crypto & Markets Tab ---------------------------------------------------

function CryptoMarketsTab({ data }) {
  return (
    <div className="space-y-4">
      {/* Crypto prices */}
      <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cryptocurrency Prices</h3>
          <span className="text-[10px] text-gray-600">{data.crypto[0]?.source || 'CoinGecko'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="px-4 py-2 text-left text-gray-500 font-semibold">Asset</th>
                <th className="px-4 py-2 text-right text-gray-500 font-semibold">Price</th>
                <th className="px-4 py-2 text-right text-gray-500 font-semibold">24h</th>
                <th className="px-4 py-2 text-right text-gray-500 font-semibold">7d</th>
                <th className="px-4 py-2 text-right text-gray-500 font-semibold">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {data.crypto.map(c => (
                <tr key={c.id} className="border-b border-gray-800/30 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-medium text-gray-200">{c.symbol} <span className="text-gray-600">{c.name}</span></td>
                  <td className="px-4 py-2.5 text-right text-gray-200 tabular-nums">${c.price >= 1 ? c.price.toLocaleString(undefined, {maximumFractionDigits: 2}) : c.price.toFixed(4)}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${c.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.change24h?.toFixed(1)}%
                  </td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${(c.change7d || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.change7d?.toFixed(1) || '--'}%
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">
                    ${c.marketCap ? (c.marketCap / 1e9).toFixed(0) + 'B' : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prediction Markets */}
      {data.predictions.length > 0 && (
        <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prediction Markets</h3>
            <span className="text-[10px] text-gray-600">Polymarket</span>
          </div>
          <div className="divide-y divide-gray-800/40">
            {data.predictions.slice(0, 10).map(p => (
              <div key={p.id} className="px-4 py-3">
                <p className="text-xs text-gray-300 font-medium">{p.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {p.volume24h && <span className="text-[10px] text-gray-500">24h vol: ${(p.volume24h / 1e6).toFixed(1)}M</span>}
                  {p.liquidity && <span className="text-[10px] text-gray-600">Liquidity: ${(p.liquidity / 1e6).toFixed(1)}M</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Maritime Tab -----------------------------------------------------------

function MaritimeTab({ data }) {
  return (
    <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigational Warnings</h3>
        <span className="text-[10px] text-gray-600">NGA MSI</span>
      </div>
      <div className="divide-y divide-gray-800/40 max-h-[600px] overflow-y-auto">
        {data.maritimeWarnings.map((w, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              {w.area && <span className="text-[10px] text-sky-400 font-medium">{w.area}</span>}
              {w.issuedDate && <span className="text-[10px] text-gray-600">{w.issuedDate}</span>}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{(w.text || '').slice(0, 200)}{w.text?.length > 200 ? '...' : ''}</p>
          </div>
        ))}
        {data.maritimeWarnings.length === 0 && <p className="px-4 py-3 text-xs text-gray-600">No active maritime warnings</p>}
      </div>
    </div>
  );
}

// ---- Intel Feed Tab ---------------------------------------------------------

function IntelTab({ data }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#12121A] rounded-xl border border-gray-800/60 overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GDELT Intelligence Feed</h3>
          <span className="text-[10px] text-gray-600">GDELT Project</span>
        </div>
        <div className="divide-y divide-gray-800/40 max-h-[600px] overflow-y-auto">
          {data.gdeltArticles.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
              className="block px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
              <p className="text-xs text-gray-300 leading-snug">{a.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-500">{a.source}</span>
                {a.tone && <span className={`text-[10px] ${a.tone > 0 ? 'text-emerald-400' : a.tone < -3 ? 'text-red-400' : 'text-gray-600'}`}>
                  Tone: {typeof a.tone === 'number' ? a.tone.toFixed(1) : a.tone}
                </span>}
                <span className="text-[10px] text-gray-600">{a.date?.split('T')[0]}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Shared Components ------------------------------------------------------

function MonitorCard({ title, source, color = 'text-gray-400', children }) {
  return (
    <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{title}</h3>
        <span className="text-[10px] text-gray-600">{source}</span>
      </div>
      <div className="divide-y divide-gray-800/30">{children}</div>
    </div>
  );
}

function MiniStat({ label, value, color = 'text-gray-100' }) {
  return (
    <div className="bg-[#12121A] rounded-xl border border-gray-800/60 p-3">
      <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default WorldMonitorPage;
