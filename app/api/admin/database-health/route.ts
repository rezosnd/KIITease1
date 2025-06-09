export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

// Real database health check: checks connectivity and a simple command
async function checkDatabaseHealth() {
  try {
    const db = await getDatabase();
    // Example: use the "ping" command for MongoDB
    const admin = db.admin ? db.admin() : db; // for native or mongoose
    const result = await admin.command({ ping: 1 });
    return {
      ok: result.ok === 1,
      message: "Database is reachable",
      ...(result.ok === 1 ? {} : { result }),
    };
  } catch (err) {
    return {
      ok: false,
      message: "Database is NOT reachable",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const health = await checkDatabaseHealth();

    return NextResponse.json({
      success: health.ok,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json({ error: "Failed to check database health" }, { status: 500 });
  }
}
