import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface WelcomeEmailProps {
  name: string
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to KIITease - Your KIIT Academic Success Journey Begins!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50?text=KIITease"
            width="150"
            height="50"
            alt="KIITease"
            style={logo}
          />
          <Heading style={heading}>Welcome to KIITease, {name}!</Heading>

          <Section style={section}>
            <Text style={text}>
              We're thrilled to have you join our community of 2000+ KIIT students excelling in their academic journey.
            </Text>

            <Text style={text}>With KIITease, you can:</Text>

            <Text style={listItem}>• Access premium study notes for your KIIT branch and year</Text>
            <Text style={listItem}>• Read authentic teacher reviews from fellow KIIT students</Text>
            <Text style={listItem}>• Earn rewards through our referral program</Text>
            <Text style={listItem}>• Get AI-powered insights on top teachers and subjects</Text>

            <Text style={text}>To get started, simply log in to your account and explore the dashboard.</Text>

            <Section style={buttonContainer}>
              <Link style={button} href="https://kiitease.vercel.app/login">
                Log In to Your Account
              </Link>
            </Section>
          </Section>

          <Text style={text}>If you have any questions or need assistance, feel free to reply to this email.</Text>

          <Text style={text}>
            Best regards,
            <br />
            The KIITease Team
          </Text>

          <Text style={footer}>© 2024 KIITease. All rights reserved.</Text>
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

const listItem = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  marginBottom: "8px",
  paddingLeft: "10px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

const footer = {
  fontSize: "14px",
  color: "#898989",
  textAlign: "center" as const,
  marginTop: "30px",
}
