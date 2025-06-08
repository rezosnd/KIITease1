"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Star, Edit, Trash2, MessageSquare } from "lucide-react"

interface MyReview {
  _id: string
  teacherName: string
  subject: string
  branch: string
  rating: number
  comment: string
  reviewedAt: string
  helpful: number
}

interface MyReviewsSectionProps {
  user: any
}

export default function MyReviewsSection({ user }: MyReviewsSectionProps) {
  const [myReviews, setMyReviews] = useState<MyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editComment, setEditComment] = useState("")
  const [editRating, setEditRating] = useState<number>(5)
  const { toast } = useToast()

  useEffect(() => {
    fetchMyReviews()
    // eslint-disable-next-line
  }, [])

  const fetchMyReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reviews/my-reviews")
      if (response.ok) {
        const data = await response.json()
        setMyReviews(data.reviews || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your reviews",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Review deleted successfully",
        })
        fetchMyReviews()
      } else {
        throw new Error("Failed to delete review")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) =>
          interactive ? (
            <span
              key={star}
              className={`cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => onChange && onChange(star)}
            >
              <Star className={`h-5 w-5 transition`} fill={star <= rating ? "#FACC15" : "none"} />
            </span>
          ) : (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          )
        )}
      </div>
    )
  }

  const handleEdit = (review: MyReview) => {
    setEditingId(review._id)
    setEditComment(review.comment)
    setEditRating(review.rating)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditComment("")
    setEditRating(5)
  }

  const handleEditSave = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: editComment, rating: editRating }),
      })
      if (response.ok) {
        toast({
          title: "Updated!",
          description: "Review updated successfully.",
        })
        setEditingId(null)
        fetchMyReviews()
      } else {
        throw new Error("Failed to update review")
      }
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Could not update review.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
        <p className="text-gray-600">Manage your teacher reviews and see their impact</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{myReviews.length}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {myReviews.reduce((sum, review) => sum + review.helpful, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Helpful Votes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {myReviews.length > 0
                  ? (myReviews.reduce((sum, review) => sum + review.rating, 0) / myReviews.length).toFixed(1)
                  : "0"}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {myReviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{review.teacherName}</CardTitle>
                    <CardDescription>{review.subject}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">({review.rating})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{review.branch}</Badge>
                    <Badge variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {review.helpful} helpful
                    </Badge>
                  </div>

                  {editingId === review._id ? (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <textarea
                        className="w-full rounded border border-gray-200 p-2 mb-2 text-sm"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">Rating:</span>
                        {renderStars(editRating, true, setEditRating)}
                        <span className="text-xs text-gray-600 font-mono ml-2">{editRating}/5</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleEditSave(review._id)}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Reviewed on {new Date(review.reviewedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(review)}
                        disabled={editingId !== null && editingId !== review._id}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={editingId !== null}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {myReviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Start by adding your first teacher review in the Reviews section!</p>
        </div>
      )}
    </div>
  )
}
