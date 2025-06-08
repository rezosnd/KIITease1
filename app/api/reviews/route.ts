import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"
import { reviewSchema } from "@/lib/validation"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role === "free") {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = reviewSchema.safeParse({
      teacherId: body.teacherId,
      subject: body.subject,
      rating: Number(body.rating),
      comment: body.comment,
    })

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    const { teacherId, subject, rating, comment } = validationResult.data

    const db = await getDatabase()

    // Check if user already reviewed this teacher for this subject
    const existingReview = await db.collection("reviews").findOne({
      userId: toObjectId(user.id),
      teacherId: toObjectId(teacherId),
      subject,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this teacher for this subject" }, { status: 400 })
    }

    // Create review
    const review = {
      userId: toObjectId(user.id),
      teacherId: toObjectId(teacherId),
      subject,
      rating,
      comment: comment || "",
      branch: user.branch,
      year: user.year,
      createdAt: new Date(),
    }

    const result = await db.collection("reviews").insertOne(review)

    // Clear relevant caches
    cache.delete(CACHE_KEYS.REVIEWS_LIST(teacherId))
    cache.delete(CACHE_KEYS.TEACHERS_LIST)

    // Log the review submission
    await db.collection("audit_logs").insertOne({
      userId: toObjectId(user.id),
      action: "review_submitted",
      details: {
        teacherId,
        subject,
        rating,
      },
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, reviewId: result.insertedId })
  } catch (error) {
    console.error("Review submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
