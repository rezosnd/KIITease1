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

interface PaymentFailedEmailProps {
  name: string
  amount: number
}

export const PaymentFailedEmail = ({ name, amount }: PaymentFailedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your payment was unsuccessful. Here's what to do next.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50?text=EduPlatform"
            width="150"
            height="50"
            alt="EduPlatform"
            style={logo}
          />
          <Heading style={heading}>Payment Unsuccessful</Heading>

          <Section style={errorBox}>
            <Text style={errorText}>
              <span style={errorIcon as React.CSSProperties}>⚠️</span> Your payment of ₹{amount} could not be processed
            </Text>
          </Section>

          <Section style={section}>
            <Text style={text}>Dear {name},</Text>

            <Text style={text}>
              We're sorry to inform you that your recent payment attempt for EduPlatform Premium was unsuccessful. This
              could be due to one of the following reasons:
            </Text>

            <Text style={listItem}>• Insufficient funds in your account</Text>
            <Text style={listItem}>• Card expired or invalid card details</Text>
            <Text style={listItem}>• Bank declined the transaction</Text>
            <Text style={listItem}>• Network or connectivity issues during payment</Text>

            <Text style={text}>
              Don't worry! You can try again by visiting your dashboard and selecting the payment option.
            </Text>

            <Section style={buttonContainer}>
              <Link style={button} href="https://eduplatform.vercel.app/dashboard/payment">
                Try Payment Again
              </Link>
            </Section>

            <Text style={text}>
              If you continue to face issues, please try using a different payment method or contact your bank to ensure
              there are no restrictions on your card for online transactions.
            </Text>
          </Section>

          <Text style={text}>
            Need help? Contact our support team at{" "}
            <Link href="mailto:support@eduplatform.com" style={link}>
              support@eduplatform.com
            </Link>{" "}
            and we'll be happy to assist you.
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
  color: "#ef4444",
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

const listItem: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  marginBottom: "8px",
  paddingLeft: "10px",
}

const errorBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "30px",
  border: "1px solid #fee2e2",
}

const errorText: React.CSSProperties = {
  fontSize: "16px",
  color: "#b91c1c",
  margin: "0",
  textAlign: "center",
}

const errorIcon: React.CSSProperties = {
  fontSize: "20px",
  marginRight: "8px",
}

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "30px 0",
}

const button: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 24px",
}

const link: React.CSSProperties = {
  color: "#4f46e5",
  textDecoration: "underline",
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
