"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Settings, Database, Shield, Zap } from "lucide-react"

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "KIITease",
    siteDescription: "Your Gateway to KIIT Academic Excellence",
    maintenanceMode: false,
    registrationEnabled: true,
    paymentEnabled: true,
    referralEnabled: true,
    maxFileSize: "10",
    allowedFileTypes: "pdf,doc,docx,ppt,pptx",
    razorpayKeyId: "",
    razorpayKeySecret: "",
  })
  const [loading, setLoading] = useState(false)
  const [dbAction, setDbAction] = useState("")
  const [dbStatus, setDbStatus] = useState("Connected to MongoDB. Last backup: Never")
  const { toast } = useToast()

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/system-settings")
      if (!response.ok) throw new Error("Failed to load settings")
      const data = await response.json()
      if (data.settings) setSettings(data.settings)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "System settings saved successfully",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Database management actions (backup/optimize/clear cache)
  const handleDbAction = async (action: "backup" | "optimize" | "clear") => {
    setDbAction(action)
    try {
      const response = await fetch(`/api/admin/database?action=${action}`, { method: "POST" })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || `Database ${action} successful`,
        })
        if (action === "backup" && data.lastBackup) {
          setDbStatus(`Connected to MongoDB. Last backup: ${data.lastBackup}`)
        }
      } else {
        throw new Error(data.error || `Failed to ${action} database`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} database`,
        variant: "destructive",
      })
    } finally {
      setDbAction("")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="registrationEnabled">Registration Enabled</Label>
              <Switch
                id="registrationEnabled"
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Feature Settings
            </CardTitle>
            <CardDescription>Enable/disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="paymentEnabled">Payment System</Label>
              <Switch
                id="paymentEnabled"
                checked={settings.paymentEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, paymentEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="referralEnabled">Referral System</Label>
              <Switch
                id="referralEnabled"
                checked={settings.referralEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, referralEnabled: checked })}
              />
            </div>

            <div>
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
              <Input
                id="allowedFileTypes"
                placeholder="pdf,doc,docx,ppt,pptx"
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Payment Configuration
            </CardTitle>
            <CardDescription>Razorpay payment gateway settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
              <Input
                id="razorpayKeyId"
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
              <Input
                id="razorpayKeySecret"
                type="password"
                value={settings.razorpayKeySecret}
                onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Security Note:</h4>
              <p className="text-sm text-yellow-700">
                Keep your Razorpay credentials secure. Never share them publicly or commit them to version control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>Database maintenance and backup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDbAction("backup")}
              disabled={dbAction === "backup"}
            >
              <Database className="h-4 w-4 mr-2" />
              {dbAction === "backup" ? "Backing up..." : "Backup Database"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDbAction("optimize")}
              disabled={dbAction === "optimize"}
            >
              <Database className="h-4 w-4 mr-2" />
              {dbAction === "optimize" ? "Optimizing..." : "Optimize Database"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDbAction("clear")}
              disabled={dbAction === "clear"}
            >
              <Database className="h-4 w-4 mr-2" />
              {dbAction === "clear" ? "Clearing..." : "Clear Cache"}
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Database Status:</h4>
              <p className="text-sm text-blue-700">{dbStatus}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSaveSettings} disabled={loading} className="w-full" size="lg">
            {loading ? "Saving..." : "Save All Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
