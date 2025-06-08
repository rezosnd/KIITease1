"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: FileText,
      content: `By accessing and using KIITease, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
    },
    {
      title: "2. Use License",
      icon: Shield,
      content: `Permission is granted to temporarily download one copy of the materials on KIITease for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
      • Modify or copy the materials
      • Use the materials for any commercial purpose or for any public display
      • Attempt to reverse engineer any software contained on the website
      • Remove any copyright or other proprietary notations from the materials`,
    },
    {
      title: "3. Payment Terms",
      icon: CreditCard,
      content: `• Premium subscription costs ₹499 for lifetime access
      • All payments are processed securely through Razorpay
      • Refunds are available only through our referral program (20 successful referrals)
      • No refunds for partial usage or dissatisfaction
      • Prices may change with 30 days notice`,
    },
    {
      title: "4. Referral Program",
      icon: Users,
      content: `• Earn ₹50 for each successful referral (10% of ₹499)
      • Referral rewards are credited instantly upon payment
      • After 20 successful referrals, you become eligible for a full refund
      • Referral codes are unique and non-transferable
      • Fraudulent referrals will result in account termination`,
    },
    {
      title: "5. User Responsibilities",
      icon: AlertTriangle,
      content: `Users are responsible for:
      • Maintaining the confidentiality of their account
      • All activities that occur under their account
      • Ensuring all information provided is accurate
      • Not sharing premium content with non-premium users
      • Reporting any security vulnerabilities or bugs`,
    },
    {
      title: "6. Content Policy",
      icon: FileText,
      content: `• All study materials are for educational purposes only
      • Users may not redistribute or sell premium content
      • Teacher reviews must be honest and constructive
      • Inappropriate content will be removed without notice
      • Copyright infringement is strictly prohibited`,
    },
    {
      title: "7. Privacy Policy",
      icon: Shield,
      content: `• We collect minimal personal information required for service
      • Email addresses are used for authentication and notifications
      • Payment information is processed securely by Razorpay
      • We do not sell or share personal data with third parties
      • Users can request data deletion at any time`,
    },
    {
      title: "8. Support & Disputes",
      icon: Users,
      content: `• Premium users get 24/7 live support access
      • Free users get email support within 48 hours
      • All disputes should be reported through our support system
      • We aim to resolve all issues within 24-48 hours
      • Escalation to admin is available for complex issues`,
    },
    {
      title: "9. Termination",
      icon: AlertTriangle,
      content: `We may terminate or suspend access immediately, without prior notice, for:
      • Breach of Terms and Conditions
      • Fraudulent activity or payment disputes
      • Sharing premium content inappropriately
      • Abusive behavior towards other users or staff
      • Violation of academic integrity`,
    },
    {
      title: "10. Limitation of Liability",
      icon: Shield,
      content: `KIITease shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your use of the service.`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
                <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Introduction */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Welcome to KIITease</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">
                These terms and conditions outline the rules and regulations for the use of KIITease, your gateway to
                KIIT academic excellence. By using our platform, you agree to these terms in full.
              </p>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <section.icon className="h-6 w-6 text-blue-600" />
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line text-gray-700">{section.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Contact Information */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-green-700 space-y-2">
                <p>
                  <strong>Email:</strong> support@kiitease.com
                </p>
                <p>
                  <strong>Support Hours:</strong> 24/7 for Premium Users, 9 AM - 6 PM for Free Users
                </p>
                <p>
                  <strong>Address:</strong> KIIT University, Bhubaneswar, Odisha, India
                </p>
                <p className="text-sm mt-4">
                  If you have any questions about these Terms and Conditions, please contact us through our support
                  system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agreement */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-yellow-800 text-center">
                By continuing to use KIITease, you acknowledge that you have read, understood, and agree to be bound by
                these Terms and Conditions.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
