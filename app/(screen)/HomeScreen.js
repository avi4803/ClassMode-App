import React, { useState, useCallback, useContext, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, StatusBar, ActivityIndicator, RefreshControl, DeviceEventEmitter, Linking ,TouchableOpacity} from "react-native";
import { useTheme } from "../../src/hooks/useTheme";
import { useRef } from "react";
import { router, useFocusEffect } from "expo-router";
import { useScrollToTop } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from "@expo/vector-icons";
import Animated , { FadeInUp} from "react-native-reanimated";


// Component Imports
import { DashboardHeader } from "../../src/components/common/HomeScreen/DashboardHeader";
import { StatCard } from "../../src/components/common/HomeScreen/StatCard";
import { UpNextCard } from "../../src/components/common/HomeScreen/UpNextCard";
import { ClassItem } from "../../src/components/common/HomeScreen/ClassItem";
import HolidayCard from "../../src/components/common/HolidayCard";
import { AttendanceCard } from "../../src/components/common/HomeScreen/AttendanceCard";
import { QuickAction } from "../../src/components/common/HomeScreen/QuickAction";
import { ClassToggle } from "../../src/components/common/HomeScreen/ClassToggle";
import AppToast from "../../src/components/common/AppToast";

import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";
import attendanceService from "../../src/services/attendanceService";

const CACHE_KEY = 'DASHBOARD_DATA';

export default function DashboardScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', timestamp: 0 });
  const [lastUpdated, setLastUpdated] = useState("");

  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  // Initial Data State
  const [data, setData] = useState({
    user: { name: "Student", section: "-", batch: "-" },
    stats: { total: 0, cancelled: 0 },
    upNext: null,
    attendance: { percentage: 0, present: 0, waiting: 0, absent: 0, dateRange: "Current" },
    classes: [],
    notifications: [],
    roles: []
  });

  const transformData = (apiData) => {
    const { user, schedule, attendance, attendanceStats } = apiData;
    
    // Transform User Data
    const userData = {
      name: user.name?.split(' ')[0] || "Student",
      section: user.section?.name || "-",
      batch: user.batch?.year || "-"
    };

    // Transform Classes
    const todaysClasses = schedule?.todaysClasses || [];
    const classes = todaysClasses.map(cls => ({
      id: cls._id,
      isHoliday: cls.isHoliday,
      cancellationReason: cls.cancellationReason || cls.title || cls.subject?.name,
      title: cls.title || cls.subject?.name || "Untitled Class",
      time: `${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}`,
      location: cls.room || "-",
      status: getStatus(cls.startTime, cls.endTime, cls.status),
      faculty: cls.teacher || cls.subject?.facultyName || "Faculty TBD"
    }));

    // Stats
    const stats = {
      total: todaysClasses.filter(c => !c.isHoliday).length,
      cancelled: todaysClasses.filter(c => c.status === 'cancelled' || c.status === 'rescheduled').length
    };

    // 4. Calculate Up Next (Frontend side logic)
    const getNextClass = (list) => {
      if (!list || list.length === 0) return null;
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                          now.getMinutes().toString().padStart(2, '0');
      
      const upcoming = list.filter(cls => !cls.isHoliday && cls.startTime > currentTime && cls.status !== 'cancelled' && cls.status !== 'rescheduled');
      return upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime))[0] || null;
    };

    const nextCls = getNextClass(todaysClasses);
    let upNext = null;
    
    if (nextCls) {
       upNext = {
         title: nextCls.title || nextCls.subject?.name || "Next Class",
         time: `${formatTime(nextCls.startTime)} - ${formatTime(nextCls.endTime)}`,
         location: nextCls.room || "Room TBD",
         instructor: nextCls.teacher || nextCls.subject?.facultyName || "Faculty TBD",
         countdown: "Upcoming"
       };
    }

    const statsSource = (attendanceStats?.overall || attendance?.overall || {});

    return {
        user: userData,
        stats,
        upNext: upNext ,
        attendance: { 
            percentage: Math.round(parseFloat(statsSource.percentage || 0)),
            present: statsSource.present || 0,
            total: statsSource.total || 0,
            absent: Math.max(0, (statsSource.total || 0) - (statsSource.present || 0)),
            dateRange: apiData.schedule?.dateRange || "Current Semester"
        },
        classes,
        notifications: apiData.notifications || [],
        roles: user.role || []
    };
  };

  const fetchDashboardData = async (forceRefresh = false, silent = false) => {
    if (!userToken) return;
    try {
      if (!silent && !forceRefresh) {
        // Try loading from cache first only if not forced or silent
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setData(transformData(parsed));
          setLoading(false);
          // Still fetch in background to ensure freshness
          fetchDashboardData(true, true);
          return;
        }
      }

      // Fetch both dashboard and accurate attendance stats
      const [dashResponse, statsResponse] = await Promise.all([
        authService.getDashboard(userToken),
        attendanceService.getSubjectAnalytics(userToken)
      ]);
      
      if (dashResponse.success && dashResponse.data) {
        const combinedData = {
          ...dashResponse.data,
          attendanceStats: statsResponse.data || statsResponse // Structure check
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(combinedData));
        setData(transformData(combinedData));
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        setLastUpdated(`Updated: ${timeStr}`);
      }
    } catch (error) {
      console.log("Dashboard Fetch Error", error);
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 1. Listen for notification events to auto-refresh
    const refreshListener = DeviceEventEmitter.addListener('REFRESH_DATA', (event) => {
        console.log('Refreshing Dashboard due to notification:', event?.type);
        fetchDashboardData(true);
    });

    const attendanceListener = DeviceEventEmitter.addListener('REFRESH_ATTENDANCE', () => {
        console.log('Refreshing Dashboard due to attendance update');
        fetchDashboardData(true, true);
    });

    return () => {
        refreshListener.remove();
        attendanceListener.remove();
    };
  }, [userToken]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData(true);
  }, [userToken]);

  // Helpers
  const formatTime = (timeStr) => {
      // timeStr is "09:00". Convert to "09:00 AM"
      if(!timeStr) return "";
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
  };

  const getStatus = (start, end, apiStatus) => {
      if (apiStatus === 'cancelled' || apiStatus === 'rescheduled') return apiStatus;
      // Basic time check
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;

      if (currentMinutes < startMinutes) return 'upcoming';
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return 'now';
      return 'completed';
  };


  const handleScanPress = () => {
    const isAdmin = data.roles.some(r => ['admin', 'local-admin'].includes(r));
    if (isAdmin) {
      router.push('/(scan)/AddTimetableScreen');
    } else {
      setToast({ visible: true, message: "Admin Only", timestamp: Date.now() });
    }
  };

  const handleReportBug = () => {
    // Replace with your Bug Report Form link
    const bugUrl = "https://forms.gle/YMEeHQDMwp78zFTeA";
    Linking.openURL(bugUrl).catch((err) => console.error("Couldn't load page", err));
  };

  const handleRequestFeature = () => {
    // Replace with your Feature Request Form link
    const featureUrl = "https://forms.gle/2CRYDEz4fPxHuU2z9";
    Linking.openURL(featureUrl).catch((err) => console.error("Couldn't load page", err));
  };

  const filteredClasses = data.classes.filter(item => {
    if (filter === "All") return true;
    return item.status === filter.toLowerCase();
  });

  if (loading) {
      return (
          <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: colors.background}}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.textPrimary === '#ffffff' ? 'light-content' : 'dark-content'} />
      
      {/* 1. Header Section */}
      <DashboardHeader 
        userName={data.user.name} 
        section={data.user.section}
        batch={data.user.batch}
        lastUpdated={lastUpdated}
        hasUnread={data.notifications?.some(n => !n.isRead)}
        onPressNotification={() => router.push('/NotificationScreen')}
        onPressSettings={() => router.push('/SettingsScreen')}
        roles={data.roles}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false} 
        ref={scrollRef}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* 2. Stats Grid */}
        <View style={styles.grid}>
          <StatCard label="TOTAL CLASSES" value={data.stats.total} icon="school" colorKey="Purple" />
          <StatCard label="CANCELLED" value={data.stats.cancelled} icon="event-busy" colorKey="Orange" />
        </View>

        {/* 3. Up Next Card or Empty State */}
       
        {data.upNext ? (
          <UpNextCard {...data.upNext} />
        ) : (
           <Animated.View entering={FadeInUp.delay(100)}>
          <View style={[styles.emptyUpNext, { backgroundColor: colors.accentBlue + '20', borderColor: colors.cardBlue }]}>
            <View style={[styles.emptyIconCircle,  { backgroundColor: colors.background }]}>
              <MaterialIcons name="event-available" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.emptyText, { color: colors.textPrimary, fontFamily: 'Urbanist_700Bold' }]}>
                {data.classes.length === 0 ? "No classes for today" : "You're all caught up!"}
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary, fontFamily: 'Urbanist_500Medium' }]}>
                {data.classes.length === 0 ? "Enjoy your extra free time! ☕" : "All classes are finished for today. ✨"}
              </Text>
            </View>
          </View>
          </Animated.View>
        )}

        {/* 4. Today's Classes with Filter Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Classes</Text>
          
          <ClassToggle filter={filter} setFilter={setFilter} />

          {filteredClasses.length > 0 ? (
            filteredClasses.map((item) => (
              item.isHoliday ? (
                <HolidayCard key={item.id} reason={item.cancellationReason} />
              ) : (
                <ClassItem key={item.id} {...item} />
              )
            ))
          ) : (
            <View style={styles.noClassesContainer}>
              <MaterialIcons name="sentiment-very-satisfied" size={40} color={colors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={[styles.noClassesText, { color: colors.textSecondary }]}>
                {filter === "All" ? "No classes scheduled today." : `No ${filter.toLowerCase()} classes found.`}
              </Text>
            </View>
          )}
        </View>

        {/* 5. Attendance Card */}
        <AttendanceCard {...data.attendance} />

        {/* 6. Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.quickHeader}>QUICK ACTIONS</Text>
          <View style={[styles.grid, { marginBottom: 12 }]}>
            <QuickAction 
               icon="qr-code-scanner" 
               label="Scan" 
               badge="ADMIN ONLY"
               onPress={handleScanPress} 
            />
            <QuickAction icon="pin-drop" label="Mark" onPress={() => router.push('/(attendance)/AttendanceHistoryScreen')} />
          </View>

          <View style={{ gap: 10 }}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={handleReportBug}
              style={[styles.wideAction, { backgroundColor: colors.cardSlate }]}
            >
              <View style={[styles.wideIconBox, { backgroundColor: colors.background }]}>
                <MaterialIcons name="bug-report" size={22} color="#f43f5e" />
              </View>
              <Text style={[styles.wideText, { color: colors.textPrimary }]}>Report a Bug</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={handleRequestFeature}
              style={[styles.wideAction, { backgroundColor: colors.cardSlate }]}
            >
              <View style={[styles.wideIconBox, { backgroundColor: colors.background }]}>
                <MaterialIcons name="lightbulb" size={22} color="#eab308" />
              </View>
              <Text style={[styles.wideText, { color: colors.textPrimary }]}>Request New Feature</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollContent: { padding: 20 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { 
    fontSize: 22, 
    fontFamily: 'Urbanist_700Bold', 
    marginBottom: 16
  },
  quickHeader: { 
    fontSize: 12, 
    fontFamily: 'Urbanist_700Bold', 
    color: '#64748b', 
    letterSpacing: 1, 
    marginBottom: 12, 
    opacity: 0.6 
  },
  emptyUpNext: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderStyle: 'dashed ' 
    
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: { fontSize: 16 },
  emptySubText: { fontSize: 13, marginTop: 2 },
  noClassesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12
  },
  noClassesText: {
    fontSize: 15,
    fontFamily: 'Urbanist_500Medium',
    textAlign: 'center'
  },
  wideAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  wideIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold'
  }
});