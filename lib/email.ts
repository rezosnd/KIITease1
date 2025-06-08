import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import { WelcomeEmail } from "@/emails/welcome-email"
import { PaymentSuccessEmail } from "@/emails/payment-success-email"
import { PaymentFailedEmail } from "@/emails/payment-failed-email"
import { ReferralMilestoneEmail } from "@/emails/referral-milestone-email"
import { PasswordResetEmail } from "@/emails/password-reset-email"

type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  attachments?: any[]
}

// Create reusable transporter with Gmail SMTP (App Password required)
const createTransporter = async () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    secure: true,
  })
  // Optionally verify connection here if desired (await transporter.verify())
  return transporter
}

/**
 * Send a single email.
 */
export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: SendEmailOptions) {
  try {
    const transporter = await createTransporter()
    const mailOptions = {
      from: `"EduPlatform" <${process.env.GMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ""), // Fallback plain text
      attachments,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`📧 Email sent: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("❌ Email sending failed:", error)
    return { success: false, error: error.message || error }
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
