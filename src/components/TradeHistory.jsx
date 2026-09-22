export default function TradeHistory({ history }) {
  return (
    <div className="panel">
      <div className="panel-title">Trade History</div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {history.length === 0 && <p className="terminal" style={{ color: '#555', fontSize: 12, padding: 12, margin: 0 }}>No trades yet.</p>}
        {history.map((t, i) => (
          <div key={i} className="terminal" style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid #111', fontSize: 12 }}>
            <span style={{ color: t.side === 'BUY' ? '#00ff00' : '#ff0055', fontWeight: 'bold' }}>{t.side}</span>
            <span style={{ color: '#ff9d00' }}>{t.symbol} ×{t.qty}</span>
            <span style={{ color: '#aaa' }}>@ ${t.price.toFixed(2)}</span>
            <span style={{ color: '#555' }}>{new Date(t.ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
