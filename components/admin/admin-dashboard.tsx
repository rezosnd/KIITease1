"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/ui/animated-card"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  BookOpen,
  Star,
  CreditCard,
  LogOut,
  ChevronRight,
  BarChart3,
  Settings,
  Mail,
  RefreshCw,
  Download,
  Upload,
  UserPlus,
} from "lucide-react"
import AdminUsersList from "@/components/admin/admin-users-list"
import AdminNotesList from "@/components/admin/admin-notes-list"
import AdminReviewsList from "@/components/admin/admin-reviews-list"
import AdminPaymentsList from "@/components/admin/admin-payments-list"
import AdminRefundsList from "@/components/admin/admin-refunds-list"
import AdminEmailSettings from "@/components/admin/admin-email-settings"
import AdminSystemSettings from "@/components/admin/admin-system-settings"

interface AdminDashboardProps {
  user: any
  stats: {
    totalUsers: number
    paidUsers: number
    totalNotes: number
    totalReviews: number
    conversionRate: string
  }
  recentUsers: any[]
  recentPayments: any[]
  refundEligibleUsers: any[]
}

export default function AdminDashboard({
  user,
  stats,
  recentUsers,
  recentPayments,
  refundEligibleUsers,
}: AdminDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const handleProcessRefund = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/process-refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Refund processed successfully",
        })
        // Refresh the data
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to process refund",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Paid Users",
      value: stats.paidUsers,
      description: `${stats.conversionRate}% conversion rate`,
      icon: CreditCard,
      color: "text-green-600",
    },
    {
      title: "Study Notes",
      value: stats.totalNotes,
      description: "Uploaded materials",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Teacher Reviews",
      value: stats.totalReviews,
      description: "Submitted reviews",
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
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 border font-medium">ADMIN</Badge>
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

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <motion.div
          className="w-full md:w-64 bg-white shadow-md md:min-h-screen p-4"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "notes", label: "Study Notes", icon: BookOpen },
              { id: "reviews", label: "Reviews", icon: Star },
              { id: "payments", label: "Payments", icon: CreditCard },
              { id: "refunds", label: "Refunds", icon: RefreshCw },
              { id: "emails", label: "Email Settings", icon: Mail },
              { id: "settings", label: "System Settings", icon: Settings },
            ].map((item) => (
              <motion.div key={item.id} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => (
                  <AnimatedCard key={card.title} delay={index * 0.1}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <AnimatedCard delay={0.4}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      Recent Users
                    </CardTitle>
                    <CardDescription>Latest user registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUsers.slice(0, 5).map((user) => (
                        <div key={user._id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                          <div className="flex items-center">
                            <Badge
                              className={
                                user.role === "paid" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }
                            >
                              {user.role}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("users")}>
                      View All Users
                    </Button>
                  </CardContent>
                </AnimatedCard>

                {/* Recent Payments */}
                <AnimatedCard delay={0.5}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      Recent Payments
                    </CardTitle>
                    <CardDescription>Latest payment transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPayments.slice(0, 5).map((payment) => (
                        <div key={payment._id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Order #{payment.orderId.substring(0, 8)}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="font-medium text-green-600">₹{payment.amount}</div>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("payments")}>
                      View All Payments
                    </Button>
                  </CardContent>
                </AnimatedCard>
              </div>

              {/* Refund Eligible Users */}
              <AnimatedCard delay={0.6}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                    Refund Eligible Users
                  </CardTitle>
                  <CardDescription>Users who have completed 20+ referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  {refundEligibleUsers.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">No users currently eligible for refunds</div>
                  ) : (
                    <div className="space-y-4">
                      {refundEligibleUsers.map((user) => (
                        <div key={user._id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800">Eligible</Badge>
                            <Button
                              size="sm"
                              onClick={() => handleProcessRefund(user._id.toString())}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Process Refund
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("refunds")}>
                    Manage All Refunds
                  </Button>
                </CardContent>
              </AnimatedCard>

              {/* Quick Actions */}
              <AnimatedCard delay={0.7}>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="flex flex-col h-24 items-center justify-center">
                      <Upload className="h-6 w-6 mb-2" />
                      <span>Upload Notes</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 items-center justify-center">
                      <UserPlus className="h-6 w-6 mb-2" />
                      <span>Add User</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 items-center justify-center">
                      <Mail className="h-6 w-6 mb-2" />
                      <span>Send Email</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col h-24 items-center justify-center">
                      <Download className="h-6 w-6 mb-2" />
                      <span>Export Data</span>
                    </Button>
                  </div>
                </CardContent>
              </AnimatedCard>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <AdminUsersList />
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <AdminNotesList />
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <AdminReviewsList />
            </motion.div>
          )}

          {activeTab === "payments" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <AdminPaymentsList />
            </motion.div>
          )}

          {activeTab === "refunds" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <AdminRefundsList />
            </motion.div>
          )}

          {activeTab === "emails" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <AdminEmailSettings />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <AdminSystemSettings />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
