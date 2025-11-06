import { NextResponse } from "next/server"
import { f } from "@/app/api/4over/_util"

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params
    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 })
    }

    const productData = await f(`/products/${productId}`)
    return NextResponse.json(productData)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch product" }, { status: 500 })
  }
}
