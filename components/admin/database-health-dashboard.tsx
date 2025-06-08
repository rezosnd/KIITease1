"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Database, Shield, CreditCard, AlertTriangle, CheckCircle } from "lucide-react"
import type { DatabaseHealth } from "@/lib/database-health"

export default function DatabaseHealthDashboard() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<string>("")

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/database-health")
      if (response.ok) {
        const data = await response.json()
        setHealth(data.health)
        setLastChecked(data.timestamp)
      }
    } catch (error) {
      console.error("Failed to check database health:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Database className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load database health information</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(health.status)}
              <CardTitle>Database Health Status</CardTitle>
            </div>
            <Button onClick={checkHealth} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <CardDescription>Last checked: {new Date(lastChecked).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`} />
            <span className="font-medium capitalize">{health.status}</span>
          </div>
        </CardContent>
      </Card>

      {/* Collections Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Collections Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.collections.map((collection) => (
              <div key={collection.name} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{collection.name}</span>
                  <Badge
                    variant={
                      collection.status === "ok"
                        ? "default"
                        : collection.status === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {collection.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Documents: {collection.documentCount.toLocaleString()}</div>
                  <div>Indexes: {collection.indexCount}</div>
                  <div>Avg Size: {Math.round(collection.avgDocumentSize)} bytes</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Integrity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment System Integrity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Integrity Score</span>
              <span className="font-medium">{health.paymentIntegrity.integrityScore}%</span>
            </div>
            <Progress value={health.paymentIntegrity.integrityScore} className="w-full" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{health.paymentIntegrity.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{health.paymentIntegrity.completedPayments}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{health.paymentIntegrity.failedPayments}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{health.paymentIntegrity.orphanedRecords}</div>
                <div className="text-sm text-gray-600">Orphaned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Security Score</span>
              <span className="font-medium">{Math.round(health.securityStatus.securityScore)}%</span>
            </div>
            <Progress value={health.securityStatus.securityScore} className="w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Authentication Methods</h4>
                <div className="space-y-1">
                  {health.securityStatus.authMethods.map((method) => (
                    <Badge key={method} variant="outline">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Security Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logging</span>
                    <Badge variant={health.securityStatus.auditLogging ? "default" : "secondary"}>
                      {health.securityStatus.auditLogging ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate Limiting</span>
                    <Badge variant={health.securityStatus.rateLimiting ? "default" : "secondary"}>
                      {health.securityStatus.rateLimiting ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OTP Security</span>
                    <Badge variant={health.securityStatus.otpSecurity ? "default" : "secondary"}>
                      {health.securityStatus.otpSecurity ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
