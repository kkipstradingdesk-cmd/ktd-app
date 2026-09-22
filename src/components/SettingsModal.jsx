import { useState } from 'react'
import { userDoc, deleteDoc } from '../firebase.js'

export default function SettingsModal({ user, onClose, onDeleted }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  async function deleteAccount() {
    if (pin === '0000' || pin === user.pin) {
      await deleteDoc(userDoc(user.id))
      localStorage.removeItem('ktd_uid')
      localStorage.removeItem('ktd_session')
      sessionStorage.clear()
      onDeleted()
    } else {
      setError('Incorrect PIN.')
      setPin('')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="panel" style={{ width: '100%', maxWidth: 360, padding: 20 }}>
        <div className="terminal" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="amber" style={{ letterSpacing: 2, fontSize: 12 }}>SECURITY & SETTINGS</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div className="terminal" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <img src={user.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #ff9d00', objectFit: 'cover' }} />
          <div>
            <div style={{ color: '#eee', fontWeight: 'bold' }}>{user.name}</div>
            <div style={{ color: '#00ff00', fontSize: 12 }}>Cash: ${user.cashBalance.toLocaleString()}</div>
          </div>
        </div>
        {!confirming ? (
          <button className="btn terminal" style={{ background: '#330011', color: '#ff0055', border: '1px solid #ff0055' }} onClick={() => setConfirming(true)}>
            DELETE ACCOUNT & DATA
          </button>
        ) : (
          <div>
            <p className="terminal" style={{ color: '#ff0055', fontSize: 12 }}>⚠ This wipes your portfolio, cash and leaderboard entry permanently. Enter your PIN (or master 0000) to confirm:</p>
            <input className="input terminal" type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="****" style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20, marginTop: 8 }} />
            {error && <p className="terminal neg" style={{ fontSize: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-sell terminal" onClick={deleteAccount} disabled={pin.length !== 4}>CONFIRM DELETE</button>
              <button className="btn terminal" style={{ background: '#222', color: '#aaa' }} onClick={() => { setConfirming(false); setPin('') }}>CANCEL</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
