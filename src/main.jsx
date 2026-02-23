import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import GuidanceTracker from './apps/GuidanceTracker'
import PrimarySourceAggregator from './apps/PrimarySourceAggregator'
import ConsensusTearApart from './apps/ConsensusTearApart'
import ConferenceCallAnalyzer from './apps/ConferenceCallAnalyzer'

function NavBar() {
  const location = useLocation()
  const apps = [
    { path: '/', label: 'Home', icon: '◈' },
    { path: '/guidance', label: 'Guidance Tracker', icon: '§' },
    { path: '/sources', label: 'Source Aggregator', icon: '◉' },
    { path: '/consensus', label: 'Consensus Tear-Apart', icon: '△' },
    { path: '/calls', label: 'Call Analyzer', icon: '◧' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 24px', height: 44,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      {apps.map(app => (
        <Link key={app.path} to={app.path} style={{
          textDecoration: 'none',
          padding: '6px 14px', borderRadius: 5,
          fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
          color: location.pathname === app.path ? '#c9a84c' : 'rgba(255,255,255,0.35)',
          background: location.pathname === app.path ? 'rgba(201,168,76,0.08)' : 'transparent',
          border: location.pathname === app.path ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
          transition: 'all 0.15s', letterSpacing: 0.3,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 10 }}>{app.icon}</span> {app.label}
        </Link>
      ))}
    </nav>
  )
}

function HomePage() {
  const apps = [
    { path: '/guidance', title: 'Management Guidance Tracker', desc: 'Track whether management met their revenue and EPS guidance across large and mid cap companies. Credibility scores, beat rates, and quarterly history.', color: '#0ea87b' },
    { path: '/sources', title: 'Primary Source Aggregator', desc: 'Your research inbox. SEC filings, earnings transcripts, investor presentations, and press releases — with AI-powered delta detection showing only what\'s genuinely new.', color: '#d4a853' },
    { path: '/consensus', title: 'Consensus Tear-Apart', desc: 'Decompose Street consensus EPS into revenue, margins, tax, and share count. Adjust any assumption to model your variant perception and see how it flows to a different number.', color: '#c9a84c' },
    { path: '/calls', title: 'Conference Call Q&A Analyzer', desc: '12 quarters of soft and hard guidance tracking. Topic heatmaps, tone shift analysis, QoQ and YoY comparisons, and management credibility scoring.', color: '#2dd4a0' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: '#0b0b0f', color: '#e0dbd0',
      padding: '80px 36px 60px', maxWidth: 1000, margin: '0 auto',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ marginBottom: 48 }}>
        <span style={{ fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#c9a84c' }}>
          Financial Research Suite
        </span>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 42, fontWeight: 900, margin: '8px 0 0', color: '#f0ebe3', letterSpacing: -0.5, lineHeight: 1.1 }}>
          Institutional-Grade<br/>Research Tools
        </h1>
        <p style={{ fontSize: 15, fontFamily: "'Source Sans 3', sans-serif", color: 'rgba(255,255,255,0.35)', marginTop: 12, maxWidth: 520, lineHeight: 1.55 }}>
          Four integrated tools for buy-side analysts. Track management credibility, monitor primary sources, challenge consensus, and analyze earnings call dynamics.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {apps.map((app, i) => (
          <Link key={app.path} to={app.path} style={{
            textDecoration: 'none',
            padding: '28px 24px',
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            borderLeft: `3px solid ${app.color}`,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#f0ebe3', margin: '0 0 8px', letterSpacing: -0.3 }}>
              {app.title}
            </h2>
            <p style={{ fontSize: 13, fontFamily: "'Source Sans 3', sans-serif", color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, margin: 0 }}>
              {app.desc}
            </p>
            <div style={{ marginTop: 14, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: app.color, fontWeight: 600 }}>
              Open tool →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div style={{ paddingTop: 44 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/guidance" element={<GuidanceTracker />} />
          <Route path="/sources" element={<PrimarySourceAggregator />} />
          <Route path="/consensus" element={<ConsensusTearApart />} />
          <Route path="/calls" element={<ConferenceCallAnalyzer />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
