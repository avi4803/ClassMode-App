import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/hooks/useTheme";

export default function PrivacyPolicyScreen() {
  const colors = useTheme();

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
              Effective Date: {new Date().toLocaleDateString()}
            </Text>

            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              Your privacy is important to us. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use the Classmode mobile application. Please read this privacy
              policy carefully.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              1. Information We Collect
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              Currently, the Classmode application does not collect any personal, 
              educational, or device information from its users.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              2. Use of Your Information
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              Since we do not collect any information, we do not use your information 
              for any purpose at this time.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              3. Disclosure of Your Information
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              We do not share, sell, rent, or trade your information with any third 
              parties as we do not collect any information.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              4. Security of Your Information
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              While we do not currently collect data, we maintain administrative, 
              technical, and physical security measures to help protect any future 
              interactions with the Application.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              5. Contact Us
            </Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary }]}>
              If you have questions or comments about this Privacy Policy, please
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
