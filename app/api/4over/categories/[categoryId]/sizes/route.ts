import { NextResponse } from "next/server"
import { f } from "@/app/api/4over/_util"

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const categoryId = params.categoryId
    const productsData = await f(`/categories/${categoryId}/products`)

    if (!productsData.entities) {
      return NextResponse.json({ entities: [] })
    }

    // Extract unique sizes from products
    const sizesMap = new Map<string, { id: string; label: string; value: string }>()

    productsData.entities.forEach((product: any) => {
      if (product.product_description) {
        // Extract size from product description (e.g., "Business Cards 3.5x2" -> "3.5x2")
        const sizeMatch = product.product_description.match(/(\d+\.?\d*\s*x\s*\d+\.?\d*")/)
        if (sizeMatch) {
          const sizeLabel = sizeMatch[1].trim()
          const sizeId = sizeLabel.replace(/\s+/g, "").toLowerCase()

          if (!sizesMap.has(sizeId)) {
            sizesMap.set(sizeId, {
              id: sizeId,
              label: sizeLabel,
              value: sizeLabel,
            })
          }
        }
      }
    })

    const sizes = Array.from(sizesMap.values())
    return NextResponse.json({ entities: sizes })
  } catch (error) {
    console.error("Error fetching sizes:", error)
    return NextResponse.json({ error: "Failed to fetch sizes" }, { status: 500 })
  }
}
