import { NextResponse } from "next/server"
import { f } from "@/app/api/4over/_util"

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const categoryId = params.categoryId
    const { searchParams } = new URL(request.url)
    const sizeId = searchParams.get("size_uuid")

    if (!sizeId) {
      return NextResponse.json({ error: "size_uuid is required" }, { status: 400 })
    }

    const productsData = await f(`/categories/${categoryId}/products`)

    if (!productsData.entities) {
      return NextResponse.json({ entities: [] })
    }

    // Filter products by size
    const filteredProducts = productsData.entities.filter((product: any) => {
      if (!product.product_description) return false

      const sizeMatch = product.product_description.match(/(\d+\.?\d*\s*x\s*\d+\.?\d*")/)
      if (!sizeMatch) return false

      const sizeLabel = sizeMatch[1].trim()
      const productSizeId = sizeLabel.replace(/\s+/g, "").toLowerCase()

      return productSizeId === sizeId
    })

    return NextResponse.json({ entities: filteredProducts })
  } catch (error) {
    console.error("Error fetching products by size:", error)
    return NextResponse.json({ error: "Failed to fetch products by size" }, { status: 500 })
  }
}
