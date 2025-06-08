"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  className?: string
}

export function OTPInput({ length = 6, onComplete, className }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(() => Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Helper for moving focus
  const focusInput = (idx: number) => {
    inputRefs.current[idx]?.focus()
    inputRefs.current[idx]?.select()
  }

  const handleChange = (index: number, value: string) => {
    if (value && isNaN(Number(value))) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Move to next input if a number is entered
    if (value && index < length - 1) {
      focusInput(index + 1)
    }

    // Complete if every field has a digit
    if (newOtp.every((digit) => digit && !isNaN(Number(digit)))) {
      onComplete(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      } else if (index > 0) {
        // Move to previous
        focusInput(index - 1)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1)
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pasteData) return

    const pasteArr = pasteData.split("")
    const newOtp = [...otp]
    for (let i = 0; i < pasteArr.length && i < length; i++) {
      newOtp[i] = pasteArr[i]
    }
    setOtp(newOtp)
    focusInput(Math.min(pasteArr.length, length - 1))

    if (pasteArr.length === length) {
      onComplete(pasteArr.join(""))
    }
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold tracking-widest"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
