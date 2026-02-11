import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export const StatCard = ({ label, value, icon, colorKey }) => {
  const colors = useTheme();
  // colorKey expects 'Purple', 'Orange', etc.
  const bg = colors[`card${colorKey}`];
  const accent = colors[`accent${colorKey}`];

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: accent }]}>{label}</Text>
        <MaterialIcons name={icon} size={20} color={accent} />
      </View>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, height: 96, borderRadius: 12, padding: 12, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { 
    fontSize: 10, 
    fontFamily: 'Urbanist_700Bold', 
    letterSpacing: 1 
  },
  value: { 
    fontSize: 30, 
    fontFamily: 'Urbanist_800ExtraBold' 
  },
});