"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, X, Send, User, Bot, Clock, CheckCircle, Minimize2, Maximize2 } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "admin" | "bot"
  timestamp: Date
  status?: "sent" | "delivered" | "read"
}

interface LiveChatProps {
  user: {
    id: string
    role: "free" | "paid"
    name?: string
    email?: string
    [key: string]: any
  }
}

export default function LiveChat({ user }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [supportAgent, setSupportAgent] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Scroll chat to the bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Start chat when chat is opened and not yet connected
  const openChat = () => {
    setIsOpen(true)
    if (!isConnected) {
      initializeChat()
    }
  }

  // Initialize chat (creates ticket, sets welcome message)
  const initializeChat = async () => {
    try {
      const response = await fetch("/api/support/chat/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()
      if (data.success) {
        setTicketId(data.ticketId)
        setIsConnected(true)

        const welcomeMessage: Message = {
          id: "welcome",
          content:
            user.role === "paid"
              ? "Hello! You're connected to our 24/7 premium support. How can we help you today?"
              : "Hello! Thanks for contacting support. We'll respond within 24 hours. How can we help?",
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      } else {
        throw new Error("Failed to connect")
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to support. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Send user message to backend and show in chat
  const sendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    try {
      const response = await fetch("/api/support/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          message: userMessage.content,
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg))
        )

        // Simulate admin quick response for premium users if admin available
        if (user.role === "paid" && data.adminAvailable) {
          setTimeout(() => {
            const adminResponse: Message = {
              id: Date.now().toString() + "_admin",
              content: data.autoResponse || "Thank you for your message. An admin will respond shortly.",
              sender: "admin",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, adminResponse])
            setSupportAgent(data.adminName || "Support Team")
          }, 2000)
        }
      }
    } catch (error) {
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle Enter (without Shift) to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={openChat}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              size="sm"
              aria-label="Open live chat"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            {user.role === "paid" && (
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">24/7</Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "60px" : "500px",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-80"
          >
            <Card className="shadow-2xl border-0 bg-white">
              {/* Chat Header */}
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-sm">{user.role === "paid" ? "Premium Support" : "Support"}</CardTitle>
                      <div className="flex items-center space-x-1 text-xs opacity-90">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
                        <span>{isConnected ? "Connected" : "Connecting..."}</span>
                        {supportAgent && <span>• {supportAgent}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                    >
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      aria-label="Close chat"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Content */}
              {!isMinimized && (
                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-80 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.sender === "user"
                              ? "bg-blue-600 text-white"
                              : message.sender === "admin"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            {message.sender === "user" ? (
                              <User className="h-3 w-3" />
                            ) : message.sender === "admin" ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Bot className="h-3 w-3" />
                            )}
                            <span className="text-xs opacity-75">
                              {message.sender === "user" ? "You" : message.sender === "admin" ? "Admin" : "Bot"}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-75">
                              {message.timestamp instanceof Date
                                ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {message.sender === "user" && message.status && (
                              <div className="flex items-center space-x-1">
                                {message.status === "sent" && <Clock className="h-3 w-3 opacity-50" />}
                                {message.status === "delivered" && <CheckCircle className="h-3 w-3 opacity-50" />}
                                {message.status === "read" && <CheckCircle className="h-3 w-3 text-blue-400" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                        rows={1}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                        aria-label="Send message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {user.role !== "paid" && (
                      <p className="text-xs text-gray-500 mt-2">💡 Upgrade to Premium for 24/7 live support!</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
