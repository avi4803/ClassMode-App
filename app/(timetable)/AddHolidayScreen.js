import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  DeviceEventEmitter 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";
import { useRouter } from "expo-router";
import CustomAlert from "../../src/components/common/CustomAlert";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateRangeModal from "../../src/components/common/AttendanceScreen/DateRangeModal";
import holidayService from "../../src/services/holidayService";
import { AuthContext } from "../../src/context/AuthContext";
import { useContext, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";

const HOLIDAY_CACHE_KEY = 'HOLIDAY_DATA';

export default function AddHolidayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const { userToken } = useContext(AuthContext);
  
  const isEdit = params.mode === 'edit';

  const [form, setForm] = useState({
    title: params.title || "",
    notes: "",
    range: { 
      start: params.startDate || null, 
      end: params.endDate || params.startDate || null 
    }
  });

  const [dateModalVisible, setDateModalVisible] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    title: "", 
    message: "", 
    confirmLabel: "OK", 
    cancelLabel: null,
    onConfirm: null,
    type: 'default'
  });

  const handleDelete = async () => {
    setAlertConfig({
      visible: true,
      title: "Confirm Delete",
      message: "Are you sure you want to cancel/delete this holiday?",
      type: 'warning',
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          const payload = {
            startDate: form.range.start,
            endDate: form.range.end || form.range.start
          };
          const result = await holidayService.deleteHoliday(userToken, payload);
          if (result && result.success) {
            DeviceEventEmitter.emit('REFRESH_HOLIDAYS');
            router.back();
          } else {
            setAlertConfig({
              visible: true,
              title: "Error",
              message: result?.message || "Failed to delete holiday."
            });
          }
        } catch (e) {
            setAlertConfig({
                visible: true,
                title: "Error",
                message: e.message
            });
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      if (!form.title.trim()) {
        setAlertConfig({
          visible: true,
          title: "Required",
          message: "Please enter a reason or title for the holiday.",
        });
        return;
      }
      if (!form.range.start) {
        setAlertConfig({
          visible: true,
          title: "Required",
          message: "Please select a date or date range.",
        });
        return;
      }

      // Format into API standards expected format
      const payload = {
        startDate: form.range.start,
        endDate: form.range.end || form.range.start,
        reason: form.title,
      };

      const result = await holidayService.addHoliday(userToken, payload);

      if (!result || !result.success) {
         setAlertConfig({
             visible: true,
             title: "Error",
             message: result?.message || "Failed to create holiday via backend."
         });
         return;
      }

      // Force a re-fetch on the main holiday screen on success

      // Emit event so HolidayScreen refreshes automatically
      DeviceEventEmitter.emit('REFRESH_HOLIDAYS');
      
      setAlertConfig({
          visible: true,
          title: "Success",
          message: "Holiday added successfully",
          onConfirm: () => router.back()
      });

    } catch (error) {
        setAlertConfig({
            visible: true,
            title: "Error",
            message: error.message || "Something went wrong"
        });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRangeText = () => {
    if (!form.range.start) return "Select Dates";
    if (!form.range.end || form.range.start === form.range.end) return formatDate(form.range.start);
    return `${formatDate(form.range.start)} - ${formatDate(form.range.end)}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
           <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fonts.bold }]}>
          {isEdit ? "Holiday Details" : "Add Holiday"}
        </Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>Reason / Title</Text>
          <View style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <MaterialIcons name="event-note" size={20} color={theme.placeholder} />
            <TextInput 
              style={[styles.textInput, { color: theme.textPrimary, fontFamily: theme.fonts.medium }]}
              value={form.title}
              onChangeText={(t) => !isEdit && setForm({...form, title: t})}
              placeholder="e.g. Diwali break or Exam Leaves"
              placeholderTextColor={theme.placeholder}
              editable={!isEdit}
            />
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>Date / Date Range</Text>
          <TouchableOpacity 
            style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
            onPress={() => !isEdit && setDateModalVisible(true)}
            activeOpacity={isEdit ? 1 : 0.7}
          >
            <MaterialIcons name="calendar-today" size={20} color={form.range.start ? theme.primary : theme.placeholder} />
            <Text style={[styles.textInput, { color: form.range.start ? theme.textPrimary : theme.placeholder, fontFamily: theme.fonts.medium, marginTop: 4 }]}>
              {getRangeText()}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color={theme.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Notes Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fonts.bold }]}>Other Info / Notes</Text>
            <Text style={[styles.optional, { fontFamily: theme.fonts.medium }]}>Optional</Text>
          </View>
          <View style={[styles.inputWithIcon, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
            <MaterialIcons name="info-outline" size={20} color={theme.placeholder} />
            <TextInput 
              style={[styles.textInput, { color: theme.textPrimary, fontFamily: theme.fonts.medium, textAlignVertical: 'top' }]}
              value={form.notes}
              onChangeText={(t) => !isEdit && setForm({...form, notes: t})}
              placeholder={isEdit ? "" : "Add any extra details..."}
              placeholderTextColor={theme.placeholder}
              multiline
              editable={!isEdit}
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background + 'E6', flexDirection: 'row', gap: 12 }]}>
        {isEdit ? (
          <>
            <TouchableOpacity 
              onPress={handleDelete} 
              style={[styles.deleteBtn, { borderColor: theme.statusCritical, backgroundColor: theme.isDark ? '#442a2a' : '#fff1f1', flex: 1 }]}
            >
              <MaterialIcons name="delete-outline" size={22} color={theme.statusCritical} />
              <Text style={[styles.deleteBtnText, { color: theme.statusCritical, fontFamily: theme.fonts.bold }]}>Delete Holiday</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.saveBtn, { backgroundColor: theme.cardSlate || '#94a3b8', flex: 1, shadowColor: 'transparent' }]}
            >
              <Text style={[styles.saveBtnText, { color: theme.textPrimary, fontFamily: theme.fonts.bold }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.primary, flex: 1 }]}>
            <Text style={[styles.saveBtnText, { fontFamily: theme.fonts.bold }]}>Add Holiday</Text>
          </TouchableOpacity>
        )}
      </View>
       
      <CustomAlert 
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          confirmLabel={alertConfig.confirmLabel || "OK"}
          cancelLabel={alertConfig.cancelLabel}
          type={alertConfig.type || 'default'}
          onConfirm={() => {
              if (alertConfig.onConfirm) alertConfig.onConfirm();
              setAlertConfig(prev => ({ ...prev, visible: false }));
          }}
          onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      <DateRangeModal 
        visible={dateModalVisible}
        initialRange={form.range}
        onClose={() => setDateModalVisible(false)}
        onApply={(range) => {
          setForm({...form, range});
          setDateModalVisible(false);
        }}
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
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, height: 54 },
  textInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingBottom: 40, borderTopWidth: 1 },
  saveBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  saveBtnText: { color: '#fff', fontSize: 18 },
  deleteBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', gap: 8 },
  deleteBtnText: { fontSize: 16 },
});
