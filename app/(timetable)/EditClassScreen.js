import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity, Alert, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";

// Components
import { TimePickerInput } from "../../src/components/common/TimePickerInput";
import { TypeSelector } from "../../src/components/common/TypeSelector";
import { Dropdown } from "../../src/components/common/Dropdown";
import { ConfirmationModal } from "../../src/components/common/ConfirmationModal";

import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";


export default function EditClassScreen() {
  const router = useRouter();
  const { classData, initialDay } = useLocalSearchParams(); // initialDay: 'Mon', 'Tue'...
  const theme = useTheme();
  
  const existingClass = classData ? JSON.parse(classData) : null;
  const isEditing = existingClass && (existingClass.id || existingClass._id); 

  // Map Short Day to Full Day
  const dayMap = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };

  const getNextDateForDay = (dayName) => {
      // dayName might be "Mon" or "Monday"
      const fullDay = dayMap[dayName] || dayName || "Monday";
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetIndex = days.indexOf(fullDay);
      if(targetIndex === -1) return new Date();

      const date = new Date();
      const currentDay = date.getDay();
      
      let dist = targetIndex - currentDay;
      if (dist < 0) dist += 7; // Next occurrence
      date.setDate(date.getDate() + dist);
      return date;
  };

  // Helper to parse "HH:MM" to Date
  const parseTime = (timeStr) => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // 1. Central State
  const [form, setForm] = useState({
    subject: existingClass?.subjectId || existingClass?.subject?._id || "", 
    subjectName: existingClass?.subjectName || existingClass?.subject?.name || "Selected Subject", 
    startTime: existingClass?.startTime ? parseTime(existingClass.startTime) : new Date(), 
    endTime: existingClass?.endTime ? parseTime(existingClass.endTime) : new Date(),
    location: existingClass?.location || existingClass?.room || "",
    faculty: existingClass?.instructor || existingClass?.teacher || "",
    type: existingClass?.type || "Lecture",
    // Unified Date Field
    newDate: existingClass?.date ? new Date(existingClass.date) : (initialDay ? getNextDateForDay(initialDay) : new Date())
  });

  const { userToken } = React.useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);

  React.useEffect(() => {
     if (isEditing) return; 
      const fetchSubjects = async () => {
          try {
              const res = await authService.getSubjects(userToken);
              if (res.success && res.data) {
                  setSubjects(res.data.map(s => ({ 
                      label: s.name, 
                      value: s._id,
                      facultyName: s.facultyName,
                      type: s.type
                  })));
                  
                  if (!form.subject && res.data.length > 0) {
                      setForm(prev => ({ ...prev, subject: res.data[0]._id }));
                  }
              }
          } catch (e) {
              console.log("Failed to fetch subjects", e);
          }
      };
      fetchSubjects();
  }, [userToken, isEditing]);

  const formatTimeHHMM = (date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const toLocalISOString = (date) => {
      const offset = date.getTimezoneOffset() * 60000; 
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    try {
      if (!isEditing) {
          if (!form.subject) {
            Alert.alert("Required", "Please select a subject");
            return;
          }

        // Add Extra Class
        const startTimeStr = formatTimeHHMM(form.startTime);
        const endTimeStr = formatTimeHHMM(form.endTime);
        const dateStr = toLocalISOString(form.newDate); // Use User Selected Date

        const payload = {
          subjectId: form.subject, 
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          room: form.location,
          teacher: form.faculty,
          type: form.type || "Extra"
        };
        
        const res = await authService.addExtraClass(userToken, payload);
        if(res.success) {
            DeviceEventEmitter.emit('REFRESH_DATA');
            Alert.alert("Success", "Extra class added successfully", [{ text: "OK", onPress: () => router.back() }]);
        } else {
             Alert.alert("Error", res.message || "Failed to add class");
        }

      } else {
         // Reschedule Class Logic
         const classId = existingClass.id || existingClass._id;
         const payload = {
             newDate: toLocalISOString(form.newDate),
             newStartTime: formatTimeHHMM(form.startTime),
             newEndTime: formatTimeHHMM(form.endTime),
             room: form.location
         };

         const res = await authService.rescheduleClass(userToken, classId, payload);
         
         if (res.success) {
            DeviceEventEmitter.emit('REFRESH_DATA');
            Alert.alert("Success", "Class rescheduled successfully", [{ text: "OK", onPress: () => router.back() }]);
         } else {
            Alert.alert("Error", res.message || "Failed to reschedule class");
         }
      }
    } catch (error) {
        Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const [modalVisible, setModalVisible] = useState(false);

  const handleDelete = () => {
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setModalVisible(false);
      const classId = existingClass?.id || existingClass?._id;
      if (classId) {
        const res = await authService.cancelClass(userToken, classId, "Faculty is on leave");
        if (res.success) {
          DeviceEventEmitter.emit('REFRESH_DATA');
          Alert.alert("Success", "Class cancelled successfully", [{ text: "OK", onPress: () => router.back() }]);
        }
      } else {
        router.back();
      }
    } catch (error) {
       Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={{ width: 40 }} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fonts.bold }]}>{isEditing ? "Edit Class" : "Add Extra Class"}</Text>
        {isEditing ? (
            <TouchableOpacity onPress={handleDelete}>
              <MaterialIcons name="event-busy" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Subject Input */}
        <View style={styles.inputGroup}>
           {isEditing ? (
              <View>
                  <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>Subject</Text>
                  <View style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, justifyContent: 'center' }]}>
                      <Text style={{ fontSize: 16, color: theme.textPrimary, fontFamily: theme.fonts.semiBold }}>
                          {form.subjectName || existingClass.subject?.name || "Refresher Class"}
                      </Text>
                  </View>
              </View>
           ) : (
                <Dropdown 
                  label="Subject Name"
                  value={form.subject}
                  options={subjects}
                  searchable={true}
                  placeholder="Select Subject" 
                  onSelect={(val) => {
                      const selected = subjects.find(s => s.value === val);
                      setForm({
                          ...form, 
                          subject: val,
                          faculty: selected?.facultyName || form.faculty, 
                          type: selected?.type || form.type
                      });
                  }}
                />
           )}
        </View>

        {/* Unified Date Picker for Add & Edit - Below Subject */}
        <View style={styles.inputGroup}>
            <TimePickerInput 
                label="Date" 
                value={form.newDate} 
                mode="date"
                onChange={(d) => setForm({...form, newDate: d})} 
            />
        </View>

        {/* Time Row */}
        <View style={styles.row}>
          <TimePickerInput label="Start Time" value={form.startTime} onChange={(d) => setForm({...form, startTime: d})} />
          <View style={{ width: 16 }} />
          <TimePickerInput label="End Time" value={form.endTime} onChange={(d) => setForm({...form, endTime: d})} />
        </View>

        {/* Room Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>Room / Location</Text>
          <View style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <MaterialIcons name="location-on" size={20} color={theme.placeholder} />
            <TextInput 
              style={[styles.textInput, { color: theme.textPrimary, fontFamily: theme.fonts.medium }]}
              value={form.location}
              onChangeText={(t) => setForm({...form, location: t})}
              placeholder="e.g. Hall 101"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        {/* Faculty & Type - Only for New Class */}
        {!isEditing && (
            <>
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>Faculty Name</Text>
                    <Text style={[styles.optional, { fontFamily: theme.fonts.medium }]}>Optional</Text>
                  </View>
                  <View style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                    <MaterialIcons name="person" size={20} color={theme.placeholder} />
                    <TextInput 
                      style={[styles.textInput, { color: theme.textPrimary, fontFamily: theme.fonts.medium }]}
                      value={form.faculty}
                      onChangeText={(t) => setForm({...form, faculty: t})}
                      placeholder="e.g. Dr. Smith"
                      placeholderTextColor={theme.placeholder}
                    />
                  </View>
                </View>

                <TypeSelector selected={form.type} onSelect={(t) => setForm({...form, type: t})} />
            </>
        )}

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background + 'E6' }]}>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.primary }]}>
          <Text style={[styles.saveBtnText, { fontFamily: theme.fonts.bold }]}>Save Class</Text>
        </TouchableOpacity>
        
        {isEditing && (
            <View style={styles.footerRow}>
              <TouchableOpacity onPress={handleDelete} style={[styles.secBtn, { borderColor: theme.dangerBorder || theme.danger }]}>
                <MaterialIcons name="event-busy" size={18} color={theme.dangerText || theme.danger} />
                <Text style={[styles.secBtnText, { color: theme.dangerText || theme.danger, fontFamily: theme.fonts.semiBold }]}>Cancel Class</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()} style={[styles.secBtn, { borderColor: theme.border }]}>
                <Text style={[styles.secBtnText, { color: theme.textSecondary, fontFamily: theme.fonts.semiBold }]}>Discard</Text>
              </TouchableOpacity>
            </View>
        )}
      </View>
       
        <ConfirmationModal 
        visible={modalVisible}
        title="Cancel this class?"
        description="This will notify all students that this class instance is cancelled."
        confirmLabel="Cancel Class"
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmDelete}
        isDestructive={true}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18 },
  container: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 8, marginLeft: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optional: { fontSize: 11, color: '#94a3b8' },
  input: { padding: 14, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, height: 54 },
  textInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  row: { flexDirection: 'row' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingBottom: 40, borderTopWidth: 1 },
  saveBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  saveBtnText: { color: '#fff', fontSize: 18 },
  footerRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  secBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secBtnText: { }
});