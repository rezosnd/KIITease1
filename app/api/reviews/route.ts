import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"
import { reviewSchema } from "@/lib/validation"
import { cache, CACHE_KEYS } from "@/lib/cache"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (any logged-in user can give a review)
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Parse and validate body
    const body = await request.json()
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

    // Prevent duplicate reviews for the same teacher/subject by the same user
    const existingReview = await db.collection("reviews").findOne({
      userId: toObjectId(user.id),
      teacherId: toObjectId(teacherId),
      subject,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this teacher for this subject" }, { status: 400 })
    }

    // Create review document
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

    // Invalidate relevant caches
    cache.delete(CACHE_KEYS.REVIEWS_LIST(teacherId))
    cache.delete(CACHE_KEYS.TEACHERS_LIST)

    // Log this review action
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
