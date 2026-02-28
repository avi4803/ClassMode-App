import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '../../theme/ThemeContext';

const AppDropdown = ({ label, value, options, onSelect, placeholder = "Select an option", onAddPress, addLabel = "Add New" }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);

  // Parse options uniformly
  const formattedOptions = useMemo(() => {
    if (!options) return [];
    return options.map(item => {
      if (typeof item === 'string') return { label: item, value: item, isVerified: false };
      return item;
    });
  }, [options]);

  const handleSelect = (item) => {
    onSelect(item.value, item);
    setVisible(false);
  };

  const handleAdd = () => {
    setVisible(false);
    if (onAddPress) onAddPress();
  };

  const selectedLabel = formattedOptions.find(opt => opt.value === value)?.label || placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Pressable 
        style={styles.trigger} 
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.text, !value && styles.placeholder]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={formattedOptions}
              keyExtractor={(item, index) => String(item.value || index)}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelect(item)}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[
                      styles.optionText, 
                      item.value === value && styles.selectedOptionText
                    ]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    {item.isVerified ? (
                      <MaterialIcons name="verified" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
                    ) : (
                      <View style={styles.unverifiedBadge}>
                        <Text style={[styles.unverifiedText, { color: colors.textSecondary }]}>Unverified</Text>
                      </View>
                    )}
                  </View>
                  {item.value === value && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options found.</Text>
                </View>
              }
              ListFooterComponent={
                onAddPress ? (
                  <Pressable style={styles.addOption} onPress={handleAdd}>
                    <MaterialIcons name="add-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.addOptionText, { color: colors.primary }]}>{addLabel}</Text>
                  </Pressable>
                ) : null
              }
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
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
    marginRight: 8,
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
    maxHeight: 400,
    overflow: 'hidden',
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
    flexShrink: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  unverifiedBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.inputBg,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  unverifiedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  addOptionText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  }
});

export default AppDropdown;