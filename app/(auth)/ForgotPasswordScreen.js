import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { router } from 'expo-router';

import AppInput from '../../src/components/common/AppInput';
import AppButton from '../../src/components/common/AppButton';
import { useTheme } from '../../src/hooks/useTheme';
import authService from '../../src/services/authService';
import OverlayBackButton from '../../src/components/common/BackNavigationButton';

const ForgotPasswordScreen = () => {
  const colors = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        router.push({
          pathname: "/OtpVerificationScreen",
          params: { email: email.trim(), type: 'reset' }
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
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
              
              {/* Header (Pinned Top) */}
              <View style={styles.header}>
                <OverlayBackButton />
              </View>

              {/* Main Content (Centered Vertically) */}
              <View style={styles.content}>
                
                {/* Logo Section */}
                <View style={styles.logoWrapper}>
                  <View style={[styles.logoBox, { backgroundColor: colors.iconBg || (colors.isDark ? "rgba(49, 46, 129, 0.4)" : "#e0e7ff") }]}>
                    <MaterialIcons name="school" size={48} color={colors.primary} />
                  </View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password?</Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Enter your college email to receive a password reset OTP.
                  </Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                  <AppInput
                    label="College Email"
                    iconName="mail"
                    placeholder="student@college.edu"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />

                  <View style={styles.buttonContainer}>
                    {isLoading ? (
                      <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                      <AppButton 
                        title="Send OTP" 
                        onPress={handleSendOtp} 
                      />
                    )}
                  </View>
                </View>

              </View>

              {/* Bottom Spacer (To balance visual center) */}
              <View style={styles.footerSpacer} />

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
    marginBottom: 0,
    marginLeft: -16
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 32,
  },
  footerSpacer: {
    height: 64,
  },
});

export default ForgotPasswordScreen;