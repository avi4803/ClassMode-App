import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";

// Components
import { AnimatedSwitch } from "../../src/components/common/AnimatedSwitch";
import { TimeSelector } from "../../src/components/TimeSelector";
import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";

export default function NotificationSettingsScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);

  // 1. Centralized State (Ready for Backend Binding)
  const [settings, setSettings] = useState({
    reminderTime: 10, // 10, 15, 30
    oneDayBefore: true,
    classReminders: true,
    attendanceAlerts: true,
    adminAnnouncements: true,
    enableAll: true,
  });

  // 2. Logic to handle "Enable All" sync
  const toggleSetting = (key) => {
    setSettings((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      
      // If toggling 'enableAll', flip everything
      if (key === 'enableAll') {
        const newVal = !prev.enableAll;
        return {
          ...prev,
          enableAll: newVal,
          classReminders: newVal,
          attendanceAlerts: newVal,
          adminAnnouncements: newVal,
          oneDayBefore: newVal,
        };
      }
      
      // If manually toggling others, check if we need to turn off "enableAll"
      if (!newState[key]) {
        newState.enableAll = false;
      } else {
        // Optional: If all are now true, turn "enableAll" back on
        const allOn = newState.classReminders && newState.attendanceAlerts && newState.adminAnnouncements && newState.oneDayBefore;
        if (allOn) newState.enableAll = true;
      }
      
      return newState;
    });
  };

  const setTime = (time) => setSettings(prev => ({ ...prev, reminderTime: time }));

  // Mock Backend Save (Debounce this in production)
  // Backend Sync for Class Reminders
  useEffect(() => {
    const syncSettings = async () => {
      if (!userToken) return;

      // Logic: If classReminders is on, send [reminderTime]. If off, send [].
      const payload = settings.classReminders ? [settings.reminderTime] : [];
      
      try {
        await authService.updateReminderSettings(userToken, { settings: payload });
      } catch (error) {
        console.log("Error syncing settings:", error);
      }
    };

    const timer = setTimeout(syncSettings, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [settings.classReminders, settings.reminderTime, userToken]);

  // Backend Sync for Daily Summary (One-Day-Before)
  useEffect(() => {
    const syncDailySummary = async () => {
      if (!userToken) return;

      const payload = { dailySummaryEnabled: settings.oneDayBefore };
      try {
        await authService.updateReminderSettings(userToken, payload);
      } catch (error) {
        console.log("Error syncing daily summary:", error);
      }
    };

    const timer = setTimeout(syncDailySummary, 500);
    return () => clearTimeout(timer);
  }, [settings.oneDayBefore, userToken]);

  // Helper component for Rows to keep JSX clean
  const NotificationRow = ({ icon, title, subtitle, settingKey, color }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: color.bg }]}>
          <MaterialIcons name={icon} size={22} color={color.text} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <AnimatedSwitch 
        value={settings[settingKey]} 
        onValueChange={() => toggleSetting(settingKey)} 
      />
      </View>
      
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        
        {/* Header - Custom Component Placeholder */}
        <View style={styles.headerSpacer} /> 
        <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Notification Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Section 1: Class Reminders */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Class Reminders</Text>
            
            <TimeSelector selectedTime={settings.reminderTime} onSelect={setTime} />
            
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Receive a reminder before your class starts. ⏱️
            </Text>
          </View>

          {/* Section 2: One Day Before */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.simpleRow}>
              <View>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>One-Day-Before Reminder</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Get a heads-up for tomorrow's schedule.</Text>
              </View>
              <AnimatedSwitch 
                value={settings.oneDayBefore} 
                onValueChange={() => toggleSetting('oneDayBefore')} 
              />
            </View>
          </View>

          {/* Section 3: Notification Types */}
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>Notification Types</Text>
          <View style={[styles.card, { backgroundColor: colors.card, padding: 0 }]}>
            <NotificationRow 
              icon="school" 
              title="Class reminders" 
              subtitle="Time-sensitive class alerts."
              settingKey="classReminders"
              color={{ bg: colors.bgIndigo, text: colors.primary }}
            />
            <NotificationRow 
              icon="checklist" 
              title="Attendance alerts" 
              subtitle="Updates on your attendance."
              settingKey="attendanceAlerts"
              color={{ bg: colors.bgLime, text: colors.accentLime }} // Uses your Green Palette
            />
            <NotificationRow 
              icon="campaign" 
              title="Admin announcements" 
              subtitle="Important college notices."
              settingKey="adminAnnouncements"
              color={{ bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' }} // Yellow Palette
            />
          </View>

          {/* Section 4: Enable All */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.simpleRow}>
              <Text style={[styles.rowTitle, { fontSize: 16, color: colors.textPrimary }]}>Enable all notifications</Text>
              <AnimatedSwitch 
                value={settings.enableAll} 
                onValueChange={() => toggleSetting('enableAll')} 
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  headerSpacer: { height: 10 }, 
  header: { paddingHorizontal: 20, marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 20, fontFamily: 'Urbanist_700Bold' },
  
  card: { borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold', marginBottom: 12 },
  helperText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', marginTop: 12, textAlign: 'center' },
  
  sectionHeader: { fontSize: 18, fontFamily: 'Urbanist_700Bold', marginBottom: 12, marginLeft: 4 },
  
  simpleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textContainer: { flex: 1 }, // Changed from gap to flex for better text wrapping
  rowTitle: { fontSize: 15, fontFamily: 'Urbanist_700Bold' },
  rowSub: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', marginTop: 2 },
});