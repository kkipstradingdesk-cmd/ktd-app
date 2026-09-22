export default function Portfolio({ user, prices }) {
  const invested = user.holdings.reduce((s, h) => s + h.qty * h.avgPrice, 0)
  const current = user.holdings.reduce((s, h) => s + h.qty * (prices[h.symbol] || h.avgPrice), 0)
  const unrealized = current - invested
  const totalValue = user.cashBalance + current

  return (
    <div className="panel">
      <div className="panel-title">My Portfolio</div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="terminal" style={{ color: '#888', fontSize: 11 }}>NET WORTH</span>
          <span className="terminal" style={{ color: '#fff', fontWeight: 'bold' }}>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="terminal" style={{ color: '#888', fontSize: 11 }}>CASH</span>
          <span className="terminal pos">${user.cashBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="terminal" style={{ color: '#888', fontSize: 11 }}>INVESTED</span>
          <span className="terminal" style={{ color: '#ddd' }}>${current.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="terminal" style={{ color: '#888', fontSize: 11 }}>P/L</span>
          <span className={'terminal ' + (unrealized >= 0 ? 'pos' : 'neg')}>
            {unrealized >= 0 ? '+' : ''}${unrealized.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      {user.holdings.length > 0 && (
        <div style={{ borderTop: '1px solid #222' }}>
          {user.holdings.map((h) => {
            const px = prices[h.symbol] || h.avgPrice
            const pl = (px - h.avgPrice) * h.qty
            return (
              <div key={h.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #111' }} className="terminal">
                <span style={{ color: '#ff9d00', fontWeight: 'bold' }}>{h.symbol} <span style={{ color: '#666', fontWeight: 'normal', fontSize: 11 }}>×{h.qty}</span></span>
                <span style={{ color: '#aaa' }}>${px.toFixed(2)}</span>
                <span className={pl >= 0 ? 'pos' : 'neg'}>{pl >= 0 ? '+' : ''}${pl.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
