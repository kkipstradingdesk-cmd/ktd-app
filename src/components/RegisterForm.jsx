import { useState } from 'react'
import { usersCol, getDocs, doc, setDoc } from '../firebase.js'

const MAX_USERS = 100
const MASTER_PIN = '0000'

export default function RegisterForm({ onRegistered }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function pickAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result) // dataURL stored in Firestore
    reader.readAsDataURL(file)
  }

  async function join() {
    setError('')
    if (!name.trim()) return setError('Please enter your name.')
    if (!/^[0-9]{4}$/.test(pin)) return setError('PIN must be exactly 4 digits.')
    if (pin !== confirm) return setError('PINs do not match.')
    setBusy(true)
    try {
      // Guardrail 1: user cap of 100
      const snap = await getDocs(usersCol)
      if (snap.size >= MAX_USERS) {
        setBusy(false)
        return setError('Trading desk is full (100 players max). Contact admin.')
      }
      const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
      const userData = {
        name: name.trim(),
        avatar: avatar || '/icons/icon-192.png',
        pin, // game simulator PIN (master override is 0000)
        cashBalance: 50000,
        holdings: [],        // [{symbol, qty, avgPrice}]
        tradeHistory: [],    // [{symbol, side, qty, price, ts}]
        portfolioValue: 50000,
        roi: 0,
        hasTraded: false,
        createdAt: Date.now(),
      }
      await setDoc(doc(usersCol, id), userData)
      localStorage.setItem('ktd_uid', id)
      localStorage.setItem('ktd_session', 'active')
      onRegistered({ id, ...userData })
    } catch (e) {
      setError('Registration failed. Check your internet & Firebase config.')
    }
    setBusy(false)
  }

  const pinInput = (val, setVal, placeholder) => (
    <input
      className="input terminal"
      type={showPin ? 'text' : 'password'}
      inputMode="numeric"
      maxLength={4}
      value={val}
      placeholder={placeholder}
      onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ''))}
      style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8 }}
    />
  )

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src="/icons/icon-192.png" alt="KTD" style={{ width: 80, height: 80, borderRadius: 18, marginBottom: 12 }} />
      <h1 className="terminal" style={{ color: '#ff9d00', fontSize: 22, letterSpacing: 3, margin: 0 }}>KIPS TRADING DESK</h1>
      <p className="terminal" style={{ color: '#666', fontSize: 12, margin: '6px 0 24px' }}>TEAM TRADING SIMULATOR — 100 SEATS</p>

      <div className="panel" style={{ width: '100%', maxWidth: 360, padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <img src={avatar || '/icons/icon-192.png'} alt="" style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #ff9d00', objectFit: 'cover' }} />
          <label className="terminal" style={{ color: '#ff9d00', fontSize: 11, letterSpacing: 1, cursor: 'pointer', border: '1px solid #333', padding: '6px 12px', borderRadius: 4 }}>
            UPLOAD PHOTO
            <input type="file" accept="image/*" onChange={pickAvatar} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="terminal" style={{ color: '#ff9d00', fontSize: 11, letterSpacing: 2 }}>FULL NAME *</label>
            <input className="input terminal" style={{ marginTop: 4 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" maxLength={30} />
          </div>
          <div>
            <label className="terminal" style={{ color: '#ff9d00', fontSize: 11, letterSpacing: 2 }}>SET 4-DIGIT PIN *</label>
            <div style={{ marginTop: 4, position: 'relative' }}>
              {pinInput(pin, setPin, '****')}
              <button type="button" onClick={() => setShowPin(!showPin)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff9d00', fontSize: 11, cursor: 'pointer' }}>{showPin ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          <div>
            <label className="terminal" style={{ color: '#ff9d00', fontSize: 11, letterSpacing: 2 }}>CONFIRM PIN *</label>
            <div style={{ marginTop: 4 }}>{pinInput(confirm, setConfirm, '****')}</div>
          </div>
          {error && <p className="terminal neg" style={{ fontSize: 12, margin: 0 }}>{error}</p>}
          <button className="btn btn-amber terminal" onClick={join} disabled={busy}>
            {busy ? 'JOINING...' : 'JOIN TRADING DESK ($50,000 STARTING CASH)'}
          </button>
          <p className="terminal" style={{ color: '#444', fontSize: 10, textAlign: 'center', margin: 0 }}>
            No email or phone needed. Your PIN secures your desk on this device.
          </p>
        </div>
      </div>
    </div>
  )
}
