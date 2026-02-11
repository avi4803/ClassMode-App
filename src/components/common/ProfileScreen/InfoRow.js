import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export const InfoRow = ({ icon, label, value, isVerified }) => {
  const colors = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <MaterialIcons name={icon} size={22} color={colors.textSecondary} />
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
          {isVerified && <MaterialIcons name="verified" size={16} color={colors.verified} />}
        </View>
      </View>
      {/* <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary}  /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  content: { flex: 1, marginLeft: 16 },
  label: { fontSize: 12, fontFamily: 'Urbanist_700Bold', marginBottom: 2 },
  value: { fontSize: 15, fontFamily: 'Urbanist_700Bold', marginRight: 4 },
  valueRow: { flexDirection: 'row', alignItems: 'center' }
});