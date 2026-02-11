import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import SignupForm from '../../src/components/forms/SignupForm';
import AppButton from '../../src/components/common/AppButton';
import { globalStyles } from '../../src/styles/globalStyles';
import { useTheme } from '../../src/theme/ThemeContext';
import { router } from 'expo-router';
import OverlayBackButton from '../../src/components/common/BackNavigationButton';
import authService from '../../src/services/authService';

const SignupScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.signupInit({
        name: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        Alert.alert('Success', 'OTP Sent to your email');
        router.push({ pathname: "/OtpVerificationScreen", params: { email: formData.email } });
      }
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <OverlayBackButton/>
      </View>

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={[styles.iconBox, { backgroundColor: colors.bgIndigo || '#e0e7ff' }]}>
            <MaterialIcons name="school" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join your college community today</Text>
        </View>

        {/* Card Section */}
        <View style={[styles.card, globalStyles.shadowCard, { shadowColor: colors.border }]}>
          <SignupForm formData={formData} onDataChange={setFormData} />
        </View>

        {/* Footer Terms */}
        <Text style={styles.termsText}>
          By signing up, you agree to our <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>.
        </Text>

        {/* Actions */}
        <View style={styles.actionContainer}>
          {isLoading ? (
             <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <AppButton title="Send OTP" onPress={handleSignup} />
          )}
          
          <View style={styles.loginLinkContainer}>
            <View style ={{flex:1 , flexDirection:"row"}}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              </Text>
                <TouchableOpacity title="Log in" onPress ={() => router.back()}>
                <Text style={styles.link}>Log in</Text>
              </TouchableOpacity>

              </View>
              
            
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

// Style Generator Function
const getStyles = (colors) => StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    height: 64,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // hover:bg-slate-200/50 logic would go here if interactive
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
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
    fontSize: 30,
    fontFamily: 'Urbanist_700Bold',
    color: colors.textMain, // Switches White/Black
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist_600SemiBold',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface, // Switches White/Slate800
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
    maxWidth: 280,
    alignSelf: 'center',
  },
  link: {
    color: colors.primary,
    fontFamily: 'Urbanist_700Bold',
  },
  actionContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  loginLinkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Urbanist_600SemiBold',
  },
});

export default SignupScreen;