import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/hooks/useTheme';
import Animated, { FadeInUp } from 'react-native-reanimated';

const HolidayCard = ({ reason }) => {
  const colors = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(600)} style={[styles.card, { 
      backgroundColor: colors.isDark ? '#1e293b' : '#f1f5f9', 
      borderColor: colors.border,
      borderStyle: 'dashed'
    }]}>
      <View style={styles.centerContent}>
        <Text style={[styles.tag, { color: colors.textSecondary }]}>Holiday !</Text>
        <Text style={[styles.description, { color: colors.textPrimary }]}>
          No classes due to{"\n"}
          <Text style={[styles.reason, { color: colors.primary }]}>{reason}</Text>
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 32,
    marginBottom: 16,
    borderWidth: 1.5,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    fontSize: 12,
    fontFamily: 'Urbanist_800ExtraBold',
    letterSpacing: 2.5,
    marginBottom: 5,
    opacity: 0.6,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    fontFamily: 'Urbanist_500Medium',
    textAlign: 'center',
    lineHeight: 26,
  },
  reason: {
    fontSize: 22,
    fontFamily: 'Urbanist_700Bold',
  },
});

export default HolidayCard;
