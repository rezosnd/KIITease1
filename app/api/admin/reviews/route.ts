import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize admin access
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Aggregate reviews with teacher and user info
    const reviews = await db
      .collection("reviews")
      .aggregate([
        {
          $lookup: {
            from: "teachers",
            localField: "teacherId",
            foreignField: "_id",
            as: "teacher",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$teacher" },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            rating: 1,
            comment: 1,
            subject: 1,
            branch: 1,
            year: 1,
            createdAt: 1,
            "teacher._id": 1,
            "teacher.name": 1,
            "teacher.department": 1,
            "user._id": 1,
            "user.name": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Admin reviews fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
