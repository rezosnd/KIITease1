import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Aggregate user's reviews with teacher information
    const reviews = await db
      .collection("reviews")
      .aggregate([
        {
          $match: { userId: toObjectId(user.id) },
        },
        {
          $lookup: {
            from: "teachers",
            localField: "teacherId",
            foreignField: "_id",
            as: "teacher",
          },
        },
        {
          $unwind: "$teacher",
        },
        {
          $project: {
            subject: 1,
            rating: 1,
            comment: 1,
            createdAt: 1,
            "teacher._id": 1,
            "teacher.name": 1,
            "teacher.department": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("My reviews fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
