import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/hooks/useTheme";

export default function TermsConditionsScreen() {
  const colors = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Terms & Conditions
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              Effective Date: {new Date().toLocaleDateString()}
            </Text>

            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              These Terms and Conditions constitute a legally binding agreement
              made between you and Classmode ("we," "us," or "our") concerning
              your access to and use of the Classmode mobile application.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              1. Agreement to Terms
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              By accessing the Application, you agree that you have read,
              understood, and agree to be bound by all of these Terms and
              Conditions.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              2. User Representations
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              By using the Application, you represent and warrant that you will
              not use the Application for any illegal or unauthorized purpose
              and your use of the Application will not violate any applicable law
              or regulation.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              3. Prohibited Activities
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              You may not access or use the Application for any purpose other
              than that for which we make the Application available. This
              includes any commercial endeavors unless specified by us.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              4. Modifications and Interruptions
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              We reserve the right to change, modify, or remove the contents of
              the Application at any time or for any reason at our sole
              discretion without notice. We also reserve the right to modify or
              discontinue all or part of the Application without notice.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              5. Contact Us
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              To resolve a complaint regarding the Application or to receive
              further information regarding use of the Application, please
              contact us at:
            </Text>
            <Text style={[styles.contactInfo, { color: colors.textPrimary }]}>
              Avinash Nishad{"\n"}
              Classmode{"\n"}
              avinashn157@gmail.com
            </Text>
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
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  date: {
    fontSize: 14,
    fontFamily: "Urbanist_500Medium",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Urbanist_700Bold",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: "Urbanist_500Medium",
    lineHeight: 24,
  },
  contactInfo: {
    fontSize: 15,
    fontFamily: "Urbanist_600SemiBold",
    lineHeight: 24,
    marginTop: 8,
  },
});
