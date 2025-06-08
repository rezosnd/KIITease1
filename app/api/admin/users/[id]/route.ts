import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getAuthUser, toObjectId } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user and check admin privileges
    const user = await getAuthUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse new role from request body
    const { role } = await request.json()
    if (!["free", "paid", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const db = await getDatabase()

    // Update the user's role
    const result = await db.collection("users").updateOne(
      { _id: toObjectId(params.id) },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log the role change in the audit log
    await db.collection("audit_logs").insertOne({
      userId: toObjectId(user.id),
      action: "user_role_updated",
      details: {
        targetUserId: toObjectId(params.id),
        newRole: role,
        updatedBy: user.name || user.email || user.id,
      },
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("User role update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
