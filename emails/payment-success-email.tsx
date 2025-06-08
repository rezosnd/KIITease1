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

interface PaymentSuccessEmailProps {
  name: string
  amount: number
}

export const PaymentSuccessEmail = ({ name, amount }: PaymentSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your payment was successful! Welcome to EduPlatform Premium</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50?text=EduPlatform"
            width="150"
            height="50"
            alt="EduPlatform"
            style={logo}
          />
          <Heading style={heading}>Payment Successful!</Heading>

          <Section style={successBox}>
            <Text style={successText}>
              <span style={checkmark as React.CSSProperties}>✓</span> Payment of ₹{amount} has been processed successfully
            </Text>
          </Section>

          <Section style={section}>
            <Text style={text}>Dear {name},</Text>

            <Text style={text}>
              Thank you for upgrading to EduPlatform Premium! Your payment has been successfully processed, and you now
              have full access to all our premium features.
            </Text>

            <Text style={subheading}>You now have access to:</Text>

            <Text style={listItem}>• All study notes for your branch and year</Text>
            <Text style={listItem}>• Complete teacher reviews and ratings</Text>
            <Text style={listItem}>• Unlimited downloads of study materials</Text>
            <Text style={listItem}>• AI-powered analytics and insights</Text>
            <Text style={listItem}>• Priority support</Text>

            <Text style={text}>
              Your premium access has been activated immediately. You can start exploring all the premium content right
              away!
            </Text>

            <Section style={buttonContainer}>
              <Link style={button} href="https://eduplatform.vercel.app/dashboard">
                Go to Dashboard
              </Link>
            </Section>
          </Section>

          <Text style={text}>
            If you have any questions about your payment or need assistance with your premium features, please don't
            hesitate to contact our support team.
          </Text>

          <Text style={text}>
            Best regards,
            <br />
            The EduPlatform Team
          </Text>

          <Text style={footer}>
            © 2024 EduPlatform. All rights reserved.
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
const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
  color: "#10b981",
}

const section: React.CSSProperties = {
  margin: "30px 0",
}

const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "16px",
}

const subheading: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333",
  marginTop: "25px",
  marginBottom: "10px",
}

const listItem: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  marginBottom: "8px",
  paddingLeft: "10px",
}

const successBox: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "30px",
  border: "1px solid #d1fae5",
}

const successText: React.CSSProperties = {
  fontSize: "16px",
  color: "#047857",
  margin: "0",
  textAlign: "center",
}

const checkmark: React.CSSProperties = {
  fontSize: "20px",
  marginRight: "8px",
}

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "30px 0",
}

const button: React.CSSProperties = {
  backgroundColor: "#10b981",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 24px",
}

const footer: React.CSSProperties = {
  fontSize: "14px",
  color: "#898989",
  textAlign: "center",
  marginTop: "30px",
}

const footerLink: React.CSSProperties = {
  color: "#898989",
  textDecoration: "underline",
  margin: "0 5px",
}
