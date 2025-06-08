import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  // 1. Auth: Get JWT from cookies and verify
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) redirect("/login")

  const user = await verifyToken(token)
  if (!user || user.role !== "admin") redirect("/dashboard")

  // 2. Get DB connection
  const db = await getDatabase()

  // 3. Fetch dashboard stats
  const [totalUsers, paidUsers, totalNotes, totalReviews] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("users").countDocuments({ role: "paid" }),
    db.collection("notes").countDocuments(),
    db.collection("reviews").countDocuments(),
  ])

  // 4. Recent users (omit password hash/PII)
  const recentUsers = await db
    .collection("users")
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  // 5. Recent payments
  const recentPayments = await db
    .collection("payment_orders")
    .find({ status: "completed" })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  // 6. Refund-eligible users (again, safe fields only)
  const refundEligibleUsers = await db
    .collection("users")
    .find({ refundEligible: true, refundStatus: "eligible" }, { projection: { passwordHash: 0 } })
    .toArray()

  // 7. Conversion Rate
  const conversionRate =
    totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : "0"

  // 8. Render
  return (
    <AdminDashboard
      user={user}
      stats={{
        totalUsers,
        paidUsers,
        totalNotes,
        totalReviews,
        conversionRate,
      }}
      recentUsers={recentUsers}
      recentPayments={recentPayments}
      refundEligibleUsers={refundEligibleUsers}
    />
  )
}
