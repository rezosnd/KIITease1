import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { checkDatabaseHealth } from "@/lib/database-health"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const health = await checkDatabaseHealth()

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database health check failed:", error)
    return NextResponse.json({ error: "Failed to check database health" }, { status: 500 })
  }
}
