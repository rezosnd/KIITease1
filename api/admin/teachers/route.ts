import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, department } = await req.json();
    if (
      typeof name !== "string" ||
      typeof department !== "string" ||
      !name.trim() ||
      !department.trim()
    ) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const db = await getDatabase();

    // Optional: prevent duplicate teachers
    const exists = await db.collection("teachers").findOne({
      name: name.trim(),
      department: department.trim(),
    });
    if (exists) {
      return NextResponse.json({ error: "Teacher already exists" }, { status: 409 });
    }

    const result = await db.collection("teachers").insertOne({
      name: name.trim(),
      department: department.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, teacherId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
