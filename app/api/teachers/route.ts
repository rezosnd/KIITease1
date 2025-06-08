import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser } from "@/lib/auth"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check cache first
    const cached = cache.get(CACHE_KEYS.TEACHERS_LIST)
    if (cached) {
      return NextResponse.json({ teachers: cached })
    }

    const db = await getDatabase()

    // Get teachers with aggregated review data
    const teachers = await db
      .collection("teachers")
      .aggregate([
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "teacherId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: "$reviews" }, 0] },
                then: { $avg: "$reviews.rating" },
                else: 0,
              },
            },
            totalReviews: { $size: "$reviews" },
          },
        },
        {
          $project: {
            name: 1,
            department: 1,
            averageRating: 1,
            totalReviews: 1,
            createdAt: 1,
          },
        },
        {
          $sort: { averageRating: -1, totalReviews: -1 },
        },
      ])
      .toArray()

    // Cache for 10 minutes
    cache.set(CACHE_KEYS.TEACHERS_LIST, teachers, 600)

    return NextResponse.json({ teachers })
  } catch (error) {
    console.error("Teachers fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
