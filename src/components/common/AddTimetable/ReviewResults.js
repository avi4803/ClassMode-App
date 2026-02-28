import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { AuthContext } from '../../../context/AuthContext';
import authService from '../../../services/authService';
import { Dropdown } from '../Dropdown';
import { TimePickerInput } from '../TimePickerInput';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ReviewResults = ({ data, onBack, onVerify }) => {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [subjects, setSubjects] = useState([]);

  // Fetch subjects for dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
        try {
            const res = await authService.getSubjects(userToken);
            if (res.success && res.data) {
                setSubjects(res.data.map(s => ({ 
                    label: s.name, 
                    value: s._id,
                    subjectCode: s.code,
                    room: s.defaultRoom || ""
                })));
            }
        } catch (e) {
            console.log("Failed to fetch subjects", e);
        }
    };
    fetchSubjects();
  }, [userToken]);

  // Process data for summaries
  const [localSchedule, setLocalSchedule] = useState((data?.schedule || []).map(item => ({
    ...item,
    timeString: `${item.startTime} - ${item.endTime}`
  })));

  const totalClasses = localSchedule.length;
  const uniqueSubjects = new Set(localSchedule.map(s => s.subject)).size;

  const filteredSchedule = localSchedule.map((item, index) => ({...item, originalIndex: index})).filter(item => 
    item.day.startsWith(selectedDay) 
  );

  const updateClass = (originalIndex, field, value) => {
      const updated = [...localSchedule];
      updated[originalIndex] = { ...updated[originalIndex], [field]: value };
      
      // Update timeString if start/end changes
      if (field === 'startTime' || field === 'endTime') {
          updated[originalIndex].timeString = `${updated[originalIndex].startTime} - ${updated[originalIndex].endTime}`;
      }
      
      setLocalSchedule(updated);
  };
  
  const deleteClass = (originalIndex) => {
      const updated = localSchedule.filter((_, idx) => idx !== originalIndex);
      setLocalSchedule(updated);
  };

  const fullDayMap = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday'
  };

  const addClass = () => {
      setLocalSchedule([...localSchedule, {
          day: fullDayMap[selectedDay] || selectedDay,
          subject: '',
          startTime: '09:00',
          endTime: '10:00',
          timeString: '09:00 - 10:00',
          room: '',
          subjectCode: '',
          type: 'Lecture' // Default
      }]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 1. Header (Sticky-ish) */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Review Timetable</Text>
        </View>
        
        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={[styles.summaryCard, { backgroundColor: colors.cardSlate }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Classes</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{totalClasses}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.cardSlate }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Subjects</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{uniqueSubjects}</Text>
            </View>
        </View>
      </View>

      
        <View style={[styles.dayContainer, { backgroundColor: colors.background,  borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayBtn,
                  selectedDay === day && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
                ]}
              >
                <Text style={[
                  styles.dayText,
                  { color: selectedDay === day ? colors.primary : colors.textSecondary, fontWeight: selectedDay === day ? '700' : '500' }
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.addBtn}>
            <MaterialIcons name="more-horiz" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >

        {/* 3. Cards List */}
        <View style={styles.listContainer}>
          {filteredSchedule.length > 0 ? (
            filteredSchedule.map((item, index) => (
              <ResultCard 
                key={index}
                item={item}
                subjects={subjects}
                updateClass={updateClass}
                onDelete={() => deleteClass(item.originalIndex)}
                lowConfidence={false} 
              />
            ))
          ) : (
             <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>
                No classes found for {selectedDay}
             </Text>
          )}
        </View>
            
        {/* Add Class Button */}
        <TouchableOpacity style={[styles.addClassBtn, { borderColor: colors.primary }]} onPress={addClass}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        {/* 4. Bottom Actions */}
        <View style={[styles.bottomActions, { borderTopColor: colors.border }]}>
           <Text style={[styles.bottomHint, { color: colors.textSecondary }]}>Something not right?</Text>
           <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                 <MaterialIcons name="refresh" size={20} color={colors.textSecondary} />
                 <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Retry Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                 <MaterialIcons name="upload-file" size={20} color={colors.textSecondary} />
                 <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Upload Another</Text>
              </TouchableOpacity>
           </View>
        </View>
        
        <View style={{ height: 100 }} /> 
        </ScrollView>
      
      {/* 5. Fixed Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => {
                const cleanSchedule = localSchedule.map(({ timeString, originalIndex, ...rest }) => rest);
                onVerify(cleanSchedule);
            }}
        >
          <Text style={styles.saveBtnText}>Confirm & Save Timetable</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ResultCard = ({ item, subjects, updateClass, lowConfidence, onDelete }) => {
  const colors = useTheme();

  // Helper to parse "HH:MM" to Date
  const parseTime = (timeStr) => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTimeHHMM = (date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSubjectSelect = (val) => {
    const selected = subjects.find(s => s.value === val);
    updateClass(item.originalIndex, 'subject', val); // Store ID if possible
    
    if (selected) {
        updateClass(item.originalIndex, 'subjectCode', selected.subjectCode);
        // Optional: Auto-fill room if available
        // if (selected.room) updateClass(item.originalIndex, 'room', selected.room);
    }
  };
  
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: lowConfidence ? colors.warningBg : colors.card,
        borderColor: lowConfidence ? colors.warningBorder : colors.border 
      }
    ]}>
      {/* Subject Row */}
      <View style={styles.cardRowTop}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Dropdown 
            label="Subject"
            value={item.subject}
            options={subjects}
            searchable={true}
            placeholder={item.subject || "Select Subject"} 
            onSelect={handleSubjectSelect}
          />
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Details Grid */}
      <View style={styles.cardGrid}>
        <View style={{ flex: 1 }}>
          <TimePickerInput 
            label="Start Time" 
            value={parseTime(item.startTime)} 
            onChange={(d) => updateClass(item.originalIndex, 'startTime', formatTimeHHMM(d))} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <TimePickerInput 
            label="End Time" 
            value={parseTime(item.endTime)} 
            onChange={(d) => updateClass(item.originalIndex, 'endTime', formatTimeHHMM(d))} 
          />
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Room</Text>
          <TextInput 
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.inputBg }]} 
            value={item.room} 
            onChangeText={(text) => updateClass(item.originalIndex, 'room', text)}
            placeholder="Room No." 
            placeholderTextColor={colors.textSecondary}
          />
      </View>

      {lowConfidence && (
         <View style={[styles.warningPill, { backgroundColor: colors.warningBorder }]}>
            <Text style={[styles.warningText, { color: colors.warningText }]}>Low confidence</Text>
         </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Header
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 20 : 16, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  headerSub: { textAlign: 'center', fontSize: 13 },

  scrollContent: { },
  
  // Day Selector
  dayContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, marginTop: 8 },
  dayScroll: { gap: 8, paddingRight: 16 },
  dayBtn: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 4 },
  dayText: { fontSize: 13 },
  addBtn: { marginLeft: 8 },

  // List
  listContainer: { padding: 16, gap: 16, paddingBottom: 0 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardRowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  inputLabel: { fontSize: 13, marginBottom: 8, marginLeft: 4, fontWeight: '600' },
  input: { padding: 14, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  deleteBtn: { padding: 4, marginTop: 24 },
  
  cardGrid: { flexDirection: 'row', gap: 16, marginTop: 4 },
  
  warningPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 12 },
  warningText: { fontSize: 11, fontWeight: '700' },

  // Bottom Actions
  bottomActions: { marginTop: 16, borderTopWidth: 1, padding: 24, paddingBottom: 40 },
  bottomHint: { textAlign: 'center', fontSize: 14, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  actionBtnText: { fontSize: 14, fontWeight: '600' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 30, borderTopWidth: 1 },
  saveBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  addClassBtn: { 
    marginHorizontal: 16, 
    height: 56, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 8
  },
  
  summaryCard: { flex: 1, padding: 12, borderRadius: 10 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
});