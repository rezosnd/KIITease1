import { OAuth2Client } from "google-auth-library"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error("Missing Google OAuth environment variables")
}

const client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
)

export interface GoogleUser {
  email: string
  name: string
  picture?: string
  verified: boolean
}

/**
 * Verifies a Google OAuth ID token and returns user info if valid, else null.
 */
export async function verifyGoogleToken(token: string): Promise<GoogleUser | null> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email_verified) {
      return null
    }

    return {
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
      verified: payload.email_verified!,
    }
  } catch (error) {
    console.error("Google token verification failed:", error)
    return null
  }
}

/**
 * Generates a Google OAuth authorization URL.
 */
export function getGoogleAuthUrl(): string {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]

  return client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })
}
