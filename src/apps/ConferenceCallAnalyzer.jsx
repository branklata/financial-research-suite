import { useState, useMemo, useEffect } from "react";

// ─── 12 Quarters of Data ─────────────────────────────────────────────────────
// Hard guidance = specific numeric targets management provided
// Soft guidance = qualitative language (tone, sentiment, directional commentary)

const QUARTERS = [
  "Q1'23","Q2'23","Q3'23","Q4'23",
  "Q1'24","Q2'24","Q3'24","Q4'24",
  "Q1'25","Q2'25","Q3'25","Q4'25"
];

const COMPANIES = {
  NVDA: {
    name: "NVIDIA Corp.", sector: "Semiconductors",
    quarters: {
      "Q1'23": {
        hardGuidance: [
          { metric: "Revenue", value: "$7.2B ±2%", midpoint: 7200, actual: 7192, unit: "M", met: true },
          { metric: "Gross Margin", value: "64.1-66.1%", midpoint: 65.1, actual: 64.6, unit: "%", met: true },
          { metric: "OpEx", value: "$2.5B", midpoint: 2500, actual: 2508, unit: "M", met: true },
        ],
        softGuidance: [
          { topic: "Data Center", tone: "optimistic", quote: "We see strong demand from cloud providers for inference workloads", signal: "positive", priorTone: null },
          { topic: "Gaming", tone: "cautious", quote: "Gaming channel inventory correction is largely behind us", signal: "improving", priorTone: null },
          { topic: "Supply", tone: "neutral", quote: "Supply remains tight but improving", signal: "neutral", priorTone: null },
        ],
        topicFrequency: { "AI/ML": 18, "Data Center": 14, "Gaming": 8, "Supply Chain": 6, "China": 4, "Margins": 5, "Competition": 2, "Automotive": 3 },
        analystQuestions: 22, managementTone: 6.5, sentimentScore: 0.62,
        keyToneWords: ["strong demand", "early innings", "improving"],
        toneShift: null, // first quarter
      },
      "Q2'23": {
        hardGuidance: [
          { metric: "Revenue", value: "$11.0B ±2%", midpoint: 11000, actual: 13507, unit: "M", met: true },
          { metric: "Gross Margin", value: "68.6-70.6%", midpoint: 69.6, actual: 70.1, unit: "%", met: true },
          { metric: "OpEx", value: "$2.7B", midpoint: 2700, actual: 2662, unit: "M", met: true },
        ],
        softGuidance: [
          { topic: "Data Center", tone: "very bullish", quote: "We're seeing incredible demand...a new computing era has begun", signal: "strong positive", priorTone: "optimistic" },
          { topic: "AI Infrastructure", tone: "very bullish", quote: "Every major cloud provider is racing to deploy GPU infrastructure", signal: "strong positive", priorTone: null },
          { topic: "Supply", tone: "concerned", quote: "Demand is significantly outpacing supply, we're working to increase", signal: "constraint", priorTone: "neutral" },
        ],
        topicFrequency: { "AI/ML": 34, "Data Center": 22, "Supply Chain": 12, "China": 8, "Gaming": 4, "Margins": 7, "Competition": 3, "Automotive": 2 },
        analystQuestions: 28, managementTone: 8.8, sentimentScore: 0.89,
        keyToneWords: ["incredible demand", "new era", "racing to deploy", "inflection"],
        toneShift: "sharply positive",
      },
      "Q3'23": {
        hardGuidance: [
          { metric: "Revenue", value: "$16.0B ±2%", midpoint: 16000, actual: 18120, unit: "M", met: true },
          { metric: "Gross Margin", value: "71.5-73.5%", midpoint: 72.5, actual: 73.0, unit: "%", met: true },
          { metric: "OpEx", value: "$2.95B", midpoint: 2950, actual: 2983, unit: "M", met: true },
        ],
        softGuidance: [
          { topic: "Data Center", tone: "very bullish", quote: "Demand continues to exceed supply across every product", signal: "strong positive", priorTone: "very bullish" },
          { topic: "Sovereign AI", tone: "optimistic", quote: "Nations are beginning to invest in their own AI infrastructure", signal: "new theme", priorTone: null },
          { topic: "China", tone: "cautious", quote: "Export controls will have an impact, but rest of world demand more than offsets", signal: "managed risk", priorTone: "concerned" },
        ],
        topicFrequency: { "AI/ML": 38, "Data Center": 25, "Sovereign AI": 8, "Supply Chain": 10, "China": 12, "Margins": 6, "H100/H200": 14, "Competition": 4 },
        analystQuestions: 30, managementTone: 8.5, sentimentScore: 0.85,
        keyToneWords: ["exceeds supply", "sovereign AI", "every product"],
        toneShift: "sustained bullish",
      },
      "Q4'23": {
        hardGuidance: [
          { metric: "Revenue", value: "$20.0B ±2%", midpoint: 20000, actual: 22103, unit: "M", met: true },
          { metric: "Gross Margin", value: "73.0-74.5%", midpoint: 73.75, actual: 73.8, unit: "%", met: true },
          { metric: "OpEx", value: "$3.1B", midpoint: 3100, actual: 3176, unit: "M", met: false },
        ],
        softGuidance: [
          { topic: "Data Center", tone: "very bullish", quote: "We're in the next industrial revolution, every company needs AI", signal: "strong positive", priorTone: "very bullish" },
          { topic: "Blackwell", tone: "optimistic", quote: "Blackwell architecture will be a significant step up in performance", signal: "product catalyst", priorTone: null },
          { topic: "Supply", tone: "improving", quote: "Supply is improving and we expect meaningful increases through 2024", signal: "easing", priorTone: "concerned" },
        ],
        topicFrequency: { "AI/ML": 42, "Data Center": 28, "Blackwell": 12, "Sovereign AI": 10, "Supply Chain": 8, "China": 6, "Margins": 8, "Competition": 5 },
        analystQuestions: 32, managementTone: 9.0, sentimentScore: 0.88,
        keyToneWords: ["industrial revolution", "every company", "significant step up"],
        toneShift: "peak bullish",
      },
      "Q1'24": {
        hardGuidance: [
          { metric: "Revenue", value: "$24.0B ±2%", midpoint: 24000, actual: 26044, unit: "M", met: true },
          { metric: "Gross Margin", value: "74.5-75.5%", midpoint: 75.0, actual: 75.3, unit: "%", met: true },
          { metric: "OpEx", value: "$3.3B", midpoint: 3300, actual: 3250, unit: "M", met: true },
        ],
        softGuidance: [
          { topic: "Data Center", tone: "very bullish", quote: "Every major cloud and enterprise customer is building AI factories", signal: "strong positive", priorTone: "very bullish" },
          { topic: "Blackwell", tone: "very bullish", quote: "Blackwell demand is insane...we have incredible visibility", signal: "strong catalyst", priorTone: "optimistic" },
          { topic: "Inference", tone: "optimistic", quote: "Inference is growing as a share of our data center business", signal: "expanding TAM", priorTone: null },
        ],
        topicFrequency: { "AI/ML": 45, "Data Center": 30, "Blackwell": 22, "Inference": 12, "Sovereign AI": 14, "Supply Chain": 6, "China": 5, "Margins": 7 },
        analystQuestions: 34, managementTone: 9.2, sentimentScore: 0.91,
        keyToneWords: ["insane demand", "AI factories", "incredible visibility"],
        toneShift: "sustained peak",
      },
      "Q2'24": {
        hardGuidance: [
          { metric: "Revenue", value: "$28.0B ±2%", midpoint: 28000, actual: 30040, unit: "M", met: true },
          { metric: "Gross Margin", value: "74.5-75.5%", midpoint: 75.0, actual: 75.1, unit: "%", met: true },
          { metric: "OpEx", value: "$3.4B", midpoint: 3400, actual: 3382, unit: "M", met: true },
        ],
        softGuidance: [
          { topic: "Data Center", tone: "very bullish", quote: "Hopper demand remains strong even as Blackwell ramps", signal: "sustained", priorTone: "very bullish" },
          { topic: "Blackwell", tone: "very bullish", quote: "Blackwell production is ramping, demand far exceeds supply into 2025", signal: "strong catalyst", priorTone: "very bullish" },
          { topic: "Margins", tone: "cautious", quote: "We expect some near-term margin pressure as Blackwell ramps in mix", signal: "temporary headwind", priorTone: null },
        ],
        topicFrequency: { "AI/ML": 40, "Blackwell": 28, "Data Center": 26, "Inference": 16, "Margins": 12, "Sovereign AI": 11, "Supply Chain": 5, "China": 4 },
        analystQuestions: 32, managementTone: 8.8, sentimentScore: 0.86,
        keyToneWords: ["far exceeds supply", "strong even as", "near-term pressure"],
        toneShift: "slight moderation on margins",
      },
      "Q3'24": {
        hardGuidance: [
          { metric: "Revenue", value: "$32.5B ±2%", midpoint: 32500, actual: 35082, unit: "M", met: true },
          { metric: "Gross Margin", value: "73.0-74.0%", midpoint: 73.5, actual: 73.0, unit: "%", met: true },
          { metric: "OpEx", value: "$3.5B", midpoint: 3500, actual: 3546, unit: "M", met: false },
        ],
        softGuidance: [
          { topic: "Blackwell", tone: "very bullish", quote: "Blackwell is in full production, every GPU is allocated through Q2", signal: "demand visibility", priorTone: "very bullish" },
          { topic: "Margins", tone: "reassuring", quote: "Gross margins will recover as Blackwell yields improve and scale", signal: "temporary", priorTone: "cautious" },
          { topic: "Inference", tone: "bullish", quote: "Inference now represents 40% of data center revenue, accelerating", signal: "TAM expansion", priorTone: "optimistic" },
        ],
        topicFrequency: { "Blackwell": 32, "AI/ML": 38, "Inference": 20, "Data Center": 24, "Margins": 14, "Sovereign AI": 12, "Competition": 8, "Supply Chain": 4 },
        analystQuestions: 30, managementTone: 8.5, sentimentScore: 0.84,
        keyToneWords: ["full production", "allocated through", "recover"],
        toneShift: "bullish but margin caution",
      },
      "Q4'24": {
        hardGuidance: [
          { metric: "Revenue", value: "$37.5B ±2%", midpoint: 37500, actual: 39331, unit: "M", met: true },
          { metric: "Gross Margin", value: "73.5-74.5%", midpoint: 74.0, actual: 73.0, unit: "%", met: false },
          { metric: "OpEx", value: "$3.6B", midpoint: 3600, actual: 3682, unit: "M", met: false },
        ],
        softGuidance: [
          { topic: "Blackwell", tone: "bullish", quote: "Blackwell is ramping faster than any product in our history", signal: "positive", priorTone: "very bullish" },
          { topic: "Sovereign AI", tone: "very bullish", quote: "Sovereign AI pipeline has grown to $18B in committed contracts", signal: "quantified for first time", priorTone: "bullish" },
          { topic: "Competition", tone: "confident", quote: "Our CUDA ecosystem and full-stack approach is a significant moat", signal: "defensive", priorTone: "neutral" },
        ],
        topicFrequency: { "Blackwell": 30, "AI/ML": 35, "Sovereign AI": 18, "Inference": 18, "Data Center": 22, "Competition": 10, "Margins": 12, "NVLink": 8 },
        analystQuestions: 32, managementTone: 8.2, sentimentScore: 0.82,
        keyToneWords: ["faster than any", "$18B committed", "significant moat"],
        toneShift: "slight defensive shift",
      },
      "Q1'25": {
        hardGuidance: [
          { metric: "Revenue", value: "$43.0B ±2%", midpoint: 43000, actual: 44100, unit: "M", met: true },
          { metric: "Gross Margin", value: "70.5-72.5%", midpoint: 71.5, actual: 71.0, unit: "%", met: true },
          { metric: "OpEx", value: "$3.8B", midpoint: 3800, actual: 3850, unit: "M", met: false },
        ],
        softGuidance: [
          { topic: "Blackwell", tone: "bullish", quote: "Blackwell demand continues to be very strong with excellent yields", signal: "sustained", priorTone: "bullish" },
          { topic: "Inference", tone: "very bullish", quote: "Inference is now the largest and fastest-growing part of our DC business", signal: "structural shift", priorTone: "bullish" },
          { topic: "Margins", tone: "cautious", quote: "Gross margins reflect Blackwell mix and will take a few quarters to normalize", signal: "extended timeline", priorTone: "reassuring" },
        ],
        topicFrequency: { "Blackwell": 28, "Inference": 24, "AI/ML": 32, "Margins": 16, "Sovereign AI": 14, "Data Center": 20, "GB300": 10, "Competition": 8 },
        analystQuestions: 30, managementTone: 7.8, sentimentScore: 0.78,
        keyToneWords: ["very strong", "largest and fastest", "few quarters to normalize"],
        toneShift: "margin narrative extending",
      },
      "Q2'25": {
        hardGuidance: [
          { metric: "Revenue", value: "$45.0B ±2%", midpoint: 45000, actual: null, unit: "M", met: null },
          { metric: "Gross Margin", value: "71.0-73.0%", midpoint: 72.0, actual: null, unit: "%", met: null },
          { metric: "OpEx", value: "$4.0B", midpoint: 4000, actual: null, unit: "M", met: null },
        ],
        softGuidance: [
          { topic: "Blackwell Ultra", tone: "very bullish", quote: "Blackwell Ultra will ship in H2, offering 2x inference throughput", signal: "next catalyst", priorTone: null },
          { topic: "Enterprise AI", tone: "optimistic", quote: "Enterprise adoption is broadening beyond just hyperscalers", signal: "TAM expansion", priorTone: null },
          { topic: "Margins", tone: "improving", quote: "We expect margins to begin recovering in the second half", signal: "turning point", priorTone: "cautious" },
        ],
        topicFrequency: { "Blackwell Ultra": 18, "Inference": 22, "AI/ML": 30, "Enterprise AI": 14, "Margins": 14, "Sovereign AI": 12, "GB300": 12, "Data Center": 18 },
        analystQuestions: 28, managementTone: 8.0, sentimentScore: 0.80,
        keyToneWords: ["2x throughput", "broadening beyond", "begin recovering"],
        toneShift: "cautiously improving",
      },
      "Q3'25": {
        hardGuidance: [
          { metric: "Revenue", value: "$48.0B ±2%", midpoint: 48000, actual: null, unit: "M", met: null },
          { metric: "Gross Margin", value: "72.0-74.0%", midpoint: 73.0, actual: null, unit: "%", met: null },
          { metric: "OpEx", value: "$4.1B", midpoint: 4100, actual: null, unit: "M", met: null },
        ],
        softGuidance: [
          { topic: "Rubin", tone: "optimistic", quote: "Rubin architecture on track for 2026, significant performance leap", signal: "forward catalyst", priorTone: null },
          { topic: "Inference", tone: "very bullish", quote: "Inference revenue now exceeds training for the first time", signal: "milestone", priorTone: "very bullish" },
          { topic: "Competition", tone: "measured", quote: "Custom silicon is complementary — the market is large enough for all", signal: "acknowledging", priorTone: "confident" },
        ],
        topicFrequency: { "Rubin": 14, "Inference": 26, "AI/ML": 28, "Blackwell Ultra": 16, "Enterprise AI": 16, "Competition": 12, "Margins": 10, "Sovereign AI": 10 },
        analystQuestions: 30, managementTone: 8.2, sentimentScore: 0.81,
        keyToneWords: ["exceeds training", "significant leap", "large enough"],
        toneShift: "stable bullish",
      },
      "Q4'25": {
        hardGuidance: [
          { metric: "Revenue", value: "$52.0B ±2%", midpoint: 52000, actual: null, unit: "M", met: null },
          { metric: "Gross Margin", value: "73.0-75.0%", midpoint: 74.0, actual: null, unit: "%", met: null },
          { metric: "OpEx", value: "$4.2B", midpoint: 4200, actual: null, unit: "M", met: null },
        ],
        softGuidance: [
          { topic: "AI Agents", tone: "very bullish", quote: "AI agents represent the next wave — every enterprise will deploy them", signal: "new narrative", priorTone: null },
          { topic: "Margins", tone: "confident", quote: "Gross margins are on a clear recovery trajectory back toward mid-70s", signal: "inflection confirmed", priorTone: "improving" },
          { topic: "Competition", tone: "measured", quote: "We compete on the full stack, not just the chip", signal: "evolved positioning", priorTone: "measured" },
        ],
        topicFrequency: { "AI Agents": 16, "Rubin": 16, "Inference": 22, "AI/ML": 26, "Enterprise AI": 18, "Margins": 8, "Competition": 10, "Sovereign AI": 8 },
        analystQuestions: 28, managementTone: 8.4, sentimentScore: 0.83,
        keyToneWords: ["every enterprise", "clear recovery", "full stack"],
        toneShift: "confident rebound",
      },
    }
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TONE_COLORS = {
  "very bullish": "#2dd4a0", "bullish": "#4ecda4", "optimistic": "#7bc9a8",
  "improving": "#88c4ab", "reassuring": "#8ab8a0", "confident": "#6cb89c",
  "neutral": "#8a8880", "measured": "#a09888",
  "cautious": "#e8a94d", "cautiously optimistic": "#c4a060", "concerned": "#e08840",
  "negative": "#e86452", "bearish": "#d44a3a",
};

function getToneColor(tone) { return TONE_COLORS[tone] || "#8a8880"; }
function getToneScore(tone) {
  const map = { "very bullish": 9, "bullish": 8, "optimistic": 7, "improving": 6.5, "reassuring": 6.5, "confident": 7.5, "neutral": 5, "measured": 5.5, "cautious": 4, "cautiously optimistic": 5.5, "concerned": 3, "negative": 2, "bearish": 1 };
  return map[tone] || 5;
}

function GuidanceVerdict({ met }) {
  if (met === null) return <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>PENDING</span>;
  return met
    ? <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700, color: "#2dd4a0", background: "rgba(45,212,160,0.08)", padding: "2px 6px", borderRadius: 3 }}>MET ✓</span>
    : <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700, color: "#e86452", background: "rgba(232,100,82,0.08)", padding: "2px 6px", borderRadius: 3 }}>MISSED ✗</span>;
}

function ToneBadge({ tone }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600,
      color: getToneColor(tone), background: `${getToneColor(tone)}12`,
      padding: "2px 8px", borderRadius: 3, border: `1px solid ${getToneColor(tone)}25`,
      textTransform: "capitalize", letterSpacing: 0.3
    }}>
      {tone}
    </span>
  );
}

function ToneArrow({ current, prior }) {
  if (!prior) return <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "var(--mono)" }}>NEW</span>;
  const curr = getToneScore(current);
  const prev = getToneScore(prior);
  const diff = curr - prev;
  if (Math.abs(diff) < 0.5) return <span style={{ fontSize: 12, color: "#8a8880" }}>→</span>;
  if (diff > 0) return <span style={{ fontSize: 12, color: "#2dd4a0" }}>↑</span>;
  return <span style={{ fontSize: 12, color: "#e86452" }}>↓</span>;
}

// ─── Sparkline Component ─────────────────────────────────────────────────────

function Sparkline({ data, width = 200, height = 40, color = "#c9a84c", showDots = true }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg width={width} height={height + 4} style={{ overflow: "visible" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 1.5}
          fill={i === points.length - 1 ? color : `${color}80`} />
      ))}
    </svg>
  );
}

// ─── Topic Heatmap ───────────────────────────────────────────────────────────

function TopicHeatmap({ company, quarters }) {
  const allTopics = new Set();
  quarters.forEach(q => {
    const qData = company.quarters[q];
    if (qData?.topicFrequency) Object.keys(qData.topicFrequency).forEach(t => allTopics.add(t));
  });
  const topics = [...allTopics];
  const maxFreq = Math.max(...topics.flatMap(t => quarters.map(q => company.quarters[q]?.topicFrequency?.[t] || 0)));

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${quarters.length}, 1fr)`, gap: 1, minWidth: 800 }}>
        {/* Header */}
        <div style={{ padding: "6px 8px" }} />
        {quarters.map(q => (
          <div key={q} style={{
            padding: "6px 4px", textAlign: "center",
            fontSize: 9, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.25)",
            letterSpacing: 0.5
          }}>
            {q}
          </div>
        ))}
        {/* Rows */}
        {topics.sort((a, b) => {
          const aMax = Math.max(...quarters.map(q => company.quarters[q]?.topicFrequency?.[a] || 0));
          const bMax = Math.max(...quarters.map(q => company.quarters[q]?.topicFrequency?.[b] || 0));
          return bMax - aMax;
        }).map(topic => (
          <div key={topic} style={{ display: "contents" }}>
            <div style={{
              padding: "4px 8px", fontSize: 11, fontFamily: "var(--body)",
              color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center"
            }}>
              {topic}
            </div>
            {quarters.map(q => {
              const val = company.quarters[q]?.topicFrequency?.[topic] || 0;
              const intensity = val / maxFreq;
              return (
                <div key={q} style={{
                  padding: "4px", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: "100%", height: 22, borderRadius: 3,
                    background: val > 0
                      ? `rgba(201,168,76,${0.05 + intensity * 0.45})`
                      : "rgba(255,255,255,0.01)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontFamily: "var(--mono)", fontWeight: val > 0 ? 600 : 400,
                    color: val > 0 ? `rgba(240,235,227,${0.3 + intensity * 0.6})` : "rgba(255,255,255,0.06)",
                    transition: "all 0.3s ease"
                  }}>
                    {val > 0 ? val : ""}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function ConferenceCallAnalyzer() {
  const [selectedTicker] = useState("NVDA");
  const [selectedQuarter, setSelectedQuarter] = useState("Q4'25");
  const [activeView, setActiveView] = useState("overview");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimateIn(true), 50); }, []);

  const company = COMPANIES[selectedTicker];
  const currentQ = company.quarters[selectedQuarter];

  // Compute QoQ and YoY data
  const qIdx = QUARTERS.indexOf(selectedQuarter);
  const priorQ = qIdx > 0 ? QUARTERS[qIdx - 1] : null;
  const yoyQ = qIdx >= 4 ? QUARTERS[qIdx - 4] : null;
  const priorQData = priorQ ? company.quarters[priorQ] : null;
  const yoyQData = yoyQ ? company.quarters[yoyQ] : null;

  // Revenue guidance trend
  const revenueTrend = QUARTERS.map(q => company.quarters[q]?.hardGuidance?.find(g => g.metric === "Revenue")?.midpoint || 0).filter(v => v > 0);
  const marginTrend = QUARTERS.map(q => company.quarters[q]?.hardGuidance?.find(g => g.metric === "Gross Margin")?.midpoint || 0).filter(v => v > 0);
  const toneTrend = QUARTERS.map(q => company.quarters[q]?.managementTone || 0).filter(v => v > 0);
  const sentimentTrend = QUARTERS.map(q => company.quarters[q]?.sentimentScore || 0).filter(v => v > 0);

  // Guidance track record
  const trackRecord = QUARTERS.reduce((acc, q) => {
    const qd = company.quarters[q];
    if (!qd) return acc;
    qd.hardGuidance.forEach(g => {
      if (g.met !== null) {
        acc.total++;
        if (g.met) acc.met++;
      }
    });
    return acc;
  }, { total: 0, met: 0 });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0b0f",
      color: "#e0dbd0",
      opacity: animateIn ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;800;900&family=Fira+Code:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing: border-box; }
        :root { --mono: 'Fira Code', monospace; --body: 'Work Sans', sans-serif; --display: 'Fraunces', Georgia, serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
      `}</style>

      {/* ── Header ──────────────────────────────────── */}
      <header style={{
        padding: "32px 36px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "radial-gradient(ellipse at 20% 0%, rgba(45,212,160,0.015) 0%, transparent 60%)",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase", fontFamily: "var(--mono)", fontWeight: 600, color: "#2dd4a0" }}>
                Conference Call Q&A Analyzer
              </span>
              <h1 style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 900, margin: "6px 0 0", color: "#f0ebe3", letterSpacing: -0.5 }}>
                {company.name}
              </h1>
              <p style={{ fontSize: 13, fontFamily: "var(--body)", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                12-quarter guidance tracking · Soft & hard signals · QoQ and YoY analysis
              </p>
            </div>
            {/* Track Record */}
            <div style={{ textAlign: "right", padding: "10px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 4 }}>
                Hard Guidance Track Record
              </div>
              <div style={{ fontSize: 36, fontFamily: "var(--mono)", fontWeight: 700, color: "#2dd4a0", lineHeight: 1 }}>
                {trackRecord.total > 0 ? Math.round(trackRecord.met / trackRecord.total * 100) : 0}%
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                {trackRecord.met}/{trackRecord.total} metrics met
              </div>
            </div>
          </div>

          {/* Quarter Selector */}
          <div style={{ display: "flex", gap: 3, marginTop: 18, overflowX: "auto", paddingBottom: 4 }}>
            {QUARTERS.map((q, i) => {
              const qd = company.quarters[q];
              const isActive = selectedQuarter === q;
              const hasActuals = qd?.hardGuidance?.some(g => g.actual !== null);
              return (
                <button key={q} onClick={() => setSelectedQuarter(q)} style={{
                  padding: "6px 12px", borderRadius: 5, cursor: "pointer", transition: "all 0.15s",
                  border: isActive ? "1px solid rgba(45,212,160,0.35)" : "1px solid rgba(255,255,255,0.05)",
                  background: isActive ? "rgba(45,212,160,0.08)" : "transparent",
                  color: isActive ? "#2dd4a0" : hasActuals ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                  fontFamily: "var(--mono)", fontSize: 11, fontWeight: isActive ? 700 : 500,
                  flexShrink: 0, position: "relative",
                }}>
                  {q}
                  {!hasActuals && <span style={{ position: "absolute", top: 2, right: 3, width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── View Tabs ──────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 36px 0" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "overview", label: "Quarter Deep Dive" },
            { key: "trends", label: "12Q Trend Lines" },
            { key: "heatmap", label: "Topic Heatmap" },
            { key: "soft", label: "Soft Guidance Tracker" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveView(tab.key)} style={{
              padding: "8px 16px", borderRadius: "6px 6px 0 0", cursor: "pointer", transition: "all 0.15s",
              border: "1px solid rgba(255,255,255,0.05)", borderBottom: activeView === tab.key ? "1px solid #0b0b0f" : "1px solid rgba(255,255,255,0.05)",
              background: activeView === tab.key ? "rgba(255,255,255,0.03)" : "transparent",
              color: activeView === tab.key ? "#f0ebe3" : "rgba(255,255,255,0.3)",
              fontFamily: "var(--body)", fontSize: 12, fontWeight: 600,
              marginBottom: -1, position: "relative", zIndex: activeView === tab.key ? 1 : 0,
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 36px 48px" }}>
        <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0 10px 10px 10px", padding: "24px" }}>

          {/* ═══ OVERVIEW VIEW ═══ */}
          {activeView === "overview" && currentQ && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Hard Guidance */}
              <div>
                <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
                  Hard Guidance — {selectedQuarter}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px 80px 70px 50px", padding: "6px 10px", fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.15)" }}>
                    <div>Metric</div><div>Guidance</div><div style={{ textAlign: "right" }}>Midpt</div><div style={{ textAlign: "right" }}>Actual</div><div style={{ textAlign: "right" }}>Surpr.</div><div style={{ textAlign: "center" }}>✓/✗</div>
                  </div>
                  {currentQ.hardGuidance.map((g, i) => {
                    const surprise = g.actual !== null ? ((g.actual - g.midpoint) / g.midpoint * 100) : null;
                    return (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "100px 1fr 80px 80px 70px 50px",
                        padding: "10px 10px", alignItems: "center",
                        background: "rgba(255,255,255,0.015)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.03)"
                      }}>
                        <span style={{ fontSize: 12, fontFamily: "var(--body)", fontWeight: 600, color: "#dad5cb" }}>{g.metric}</span>
                        <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.4)" }}>{g.value}</span>
                        <span style={{ textAlign: "right", fontSize: 11, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.3)" }}>
                          {g.unit === "%" ? `${g.midpoint}%` : `$${(g.midpoint / 1000).toFixed(1)}B`}
                        </span>
                        <span style={{ textAlign: "right", fontSize: 12, fontFamily: "var(--mono)", fontWeight: 600, color: g.actual ? "#f0ebe3" : "rgba(255,255,255,0.15)" }}>
                          {g.actual !== null ? (g.unit === "%" ? `${g.actual}%` : `$${(g.actual / 1000).toFixed(1)}B`) : "—"}
                        </span>
                        <span style={{ textAlign: "right", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600, color: surprise !== null ? (surprise >= 0 ? "#2dd4a0" : "#e86452") : "transparent" }}>
                          {surprise !== null ? `${surprise >= 0 ? "+" : ""}${surprise.toFixed(1)}%` : ""}
                        </span>
                        <div style={{ textAlign: "center" }}><GuidanceVerdict met={g.met} /></div>
                      </div>
                    );
                  })}
                </div>

                {/* QoQ Comparison */}
                {priorQData && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>
                      QoQ Hard Guidance Change ({priorQ} → {selectedQuarter})
                    </div>
                    {currentQ.hardGuidance.map((g, i) => {
                      const prior = priorQData.hardGuidance.find(p => p.metric === g.metric);
                      if (!prior) return null;
                      const change = ((g.midpoint - prior.midpoint) / prior.midpoint * 100);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                          <span style={{ width: 100, fontSize: 11, fontFamily: "var(--body)", color: "rgba(255,255,255,0.35)" }}>{g.metric}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>
                            {g.unit === "%" ? `${prior.midpoint}%` : `$${(prior.midpoint/1000).toFixed(1)}B`}
                          </span>
                          <span style={{ fontSize: 12, color: change >= 0 ? "#2dd4a0" : "#e86452" }}>→</span>
                          <span style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600, color: "#dad5cb" }}>
                            {g.unit === "%" ? `${g.midpoint}%` : `$${(g.midpoint/1000).toFixed(1)}B`}
                          </span>
                          <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600, color: change >= 0 ? "#2dd4a0" : "#e86452", background: change >= 0 ? "rgba(45,212,160,0.08)" : "rgba(232,100,82,0.08)", padding: "2px 5px", borderRadius: 3 }}>
                            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* YoY Comparison */}
                {yoyQData && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>
                      YoY Hard Guidance Change ({yoyQ} → {selectedQuarter})
                    </div>
                    {currentQ.hardGuidance.map((g, i) => {
                      const yoy = yoyQData.hardGuidance.find(p => p.metric === g.metric);
                      if (!yoy) return null;
                      const change = ((g.midpoint - yoy.midpoint) / yoy.midpoint * 100);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                          <span style={{ width: 100, fontSize: 11, fontFamily: "var(--body)", color: "rgba(255,255,255,0.35)" }}>{g.metric}</span>
                          <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>
                            {g.unit === "%" ? `${yoy.midpoint}%` : `$${(yoy.midpoint/1000).toFixed(1)}B`}
                          </span>
                          <span style={{ fontSize: 12, color: change >= 0 ? "#2dd4a0" : "#e86452" }}>→</span>
                          <span style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600, color: "#dad5cb" }}>
                            {g.unit === "%" ? `${g.midpoint}%` : `$${(g.midpoint/1000).toFixed(1)}B`}
                          </span>
                          <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600, color: change >= 0 ? "#2dd4a0" : "#e86452", background: change >= 0 ? "rgba(45,212,160,0.08)" : "rgba(232,100,82,0.08)", padding: "2px 5px", borderRadius: 3 }}>
                            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Soft Guidance */}
              <div>
                <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
                  Soft Guidance & Tone — {selectedQuarter}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currentQ.softGuidance.map((sg, i) => (
                    <div key={i} style={{
                      padding: "14px 16px", borderRadius: 8,
                      background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                      borderLeft: `3px solid ${getToneColor(sg.tone)}`
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontFamily: "var(--body)", fontWeight: 700, color: "#e0dbd0" }}>{sg.topic}</span>
                        <ToneBadge tone={sg.tone} />
                        <ToneArrow current={sg.tone} prior={sg.priorTone} />
                        {sg.priorTone && (
                          <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.15)" }}>
                            from {sg.priorTone}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, fontFamily: "var(--body)", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, margin: "0 0 6px", fontStyle: "italic" }}>
                        "{sg.quote}"
                      </p>
                      <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.25)", letterSpacing: 0.3 }}>
                        Signal: {sg.signal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quarter Meta */}
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.015)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>Mgmt Tone Score</div>
                    <div style={{ fontSize: 24, fontFamily: "var(--mono)", fontWeight: 700, color: currentQ.managementTone >= 7 ? "#2dd4a0" : currentQ.managementTone >= 5 ? "#c9a84c" : "#e86452" }}>
                      {currentQ.managementTone.toFixed(1)}<span style={{ fontSize: 12, opacity: 0.4 }}>/10</span>
                    </div>
                    {priorQData && (
                      <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: currentQ.managementTone >= priorQData.managementTone ? "#2dd4a0" : "#e86452" }}>
                        {currentQ.managementTone >= priorQData.managementTone ? "↑" : "↓"} QoQ from {priorQData.managementTone.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.015)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>Analyst Questions</div>
                    <div style={{ fontSize: 24, fontFamily: "var(--mono)", fontWeight: 700, color: "#e0dbd0" }}>
                      {currentQ.analystQuestions}
                    </div>
                    {priorQData && (
                      <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.25)" }}>
                        {currentQ.analystQuestions >= priorQData.analystQuestions ? "↑" : "↓"} QoQ from {priorQData.analystQuestions}
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Tone Words */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>Key Language This Quarter</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {currentQ.keyToneWords.map((w, i) => (
                      <span key={i} style={{
                        fontSize: 11, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.5)",
                        background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: 4,
                        border: "1px solid rgba(255,255,255,0.06)", fontStyle: "italic"
                      }}>
                        "{w}"
                      </span>
                    ))}
                  </div>
                </div>

                {currentQ.toneShift && (
                  <div style={{
                    marginTop: 14, padding: "10px 14px",
                    background: "rgba(45,212,160,0.03)", border: "1px solid rgba(45,212,160,0.1)",
                    borderRadius: 8, borderLeft: "3px solid #2dd4a0"
                  }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1.5, textTransform: "uppercase", color: "#2dd4a0", marginBottom: 4, fontWeight: 700 }}>
                      Tone Shift Assessment
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "var(--body)", color: "rgba(255,255,255,0.5)" }}>
                      {currentQ.toneShift}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ TRENDS VIEW ═══ */}
          {activeView === "trends" && (
            <div>
              <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
                12-Quarter Trend Lines — {company.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  { label: "Revenue Guidance Midpoint ($M)", data: revenueTrend, color: "#2dd4a0", format: v => `$${(v/1000).toFixed(1)}B` },
                  { label: "Gross Margin Guidance Midpoint (%)", data: marginTrend, color: "#c9a84c", format: v => `${v.toFixed(1)}%` },
                  { label: "Management Tone Score (0-10)", data: toneTrend, color: "#5b9cf5", format: v => v.toFixed(1) },
                  { label: "Overall Sentiment Score", data: sentimentTrend, color: "#b07ee8", format: v => v.toFixed(2) },
                ].map((chart, i) => (
                  <div key={i} style={{
                    padding: "18px 20px", background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                        {chart.label}
                      </span>
                      <span style={{ fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700, color: chart.color }}>
                        {chart.format(chart.data[chart.data.length - 1])}
                      </span>
                    </div>
                    <Sparkline data={chart.data} width={380} height={60} color={chart.color} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.15)" }}>
                      <span>Q1'23</span><span>Q4'25</span>
                    </div>
                    {/* Trend stats */}
                    <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                      {(() => {
                        const d = chart.data;
                        const qoq = d.length >= 2 ? ((d[d.length-1] - d[d.length-2]) / d[d.length-2] * 100) : 0;
                        const yoy = d.length >= 5 ? ((d[d.length-1] - d[d.length-5]) / d[d.length-5] * 100) : 0;
                        const total = d.length >= 2 ? ((d[d.length-1] - d[0]) / d[0] * 100) : 0;
                        return [
                          { label: "QoQ", val: qoq },
                          { label: "YoY", val: yoy },
                          { label: "12Q Total", val: total },
                        ].map((s, j) => (
                          <div key={j}>
                            <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.15)", letterSpacing: 0.5 }}>{s.label}: </span>
                            <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600, color: s.val >= 0 ? "#2dd4a0" : "#e86452" }}>
                              {s.val >= 0 ? "+" : ""}{s.val.toFixed(1)}%
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Guidance hit rate over time */}
              <div style={{ marginTop: 20, padding: "18px 20px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--body)", fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
                  Hard Guidance Accuracy by Quarter
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
                  {QUARTERS.map(q => {
                    const qd = company.quarters[q];
                    if (!qd) return null;
                    const total = qd.hardGuidance.filter(g => g.met !== null).length;
                    const met = qd.hardGuidance.filter(g => g.met === true).length;
                    const rate = total > 0 ? met / total : null;
                    return (
                      <div key={q} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        {rate !== null ? (
                          <>
                            <span style={{ fontSize: 9, fontFamily: "var(--mono)", fontWeight: 600, color: rate === 1 ? "#2dd4a0" : rate >= 0.5 ? "#c9a84c" : "#e86452" }}>
                              {Math.round(rate * 100)}%
                            </span>
                            <div style={{
                              width: "80%", height: 40, borderRadius: 3, position: "relative",
                              background: "rgba(255,255,255,0.03)",
                            }}>
                              <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0,
                                height: `${rate * 100}%`, borderRadius: 3,
                                background: rate === 1 ? "rgba(45,212,160,0.5)" : rate >= 0.5 ? "rgba(201,168,76,0.4)" : "rgba(232,100,82,0.4)",
                                transition: "height 0.5s ease"
                              }} />
                            </div>
                          </>
                        ) : (
                          <div style={{ width: "80%", height: 40, borderRadius: 3, background: "rgba(255,255,255,0.015)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.1)", fontFamily: "var(--mono)" }}>TBD</span>
                          </div>
                        )}
                        <span style={{ fontSize: 8, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.15)" }}>{q}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ HEATMAP VIEW ═══ */}
          {activeView === "heatmap" && (
            <div>
              <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
                Analyst Question Topic Frequency — 12 Quarters
              </div>
              <div style={{ fontSize: 11, fontFamily: "var(--body)", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
                Shows the number of analyst questions per topic each quarter. Brighter cells = more questions. Watch for topics that suddenly surge — they signal where the buy-side's attention is shifting.
              </div>
              <TopicHeatmap company={company} quarters={QUARTERS} />
              <div style={{
                marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)"
              }}>
                <span>Less</span>
                {[0.05, 0.15, 0.25, 0.35, 0.50].map((op, i) => (
                  <div key={i} style={{ width: 18, height: 12, borderRadius: 2, background: `rgba(201,168,76,${op})` }} />
                ))}
                <span>More questions</span>
              </div>
            </div>
          )}

          {/* ═══ SOFT GUIDANCE TRACKER VIEW ═══ */}
          {activeView === "soft" && (
            <div>
              <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
                Soft Guidance Evolution — Topic by Topic
              </div>
              <div style={{ fontSize: 11, fontFamily: "var(--body)", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                Track how management's qualitative language shifts over time for each key theme. Arrows show QoQ tone direction.
              </div>

              {(() => {
                // Collect all topics across all quarters
                const topicMap = {};
                QUARTERS.forEach(q => {
                  const qd = company.quarters[q];
                  if (!qd?.softGuidance) return;
                  qd.softGuidance.forEach(sg => {
                    if (!topicMap[sg.topic]) topicMap[sg.topic] = [];
                    topicMap[sg.topic].push({ quarter: q, ...sg });
                  });
                });

                return Object.entries(topicMap)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([topic, entries]) => (
                    <div key={topic} style={{
                      marginBottom: 16, padding: "16px 20px",
                      background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: 8
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontFamily: "var(--display)", fontWeight: 700, color: "#f0ebe3" }}>{topic}</span>
                        <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>
                          {entries.length} quarters tracked
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 4 }}>
                        {entries.map((e, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <div style={{
                              padding: "8px 12px", borderRadius: 6, minWidth: 120,
                              background: `${getToneColor(e.tone)}08`,
                              border: `1px solid ${getToneColor(e.tone)}20`,
                            }}>
                              <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)", marginBottom: 3 }}>{e.quarter}</div>
                              <ToneBadge tone={e.tone} />
                              <div style={{ fontSize: 10, fontFamily: "var(--body)", color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.4, maxWidth: 180 }}>
                                {e.signal}
                              </div>
                            </div>
                            {i < entries.length - 1 && (
                              <div style={{ padding: "0 4px", flexShrink: 0 }}>
                                <ToneArrow current={entries[i + 1]?.tone} prior={e.tone} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
              })()}
            </div>
          )}
        </div>

        <div style={{
          marginTop: 16, padding: "12px 16px",
          background: "rgba(255,255,255,0.01)", borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.03)"
        }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "var(--mono)", lineHeight: 1.6 }}>
            Data is illustrative, representing realistic NVIDIA earnings call patterns across 12 quarters. In production, connect to earnings transcript APIs (FactSet, Seeking Alpha, or S&P Capital IQ) and use Claude's API to extract structured guidance, tone analysis, and topic classification from raw transcripts. Soft guidance tone scoring uses a 10-point scale derived from language analysis.
          </div>
        </div>
      </div>
    </div>
  );
}
