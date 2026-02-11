import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AppInput from '../common/AppInput';
import PasswordStrength from '../common/PasswordStrength';

const SignupForm = ({ formData, onDataChange }) => {

  const updateField = (field, value) => {
    onDataChange({ ...formData, [field]: value });
  };

  return (
    <View style={styles.formContainer}>
      <AppInput
        label="Full Name"
        iconName="person"
        placeholder="John Doe"
        value={formData.fullName}
        onChangeText={(val) => updateField('fullName', val)}
      />

      <AppInput
        label="College Email"
        iconName="mail"
        placeholder="student@college.edu"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(val) => updateField('email', val)}
      />

      <AppInput
        label="Password"
        iconName="lock"
        placeholder="••••••••"
        secureTextEntry
        value={formData.password}
        onChangeText={(val) => updateField('password', val)}
      />
      <PasswordStrength password={formData.password}/>
      
      

      <AppInput
        label="Confirm Password"
        iconName="rotate-right"
        placeholder="••••••••"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(val) => updateField('confirmPassword', val)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
});

export default SignupForm;