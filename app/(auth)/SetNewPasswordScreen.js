import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from 'expo-router';

import AppInput from '../../src/components/common/AppInput';
import AppButton from '../../src/components/common/AppButton';
import AppToast from '../../src/components/common/AppToast';
import { useTheme } from '../../src/hooks/useTheme';
import authService from '../../src/services/authService';
import OverlayBackButton from '../../src/components/common/BackNavigationButton';

const SetNewPasswordScreen = () => {
  const colors = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { resetToken } = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- VALIDATION LOGIC ---
  const checks = {
    length: password.length >= 8,
    complexity: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };

  const handleReset = async () => {
    if (!checks.length || !checks.complexity || !checks.match) {
        Alert.alert('Validation Error', 'Please satisfy all password requirements');
        return;
    }

    setIsLoading(true);
    try {
        const response = await authService.resetPassword(password, resetToken);
        if (response.success) {
            setShowToast(true);
            setTimeout(() => {
                router.replace('/LoginScreen');
            }, 2000);
        }
    } catch (error) {
        Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
        setIsLoading(false);
    }
  };

  // Helper Component for Validation Items
  const ValidationItem = ({ label, isValid, activeColor, iconName }) => {
    const color = isValid ? activeColor : (colors.textMuted || '#94a3b8');
    const icon = isValid ? 'check-circle' : iconName;

    return (
      <View style={styles.validationRow}>
        <MaterialIcons name={icon} size={18} color={color} style={styles.validationIcon} />
        <Text style={[styles.validationText, { color }]}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              
              {/* Header */}
              <View style={styles.header}>
                  <OverlayBackButton />
              </View>

              {/* Hero Section */}
              <View style={styles.heroSection}>
                <View style={[styles.iconBox, { backgroundColor: colors.iconBg || (colors.isDark ? "rgba(49, 46, 129, 0.4)" : "#e0e7ff") }]}>
                  <MaterialIcons name="lock-reset" size={48} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Set New Password</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Choose a strong password to secure your account.
                </Text>
              </View>

              {/* Form Inputs */}
              <View style={styles.form}>
                <AppInput
                  label="New Password"
                  iconName="lock"
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <AppInput
                  label="Confirm New Password"
                  iconName="lock"
                  placeholder="••••••••"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Validation Checklist */}
              <View style={styles.validationContainer}>
                <ValidationItem 
                  label="At least 8 characters" 
                  isValid={checks.length} 
                  activeColor={colors.success}
                  iconName="check-circle-outline"
                />
                <ValidationItem 
                  label="Contains a number or symbol" 
                  isValid={checks.complexity} 
                  activeColor={colors.warning || '#f59e0b'}
                  iconName="error-outline" 
                />
                <ValidationItem 
                  label="Passwords match" 
                  isValid={checks.match} 
                  activeColor={checks.match ? colors.success : (colors.danger || '#ef4444')}
                  iconName="cancel"
                />
              </View>

              {/* Bottom Button */}
              <View style={styles.footer}>
                {isLoading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <AppButton 
                    title="Reset Password" 
                    onPress={handleReset} 
                  />
                )}
              </View>

              {/* Success Toast (Absolute Positioned) */}
              <AppToast 
                visible={showToast} 
                message="Password reset successfully!" 
                onClose={() => setShowToast(false)}
              />

            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    height: 64,
    justifyContent: 'center',
    marginLeft: -16
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Urbanist_700Bold",
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Urbanist_500Medium",
    textAlign: 'center',
    lineHeight: 20
  },
  form: {
    width: '100%',
    marginBottom: 16,
    marginTop: 16
  },
  validationContainer: {
    paddingHorizontal: 8,
    marginTop: 0,
    marginBottom: 24,
    gap: 12,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationIcon: {
    marginRight: 8,
  },
  validationText: {
    fontSize: 13,
    fontFamily: "Urbanist_600SemiBold",
  },
  footer: {
    marginTop: 16,
    paddingBottom: 24,
  },
});

export default SetNewPasswordScreen;