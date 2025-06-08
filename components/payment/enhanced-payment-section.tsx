"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Check, Star, Zap, Crown, Gift, Users, Wallet, Copy } from "lucide-react"

interface EnhancedPaymentSectionProps {
  user: {
    role: "free" | "paid"
    name: string
    email: string
    [key: string]: any
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function EnhancedPaymentSection({ user }: EnhancedPaymentSectionProps) {
  const [loading, setLoading] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [referralStats, setReferralStats] = useState<any>(null)
  const { toast } = useToast()

  // Razorpay script loader (only if not present)
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)
    }
    // Load referral stats on mount
    loadReferralStats()
    // eslint-disable-next-line
  }, [])

  const loadReferralStats = async () => {
    try {
      const response = await fetch("/api/referrals/stats")
      if (response.ok) {
        const data = await response.json()
        setReferralStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to load referral stats:", error)
    }
  }

  const handlePayment = async () => {
    if (user.role === "paid") {
      toast({
        title: "Already Premium",
        description: "You already have premium access!",
      })
      return
    }

    setLoading(true)

    try {
      // Create Razorpay order with referral code
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 499,
          referralCode: referralCode.trim() || undefined,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay
      const options = {
        key: orderData.order.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "KIITease",
        description: "Premium Access - Study Notes & Reviews",
        order_id: orderData.order.id,
        handler: async (response: any) => {
          try {
            // Auto-verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyResponse.ok) {
              const result = await verifyResponse.json()
              toast({
                title: "Payment Successful! 🎉",
                description: result.referralProcessed
                  ? "Payment successful! Referral reward processed."
                  : "Welcome to KIITease Premium!",
              })
              window.location.reload()
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted",
              variant: "destructive",
            })
            setLoading(false)
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleRefundRequest = async () => {
    try {
      const response = await fetch("/api/referrals/request-refund", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Refund Requested! 💰",
          description: "Your refund is being processed. You'll receive it within 3-5 business days.",
        })
        loadReferralStats()
      } else {
        throw new Error("Failed to request refund")
      }
    } catch (error) {
      toast({
        title: "Refund Request Failed",
        description: "Please contact admin for manual processing.",
        variant: "destructive",
      })
    }
  }

  const copyReferralCode = () => {
    if (referralStats?.referralCode) {
      navigator.clipboard.writeText(referralStats.referralCode)
      toast({
        title: "Copied! 📋",
        description: "Referral code copied to clipboard",
      })
    }
  }

  const features = [
    {
      icon: <Check className="h-5 w-5 text-green-600" />,
      title: "Unlimited Notes Access",
      description: "Download all study materials for your branch and year",
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      title: "Premium Teacher Reviews",
      description: "Access detailed reviews and ratings from verified students",
    },
    {
      icon: <Zap className="h-5 w-5 text-blue-600" />,
      title: "AI-Powered Recommendations",
      description: "Get personalized study material suggestions",
    },
    {
      icon: <Gift className="h-5 w-5 text-purple-600" />,
      title: "Referral Rewards",
      description: "Earn money back through our referral program",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Premium Access</h2>
        <p className="text-gray-600">Unlock all features and boost your academic performance</p>
      </div>

      {/* Referral Stats Dashboard */}
      {referralStats && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Referral Dashboard
            </CardTitle>
            <CardDescription>Track your referrals and earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{referralStats.referralCount}</div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{referralStats.totalEarnings}</div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{20 - referralStats.referralCount}</div>
                <div className="text-sm text-gray-600">To Refund</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(referralStats.referralCount / 20) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            {/* Referral Code */}
            <div className="flex items-center gap-2 mb-4">
              <Label>Your Referral Code:</Label>
              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{referralStats.referralCode}</code>
              <Button size="sm" variant="outline" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Refund Button */}
            {referralStats.refundEligible && referralStats.refundStatus === "eligible" && (
              <Button
                onClick={handleRefundRequest}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Claim Your Refund (₹499)
              </Button>
            )}

            {referralStats.refundStatus === "processing" && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-yellow-800 font-medium">Refund Processing</div>
                <div className="text-yellow-600 text-sm">You'll receive ₹499 within 3-5 business days</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      <Card className={user.role === "paid" ? "border-green-200 bg-green-50" : "border-gray-200"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {user.role === "paid" ? (
                <Crown className="h-8 w-8 text-yellow-600" />
              ) : (
                <CreditCard className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <h3 className="text-lg font-semibold">{user.role === "paid" ? "Premium Member" : "Free Member"}</h3>
                <p className="text-sm text-gray-600">
                  {user.role === "paid" ? "You have full access to all features" : "Upgrade to unlock premium features"}
                </p>
              </div>
            </div>
            <Badge variant={user.role === "paid" ? "default" : "secondary"} className="text-sm">
              {user.role === "paid" ? "PREMIUM" : "FREE"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {user.role === "free" && (
        <>
          {/* Pricing Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">KIITease Premium</CardTitle>
                <CardDescription>Everything you need for academic success</CardDescription>
                <div className="text-center mt-4">
                  <span className="text-4xl font-bold text-blue-600">₹499</span>
                  <span className="text-gray-600 ml-2">one-time</span>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  💰 Get refund through referrals! Refer 20 friends and get your money back.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Referral Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="referral">Have a referral code? (Optional)</Label>
                  <Input
                    id="referral"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="text-center font-mono"
                  />
                  {referralCode && (
                    <p className="text-sm text-green-600">✅ Referral code applied! Your referrer will earn rewards.</p>
                  )}
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                  size="lg"
                >
                  {loading ? "Processing..." : "Upgrade to Premium"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features List */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>Everything you get with KIITease Premium</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Referral Info */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                Enhanced Referral Program
              </CardTitle>
              <CardDescription>Automatic rewards and refund system!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Each referral earns you</span>
                  <span className="text-sm font-medium text-green-600">₹50 reward</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Refer 20 friends</span>
                  <span className="text-sm font-medium text-green-600">Get ₹499 full refund</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto-processing</span>
                  <span className="text-sm font-medium text-blue-600">Instant rewards</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Refund timeline</span>
                  <span className="text-sm font-medium text-purple-600">3-5 business days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
