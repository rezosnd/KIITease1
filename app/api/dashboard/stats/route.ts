import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  // Authenticate user
  const user = await getAuthUser(request);
  if (!user || !user.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = await getDatabase();

  // Convert userId string to ObjectId (if necessary)
  let userObjectId: ObjectId;
  try {
    userObjectId = typeof user.userId === "string" ? new ObjectId(user.userId) : user.userId;
  } catch {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  // Get user document
  const dbUser = await db.collection("users").findOne({ _id: userObjectId });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Downloads: count downloads for this user
  let downloads = 0;
  try {
    downloads = await db.collection("downloads").countDocuments({ userId: userObjectId });
  } catch {
    downloads = 0;
  }

  // Reviews written by user
  let reviews = 0;
  try {
    reviews = await db.collection("reviews").countDocuments({ userId: userObjectId });
  } catch {
    reviews = 0;
  }

  // Referrals: users registered with this user's referralCode
  const referralCode = dbUser.referralCode ?? "";
  let referrals = 0;
  try {
    referrals = await db.collection("users").countDocuments({ referredBy: referralCode });
  } catch {
    referrals = 0;
  }

  // Paid Referrals: users referred by this code, who are paid
  let paidReferrals = 0;
  try {
    paidReferrals = await db.collection("users").countDocuments({
      referredBy: referralCode,
      role: "paid"
    });
  } catch {
    paidReferrals = 0;
  }

  // Points, refund status, plan/role
  const points = dbUser.points ?? 0;
  const refundEligible = dbUser.refundEligible ?? false;
  const plan = dbUser.role ?? "free";

  return NextResponse.json({
    stats: {
      downloads,
      reviews,
      referrals,
      points,
      referralCode,
      paidReferrals,
      refundEligible,
      plan, // add plan/role here
    }
  });
}
