import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Use MongoDB aggregation for better performance with indexing
    const notes = await db
      .collection("notes")
      .aggregate([
        {
          $match: {
            branch: user.branch,
            year: user.year,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: 100, // Limit for performance with large datasets
        },
      ])
      .toArray()

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Notes fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
