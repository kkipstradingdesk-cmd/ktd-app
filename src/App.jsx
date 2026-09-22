import { useEffect, useState, useRef } from 'react'
import { usersCol, userDoc, getDoc, updateDoc, onSnapshot } from './firebase.js'
import { getPrices } from './lib/market.js'
import NewsTicker from './components/NewsTicker.jsx'
import StockTicker from './components/StockTicker.jsx'
import MarketStatus from './components/MarketStatus.jsx'
import LockScreen from './components/LockScreen.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import TradePanel from './components/TradePanel.jsx'
import Portfolio from './components/Portfolio.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import TradeHistory from './components/TradeHistory.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import AdminPanel from './components/AdminPanel.jsx'

export default function App() {
  const [user, setUser] = useState(null)        // unlocked, active user
  const [lockedUser, setLockedUser] = useState(null) // known user awaiting PIN
  const [leaderboard, setLeaderboard] = useState([])
  const [prices, setPrices] = useState({})
  const [showSettings, setShowSettings] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const userRef = useRef(null)
  userRef.current = user

  // ---- Session restore: stay logged in on the device ----
  useEffect(() => {
    const uid = localStorage.getItem('ktd_uid')
    if (!uid) return
    getDoc(userDoc(uid)).then((snap) => {
      if (!snap.exists()) { localStorage.clear(); return }
      const data = { id: uid, ...snap.data() }
      if (localStorage.getItem('ktd_session') === 'active') setUser(data)
      else setLockedUser(data)
    })
  }, [])

  // ---- Live leaderboard (Firestore realtime listener) ----
  useEffect(() => {
    return onSnapshot(usersCol, (snap) => {
      setLeaderboard(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [])

  // ---- Live prices for my holdings ----
  useEffect(() => {
    if (!user || user.holdings.length === 0) return
    const syms = user.holdings.map((h) => h.symbol)
    const load = () => getPrices(syms).then(setPrices).catch(() => {})
    load()
    const t = setInterval(load, 15_000)
    return () => clearInterval(t)
  }, [user?.holdings?.map((h) => h.symbol).join(',')])

  // ---- Guardrail 4: 30-second auto-recalc of portfolio value + ROI → Firestore ----
  useEffect(() => {
    const t = setInterval(async () => {
      const u = userRef.current
      if (!u || !u.holdings.length) return
      try {
        const px = await getPrices(u.holdings.map((h) => h.symbol))
        const invested = u.holdings.reduce((s, h) => s + h.qty * h.avgPrice, 0)
        const current = u.holdings.reduce((s, h) => s + h.qty * (px[h.symbol] || h.avgPrice), 0)
        const portfolioValue = u.cashBalance + current
        const roi = invested > 0 ? ((current - invested) / invested) * 100 : 0
        await updateDoc(userDoc(u.id), { portfolioValue, roi })
        setUser((prev) => ({ ...prev, portfolioValue, roi }))
      } catch {}
    }, 30_000)
    return () => clearInterval(t)
  }, [])

  function logout() {
    localStorage.removeItem('ktd_session')
    setUser(null)
    setLockedUser(user)
  }

  // ---------------- Screens ----------------
  if (lockedUser && !user)
    return <LockScreen user={lockedUser} onUnlock={() => { localStorage.setItem('ktd_session', 'active'); setUser(lockedUser); setLockedUser(null) }} />

  if (!user)
    return <RegisterForm onRegistered={(u) => { localStorage.setItem('ktd_session', 'active'); setUser(u) }} />

  // ---------------- Main desk layout ----------------
  // Mobile: single column (leaderboard at bottom). Desktop: leaderboard on the right.
  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      {/* Header */}
      <div style={{ background: '#000', padding: '10px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="terminal" style={{ color: '#ff9d00', fontSize: 16, letterSpacing: 2, margin: 0 }}>KIPS TRADING DESK</h1>
          <p className="terminal" style={{ color: '#555', fontSize: 10, margin: 0 }}>KTD · SIMULATOR · {leaderboard.length}/100 PLAYERS</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <MarketStatus />
          <button onClick={() => setShowAdmin(true)} title="Admin" className="terminal" style={{ background: '#111', border: '1px solid #333', color: '#ff9d00', borderRadius: 4, width: 34, height: 34, cursor: 'pointer', fontSize: 14 }}>⚙</button>
          <button onClick={() => setShowSettings(true)} title="Settings" style={{ background: '#111', border: '1px solid #333', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
            <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </div>

      {/* Two Bloomberg-style tickers */}
      <NewsTicker />
      <StockTicker />

      {/* Body */}
      <div className="desk-layout" style={{ display: 'grid', gap: 10, padding: 10, gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Portfolio user={user} prices={prices} />
          <TradePanel user={user} onUpdate={setUser} />
          <TradeHistory history={user.tradeHistory || []} />
          <button className="terminal" onClick={logout} style={{ background: 'none', border: '1px solid #333', color: '#666', padding: 8, borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
            🔒 LOCK DESK
          </button>
          <p className="terminal" style={{ color: '#333', fontSize: 10, textAlign: 'center', margin: '0 0 10px' }}>Tip: open browser menu → "Add to Home Screen" to install KTD 📱</p>
        </div>
        <div className="desk-leaderboard" style={{ minHeight: 300 }}>
          <Leaderboard users={leaderboard} meId={user.id} />
        </div>
      </div>

      {/* Right-side leaderboard on desktop */}
      <style>{`
        @media (min-width: 900px) {
          .desk-layout { grid-template-columns: 1fr 320px !important; }
          .desk-leaderboard { position: sticky; top: 10px; height: calc(100vh - 140px); }
        }
      `}</style>

      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onDeleted={() => { localStorage.clear(); sessionStorage.clear(); setUser(null); setShowSettings(false) }}
        />
      )}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  )
}
