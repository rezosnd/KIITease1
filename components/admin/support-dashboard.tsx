"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, CheckCircle, User, Send, RefreshCw } from "lucide-react"

interface SupportMessage {
  sender: "user" | "admin"
  content: string
  timestamp: string
}

interface SupportTicket {
  _id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "normal" | "high" | "urgent"
  category: string
  createdAt: string
  updatedAt: string
  messages: SupportMessage[]
  assignedAdmin?: string
}

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (priorityFilter !== "all") params.append("priority", priorityFilter)

      const response = await fetch(`/api/admin/support/tickets?${params}`)
      const data = await response.json()
      setTickets(data.tickets || [])
      // If the selected ticket is not in the new list, deselect
      if (selectedTicket && !data.tickets.some((t: SupportTicket) => t._id === selectedTicket._id)) {
        setSelectedTicket(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async () => {
    if (!newMessage.trim() || !selectedTicket) return

    setSending(true)
    try {
      const response = await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket._id,
          message: newMessage,
        }),
      })

      if (response.ok) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the user",
        })
        setNewMessage("")
        await fetchTickets()
        // Update selected ticket details
        const updatedResponse = await fetch(`/api/admin/support/tickets/${selectedTicket._id}`)
        const updatedData = await updatedResponse.json()
        setSelectedTicket(updatedData.ticket)
      } else {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send reply")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Ticket status changed to ${status}`,
        })
        await fetchTickets()
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: status as any })
        }
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: data.error || "Failed to update ticket status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Support Dashboard</h1>
        <Button onClick={fetchTickets} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-500 py-6">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No tickets found.</div>
            ) : (
              tickets.map((ticket) => (
                <motion.div key={ticket._id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-colors ${
                      selectedTicket?._id === ticket._id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">{ticket.userName}</span>
                        </div>
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                        <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{ticket.messages.length} messages</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Ticket #{selectedTicket._id.substring(0, 8)}</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedTicket.userName} ({selectedTicket.userEmail}) - {selectedTicket.userRole}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => updateTicketStatus(selectedTicket._id, value)}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {selectedTicket.messages.map((message, index) => (
                    <div key={index} className={`flex ${message.sender === "user" ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.sender === "user" ? "bg-gray-100 text-gray-800" : "bg-blue-600 text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">{new Date(message.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply */}
                <div className="space-y-4">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                  />
                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => updateTicketStatus(selectedTicket._id, "resolved")}
                        variant="outline"
                        size="sm"
                        disabled={updatingStatus}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    </div>
                    <Button onClick={sendReply} disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4 mr-2" />
                      {sending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
