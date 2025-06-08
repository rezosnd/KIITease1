"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Star, Gift, LogOut, Copy, TrendingUp, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import NotesSection from "@/components/notes-section"
import ReviewsSection from "@/components/reviews-section"
import MyReviewsSection from "@/components/my-reviews-section"
import PaymentSection from "@/components/payment-section"

interface DashboardContentProps {
  user: any
  userData: any
  referralCount: number
}

export default function DashboardContent({ user, userData, referralCount }: DashboardContentProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(userData?.referralCode || "")
    toast({
      title: "Copied! 📋",
      description: "Referral code copied to clipboard",
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const statsCards = [
    {
      title: "Your Role",
      value: user.role,
      description: user.role === "free" ? "Upgrade to access notes" : "Full access enabled",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Referrals",
      value: `${referralCount}/20`,
      description: `${20 - referralCount} more for refund eligibility`,
      icon: Gift,
      color: "text-green-600",
    },
    {
      title: "Referral Code",
      value: userData?.referralCode,
      description: "Share with friends",
      icon: Copy,
      color: "text-purple-600",
      clickable: true,
      onClick: copyReferralCode,
    },
    {
      title: "Refund Status",
      value:
        userData?.refundStatus === "eligible"
          ? "Eligible!"
          : userData?.refundStatus === "issued"
            ? "Issued"
            : "Not Eligible",
      description: userData?.refundStatus === "eligible" ? "Contact admin for refund" : "Complete referrals to qualify",
      icon: Star,
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <motion.nav
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div className="flex items-center" whileHover={{ scale: 1.05 }}>
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KIITease
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Badge className={`${getRoleColor(user.role)} border font-medium`}>{user.role.toUpperCase()}</Badge>
              <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user.name}</span>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statsCards.map((card, index) => (
            <AnimatedCard key={card.title} delay={index * 0.1}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  className={`text-2xl font-bold ${card.clickable ? "cursor-pointer hover:text-blue-600" : ""}`}
                  onClick={card.onClick}
                  whileHover={card.clickable ? { scale: 1.05 } : {}}
                >
                  {typeof card.value === "string" && card.value.length > 10 ? (
                    <span className="text-lg font-mono">{card.value}</span>
                  ) : (
                    <span className="capitalize">{card.value}</span>
                  )}
                </motion.div>
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                {card.clickable && (
                  <Button variant="outline" size="sm" onClick={card.onClick} className="mt-2 h-7 text-xs">
                    Copy Code
                  </Button>
                )}
              </CardContent>
            </AnimatedCard>
          ))}
        </motion.div>

        {/* Progress Bar for Referrals */}
        {referralCount < 20 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <AnimatedCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Referral Progress
                </CardTitle>
                <CardDescription>{20 - referralCount} more referrals needed for refund eligibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(referralCount / 20) * 100}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{referralCount} completed</span>
                  <span>20 target</span>
                </div>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Tabs defaultValue="notes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="notes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Study Notes
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Teacher Reviews
              </TabsTrigger>
              <TabsTrigger
                value="my-reviews"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                My Reviews
              </TabsTrigger>
              <TabsTrigger value="payment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Payment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <NotesSection user={user} />
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsSection user={user} />
            </TabsContent>

            <TabsContent value="my-reviews">
              <MyReviewsSection user={user} />
            </TabsContent>

            <TabsContent value="payment">
              <PaymentSection user={user} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
