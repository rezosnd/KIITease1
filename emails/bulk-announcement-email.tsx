import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface BulkAnnouncementEmailProps {
  name: string
  title: string
  message: string
}

export const BulkAnnouncementEmail = ({
  name,
  title,
  message,
}: BulkAnnouncementEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title} - Important announcement from EduPlatform</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50?text=EduPlatform"
            width="150"
            height="50"
            alt="EduPlatform"
            style={logo}
          />

          <Heading style={heading}>{title}</Heading>

          <Section style={announcementBox}>
            <Text style={announcementIcon}>📢</Text>
            <Text style={announcementLabel}>Important Announcement</Text>
          </Section>

          <Section style={section}>
            <Text style={greeting}>Dear {name},</Text>

            <Text style={messageText}>{message}</Text>

            <Section style={buttonContainer}>
              <Link
                style={button}
                href="https://eduplatform.vercel.app/dashboard"
              >
                Go to Dashboard
              </Link>
            </Section>
          </Section>

          <Section style={infoBox}>
            <Text style={infoTitle}>📚 Quick Links:</Text>
            <Text style={infoItem}>
              •{" "}
              <Link
                href="https://eduplatform.vercel.app/dashboard"
                style={infoLink}
              >
                Dashboard
              </Link>
            </Text>
            <Text style={infoItem}>
              •{" "}
              <Link
                href="https://eduplatform.vercel.app/notes"
                style={infoLink}
              >
                Study Notes
              </Link>
            </Text>
            <Text style={infoItem}>
              •{" "}
              <Link
                href="https://eduplatform.vercel.app/reviews"
                style={infoLink}
              >
                Teacher Reviews
              </Link>
            </Text>
            <Text style={infoItem}>
              •{" "}
              <Link
                href="https://eduplatform.vercel.app/support"
                style={infoLink}
              >
                Support
              </Link>
            </Text>
          </Section>

          <Text style={text}>
            If you have any questions, feel free to contact our support team.
          </Text>

          <Text style={text}>
            Best regards,
            <br />
            The EduPlatform Team
          </Text>

          <Text style={footer}>
            © 2024 EduPlatform. All rights reserved.
            <br />
            <Link
              href="https://eduplatform.vercel.app/unsubscribe"
              style={footerLink}
            >
              Unsubscribe
            </Link>{" "}
            •{" "}
            <Link
              href="https://eduplatform.vercel.app/privacy"
              style={footerLink}
            >
              Privacy Policy
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  maxWidth: "600px",
  marginTop: "20px",
  marginBottom: "20px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
}

const logo: React.CSSProperties = {
  margin: "0 auto",
  marginBottom: "20px",
  display: "block",
}

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
  margin: "30px 0",
  color: "#4f46e5",
}

const section: React.CSSProperties = {
  margin: "30px 0",
}

const greeting: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "20px",
}

const messageText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "24px",
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
}

const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "16px",
}

const announcementBox: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "30px",
  border: "1px solid #dbeafe",
  textAlign: "center",
}

const announcementIcon: React.CSSProperties = {
  fontSize: "24px",
  margin: "0",
}

const announcementLabel: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#1e40af",
  margin: "5px 0 0 0",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
}

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "30px 0",
}

const button: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "14px 28px",
  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
}

const infoBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "6px",
  padding: "16px",
  marginTop: "24px",
  border: "1px solid #dcfce7",
}

const infoTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#166534",
  marginTop: "0",
  marginBottom: "8px",
}

const infoItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#166534",
  marginBottom: "4px",
  lineHeight: "20px",
}

const infoLink: React.CSSProperties = {
  color: "#166534",
  textDecoration: "underline",
}

const footer: React.CSSProperties = {
  fontSize: "14px",
  color: "#898989",
  textAlign: "center",
  marginTop: "40px",
  paddingTop: "20px",
  borderTop: "1px solid #e5e7eb",
}

const footerLink: React.CSSProperties = {
  color: "#898989",
  textDecoration: "underline",
  margin: "0 5px",
}
