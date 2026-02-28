import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Modal, TextInput, Pressable } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import AppButton from '../../src/components/common/AppButton';
import AppDropdown from '../../src/components/common/AppDropdown';
import AppSearchInput from '../../src/components/common/AppSearchInput';
import { useTheme } from '../../src/theme/ThemeContext';
import OverlayBackButton from '../../src/components/common/BackNavigationButton';
import { router, useLocalSearchParams } from 'expo-router';
import authService from '../../src/services/authService';

// Simple Prompt Modal for Android/iOS compatibility
const CustomPrompt = ({ visible, title, placeholder, onCancel, onSubmit, colors }) => {
  const [text, setText] = useState('');
  useEffect(() => { if (visible) setText(''); }, [visible]);

  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={stylesPrompt.overlay}>
        <View style={[stylesPrompt.box, { backgroundColor: colors.surface }]}>
          <Text style={[stylesPrompt.title, { color: colors.textMain }]}>{title}</Text>
          <TextInput
            style={[stylesPrompt.input, { borderColor: colors.inputBorder, color: colors.textMain, backgroundColor: colors.inputBg }]}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            value={text}
            onChangeText={setText}
            autoFocus
          />
          <View style={stylesPrompt.buttons}>
            <Pressable style={stylesPrompt.btn} onPress={onCancel}>
              <Text style={[stylesPrompt.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable style={stylesPrompt.btn} onPress={() => onSubmit(text)}>
              <Text style={[stylesPrompt.btnText, { color: colors.primary }]}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const stylesPrompt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  box: { borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  btn: { padding: 8 },
  btnText: { fontSize: 16, fontWeight: '600' }
});


const ProfileSetupScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { signupToken } = useLocalSearchParams();

  // Data States
  const [colleges, setColleges] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  // Prompt States
  const [promptConfig, setPromptConfig] = useState({ visible: false, type: '', title: '', placeholder: '' });

  // Form State
  const [form, setForm] = useState({
    collegeId: '',
    batch: '',   
    section: '', 
  });
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch Colleges
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
    // If it's a locally added custom college, it won't have batches from server
    if (form.collegeId && !form.collegeId.startsWith('custom_')) {
      fetchBatches(form.collegeId);
    } else {
      setBatches([]);
    }
    setForm(prev => ({ ...prev, batch: '', section: '' }));
  }, [form.collegeId]);

  const fetchBatches = async (collegeId) => {
    try {
      const response = await authService.getBatches(collegeId);
      if (response.success) setBatches(response.data);
    } catch (error) {
      console.log('Fetch Batches Error', error);
    }
  };

  // 3. Fetch Sections when Batch Changes
  useEffect(() => {
    if (form.batch && !form.batch.startsWith('custom_')) {
      fetchSections(form.batch);
    } else {
      setSections([]);
    }
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


  // --- Format Data for Selectors ---
  const collegeOptions = useMemo(() => colleges.map(c => ({
    label: c.name,
    value: c.collegeId || c._id,
    isVerified: c.isVerified !== undefined ? c.isVerified : true // Default to true for existing ones if no field
  })), [colleges]);

  const getBatchLabel = (b) => b.name || `${b.year} (${b.program})`;
  const batchOptions = useMemo(() => batches.map(b => ({
    label: getBatchLabel(b),
    value: b._id,
    isVerified: b.isVerified !== undefined ? b.isVerified : true
  })), [batches]);

  const getSectionLabel = (s) => s.name?.includes('Section') ? s.name : `Section ${s.name}`;
  const sectionOptions = useMemo(() => sections.map(s => ({
    label: getSectionLabel(s),
    value: s._id,
    isVerified: s.isVerified !== undefined ? s.isVerified : true
  })), [sections]);


  // --- Handle Custom Additions ---
  const handleAddCollege = (customName) => {
    const customId = `custom_col_${Date.now()}`;
    const newCollege = { _id: customId, collegeId: customId, name: customName, isVerified: false };
    setColleges(prev => [...prev, newCollege]);
    setForm(prev => ({ ...prev, collegeId: customId }));
  };

  const submitPrompt = (text) => {
    if (!text.trim()) {
      setPromptConfig({ ...promptConfig, visible: false });
      return;
    }
    
    if (promptConfig.type === 'batch') {
      const customId = `custom_batch_${Date.now()}`;
      const newBatch = { _id: customId, name: text, year: text, program: 'Custom', isVerified: false };
      setBatches(prev => [...prev, newBatch]);
      setForm(prev => ({ ...prev, batch: customId }));
    } else if (promptConfig.type === 'section') {
      const customId = `custom_sec_${Date.now()}`;
      const newSection = { _id: customId, name: text, isVerified: false };
      setSections(prev => [...prev, newSection]);
      setForm(prev => ({ ...prev, section: customId }));
    }
    setPromptConfig({ ...promptConfig, visible: false });
  };


  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // In the future: if IDs start with `custom_`, you might need to send them as names strings 
      // or to a different endpoint depending on backend logic. For now, sending as is.
      const payload = {
        collegeId: form.collegeId,
        batch: form.batch,
        section: form.section
      };

      // Handle custom fields based on your backend integration plan.
      // If backend receives ID, send ID. If it's a new one, maybe send a flag or the raw name.
      if (form.collegeId.startsWith('custom_')) payload.customCollegeName = colleges.find(c => c.collegeId === form.collegeId)?.name;
      if (form.batch.startsWith('custom_')) payload.customBatchName = batches.find(b => b._id === form.batch)?.name;
      if (form.section.startsWith('custom_')) payload.customSectionName = sections.find(s => s._id === form.section)?.name;

      const response = await authService.signupComplete(payload, signupToken);

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
            data={collegeOptions}
            value={form.collegeId}
            onSelect={(val) => setForm(prev => ({ ...prev, collegeId: val }))}
            onAddPress={handleAddCollege}
          />

          <AppDropdown 
            label="Batch / Year"
            value={form.batch}
            options={batchOptions}
            onSelect={(val) => setForm(prev => ({ ...prev, batch: val }))}
            onAddPress={() => setPromptConfig({ 
              visible: true, type: 'batch', 
              title: 'Add New Batch', placeholder: 'e.g. 2024 (B.Tech)' 
            })}
            addLabel="Add your Batch"
          />

          <AppDropdown 
            label="Section"
            value={form.section}
            options={sectionOptions}
            onSelect={(val) => setForm(prev => ({ ...prev, section: val }))}
            onAddPress={() => setPromptConfig({ 
              visible: true, type: 'section', 
              title: 'Add New Section', placeholder: 'e.g. A or G1' 
            })}
             addLabel="Add your Section"
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

      {/* Reusable Input Modal */}
      <CustomPrompt 
        visible={promptConfig.visible} 
        title={promptConfig.title} 
        placeholder={promptConfig.placeholder}
        onCancel={() => setPromptConfig({ ...promptConfig, visible: false })}
        onSubmit={submitPrompt}
        colors={colors}
      />
    </ScreenWrapper>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
    zIndex: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
});

export default ProfileSetupScreen;