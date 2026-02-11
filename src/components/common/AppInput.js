import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '../../theme/ThemeContext';

const AppInput = ({
  label,
  iconName,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused
      ]}>
        <MaterialIcons 
          name={iconName} 
          size={20} 
          color={isFocused ? colors.primary : colors.textMuted} 
          style={styles.iconLeft} 
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />

        {secureTextEntry && (
          <Pressable 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconRight}
          >
            <MaterialIcons 
              name={isPasswordVisible ? 'visibility' : 'visibility-off'} 
              size={20} 
              color={colors.textMuted} 
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Urbanist_700Bold',
    color: colors.textMain, // Dynamic Color
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg, // Dynamic Color
    borderWidth: 1,
    borderColor: colors.border, // Dynamic Color
    borderRadius: 12,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  iconLeft: {
    marginLeft: 16,
    marginRight: 12,
  },
  iconRight: {
    padding: 10,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textMain, // Dynamic Color
    fontSize: 14,
    fontFamily: 'Urbanist_600SemiBold',
  },
});

export default AppInput;