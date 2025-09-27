import React, {useMemo, useState} from "react";

/**
 * DashboardBlock — self-contained React component (no dependencies).
 * Layout: left selector; top row of 3 charts; bottom wide chart.
 * Pure SVG; renders with built-in demo data.
 */

const demoRows = (() => {
  const out = [];
  const start = new Date("2025-01-01T00:00:00Z").getTime();
  for (let i = 0; i < 31; i++) {
    const t = start + i*86400000;
    const base = 100 + Math.sin(i/4)*12 + i*0.35;
    const actual = base + (i%5-2)*1.6 + (i%2?2:-1);
    const tsf = base + 2.5;
    const low = tsf - 7.5;
    const high = tsf + 7.5;
    const arima = base + (i%7-3)*0.9;
    out.push({
      date: new Date(t).toISOString().slice(0,10),
      actual: +(actual.toFixed(1)),
      ARIMA_M: +(arima.toFixed(1)),
      TSF: +(tsf.toFixed(1)),
      LOW: +(low.toFixed(1)),
      HIGH: +(high.toFixed(1)),
    });
  }
  return out;
})();

const toDate = (d) => (d instanceof Date ? d : new Date(d));
function extent(vals) {
  let lo = Infinity, hi = -Infinity;
  for (const v of vals) {
    if (v==null || isNaN(v)) continue;
    if (v<lo) lo=v;
    if (v>hi) hi=v;
  }
  if (!isFinite(lo) || !isFinite(hi)) return [0,1];
  if (lo===hi) return [lo-1,hi+1];
  const pad = (hi-lo)*0.06;
  return [lo-pad, hi+pad];
}
function scaleLinear([d0,d1],[r0,r1]) {
  const m = (r1-r0)/((d1-d0)||1);
  return (x)=> r0 + (x-d0)*m;
}
function yTicks(lo, hi, n=4) {
  const step=(hi-lo)/n, arr=[];
  for (let i=0;i<=n;i++) arr.push(lo+i*step);
  return arr;
}
function pathFromSeries(xs, ys) {
  let d="", pen=false;
  for (let i=0;i<xs.length;i++) {
    const y=ys[i], x=xs[i];
    if (y==null || isNaN(y)) { pen=false; continue; }
    if (!pen) { d += `M${x},${y}`; pen=true; }
    else { d += ` L${x},${y}`; }
  }
  return d;
}

function MiniChart({rows, title, seriesDefs, width, height}) {
  const margin = {top:18,right:20,bottom:26,left:36};
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const data = useMemo(()=>[...rows].sort((a,b)=>toDate(a.date)-toDate(b.date)),[rows]);
  const xs = data.map(d=>toDate(d.date).getTime());
  const x = scaleLinear([xs[0], xs[xs.length-1]],[0,innerW]);

  const yAll = [];
  for (const s of seriesDefs) {
    if (s.type==="band") {
      for (const d of data) { yAll.push(d[s.lowKey], d[s.highKey]); }
    } else {
      for (const d of data) yAll.push(d[s.key]);
    }
  }
  const [yLo,yHi] = extent(yAll);
  const y = scaleLinear([yLo,yHi],[innerH,0]);
  const ticks = yTicks(yLo,yHi,4);
  const fmt = (v)=>Math.round(v*10)/10;

  return (
    <div style={{width, height, display:"flex", flexDirection:"column", background:"#fff"}}>
      <div style={{fontWeight:600, padding:"4px 8px"}}>{title}</div>
      <svg width={width} height={height} role="img" aria-label={title}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {ticks.map((tv,i)=>{
            const yy = y(tv);
            return (
              <g key={i}>
                <line x1={0} x2={innerW} y1={yy} y2={yy} stroke="#e5e7eb" strokeWidth="1"/>
                <text x={-8} y={yy} textAnchor="end" dominantBaseline="middle" style={{fontSize:11, fill:"#6b7280"}}>{fmt(tv)}</text>
              </g>
            );
          })}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#9ca3af" strokeWidth="1"/>
          <text x={0} y={innerH+18} textAnchor="start" style={{fontSize:11, fill:"#6b7280"}}>{new Date(xs[0]).toISOString().slice(0,10)}</text>
          <text x={innerW} y={innerH+18} textAnchor="end" style={{fontSize:11, fill:"#6b7280"}}>{new Date(xs[xs.length-1]).toISOString().slice(0,10)}</text>

          {seriesDefs.map((s, idx)=>{
            if (s.type==="band") {
              const top = data.map(d => (d[s.highKey]==null?null:y(d[s.highKey])));
              const bot = data.map(d => (d[s.lowKey]==null?null:y(d[s.lowKey])));
              const xpts = data.map(d => x(toDate(d.date).getTime()));
              const topPath=[], botPath=[];
              for (let i=0;i<xpts.length;i++){
                if (top[i]==null || bot[i]==null) continue;
                topPath.push([xpts[i], top[i]]);
                botPath.push([xpts[i], bot[i]]);
              }
              if (topPath.length>1 && botPath.length>1) {
                const dBand = "M"+topPath.map(p=>`${p[0]},${p[1]}`).join(" L")+" L"+botPath.reverse().map(p=>`${p[0]},${p[1]}`).join(" L")+" Z";
                return <path key={`band-${idx}`} d={dBand} fill="rgba(34,197,94,0.20)" stroke="none"/>;
              }
              return null;
            }
            const xpts = data.map(d => x(toDate(d.date).getTime()));
            const ypts = data.map(d => (d[s.key]==null?null:y(d[s.key])));
            const dPath = pathFromSeries(xpts, ypts);
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

export default function DashboardBlock({
  rows = demoRows,
  width = 1200,
  topHeight = 220,
  bottomHeight = 360,
  seriesList = [{value:"demo", label:"Demo Series"}],
}) {
  const [series, setSeries] = useState(seriesList[0]?.value ?? "demo");
  const gap = 16;
  const leftW = 260;
  const rightW = width - leftW - gap;
  const smallW = Math.floor((rightW - gap*2)/3);

  return (
    <div style={{width, fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, sans-serif"}}>
      <div style={{display:"grid", gridTemplateColumns:`${leftW}px ${smallW}px ${smallW}px ${smallW}px`, gap:`${gap}px`}}>
        <div style={{background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:12, padding:"12px"}}>
          <div style={{fontWeight:700, marginBottom:8}}>Select Series</div>
          <div style={{fontSize:12, color:"#6b7280", marginBottom:8}}>This only changes the label for now.</div>
          <select value={series} onChange={e=>setSeries(e.target.value)} style={{width:"100%", padding:"8px", borderRadius:8, border:"1px solid #d1d5db"}}>
            {seriesList.map((s)=>(<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
          <div style={{marginTop:12, fontSize:12, color:"#6b7280"}}>Current: <strong>{series}</strong></div>
        </div>

        <MiniChart
          rows={rows}
          width={smallW}
          height={topHeight}
          title="Classical Forecast (Actual vs ARIMA_M)"
          seriesDefs={[{ key:"actual", kind:"actual" }, { key:"ARIMA_M", kind:"forecast", dashed:true }]}
        />
        <MiniChart
          rows={rows}
          width={smallW}
          height={topHeight}
          title="Targeted Seasonal Forecast (Gold Line)"
          seriesDefs={[{ key:"actual", kind:"actual" }, { key:"TSF", kind:"forecast" }]}
        />
        <MiniChart
          rows={rows}
          width={smallW}
          height={topHeight}
          title="Targeted Seasonal Forecast (Gold Line & Green Zone)"
          seriesDefs={[{ type:"band", lowKey:"LOW", highKey:"HIGH" }, { key:"actual", kind:"actual" }, { key:"TSF", kind:"forecast" }]}
        />
      </div>

      <div style={{marginTop:gap}}>
        <MiniChart
          rows={rows}
          width={width}
          height={bottomHeight}
          title="Targeted Seasonal Forecast View"
          seriesDefs={[{ type:"band", lowKey:"LOW", highKey:"HIGH" }, { key:"actual", kind:"actual" }, { key:"TSF", kind:"forecast" }]}
        />
      </div>
    </div>
  );
}
