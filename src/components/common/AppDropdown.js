import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons"; // Updated Import
import { useTheme } from '../../theme/ThemeContext';

const AppDropdown = ({ label, value, options, onSelect, placeholder }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);

  const handleSelect = (item) => {
    onSelect(item);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Pressable 
        style={styles.trigger} 
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelect(item)}>
                  <Text style={[
                    styles.optionText, 
                    item === value && styles.selectedOptionText
                  ]}>
                    {item}
                  </Text>
                  {item === value && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.label,
    marginBottom: 6,
    marginLeft: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg, // white / slate-800/50
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12, // rounded-xl
    paddingHorizontal: 16,
    height: 50,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
  },
  placeholder: { color: colors.placeholder },
  
  // Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    maxHeight: 300,
    padding: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 15,
    color: colors.textMain,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default AppDropdown;