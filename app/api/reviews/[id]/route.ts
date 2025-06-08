import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, rating, comment } = body

    if (!subject || !rating || rating < 2 || rating > 5) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    const db = await getDatabase()

    // Update review (only if it belongs to the user)
    const result = await db.collection("reviews").updateOne(
      {
        _id: toObjectId(params.id),
        userId: toObjectId(user.id),
      },
      {
        $set: {
          subject,
          rating: Number(rating),
          comment: comment || "",
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Review not found or unauthorized" }, { status: 404 })
    }

    // Clear caches
    cache.delete(CACHE_KEYS.TEACHERS_LIST)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Delete review (only if it belongs to the user)
    const result = await db.collection("reviews").deleteOne({
      _id: toObjectId(params.id),
      userId: toObjectId(user.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Review not found or unauthorized" }, { status: 404 })
    }

    // Clear caches
    cache.delete(CACHE_KEYS.TEACHERS_LIST)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
