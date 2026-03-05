import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";

const EARTH_NIGHT_URL =
  "//unpkg.com/three-globe/example/img/earth-night.jpg";
const NIGHT_SKY_URL =
  "//unpkg.com/three-globe/example/img/night-sky.png";

function getPointColor(d, selectedId) {
  if (d.id === selectedId) return "#10b981";
  if (d.impactScore >= 7) return "#ef4444";
  if (d.impactScore >= 4) return "#f59e0b";
  return "#6b7280";
}

function buildArcs(items) {
  const highImpact = items.filter((d) => d.impactScore >= 7);
  if (highImpact.length < 2) return [];

  const arcs = [];
  const seen = new Set();

  for (let i = 0; i < highImpact.length && arcs.length < 6; i++) {
    for (let j = i + 1; j < highImpact.length && arcs.length < 6; j++) {
      const a = highImpact[i];
      const b = highImpact[j];

      if (a.region === b.region) continue;

      const key = [a.id, b.id].sort().join("-");
      if (seen.has(key)) continue;
      seen.add(key);

      arcs.push({
        startLat: a.lat,
        startLng: a.lng,
        endLat: b.lat,
        endLng: b.lng,
      });
    }
  }

  return arcs;
}

function GlobeView({ items = [], onSelect, selectedId }) {
  const globeRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Responsive sizing via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(el);

    // Initial measurement
    const rect = el.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });

    return () => observer.disconnect();
  }, []);

  // Auto-rotate to selected point
  useEffect(() => {
    if (!selectedId || !globeRef.current) return;

    const target = items.find((d) => d.id === selectedId);
    if (!target) return;

    globeRef.current.pointOfView(
      { lat: target.lat, lng: target.lng, altitude: 2 },
      1000
    );
  }, [selectedId, items]);

  // Configure auto-rotate and controls after mount
  useEffect(() => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
    }
  }, []);

  // Memoize point color accessor (depends on selectedId)
  const pointColorFn = useCallback(
    (d) => getPointColor(d, selectedId),
    [selectedId]
  );

  // Memoize arcs (only recompute when items change)
  const arcsData = useMemo(() => buildArcs(items), [items]);

  // Memoize points data
  const pointsData = useMemo(() => items, [items]);

  const handlePointClick = useCallback(
    (point) => {
      if (onSelect) onSelect(point);
    },
    [onSelect]
  );

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ minHeight: "calc(100vh - 200px)" }}
    >
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height || 600}
          globeImageUrl={EARTH_NIGHT_URL}
          backgroundImageUrl={NIGHT_SKY_URL}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="#4ade80"
          atmosphereAltitude={0.2}
          // Points
          pointsData={pointsData}
          pointLat={(d) => d.lat}
          pointLng={(d) => d.lng}
          pointAltitude={(d) => 0.01 + (d.impactScore / 10) * 0.15}
          pointRadius={(d) => 0.3 + (d.impactScore / 10) * 0.7}
          pointColor={pointColorFn}
          onPointClick={handlePointClick}
          pointLabel={(d) =>
            `<div style="background:#12121A;padding:8px 12px;border-radius:8px;border:1px solid #333;max-width:300px"><b style="color:#fff">${d.headline}</b><br/><span style="color:#9ca3af;font-size:12px">${d.source} · Impact: ${d.impactScore}/10</span></div>`
          }
          // Arcs
          arcsData={arcsData}
          arcColor={() => "rgba(16, 185, 129, 0.3)"}
          arcDashLength={0.5}
          arcDashGap={0.3}
          arcDashAnimateTime={2000}
          arcStroke={0.5}
        />
      )}
    </div>
  );
}

export default GlobeView;
