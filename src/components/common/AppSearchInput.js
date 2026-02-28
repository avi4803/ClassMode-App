import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '../../theme/ThemeContext';

const AppSearchInput = ({ label, data, value, onSelect, onAddPress, placeholder = "Search" }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  const [query, setQuery] = useState(value || '');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (value) setQuery(value);
  }, [value]);

  // Handle data that might be an array of strings or objects { label, value, isVerified }
  const formattedData = useMemo(() => {
    return data.map(item => {
      if (typeof item === 'string') return { label: item, value: item, isVerified: false };
      return item;
    });
  }, [data]);

  // Filter logic
  const filteredData = useMemo(() => {
    if (!query) return [];
    return formattedData.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, formattedData]);

  const exactMatch = useMemo(() => {
    return formattedData.find(item => item.label.toLowerCase() === query.trim().toLowerCase());
  }, [query, formattedData]);

  const handleSelect = (item) => {
    setQuery(item.label);
    onSelect(item.value, item);
    setShowResults(false);
  };

  const handleAdd = () => {
    if (query.trim()) {
      onAddPress && onAddPress(query.trim());
      setShowResults(false);
    }
  };

  return (
    <View style={[styles.container, { zIndex: 10 }]}> 
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowResults(true);
          }}
          placeholder={placeholder}
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
      {showResults && (query.length > 0) && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={filteredData.slice(0, 5)} // Limit results
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Text style={styles.resultText}>{item.label}</Text>
                {item.isVerified ? (
                  <MaterialIcons name="verified" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
                ) : (
                  <View style={styles.unverifiedBadge}>
                    <Text style={[styles.unverifiedText, { color: colors.textSecondary }]}>Unverified</Text>
                  </View>
                )}
              </Pressable>
            )}
            ListFooterComponent={
              (!exactMatch && onAddPress && query.trim().length > 0) ? (
                <Pressable style={styles.addResultItem} onPress={handleAdd}>
                  <MaterialIcons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.addResultText, { color: colors.primary }]}>Add "{query.trim()}"</Text>
                </Pressable>
              ) : null
            }
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
    paddingRight: 40,
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
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  resultText: {
    color: colors.textMain,
    fontSize: 14,
    flexShrink: 1,
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
  addResultItem: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addResultText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  }
});

export default AppSearchInput;