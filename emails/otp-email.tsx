import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface OTPEmailProps {
  name: string
  otp: string
  type: "registration" | "login" | "password-reset"
}

export default function OTPEmail({ name, otp, type }: OTPEmailProps) {
  const getTitle = () => {
    switch (type) {
      case "registration":
        return "Complete Your KIITease Registration"
      case "login":
        return "Your KIITease Login Code"
      case "password-reset":
        return "Reset Your KIITease Password"
      default:
        return "Your KIITease Verification Code"
    }
  }

  const getMessage = () => {
    switch (type) {
      case "registration":
        return "Welcome to KIITease! Use this code to complete your registration:"
      case "login":
        return "Use this code to log into your KIITease account:"
      case "password-reset":
        return "Use this code to reset your KIITease password:"
      default:
        return "Your verification code:"
    }
  }

  return (
    <Html>
      <Head />
      <Preview>{getTitle()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={logo}>🎓 KIITease</Text>
          </Section>

          <Heading style={h1}>{getTitle()}</Heading>

          <Text style={text}>Hi {name},</Text>

          <Text style={text}>{getMessage()}</Text>

          <Section style={otpContainer}>
            <Text style={otpText}>{otp}</Text>
          </Section>

          <Text style={text}>
            This code will expire in <strong>10 minutes</strong> for your security.
          </Text>

          <Text style={text}>
            If you didn't request this code, please ignore this email or contact our support team.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The KIITease Team
          </Text>

          <Section style={footerSection}>
            <Text style={footerText}>
              This email was sent to you as part of your KIITease account security.
            </Text>
            <Link href="https://kiitease.com" style={link}>
              Visit KIITease
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const logoContainer: React.CSSProperties = {
  textAlign: "center",
  padding: "20px 0",
}

const logo: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a73e8",
  margin: "0",
}

const h1: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "normal",
  textAlign: "center",
  margin: "30px 0",
  padding: "0",
}

const text: React.CSSProperties = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left",
  padding: "0 40px",
}

const otpContainer: React.CSSProperties = {
  background: "#f4f4f4",
  borderRadius: "8px",
  margin: "30px 40px",
  padding: "20px",
  textAlign: "center",
}

const otpText: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#1a73e8",
  letterSpacing: "8px",
  margin: "0",
}

const footer: React.CSSProperties = {
  color: "#484848",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left",
  padding: "0 40px",
  marginTop: "30px",
}

const footerSection: React.CSSProperties = {
  textAlign: "center",
  marginTop: "40px",
  padding: "20px 40px",
  borderTop: "1px solid #eaeaea",
}

const footerText: React.CSSProperties = {
  color: "#9ca299",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 10px",
}

const link: React.CSSProperties = {
  color: "#1a73e8",
  fontSize: "14px",
  textDecoration: "underline",
}
