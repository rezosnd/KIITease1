import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KIITease - Study Notes & Reviews for KIIT Students",
  description: "Access quality study notes and teacher reviews for KIIT University students",
  keywords: "KIIT, study notes, teacher reviews, engineering, education, CSE, ECE, ME, CE, EE, IT, KIITease",
  authors: [{ name: "KIITease Team" }],
  creator: "KIITease",
  publisher: "KIITease",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kiitease.vercel.app",
    title: "KIITease - Your Gateway to KIIT Academic Excellence",
    description: "Access premium study notes and authentic teacher reviews for KIIT University",
    siteName: "KIITease",
  },
  twitter: {
    card: "summary_large_image",
    title: "KIITease - Study Notes & Reviews for KIIT Students",
    description: "Access quality study notes and teacher reviews for KIIT University",
    creator: "@kiitease",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#4f46e5",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
