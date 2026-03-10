import React, { useContext, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, TextInput } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme, useThemeMode } from "../../src/hooks/useTheme";
import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";
import { jwtDecode } from "jwt-decode";

// Components
import { SettingRow } from "../../src/components/common/SettingsScreen/SettingRow";
import { ThemeSwitcher } from "../../src/components/common/SettingsScreen/ThemeSwitcher";
import { CustomAlert } from "../../src/components/common/CustomAlert";

export default function SettingsScreen() {
  const colors = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { logout, userToken } = useContext(AuthContext);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  const [password, setPassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState({ visible: false, message: "" });

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const processLogout = async () => {
    await logout();
    router.replace('/(auth)/LoginScreen');
  };

  const handleDeleteAccount = () => {
    setShowDeleteAlert(true);
  };

  const processDeleteAccount = async () => {
    if (!password) {
      setErrorAlert({ visible: true, message: "Please enter your password to confirm deletion." });
      return;
    }
    try {
      setDeleteLoading(true);
      
      // Extract user ID from JWT token using jwt-decode
      let userId = null;
      if (userToken) {
         try {
             const decodedData = jwtDecode(userToken);
             userId = decodedData.id || decodedData._id;
         } catch(e) {
             console.log("Could not parse JWT natively", e);
         }
      }
      
      // Fallback: If your backend `/user/:id` endpoint accepts `me`
      if (!userId) {
         throw new Error("Could not verify user identity. Try logging out and back in.");
      }
      
      await authService.deleteUserAccount(userToken, userId, password);
      
      await logout();
      router.replace('/(auth)/LoginScreen');
    } catch (error) {
      setErrorAlert({ visible: true, message: error.message || "Failed to delete account." });
    } finally {
      setDeleteLoading(false);
      setShowDeleteAlert(false);
      setPassword("");
    }
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
              <SettingRow icon="policy" label="Privacy Policy" onPress={() => router.push('/(settings)/PrivacyPolicyScreen')} />
              <SettingRow icon="gavel" label="Terms & Conditions" onPress={() => router.push('/(settings)/TermsConditionsScreen')} />
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

      <CustomAlert 
        visible={showLogoutAlert}
        title="Logout"
        message="Are you sure you want to log out of your session?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        type="destructive"
        onConfirm={processLogout}
        onClose={() => setShowLogoutAlert(false)}
      />

      <CustomAlert 
        visible={showDeleteAlert}
        title="Delete Account?"
        message="This action is permanent and cannot be undone. All your personal data will be anonymized. Please enter your password to confirm."
        confirmLabel={deleteLoading ? "Deleting..." : "Yes, Delete Everything"}
        cancelLabel="Cancel"
        type="destructive"
        onConfirm={processDeleteAccount}
        onClose={() => {
          setShowDeleteAlert(false);
          setPassword("");
        }}
      >
        <TextInput
          placeholder="Enter Current Password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 14,
            width: '100%',
            color: colors.textPrimary,
            backgroundColor: colors.card,
            fontFamily: 'Urbanist_500Medium'
          }}
        />
      </CustomAlert>

      <CustomAlert 
        visible={errorAlert.visible}
        title="Error"
        message={errorAlert.message}
        onClose={() => setErrorAlert({ visible: false, message: "" })}
      />
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