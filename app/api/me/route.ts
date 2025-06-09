import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, toObjectId } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  // Parse and verify JWT from cookie
  const jwtUser = await getAuthUser(request);
  if (!jwtUser || !jwtUser.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Connect to your MongoDB database
  const db = await getDatabase();

  // Find the user in the database using the userId from JWT
  const user = await db.collection("users").findOne({ _id: toObjectId(jwtUser.userId) }, {
    projection: {
      passwordHash: 0, // Never return password hash
      // ... You can exclude other sensitive fields here
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Optionally, you can rename _id to id for frontend compatibility
  const { _id, ...rest } = user;
  const safeUser = { id: _id.toString(), ...rest };

  return NextResponse.json({ user: safeUser });
}
