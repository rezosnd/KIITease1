"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SkeletonLoader } from "@/components/ui/skeleton-loader"
import { useToast } from "@/hooks/use-toast"
import { Star, Search, Trash2, Eye } from "lucide-react"

export default function AdminReviewsList() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/reviews")
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    setDeletingId(reviewId)
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Review deleted successfully",
        })
        fetchReviews()
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: data.error || "Failed to delete review",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const filteredReviews = reviews.filter(
    (review: any) =>
      (review.teacher?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (review.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Reviews Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>Manage teacher reviews and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No reviews found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredReviews.map((review: any) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="font-medium">{review.teacher?.name}</div>
                        <div className="text-sm text-gray-500">{review.teacher?.department}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{review.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{review.user?.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteReview(review._id)}
                            className="hover:bg-red-50 hover:text-red-600"
                            disabled={deletingId === review._id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
