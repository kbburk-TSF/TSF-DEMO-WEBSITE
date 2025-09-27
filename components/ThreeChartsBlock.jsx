import React from "react";

/**
 * ThreeChartsBlock — self-contained React component.
 * No external libraries, no CSS files. Pure SVG.
 *
 * What it shows (side-by-side, responsive):
 *  1) Classical Forecast (Actual vs ARIMA_M)
 *  2) Targeted Seasonal Forecast (Gold Line)
 *  3) Targeted Seasonal Forecast (Gold Line & Green Zone bands)
 *
 * Props (optional):
 *  - rows: Array of data rows. Each row can include:
 *      {
 *        date: string (YYYY-MM-DD or ISO),
 *        hist?: number,         // historical baseline (optional line)
 *        actual?: number,       // actual values
 *        ARIMA_M?: number,      // classical forecast
 *        SES_M?: number,        // (unused in chart 1, but accepted)
 *        HWES_M?: number,       // (unused in chart 1, but accepted)
 *        TSF?: number,          // targeted seasonal forecast (gold line)
 *        LOW?: number,          // lower band for TSF
 *        HIGH?: number          // upper band for TSF
 *      }
 *  - width: number (overall block max width in px)  — default 1200
 *  - height: number (height for each chart)         — default 260
 *  - margin: {top,right,bottom,left}                — default {top:16,right:24,bottom:28,left:40}
 *
 * Behavior:
 *  - If no props.rows are given, the component renders built-in sample data so it "just works".
 *  - Dates are sorted ascending. Missing values are skipped in polylines.
 *  - No dependencies; can be dropped into any React/Next/Plasmic Codegen site.
 */

const sampleRows = (() => {
  // 31 days of simple demo data so the component renders on its own.
  const out = [];
  const start = new Date("2025-01-01T00:00:00Z");
  for (let i = 0; i < 31; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const base = 100 + Math.sin(i/5) * 15 + i * 0.4;
    const actual = base + (i % 3 === 0 ? 2 : -1) * (5 + (i % 5));
    const tsf = base + 3;
    const low = tsf - 8;
    const high = tsf + 8;
    const arima = base + (i % 7 - 3) * 0.8;
    out.push({
      date: d.toISOString().slice(0,10),
      hist: base - 10,
      actual: Math.round(actual * 10)/10,
      ARIMA_M: Math.round(arima * 10)/10,
      TSF: Math.round(tsf * 10)/10,
      LOW: Math.round(low * 10)/10,
      HIGH: Math.round(high * 10)/10
    });
  }
  return out;
})();

function extent(values) {
  let lo = Infinity, hi = -Infinity;
  for (const v of values) {
    if (v == null || isNaN(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (!isFinite(lo) || !isFinite(hi)) return [0, 1];
  if (lo === hi) return [lo - 1, hi + 1];
  // Small padding
  const pad = (hi - lo) * 0.06;
  return [lo - pad, hi + pad];
}

function scaleLinear(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const m = (r1 - r0) / (d1 - d0 || 1);
  return (x) => r0 + (x - d0) * m;
}

function toDate(x) {
  if (x instanceof Date) return x;
  const d = new Date(x);
  return isNaN(d.getTime()) ? new Date() : d;
}

function pathFromSeries(xs, ys) {
  // Build an SVG path string; breaks on missing values
  let d = "";
  let penDown = false;
  for (let i = 0; i < xs.length; i++) {
    const y = ys[i];
    const x = xs[i];
    if (y == null || isNaN(y)) {
      penDown = false;
      continue;
    }
    if (!penDown) {
      d += `M${x},${y}`;
      penDown = true;
    } else {
      d += ` L${x},${y}`;
    }
  }
  return d;
}

function yTicks(lo, hi, count=4) {
  const step = (hi - lo) / count;
  const arr = [];
  for (let i=0;i<=count;i++) arr.push(lo + i*step);
  return arr;
}

function Chart({
  rows,
  seriesDefs,
  title,
  width=1200,
  height=260,
  margin={top:16,right:24,bottom:28,left:40},
}) {
  const W = width;
  const H = height;
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  // Sort rows by date asc
  const data = [...rows].sort((a,b)=> toDate(a.date) - toDate(b.date));
  const xDates = data.map(d => toDate(d.date).getTime());
  const xDom = [xDates[0], xDates[xDates.length-1]];
  const x = scaleLinear(xDom, [0, innerW]);

  // Gather all y values used by this chart
  const yAll = [];
  for (const s of seriesDefs) {
    if (s.type === "band") {
      for (const d of data) {
        yAll.push(d[s.lowKey], d[s.highKey]);
      }
    } else {
      for (const d of data) yAll.push(d[s.key]);
    }
  }
  const [yLo, yHi] = extent(yAll);
  const y = scaleLinear([yLo, yHi], [innerH, 0]);

  const tickVals = yTicks(yLo, yHi, 4);
  const fmt = (v)=> Math.round(v*10)/10;

  return (
    <div style={{width: W, height: H, display:"flex", flexDirection:"column"}}>
      <div style={{fontWeight:600, padding:"4px 8px"}}>{title}</div>
      <svg width={W} height={H} role="img" aria-label={title}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y ticks */}
          {tickVals.map((tv,i)=>{
            const yy = y(tv);
            return (
              <g key={i}>
                <line x1={0} x2={innerW} y1={yy} y2={yy} stroke="#e5e7eb" strokeWidth="1" />
                <text x={-8} y={yy} textAnchor="end" dominantBaseline="middle" style={{fontSize:11, fill:"#6b7280"}}>
                  {fmt(tv)}
                </text>
              </g>
            );
          })}
          {/* X axis (endpoints only) */}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#9ca3af" strokeWidth="1" />
          <text x={0} y={innerH+18} textAnchor="start" style={{fontSize:11, fill:"#6b7280"}}>
            {new Date(xDom[0]).toISOString().slice(0,10)}
          </text>
          <text x={innerW} y={innerH+18} textAnchor="end" style={{fontSize:11, fill:"#6b7280"}}>
            {new Date(xDom[1]).toISOString().slice(0,10)}
          </text>

          {/* Series */}
          {seriesDefs.map((s, idx)=>{
            if (s.type === "band") {
              // Draw band first (under lines)
              const top = data.map(d => (d[s.highKey]==null?null:y(d[s.highKey])));
              const bot = data.map(d => (d[s.lowKey]==null?null:y(d[s.lowKey])));
              const xs = data.map(d => x(toDate(d.date).getTime()));
              // Build a closed path (top forward, bottom backward)
              const topPath = [];
              const bottomPath = [];
              for (let i=0;i<xs.length;i++){
                if (top[i]==null || bot[i]==null) continue;
                topPath.push([xs[i], top[i]]);
                bottomPath.push([xs[i], bot[i]]);
              }
              if (topPath.length>1 && bottomPath.length>1) {
                const dBand = "M" + topPath.map(p=>`${p[0]},${p[1]}`).join(" L") +
                              " L" + bottomPath.reverse().map(p=>`${p[0]},${p[1]}`).join(" L") + " Z";
                return (
                  <path key={`band-${idx}`} d={dBand} fill="rgba(34,197,94,0.20)" stroke="none" />
                );
              }
              return null;
            }
            // Line series
            const xs = data.map(d => x(toDate(d.date).getTime()));
            const ys = data.map(d => (d[s.key]==null?null:y(d[s.key])));
            const dPath = pathFromSeries(xs, ys);
            return (
              <path
                key={`line-${idx}`}
                d={dPath}
                fill="none"
                stroke={s.color || (s.kind==="actual" ? "#111827" : s.kind==="forecast" ? "#d97706" : "#2563eb")}
                strokeWidth={s.kind==="actual" ? 2.25 : 1.75}
                strokeDasharray={s.dashed ? "4 3" : "none"}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default function ThreeChartsBlock({
  rows = sampleRows,
  width = 1200,
  height = 260,
  margin = {top:16,right:24,bottom:28,left:40}
}) {
  const colGap = 16;
  const colW = Math.floor((width - colGap*2) / 3);

  return (
    <div style={{width: width, display:"grid", gridTemplateColumns:`${colW}px ${colW}px ${colW}px`, gap:`${colGap}px`}}>
      {/* 1) Classical Forecast (Actual vs ARIMA_M) */}
      <Chart
        rows={rows}
        width={colW}
        height={height}
        margin={margin}
        title="Classical Forecast (Actual vs ARIMA_M)"
        seriesDefs={[
          { key:"actual", kind:"actual", color:"#111827" },
          { key:"ARIMA_M", kind:"forecast", color:"#1f2937", dashed:true }
        ]}
      />
      {/* 2) Targeted Seasonal (Gold Line) */}
      <Chart
        rows={rows}
        width={colW}
        height={height}
        margin={margin}
        title="Targeted Seasonal Forecast (Gold Line)"
        seriesDefs={[
          { key:"actual", kind:"actual", color:"#111827" },
          { key:"TSF", kind:"forecast", color:"#d97706" }
        ]}
      />
      {/* 3) Targeted Seasonal (Gold Line & Green Zone) */}
      <Chart
        rows={rows}
        width={colW}
        height={height}
        margin={margin}
        title="Targeted Seasonal (Gold Line & Green Zone)"
        seriesDefs={[
          { type:"band", lowKey:"LOW", highKey:"HIGH" },
          { key:"actual", kind:"actual", color:"#111827" },
          { key:"TSF", kind:"forecast", color:"#d97706" }
        ]}
      />
    </div>
  );
}
