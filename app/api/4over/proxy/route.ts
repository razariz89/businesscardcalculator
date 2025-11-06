import { NextResponse } from "next/server"

const API_KEY = "bizcard"
const SIGNATURE = "af92844b53ea4b1968a19b72865eb8fb1a2dd5db4618b63a32c1130c0316532b"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get("url")

    if (!targetUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Add API credentials to the URL
    const url = new URL(targetUrl)
    url.searchParams.set("apikey", API_KEY)
    url.searchParams.set("signature", SIGNATURE)

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying request:", error)
    return NextResponse.json({ error: "Failed to proxy request" }, { status: 500 })
  }
}
