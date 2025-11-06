import { NextResponse } from "next/server"

const API_KEY = "bizcard"
const SIGNATURE = "af92844b53ea4b1968a19b72865eb8fb1a2dd5db4618b63a32c1130c0316532b"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const categoryId = params.categoryId
    const allProducts: any[] = []
    let offset = 0
    const limit = 20
    let hasMore = true

    while (hasMore) {
      const url = `https://api.4over.com/printproducts/categories/${categoryId}/products?apikey=${API_KEY}&signature=${SIGNATURE}&offset=${offset}&limit=${limit}`

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        console.error(`[v0] Non-JSON response at offset ${offset}: ${response.status}`)
        hasMore = false
        break
      }

      if (!response.ok) {
        console.error(`[v0] API error at offset ${offset}: ${response.status}`)
        hasMore = false
        break
      }

      const data = await response.json()

      if (data.entities && data.entities.length > 0) {
        allProducts.push(...data.entities)
        if (data.entities.length < limit) {
          hasMore = false
        } else {
          offset += limit
          await delay(1000)
        }
      } else {
        hasMore = false
      }
    }

    console.log(`[v0] Fetched ${allProducts.length} total products`)
    return NextResponse.json({ entities: allProducts })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
