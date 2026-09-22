import { isMarketOpen, marketStatusText } from '../lib/market.js'

export default function MarketStatus() {
  const open = isMarketOpen()
  return (
    <span
      className="terminal"
      style={{
        fontSize: 10,
        letterSpacing: 1,
        padding: '3px 8px',
        borderRadius: 3,
        background: open ? '#003300' : '#330011',
        color: open ? '#00ff00' : '#ff0055',
        border: '1px solid ' + (open ? '#00ff00' : '#ff0055'),
      }}
    >
      <span className="blink">●</span> {marketStatusText()}
    </span>
  )
}
