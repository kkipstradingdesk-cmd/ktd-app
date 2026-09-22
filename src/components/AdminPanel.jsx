import { useState } from 'react'
import { usersCol, getDocs, updateDoc, userDoc } from '../firebase.js'

export default function AdminPanel({ onClose }) {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [status, setStatus] = useState('')

  async function masterReset() {
    if (pin !== '0000') return setStatus('Master PIN incorrect.')
    setStatus('Resetting all 100 players...')
    const snap = await getDocs(usersCol)
    const jobs = snap.docs.map((d) =>
      updateDoc(userDoc(d.id), {
        cashBalance: 50000, holdings: [], tradeHistory: [],
        portfolioValue: 50000, roi: 0, hasTraded: false,
      })
    )
    await Promise.all(jobs)
    setStatus('✔ All players reset to $50,000. Fresh tournament started!')
  }

  async function exportStandings() {
    if (pin !== '0000') return setStatus('Master PIN incorrect.')
    const snap = await getDocs(usersCol)
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    users.sort((a, b) => (b.roi || 0) - (a.roi || 0))
    const lines = users.map((u, i) => {
      const roi = u.hasTraded ? `${u.roi >= 0 ? '+' : ''}${(u.roi || 0).toFixed(2)}%` : 'NO TRADES'
      return `${i + 1}. ${u.name} — ${roi} (Net: $${(u.portfolioValue || 50000).toLocaleString()})`
    })
    const text = `🏆 KIPS TRADING DESK — FINAL STANDINGS 🏆

${lines.join('\n')}

Start: $50,000 | Players: ${users.length}/100`
    await navigator.clipboard.writeText(text)
    setStatus('✔ Standings copied! Paste into WhatsApp.')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="panel" style={{ width: '100%', maxWidth: 360, padding: 20 }}>
        <div className="terminal" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="amber" style={{ letterSpacing: 2, fontSize: 12 }}>ADMIN CONSOLE</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <input className="input terminal" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="MASTER PIN" style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <button className="btn btn-sell terminal" onClick={masterReset} disabled={pin.length !== 4}>🔴 MASTER RESET (ALL → $50,000)</button>
          <button className="btn btn-amber terminal" onClick={exportStandings} disabled={pin.length !== 4}>📋 COPY STANDINGS FOR WHATSAPP</button>
        </div>
        {status && <p className="terminal" style={{ fontSize: 12, marginTop: 12, color: status.startsWith('✔') ? '#00ff00' : '#ff0055' }}>{status}</p>}
      </div>
    </div>
  )
}
