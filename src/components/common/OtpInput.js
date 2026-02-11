import React, { useRef, useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const OtpInput = ({ length = 6, onOtpChange }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    onOtpChange(newOtp.join(''));

    // Move to next input if text is entered
    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous input on Backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => inputs.current[index] = ref}
          style={[
            styles.input,
            digit ? styles.inputFilled : null, // Optional highlight state
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          cursorColor={colors.primary}
          selectionColor={colors.primaryLight}
        />
      ))}
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8, // sm:gap-3 (approx 8-12px)
    width: '100%',
  },
  input: {
    width: 48, // w-12
    height: 56, // h-14
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg, // slate-100 / slate-800
    color: colors.textMain,
    fontSize: 24, // text-2xl
    fontWeight: '700',
    textAlign: 'center',
    ...Platform.select({
      ios: { paddingBottom: 0 }, // Center text vertically fix for iOS
    }),
  },
  inputFilled: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.surface, // Slight highlight on fill
  },
});

export default OtpInput;