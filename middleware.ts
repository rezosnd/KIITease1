import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// In-memory rate limiting (for dev only; use Redis/Upstash in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit = 100, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= limit) {
    return true;
  }
  record.count++;
  return false;
}

// JWT secret for Edge runtime (must be set at build time)
const SECRET = process.env.JWT_SECRET || "your-default-secret";

// Edge-compatible JWT verification using jose
async function verifyToken(token: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Robust IP extraction for rate limiting
  const ip =
    request.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // General API rate limit
  if (pathname.startsWith("/api/")) {
    if (rateLimit(ip, 100, 15 * 60 * 1000)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // Stricter rate limit for auth endpoints
  if (pathname.startsWith("/api/auth/")) {
    if (rateLimit(`auth-${ip}`, 10, 15 * 60 * 1000)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // Protect admin route
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const user = await verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );

  return response;
}

// Apply middleware to these paths
export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
