import { useState } from 'react'

const HEADLINES = [
  'NASDAQ hits new high as tech stocks surge',
  'Fed signals potential rate adjustments ahead of next meeting',
  'NVDA announces next-gen AI chip architecture',
  'AAPL unveils record iPhone pre-order numbers',
  'TSLA deliveries beat analyst estimates for the quarter',
  'MSFT cloud revenue climbs on AI demand',
  'Cboe BZX volume hits weekly record',
  'AMZN announces fresh logistics expansion across US',
  'META ad revenue rebounds strongly',
  'AMD gains ground in server chip market',
  'NFLX subscriber growth tops forecasts',
  'GOOGL faces new regulatory scrutiny in EU',
]

export default function NewsTicker() {
  const [paused, setPaused] = useState(false)
  const items = [...HEADLINES, ...HEADLINES] // double for seamless loop
  return (
    <div
      className="ticker-bar"
      style={{ '--speed': '90s' }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="ticker-track" style={paused ? { animationPlayState: 'paused' } : {}}>
        {items.map((h, i) => (
          <span key={i} className="news-item">
            <b>KTD</b> &bull; {h}
          </span>
        ))}
      </div>
    </div>
  )
}
