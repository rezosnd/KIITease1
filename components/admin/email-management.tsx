"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface EmailStats {
  total: number
  sent: number
  failed: number
  successRate: string
}

interface RecentEmail {
  _id: string
  recipients: string[]
  subject: string
  status: "sent" | "failed"
  sentAt: string
  messageId?: string
  error?: string
}

interface Announcement {
  _id: string
  title: string
  message: string
  targetAudience: string
  totalRecipients: number
  sentCount: number
  failedCount: number
  createdAt: string
}

export function EmailManagement() {
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [recentEmails, setRecentEmails] = useState<RecentEmail[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetAudience, setTargetAudience] = useState("all")

  const { toast } = useToast()

  useEffect(() => {
    fetchEmailStats()
  }, [])

  const fetchEmailStats = async () => {
    try {
      const response = await fetch("/api/admin/email-stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setRecentEmails(data.recentEmails)
        setAnnouncements(data.announcements)
      }
    } catch (error) {
      console.error("Failed to fetch email stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/admin/send-announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          targetAudience,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: `Announcement sent to ${data.stats.sent} users successfully`,
        })

        // Reset form
        setTitle("")
        setMessage("")
        setTargetAudience("all")

        // Refresh stats
        fetchEmailStats()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send announcement",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading email management...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Email Management</h2>
      </div>

      {/* Email Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successfully Sent</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Announcement</TabsTrigger>
          <TabsTrigger value="history">Email History</TabsTrigger>
          <TabsTrigger value="announcements">Past Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Mass Announcement</CardTitle>
              <CardDescription>Send an announcement email to all users or specific groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Email Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="free">Free Users Only</SelectItem>
                    <SelectItem value="paid">Paid Users Only</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your announcement message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
              </div>

              <Button
                onClick={sendAnnouncement}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send Announcement"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
              <CardDescription>Latest emails sent from the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmails.map((email) => (
                  <div key={email._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-sm text-muted-foreground">To: {email.recipients.length} recipient(s)</p>
                      <p className="text-xs text-muted-foreground">{new Date(email.sentAt).toLocaleString()}</p>
                    </div>
                    <Badge variant={email.status === "sent" ? "default" : "destructive"}>{email.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Announcements</CardTitle>
              <CardDescription>History of mass announcements sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <Badge variant="outline">{announcement.targetAudience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📧 {announcement.sentCount} sent</span>
                      <span>❌ {announcement.failedCount} failed</span>
                      <span>👥 {announcement.totalRecipients} total</span>
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
