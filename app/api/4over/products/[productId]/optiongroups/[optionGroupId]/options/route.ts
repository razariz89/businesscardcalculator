import { type NextRequest, NextResponse } from "next/server"
import { f } from "@/app/api/4over/_util"

export async function GET(_req: NextRequest, { params }: { params: { productId: string; optionGroupId: string } }) {
  const data = await f(`/products/${params.productId}/optiongroups/${params.optionGroupId}/options`)
  return NextResponse.json(data)
}
