import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, TouchableWithoutFeedback, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export const Dropdown = ({ label, value, options, onSelect, placeholder = "Select option", searchable = false }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine display text
  // options can be ["A", "B"] or [{label: "A", value: "a"}]
  const getLabel = (item) => (typeof item === 'object' && item.label) ? item.label : item;
  const getValue = (item) => (typeof item === 'object' && item.value) ? item.value : item;

  const filteredOptions = useMemo(() => {
     if (!searchable || !searchQuery) return options;
     return options.filter(item => {
         const itemLabel = getLabel(item);
         return String(itemLabel).toLowerCase().includes(searchQuery.toLowerCase());
     });
  }, [options, searchQuery, searchable]);

  const renderItem = ({ item }) => {
    const itemLabel = getLabel(item);
    const itemValue = getValue(item);
    const isSelected = itemValue === value;

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && { backgroundColor:  theme.primary + '15' }]}
        onPress={() => {
          onSelect(itemValue);
          setVisible(false);
        }}
      >
        <Text style={[
            styles.itemText, 
            { color: isSelected ? theme.primary : theme.textPrimary, fontFamily: isSelected ? theme.fonts.bold : theme.fonts.medium }
          ]}>
          {itemLabel}
        </Text>
        {isSelected && <MaterialIcons name="check" size={20} color={theme.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>{label}</Text> : null}
      
      <TouchableOpacity
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.value, { color: value ? theme.textPrimary : theme.placeholder, fontFamily: theme.fonts.semiBold }]}>
          {value ? (typeof options[0] === 'object' ? options.find(o => o.value === value)?.label : value) : placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardSlate || theme.card || '#fff' }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fonts.bold }]}>{label || "Select"}</Text>
                  <TouchableOpacity onPress={() => setVisible(false)}>
                    <MaterialIcons name="close" size={22} color={theme.textSecondary} />
                  </TouchableOpacity>
               </View>
               
               {searchable && (
                 <View style={[styles.searchContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                    <MaterialIcons name="search" size={20} color={theme.placeholder} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.textPrimary, fontFamily: theme.fonts.medium }]}
                        placeholder="Search..."
                        placeholderTextColor={theme.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                 </View>
               )}

               <FlatList
                 data={filteredOptions} // Use filtered options
                 keyExtractor={(item, index) => index.toString()}
                 renderItem={renderItem}
                 style={{ maxHeight: 300 }}
                 ListEmptyComponent={
                     <Text style={{ padding: 20, textAlign: 'center', color: theme.textSecondary, fontFamily: theme.fonts.medium }}>No options found</Text>
                 }
               />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 8, marginLeft: 4 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  value: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    maxHeight: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  modalTitle: { fontSize: 18 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  itemText: { fontSize: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, marginBottom: 10, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 }
});
