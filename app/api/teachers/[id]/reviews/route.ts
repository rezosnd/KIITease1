import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = params.id

    // Check cache first
    const cached = cache.get(CACHE_KEYS.REVIEWS_LIST(teacherId))
    if (cached) {
      return NextResponse.json({ reviews: cached })
    }

    const db = await getDatabase()

    // Get reviews for the teacher with user information
    const reviews = await db
      .collection("reviews")
      .aggregate([
        {
          $match: { teacherId: toObjectId(teacherId) },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            rating: 1,
            comment: 1,
            subject: 1,
            createdAt: 1,
            "user.name": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    // Cache for 5 minutes (300 seconds)
    cache.set(CACHE_KEYS.REVIEWS_LIST(teacherId), reviews, 300)

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Teacher reviews fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
