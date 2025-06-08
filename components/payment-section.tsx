"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Check, Star, Zap, Crown, Gift } from "lucide-react"

interface PaymentSectionProps {
  user: {
    name: string
    email: string
    role: "free" | "paid"
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentSection({ user }: PaymentSectionProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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
      // Create Razorpay order on your backend
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 499 }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()

      // Load Razorpay checkout if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KIITease",
        description: "Premium Access - Study Notes & Reviews",
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // Verify payment on your backend
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
              toast({
                title: "Payment Successful! 🎉",
                description: "Welcome to KIITease Premium!",
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
          ondismiss: () => setLoading(false),
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
    } finally {
      setLoading(false)
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
              <CardContent>
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

          {/* Referral Info */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                Referral Program
              </CardTitle>
              <CardDescription>Get your money back by referring friends!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Refer 20 friends</span>
                  <span className="text-sm font-medium text-green-600">Get ₹499 refund</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Each friend gets</span>
                  <span className="text-sm font-medium text-blue-600">Premium access</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">You get</span>
                  <span className="text-sm font-medium text-purple-600">Full refund eligibility</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {user.role === "paid" && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Crown className="h-5 w-5" />
              Premium Active
            </CardTitle>
            <CardDescription>You have full access to all KIITease features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={feature.title} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
