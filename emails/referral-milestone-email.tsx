import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface ReferralMilestoneEmailProps {
  name: string
  count: number
}

export const ReferralMilestoneEmail = ({ name, count }: ReferralMilestoneEmailProps) => {
  const isComplete = count >= 20

  return (
    <Html>
      <Head />
      <Preview>
        {isComplete
          ? "Congratulations! You've reached 20 referrals and are eligible for a refund!"
          : `Great progress! You've referred ${count} friends to EduPlatform!`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50?text=EduPlatform"
            width="150"
            height="50"
            alt="EduPlatform"
            style={logo}
          />

          <Heading style={heading}>{isComplete ? "Congratulations! 🎉" : "Referral Milestone Achieved! 🌟"}</Heading>

          <Section style={isComplete ? successBox : milestoneBox}>
            <Text style={isComplete ? successText : milestoneText}>
              <span style={emoji}>{isComplete ? "🏆" : "🚀"}</span>
              {isComplete ? "You've successfully referred 20 friends!" : `You've referred ${count} out of 20 friends!`}
            </Text>
          </Section>

          <Section style={section}>
            <Text style={text}>Dear {name},</Text>

            {isComplete ? (
              <>
                <Text style={text}>
                  Amazing achievement! You've successfully referred 20 friends to EduPlatform, which means you're now
                  eligible for a complete refund of your premium subscription fee!
                </Text>

                <Text style={text}>
                  Our admin team has been notified and will process your refund within the next 3-5 business days.
                  You'll receive another email once the refund has been processed.
                </Text>

                <Text style={text}>
                  The best part? You'll still retain all your premium access and benefits! This is our way of saying
                  thank you for helping grow the EduPlatform community.
                </Text>
              </>
            ) : (
              <>
                <Text style={text}>
                  Great job on referring {count} friends to EduPlatform! You're making excellent progress toward your
                  goal of 20 referrals.
                </Text>

                <Text style={text}>
                  Remember, once you reach 20 successful referrals, you'll be eligible for a complete refund of your
                  premium subscription fee while still maintaining all your premium benefits!
                </Text>

                <Text style={text}>You're only {20 - count} referrals away from reaching this milestone!</Text>
              </>
            )}

            <Section style={buttonContainer}>
              <Link style={button} href="https://eduplatform.vercel.app/dashboard">
                {isComplete ? "View Refund Status" : "Refer More Friends"}
              </Link>
            </Section>
          </Section>

          {!isComplete && (
            <Section style={tipBox}>
              <Text style={tipHeading}>Tips to get more referrals:</Text>
              <Text style={tipItem}>• Share your referral code on social media</Text>
              <Text style={tipItem}>• Tell your classmates about the premium study materials</Text>
              <Text style={tipItem}>• Highlight the teacher reviews feature to your friends</Text>
              <Text style={tipItem}>• Demonstrate the AI analytics to study groups</Text>
            </Section>
          )}

          <Text style={text}>Thank you for being an amazing member of our community!</Text>

          <Text style={text}>
            Best regards,
            <br />
            The EduPlatform Team
          </Text>

          <Text style={footer}>© 2024 EduPlatform. All rights reserved.</Text>
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

const successBox = {
  backgroundColor: "#ecfdf5",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "30px",
  border: "1px solid #d1fae5",
}

const successText = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#047857",
  margin: "0",
  textAlign: "center" as const,
}

const milestoneBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "30px",
  border: "1px solid #dbeafe",
}

const milestoneText = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1e40af",
  margin: "0",
  textAlign: "center" as const,
}

const emoji = {
  fontSize: "24px",
  marginRight: "8px",
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

const tipBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "30px",
  border: "1px solid #fde68a",
}

const tipHeading = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#92400e",
  marginTop: "0",
  marginBottom: "10px",
}

const tipItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#92400e",
  marginBottom: "6px",
}

const footer = {
  fontSize: "14px",
  color: "#898989",
  textAlign: "center" as const,
  marginTop: "30px",
}
