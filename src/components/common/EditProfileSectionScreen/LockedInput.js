import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export const LockedInput = ({ label, value }) => {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.input, { backgroundColor: colors.inputLocked, borderColor: colors.border }]}>
        <TextInput 
          value={value} 
          editable={false} 
          style={[styles.text, { color: colors.inputLockedText }]} 
        />
        <MaterialIcons name="lock" size={20} color={colors.dropdownIcon} />
      </View>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>Contact admin to change</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 5, 
    paddingHorizontal: 7,
    borderRadius: 12, 
    borderWidth: 1 
  },
  text: { flex: 1, fontSize: 16 },
  hint: { fontSize: 11, marginTop: 6, fontStyle: 'italic' },
});