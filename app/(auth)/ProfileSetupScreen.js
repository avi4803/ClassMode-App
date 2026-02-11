import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import AppButton from '../../src/components/common/AppButton';
import AppDropdown from '../../src/components/common/AppDropdown';
import AppSearchInput from '../../src/components/common/AppSearchInput';
import { useTheme } from '../../src/theme/ThemeContext';
import OverlayBackButton from '../../src/components/common/BackNavigationButton';
import { router, useLocalSearchParams } from 'expo-router';
import authService from '../../src/services/authService';

const ProfileSetupScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { signupToken } = useLocalSearchParams();

  // Data States
  const [colleges, setColleges] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  // Form State
  const [form, setForm] = useState({
    collegeId: '',
    batch: '',   // Stores Batch ID now
    section: '', // Stores Section ID now
  });
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  // const [isCollegesLoading, setIsCollegesLoading] = useState(true); // Unused for now

  // 1. Fetch Colleges on Mount
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await authService.getColleges();
      if (response.success) setColleges(response.data);
    } catch (error) {
       Alert.alert('Error', 'Failed to fetch colleges');
    }
  };

  // 2. Fetch Batches when College Changes
  useEffect(() => {
    if (form.collegeId) {
      fetchBatches(form.collegeId);
    } else {
      setBatches([]);
    }
    // Reset dependency fields
    setForm(prev => ({ ...prev, batch: '', section: '' }));
  }, [form.collegeId]);

  const fetchBatches = async (collegeId) => {
    try {
      const response = await authService.getBatches(collegeId);
      if (response.success) setBatches(response.data);
    } catch (error) {
      console.log('Fetch Batches Error', error);
      // Optional: Alert or silent fail
    }
  };

  // 3. Fetch Sections when Batch Changes
  useEffect(() => {
    if (form.batch) {
      fetchSections(form.batch);
    } else {
      setSections([]);
    }
    // Reset dependency fields
    setForm(prev => ({ ...prev, section: '' }));
  }, [form.batch]);

  const fetchSections = async (batchId) => {
    try {
      const response = await authService.getSections(batchId);
      if (response.success) setSections(response.data);
    } catch (error) {
      console.log('Fetch Sections Error', error);
    }
  };

  
  // --- Helpers for Display ---
  const selectedCollegeName = useMemo(() => {
    return colleges.find(c => c.collegeId === form.collegeId)?.name || form.collegeId;
  }, [colleges, form.collegeId]);

  const getBatchLabel = (batch) => `${batch.year} (${batch.program})`;
  const getSectionLabel = (section) => `Section ${section.name}`;

  const selectedBatchLabel = useMemo(() => {
    const b = batches.find(i => i._id === form.batch);
    return b ? getBatchLabel(b) : '';
  }, [batches, form.batch]);

  const selectedSectionLabel = useMemo(() => {
    const s = sections.find(i => i._id === form.section);
    return s ? getSectionLabel(s) : '';
  }, [sections, form.section]);


  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const response = await authService.signupComplete({
        collegeId: form.collegeId,
        batch: form.batch,   // Sending ID
        section: form.section // Sending ID
      }, signupToken);

      if (response.success) {
        Alert.alert('Success', 'Account Created Successfully');
        router.push('/(auth)/LoginScreen');
      }
    } catch (error) {
       Alert.alert('Error', error.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        
        {/* Header Section */}
        <OverlayBackButton/>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <MaterialIcons name="school" size={48} color="#ffffff" />
          </View>
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>Help us personalize your experience.</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          
          <AppSearchInput
            label="College"
            data={colleges.map(c => c.name)}
            value={selectedCollegeName}
            onSelect={(name) => {
              const selected = colleges.find(c => c.name === name);
              if (selected) {
                // Determine if collegeId is needed or _id. 
                // Previous prompt said "send collegeId (e.g. IIITR)". 
                // Keeping that logic.
                setForm(prev => ({ ...prev, collegeId: selected.collegeId }));
              }
            }}
          />

          <AppDropdown 
            label="Batch / Year"
            value={selectedBatchLabel}
            options={batches.map(getBatchLabel)}
            onSelect={(label) => {
              const selected = batches.find(b => getBatchLabel(b) === label);
              if (selected) {
                 setForm(prev => ({ ...prev, batch: selected._id }));
              }
            }}
          />

          <AppDropdown 
            label="Section"
            value={selectedSectionLabel}
            options={sections.map(getSectionLabel)}
            onSelect={(label) => {
              const selected = sections.find(s => getSectionLabel(s) === label);
              if (selected) {
                setForm(prev => ({ ...prev, section: selected._id }));
              }
            }}
          />

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {isLoading ? (
             <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <AppButton 
              title="Continue" 
              onPress={handleContinue}
              disabled={!form.collegeId || !form.batch || !form.section}
            />
          )}
        </View>

      </View>
    </ScreenWrapper>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24, // p-6
    paddingTop: 32,        // pt-safe-top compensation
  },
  header: {
    alignItems: 'center',
    marginVertical: 32, // py-8
  },
  iconBox: {
    width: 80, // w-20
    height: 80, // h-20
    backgroundColor: colors.primary,
    borderRadius: 20, // rounded-[1.25rem]
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, // text-sm
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
    zIndex: 1, // Ensures dropdowns float correctly
  },
  footer: {
    marginTop: 'auto', // Pushes to bottom like flex-grow
    paddingBottom: 24, // pb-safe-bottom
  },
});

export default ProfileSetupScreen;