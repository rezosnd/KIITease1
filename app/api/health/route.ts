import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Check database connection
    const db = await getDatabase()
    await db.admin().ping()

    // Check environment variables
    const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "GMAIL_USER", "GMAIL_APP_PASSWORD"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      database: "connected",
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed",
      },
      { status: 503 },
    )
  }
}
