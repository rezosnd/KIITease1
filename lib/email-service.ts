import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/welcome-email";
import { PaymentSuccessEmail } from "@/emails/payment-success-email";
import { PaymentFailedEmail } from "@/emails/payment-failed-email";
import { ReferralMilestoneEmail } from "@/emails/referral-milestone-email";
import { PasswordResetEmail } from "@/emails/password-reset-email";
import { BulkAnnouncementEmail } from "@/emails/bulk-announcement-email";
import { getDatabase } from "@/lib/mongodb";

// Check for required environment variables
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Nodemailer transporter factory
const createTransporter = async () => {
  const GMAIL_USER = getEnvVar("GMAIL_USER");
  const GMAIL_APP_PASSWORD = getEnvVar("GMAIL_APP_PASSWORD");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
    secure: true,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
  });

  // Optionally verify transporter
  try {
    await transporter.verify();
    console.log("✅ Email transporter verified successfully");
    return transporter;
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error);
    throw error;
  }
};

// Log email activity to database
async function logEmailSent({
  recipients,
  subject,
  messageId,
  status,
  error = null,
}: {
  recipients: string[];
  subject: string;
  messageId: string | null;
  status: "sent" | "failed";
  error?: string | null;
}) {
  try {
    const db = await getDatabase();
    await db.collection("email_logs").insertOne({
      recipients,
      subject,
      messageId,
      status,
      error,
      sentAt: new Date(),
    });
  } catch (logError) {
    console.error("Failed to log email:", logError);
  }
}

// Send a single email
export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: any[];
}) {
  try {
    const transporter = await createTransporter();
    const GMAIL_USER = getEnvVar("GMAIL_USER");

    const mailOptions = {
      from: `"EduPlatform" <${GMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ""), // Fallback plain text
      attachments,
      headers: {
        "X-Mailer": "EduPlatform",
        "X-Priority": "3",
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully: ${info.messageId}`);

    await logEmailSent({
      recipients: Array.isArray(to) ? to : [to],
      subject,
      messageId: info.messageId,
      status: "sent",
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("❌ Email sending failed:", error);

    await logEmailSent({
      recipients: Array.isArray(to) ? to : [to],
      subject,
      messageId: null,
      status: "failed",
      error: error.message,
    });

    return { success: false, error: error.message || error };
  }
}

// Bulk email sending with batching and rate limiting
export async function sendBulkEmails({
  recipients,
  subject,
  htmlTemplate,
  batchSize = 50,
  delayBetweenBatches = 5000,
}: {
  recipients: Array<{ email: string; name: string; [key: string]: any }>;
  subject: string;
  htmlTemplate: (data: any) => string;
  batchSize?: number;
  delayBetweenBatches?: number;
}) {
  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    console.log(
      `📧 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        recipients.length / batchSize
      )}`
    );

    const batchPromises = batch.map(async (recipient) => {
      try {
        const html = htmlTemplate(recipient);
        const result = await sendEmail({
          to: recipient.email,
          subject,
          html,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({ email: recipient.email, error: result.error });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({ email: recipient.email, error: error.message || error });
      }
    });

    await Promise.all(batchPromises);

    if (i + batchSize < recipients.length) {
      console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  console.log(`✅ Bulk email completed: ${results.sent} sent, ${results.failed} failed`);
  return results;
}

// Individual email functions (add more as needed)
export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const html = render(WelcomeEmail({ name: user.name }));
  return sendEmail({
    to: user.email,
    subject: "Welcome to EduPlatform! 🎓",
    html,
  });
}

export async function sendPaymentSuccessEmail(
  user: { name: string; email: string },
  amount: number
) {
  const html = render(PaymentSuccessEmail({ name: user.name, amount }));
  return sendEmail({
    to: user.email,
    subject: "Payment Successful! ✅",
    html,
  });
}

export async function sendPaymentFailedEmail(
  user: { name: string; email: string },
  amount: number
) {
  const html = render(PaymentFailedEmail({ name: user.name, amount }));
  return sendEmail({
    to: user.email,
    subject: "Payment Failed ❌",
    html,
  });
}

export async function sendReferralMilestoneEmail(
  user: { name: string; email: string },
  count: number
) {
  const html = render(ReferralMilestoneEmail({ name: user.name, count }));
  return sendEmail({
    to: user.email,
    subject: "Congratulations! Referral Milestone Achieved 🎉",
    html,
  });
}

export async function sendPasswordResetEmail(
  user: { name: string; email: string },
  resetLink: string
) {
  const html = render(PasswordResetEmail({ name: user.name, resetLink }));
  return sendEmail({
    to: user.email,
    subject: "Password Reset Request 🔐",
    html,
  });
}

// Mass announcement email to users by role
export async function sendAnnouncementToAll({
  title,
  message,
  targetAudience = "all", // "all", "free", "paid", "admin"
  includeAttachments = [],
}: {
  title: string;
  message: string;
  targetAudience?: string;
  includeAttachments?: any[];
}) {
  try {
    const db = await getDatabase();

    let query: any = {};
    if (targetAudience === "free") {
      query = { role: "free" };
    } else if (targetAudience === "paid") {
      query = { role: "paid" };
    } else if (targetAudience === "admin") {
      query = { role: "admin" };
    }

    const users = await db.collection("users").find(query).toArray();

    if (users.length === 0) {
      return { success: false, error: "No users found for the target audience" };
    }

    const recipients = users.map((user: any) => ({
      email: user.email,
      name: user.name,
      role: user.role,
    }));

    const results = await sendBulkEmails({
      recipients,
      subject: title,
      htmlTemplate: (recipient) =>
        render(
          BulkAnnouncementEmail({
            name: recipient.name,
            title,
            message,
          })
        ),
    });

    await db.collection("announcements").insertOne({
      title,
      message,
      targetAudience,
      totalRecipients: users.length,
      sentCount: results.sent,
      failedCount: results.failed,
      createdAt: new Date(),
    });

    return {
      success: true,
      totalRecipients: users.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    };
  } catch (error: any) {
    console.error("Mass announcement failed:", error);
    return { success: false, error: error.message || error };
  }
}
