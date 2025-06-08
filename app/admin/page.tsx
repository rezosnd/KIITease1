import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  const user = verifyToken(token)
  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  const db = await getDatabase()

  // Get dashboard stats
  const totalUsers = await db.collection("users").countDocuments()
  const paidUsers = await db.collection("users").countDocuments({ role: "paid" })
  const totalNotes = await db.collection("notes").countDocuments()
  const totalReviews = await db.collection("reviews").countDocuments()

  // Get recent users
  const recentUsers = await db.collection("users").find().sort({ createdAt: -1 }).limit(10).toArray()

  // Get recent payments
  const recentPayments = await db
    .collection("payment_orders")
    .find({ status: "completed" })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  // Get refund eligible users
  const refundEligibleUsers = await db
    .collection("users")
    .find({ refundEligible: true, refundStatus: "eligible" })
    .toArray()

  return (
    <AdminDashboard
      user={user}
      stats={{
        totalUsers,
        paidUsers,
        totalNotes,
        totalReviews,
        conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : "0",
      }}
      recentUsers={recentUsers}
      recentPayments={recentPayments}
      refundEligibleUsers={refundEligibleUsers}
    />
  )
}
