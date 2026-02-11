import React, { useState, useMemo, useContext, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../src/hooks/useTheme";
import { MaterialIcons } from "@expo/vector-icons";

// Components
import { TimelineCard } from "../../src/components/common/TimetableScreen/TimelineCard.js";
import { ConfirmationModal } from "../../src/components/common/ConfirmationModal";
import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";
import AppToast from "../../src/components/common/AppToast";


const fullDayMap = { 
  'Mon': 'Monday', 
  'Tue': 'Tuesday', 
  'Wed': 'Wednesday', 
  'Thu': 'Thursday', 
  'Fri': 'Friday', 
  'Sat': 'Saturday',
  'Sun': 'Sunday'
};




export default function ScheduleDetailScreen() {
  
  const theme = useTheme();
  const colors = theme; // Backward compatibility for some parts if needed, but I'll use theme mainly
  const router = useRouter();
  const { userToken } = useContext(AuthContext);
  const { selectedDay } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  
  // Edit Mode & Roles
  const [isEditMode, setIsEditMode] = useState(false);
  const [userRole, setUserRole] = useState([]);
  
  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTimestamp, setToastTimestamp] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastTimestamp(Date.now());
    setToastVisible(true);
  };

  const fetchSchedule = useCallback(async () => {
    try {
      // 1. Fetch User Roles (from Dashboard) if not already set
      if (userRole.length === 0) {
        const dashRes = await authService.getDashboard(userToken);
        if (dashRes.success && dashRes.data?.user?.role) {
          setUserRole(dashRes.data.user.role);
        }
      }

      // 2. Fetch Weekly Classes
      const response = await authService.getWeeklySchedule(userToken);
      if (response.success && response.data) {
        let classes = response.data.classes || [];
        
        if (selectedDay) {
             const targetDayClasses = classes.filter(item => {
                 const dateObj = new Date(item.date);
                 const shortDay = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                 return shortDay === selectedDay;
             });
             classes = targetDayClasses;
        }
        
        const extractName = (data) => {
          if (!data) return '';
          if (typeof data === 'string') return data;
          return data.name || data.title || '';
        };
        
        // Transform Backend Data to UI Model
        const uiClasses = classes.map(item => ({
             id: item._id,
             type: 'class',
             startTime: formatTime24to12(item.startTime),
             endTime: formatTime24to12(item.endTime),
             title: item.title || extractName(item.subject) || "No Title",
             location: item.room || extractName(item.roomObj) || "Room TBD",
             instructor: item.teacher || extractName(item.teacherObj) || item.subject?.facultyName || "TBD",
             status: mapStatus(item),
             rawStart: parseTime(item.startTime), 
             rawEnd: parseTime(item.endTime),
             // Pass-through raw data for editing
             originalStartTime: item.startTime,
             originalEndTime: item.endTime,
             originalDate: item.date,
             subjectId: item.subject?._id || item.subject
        }));

        uiClasses.sort((a, b) => a.rawStart - b.rawStart);

        const processedList = [];
        let lastEndTime = 9 * 60; 
        const dayEndTime = 17 * 60; 

        uiClasses.forEach(cls => {
            const gap = cls.rawStart - lastEndTime;
            if (gap >= 10) {
               processedList.push({
                   id: `free-${lastEndTime}`,
                   type: 'free',
                   startTime: formatMinutesToTime(lastEndTime),
                   duration: formatDuration(gap),
                   rawStart: lastEndTime, // Added for Edit
                   rawEnd: cls.rawStart   // Added for Edit
               });
            }
            processedList.push(cls);
            lastEndTime = cls.rawEnd;
        });

        setScheduleData(processedList);
      }
    } catch (error) {
      console.log('Fetch Schedule Detail Error', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userToken, selectedDay, userRole.length]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const handleToggleEdit = () => {
      // Check roles: admin or local_admin
      const hasPermission = userRole.some(r => ['admin', 'local_admin'].includes(r));
      
      if (hasPermission) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsEditMode(!isEditMode);
      } else {
          showToast("Edit only allowed for admin");
      }
  };

  const handleEditClass = (item) => {
    if (!isEditMode) return;
    
    if (['Passed', 'Done', 'Completed'].includes(item.status)) {
        showToast("Cannot edit a passed class");
        return;
    }
    if (item.status === 'Cancelled') {
        showToast("Cannot edit a cancelled class");
        return;
    }

    const editData = {
        id: item.id,
        subjectId: item.subjectId,
        subjectName: item.title,
        startTime: item.originalStartTime,
        endTime: item.originalEndTime,
        location: item.location,
        instructor: item.instructor,
        date: item.originalDate
    };

    router.push({
      pathname: "/(timetable)/EditClassScreen",
      params: { 
          classData: JSON.stringify(editData) 
      }
    });
  };

  // Helpers
  const getStatus = (day, startTime, endTime) => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    // Convert current day to Mon-Sun index (0-6)
    const currentDayIndex = (now.getDay() + 6) % 7;
    const classDayIndex = dayNames.indexOf(day);

    if (classDayIndex === -1) return "Upcoming";

    // If viewing a previous week day?
    // Wait, this logic assumes "This Week". Weekly schedule usually implies current week.
    // Ideally we should compare full dates, but "Weekly Schedule" implies cyclical or current week.
    // Assuming current week for simplicity as per TimetableScreen logic.
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

  const mapStatus = (item) => {
    const status = item.status?.toLowerCase();
    if (!status || status === 'scheduled' || status === 'active') {
        const dateObj = new Date(item.date);
        const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        return getStatus(day, item.startTime, item.endTime);
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDuration = (minutes) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      if (h > 0 && m > 0) return `${h} Hr ${m} Min`;
      if (h > 0) return `${h} Hour${h > 1 ? 's' : ''}`;
      return `${m} Min`;
  };

  const formatMinutesToTime = (totalMinutes) => {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hours = h % 12 || 12;
      const minStr = m < 10 ? `0${m}` : m;
      return `${hours}:${minStr} ${ampm}`;
  };

  const formatTime24to12 = (timeStr) => {
      if(!timeStr) return "";
      const [h, m] = timeStr.split(':');
      let hours = parseInt(h);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${m} ${ampm}`;
  };

  const parseTime = (timeStr) => {
     const [h, m] = timeStr.split(':').map(Number);
     return h * 60 + m;
  };
    
  // Actions
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const handleAddClass = (slotItem) => {
    // 1. Determine Day
    let targetDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (selectedDay && fullDayMap[selectedDay]) {
      targetDay = fullDayMap[selectedDay];
    }

    // 2. Format Times for 'EditClassScreen' (HH:MM)
    const formatTo24 = (mins) => {
      const h = Math.floor(mins / 60).toString().padStart(2, '0');
      const m = (mins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const newClassData = {
      day: targetDay,
      startTime: formatTo24(slotItem.rawStart),
      endTime: formatTo24(slotItem.rawEnd)
    };

    // 3. Navigate
    router.push({
      pathname: "/(timetable)/EditClassScreen",
      params: { 
          // Pass as 'prefill' to avoid triggering "Existing Class" mode in EditScreen
          // OR rely on ID check in EditScreen. 
          // Since I am fixing EditScreen logic to check for ID, passing classData is fine 
          // PROVIDED I fix EditScreen.
          // However, to be extra safe and semantic, I could rename param, but EditScreen expects classData.
          // I will stick to classData and fix EditScreen.
          classData: JSON.stringify(newClassData) 
      }
    });
  };
  
  const handleDelete = (id) => {
      setSelectedClassId(id);
      setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setCancelModalVisible(false);
      setLoading(true);
      const res = await authService.cancelClass(userToken, selectedClassId, "Faculty is on leave");
      if (res.success) {
        showToast("Class cancelled successfully");
        fetchSchedule(); // Refresh list
      }
    } catch (error) {
      showToast(error.message || "Failed to cancel class");
    } finally {
      setLoading(false);
    }
  };

return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={{ width: 40 }} /> 
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fonts.bold }]}>
              {isEditMode ? 'Edit Schedule' : (selectedDay ? `${selectedDay === new Date().toLocaleDateString('en-US', {weekday: 'short'}) ? "Today's" : fullDayMap[selectedDay] + "'s"} Schedule` : "Today's Schedule")}
            </Text>
          </View>

          {userRole.some(r => ['admin', 'local_admin'].includes(r)) ? (
            <TouchableOpacity onPress={handleToggleEdit} style={styles.editBtn}>
              <Text style={[styles.editText, { color: theme.primary, fontFamily: theme.fonts.bold }]}>
                {isEditMode ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
             <ActivityIndicator size="large" color={theme.primary} style={{marginTop: 50}} />
          ) : (
            <>
              {/* Continuous Vertical Line */}
              <View style={[styles.verticalLine, { backgroundColor: theme.timelineLine }]} />

              <View style={styles.timelineContainer}>
                {scheduleData.length > 0 ? scheduleData.map((item) => (
                  <View key={item.id} style={styles.timelineRow}>
                    {/* Time Column */}
                    <View style={styles.timeCol}>
                      <Text style={[styles.timeLabel, { color: theme.textSecondary, fontFamily: theme.fonts.semiBold }]}>
                        {item.startTime.split(':')[0]} <Text style={{ fontSize: 10, fontFamily: theme.fonts.medium }}>{item.startTime.split(' ')[1]}</Text>
                      </Text>
                    </View>

                    {/* Content Column */}
                    <View style={styles.contentCol}>
                      {/* Timeline Dot */}
                      <View style={[
                        styles.dot, 
                        { 
                          backgroundColor: item.type === 'free' ? theme.timelineDotFree : theme.primary,
                          borderColor: theme.background,
                        }
                      ]} />

                      {/* The Interactive Card */}
                      <TimelineCard 
                        item={item} 
                        isEditMode={isEditMode} 
                        onDelete={handleDelete}
                        onAdd={handleAddClass}
                        onPress={handleEditClass}
                      />
                    </View>
                  </View>
                )) : (
                    <Text style={{textAlign: 'center', marginTop: 20, color: theme.textSecondary, fontFamily: theme.fonts.medium}}>No schedule for today.</Text>
                )}
              </View>
           </>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>
        
        {/* Render Toast */}
        <AppToast 
          visible={toastVisible} 
          message={toastMessage} 
          timestamp={toastTimestamp}
          onClose={() => setToastVisible(false)} 
        />

        {/* Cancellation Modal */}
        <ConfirmationModal 
          visible={cancelModalVisible}
          title="Cancel this class?"
          description="A notification will be sent to all students about this cancellation."
          confirmLabel="Cancel Class"
          onClose={() => setCancelModalVisible(false)}
          onConfirm={handleConfirmCancel}
          isDestructive={true}
        />

      </SafeAreaView>

      {/* Floating Action Button */}
      {userRole.some(r => ['admin', 'local_admin'].includes(r)) && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={()=> router.push({ pathname: "/(timetable)/EditClassScreen", params: { initialDay: selectedDay } })}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerCenter: { alignItems: 'center'},
  headerTitle: { fontSize: 18 },
  headerDate: { fontSize: 12, marginTop: 2 },
  editBtn: { padding: 8 },
  editText: { fontSize: 16 },
  
  scrollContent: { paddingTop: 20 },
  timelineContainer: { paddingHorizontal: 16, position: 'relative' },
  
  verticalLine: {
    position: 'absolute',
    left: 76, // 16px padding + 60px time width
    top: 20,
    bottom: 0,
    width: 2,
    zIndex: 0,
  },
  timelineRow: { flexDirection: 'row', minHeight: 100 },
  timeCol: { width: 60, alignItems: 'flex-end', paddingRight: 16, paddingTop: 0},
  timeLabel: { fontSize: 14 },
  contentCol: { flex: 1, paddingLeft: 20, paddingBottom: 24, position: 'relative' },
  dot: {
    position: 'absolute',
    left: -8, // Half of dot width (12/2) + border correction
    top: -5,
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 10,
  },

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
  }
});