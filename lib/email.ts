import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import { WelcomeEmail } from "@/emails/welcome-email"
import { PaymentSuccessEmail } from "@/emails/payment-success-email"
import { PaymentFailedEmail } from "@/emails/payment-failed-email"
import { ReferralMilestoneEmail } from "@/emails/referral-milestone-email"
import { PasswordResetEmail } from "@/emails/password-reset-email"

// Create reusable transporter with Gmail
const createTransporter = async () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // App password, not regular password
    },
    secure: true,
  })

  return transporter
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const transporter = await createTransporter()

    const info = await transporter.sendMail({
      from: `"EduPlatform" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text alternative
    })

    console.log(`Email sent: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error }
  }
}

// Email sending functions with React Email templates
export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const html = render(WelcomeEmail({ name: user.name }))
  return sendEmail({
    to: user.email,
    subject: "Welcome to EduPlatform! 🎓",
    html,
  })
}

export async function sendPaymentSuccessEmail(user: { name: string; email: string }, amount: number) {
  const html = render(PaymentSuccessEmail({ name: user.name, amount }))
  return sendEmail({
    to: user.email,
    subject: "Payment Successful! ✅",
    html,
  })
}

export async function sendPaymentFailedEmail(user: { name: string; email: string }, amount: number) {
  const html = render(PaymentFailedEmail({ name: user.name, amount }))
  return sendEmail({
    to: user.email,
    subject: "Payment Failed ❌",
    html,
  })
}

export async function sendReferralMilestoneEmail(user: { name: string; email: string }, count: number) {
  const html = render(ReferralMilestoneEmail({ name: user.name, count }))
  return sendEmail({
    to: user.email,
    subject: "Congratulations! Referral Milestone Achieved 🎉",
    html,
  })
}

export async function sendPasswordResetEmail(user: { name: string; email: string }, resetLink: string) {
  const html = render(PasswordResetEmail({ name: user.name, resetLink }))
  return sendEmail({
    to: user.email,
    subject: "Password Reset Request 🔐",
    html,
  })
}
