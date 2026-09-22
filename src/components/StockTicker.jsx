import { useEffect, useRef, useState } from 'react'
import { getPrices, jitterPrice } from '../lib/market.js'

const SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'INTC', 'BA', 'JPM']

export default function StockTicker() {
  const [quotes, setQuotes] = useState({})
  const timer = useRef(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const prices = await getPrices(SYMBOLS)
        if (!alive) return
        if (Object.keys(prices).length) {
          setQuotes(prices)
        } else {
          // Fallback demo prices if Alpaca keys not set yet
          const demo = {}
          SYMBOLS.forEach((s) => (demo[s] = 100 + Math.random() * 400))
          setQuotes(demo)
        }
      } catch {
        const demo = {}
        SYMBOLS.forEach((s) => (demo[s] = 100 + Math.random() * 400))
        if (alive) setQuotes(demo)
      }
    }
    load()
    timer.current = setInterval(() => {
      // Simulate live ticks every 3 seconds
      setQuotes((q) => {
        const next = {}
        for (const s of Object.keys(q)) next[s] = q[s]
        // pick a few random symbols to tick
        for (let i = 0; i < 4; i++) {
          const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          if (next[s]) next[s] = Math.max(0.01, next[s] + (Math.random() - 0.5) * 0.004 * next[s])
        }
        return next
      })
    }, 3000)
    const refresh = setInterval(load, 30_000)
    return () => { alive = false; clearInterval(timer.current); clearInterval(refresh) }
  }, [])

  const items = [...SYMBOLS, ...SYMBOLS]
  return (
    <div className="ticker-bar" style={{ '--speed': '70s', borderBottom: '2px solid #ff9d00' }}>
      <div className="ticker-track">
        {items.map((s, i) => {
          const price = quotes[s]
          const j = price ? jitterPrice(price) : null
          return (
            <span key={i} className={'stock-tick ' + (j && j.up ? 'up' : 'down')}>
              {s} ${price ? price.toFixed(2) : '---'}{' '}
              {j && (
                <>
                  {j.up ? '▲' : '▼'} {j.up ? '+' : ''}${Math.abs(j.chg).toFixed(2)} ({j.up ? '+' : ''}
                  {j.pct.toFixed(2)}%)
                </>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
