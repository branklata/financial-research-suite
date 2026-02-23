import { useState, useMemo } from "react";

const COMPANIES = [
  // Large Cap
  { ticker: "AAPL", name: "Apple Inc.", cap: "Large", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$92-96B", guidanceMid: 94, actual: 95.4, unit: "B", eps_guidance: "$2.32-$2.42", eps_mid: 2.37, eps_actual: 2.40 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$89-93B", guidanceMid: 91, actual: 91.2, unit: "B", eps_guidance: "$2.18-$2.28", eps_mid: 2.23, eps_actual: 2.18 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$82-86B", guidanceMid: 84, actual: 85.8, unit: "B", eps_guidance: "$1.38-$1.48", eps_mid: 1.43, eps_actual: 1.46 },
    ]
  },
  { ticker: "MSFT", name: "Microsoft Corp.", cap: "Large", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$68.1-$69.1B", guidanceMid: 68.6, actual: 69.6, unit: "B", eps_guidance: "$3.20-$3.30", eps_mid: 3.25, eps_actual: 3.32 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$63.0-$64.0B", guidanceMid: 63.5, actual: 64.7, unit: "B", eps_guidance: "$3.05-$3.15", eps_mid: 3.10, eps_actual: 3.13 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$60.0-$61.0B", guidanceMid: 60.5, actual: 61.9, unit: "B", eps_guidance: "$2.80-$2.90", eps_mid: 2.85, eps_actual: 2.94 },
    ]
  },
  { ticker: "GOOGL", name: "Alphabet Inc.", cap: "Large", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$89-$91B", guidanceMid: 90, actual: 90.2, unit: "B", eps_guidance: "$1.88-$1.98", eps_mid: 1.93, eps_actual: 2.01 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$85-$87B", guidanceMid: 86, actual: 86.3, unit: "B", eps_guidance: "$1.78-$1.88", eps_mid: 1.83, eps_actual: 1.89 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$82-$84B", guidanceMid: 83, actual: 84.7, unit: "B", eps_guidance: "$1.70-$1.80", eps_mid: 1.75, eps_actual: 1.85 },
    ]
  },
  { ticker: "AMZN", name: "Amazon.com Inc.", cap: "Large", sector: "Consumer Cyclical",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$151-$155.5B", guidanceMid: 153.25, actual: 155.7, unit: "B", eps_guidance: "$0.83-$1.03", eps_mid: 0.93, eps_actual: 1.12 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$181.5-$188.5B", guidanceMid: 185, actual: 187.8, unit: "B", eps_guidance: "$1.08-$1.28", eps_mid: 1.18, eps_actual: 1.29 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$154-$158.5B", guidanceMid: 156.25, actual: 158.9, unit: "B", eps_guidance: "$0.90-$1.10", eps_mid: 1.00, eps_actual: 1.14 },
    ]
  },
  { ticker: "NVDA", name: "NVIDIA Corp.", cap: "Large", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$42.5B ±2%", guidanceMid: 42.5, actual: 44.1, unit: "B", eps_guidance: "$0.88-$0.92", eps_mid: 0.90, eps_actual: 0.96 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$37.5B ±2%", guidanceMid: 37.5, actual: 39.3, unit: "B", eps_guidance: "$0.78-$0.82", eps_mid: 0.80, eps_actual: 0.89 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$32.5B ±2%", guidanceMid: 32.5, actual: 35.1, unit: "B", eps_guidance: "$0.68-$0.72", eps_mid: 0.70, eps_actual: 0.81 },
    ]
  },
  { ticker: "META", name: "Meta Platforms", cap: "Large", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$39.5-$41.8B", guidanceMid: 40.65, actual: 42.3, unit: "B", eps_guidance: "$5.20-$5.60", eps_mid: 5.40, eps_actual: 5.74 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$45-$48B", guidanceMid: 46.5, actual: 48.4, unit: "B", eps_guidance: "$6.50-$7.10", eps_mid: 6.80, eps_actual: 7.02 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$38.5-$41B", guidanceMid: 39.75, actual: 40.6, unit: "B", eps_guidance: "$4.90-$5.30", eps_mid: 5.10, eps_actual: 5.31 },
    ]
  },
  { ticker: "JPM", name: "JPMorgan Chase", cap: "Large", sector: "Financials",
    quarters: [
      { q: "Q1 2025", metric: "NII", guidance: "$~91B FY", guidanceMid: 22.75, actual: 23.4, unit: "B", eps_guidance: "$4.30-$4.50", eps_mid: 4.40, eps_actual: 4.63 },
      { q: "Q4 2024", metric: "NII", guidance: "$~90B FY", guidanceMid: 22.5, actual: 23.5, unit: "B", eps_guidance: "$3.95-$4.15", eps_mid: 4.05, eps_actual: 4.37 },
      { q: "Q3 2024", metric: "NII", guidance: "$~89B FY", guidanceMid: 22.25, actual: 23.1, unit: "B", eps_guidance: "$4.00-$4.20", eps_mid: 4.10, eps_actual: 4.33 },
    ]
  },
  { ticker: "UNH", name: "UnitedHealth Group", cap: "Large", sector: "Healthcare",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$109-$110B", guidanceMid: 109.5, actual: 109.6, unit: "B", eps_guidance: "$7.05-$7.25", eps_mid: 7.15, eps_actual: 7.01 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$100-$101B", guidanceMid: 100.5, actual: 100.8, unit: "B", eps_guidance: "$6.50-$6.70", eps_mid: 6.60, eps_actual: 6.81 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$98-$99B", guidanceMid: 98.5, actual: 98.9, unit: "B", eps_guidance: "$6.70-$6.90", eps_mid: 6.80, eps_actual: 6.91 },
    ]
  },
  // Mid Cap
  { ticker: "DDOG", name: "Datadog Inc.", cap: "Mid", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$709-$713M", guidanceMid: 711, actual: 737, unit: "M", eps_guidance: "$0.42-$0.44", eps_mid: 0.43, eps_actual: 0.49 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$709-$713M", guidanceMid: 711, actual: 738, unit: "M", eps_guidance: "$0.42-$0.44", eps_mid: 0.43, eps_actual: 0.48 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$660-$664M", guidanceMid: 662, actual: 690, unit: "M", eps_guidance: "$0.38-$0.40", eps_mid: 0.39, eps_actual: 0.46 },
    ]
  },
  { ticker: "NET", name: "Cloudflare Inc.", cap: "Mid", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$457-$458M", guidanceMid: 457.5, actual: 479, unit: "M", eps_guidance: "$0.16-$0.17", eps_mid: 0.165, eps_actual: 0.19 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$451-$452M", guidanceMid: 451.5, actual: 460, unit: "M", eps_guidance: "$0.16-$0.17", eps_mid: 0.165, eps_actual: 0.18 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$423-$424M", guidanceMid: 423.5, actual: 430, unit: "M", eps_guidance: "$0.14-$0.15", eps_mid: 0.145, eps_actual: 0.17 },
    ]
  },
  { ticker: "HUBS", name: "HubSpot Inc.", cap: "Mid", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$688-$691M", guidanceMid: 689.5, actual: 711, unit: "M", eps_guidance: "$1.58-$1.62", eps_mid: 1.60, eps_actual: 1.81 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$670-$673M", guidanceMid: 671.5, actual: 700, unit: "M", eps_guidance: "$1.52-$1.56", eps_mid: 1.54, eps_actual: 1.68 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$637-$640M", guidanceMid: 638.5, actual: 669, unit: "M", eps_guidance: "$1.40-$1.44", eps_mid: 1.42, eps_actual: 1.58 },
    ]
  },
  { ticker: "ZS", name: "Zscaler Inc.", cap: "Mid", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$592-$594M", guidanceMid: 593, actual: 616, unit: "M", eps_guidance: "$0.64-$0.65", eps_mid: 0.645, eps_actual: 0.78 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$565-$567M", guidanceMid: 566, actual: 593, unit: "M", eps_guidance: "$0.58-$0.59", eps_mid: 0.585, eps_actual: 0.69 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$535-$537M", guidanceMid: 536, actual: 564, unit: "M", eps_guidance: "$0.53-$0.55", eps_mid: 0.54, eps_actual: 0.67 },
    ]
  },
  { ticker: "RGEN", name: "Repligen Corp.", cap: "Mid", sector: "Healthcare",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$170-$178M", guidanceMid: 174, actual: 175, unit: "M", eps_guidance: "$0.42-$0.48", eps_mid: 0.45, eps_actual: 0.44 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$165-$173M", guidanceMid: 169, actual: 171, unit: "M", eps_guidance: "$0.38-$0.44", eps_mid: 0.41, eps_actual: 0.43 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$155-$163M", guidanceMid: 159, actual: 161, unit: "M", eps_guidance: "$0.32-$0.38", eps_mid: 0.35, eps_actual: 0.37 },
    ]
  },
  { ticker: "TOST", name: "Toast Inc.", cap: "Mid", sector: "Technology",
    quarters: [
      { q: "Q1 2025", metric: "Revenue", guidance: "$1.22-$1.25B", guidanceMid: 1235, actual: 1313, unit: "M", eps_guidance: "$0.04-$0.06", eps_mid: 0.05, eps_actual: 0.09 },
      { q: "Q4 2024", metric: "Revenue", guidance: "$1.17-$1.20B", guidanceMid: 1185, actual: 1243, unit: "M", eps_guidance: "$0.02-$0.04", eps_mid: 0.03, eps_actual: 0.07 },
      { q: "Q3 2024", metric: "Revenue", guidance: "$1.08-$1.10B", guidanceMid: 1090, actual: 1121, unit: "M", eps_guidance: "$-0.01-$0.01", eps_mid: 0.00, eps_actual: 0.04 },
    ]
  },
];

function getVerdict(actual, guidanceMid) {
  const pct = ((actual - guidanceMid) / guidanceMid) * 100;
  if (pct >= 3) return { label: "Strong Beat", color: "#0ea87b", bg: "rgba(14,168,123,0.10)", icon: "▲▲" };
  if (pct >= 0.5) return { label: "Beat", color: "#2cc98e", bg: "rgba(44,201,142,0.08)", icon: "▲" };
  if (pct >= -0.5) return { label: "In-Line", color: "#a8a29e", bg: "rgba(168,162,158,0.08)", icon: "—" };
  if (pct >= -3) return { label: "Miss", color: "#e86452", bg: "rgba(232,100,82,0.08)", icon: "▼" };
  return { label: "Wide Miss", color: "#c42b1c", bg: "rgba(196,43,28,0.10)", icon: "▼▼" };
}

function getBeatRate(company) {
  let beats = 0;
  company.quarters.forEach(q => {
    const revPct = ((q.actual - q.guidanceMid) / q.guidanceMid) * 100;
    const epsPct = ((q.eps_actual - q.eps_mid) / q.eps_mid) * 100;
    if (revPct >= 0.5) beats++;
    if (epsPct >= 0.5) beats++;
  });
  return beats / (company.quarters.length * 2);
}

function MiniBar({ value, max = 10, color }) {
  const width = Math.min(Math.abs(value) / max * 100, 100);
  const isPositive = value >= 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width: 120 }}>
      <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          [isPositive ? "left" : "right"]: isPositive ? "50%" : undefined,
          left: isPositive ? "50%" : `${50 - width / 2}%`,
          width: `${width / 2}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
          transition: "width 0.5s ease"
        }} />
        <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: "100%", background: "rgba(255,255,255,0.15)" }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color, minWidth: 40, textAlign: "right" }}>
        {value >= 0 ? "+" : ""}{value.toFixed(1)}%
      </span>
    </div>
  );
}

function CredibilityScore({ company }) {
  const rate = getBeatRate(company);
  const pct = Math.round(rate * 100);
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (rate * circumference);
  const color = pct >= 80 ? "#0ea87b" : pct >= 60 ? "#e8b931" : "#e86452";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="38" height="38" viewBox="0 0 38 38">
        <circle cx="19" cy="19" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="19" cy="19" r="16" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 19 19)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x="19" y="19" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: color, fontWeight: 700 }}>
          {pct}
        </text>
      </svg>
    </div>
  );
}

export default function GuidanceTracker() {
  const [capFilter, setCapFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [metricView, setMetricView] = useState("revenue");
  const [sortBy, setSortBy] = useState("credibility");

  const sectors = ["All", ...new Set(COMPANIES.map(c => c.sector))];

  const filtered = useMemo(() => {
    let result = COMPANIES.filter(c => {
      if (capFilter !== "All" && c.cap !== capFilter) return false;
      if (sectorFilter !== "All" && c.sector !== sectorFilter) return false;
      return true;
    });
    if (sortBy === "credibility") {
      result = [...result].sort((a, b) => getBeatRate(b) - getBeatRate(a));
    } else if (sortBy === "ticker") {
      result = [...result].sort((a, b) => a.ticker.localeCompare(b.ticker));
    } else if (sortBy === "latest") {
      result = [...result].sort((a, b) => {
        const aQ = a.quarters[0]; const bQ = b.quarters[0];
        const aPct = metricView === "revenue" ? ((aQ.actual - aQ.guidanceMid) / aQ.guidanceMid) * 100 : ((aQ.eps_actual - aQ.eps_mid) / aQ.eps_mid) * 100;
        const bPct = metricView === "revenue" ? ((bQ.actual - bQ.guidanceMid) / bQ.guidanceMid) * 100 : ((bQ.eps_actual - bQ.eps_mid) / bQ.eps_mid) * 100;
        return bPct - aPct;
      });
    }
    return result;
  }, [capFilter, sectorFilter, sortBy, metricView]);

  const totalBeats = filtered.reduce((sum, c) => {
    const q = c.quarters[0];
    const pct = metricView === "revenue" ? ((q.actual - q.guidanceMid) / q.guidanceMid) * 100 : ((q.eps_actual - q.eps_mid) / q.eps_mid) * 100;
    return sum + (pct >= 0.5 ? 1 : 0);
  }, 0);
  const totalMisses = filtered.reduce((sum, c) => {
    const q = c.quarters[0];
    const pct = metricView === "revenue" ? ((q.actual - q.guidanceMid) / q.guidanceMid) * 100 : ((q.eps_actual - q.eps_mid) / q.eps_mid) * 100;
    return sum + (pct < -0.5 ? 1 : 0);
  }, 0);
  const totalInline = filtered.length - totalBeats - totalMisses;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c0e",
      color: "#e8e6e1",
      fontFamily: "'Söhne', 'Helvetica Neue', sans-serif",
      padding: "0 0 60px 0"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{
        padding: "40px 32px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(14,168,123,0.03) 0%, transparent 100%)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#0ea87b", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
              Guidance Tracker
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>v2.0</span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 800,
            margin: "8px 0 6px",
            letterSpacing: -0.5,
            background: "linear-gradient(135deg, #e8e6e1 0%, #a8a29e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Did Management Deliver?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", maxWidth: 520 }}>
            Tracking guidance vs. actuals for large & mid cap companies. Hold management accountable.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Companies", value: filtered.length, color: "#e8e6e1", sub: `${capFilter === "All" ? "All Caps" : capFilter + " Cap"}` },
            { label: "Beat Guidance", value: totalBeats, color: "#0ea87b", sub: `${Math.round(totalBeats / filtered.length * 100)}% of total` },
            { label: "In-Line", value: totalInline, color: "#a8a29e", sub: "Within ±0.5%" },
            { label: "Missed", value: totalMisses, color: "#e86452", sub: "Below guidance" },
          ].map((card, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "18px 20px",
              transition: "border-color 0.2s",
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: card.color, lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          {/* Cap Filter */}
          {["All", "Large", "Mid"].map(c => (
            <button key={c} onClick={() => setCapFilter(c)} style={{
              padding: "7px 16px",
              borderRadius: 6,
              border: capFilter === c ? "1px solid rgba(14,168,123,0.5)" : "1px solid rgba(255,255,255,0.08)",
              background: capFilter === c ? "rgba(14,168,123,0.12)" : "rgba(255,255,255,0.02)",
              color: capFilter === c ? "#0ea87b" : "rgba(255,255,255,0.45)",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}>
              {c === "All" ? "All Caps" : c + " Cap"}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />
          {/* Sector */}
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} style={{
            padding: "7px 12px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            appearance: "none"
          }}>
            {sectors.map(s => <option key={s} value={s} style={{ background: "#1a1a1e" }}>{s === "All" ? "All Sectors" : s}</option>)}
          </select>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />
          {/* Metric Toggle */}
          {["revenue", "eps"].map(m => (
            <button key={m} onClick={() => setMetricView(m)} style={{
              padding: "7px 14px",
              borderRadius: 6,
              border: metricView === m ? "1px solid rgba(232,185,49,0.4)" : "1px solid rgba(255,255,255,0.08)",
              background: metricView === m ? "rgba(232,185,49,0.08)" : "rgba(255,255,255,0.02)",
              color: metricView === m ? "#e8b931" : "rgba(255,255,255,0.45)",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}>
              {m === "revenue" ? "Revenue" : "EPS"}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            padding: "7px 12px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            appearance: "none"
          }}>
            <option value="credibility" style={{ background: "#1a1a1e" }}>Sort: Credibility</option>
            <option value="latest" style={{ background: "#1a1a1e" }}>Sort: Latest Surprise</option>
            <option value="ticker" style={{ background: "#1a1a1e" }}>Sort: Ticker</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
          {/* Table Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "180px 80px 160px 160px 140px 100px 60px",
            padding: "12px 20px",
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)"
          }}>
            <div>Company</div>
            <div>Quarter</div>
            <div>{metricView === "revenue" ? "Revenue Guidance" : "EPS Guidance"}</div>
            <div>Actual</div>
            <div>Surprise</div>
            <div>Verdict</div>
            <div style={{ textAlign: "center" }}>Score</div>
          </div>

          {/* Rows */}
          {filtered.map((company) => {
            const q = company.quarters[0];
            const isRevenue = metricView === "revenue";
            const actual = isRevenue ? q.actual : q.eps_actual;
            const mid = isRevenue ? q.guidanceMid : q.eps_mid;
            const guidanceStr = isRevenue ? q.guidance : q.eps_guidance;
            const pct = ((actual - mid) / mid) * 100;
            const verdict = getVerdict(actual, mid);
            const isExpanded = expanded === company.ticker;

            return (
              <div key={company.ticker}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : company.ticker)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 80px 160px 160px 140px 100px 60px",
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    background: isExpanded ? "rgba(255,255,255,0.03)" : "transparent",
                    alignItems: "center",
                  }}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: "#e8e6e1" }}>
                        {company.ticker}
                      </span>
                      <span style={{
                        fontSize: 9,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: company.cap === "Large" ? "rgba(79,140,255,0.12)" : "rgba(198,130,255,0.12)",
                        color: company.cap === "Large" ? "#4f8cff" : "#c682ff",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        letterSpacing: 0.5
                      }}>
                        {company.cap.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                      {company.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.5)" }}>
                    {q.q}
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.45)" }}>
                    {guidanceStr}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#e8e6e1" }}>
                    {isRevenue ? `$${actual}${q.unit}` : `$${actual.toFixed(2)}`}
                  </div>
                  <MiniBar value={pct} color={verdict.color} />
                  <div style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: verdict.color,
                    background: verdict.bg,
                    padding: "3px 8px",
                    borderRadius: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    width: "fit-content"
                  }}>
                    <span style={{ fontSize: 9 }}>{verdict.icon}</span> {verdict.label}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <CredibilityScore company={company} />
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{
                    padding: "16px 20px 20px",
                    background: "rgba(255,255,255,0.015)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
                      Quarterly History — {company.name}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      {company.quarters.map((quarter, qi) => {
                        const revPct = ((quarter.actual - quarter.guidanceMid) / quarter.guidanceMid) * 100;
                        const epsPct = ((quarter.eps_actual - quarter.eps_mid) / quarter.eps_mid) * 100;
                        const revV = getVerdict(quarter.actual, quarter.guidanceMid);
                        const epsV = getVerdict(quarter.eps_actual, quarter.eps_mid);
                        return (
                          <div key={qi} style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 8,
                            padding: "14px 16px",
                          }}>
                            <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#e8e6e1", marginBottom: 10 }}>
                              {quarter.q}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>REVENUE</div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                                  G: {quarter.guidance}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: revV.color, fontFamily: "'JetBrains Mono', monospace" }}>
                                  A: ${quarter.actual}{quarter.unit} ({revPct >= 0 ? "+" : ""}{revPct.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>EPS</div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                                  G: {quarter.eps_guidance}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: epsV.color, fontFamily: "'JetBrains Mono', monospace" }}>
                                  A: ${quarter.eps_actual.toFixed(2)} ({epsPct >= 0 ? "+" : ""}{epsPct.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
            Note: Guidance figures represent management's provided ranges. "Surprise" is calculated vs. midpoint of guidance range.
            Credibility score reflects the % of revenue + EPS beats across the trailing 3 quarters shown.
            Data shown is illustrative — connect to a live data source for production use.
          </div>
        </div>
      </div>
    </div>
  );
}
