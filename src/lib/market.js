// ============================================================
// Alpaca market data helper with 10-second caching
// Paste your Alpaca API keys below (see guide, Step 7)
// ============================================================
const ALPACA_KEY = 'PK3E2Y7LGNW2GU3V6UXZENRR4M'
const ALPACA_SECRET = 'C7JwTspdfM19YXkDedZeexAdYnZqqBraAn9vvR5zoVD1'

const DATA_BASE = 'https://data.alpaca.markets/v2'
const TRADE_BASE = 'https://paper-api.alpaca.markets/v2'

const headers = {
  'APCA-API-KEY-ID': ALPACA_KEY,
  'APCA-API-SECRET-KEY': ALPACA_SECRET,
}

const cache = new Map() // key -> { time, data }
const CACHE_MS = 10_000 // 10-second rate-limit cache

async function cachedFetch(url, key) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.time < CACHE_MS) return hit.data
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Alpaca request failed: ' + res.status)
  const data = await res.json()
  cache.set(key, { time: Date.now(), data })
  return data
}

// Search US equities by symbol or company name
export async function searchStocks(term) {
  if (!term || term.trim().length < 1) return [];
  term = term.trim().toUpperCase();

  // 1. First try fetching exact ticker match directly from Alpaca assets
  try {
    const exactUrl = `${TRADE_BASE}/assets/${term}`;
    const exactAsset = await cachedFetch(exactUrl, 'asset:' + term);
    if (exactAsset && exactAsset.symbol && exactAsset.tradable) {
      return [{
        symbol: exactAsset.symbol,
        name: exactAsset.name,
        exchange: exactAsset.exchange
      }];
    }
  } catch (e) {
    // Exact match failed or asset doesn't exist, proceed to broader search
  }

  // 2. Fallback: Fetch active US equities and filter by partial symbol or name match
  try {
    const listUrl = `${TRADE_BASE}/assets?status=active&asset_class=us_equity`;
    // Cache this list appropriately (e.g., 24 hours) since the full asset list rarely changes intraday
    const assets = await cachedFetch(listUrl, 'active_us_equities', 86400); 
    
    if (Array.isArray(assets)) {
      const matches = assets.filter(asset => 
        asset.tradable && (
          asset.symbol.includes(term) || 
          (asset.name && asset.name.toUpperCase().includes(term))
        )
      );

      // Map and slice to limit results (e.g., top 10 matches) for performance UI rendering
      return matches.slice(0, 10).map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        exchange: asset.exchange
      }));
    }
  } catch (err) {
    console.error('Error during broader stock search fallback:', err);
  }

  return [];
}

// Latest trade prices for a list of symbols (batch)
export async function getPrices(symbols) {
  if (!symbols.length) return {}
  const syms = symbols.join(',')
  const url = `${DATA_BASE}/stocks/trades/latest?symbols=${syms}&feed=iex`
  const data = await cachedFetch(url, 'prices:' + syms)
  const out = {}
  for (const s of symbols) {
    const t = data.trades?.[s]
    if (t) out[s] = t.p
  }
  return out
}

// ---------- US market hours (9:30 - 16:00 ET, Mon-Fri) ----------
export function isMarketOpen() {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay() // 0 Sun, 6 Sat
  if (day === 0 || day === 6) return false
  const mins = et.getHours() * 60 + et.getMinutes()
  return mins >= 570 && mins < 960
}

export function marketStatusText() {
  if (isMarketOpen()) return 'MARKET OPEN'
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay()
  if (day === 0 || day === 6 || et.getHours() * 60 + et.getMinutes() >= 960)
    return 'MARKET CLOSED'
  return 'MARKET CLOSED'
}

// ---------- Mock price movement for the live ticker ----------
export function jitterPrice(p) {
  const change = (Math.random() - 0.5) * 0.004 * p
  const price = Math.max(0.01, p + change)
  const prevClose = p
  const chg = price - prevClose
  const pct = (chg / prevClose) * 100
  return { price, chg, pct, up: chg >= 0 }
}
