import { useState } from 'react'
import { userDoc, getDoc } from '../firebase.js'

export default function LockScreen({ user, onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  async function tryUnlock() {
    if (pin === '0000') { onUnlock(); return } // master override
    const snap = await getDoc(userDoc(user.id))
    const data = snap.data()
    if (data && data.pin === pin) {
      onUnlock()
    } else {
      setError('Incorrect PIN. Try again.')
      setPin('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <img src="/icons/icon-192.png" alt="KTD" style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 16 }} />
      <h1 className="terminal" style={{ color: '#ff9d00', fontSize: 20, letterSpacing: 3, margin: '0 0 4px' }}>KIPS TRADING DESK</h1>
      <p className="terminal" style={{ color: '#666', fontSize: 12, marginBottom: 24 }}>SECURE ACCESS — {user.name.toUpperCase()}</p>

      <div className="panel" style={{ width: '100%', maxWidth: 340, padding: 20 }}>
        <label className="terminal" style={{ color: '#ff9d00', fontSize: 11, letterSpacing: 2 }}>ENTER 4-DIGIT PIN</label>
        <div style={{ position: 'relative', marginTop: 8 }}>
          <input
            className="input terminal"
            type={show ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            style={{ textAlign: 'center', fontSize: 24, letterSpacing: 10 }}
            placeholder="****"
          />
          <button
            onClick={() => setShow(!show)}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff9d00', cursor: 'pointer', fontSize: 12 }}
          >
            {show ? 'HIDE' : 'SHOW'}
          </button>
        </div>
        {error && <p className="terminal neg" style={{ fontSize: 12, marginTop: 8 }}>{error}</p>}
        <button className="btn btn-amber terminal" style={{ marginTop: 16 }} onClick={tryUnlock} disabled={pin.length !== 4}>
          UNLOCK DESK
        </button>
      </div>
    </div>
  )
}
