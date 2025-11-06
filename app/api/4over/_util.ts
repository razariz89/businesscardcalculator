const API_BASE = "https://api.4over.com/printproducts"
const API_KEY = process.env.FOUROVER_API_KEY || "bizcard"
const API_SIG = process.env.FOUROVER_SIGNATURE || "af92844b53ea4b1968a19b72865eb8fb1a2dd5db4618b63a32c1130c0316532b"

export function q(url: string) {
  const u = new URL(url, API_BASE)
  u.searchParams.set("apikey", API_KEY)
  u.searchParams.set("signature", API_SIG)
  return u.toString()
}

export async function f(url: string, init?: RequestInit) {
  const res = await fetch(q(url), { ...init, cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`4over error ${res.status}: ${text}`)
  }
  return res.json()
}

// Find price entity matching a runsize by exact or in-range (startqty..endqty)
export function pickPriceEntity(entities: Array<{ startqty: number; endqty: number }>, runsize: number) {
  const exact = entities.find((e: any) => Number(e.startqty) === runsize && Number(e.endqty) === runsize)
  if (exact) return exact as any
  const inRange = entities.find((e: any) => Number(e.startqty) <= runsize && runsize <= Number(e.endqty))
  return (inRange || entities[0]) as any
}

// Compute option price using doc rules
export function computeOptionPrice(
  ent: {
    price: string
    price_per_qty: string | number | null
    is_flat_fee: boolean
    is_percentage: boolean
    qty?: number | null
  },
  basePrice: number,
  runsize: number,
) {
  const price = Number(ent.price || 0)
  const perQty = Number(ent.price_per_qty || 0)
  if (ent.is_percentage) {
    // If API returns 5 for 5% convert, if 0.05 keep as-is
    const pctRaw = price
    const pct = pctRaw > 1 ? pctRaw / 100 : pctRaw
    return basePrice * pct
  }
  const unit = ent.qty && ent.qty > 0 ? ent.qty : 1
  const extra = perQty > 0 ? (runsize / unit) * perQty : 0
  // Flat fee applies once; extra accounts for per-qty
  return price + extra
}
