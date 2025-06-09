import { type NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { getDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { to, subject, text } = await req.json();
  if (!to || !subject || !text) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // Send email using your email utility
    await sendMail({ to, subject, text });

    // Optionally log the email in your database for stats
    const db = await getDatabase();
    await db.collection("email_logs").insertOne({
      to,
      subject,
      text,
      status: "sent", // or "failed" if exception thrown
      sentAt: new Date(),
      admin: user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Optionally log failed email
    const db = await getDatabase();
    await db.collection("email_logs").insertOne({
      to,
      subject,
      text,
      status: "failed",
      sentAt: new Date(),
      admin: user.email,
      error: error?.message || String(error),
    });
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
