import { useState } from 'react'
import { searchStocks, getPrices, isMarketOpen } from '../lib/market.js'
import { userDoc, updateDoc } from '../firebase.js'

export default function TradePanel({ user, onUpdate }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [price, setPrice] = useState(null)
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function doSearch(e) {
    const v = e.target.value
    setTerm(v)
    if (v.trim().length < 1) { setResults([]); return }
    try {
      setResults(await searchStocks(v))
    } catch { setResults([]) }
  }

  async function pickStock(r) {
    setSelected(r)
    setMsg(null)
    try {
      const p = await getPrices([r.symbol])
      setPrice(p[r.symbol] || null)
    } catch { setPrice(null) }
  }

  async function execute(side) {
    if (!selected || !price) return
    setMsg(null)
    const q = Math.floor(Number(qty))
    // Guardrail 2: strict long-only validation
    if (!Number.isInteger(q) || q < 1) return setMsg({ ok: false, text: 'Whole shares only (min 1).' })
    const holding = user.holdings.find((h) => h.symbol === selected.symbol)
    if (side === 'BUY') {
      const cost = q * price
      if (cost > user.cashBalance) return setMsg({ ok: false, text: 'Insufficient cash. Long-only, no margin.' })
      const newQty = (holding?.qty || 0) + q
      const newAvg = ((holding?.qty || 0) * (holding?.avgPrice || 0) + cost) / newQty
      var newHoldings = [
        ...user.holdings.filter((h) => h.symbol !== selected.symbol),
        { symbol: selected.symbol, qty: newQty, avgPrice: newAvg },
      ]
      var newCash = user.cashBalance - cost
    } else {
      if (!holding || holding.qty < q) return setMsg({ ok: false, text: 'You do not own enough shares. No short selling.' })
      const proceeds = q * price
      var newHoldings = holding.qty === q
        ? user.holdings.filter((h) => h.symbol !== selected.symbol)
        : user.holdings.map((h) => h.symbol === selected.symbol ? { ...h, qty: h.qty - q } : h)
      var newCash = user.cashBalance + proceeds
    }
    setBusy(true)
    try {
      const trade = { symbol: selected.symbol, side, qty: q, price, ts: Date.now() }
      const updates = {
        cashBalance: newCash,
        holdings: newHoldings,
        tradeHistory: [trade, ...user.tradeHistory].slice(0, 200),
        hasTraded: true,
      }
      await updateDoc(userDoc(user.id), updates)
      onUpdate({ ...user, ...updates })
      setMsg({ ok: true, text: `${side === 'BUY' ? 'Bought' : 'Sold'} ${q} ${selected.symbol} @ $${price.toFixed(2)}` })
    } catch {
      setMsg({ ok: false, text: 'Trade failed. Try again.' })
    }
    setBusy(false)
  }

  const closedNote = !isMarketOpen() ? (
    <p className="terminal" style={{ color: '#ff9d00', fontSize: 11, margin: '6px 0 0' }}>⚠ Market closed — simulator still executes at last price.</p>
  ) : null

  return (
    <div className="panel">
      <div className="panel-title">Trade — NYSE / NASDAQ / Cboe BZX</div>
      <div style={{ padding: 10 }}>
        <input className="input terminal" placeholder="Search symbol or company… (e.g. AAPL)" value={term} onChange={doSearch} />
        {results.length > 0 && !selected && (
          <div style={{ marginTop: 6, border: '1px solid #222', borderRadius: 4, maxHeight: 180, overflowY: 'auto' }}>
            {results.map((r) => (
              <div key={r.symbol} onClick={() => pickStock(r)} style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #111' }} className="terminal">
                <span style={{ color: '#ff9d00', fontWeight: 'bold' }}>{r.symbol}</span>{' '}
                <span style={{ color: '#999', fontSize: 11 }}>{r.name} · {r.exchange}</span>
              </div>
            ))}
          </div>
        )}
        {selected && (
          <div style={{ marginTop: 10, padding: 10, background: '#111', borderRadius: 4 }}>
            <div className="terminal" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ff9d00', fontWeight: 'bold' }}>{selected.symbol}</span>
              <span className="pos" style={{ fontWeight: 'bold' }}>{price ? '$' + price.toFixed(2) : 'loading…'}</span>
            </div>
            <p className="terminal" style={{ color: '#777', fontSize: 11, margin: '4px 0 8px' }}>{selected.name}</p>
            <input className="input terminal" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-buy terminal" disabled={busy || !price} onClick={() => execute('BUY')}>BUY</button>
              <button className="btn btn-sell terminal" disabled={busy || !price} onClick={() => execute('SELL')}>SELL</button>
            </div>
            {closedNote}
            <button className="terminal" onClick={() => { setSelected(null); setPrice(null); setTerm(''); setResults([]) }} style={{ background: 'none', border: 'none', color: '#666', fontSize: 11, marginTop: 8, cursor: 'pointer' }}>← back to search</button>
          </div>
        )}
        {msg && <p className="terminal" style={{ fontSize: 12, marginTop: 8, color: msg.ok ? '#00ff00' : '#ff0055' }}>{msg.text}</p>}
      </div>
    </div>
  )
}
