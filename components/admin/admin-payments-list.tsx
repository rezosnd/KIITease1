"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SkeletonLoader } from "@/components/ui/skeleton-loader"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminPaymentsList() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments")
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportPayments = () => {
    // Export functionality
    toast({
      title: "Export Started",
      description: "Payment data export will be downloaded shortly",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
        <Button onClick={exportPayments} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Payments
          </CardTitle>
          <CardDescription>Track all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonLoader key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div className="font-mono text-sm">{payment.orderId?.substring(0, 12)}...</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.user?.name}</div>
                          <div className="text-sm text-gray-500">{payment.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">₹{payment.amount}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {payment.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{payment.paymentId?.substring(0, 12)}...</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
