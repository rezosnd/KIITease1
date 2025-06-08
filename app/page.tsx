"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Star,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  FileText,
  Award,
  Zap,
  Mail,
  Shield,
  Info,
  Phone,
  ScrollText,
} from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          totalUsers: data.totalUsers,
          totalNotes: data.totalNotes,
          totalReviews: data.totalReviews,
          averageRating: data.averageRating,
        });
        setLoading(false);
      })
      .catch(() => {
        setStats({
          totalUsers: 0,
          totalNotes: 0,
          totalReviews: 0,
          averageRating: 0,
        });
        setLoading(false);
      });
  }, []);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Premium Study Notes",
      description: "Access high-quality study materials for all KIIT branches and years",
      color: "bg-blue-50",
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      title: "Teacher Reviews",
      description: "Read authentic reviews and ratings from fellow KIIT students",
      color: "bg-yellow-50",
    },
    {
      icon: <Award className="h-8 w-8 text-green-600" />,
      title: "Referral Rewards",
      description: "Earn rewards by referring friends and unlock premium features",
      color: "bg-green-50",
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations based on your academic needs",
      color: "bg-purple-50",
    },
  ];

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "ETC", "EEE", "CSSE", "CSCE"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KIITease
              </span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
              🎓 Trusted by {loading ? "..." : stats.totalUsers.toLocaleString()}+ KIIT Students
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Gateway to
              </span>
              <br />
              <span className="text-gray-900">KIIT Academic Excellence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Access premium study notes, authentic teacher reviews, and connect with fellow KIIT students. Everything
              you need to excel in your academic journey at KIIT University.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                >
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-2 hover:bg-gray-50">
                  Already a Member?
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Students", value: loading ? "..." : `${stats.totalUsers.toLocaleString()}+`, icon: <Users className="h-6 w-6" /> },
              { label: "Study Notes", value: loading ? "..." : `${stats.totalNotes.toLocaleString()}+`, icon: <FileText className="h-6 w-6" /> },
              { label: "Teacher Reviews", value: loading ? "..." : `${stats.totalReviews.toLocaleString()}+`, icon: <Star className="h-6 w-6" /> },
              { label: "Average Rating", value: loading ? "..." : `${stats.averageRating}★`, icon: <TrendingUp className="h-6 w-6" /> },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2 text-blue-600">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for KIIT Success</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources designed specifically for KIIT University students
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Supporting All KIIT Branches</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {branches.map((branch, index) => (
                <motion.div
                  key={branch}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-sm px-4 py-2 bg-white/80 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    {branch}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Excel at KIIT?</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of KIIT students who are already using KIITease to boost their academic performance
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Legal/Info Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/80 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <Info className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-bold text-lg mb-2">About Us</h3>
            <p className="text-gray-600 mb-2">
              KIITease is built by KIIT alumni and students who understand the academic needs of KIITians. Our mission is to empower you with the best resources for your success.
            </p>
            <Link href="/about" className="text-blue-600 hover:underline text-sm">
              Learn more
            </Link>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-bold text-lg mb-2">Privacy & Safety</h3>
            <p className="text-gray-600 mb-2">
              Your data is secure. Read our privacy policy to learn how we protect your information and keep your academic life safe.
            </p>
            <Link href="/privacy" className="text-blue-600 hover:underline text-sm">
              Privacy Policy
            </Link>
          </div>
          <div className="flex flex-col items-center text-center">
            <ScrollText className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-bold text-lg mb-2">Terms of Service</h3>
            <p className="text-gray-600 mb-2">
              By using KIITease, you agree to our community rules and fair use policy. Please read our terms for details.
            </p>
            <Link href="/terms" className="text-blue-600 hover:underline text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">KIITease</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering KIIT University students with premium study resources and authentic teacher reviews.
              </p>
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} KIITease. All rights reserved.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:support@kiitease.com" className="hover:text-white transition-colors flex items-center">
                    <Mail className="h-4 w-4 mr-2" /> support@kiitease.com
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors flex items-center">
                    <Shield className="h-4 w-4 mr-2" /> Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors flex items-center">
                    <ScrollText className="h-4 w-4 mr-2" /> Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors flex items-center">
                    <Phone className="h-4 w-4 mr-2" /> Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

