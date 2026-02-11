import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from 'expo-router';

import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import AppButton from '../../src/components/common/AppButton';
import OtpInput from '../../src/components/common/OtpInput';
import { useTheme } from '../../src/hooks/useTheme';
import OverlayBackButton from '../../src/components/common/BackNavigationButton';
import authService from '../../src/services/authService';

const OtpVerificationScreen = () => {
  const colors = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { email, type } = useLocalSearchParams(); // type: 'signup' (default) or 'reset'

  const [timer, setTimer] = useState(30);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isReset = type === 'reset';

  // Countdown Logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (timer === 0) {
      setTimer(30);
      try {
        if (isReset) {
            await authService.forgotPassword(email);
        } else {
            await authService.signupInit({ email });
        }
        Alert.alert('Success', 'OTP Resent');
      } catch (error) {
         Alert.alert('Error', error.message || 'Failed to resend OTP');
      }
    }
  };

  const handleVerify = async () => {
    if (otpCode.length < 6) return;
    setIsLoading(true);
    try {
      if (isReset) {
        const response = await authService.verifyResetOtp(email, otpCode);
        if (response.success) {
            const { resetToken } = response.data;
            router.push({ pathname: "/SetNewPasswordScreen", params: { resetToken } });
        }
      } else {
        const response = await authService.signupVerify({
          email,
          otp: otpCode
        });
        
        if (response.success) {
          const { signupToken } = response.data;
          router.push({ pathname: "/ProfileSetupScreen", params: { signupToken } });
        }
      }
    } catch (error) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const formattedTimer = `0:${timer.toString().padStart(2, '0')}`;

  return (
    <ScreenWrapper>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <OverlayBackButton/>
          </View>

          <View style={styles.content}>
            
            {/* Hero Section */}
            <View style={styles.heroContainer}>
              <View style={[styles.iconBox, { backgroundColor: colors.iconBg || (colors.isDark ? "rgba(49, 46, 129, 0.4)" : "#e0e7ff") }]}>
                <MaterialIcons name="mark-email-unread" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {isReset ? "Verify Identity" : "Verify your email"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We’ve sent a 6-digit OTP to {email}
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <OtpInput 
                  length={6} 
                  onOtpChange={setOtpCode} 
                />
                
                {/* Timer & Resend */}
                <View style={styles.resendContainer}>
                  <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                    Didn't receive code? Resend in{' '}
                    <Text style={[styles.timerText, { color: colors.textPrimary }]}>{formattedTimer}</Text>
                  </Text>
                  
                  <Pressable 
                    onPress={handleResend} 
                    disabled={timer > 0}
                    style={styles.resendButton}
                  >
                    <Text style={[
                      styles.resendButtonText, 
                      { color: colors.textPrimary },
                      timer > 0 && { color: colors.textMuted || '#94a3b8' }
                    ]}>
                      Resend OTP
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Footer Button */}
              <View style={styles.footer}>
                {isLoading ? (
                   <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <AppButton 
                    title="Verify & Continue" 
                    onPress={handleVerify} 
                    disabled={otpCode.length < 6} 
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </ScreenWrapper>
  );
};

const getStyles = (colors) => StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    height: 64,
    justifyContent: 'center',
    marginLeft: -16
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Urbanist_700Bold",
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Urbanist_500Medium",
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20
  },
  formSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inputGroup: {
    gap: 24,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    fontFamily: "Urbanist_500Medium",
  },
  timerText: {
    fontFamily: "Urbanist_700Bold",
  },
  resendButton: {
    marginTop: 8,
    padding: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: "Urbanist_700Bold",
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
  },
});

export default OtpVerificationScreen;