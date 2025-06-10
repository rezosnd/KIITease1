import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { generateOTP, storeOTP, sendOTPEmail, checkOTPRateLimit } from "@/lib/otp-service";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, type, ...otherData } = body;

    if (!email || !name || !type) {
      return NextResponse.json({ error: "Email, name, and type are required" }, { status: 400 });
    }

    // Only allow known OTP types
    if (!["registration", "login"].includes(type)) {
      return NextResponse.json({ error: "Invalid OTP type" }, { status: 400 });
    }

    // Rate limiting
    const rateLimit = await checkOTPRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateLimit.waitTime} seconds.` },
        { status: 429 }
      );
    }

    const db = await getDatabase();

    // Registration: validate and check if user exists
    if (type === "registration") {
      try {
        registerSchema.parse(body);
      } catch {
        return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
      }

      const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
      }

      // Store registration data in pending_registrations (overwrite any previous)
      await db.collection("pending_registrations").deleteMany({ email: email.toLowerCase() });
      await db.collection("pending_registrations").insertOne({
        ...otherData,
        email: email.toLowerCase(),
        name,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });
    }

    // Login: check if user exists
    if (type === "login") {
      const user = await db.collection("users").findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp, type);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, name, otp, type);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    // Show detailed error in dev, generic in prod
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      {
        error: isDev
          ? (error instanceof Error ? error.message : String(error))
          : "Internal server error"
      },
      { status: 500 }
    );
  }
}
