"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, LogIn, Loader2, Mail, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { OTPInput } from "@/components/auth/otp-input"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password")
  const [step, setStep] = useState<"form" | "otp">("form")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Login failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || "User",
          type: "login",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the login code.",
        })
        setStep("otp")
        startResendTimer()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send OTP",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
          type: "login",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Invalid OTP",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || "User",
          type: "login",
        }),
      })

      if (response.ok) {
        toast({
          title: "OTP Resent!",
          description: "Please check your email for the new login code.",
        })
        startResendTimer()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Google Sign-In Script */}
      <script src="https://accounts.google.com/gsi/client" async defer></script>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BookOpen className="h-12 w-12 text-blue-600" />
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {step === "otp" ? "Enter Login Code" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {step === "otp"
                  ? `Enter the 6-digit code sent to ${formData.email}`
                  : "Sign in to access your study materials"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === "form" && (
                <>
                  <GoogleAuthButton mode="login" />

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  {/* Login Method Toggle */}
                  <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setLoginMethod("password")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        loginMethod === "password"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod("otp")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        loginMethod === "otp" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      OTP
                    </button>
                  </div>

                  {loginMethod === "password" ? (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            <>
                              <LogIn className="mr-2 h-4 w-4" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  ) : (
                    <form onSubmit={handleOTPLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Login Code
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  )}
                </>
              )}

              {step === "otp" && (
                <div className="space-y-6">
                  <Button variant="ghost" onClick={() => setStep("form")} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>

                  <div className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-6">We've sent a 6-digit login code to your email address.</p>
                  </div>

                  <OTPInput onComplete={handleOTPVerify} />

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || isLoading}
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {step === "form" && (
                <div className="mt-6 text-center space-y-2">
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot your password?
                  </Link>
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
