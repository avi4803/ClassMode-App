import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { globalStyles } from '../../styles/globalStyles';

const AppButton = ({ title, onPress }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        globalStyles.shadowButton,
        // Apply shadow color dynamically via inline style since globalStyles is static
        { shadowColor: colors.shadow }, 
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const getStyles = (colors) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: '#ffffff', // Always white for primary buttons
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
  },
});

export default AppButton;