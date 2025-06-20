"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    google: any
  }
}

interface GoogleAuthButtonProps {
  mode: "login" | "register"
  additionalData?: {
    branch?: string
    year?: string
    referralCode?: string
  }
  onRequireAdditionalInfo?: (googleUser: any) => void
}

export function GoogleAuthButton({ mode, additionalData, onRequireAdditionalInfo }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const initialized = useRef(false)

  // Load Google script if not present
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.google) return

    // Check if script already exists
    if (!document.getElementById("google-client-script")) {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.id = "google-client-script"
      document.body.appendChild(script)
    }
  }, [])

  // Initialize Google button
  useEffect(() => {
    if (window.google && !initialized.current) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      })
      initialized.current = true
    }
    // eslint-disable-next-line
  }, [typeof window !== "undefined" && window.google])

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true)
    try {
      if (!response || !response.credential) {
        throw new Error("No credential received from Google")
      }

      // Send token to backend
      const authResponse = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: response.credential,
          mode,
          ...additionalData,
        }),
      })

      const data = await authResponse.json()

      if (authResponse.ok) {
        toast({
          title: "Success!",
          description: data.message,
        })
        router.push("/dashboard")
      } else if (data.requiresAdditionalInfo && onRequireAdditionalInfo) {
        onRequireAdditionalInfo({ ...data.googleUser, token: response.credential })
      } else {
        toast({
          title: "Error",
          description: data.error || "Authentication failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Google auth error:", error)
      toast({
        title: "Error",
        description: "Google authentication failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    if (!window.google) {
      toast({
        title: "Error",
        description: "Google Sign-In not loaded. Please refresh the page.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    window.google.accounts.id.prompt()
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      aria-label="Sign in with Google"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      Continue with Google
    </Button>
  )
}

