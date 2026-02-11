import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export const TypeSelector = ({ selected, onSelect }) => {
  const theme = useTheme();
  const types = ['Lecture', 'Lab', 'Tutorial'];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>Class Type</Text>
        <Text style={[styles.optional, { fontFamily: theme.fonts.medium }]}>Optional</Text>
      </View>
      <View style={styles.btnRow}>
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => onSelect(type)}
            style={[
              styles.btn,
              { backgroundColor: selected === type ? theme.primary : theme.typeBtnBg, borderColor: theme.inputBorder },
              selected === type && { borderColor: theme.primary }
            ]}
          >
            <Text style={[styles.btnText, { color: selected === type ? '#fff' : theme.typeBtnText, fontFamily: theme.fonts.semiBold }]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 13, marginLeft: 4 },
  optional: { fontSize: 11, color: '#94a3b8' },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1 },
  btnText: { fontSize: 14 }
});