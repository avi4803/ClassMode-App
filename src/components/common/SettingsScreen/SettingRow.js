import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export const SettingRow = ({ icon, label, subtitle, onPress, isDestructive, rightElement }) => {
  const colors = useTheme();
  const color = isDestructive ? colors.danger : colors.textPrimary;

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View style={styles.left}>
        <MaterialIcons name={icon} size={24} color={isDestructive ? colors.danger : colors.settingIcon} />
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color }]}>{label}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ? rightElement : (
        <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textContainer: { marginLeft: 16 },
  label: { fontSize: 16, fontWeight: '500' },
  subtitle: { fontSize: 13, marginTop: 2 }
});