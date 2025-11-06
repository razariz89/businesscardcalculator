import { NextResponse } from "next/server"

type Body = {
  productId: string
  colorspecId: string
  runsizeId: string
  turnaroundId: string
  selectedOptions: string[] // Array of option UUIDs
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const { productId, colorspecId, runsizeId, turnaroundId, selectedOptions } = body

    if (!productId || !colorspecId || !runsizeId || !turnaroundId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // This endpoint returns the complete calculated price including base price, options, and turnaround
    const url = new URL("/printproducts/productquote", "https://api.4over.com")
    url.searchParams.set("product_uuid", productId)
    url.searchParams.set("colorspec_uuid", colorspecId)
    url.searchParams.set("runsize_uuid", runsizeId)
    url.searchParams.set("turnaroundtime_uuid", turnaroundId)

    // Add all selected options to the query
    selectedOptions.forEach((optionId) => {
      url.searchParams.append("options[]", optionId)
    })

    // Add API credentials
    url.searchParams.set("apikey", process.env.FOUROVER_API_KEY || "bizcard")
    url.searchParams.set(
      "signature",
      process.env.FOUROVER_SIGNATURE || "af92844b53ea4b1968a19b72865eb8fb1a2dd5db4618b63a32c1130c0316532b",
    )

    console.log("[v0] Calling 4over Product Quote API:", url.toString())

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) {
      const text = await res.text()
      console.error("[v0] 4over API error:", res.status, text)
      throw new Error(`4over error ${res.status}: ${text}`)
    }

    const data = await res.json()
    console.log("[v0] Quote response:", data)

    // Extract prices from the response
    const basePrice = Number(data.base_price || 0)
    const optionsTotal = Number(data.options_price || 0)
    const turnaroundPrice = Number(data.turnaround_price || 0)
    const total = Number(data.total_price || 0)

    return NextResponse.json({
      basePrice,
      optionsTotal,
      turnaroundPrice,
      total,
      raw: data,
    })
  } catch (err: any) {
    console.error("[v0] Quote error:", err)
    return NextResponse.json({ error: err?.message || "Quote error" }, { status: 500 })
  }
}
