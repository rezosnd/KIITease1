import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { to, subject, html } = await req.json();

  // Collect missing fields
  const missingFields: string[] = [];
  if (!to) missingFields.push("to");
  if (!subject) missingFields.push("subject");
  if (!html) missingFields.push("html");
  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Send email using your email utility
    const result = await sendEmail({ to, subject, html });

    // Log the email in your database for stats
    const db = await getDatabase();
    await db.collection("email_logs").insertOne({
      to,
      subject,
      html,
      status: result.success ? "sent" : "failed",
      sentAt: new Date(),
      admin: user.email,
      error: result.success ? null : result.error,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Log failed email
    const db = await getDatabase();
    await db.collection("email_logs").insertOne({
      to,
      subject,
      html,
      status: "failed",
      sentAt: new Date(),
      admin: user.email,
      error: error?.message || String(error),
    });
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
