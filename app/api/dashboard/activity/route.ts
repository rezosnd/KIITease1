import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper function to format timeAgo
function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || !user.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = await getDatabase();

  let userObjectId: ObjectId;
  try {
    userObjectId = typeof user.userId === "string" ? new ObjectId(user.userId) : user.userId;
  } catch {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  // Collect recent activity from downloads, reviews, referrals, and payments
  const activities: any[] = [];

  // Last 5 downloads
  try {
    const downloads = await db.collection("downloads")
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    downloads.forEach(d => {
      activities.push({
        type: "download",
        description: `Downloaded ${d.noteTitle || "a note"}`,
        time: d.createdAt ? new Date(d.createdAt) : new Date(),
        color: "bg-blue-600",
      });
    });
  } catch {}

  // Last 5 reviews
  try {
    const reviews = await db.collection("reviews")
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    reviews.forEach(r => {
      activities.push({
        type: "review",
        description: `Reviewed ${r.teacherName ? `Prof. ${r.teacherName}` : "a teacher"}`,
        time: r.createdAt ? new Date(r.createdAt) : new Date(),
        color: "bg-yellow-600",
      });
    });
  } catch {}

  // Last 5 referrals (when someone used your code to register)
  try {
    const dbUser = await db.collection("users").findOne({ _id: userObjectId });
    if (dbUser && dbUser.referralCode) {
      const referrals = await db.collection("users")
        .find({ referredBy: dbUser.referralCode })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      referrals.forEach(ref => {
        activities.push({
          type: "referral",
          description: `Referred ${ref.name || ref.email || "a user"}`,
          time: ref.createdAt ? new Date(ref.createdAt) : new Date(),
          color: "bg-green-600",
        });
      });
    }
  } catch {}

  // Last 5 payments (if you have a payments collection)
  try {
    const payments = await db.collection("payments")
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    payments.forEach(p => {
      activities.push({
        type: "payment",
        description: `Payment of ₹${p.amount || "?"} (${p.status || "status unknown"})`,
        time: p.createdAt ? new Date(p.createdAt) : new Date(),
        color: "bg-pink-600",
      });
    });
  } catch {}

  // Sort all activities by time, newest first, and limit to 10
  activities.sort((a, b) => b.time.getTime() - a.time.getTime());
  const latest = activities.slice(0, 10);

  return NextResponse.json({
    activity: latest.map(item => ({
      type: item.type,
      description: item.description,
      timeAgo: timeAgo(item.time),
      color: item.color
    }))
  });
}
