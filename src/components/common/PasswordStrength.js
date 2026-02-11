import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';

const PasswordStrength = ({ password }) => {
  const { colors } = useTheme();
  const { strength, label, color } = usePasswordStrength(password);
  
  // Dynamic styles based on the calculated color
  const styles = useMemo(() => getStyles(colors, color), [colors, color]);

  // Don't show anything if no password is typed
  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Create 4 distinct bars for the segmented look */}
      <View style={styles.barContainer}>
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { 
                backgroundColor: index <= strength ? color : colors.border,
                opacity: index <= strength ? 1 : 0.3 
              }
            ]}
          />
        ))}
      </View>
      
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const getStyles = (colors, activeColor) => StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 6, // Space between segments
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3, // Rounded ends
  },
  label: {
    fontSize: 12,
    fontFamily: 'Urbanist_700Bold',
    textAlign: 'right', // Put text on the right or leave left
  },
});

export default PasswordStrength;