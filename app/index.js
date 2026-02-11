import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../src/hooks/useTheme";
import { router } from "expo-router";
import { AuthContext } from "../src/context/AuthContext";

const { width } = Dimensions.get("window");

export default function LaunchScreen() {
  const colors = useTheme();
  const { userToken, isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading && userToken) {
      router.replace('(screen)/HomeScreen');
    }
  }, [userToken, isLoading]);

  if (isLoading || userToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const FeatureItem = ({ icon, title, subtitle, iconColor, iconBg }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={26} color={iconColor} />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {/* --- Top Logo Section --- */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoGradient, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="school" size={50} color="#fff" />
          </View>
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>CampusSync</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your college, connected.
          </Text>
        </View>

        {/* --- Features Section --- */}
        <View style={styles.featuresList}>
          <FeatureItem
            icon="document-scanner"
            title="Scan Timetable Instantly"
            subtitle="Digitize your schedule in seconds."
            iconColor={colors.accentTeal}
            iconBg={colors.bgTeal}
          />
          <FeatureItem
            icon="notifications-active"
            title="Smart Class Reminders"
            subtitle="Never miss a lecture again."
            iconColor={colors.primary}
            iconBg={colors.bgIndigo}
          />
          <FeatureItem
            icon="insert-chart"
            title="Track Attendance Easily"
            subtitle="Keep your records green."
            iconColor={colors.accentLime}
            iconBg={colors.bgLime}
          />
        </View>

        {/* --- Footer Action --- */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.push('(auth)/LoginScreen')}
            activeOpacity={0.8}
            style={[styles.getStartedBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.btnText} >Get Started</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    // Add shadow to match shadow-indigo-500/20
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  brandName: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "500",
  },
  featuresList: {
    gap: 16,
    marginBottom: 32,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    // Shadow for light mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  featureSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
  footer: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  getStartedBtn: {
    height: 56,
    width: "100%",
    borderRadius: 28, // Rounded-full
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});