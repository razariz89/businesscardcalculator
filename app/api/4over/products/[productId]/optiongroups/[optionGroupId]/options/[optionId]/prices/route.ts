import { type NextRequest, NextResponse } from "next/server"
import { f } from "@/app/api/4over/_util"

export async function GET(
  _req: NextRequest,
  { params }: { params: { productId: string; optionGroupId: string; optionId: string } },
) {
  const { productId, optionGroupId, optionId } = params
  const data = await f(`/products/${productId}/optiongroups/${optionGroupId}/options/${optionId}/prices`)
  return NextResponse.json(data)
}
