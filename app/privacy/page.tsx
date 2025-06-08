"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Cookie } from "lucide-react"

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: `We collect the following information:
• Personal Information: Name, email address, academic details (branch, year)
• Account Information: Login credentials, referral codes
• Payment Information: Processed securely through Razorpay (we don't store card details)
• Usage Data: How you interact with our platform
• Device Information: Browser type, IP address, device identifiers`,
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: `Your information is used to:
• Provide and maintain our services
• Process payments and manage subscriptions
• Send important notifications and updates
• Improve our platform and user experience
• Provide customer support
• Prevent fraud and ensure security`,
    },
    {
      title: "Information Sharing",
      icon: Shield,
      content: `We do not sell, trade, or rent your personal information. We may share information only:
• With Razorpay for payment processing
• With Google for OAuth authentication (if you choose)
• When required by law or legal process
• To protect our rights and prevent fraud
• With your explicit consent`,
    },
    {
      title: "Data Security",
      icon: Lock,
      content: `We implement security measures including:
• Encrypted data transmission (HTTPS)
• Secure password hashing (bcrypt)
• Regular security audits and monitoring
• Limited access to personal data
• Secure cloud infrastructure (MongoDB Atlas)`,
    },
    {
      title: "Cookies and Tracking",
      icon: Cookie,
      content: `We use cookies for:
• Authentication and session management
• Remembering your preferences
• Analytics to improve our service
• Security and fraud prevention
You can control cookies through your browser settings.`,
    },
    {
      title: "Your Rights",
      icon: Shield,
      content: `You have the right to:
• Access your personal data
• Correct inaccurate information
• Delete your account and data
• Export your data
• Opt-out of marketing communications
• File complaints with data protection authorities`,
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
                <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
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
              <CardTitle className="text-blue-800">Your Privacy Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">
                At KIITease, we are committed to protecting your privacy and ensuring the security of your personal
                information. This policy explains how we collect, use, and protect your data.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
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

          {/* Contact for Privacy */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Privacy Questions?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-green-700">
                <p>
                  If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> privacy@kiitease.com
                </p>
                <p>
                  <strong>Support:</strong> Available 24/7 for Premium Users
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
