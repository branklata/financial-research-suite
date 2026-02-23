import { useState, useMemo, useCallback, useEffect } from "react";

// ─── Company Data ────────────────────────────────────────────────────────────
// Consensus estimates + line-item breakdown for modeling

const COMPANIES = {
  NVDA: {
    name: "NVIDIA Corp.", sector: "Semiconductors", cap: "Large",
    lastReported: "Q4 FY25", nextReport: "May 28, 2026",
    consensus: {
      revenue: 42500, revenueUnit: "M",
      cogs: 11050, grossProfit: 31450,
      opex: 5950, operatingIncome: 25500,
      interestOther: 450, preTax: 25950,
      taxRate: 0.12, netIncome: 22836,
      sharesOut: 24500, eps: 0.93,
    },
    segments: [
      { name: "Data Center", revenue: 37800, growth: 0.52, margin: 0.78 },
      { name: "Gaming", revenue: 3200, growth: 0.08, margin: 0.55 },
      { name: "Professional Viz", revenue: 600, growth: 0.12, margin: 0.62 },
      { name: "Auto & Robotics", revenue: 900, growth: 0.35, margin: 0.45 },
    ],
    historicalEPS: [
      { q: "Q1 FY25", consensus: 0.58, actual: 0.68 },
      { q: "Q2 FY25", consensus: 0.64, actual: 0.74 },
      { q: "Q3 FY25", consensus: 0.75, actual: 0.81 },
      { q: "Q4 FY25", consensus: 0.84, actual: 0.96 },
    ],
  },
  AAPL: {
    name: "Apple Inc.", sector: "Consumer Electronics", cap: "Large",
    lastReported: "Q1 FY26", nextReport: "Apr 30, 2026",
    consensus: {
      revenue: 95400, revenueUnit: "M",
      cogs: 53024, grossProfit: 42376,
      opex: 15264, operatingIncome: 27112,
      interestOther: 300, preTax: 27412,
      taxRate: 0.153, netIncome: 23218,
      sharesOut: 15200, eps: 1.53,
    },
    segments: [
      { name: "iPhone", revenue: 51000, growth: 0.03, margin: 0.42 },
      { name: "Mac", revenue: 9500, growth: 0.12, margin: 0.35 },
      { name: "iPad", revenue: 7200, growth: 0.08, margin: 0.38 },
      { name: "Wearables", revenue: 8700, growth: -0.02, margin: 0.32 },
      { name: "Services", revenue: 19000, growth: 0.16, margin: 0.72 },
    ],
    historicalEPS: [
      { q: "Q2 FY25", consensus: 1.38, actual: 1.46 },
      { q: "Q3 FY25", consensus: 1.58, actual: 1.64 },
      { q: "Q4 FY25", consensus: 2.32, actual: 2.40 },
      { q: "Q1 FY26", consensus: 2.38, actual: 2.42 },
    ],
  },
  MSFT: {
    name: "Microsoft Corp.", sector: "Software", cap: "Large",
    lastReported: "Q2 FY26", nextReport: "Apr 22, 2026",
    consensus: {
      revenue: 70800, revenueUnit: "M",
      cogs: 22656, grossProfit: 48144,
      opex: 17700, operatingIncome: 30444,
      interestOther: 600, preTax: 31044,
      taxRate: 0.17, netIncome: 25766,
      sharesOut: 7430, eps: 3.47,
    },
    segments: [
      { name: "Intelligent Cloud", revenue: 27400, growth: 0.22, margin: 0.48 },
      { name: "Productivity & Business", revenue: 21200, growth: 0.13, margin: 0.52 },
      { name: "More Personal Computing", revenue: 22200, growth: 0.08, margin: 0.38 },
    ],
    historicalEPS: [
      { q: "Q3 FY25", consensus: 2.85, actual: 2.94 },
      { q: "Q4 FY25", consensus: 3.10, actual: 3.13 },
      { q: "Q1 FY26", consensus: 3.25, actual: 3.32 },
      { q: "Q2 FY26", consensus: 3.38, actual: 3.46 },
    ],
  },
  SPGI: {
    name: "S&P Global", sector: "Financial Data", cap: "Large",
    lastReported: "Q4 2024", nextReport: "Apr 24, 2026",
    consensus: {
      revenue: 3720, revenueUnit: "M",
      cogs: 1116, grossProfit: 2604,
      opex: 1116, operatingIncome: 1488,
      interestOther: -120, preTax: 1368,
      taxRate: 0.215, netIncome: 1074,
      sharesOut: 308, eps: 3.49,
    },
    segments: [
      { name: "Ratings", revenue: 1150, growth: 0.18, margin: 0.65 },
      { name: "Market Intelligence", revenue: 1180, growth: 0.07, margin: 0.34 },
      { name: "S&P Indices", revenue: 480, growth: 0.14, margin: 0.72 },
      { name: "Commodity Insights", revenue: 530, growth: 0.09, margin: 0.48 },
      { name: "Mobility", revenue: 380, growth: 0.10, margin: 0.40 },
    ],
    historicalEPS: [
      { q: "Q1 2024", consensus: 3.18, actual: 3.38 },
      { q: "Q2 2024", consensus: 3.35, actual: 3.54 },
      { q: "Q3 2024", consensus: 3.48, actual: 3.67 },
      { q: "Q4 2024", consensus: 3.55, actual: 3.72 },
    ],
  },
  DDOG: {
    name: "Datadog Inc.", sector: "Cloud Software", cap: "Mid",
    lastReported: "Q4 2024", nextReport: "May 6, 2026",
    consensus: {
      revenue: 755, revenueUnit: "M",
      cogs: 196, grossProfit: 559,
      opex: 430, operatingIncome: 129,
      interestOther: 18, preTax: 147,
      taxRate: 0.08, netIncome: 135,
      sharesOut: 340, eps: 0.40,
    },
    segments: [
      { name: "Infrastructure Monitoring", revenue: 310, growth: 0.22, margin: 0.78 },
      { name: "APM & Observability", revenue: 230, growth: 0.28, margin: 0.72 },
      { name: "Log Management", revenue: 145, growth: 0.20, margin: 0.70 },
      { name: "Security & Other", revenue: 70, growth: 0.45, margin: 0.55 },
    ],
    historicalEPS: [
      { q: "Q1 2024", consensus: 0.32, actual: 0.38 },
      { q: "Q2 2024", consensus: 0.35, actual: 0.43 },
      { q: "Q3 2024", consensus: 0.38, actual: 0.46 },
      { q: "Q4 2024", consensus: 0.43, actual: 0.48 },
    ],
  },
};

// ─── Calculation Engine ──────────────────────────────────────────────────────

function recalculate(base, overrides) {
  const o = { ...base, ...overrides };
  const revenue = o.revenue;
  const grossProfit = revenue - o.cogs;
  const grossMargin = grossProfit / revenue;
  const operatingIncome = grossProfit - o.opex;
  const opMargin = operatingIncome / revenue;
  const preTax = operatingIncome + o.interestOther;
  const netIncome = preTax * (1 - o.taxRate);
  const eps = netIncome / o.sharesOut;
  return { revenue, cogs: o.cogs, grossProfit, grossMargin, opex: o.opex, operatingIncome, opMargin, interestOther: o.interestOther, preTax, taxRate: o.taxRate, netIncome, sharesOut: o.sharesOut, eps };
}

// ─── Components ──────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, onChange, format, unit, consensusVal, description }) {
  const pctDiff = ((value - consensusVal) / consensusVal) * 100;
  const isChanged = Math.abs(pctDiff) > 0.05;
  const diffColor = label === "Tax Rate" || label === "COGS" || label === "OpEx" || label === "Shares Out"
    ? (pctDiff > 0 ? "#e85a4f" : "#3ac99a")
    : (pctDiff > 0 ? "#3ac99a" : "#e85a4f");

  return (
    <div style={{
      padding: "14px 16px", borderRadius: 8,
      background: isChanged ? "rgba(255,255,255,0.025)" : "transparent",
      border: isChanged ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      transition: "all 0.25s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 12, fontFamily: "var(--body)", fontWeight: 600, color: "#dad5cb" }}>{label}</span>
          {description && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "var(--body)", marginLeft: 8 }}>{description}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700,
            color: isChanged ? "#f0ebe3" : "rgba(255,255,255,0.5)",
            transition: "color 0.2s"
          }}>
            {format ? format(value) : value}
            {unit && <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.5, marginLeft: 2 }}>{unit}</span>}
          </span>
          {isChanged && (
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
              color: diffColor, padding: "2px 5px", borderRadius: 3,
              background: `${diffColor}12`, border: `1px solid ${diffColor}25`
            }}>
              {pctDiff > 0 ? "+" : ""}{pctDiff.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div style={{ position: "relative", marginTop: 8 }}>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            width: "100%", height: 4, appearance: "none", WebkitAppearance: "none",
            background: `linear-gradient(to right, ${isChanged ? "#c9a84c" : "rgba(255,255,255,0.15)"} 0%, ${isChanged ? "#c9a84c" : "rgba(255,255,255,0.15)"} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.06) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.06) 100%)`,
            borderRadius: 2, cursor: "pointer", outline: "none",
          }}
        />
        {/* Consensus marker */}
        <div style={{
          position: "absolute",
          left: `${((consensusVal - min) / (max - min)) * 100}%`,
          top: -3, width: 1, height: 10,
          background: "rgba(255,255,255,0.25)",
          transform: "translateX(-0.5px)",
          pointerEvents: "none"
        }} />
      </div>
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: ${isChanged ? "#c9a84c" : "#888"}; border: 2px solid #0d0d10;
          cursor: pointer; box-shadow: 0 0 ${isChanged ? "8px rgba(201,168,76,0.3)" : "0 transparent"};
          transition: all 0.2s;
        }
      `}</style>
    </div>
  );
}

function WaterfallBar({ label, value, maxVal, color, isSubtraction, format }) {
  const width = Math.min(Math.abs(value) / maxVal * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
      <span style={{
        width: 130, fontSize: 11, fontFamily: "var(--body)", color: "rgba(255,255,255,0.45)",
        textAlign: "right", flexShrink: 0
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 18, background: "rgba(255,255,255,0.02)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
        <div style={{
          width: `${width}%`, height: "100%",
          background: color,
          borderRadius: 3,
          transition: "width 0.4s ease, background 0.3s ease",
          opacity: 0.7,
        }} />
      </div>
      <span style={{
        width: 80, fontSize: 12, fontFamily: "var(--mono)", fontWeight: 600,
        color: isSubtraction ? "#e85a4f" : color,
        textAlign: "right", flexShrink: 0
      }}>
        {isSubtraction ? "−" : ""}{format ? format(Math.abs(value)) : `$${Math.abs(value).toLocaleString()}M`}
      </span>
    </div>
  );
}

function EpsHistoryChart({ data, yourEps }) {
  const allVals = [...data.map(d => d.actual), ...data.map(d => d.consensus), yourEps].filter(Boolean);
  const maxVal = Math.max(...allVals) * 1.1;
  const minVal = Math.min(...allVals) * 0.85;
  const range = maxVal - minVal;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 0, height: 120, padding: "0 8px" }}>
      {data.map((d, i) => {
        const beatPct = ((d.actual - d.consensus) / d.consensus * 100).toFixed(1);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
            <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "#3ac99a", fontWeight: 600 }}>
              +{beatPct}%
            </span>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 70 }}>
              <div style={{
                width: 14, borderRadius: "3px 3px 0 0",
                height: `${((d.consensus - minVal) / range) * 70}px`,
                background: "rgba(255,255,255,0.1)",
                transition: "height 0.4s ease"
              }} />
              <div style={{
                width: 14, borderRadius: "3px 3px 0 0",
                height: `${((d.actual - minVal) / range) * 70}px`,
                background: "#3ac99a",
                opacity: 0.7,
                transition: "height 0.4s ease"
              }} />
            </div>
            <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
              {d.q}
            </span>
          </div>
        );
      })}
      {/* Your estimate */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "#c9a84c", fontWeight: 700 }}>
          YOU
        </span>
        <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 70 }}>
          <div style={{
            width: 14, borderRadius: "3px 3px 0 0",
            height: `${((data[data.length - 1]?.consensus || yourEps - minVal) / range) * 70}px`,
            background: "rgba(255,255,255,0.1)",
          }} />
          <div style={{
            width: 14, borderRadius: "3px 3px 0 0",
            height: `${((yourEps - minVal) / range) * 70}px`,
            background: "#c9a84c",
            opacity: 0.9,
            transition: "height 0.4s ease",
            boxShadow: "0 0 8px rgba(201,168,76,0.2)"
          }} />
        </div>
        <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "#c9a84c" }}>
          Next Q
        </span>
      </div>
    </div>
  );
}

function SegmentEditor({ segments, onChange }) {
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr 80px 80px 80px",
        padding: "8px 12px", gap: 8,
        fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1.5,
        textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
        borderBottom: "1px solid rgba(255,255,255,0.04)"
      }}>
        <div>Segment</div>
        <div>Revenue Adj.</div>
        <div style={{ textAlign: "right" }}>Revenue</div>
        <div style={{ textAlign: "right" }}>Growth</div>
        <div style={{ textAlign: "right" }}>Margin</div>
      </div>
      {segments.map((seg, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "140px 1fr 80px 80px 80px",
          padding: "8px 12px", gap: 8, alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.02)",
        }}>
          <span style={{ fontSize: 12, fontFamily: "var(--body)", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            {seg.name}
          </span>
          <input
            type="range"
            min={seg.revenue * 0.8} max={seg.revenue * 1.2}
            step={seg.revenue > 1000 ? 50 : 5}
            value={seg.adjustedRevenue ?? seg.revenue}
            onChange={e => {
              const newSegs = [...segments];
              newSegs[i] = { ...seg, adjustedRevenue: parseFloat(e.target.value) };
              onChange(newSegs);
            }}
            style={{
              width: "100%", height: 3, appearance: "none", WebkitAppearance: "none",
              background: `linear-gradient(to right, #c9a84c44 0%, #c9a84c44 ${(((seg.adjustedRevenue ?? seg.revenue) - seg.revenue * 0.8) / (seg.revenue * 0.4)) * 100}%, rgba(255,255,255,0.04) ${(((seg.adjustedRevenue ?? seg.revenue) - seg.revenue * 0.8) / (seg.revenue * 0.4)) * 100}%, rgba(255,255,255,0.04) 100%)`,
              borderRadius: 2, cursor: "pointer", outline: "none",
            }}
          />
          <span style={{
            textAlign: "right", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 600,
            color: (seg.adjustedRevenue ?? seg.revenue) !== seg.revenue ? "#f0ebe3" : "rgba(255,255,255,0.4)"
          }}>
            ${(seg.adjustedRevenue ?? seg.revenue).toLocaleString()}
          </span>
          <span style={{ textAlign: "right", fontSize: 11, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.3)" }}>
            {(seg.growth * 100).toFixed(0)}%
          </span>
          <span style={{ textAlign: "right", fontSize: 11, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.3)" }}>
            {(seg.margin * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function ConsensusTearApart() {
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const [overrides, setOverrides] = useState({});
  const [segments, setSegments] = useState(null);
  const [activeTab, setActiveTab] = useState("pnl");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimateIn(true), 50); }, []);

  const company = COMPANIES[selectedTicker];
  const base = company.consensus;

  // Sync segments when company changes
  useEffect(() => {
    setSegments(company.segments.map(s => ({ ...s })));
    setOverrides({});
  }, [selectedTicker]);

  const currentSegments = segments || company.segments;

  // Calculate segment-driven revenue
  const segmentRevenue = currentSegments.reduce((sum, s) => sum + (s.adjustedRevenue ?? s.revenue), 0);
  const hasSegmentOverride = currentSegments.some(s => s.adjustedRevenue !== undefined && s.adjustedRevenue !== s.revenue);

  // Active overrides (segment revenue flows into main model)
  const activeOverrides = {
    ...overrides,
    ...(hasSegmentOverride ? { revenue: segmentRevenue } : {}),
  };

  const model = useMemo(() => recalculate(base, activeOverrides), [base, activeOverrides]);
  const consensusModel = useMemo(() => recalculate(base, {}), [base]);

  const epsDiff = model.eps - consensusModel.eps;
  const epsDiffPct = (epsDiff / consensusModel.eps) * 100;

  const setOverride = useCallback((key, value) => {
    setOverrides(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = () => {
    setOverrides({});
    setSegments(company.segments.map(s => ({ ...s })));
  };

  const hasChanges = Object.keys(overrides).length > 0 || hasSegmentOverride;

  const fmt = (v) => `$${v.toLocaleString()}`;
  const fmtM = (v) => `$${v.toLocaleString()}M`;
  const fmtPct = (v) => `${(v * 100).toFixed(1)}%`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d10",
      color: "#dad5cb",
      fontFamily: "'Crimson Pro', Georgia, serif",
      opacity: animateIn ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700;800&family=Overpass+Mono:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing: border-box; }
        :root { --mono: 'Overpass Mono', monospace; --body: 'Source Sans 3', sans-serif; --display: 'Crimson Pro', Georgia, serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%;
          background: #c9a84c; border: 2px solid #0d0d10; cursor: pointer;
        }
      `}</style>

      {/* ── Header ─────────────────────────────────── */}
      <header style={{
        padding: "30px 36px 22px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "linear-gradient(180deg, rgba(201,168,76,0.015) 0%, transparent 100%)",
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{
                fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase",
                fontFamily: "var(--mono)", fontWeight: 600, color: "#c9a84c", marginBottom: 6
              }}>
                Consensus Tear-Apart
              </div>
              <h1 style={{
                fontFamily: "var(--display)", fontSize: 32, fontWeight: 800,
                margin: 0, color: "#f0ebe3", letterSpacing: -0.3, lineHeight: 1.1
              }}>
                Challenge the Street
              </h1>
              <p style={{
                fontSize: 13, fontFamily: "var(--body)", color: "rgba(255,255,255,0.3)",
                marginTop: 4, maxWidth: 440
              }}>
                Decompose consensus EPS into its building blocks. Adjust any assumption to see how your variant view flows through to a different number.
              </p>
            </div>

            {/* EPS Output — the hero number */}
            <div style={{
              textAlign: "right", padding: "12px 20px",
              background: hasChanges ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.015)",
              border: `1px solid ${hasChanges ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 12, minWidth: 200,
              transition: "all 0.4s ease"
            }}>
              <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                {hasChanges ? "Your EPS Estimate" : "Consensus EPS"}
              </div>
              <div style={{
                fontSize: 44, fontFamily: "var(--mono)", fontWeight: 700,
                color: hasChanges ? "#c9a84c" : "rgba(255,255,255,0.5)",
                lineHeight: 1, transition: "color 0.3s ease",
                textShadow: hasChanges ? "0 0 30px rgba(201,168,76,0.15)" : "none"
              }}>
                ${model.eps.toFixed(2)}
              </div>
              {hasChanges && (
                <div style={{
                  fontSize: 13, fontFamily: "var(--mono)", fontWeight: 600, marginTop: 4,
                  color: epsDiff >= 0 ? "#3ac99a" : "#e85a4f"
                }}>
                  {epsDiff >= 0 ? "▲" : "▼"} ${Math.abs(epsDiff).toFixed(2)} ({epsDiffPct >= 0 ? "+" : ""}{epsDiffPct.toFixed(1)}% vs consensus)
                </div>
              )}
              <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                Consensus: ${consensusModel.eps.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Company Selector */}
          <div style={{ display: "flex", gap: 6, marginTop: 20, alignItems: "center" }}>
            {Object.entries(COMPANIES).map(([ticker, co]) => (
              <button key={ticker} onClick={() => setSelectedTicker(ticker)} style={{
                padding: "7px 14px", borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
                border: selectedTicker === ticker ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.06)",
                background: selectedTicker === ticker ? "rgba(201,168,76,0.08)" : "transparent",
                color: selectedTicker === ticker ? "#c9a84c" : "rgba(255,255,255,0.35)",
                fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 0.5
              }}>
                {ticker}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            {hasChanges && (
              <button onClick={resetAll} style={{
                padding: "6px 14px", borderRadius: 5, cursor: "pointer",
                border: "1px solid rgba(232,90,79,0.2)", background: "rgba(232,90,79,0.06)",
                color: "#e85a4f", fontFamily: "var(--mono)", fontSize: 10,
                fontWeight: 600, letterSpacing: 0.5
              }}>
                Reset All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 36px", display: "flex", gap: 24 }}>

        {/* Left: Input Sliders */}
        <div style={{ width: 380, flexShrink: 0 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {[
              { key: "pnl", label: "P&L Drivers" },
              { key: "segments", label: "Segments" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                border: activeTab === tab.key ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(255,255,255,0.05)",
                background: activeTab === tab.key ? "rgba(201,168,76,0.05)" : "transparent",
                color: activeTab === tab.key ? "#c9a84c" : "rgba(255,255,255,0.3)",
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                transition: "all 0.15s"
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "pnl" ? (
            <div style={{
              background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 10, padding: "8px 4px", display: "flex", flexDirection: "column", gap: 2
            }}>
              <Slider label="Revenue" value={overrides.revenue ?? base.revenue} min={base.revenue * 0.85} max={base.revenue * 1.15}
                step={base.revenue > 10000 ? 100 : 5} onChange={v => setOverride("revenue", v)}
                format={v => `$${(v / 1000).toFixed(1)}B`} consensusVal={base.revenue} description="Top line" />
              <Slider label="COGS" value={overrides.cogs ?? base.cogs} min={base.cogs * 0.85} max={base.cogs * 1.15}
                step={base.cogs > 5000 ? 50 : 5} onChange={v => setOverride("cogs", v)}
                format={v => `$${v.toLocaleString()}M`} consensusVal={base.cogs} description="Cost of goods sold" />
              <Slider label="OpEx" value={overrides.opex ?? base.opex} min={base.opex * 0.8} max={base.opex * 1.2}
                step={base.opex > 5000 ? 50 : 5} onChange={v => setOverride("opex", v)}
                format={v => `$${v.toLocaleString()}M`} consensusVal={base.opex} description="R&D + SG&A" />
              <Slider label="Interest & Other" value={overrides.interestOther ?? base.interestOther}
                min={Math.min(base.interestOther * 0.5, base.interestOther - 200)} max={Math.max(base.interestOther * 2, base.interestOther + 500)}
                step={10} onChange={v => setOverride("interestOther", v)}
                format={v => `$${v.toLocaleString()}M`} consensusVal={base.interestOther} description="Net interest income" />
              <Slider label="Tax Rate" value={overrides.taxRate ?? base.taxRate}
                min={Math.max(0.01, base.taxRate - 0.06)} max={base.taxRate + 0.06}
                step={0.005} onChange={v => setOverride("taxRate", v)}
                format={v => `${(v * 100).toFixed(1)}%`} consensusVal={base.taxRate} description="Effective rate" />
              <Slider label="Shares Out" value={overrides.sharesOut ?? base.sharesOut}
                min={base.sharesOut * 0.95} max={base.sharesOut * 1.05}
                step={base.sharesOut > 5000 ? 50 : 1} onChange={v => setOverride("sharesOut", v)}
                format={v => `${v.toLocaleString()}M`} consensusVal={base.sharesOut} description="Diluted shares" />
            </div>
          ) : (
            <div style={{
              background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 10, padding: "10px 4px"
            }}>
              <div style={{ padding: "4px 12px 8px", fontSize: 11, fontFamily: "var(--body)", color: "rgba(255,255,255,0.3)" }}>
                Adjust segment revenue to build a bottom-up revenue estimate. Total flows into the P&L model.
              </div>
              <SegmentEditor segments={currentSegments} onChange={setSegments} />
              <div style={{
                padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex", justifyContent: "space-between", marginTop: 6
              }}>
                <span style={{ fontSize: 12, fontFamily: "var(--body)", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                  Total Revenue
                </span>
                <span style={{
                  fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700,
                  color: hasSegmentOverride ? "#c9a84c" : "rgba(255,255,255,0.5)"
                }}>
                  ${segmentRevenue.toLocaleString()}M
                  {hasSegmentOverride && (
                    <span style={{ fontSize: 10, marginLeft: 6, color: segmentRevenue > base.revenue ? "#3ac99a" : "#e85a4f" }}>
                      ({segmentRevenue > base.revenue ? "+" : ""}{((segmentRevenue - base.revenue) / base.revenue * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Beat History */}
          <div style={{
            marginTop: 16, background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 12px"
          }}>
            <div style={{
              fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
              textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10
            }}>
              Trailing EPS Beats vs. Consensus
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, background: "rgba(255,255,255,0.1)", borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>Consensus</span>
              <div style={{ width: 10, height: 10, background: "#3ac99a", borderRadius: 2, marginLeft: 8, opacity: 0.7 }} />
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>Actual</span>
              <div style={{ width: 10, height: 10, background: "#c9a84c", borderRadius: 2, marginLeft: 8 }} />
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>Your Est.</span>
            </div>
            <EpsHistoryChart data={company.historicalEPS} yourEps={model.eps} />
          </div>
        </div>

        {/* Right: Output Model */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* P&L Waterfall */}
          <div style={{
            background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 10, padding: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
              <div style={{
                fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)"
              }}>
                P&L Build — {company.name} — Next Quarter
              </div>
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.15)" }}>
                Report: {company.nextReport}
              </span>
            </div>

            {/* Income Statement Table */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "Revenue", yours: model.revenue, cons: consensusModel.revenue, isBold: true },
                { label: "Cost of Goods Sold", yours: -model.cogs, cons: -consensusModel.cogs, isSub: true },
                { label: "Gross Profit", yours: model.grossProfit, cons: consensusModel.grossProfit, isBold: true, margin: model.grossMargin, consMargin: consensusModel.grossMargin },
                { label: "Operating Expenses", yours: -model.opex, cons: -consensusModel.opex, isSub: true },
                { label: "Operating Income", yours: model.operatingIncome, cons: consensusModel.operatingIncome, isBold: true, margin: model.opMargin, consMargin: consensusModel.opMargin },
                { label: "Interest & Other Income", yours: model.interestOther, cons: consensusModel.interestOther, isSmall: true },
                { label: "Pre-Tax Income", yours: model.preTax, cons: consensusModel.preTax, isBold: true },
                { label: `Taxes (${(model.taxRate * 100).toFixed(1)}%)`, yours: -(model.preTax * model.taxRate), cons: -(consensusModel.preTax * consensusModel.taxRate), isSub: true },
                { label: "Net Income", yours: model.netIncome, cons: consensusModel.netIncome, isBold: true, isHighlight: true },
                { label: `÷ Shares (${model.sharesOut.toLocaleString()}M)`, yours: null, cons: null, isDivider: true },
                { label: "Earnings Per Share", yours: model.eps, cons: consensusModel.eps, isEps: true, isHighlight: true },
              ].map((row, i) => {
                if (row.isDivider) {
                  return (
                    <div key={i} style={{
                      padding: "6px 12px", fontSize: 10, fontFamily: "var(--mono)",
                      color: "rgba(255,255,255,0.15)", borderTop: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      {row.label}
                    </div>
                  );
                }

                const diff = row.yours - row.cons;
                const hasDiff = Math.abs(diff) > 0.005;
                const isPositive = row.isSub ? diff < 0 : diff > 0;

                return (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 100px 90px 70px",
                    padding: `${row.isBold ? 8 : 5}px 12px`,
                    alignItems: "center",
                    borderTop: row.isBold || row.isHighlight ? "1px solid rgba(255,255,255,0.06)" : "none",
                    background: row.isHighlight ? "rgba(201,168,76,0.03)" : "transparent",
                    transition: "background 0.3s ease"
                  }}>
                    <span style={{
                      fontSize: row.isBold ? 13 : 12,
                      fontFamily: "var(--body)",
                      fontWeight: row.isBold ? 700 : 400,
                      color: row.isHighlight ? "#f0ebe3" : row.isSub ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)",
                      paddingLeft: row.isSub ? 16 : 0
                    }}>
                      {row.label}
                    </span>
                    <span style={{
                      textAlign: "right", fontSize: 12, fontFamily: "var(--mono)",
                      color: "rgba(255,255,255,0.25)"
                    }}>
                      {row.isEps ? `$${row.cons.toFixed(2)}` : `$${Math.abs(row.cons).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    </span>
                    <span style={{
                      textAlign: "right", fontSize: row.isEps ? 14 : 12,
                      fontFamily: "var(--mono)", fontWeight: hasDiff ? 700 : 400,
                      color: hasDiff ? (row.isHighlight ? "#c9a84c" : "#f0ebe3") : "rgba(255,255,255,0.4)",
                      transition: "color 0.2s"
                    }}>
                      {row.isSub ? "(" : ""}{row.isEps ? `$${row.yours.toFixed(2)}` : `$${Math.abs(row.yours).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}{row.isSub ? ")" : ""}
                    </span>
                    <span style={{
                      textAlign: "right", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600,
                      color: !hasDiff ? "transparent" : isPositive ? "#3ac99a" : "#e85a4f",
                      transition: "color 0.2s"
                    }}>
                      {hasDiff ? `${diff > 0 ? "+" : ""}${row.isEps ? diff.toFixed(2) : Math.round(diff).toLocaleString()}` : ""}
                    </span>
                    {row.margin !== undefined ? (
                      <span style={{
                        textAlign: "right", fontSize: 10, fontFamily: "var(--mono)",
                        color: Math.abs(row.margin - row.consMargin) > 0.001
                          ? (row.margin > row.consMargin ? "#3ac99a" : "#e85a4f")
                          : "rgba(255,255,255,0.2)"
                      }}>
                        {(row.margin * 100).toFixed(1)}%
                      </span>
                    ) : <span />}
                  </div>
                );
              })}
              {/* Column Headers */}
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 100px 100px 90px 70px",
              padding: "8px 12px", marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.04)",
              fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase",
              color: "rgba(255,255,255,0.15)"
            }}>
              <div />
              <div style={{ textAlign: "right" }}>Consensus</div>
              <div style={{ textAlign: "right" }}>Yours</div>
              <div style={{ textAlign: "right" }}>Delta</div>
              <div style={{ textAlign: "right" }}>Margin</div>
            </div>
          </div>

          {/* Sensitivity Grid */}
          <div style={{
            marginTop: 16, background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "20px"
          }}>
            <div style={{
              fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
              textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 14
            }}>
              Sensitivity — EPS Impact per 1% Change
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "Revenue +1%", impact: ((recalculate(base, { revenue: base.revenue * 1.01 }).eps - consensusModel.eps)) },
                { label: "COGS +1%", impact: ((recalculate(base, { cogs: base.cogs * 1.01 }).eps - consensusModel.eps)) },
                { label: "OpEx +1%", impact: ((recalculate(base, { opex: base.opex * 1.01 }).eps - consensusModel.eps)) },
                { label: "Tax Rate +1pp", impact: ((recalculate(base, { taxRate: base.taxRate + 0.01 }).eps - consensusModel.eps)) },
                { label: "Shares +1%", impact: ((recalculate(base, { sharesOut: base.sharesOut * 1.01 }).eps - consensusModel.eps)) },
                { label: "Gross Margin +100bp", impact: ((recalculate(base, { cogs: base.revenue - (base.grossProfit + base.revenue * 0.01) }).eps - consensusModel.eps)) },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "10px 12px", borderRadius: 6,
                  background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)"
                }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--body)", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{
                    fontSize: 16, fontFamily: "var(--mono)", fontWeight: 700,
                    color: s.impact >= 0 ? "#3ac99a" : "#e85a4f"
                  }}>
                    {s.impact >= 0 ? "+" : ""}{s.impact.toFixed(3)}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.15)", marginTop: 2 }}>
                    EPS impact
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Variant Narrative */}
          {hasChanges && (
            <div style={{
              marginTop: 16, padding: "16px 20px",
              background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: 10, borderLeft: "3px solid #c9a84c"
            }}>
              <div style={{
                fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
                textTransform: "uppercase", color: "#c9a84c", marginBottom: 8, fontWeight: 700
              }}>
                Your Variant Perception
              </div>
              <p style={{
                fontSize: 13, fontFamily: "var(--body)", color: "rgba(255,255,255,0.55)",
                lineHeight: 1.65, margin: 0
              }}>
                You're modeling <strong style={{ color: "#f0ebe3" }}>${model.eps.toFixed(2)}</strong> EPS
                vs. consensus of <strong style={{ color: "rgba(255,255,255,0.5)" }}>${consensusModel.eps.toFixed(2)}</strong>
                {" "}— a {Math.abs(epsDiffPct).toFixed(1)}% {epsDiff >= 0 ? "beat" : "miss"}.
                {" "}Key drivers:{" "}
                {(() => {
                  const drivers = [];
                  const revDiff = (model.revenue - consensusModel.revenue) / consensusModel.revenue * 100;
                  const cogsDiff = (model.cogs - consensusModel.cogs) / consensusModel.cogs * 100;
                  const opexDiff = (model.opex - consensusModel.opex) / consensusModel.opex * 100;
                  const taxDiff = (model.taxRate - consensusModel.taxRate) * 100;
                  if (Math.abs(revDiff) > 0.1) drivers.push(`revenue ${revDiff > 0 ? "+" : ""}${revDiff.toFixed(1)}%`);
                  if (Math.abs(cogsDiff) > 0.1) drivers.push(`COGS ${cogsDiff > 0 ? "+" : ""}${cogsDiff.toFixed(1)}%`);
                  if (Math.abs(opexDiff) > 0.1) drivers.push(`OpEx ${opexDiff > 0 ? "+" : ""}${opexDiff.toFixed(1)}%`);
                  if (Math.abs(taxDiff) > 0.05) drivers.push(`tax rate ${taxDiff > 0 ? "+" : ""}${taxDiff.toFixed(1)}pp`);
                  return drivers.length > 0 ? drivers.join(", ") + "." : "Minimal adjustments from consensus.";
                })()}
              </p>
            </div>
          )}

          <div style={{
            marginTop: 16, padding: "12px 16px",
            background: "rgba(255,255,255,0.01)", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.03)"
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "var(--mono)", lineHeight: 1.6 }}>
              Consensus estimates are illustrative. In production, connect to FactSet, Bloomberg, or FMP for live consensus data.
              The model uses a simplified P&L structure — a full build would include segment-level margins, FX adjustments, and one-time items.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
