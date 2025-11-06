import { type NextRequest, NextResponse } from "next/server"
import { f } from "@/app/api/4over/_util"

export async function GET(_req: NextRequest, { params }: { params: { productId: string } }) {
  const data = await f(`/products/${params.productId}/baseprices`)
  return NextResponse.json(data)
}
