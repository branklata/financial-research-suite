import { useState, useMemo, useEffect } from "react";

// ─── Simulated Data ──────────────────────────────────────────────────────────
// In production, this comes from SEC EDGAR API, transcript providers, and web scrapers

const SOURCE_TYPES = {
  SEC: { label: "SEC Filing", color: "#d4a853", icon: "§" },
  TRANSCRIPT: { label: "Earnings Call", color: "#5b9cf5", icon: "◉" },
  PRESENTATION: { label: "Investor Pres.", color: "#b07ee8", icon: "◧" },
  PRESS: { label: "Press Release", color: "#4ecda4", icon: "◆" },
  CONFERENCE: { label: "Conference", color: "#e87e6c", icon: "◈" },
  GUIDANCE: { label: "Guidance Update", color: "#e8b44f", icon: "△" },
};

const WATCHLIST = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", cap: "Large" },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", cap: "Large" },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", cap: "Large" },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", cap: "Large" },
  { ticker: "META", name: "Meta Platforms", sector: "Technology", cap: "Large" },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer", cap: "Large" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", cap: "Large" },
  { ticker: "DDOG", name: "Datadog Inc.", sector: "Technology", cap: "Mid" },
  { ticker: "NET", name: "Cloudflare Inc.", sector: "Technology", cap: "Mid" },
  { ticker: "ZS", name: "Zscaler Inc.", sector: "Technology", cap: "Mid" },
  { ticker: "SPGI", name: "S&P Global", sector: "Financials", cap: "Large" },
  { ticker: "HUBS", name: "HubSpot Inc.", sector: "Technology", cap: "Mid" },
];

const NOW = new Date(2026, 1, 22, 14, 30);
function hoursAgo(h) { return new Date(NOW.getTime() - h * 3600000); }
function daysAgo(d) { return new Date(NOW.getTime() - d * 86400000); }

const FILINGS = [
  {
    id: 1, ticker: "NVDA", type: "SEC", subtype: "10-K",
    title: "Annual Report (10-K) — FY2025",
    date: hoursAgo(2),
    url: "https://sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=nvda",
    isNew: true, hasNewInfo: true, priority: "high",
    summary: "Full-year revenue of $130.5B, up 114% YoY. Data center segment grew 142% to $115.2B. Gross margins expanded to 74.2%. Management highlighted sovereign AI demand as a new growth vector, with $18B in committed sovereign contracts — this is the first time they've broken out sovereign AI specifically.",
    delta: "NEW: First disclosure of sovereign AI pipeline ($18B committed). Previously only referenced as 'government and sovereign demand' without quantification. Also new: disclosed $4.2B in Blackwell-architecture deferred revenue, suggesting initial different yield curve than Hopper launch.",
    keyMetrics: { revenue: "$130.5B", yoy: "+114%", grossMargin: "74.2%", fcf: "$62.1B" },
    read: false, starred: false, tags: ["annual", "sovereign-ai", "blackwell"]
  },
  {
    id: 2, ticker: "NVDA", type: "TRANSCRIPT", subtype: "Q4 FY25",
    title: "Q4 FY2025 Earnings Call Transcript",
    date: hoursAgo(3),
    url: "#",
    isNew: true, hasNewInfo: true, priority: "high",
    summary: "Jensen Huang guided Q1 FY26 revenue to $43B ±2%, above consensus of $41.8B. Extended commentary on inference demand shifting from training — inference now 40% of data center revenue vs. 30% last quarter. Announced new NVLink-72 interconnect architecture for next-gen GB300 systems.",
    delta: "SHIFT: Inference mix jumped from 30% to 40% in one quarter — management had previously projected reaching 40% by Q3 FY26. This acceleration could change the margin profile narrative. NEW: NVLink-72 not previously disclosed; implies different competitive moat for multi-GPU inference.",
    keyMetrics: { q1Guide: "$43B ±2%", inferMix: "40%", dcRevenue: "$35.6B" },
    read: false, starred: true, tags: ["guidance", "inference-shift", "nvlink"]
  },
  {
    id: 3, ticker: "SPGI", type: "SEC", subtype: "8-K",
    title: "8-K — Q4 2024 Earnings Results",
    date: hoursAgo(6),
    url: "#",
    isNew: true, hasNewInfo: true, priority: "high",
    summary: "Revenue of $3.59B, up 14% YoY. Ratings segment revenue grew 31% driven by record bond issuance. Market Intelligence grew 6%. Announced $1.5B accelerated share repurchase program. FY2025 guidance: revenue $14.5-$14.7B, adj. EPS $17.40-$17.75.",
    delta: "KEY CHANGE: Ratings growth of 31% significantly above the 18-22% range they guided to at their November investor day. Driven by $800M in unplanned refinancing activity in Q4. New: broke out 'private market analytics' as a sub-segment for first time — $340M run rate, growing 28%. This had been buried in Market Intelligence previously.",
    keyMetrics: { revenue: "$3.59B", ratingsGrowth: "+31%", fy25Guide: "$14.5-$14.7B", eps: "$17.40-$17.75" },
    read: false, starred: false, tags: ["earnings", "ratings-cycle", "private-markets"]
  },
  {
    id: 4, ticker: "META", type: "PRESS", subtype: "Product",
    title: "Meta Announces Llama 4 Model Family and Enterprise API",
    date: hoursAgo(8),
    url: "#",
    isNew: true, hasNewInfo: false, priority: "medium",
    summary: "Launched Llama 4 with 400B parameter flagship model. Enterprise API priced at $2/M input tokens, $6/M output tokens — roughly 40% below GPT-4o pricing. Open-source release of 70B variant under modified Apache license.",
    delta: "Pricing strategy now directly undercutting OpenAI — previously Meta positioned Llama as free/open-source only. Enterprise API is a new monetization path not discussed in prior earnings calls. No revenue guidance attached yet.",
    keyMetrics: { pricing: "$2/$6 per M tokens", params: "400B flagship" },
    read: false, starred: false, tags: ["ai-strategy", "llama", "monetization"]
  },
  {
    id: 5, ticker: "JPM", type: "CONFERENCE", subtype: "Investor Day",
    title: "JPMorgan 2026 Investor Day — Key Highlights",
    date: daysAgo(1),
    url: "#",
    isNew: true, hasNewInfo: true, priority: "high",
    summary: "Jamie Dimon presented updated medium-term targets. NII guidance raised to $94-96B for FY2026 (from $91B prior). CIB targeting 17% ROTCE, up from 15% target. Technology spend increasing to $17B, with $4B earmarked for AI and automation. Credit card loss rate guidance maintained at 3.4-3.6%.",
    delta: "RAISED: NII target up ~5% from prior guidance — driven by higher-for-longer rate assumption and deposit mix shift. NEW: First time quantifying AI-specific spend ($4B). Previously only disclosed total tech budget. Dimon's tone on recession risk notably more cautious than Q4 call — used 'turbulent' three times.",
    keyMetrics: { niiGuide: "$94-96B", techSpend: "$17B", aiSpend: "$4B", cardLoss: "3.4-3.6%" },
    read: true, starred: true, tags: ["investor-day", "nii-raise", "ai-spend"]
  },
  {
    id: 6, ticker: "MSFT", type: "SEC", subtype: "10-Q",
    title: "Quarterly Report (10-Q) — Q2 FY2026",
    date: daysAgo(1),
    url: "#",
    isNew: false, hasNewInfo: true, priority: "medium",
    summary: "Revenue $69.6B, up 16% YoY. Intelligent Cloud segment $26.3B, Azure grew 31% (18pp from AI services). Commercial remaining performance obligations (cRPO) grew 34% to $298B. GitHub Copilot revenue crossed $2B annual run rate.",
    delta: "Azure AI contribution of 18pp up from 13pp last quarter — acceleration continuing. NEW: First time disclosing GitHub Copilot as $2B+ ARR; previously only disclosed 'millions of subscribers' without revenue. cRPO growth of 34% is highest since post-Activision bump — implies strong bookings momentum into H2.",
    keyMetrics: { revenue: "$69.6B", azureGrowth: "+31%", aiContrib: "18pp", cRPO: "$298B" },
    read: true, starred: false, tags: ["azure-ai", "copilot", "crpo"]
  },
  {
    id: 7, ticker: "DDOG", type: "TRANSCRIPT", subtype: "Q4 2024",
    title: "Q4 2024 Earnings Call Transcript",
    date: daysAgo(2),
    url: "#",
    isNew: false, hasNewInfo: true, priority: "medium",
    summary: "Revenue $738M, up 26% YoY and above $711-713M guidance. Customers with $100K+ ARR grew to 3,490, up 13%. AI-native customers now represent 6% of ARR vs. 4% last quarter. LLM Observability product seeing fastest adoption of any new product in company history.",
    delta: "AI-native customer mix accelerating faster than management projected (they guided to 5% by year-end). LLM Observability commentary is new — hadn't been broken out in prior calls. Net retention rate held at 115%, reversing the deceleration trend from prior 3 quarters.",
    keyMetrics: { revenue: "$738M", growth: "+26%", largeCustomers: "3,490", aiMix: "6%" },
    read: true, starred: false, tags: ["ai-observability", "expansion", "retention"]
  },
  {
    id: 8, ticker: "AAPL", type: "SEC", subtype: "8-K",
    title: "8-K — Leadership Transition Disclosure",
    date: daysAgo(2),
    url: "#",
    isNew: false, hasNewInfo: true, priority: "medium",
    summary: "Filed 8-K disclosing VP of AI/ML departure effective March 15, 2026. Severance package of $12M disclosed. Role to be filled internally with search led by Craig Federighi. No change to Apple Intelligence product roadmap per filing language.",
    delta: "Personnel change not previously reported. The 'no change to roadmap' language is standard but notable given Apple Intelligence has been criticized for slow feature rollout. The internal search decision (vs. external) may signal strategic direction for AI team.",
    keyMetrics: { severance: "$12M", effective: "Mar 15, 2026" },
    read: false, starred: false, tags: ["leadership", "apple-intelligence", "personnel"]
  },
  {
    id: 9, ticker: "GOOGL", type: "PRESENTATION", subtype: "Cloud Next",
    title: "Google Cloud Next 2026 — Investor Track Presentation",
    date: daysAgo(3),
    url: "#",
    isNew: false, hasNewInfo: true, priority: "medium",
    summary: "Google Cloud CEO presented updated cloud market share data: GCP at 13% (up from 11% a year ago). Announced $7B in new sovereign cloud contracts across 6 countries. Gemini API call volume growing 10x quarter-over-quarter. Introduced 'AI Hypercomputer' managed service with custom TPU v6 allocation.",
    delta: "Market share disclosure is new — Google had stopped sharing specific share numbers in 2024. Sovereign cloud contracts quantified for first time ($7B). Gemini API growth rate of 10x QoQ is the first hard metric on adoption; previously only qualitative commentary.",
    keyMetrics: { marketShare: "13%", sovereignCloud: "$7B", geminiGrowth: "10x QoQ" },
    read: true, starred: false, tags: ["cloud-share", "sovereign", "gemini"]
  },
  {
    id: 10, ticker: "ZS", type: "SEC", subtype: "10-Q",
    title: "Quarterly Report (10-Q) — Q2 FY2026",
    date: daysAgo(3),
    url: "#",
    isNew: false, hasNewInfo: false, priority: "low",
    summary: "Revenue $616M, up 24% YoY. Billings growth of 22%, slight deceleration from 25% in Q1. Net retention rate stable at 120%. Zero Trust Exchange platform now deployed by 35% of Fortune 500.",
    delta: "No materially new information vs. the earnings call transcript. Billings deceleration from 25% to 22% was already flagged on the call. Fortune 500 penetration metric (35%) is a useful datapoint but was mentioned verbally on the call.",
    keyMetrics: { revenue: "$616M", billingsGrowth: "+22%", nrr: "120%" },
    read: true, starred: false, tags: ["zero-trust", "billings"]
  },
  {
    id: 11, ticker: "AMZN", type: "GUIDANCE", subtype: "Updated",
    title: "Q1 2026 Revenue Guidance — Updated at Morgan Stanley Conference",
    date: daysAgo(4),
    url: "#",
    isNew: false, hasNewInfo: true, priority: "high",
    summary: "CFO Brian Olsavsky provided updated Q1 2026 guidance at the Morgan Stanley TMT Conference: revenue $155-$160B (prior guide $151-$155.5B). AWS growth expected to accelerate to 22-24% from 19% in Q4. Raised FY26 capex estimate to $85-90B from prior $75-80B range.",
    delta: "RAISED: Both revenue guidance and capex raised mid-quarter — unusual for Amazon to update guidance at a conference. AWS acceleration call is directionally new. Capex raise of $10B at midpoint is significant and was not signaled on the Q4 call.",
    keyMetrics: { q1Guide: "$155-$160B", awsGrowth: "22-24%", capex: "$85-90B" },
    read: false, starred: true, tags: ["guidance-raise", "aws-accel", "capex"]
  },
  {
    id: 12, ticker: "NET", type: "PRESS", subtype: "Product",
    title: "Cloudflare Launches Workers AI Inference Platform",
    date: daysAgo(5),
    url: "#",
    isNew: false, hasNewInfo: false, priority: "low",
    summary: "Announced general availability of Workers AI inference platform. Supports 40+ open-source models. Pricing at $0.01 per 1K tokens for Llama models. Integrated with R2 storage for model artifacts.",
    delta: "Product was previously announced at Developer Week in November. GA launch is incremental. No new financial metrics or customer adoption data disclosed.",
    keyMetrics: { pricing: "$0.01/1K tokens", models: "40+" },
    read: true, starred: false, tags: ["workers-ai", "inference"]
  },
];

// ─── Utility Functions ───────────────────────────────────────────────────────

function formatRelativeTime(date) {
  const diff = NOW.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ─── Components ──────────────────────────────────────────────────────────────

function PriorityDot({ priority }) {
  const colors = { high: "#e8564a", medium: "#d4a853", low: "rgba(255,255,255,0.15)" };
  return (
    <div style={{
      width: 7, height: 7, borderRadius: "50%",
      background: colors[priority] || colors.low,
      boxShadow: priority === "high" ? `0 0 6px ${colors.high}40` : "none",
      flexShrink: 0
    }} />
  );
}

function SourceBadge({ type }) {
  const src = SOURCE_TYPES[type] || SOURCE_TYPES.PRESS;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600,
      color: src.color, background: `${src.color}12`,
      padding: "3px 8px", borderRadius: 4, letterSpacing: 0.3,
      border: `1px solid ${src.color}20`
    }}>
      <span style={{ fontSize: 8 }}>{src.icon}</span> {src.label}
    </span>
  );
}

function DeltaBadge({ hasNewInfo }) {
  if (!hasNewInfo) return null;
  return (
    <span style={{
      fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700,
      color: "#0c0c0e", background: "#d4a853",
      padding: "2px 6px", borderRadius: 3, letterSpacing: 0.8,
      textTransform: "uppercase"
    }}>
      Δ New Info
    </span>
  );
}

function MetricPill({ label, value }) {
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", gap: 2,
      padding: "6px 10px", background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6,
    }}>
      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "var(--mono)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#e8e6e1", fontFamily: "var(--mono)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function FilingCard({ filing, onToggleStar, onToggleRead, isExpanded, onToggleExpand }) {
  const company = WATCHLIST.find(w => w.ticker === filing.ticker);
  const typeInfo = SOURCE_TYPES[filing.type];

  return (
    <div
      style={{
        background: filing.isNew ? "rgba(212,168,83,0.02)" : "rgba(255,255,255,0.01)",
        border: `1px solid ${filing.isNew ? "rgba(212,168,83,0.12)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: 10,
        overflow: "hidden",
        transition: "all 0.2s ease",
        opacity: filing.read && !isExpanded ? 0.7 : 1,
        position: "relative",
      }}
    >
      {/* Unread indicator */}
      {!filing.read && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${typeInfo.color}, ${typeInfo.color}40)`,
          borderRadius: "10px 0 0 10px"
        }} />
      )}

      {/* Main row */}
      <div
        onClick={onToggleExpand}
        style={{ padding: "16px 20px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {/* Left: Priority + Star */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 4 }}>
          <PriorityDot priority={filing.priority} />
          <button
            onClick={e => { e.stopPropagation(); onToggleStar(); }}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              color: filing.starred ? "#d4a853" : "rgba(255,255,255,0.12)",
              fontSize: 14, transition: "color 0.2s", lineHeight: 1,
            }}
            onMouseEnter={e => { if (!filing.starred) e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { if (!filing.starred) e.currentTarget.style.color = "rgba(255,255,255,0.12)"; }}
          >
            {filing.starred ? "★" : "☆"}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{
              fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13,
              color: typeInfo.color, letterSpacing: 0.5
            }}>
              {filing.ticker}
            </span>
            <SourceBadge type={filing.type} />
            {filing.subtype && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--mono)" }}>
                {filing.subtype}
              </span>
            )}
            <DeltaBadge hasNewInfo={filing.hasNewInfo} />
            {filing.isNew && (
              <span style={{
                fontSize: 9, fontFamily: "var(--mono)", fontWeight: 600,
                color: "#5b9cf5", background: "rgba(91,156,245,0.1)",
                padding: "2px 6px", borderRadius: 3, letterSpacing: 0.5
              }}>
                NEW
              </span>
            )}
          </div>

          <div style={{
            fontSize: 15, fontWeight: 600, color: "#e8e6e1",
            fontFamily: "var(--body)", lineHeight: 1.35, marginBottom: 6,
            letterSpacing: -0.2
          }}>
            {filing.title}
          </div>

          {!isExpanded && (
            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "var(--body)",
              lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden"
            }}>
              {filing.summary}
            </div>
          )}
        </div>

        {/* Right: Time + Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>
            {formatRelativeTime(filing.date)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleRead(); }}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4, padding: "3px 8px", cursor: "pointer",
              fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 0.5,
              color: filing.read ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s"
            }}
          >
            {filing.read ? "READ" : "MARK READ"}
          </button>
        </div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div style={{
          padding: "0 20px 20px 48px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          marginTop: -2
        }}>
          {/* AI Summary */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
              textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8
            }}>
              Summary
            </div>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "var(--body)",
              lineHeight: 1.65, margin: 0
            }}>
              {filing.summary}
            </p>
          </div>

          {/* Delta Section */}
          {filing.hasNewInfo && (
            <div style={{
              marginTop: 16, padding: "12px 14px",
              background: "rgba(212,168,83,0.04)",
              border: "1px solid rgba(212,168,83,0.12)",
              borderRadius: 8, borderLeft: "3px solid #d4a853"
            }}>
              <div style={{
                fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
                textTransform: "uppercase", color: "#d4a853", marginBottom: 8, fontWeight: 700
              }}>
                Δ What's New vs. Prior Disclosures
              </div>
              <p style={{
                fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "var(--body)",
                lineHeight: 1.65, margin: 0
              }}>
                {filing.delta}
              </p>
            </div>
          )}

          {/* Key Metrics */}
          {filing.keyMetrics && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8
              }}>
                Key Metrics
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(filing.keyMetrics).map(([k, v]) => (
                  <MetricPill key={k} label={k.replace(/([A-Z])/g, " $1").trim()} value={v} />
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {filing.tags && (
            <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {filing.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.03)", padding: "3px 8px", borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: 14, display: "flex", alignItems: "center", gap: 12,
            paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)"
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--mono)" }}>
              {formatDate(filing.date)}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>·</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--body)" }}>
              {company?.name} — {company?.sector}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function WatchlistSidebar({ watchlist, filings, selectedTicker, onSelect, stats }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderRight: "1px solid rgba(255,255,255,0.05)",
      padding: "20px 0",
      height: "calc(100vh - 140px)",
      overflowY: "auto",
      position: "sticky", top: 140,
    }}>
      <div style={{
        fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 2,
        textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
        padding: "0 16px", marginBottom: 12
      }}>
        Watchlist ({watchlist.length})
      </div>

      <button
        onClick={() => onSelect(null)}
        style={{
          display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
          padding: "8px 16px", background: !selectedTicker ? "rgba(255,255,255,0.04)" : "transparent",
          border: "none", cursor: "pointer", transition: "background 0.15s",
          borderLeft: !selectedTicker ? "2px solid #d4a853" : "2px solid transparent",
        }}
        onMouseEnter={e => { if (selectedTicker) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
        onMouseLeave={e => { if (selectedTicker) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: 12, fontFamily: "var(--body)", fontWeight: 600, color: !selectedTicker ? "#d4a853" : "rgba(255,255,255,0.5)" }}>
          All Companies
        </span>
        <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)" }}>
          {filings.length}
        </span>
      </button>

      {watchlist.map(w => {
        const count = filings.filter(f => f.ticker === w.ticker).length;
        const unread = filings.filter(f => f.ticker === w.ticker && !f.read).length;
        const isActive = selectedTicker === w.ticker;
        const typeColor = SOURCE_TYPES[filings.find(f => f.ticker === w.ticker)?.type]?.color || "rgba(255,255,255,0.3)";

        return (
          <button
            key={w.ticker}
            onClick={() => onSelect(w.ticker)}
            style={{
              display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px", background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
              border: "none", cursor: "pointer", transition: "background 0.15s",
              borderLeft: isActive ? `2px solid ${typeColor}` : "2px solid transparent",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700,
                color: isActive ? "#e8e6e1" : "rgba(255,255,255,0.45)",
                letterSpacing: 0.3
              }}>
                {w.ticker}
              </span>
              {unread > 0 && (
                <span style={{
                  fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700,
                  background: "#d4a853", color: "#0c0c0e",
                  width: 16, height: 16, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {unread}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "var(--mono)" }}>
              {count > 0 ? count : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function PrimarySourceAggregator() {
  const [filings, setFilings] = useState(FILINGS);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showDeltaOnly, setShowDeltaOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimateIn(true), 50); }, []);

  const toggleStar = (id) => {
    setFilings(f => f.map(fi => fi.id === id ? { ...fi, starred: !fi.starred } : fi));
  };
  const toggleRead = (id) => {
    setFilings(f => f.map(fi => fi.id === id ? { ...fi, read: !fi.read } : fi));
  };

  const filtered = useMemo(() => {
    return filings.filter(f => {
      if (selectedTicker && f.ticker !== selectedTicker) return false;
      if (typeFilter !== "ALL" && f.type !== typeFilter) return false;
      if (showDeltaOnly && !f.hasNewInfo) return false;
      if (showUnreadOnly && f.read) return false;
      if (showStarredOnly && !f.starred) return false;
      if (priorityFilter !== "ALL" && f.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return f.title.toLowerCase().includes(q) || f.summary.toLowerCase().includes(q) ||
               f.ticker.toLowerCase().includes(q) || (f.tags || []).some(t => t.includes(q));
      }
      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filings, selectedTicker, typeFilter, showDeltaOnly, showUnreadOnly, showStarredOnly, searchQuery, priorityFilter]);

  const unreadCount = filings.filter(f => !f.read).length;
  const deltaCount = filings.filter(f => f.hasNewInfo && f.isNew).length;
  const highPriorityCount = filings.filter(f => f.priority === "high" && !f.read).length;

  const cssVars = {
    "--mono": "'IBM Plex Mono', 'Menlo', monospace",
    "--body": "'Libre Franklin', 'Helvetica Neue', sans-serif",
    "--display": "'Newsreader', 'Georgia', serif",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0c",
      color: "#e8e6e1",
      ...cssVars,
      opacity: animateIn ? 1 : 0,
      transition: "opacity 0.6s ease",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Libre+Franklin:wght@400;500;600;700&family=Newsreader:wght@400;600;700;800&display=swap" rel="stylesheet"/>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{
        padding: "28px 32px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "linear-gradient(180deg, rgba(212,168,83,0.02) 0%, transparent 100%)",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
                  fontFamily: "var(--mono)", fontWeight: 600, color: "#d4a853"
                }}>
                  Primary Source Aggregator
                </span>
                <span style={{
                  fontSize: 8, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3
                }}>
                  LIVE
                </span>
              </div>
              <h1 style={{
                fontFamily: "var(--display)", fontSize: 28, fontWeight: 800,
                margin: "4px 0 0", letterSpacing: -0.5, color: "#e8e6e1", lineHeight: 1.1
              }}>
                Research Inbox
              </h1>
            </div>

            {/* Alert Counters */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {[
                { label: "Unread", value: unreadCount, color: "#5b9cf5" },
                { label: "New Delta", value: deltaCount, color: "#d4a853", pulse: deltaCount > 0 },
                { label: "High Priority", value: highPriorityCount, color: "#e8564a" },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: 22, fontFamily: "var(--mono)", fontWeight: 700,
                    color: stat.value > 0 ? stat.color : "rgba(255,255,255,0.15)",
                    lineHeight: 1,
                    animation: stat.pulse ? "pulse 2s ease-in-out infinite" : "none"
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 9, fontFamily: "var(--mono)", letterSpacing: 1,
                    color: "rgba(255,255,255,0.25)", marginTop: 2, textTransform: "uppercase"
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{
            display: "flex", gap: 8, marginTop: 16, alignItems: "center", flexWrap: "wrap"
          }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "0 0 240px" }}>
              <input
                type="text" placeholder="Search filings, tickers, tags..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "7px 12px 7px 30px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6, color: "#e8e6e1", fontSize: 12, fontFamily: "var(--body)",
                  outline: "none"
                }}
              />
              <span style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.2)", fontSize: 13
              }}>⌕</span>
            </div>

            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.06)" }} />

            {/* Source Type */}
            {[
              { key: "ALL", label: "All Types" },
              ...Object.entries(SOURCE_TYPES).map(([k, v]) => ({ key: k, label: v.label, color: v.color }))
            ].map(t => (
              <button key={t.key} onClick={() => setTypeFilter(t.key)} style={{
                padding: "6px 12px", borderRadius: 5, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                border: typeFilter === t.key ? `1px solid ${t.color || "rgba(255,255,255,0.3)"}40` : "1px solid rgba(255,255,255,0.06)",
                background: typeFilter === t.key ? `${t.color || "rgba(255,255,255,0.3)"}10` : "transparent",
                color: typeFilter === t.key ? (t.color || "#e8e6e1") : "rgba(255,255,255,0.35)",
              }}>
                {t.label}
              </button>
            ))}

            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.06)" }} />

            {/* Toggle filters */}
            {[
              { key: "delta", label: "Δ Delta Only", active: showDeltaOnly, toggle: () => setShowDeltaOnly(v => !v), color: "#d4a853" },
              { key: "unread", label: "Unread", active: showUnreadOnly, toggle: () => setShowUnreadOnly(v => !v), color: "#5b9cf5" },
              { key: "starred", label: "★ Starred", active: showStarredOnly, toggle: () => setShowStarredOnly(v => !v), color: "#d4a853" },
            ].map(btn => (
              <button key={btn.key} onClick={btn.toggle} style={{
                padding: "6px 12px", borderRadius: 5, fontSize: 11, fontFamily: "var(--body)", fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                border: btn.active ? `1px solid ${btn.color}40` : "1px solid rgba(255,255,255,0.06)",
                background: btn.active ? `${btn.color}10` : "transparent",
                color: btn.active ? btn.color : "rgba(255,255,255,0.35)",
              }}>
                {btn.label}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            {/* Priority */}
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{
              padding: "6px 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)",
              fontSize: 11, fontFamily: "var(--body)", cursor: "pointer", appearance: "none"
            }}>
              <option value="ALL" style={{ background: "#14141a" }}>All Priority</option>
              <option value="high" style={{ background: "#14141a" }}>🔴 High</option>
              <option value="medium" style={{ background: "#14141a" }}>🟡 Medium</option>
              <option value="low" style={{ background: "#14141a" }}>⚪ Low</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex" }}>

        {/* Sidebar */}
        <WatchlistSidebar
          watchlist={WATCHLIST}
          filings={filings}
          selectedTicker={selectedTicker}
          onSelect={setSelectedTicker}
        />

        {/* Main Feed */}
        <main style={{ flex: 1, padding: "20px 28px", minWidth: 0 }}>
          {/* Results count */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 16
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--mono)" }}>
              {filtered.length} filing{filtered.length !== 1 ? "s" : ""}
              {selectedTicker ? ` for ${selectedTicker}` : ""}
              {showDeltaOnly ? " with new information" : ""}
            </span>
            <button
              onClick={() => setFilings(f => f.map(fi => ({
                ...fi,
                read: filtered.some(ff => ff.id === fi.id) ? true : fi.read
              })))}
              style={{
                background: "none", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 5, padding: "5px 10px", cursor: "pointer",
                fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.3)",
                letterSpacing: 0.5, transition: "all 0.15s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
            >
              Mark all read
            </button>
          </div>

          {/* Filing Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                color: "rgba(255,255,255,0.2)", fontFamily: "var(--body)"
              }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⌕</div>
                <div style={{ fontSize: 14 }}>No filings match your filters</div>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>
                  Try adjusting your source type or search criteria
                </div>
              </div>
            ) : (
              filtered.map((filing, i) => (
                <div
                  key={filing.id}
                  style={{
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`
                  }}
                >
                  <FilingCard
                    filing={filing}
                    isExpanded={expandedId === filing.id}
                    onToggleExpand={() => setExpandedId(expandedId === filing.id ? null : filing.id)}
                    onToggleStar={() => toggleStar(filing.id)}
                    onToggleRead={() => toggleRead(filing.id)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 24, padding: "14px 16px",
            background: "rgba(255,255,255,0.015)", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.04)"
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", fontFamily: "var(--mono)", lineHeight: 1.6 }}>
              <strong style={{ color: "rgba(255,255,255,0.3)" }}>How this works in production:</strong> SEC EDGAR RSS feeds + earnings transcript APIs + press release wires feed into a pipeline.
              Claude's API analyzes each new document against the company's prior disclosures to generate the Δ delta — surfacing only what's genuinely new.
              Priority scoring is based on materiality heuristics (guidance changes, new segment disclosures, leadership changes, capex revisions).
              Connect your own watchlist and data sources to go live.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
