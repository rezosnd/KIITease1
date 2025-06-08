"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send, Settings } from "lucide-react"

export default function AdminEmailSettings() {
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromName: "EduPlatfor",
    fromEmail: "",
  })
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const { toast } = useToast()

  // Optionally: Load saved settings when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/email-settings")
        if (res.ok) {
          const data = await res.json()
          setEmailSettings(data)
        }
      } catch (e) {
        // Ignore error, use defaults
      }
    }
    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailSettings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email settings saved successfully",
        })
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: data.error || "Failed to save email settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      })
      return
    }

    setTestLoading(true)
    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailSettings,
          email: testEmail,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test email sent successfully",
        })
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: data.error || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Email Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>Configure email server settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                type="email"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                autoComplete="new-password"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Test Email
            </CardTitle>
            <CardDescription>Send a test email to verify configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                autoComplete="off"
              />
            </div>

            <Button onClick={handleSendTestEmail} disabled={testLoading || !testEmail} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {testLoading ? "Sending..." : "Send Test Email"}
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Gmail Setup Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Enable 2-Factor Authentication on your Gmail account</li>
                <li>Go to Google Account Settings → Security → App passwords</li>
                <li>Generate an app password for "Mail"</li>
                <li>Use the 16-character app password in SMTP Password field</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
