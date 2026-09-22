export default function Leaderboard({ users, meId }) {
  // ROI = (current value of invested stocks vs cost basis). Users with no
  // active investments are sorted to the bottom until their first trade.
  const sorted = [...users].sort((a, b) => {
    if (!!a.hasTraded !== !!b.hasTraded) return a.hasTraded ? -1 : 1
    if (!a.hasTraded && !b.hasTraded) return (b.portfolioValue || 0) - (a.portfolioValue || 0)
    return (b.roi || 0) - (a.roi || 0)
  })

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">Leaderboard — ROI Rankings</div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.map((u, i) => (
          <div key={u.id} className={'terminal' + (u.id === meId ? ' me-row' : '')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderBottom: '1px solid #111' }}>
            <span style={{ color: i < 3 ? '#ff9d00' : '#555', width: 24, fontWeight: 'bold' }}>{i + 1}</span>
            <img src={u.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ flex: 1, color: '#ddd', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
            {!u.hasTraded ? (
              <span style={{ color: '#555', fontSize: 11 }}>NO TRADES</span>
            ) : (
              <span className={u.roi >= 0 ? 'pos' : 'neg'} style={{ fontWeight: 'bold' }}>
                {u.roi >= 0 ? '+' : ''}{u.roi.toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
