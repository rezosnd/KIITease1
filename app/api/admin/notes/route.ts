import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    const notes = await db
      .collection("notes")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "uploadedBy",
            foreignField: "_id",
            as: "uploadedBy",
          },
        },
        {
          $unwind: {
            path: "$uploadedBy",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            title: 1,
            subject: 1,
            branch: 1,
            year: 1,
            fileName: 1,
            fileUrl: 1,
            createdAt: 1,
            "uploadedBy.name": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Admin notes fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
