import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface PasswordResetEmailProps {
  name: string
  resetLink: string
}

export const PasswordResetEmail = ({ name, resetLink }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your EduPlatform password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50?text=EduPlatform"
            width="150"
            height="50"
            alt="EduPlatform"
            style={logo}
          />
          <Heading style={heading}>Password Reset Request 🔐</Heading>

          <Section style={section}>
            <Text style={text}>Dear {name},</Text>

            <Text style={text}>
              We received a request to reset your password for your EduPlatform account. If you didn't make this
              request, you can safely ignore this email.
            </Text>

            <Text style={text}>To reset your password, click the button below. This link will expire in 1 hour.</Text>

            <Section style={buttonContainer}>
              <Link style={button} href={resetLink}>
                Reset Password
              </Link>
            </Section>

            <Text style={text}>
              If the button above doesn't work, you can also copy and paste the following link into your browser:
            </Text>

            <Text style={linkContainer}>
              <Link href={resetLink} style={textLink}>
                {resetLink}
              </Link>
            </Text>

            <Section style={securityBox}>
              <Text style={securityTitle}>🔒 Security Information:</Text>
              <Text style={securityText}>• This link will expire in 1 hour for your security</Text>
              <Text style={securityText}>• The link can only be used once</Text>
              <Text style={securityText}>• If you didn't request this, please contact support</Text>
              <Text style={securityText}>• Never share this link with anyone</Text>
            </Section>
          </Section>

          <Text style={text}>
            If you didn't request a password reset, please contact our support team immediately at{" "}
            <Link href="mailto:support@eduplatform.com" style={textLink}>
              support@eduplatform.com
            </Link>
            .
          </Text>

          <Text style={text}>
            Best regards,
            <br />
            The EduPlatform Security Team
          </Text>

          <Text style={footer}>
            © 2024 EduPlatform. All rights reserved.
            <br />
            This is an automated security email. Please do not reply to this message.
            <br />
            <Link href="https://eduplatform.vercel.app/terms" style={footerLink}>
              Terms of Service
            </Link>{" "}
            •{" "}
            <Link href="https://eduplatform.vercel.app/privacy" style={footerLink}>
              Privacy Policy
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  maxWidth: "600px",
  marginTop: "20px",
  marginBottom: "20px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
}

const logo = {
  margin: "0 auto",
  marginBottom: "20px",
  display: "block",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  color: "#4f46e5",
}

const section = {
  margin: "30px 0",
}

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "16px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
}

const linkContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "6px",
  padding: "12px",
  marginBottom: "24px",
  wordBreak: "break-all" as const,
  border: "1px solid #e5e7eb",
}

const textLink = {
  color: "#4f46e5",
  textDecoration: "underline",
}

const securityBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
  padding: "16px",
  marginTop: "24px",
  border: "1px solid #fde68a",
}

const securityTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#92400e",
  marginTop: "0",
  marginBottom: "8px",
}

const securityText = {
  fontSize: "14px",
  color: "#92400e",
  marginBottom: "4px",
  lineHeight: "20px",
}

const footer = {
  fontSize: "14px",
  color: "#898989",
  textAlign: "center" as const,
  marginTop: "40px",
  paddingTop: "20px",
  borderTop: "1px solid #e5e7eb",
}

const footerLink = {
  color: "#898989",
  textDecoration: "underline",
  margin: "0 5px",
}
