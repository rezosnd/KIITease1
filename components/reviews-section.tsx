"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Star, Search, Filter, Plus, User, MessageSquare } from "lucide-react"

interface Review {
  _id: string
  teacherName: string
  subject: string
  branch: string
  rating: number
  comment: string
  reviewedBy: string
  reviewedAt: string
  helpful: number
}

interface ReviewsSectionProps {
  user: any
}

export default function ReviewsSection({ user }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    teacherName: "",
    subject: "",
    branch: user.branch || "",
    rating: 5,
    comment: "",
  })
  const { toast } = useToast()

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "EEE", "CSSE", "CSCE"]

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    filterReviews()
    // eslint-disable-next-line
  }, [reviews, searchTerm, selectedBranch, selectedRating])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reviews")
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
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

  const filterReviews = () => {
    let filtered = reviews

    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedBranch !== "all") {
      filtered = filtered.filter((review) => review.branch === selectedBranch)
    }

    if (selectedRating !== "all") {
      filtered = filtered.filter((review) => review.rating === Number.parseInt(selectedRating))
    }

    setFilteredReviews(filtered)
  }

  const handleSubmitReview = async () => {
    if (!newReview.teacherName || !newReview.subject || !newReview.comment) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Review submitted successfully",
        })
        setShowAddReview(false)
        setNewReview({
          teacherName: "",
          subject: "",
          branch: user.branch || "",
          rating: 5,
          comment: "",
        })
        fetchReviews()
      } else {
        throw new Error("Failed to submit review")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    )
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Reviews</h2>
          <p className="text-gray-600">Read authentic reviews from fellow KIIT students</p>
        </div>
        <Button onClick={() => setShowAddReview(!showAddReview)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {showAddReview ? "Cancel" : "Add Review"}
        </Button>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Add Teacher Review</CardTitle>
              <CardDescription>Share your experience to help fellow students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacherName">Teacher Name *</Label>
                  <Input
                    id="teacherName"
                    value={newReview.teacherName}
                    onChange={(e) => setNewReview({ ...newReview, teacherName: e.target.value })}
                    placeholder="e.g., Dr. John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={newReview.subject}
                    onChange={(e) => setNewReview({ ...newReview, subject: e.target.value })}
                    placeholder="e.g., Data Structures"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={newReview.branch}
                    onValueChange={(value) => setNewReview({ ...newReview, branch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating">Rating *</Label>
                  <div className="pt-2">
                    {renderStars(newReview.rating, true, (rating) => setNewReview({ ...newReview, rating }))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Review Comment *</Label>
                <Textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this teacher..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmitReview} className="w-full">
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search teachers or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="branch-filter">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rating-filter">Rating</Label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger>
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedBranch("all")
                  setSelectedRating("all")
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
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
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{review.branch}</Badge>
                    <Badge variant="outline">
                      <User className="h-3 w-3 mr-1" />
                      {review.reviewedBy}
                    </Badge>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{new Date(review.reviewedAt).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{review.helpful} helpful</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or be the first to add a review!</p>
        </div>
      )}
    </div>
  )
}
