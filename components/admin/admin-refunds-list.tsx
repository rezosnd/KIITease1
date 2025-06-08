"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SkeletonLoader } from "@/components/ui/skeleton-loader"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminRefundsList() {
  const [refunds, setRefunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRefunds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchRefunds = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/refunds")
      const data = await response.json()
      setRefunds(data.refunds || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch refunds",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const processRefund = async (refundId: string, action: "approve" | "reject") => {
    setProcessingId(refundId)
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Refund ${action}d successfully`,
        })
        fetchRefunds()
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: data.error || `Failed to ${action} refund`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} refund`,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Refund Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Refund Requests
          </CardTitle>
          <CardDescription>Manage user refund requests and eligibility</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonLoader key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No refund requests at the moment</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Payment Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Eligible Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds.map((refund) => (
                    <TableRow key={refund._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{refund.name}</div>
                          <div className="text-sm text-gray-500">{refund.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{refund.referralCount}/20 completed</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">₹{refund.paymentAmount || 499}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            refund.refundStatus === "eligible"
                              ? "bg-yellow-100 text-yellow-800"
                              : refund.refundStatus === "issued"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {refund.refundStatus?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{refund.updatedAt ? new Date(refund.updatedAt).toLocaleDateString() : ""}</div>
                      </TableCell>
                      <TableCell>
                        {refund.refundStatus === "eligible" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => processRefund(refund._id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={processingId === refund._id}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => processRefund(refund._id, "reject")}
                              className="hover:bg-red-50 hover:text-red-600"
                              disabled={processingId === refund._id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
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
