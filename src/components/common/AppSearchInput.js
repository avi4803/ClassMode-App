import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '../../theme/ThemeContext';

const AppSearchInput = ({ label, data, value, onSelect }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const [query, setQuery] = useState(value);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Filter logic
  const filteredData = useMemo(() => {
    if (!query) return [];
    return data.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, data]);

  const handleSelect = (item) => {
    setQuery(item);
    onSelect(item);
    setShowResults(false);
  };

  return (
    <View style={[styles.container, { zIndex: 10 }]}> 
      {/* zIndex ensures dropdown floats over other elements */}
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowResults(true);
          }}
          placeholder="Search for your college"
          placeholderTextColor={colors.placeholder}
          onFocus={() => setShowResults(true)}
        />
        <MaterialIcons 
          name="search" 
          size={20} 
          color={colors.placeholder} 
          style={styles.icon}
        />
      </View>

      {/* Autocomplete List */}
      {showResults && filteredData.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={filteredData.slice(0, 5)} // Limit results
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Text style={styles.resultText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
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
  inputWrapper: {
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 40, // Space for icon
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
  },
  icon: {
    position: 'absolute',
    right: 16,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  resultText: {
    color: colors.textMain,
    fontSize: 14,
  },
});

export default AppSearchInput;