import { useRef, useState, useContext, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ToastAndroid,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";
import { TimetableCard } from "../../src/components/common/TimetableScreen/TimetableCard";
import AppToast from "../../src/components/common/AppToast";
import { router } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'TIMETABLE_DATA';

export default function TimetableScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const [selectedDay, setSelectedDay] = useState("Tue");
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', timestamp: 0 });
  const [userRole, setUserRole] = useState([]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayMap = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };

  const getStatus = (day, startTime, endTime) => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    // Convert current day to Mon-Sun index (0-6)
    const currentDayIndex = (now.getDay() + 6) % 7;
    const classDayIndex = dayNames.indexOf(day);

    if (classDayIndex === -1) return "Upcoming";

    if (classDayIndex < currentDayIndex) return "Done";
    if (classDayIndex > currentDayIndex) return "Upcoming";

    // Same day checks
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (nowMinutes > endMinutes) return "Done";
    if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) return "Ongoing";
    return "Upcoming";
  };

  const transformData = (classes) => {
    // Group by Day
    const grouped = {};
    days.forEach(d => grouped[d] = []);

    const extractName = (data) => {
      if (!data) return '';
      if (typeof data === 'string') return data;
      return data.name || data.title || '';
    };

    classes.forEach(item => {
       // items now have a 'date' field. Convert to 'Mon', 'Tue' etc.
       const dateObj = new Date(item.date);
       const shortDay = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
       
       if (grouped[shortDay]) {
            grouped[shortDay].push({
                id: item._id,
                subjectId: item.subject?._id || item.subject,
                title: item.title || extractName(item.subject) || "No Title",
                time: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
                location: item.room || extractName(item.roomObj) || "-",
                instructor: item.teacher || extractName(item.instructorObj) || item.subject?.facultyName || "-",
                type: item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase()) : 'Lecture',
                status: (item.status === 'scheduled' || item.status === 'active' || !item.status) 
                        ? getStatus(shortDay, item.startTime, item.endTime) 
                        : item.status, 
                cancellationReason: item.cancellationReason,
                startTime: item.startTime,
                endTime: item.endTime,
                day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
                isFree: false
            });
       }
    });
    return grouped;
  };

  const fetchTimetable = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setScheduleData(transformData(parsed));
          setLoading(false);
          return;
        }
      }

      const response = await authService.getWeeklySchedule(userToken);
      if (response.success && response.data) {
        const classes = response.data.classes || [];
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(classes));
        setScheduleData(transformData(classes));
        
        // Also fetch user role from dashboard if not already set
        if (userRole.length === 0) {
          const dashRes = await authService.getDashboard(userToken);
          if (dashRes.success && dashRes.data?.user?.role) {
            setUserRole(dashRes.data.user.role);
          }
        }
      }
    } catch (error) {
      console.log("Fetch Timetable Error", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimetable();

    // 1. Listen for notification events to auto-refresh
    const refreshListener = DeviceEventEmitter.addListener('REFRESH_DATA', (event) => {
        console.log('Refreshing Timetable due to notification:', event?.type);
        fetchTimetable(true);
    });

    return () => {
        refreshListener.remove();
    };
  }, [userToken]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTimetable(true);
  }, [userToken]);

  const formatTime = (timeStr) => {
    if(!timeStr) return "";
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const currentClasses = scheduleData[selectedDay] || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.timetableBg }}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.header, { backgroundColor: colors.timetableBg }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              My Timetable
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              Weekly Schedule
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.todayBtn, { borderColor: colors.primary }]}
            onPress={() => router.push({ pathname: "ScheduleDetailScreen", params: { selectedDay } })}
          >
            <Text style={[styles.todayText, { color: colors.primary }]}>
              View
            </Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector - Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScroll}
        >
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayBtn,
                {
                  backgroundColor:
                    selectedDay === day ? colors.primary : colors.cardSlate,
                },
                selectedDay === day && styles.activeShadow,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: selectedDay === day ? "#fff" : colors.textPrimary },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.mainContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
           <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 50}} />
        ) : (
          currentClasses.length > 0 ? (
            currentClasses.map((item) =>
              item.isFree ? (
                <View key={item.id} style={styles.freeSlot}>
                  <Text
                    style={[styles.freeText, { color: colors.textSecondary }]}
                  >
                    Free Slot ({item.time})
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    const isAdmin = userRole.some(r => ['admin', 'local_admin'].includes(r));
                    if (!isAdmin) {
                      setToast({ visible: true, message: "Class edit only allowed for admin", timestamp: Date.now() });
                      return;
                    }

                    const status = (item.status || "").toLowerCase();
                    if (status === "done" || status === "completed") {
                      setToast({ visible: true, message: "This class has passed", timestamp: Date.now() });
                    } else if (status === "cancelled") {
                      setToast({ visible: true, message: "This class is cancelled", timestamp: Date.now() });
                    } else {
                      router.push({
                        pathname: "EditClassScreen",
                        params: { classData: JSON.stringify(item) }
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <TimetableCard {...item} />
                </TouchableOpacity>
              )
            )
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-note" size={64} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No classes scheduled
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {userRole.some(r => ['admin', 'local_admin'].includes(r)) && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={()=> router.push({ pathname: "EditClassScreen", params: { initialDay: selectedDay } })}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      <AppToast 
        visible={toast.visible} 
        message={toast.message} 
        timestamp={toast.timestamp}
        onClose={() => setToast({ ...toast, visible: false })} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  headerTitle: { fontSize: 24, fontFamily: 'Urbanist_800ExtraBold' },
  headerSub: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold' },
  todayBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayText: { fontFamily: 'Urbanist_700Bold', fontSize: 14 },
  dayScroll: { gap: 10, paddingVertical: 10 },
  dayBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 25 },
  dayText: { fontSize: 14, fontFamily: 'Urbanist_700Bold' },
  activeShadow: {
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mainContent: { padding: 16, paddingBottom: 100 },
  freeSlot: { paddingVertical: 12, alignItems: "center" },
  freeText: { fontSize: 14, fontFamily: 'Urbanist_500Medium', opacity: 0.7 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: "500" },
});
