import { NextResponse } from "next/server"

const API_KEY = "bizcard"
const SIGNATURE = "af92844b53ea4b1968a19b72865eb8fb1a2dd5db4618b63a32c1130c0316532b"

export async function GET() {
  try {
    const url = `https://api.4over.com/printproducts/categories?apikey=${API_KEY}&signature=${SIGNATURE}`

    const response = await fetch(url, {
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
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
