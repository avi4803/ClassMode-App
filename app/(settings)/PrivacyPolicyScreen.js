import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/hooks/useTheme";

export default function PrivacyPolicyScreen() {
  const colors = useTheme();

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      <Text style={[styles.paragraph, { color: colors.textPrimary }]}>{children}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Privacy Policy
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              Last Updated: March 13, 2026
            </Text>

            <Section title="1. Introduction">
              Classmode values your privacy. This policy explains how we collect, use, and protect your data when using the app for schedule management and attendance tracking.
            </Section>

            <Section title="2. Information We Collect">
              We collect data to provide a personalized experience:{"\n"}
              • Account: Name and college email.{"\n"}
              • Education: College name, batch, and section.{"\n"}
              • Metadata: Scanned timetable images (processed for OCR).{"\n"}
              • Device: Push tokens for class reminders.
            </Section>

            <Section title="3. How We Use Data">
              Your data is used to synchronize your timetable, calculate attendance percentages, and send notification reminders before your classes start.
            </Section>

            <Section title="4. Data Security">
              We do not sell your data. We use industry-standard encryption for passwords and secure cloud hosting for your schedules.
            </Section>

            <Section title="5. Your Rights">
              You can modify or delete your account and all associated data at any time via the Profile settings.
            </Section>

            <Section title="6. Contact Us">
              Email: classmode.service@gmail.com
            </Section>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Urbanist_700Bold",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  date: {
    fontSize: 14,
    fontFamily: "Urbanist_600SemiBold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Urbanist_700Bold",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: "Urbanist_500Medium",
    lineHeight: 24,
  },
});
