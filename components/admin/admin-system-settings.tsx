"use client"

import { useState } from "react"
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
  const { toast } = useToast()

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
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </Button>

            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Optimize Database
            </Button>

            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Database Status:</h4>
              <p className="text-sm text-blue-700">Connected to MongoDB. Last backup: Never</p>
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
