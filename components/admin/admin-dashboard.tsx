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
  Plus,
  X,
} from "lucide-react"
import AdminUsersList from "@/components/admin/admin-users-list"
import AdminNotesList from "@/components/admin/admin-notes-list"
import AdminReviewsList from "@/components/admin/admin-reviews-list"
import AdminPaymentsList from "@/components/admin/admin-payments-list"
import AdminRefundsList from "@/components/admin/admin-refunds-list"
import AdminEmailSettings from "@/components/admin/admin-email-settings"
import AdminSystemSettings from "@/components/admin/admin-system-settings"

// --- Add Teacher Modal ---
function AdminAddTeacherModal({ open, onClose, onAdded }: { open: boolean, onClose: () => void, onAdded?: () => void }) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name.trim() || !department.trim()) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" })
      return
    }
    setLoading(true)
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, department }),
    })
    setLoading(false)
    const data = await res.json()
    if (res.ok) {
      setName("")
      setDepartment("")
      toast({ title: "Success", description: "Teacher added!" })
      onAdded && onAdded()
      onClose()
    } else {
      toast({ title: "Error", description: data.error || "Failed to add teacher", variant: "destructive" })
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <button className="absolute top-2 right-2" onClick={onClose}><X className="h-5 w-5" /></button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" />Add Teacher</h2>
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Teacher Name"
            disabled={loading}
          />
          <input
            className="w-full border rounded px-3 py-2"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            placeholder="Department"
            disabled={loading}
          />
        </div>
        <Button
          className="w-full mt-4"
          onClick={handleAdd}
          disabled={loading || !name || !department}
        >
          {loading ? "Adding..." : "Add Teacher"}
        </Button>
      </div>
    </div>
  )
}

// --- Upload Notes Modal ---
function AdminUploadNotesModal({ open, onClose, onUploaded }: { open: boolean, onClose: () => void, onUploaded?: () => void }) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Error", description: "Select a file to upload", variant: "destructive" })
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/admin/notes/upload", {
      method: "POST",
      body: formData,
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: "Success", description: "Notes uploaded!" })
      setFile(null)
      onUploaded && onUploaded()
      onClose()
    } else {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" })
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <button className="absolute top-2 right-2" onClick={onClose}><X className="h-5 w-5" /></button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload className="h-5 w-5" />Upload Notes</h2>
        <input
          type="file"
          className="w-full mb-4"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          disabled={loading}
        />
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  )
}

// --- Send Email Modal ---
function AdminSendEmailModal({ open, onClose, onSent }: { open: boolean, onClose: () => void, onSent?: () => void }) {
  const { toast } = useToast()
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" })
      return
    }
    setLoading(true)
    const res = await fetch("/api/admin/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text: body }),
    })
    setLoading(false)
    const data = await res.json()
    if (res.ok) {
      toast({ title: "Success", description: "Email sent!" })
      setTo(""); setSubject(""); setBody("")
      onSent && onSent()
      onClose()
    } else {
      toast({ title: "Error", description: data.error || "Failed to send email", variant: "destructive" })
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <button className="absolute top-2 right-2" onClick={onClose}><X className="h-5 w-5" /></button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Mail className="h-5 w-5" />Send Email</h2>
        <input
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Recipient Email"
          value={to}
          onChange={e => setTo(e.target.value)}
          disabled={loading}
        />
        <input
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          disabled={loading}
        />
        <textarea
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Message"
          rows={4}
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={loading}
        />
        <Button className="w-full" onClick={handleSend} disabled={loading || !to || !subject || !body}>
          {loading ? "Sending..." : "Send Email"}
        </Button>
      </div>
    </div>
  )
}

interface AdminDashboardProps {
  user: {
    name: string
    email: string
    role: string
    // ...other fields
  }
  stats: {
    totalUsers: number
    paidUsers: number
    totalNotes: number
    totalReviews: number
    conversionRate: string
  }
  recentUsers: {
    _id: string
    name: string
    email: string
    role: string
  }[]
  recentPayments: {
    _id: string
    orderId: string
    createdAt: string
    amount: number
  }[]
  refundEligibleUsers: {
    _id: string
    name: string
    email: string
  }[]
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
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [showUploadNotes, setShowUploadNotes] = useState(false)
  const [showSendEmail, setShowSendEmail] = useState(false)

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
      {/* Modals */}
      <AdminAddTeacherModal open={showAddTeacher} onClose={() => setShowAddTeacher(false)} />
      <AdminUploadNotesModal open={showUploadNotes} onClose={() => setShowUploadNotes(false)} />
      <AdminSendEmailModal open={showSendEmail} onClose={() => setShowSendEmail(false)} />

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
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center"
                      onClick={() => setShowUploadNotes(true)}
                    >
                      <Upload className="h-6 w-6 mb-2" />
                      <span>Upload Notes</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center"
                      onClick={() => setShowAddTeacher(true)}
                    >
                      <UserPlus className="h-6 w-6 mb-2" />
                      <span>Add Teacher</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-24 items-center justify-center"
                      onClick={() => setShowSendEmail(true)}
                    >
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
