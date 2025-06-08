"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, UserPlus, Loader2, Mail, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { OTPInput } from "@/components/auth/otp-input"

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp" | "google-info">("form")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    branch: "",
    year: "",
    referralCode: "",
  })
  const [googleUser, setGoogleUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "EEE", "CSSE", "CSCE"]
  const years = ["1", "2", "3", "4"]

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "registration" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
        })
        setStep("otp")
        setOtpSent(true)
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
          type: "registration",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Account created successfully!",
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
        body: JSON.stringify({ ...formData, type: "registration" }),
      })

      if (response.ok) {
        toast({
          title: "OTP Resent!",
          description: "Please check your email for the new verification code.",
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

  const handleGoogleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.branch || !formData.year) {
      toast({
        title: "Error",
        description: "Please select your branch and year",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: googleUser.token,
          branch: formData.branch,
          year: formData.year,
          referralCode: formData.referralCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Account created successfully!",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Registration failed",
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
                {step === "otp"
                  ? "Verify Your Email"
                  : step === "google-info"
                    ? "Complete Your Profile"
                    : "Join KIITease"}
              </CardTitle>
              <CardDescription>
                {step === "otp"
                  ? `Enter the 6-digit code sent to ${formData.email}`
                  : step === "google-info"
                    ? "Please provide your academic details"
                    : "Create your account to access premium study materials"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === "form" && (
                <>
                  <GoogleAuthButton
                    mode="register"
                    onRequireAdditionalInfo={(user) => {
                      setGoogleUser(user)
                      setFormData((prev) => ({ ...prev, name: user.name, email: user.email }))
                      setStep("google-info")
                    }}
                  />

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select
                          value={formData.branch}
                          onValueChange={(value) => setFormData({ ...formData, branch: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch} value={branch}>
                                {branch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select
                          value={formData.year}
                          onValueChange={(value) => setFormData({ ...formData, year: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code"
                        value={formData.referralCode}
                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
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
                            Send Verification Code
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </>
              )}

              {step === "otp" && (
                <div className="space-y-6">
                  <Button variant="ghost" onClick={() => setStep("form")} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to form
                  </Button>

                  <div className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-6">
                      We've sent a 6-digit verification code to your email address.
                    </p>
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

              {step === "google-info" && (
                <form onSubmit={handleGoogleInfoSubmit} className="space-y-4">
                  <Button type="button" variant="ghost" onClick={() => setStep("form")} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">Welcome, {googleUser?.name}! Please complete your profile.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Select
                        value={formData.branch}
                        onValueChange={(value) => setFormData({ ...formData, branch: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select
                        value={formData.year}
                        onValueChange={(value) => setFormData({ ...formData, year: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code"
                      value={formData.referralCode}
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Complete Registration
                      </>
                    )}
                  </Button>
                </form>
              )}

              {step === "form" && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in
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
