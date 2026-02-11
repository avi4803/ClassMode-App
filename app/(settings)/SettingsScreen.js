import React, { useContext } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme, useThemeMode } from "../../src/hooks/useTheme";
import { AuthContext } from "../../src/context/AuthContext";

// Components
import { SettingRow } from "../../src/components/common/SettingsScreen/SettingRow";
import { ThemeSwitcher } from "../../src/components/common/SettingsScreen/ThemeSwitcher";

export default function SettingsScreen() {
  const colors = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        onPress: async () => {
            await logout();
            router.replace('/(auth)/LoginScreen');
        }, 
        style: "destructive" 
      }
    ]);
  };

  const handleDeleteAccount = () => {
    // This replicates your HTML Modal functionality
    Alert.alert(
      "Delete Account?",
      "This action is permanent. All timetable and attendance records will be erased.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Delete", onPress: () => console.log("Backend: Delete Request"), style: "destructive" }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>APPEARANCE</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SettingRow 
                icon="contrast" 
                label="Theme Mode" 
                rightElement={<ThemeSwitcher currentMode={themeMode} onChange={setThemeMode} />} 
              />
              <SettingRow icon="language" label="Language" subtitle="English" />
            </View>
          </View>

          {/* Preferences Section */}
          {/* <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PREFERENCES</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SettingRow 
                icon="notifications" 
                label="Notifications" 
                subtitle="Manage reminders and alerts" 
                onPress={() => console.log('Navigate to Notifs')}
              />
            </View>
          </View> */}

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PRIVACY & SECURITY</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SettingRow icon="lock-reset" label="Change Password" />
              <SettingRow icon="policy" label="Privacy Policy" />
              <SettingRow icon="gavel" label="Terms & Conditions" />
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.danger }]}>ACCOUNT ACTIONS</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <SettingRow 
                isDestructive 
                icon="logout" 
                label="Logout" 
                onPress={handleLogout} 
              />
              <SettingRow 
                isDestructive 
                icon="delete-forever" 
                label="Delete Account" 
                onPress={handleDeleteAccount} 
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 60, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: 'Urbanist_700Bold' },
  container: { padding: 16 },
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 12, fontFamily: 'Urbanist_800ExtraBold', marginLeft: 16, marginBottom: 8, letterSpacing: 1 },
  card: { borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
});