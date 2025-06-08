import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export interface GoogleUser {
  email: string
  name: string
  picture?: string
  verified: boolean
}

export async function verifyGoogleToken(token: string): Promise<GoogleUser | null> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
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

export function getGoogleAuthUrl(): string {
  const scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]

  return client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  })
}
