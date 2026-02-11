import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';

export const TimePickerInput = ({ label, value, onChange, mode = 'time' }) => {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  const onTimeChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) onChange(selectedDate);
  };

  const formatValue = (date) => {
    if (mode === 'date') {
       // Format as DD MMM YYYY (Day)
       return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>{label}</Text>
      <TouchableOpacity 
        onPress={() => setShow(true)}
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
      >
        <Text style={[styles.value, { color: theme.textPrimary, fontFamily: theme.fonts.semiBold }]}>{formatValue(value)}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 8, marginLeft: 4 },
  input: { padding: 14, borderRadius: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  value: { fontSize: 16 }
});