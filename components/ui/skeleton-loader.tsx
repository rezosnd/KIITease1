"use client"

import { motion } from "framer-motion"

interface SkeletonLoaderProps {
  className?: string
  count?: number
}

export function SkeletonLoader({ className = "h-4 w-full", count = 1 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`bg-gray-200 rounded animate-pulse ${className}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: i * 0.1 }}
        />
      ))}
    </div>
  )
}
