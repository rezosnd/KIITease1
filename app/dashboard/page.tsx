"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Star, Users, TrendingUp, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "free" | "paid" | "admin"
  branch: string
  year: number
}

interface Stats {
  downloads: number
  reviews: number
  referrals: number
  points: number
  referralCode: string
  paidReferrals: number
  refundEligible: boolean
}

interface ActivityItem {
  type: "download" | "review" | "referral" | "payment"
  description: string
  timeAgo: string
  color: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch user and dashboard stats from your backend API
    async function fetchDashboard() {
      try {
        setLoading(true)
        const userRes = await fetch("/api/me", { credentials: "include" })
        if (!userRes.ok) throw new Error("User not authenticated")
        const userData = await userRes.json()

        const statsRes = await fetch("/api/dashboard/stats", { credentials: "include" })
        const statsData = await statsRes.json()

        const activityRes = await fetch("/api/dashboard/activity", { credentials: "include" })
        const activityData = await activityRes.json()

        setUser(userData.user)
        setStats(statsData.stats)
        setActivity(activityData.activity)
      } catch (err) {
        // Not authenticated, redirect to login
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !stats) return null

  // Feature access logic
  const canAccessNotes = user.role === "paid" || user.role === "admin"
  const canViewReviews = user.role === "paid" || user.role === "admin"
  const canWriteReviews = user.role !== "admin"
  const isAdmin = user.role === "admin"

  const features = [
    {
      icon: BookOpen,
      title: "Study Notes",
      description: "Access premium study materials for your branch",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      enabled: canAccessNotes,
      onClick: () => canAccessNotes ? router.push("/notes") : null,
    },
    {
      icon: Star,
      title: "Teacher Reviews",
      description: canViewReviews ? "Read and write reviews for teachers" : "Write reviews for teachers",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      enabled: canViewReviews || canWriteReviews,
      onClick: () => router.push("/reviews"),
    },
    {
      icon: Users,
      title: "Referrals",
      description: "Refer friends and earn rewards",
      color: "text-green-600",
      bgColor: "bg-green-50",
      enabled: true,
      onClick: () => router.push("/referrals"),
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "View your learning progress",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      enabled: canAccessNotes, // only paid/admin
      onClick: () => canAccessNotes ? router.push("/analytics") : null,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduPlatform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <Button
                variant="outline"
                onClick={() => {
                  fetch("/api/logout", { method: "POST", credentials: "include" })
                  router.push("/")
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600">
            {user.branch} - Year {user.year} | Role: {user.role}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Referral Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{stats.referralCode}</span>{" "}
            | Paid Referrals: <span className="font-bold">{stats.paidReferrals}</span>
            {stats.refundEligible && (
              <span className="ml-4 text-green-600 font-semibold">You are eligible for a refund!</span>
            )}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.downloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.reviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.referrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.points}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} whileHover={feature.enabled ? { scale: 1.05 } : {}} whileTap={feature.enabled ? { scale: 0.95 } : {}}>
              <Card
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  !feature.enabled ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={feature.enabled ? feature.onClick : undefined}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant={feature.enabled ? "outline" : "secondary"} disabled={!feature.enabled}>
                    Access {feature.title}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.length === 0 && <div className="text-gray-500">No recent activity.</div>}
                {activity.map((item, i) => (
                  <div className="flex items-center space-x-4" key={i}>
                    <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-xs text-gray-500">{item.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
