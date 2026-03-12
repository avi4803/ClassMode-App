import React, { useEffect, useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  DeviceEventEmitter
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming,
  useAnimatedStyle,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut
} from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import { THEME } from '../../src/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';
import attendanceService from '../../src/services/attendanceService';
import DateRangeModal from '../../src/components/common/AttendanceScreen/DateRangeModal';
import HolidayCard from '../../src/components/common/HolidayCard';
import CustomAlert from '../../src/components/common/CustomAlert';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_LENGTH = 314; // 2 * PI * 50
const R = 50;

/**
 * Animated Circular Progress Component (Consistent with AttendanceHistory)
 */
const CircularProgress = ({ percentage, color, colors }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage / 100, { duration: 1500 });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCLE_LENGTH * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.progressWrapper}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Circle
          cx="60"
          cy="60"
          r={R}
          stroke={colors.border} 
          strokeWidth="8"
          fill="none"
          opacity={0.1}
        />
        <AnimatedCircle
          cx="60"
          cy="60"
          r={R}
          stroke={color}
          strokeWidth="8"
          strokeDasharray={CIRCLE_LENGTH}
          animatedProps={animatedProps}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin="60, 60"
        />
      </Svg>
      <View style={styles.percentTextContainer}>
        <Text style={[styles.percentValue, { color: colors.textPrimary }]}>{percentage}%</Text>
      </View>
    </View>
  );
};

const DetailStat = ({ label, value, color, colors, containerStyle }) => (
  <View style={[styles.statItem, containerStyle]}>
    <Text style={[styles.statValue, { color: color || colors.textPrimary }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const HistoryItem = ({ id, date, time, status, colors, onToggle, isHoliday, cancellationReason }) => {
  if (isHoliday) {
    return <HolidayCard reason={cancellationReason} />;
  }
  const isPresent = status.toLowerCase() === 'present';
  const isAbsent = status.toLowerCase() === 'absent';
  
  // Robust Today Detection
  const getIsToday = (dStr) => {
    if (!dStr) return false;
    if (dStr === 'Today') return true;
    
    try {
      const recordDate = new Date(dStr);
      const today = new Date();
      return recordDate.toDateString() === today.toDateString();
    } catch (e) {
      return false;
    }
  };

  const isToday = getIsToday(date);
  
  const formatDisplayDate = (dStr) => {
    if (!dStr) return "TBD";
    if (dStr === 'Today') {
      return new Date().toISOString().split('T')[0];
    }
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;

    // Handle ISO string or other date formats
    const dateObj = new Date(dStr);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0];
    }
    return dStr.split('T')[0]; // Final fallback
  };

  return (
    <View style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.historyDate, { color: colors.textPrimary }]}>{formatDisplayDate(date)}</Text>
        <Text style={[styles.historyTime, { color: colors.textSecondary }]}>{time}</Text>
      </View>

      {isToday ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            activeOpacity={0.6}
            onPress={() => onToggle(id, 'present')}
            style={[
              styles.toggleBtn, 
              isPresent && { backgroundColor: colors.statusPerfect + '20', borderColor: colors.statusPerfect }
            ]}
          >
            <Text style={[styles.toggleBtnText, { color: isPresent ? colors.statusPerfect : colors.textSecondary }]}>P</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.6}
            onPress={() => onToggle(id, 'absent')}
            style={[
              styles.toggleBtn, 
              isAbsent && { backgroundColor: colors.statusCritical + '20', borderColor: colors.statusCritical }
            ]}
          >
            <Text style={[styles.toggleBtnText, { color: isAbsent ? colors.statusCritical : colors.textSecondary }]}>A</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[
          styles.statusBadge, 
          { backgroundColor: isPresent ? colors.badgeGreen : (isAbsent ? colors.badgeRed : colors.border + '20') }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: isPresent ? colors.statusPerfect : (isAbsent ? colors.statusCritical : colors.textSecondary) }
          ]}>
            {status}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function SubjectAttendanceDetail() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const { 
    id, 
    subjectName: initialSubject, 
    professor: initialProfessor, 
    percentage: initialPercentage = 0, 
    attended: initialAttended = 0, 
    total: initialTotal = 0 
  } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'default' });
  
  // Date Filter State
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showModal, setShowModal] = useState(false);

  const fetchDetailData = async (silent = false) => {
    try {
      if (!userToken || !id) return;
      if (!silent) setLoading(true);
      
      const [historyRes, todayRes] = await Promise.all([
        attendanceService.getSubjectHistory(userToken, id, 50, 0, dateRange.start, dateRange.end),
        attendanceService.getTodayDashboard(userToken)
      ]);

      if (historyRes.success || historyRes.data) {
        const { records, stats } = historyRes.data;
        const todayStr = new Date().toDateString();
        const todayDashboardClasses = (todayRes.data || []).filter(cls => 
          (cls.subject?._id === id || cls.subject?.name === initialSubject || cls.subject === id)
        );

        // Track which dashboard sessions have been matched with history
        let matchedDashboardIds = new Set();
        
        // 1. Map existing history records
        let mappedHistory = (records || []).map((r, idx) => {
          const sessionId = String((typeof r.session === 'object' ? r.session?._id : r.session) || r.session || r._id || idx);
          const isActuallyToday = r.date === 'Today' || (r.date && new Date(r.date).toDateString() === todayStr);
          
          let displayTime = r.session?.startTime ? `${r.session.startTime} - ${r.session.endTime}` : "TBD";
          let displayDate = isActuallyToday ? 'Today' : r.date;

          // If it's today, try to enrich with dashboard data
          if (isActuallyToday) {
            const dashboardMatch = todayDashboardClasses.find(c => String(c._id) === sessionId);
            if (dashboardMatch) {
              displayTime = `${dashboardMatch.startTime} - ${dashboardMatch.endTime}`;
              matchedDashboardIds.add(String(dashboardMatch._id));
            }
          }

          return {
            id: sessionId,
            date: displayDate,
            time: displayTime,
            isHoliday: r.session?.isHoliday || r.isHoliday,
            cancellationReason: r.session?.cancellationReason || r.cancellationReason || initialSubject,
            status: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "Unknown"
          };
        });

        // 2. Add today's classes from dashboard that aren't in history yet
        todayDashboardClasses.forEach(cls => {
          const clsId = String(cls._id);
          if (!matchedDashboardIds.has(clsId)) {
            mappedHistory.unshift({
              id: clsId,
              date: 'Today',
              time: `${cls.startTime} - ${cls.endTime}`,
              isHoliday: cls.isHoliday,
              cancellationReason: cls.cancellationReason || cls.title || initialSubject,
              status: cls.attendanceStatus ? (cls.attendanceStatus.charAt(0).toUpperCase() + cls.attendanceStatus.slice(1)) : "Not Marked"
            });
          }
        });

        // 3. Final cleanup: Remove any 'Today' entries that still have 'TBD' if there's a duplicate with time
        // This handles cases where ID matching might have failed but they are clearly duplicates
        mappedHistory = mappedHistory.filter((item, index, self) => {
          if (item.date === 'Today' && item.time === 'TBD') {
            const hasBetterDuplicate = self.some((other, otherIdx) => 
               otherIdx !== index && other.date === 'Today' && other.time !== 'TBD'
            );
            return !hasBetterDuplicate;
          }
          return true;
        });

        // Sort: Today first, then by date descending
        mappedHistory.sort((a, b) => {
          if (a.date === 'Today') return -1;
          if (b.date === 'Today') return 1;
          return new Date(b.date) - new Date(a.date);
        });

        const attended = (records || []).filter(r => r.status.toLowerCase() === 'present').length;
        const total = (records || []).length;
        const missed = Math.max(0, total - attended);
        const percentage = stats?.percentage ? Math.round(parseFloat(stats.percentage)) : initialPercentage;

        setData({
          subject: initialSubject,
          professor: initialProfessor,
          room: "Room 303", 
          percentage: percentage,
          totalClasses: total || initialTotal,
          attended: attended || initialAttended,
          missed: missed || (initialTotal - initialAttended),
          requiredToGoal: Math.max(0, Math.ceil(3 * (total || initialTotal) - 4 * (attended || initialAttended))),
          history: mappedHistory
        });
      }
    } catch (error) {
      console.error("Fetch Detail Error:", error);
      if (!silent) setAlertConfig({
        visible: true,
        title: "Error",
        message: "Could not fetch subject details. Please check your connection.",
        type: 'default'
      });
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleAttendance = async (sessionId, status) => {
    const previousHistory = [...data.history];
    const updatedHistory = data.history.map(item => 
      item.id === sessionId ? { ...item, status: status.charAt(0).toUpperCase() + status.slice(1) } : item
    );

    // Optimistic Update
    setData(prev => ({ ...prev, history: updatedHistory }));

    try {
      if (!userToken) return;
      await attendanceService.markAttendance(userToken, sessionId, status);
      
      // Global Signal to refresh other screens
      DeviceEventEmitter.emit('REFRESH_ATTENDANCE');
    } catch (error) {
      console.error("Marking Error:", error);
      setData(prev => ({ ...prev, history: previousHistory }));
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Could not update attendance. Please try again later.",
        type: 'default'
      });
    }
  };

  const handleFilterPress = () => {
    setShowModal(true);
  };

  const handleApplyRange = (newRange) => {
    setDateRange(newRange);
    setShowModal(false);
  };

  useEffect(() => {
    fetchDetailData();

    const sub = DeviceEventEmitter.addListener('REFRESH_ATTENDANCE', () => {
      fetchDetailData(true); // Silent background refresh
    });

    return () => sub.remove();
  }, [id, userToken, dateRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDetailData();
  }, [id, userToken]);

  if (loading || !data) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getStatusInfo = () => {
    if (data.percentage >= 75) return { label: 'Good Standing', color: colors.statusPerfect, icon: 'check-circle' };
    if (data.percentage >= 65) return { label: 'Warning', color: colors.statusWarning, icon: 'warning' };
    return { label: 'Critical', color: colors.statusCritical, icon: 'dangerous' };
  };

  const status = getStatusInfo();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
            <MaterialIcons name="chevron-left" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{data.subject}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{data.professor} • {data.room}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Main Chart Card */}
          <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CircularProgress percentage={data.percentage} color={status.color} colors={colors} />
            <View style={[styles.statusBadgeMain, { backgroundColor: status.color + '15' }]}>
              <MaterialIcons name={status.icon} size={16} color={status.color} />
              <Text style={[styles.statusLabelMain, { color: status.color }]}>{status.label}</Text>
            </View>
            <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
              Minimum required: <Text style={{ color: colors.textPrimary, fontFamily: THEME.fonts.bold }}>75%</Text>
            </Text>
          </View>

          {/* Breakdown Grid */}
          <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitleSmall, { color: colors.textPrimary }]}>Attendance Breakdown</Text>
            <View style={styles.grid}>
              <DetailStat label="Total Classes" value={data.totalClasses} colors={colors} />
              <DetailStat label="Attended" value={data.attended} color={colors.statusPerfect} colors={colors} />
              <DetailStat label="Missed" value={data.missed} color={colors.statusCritical} colors={colors} />
              <View style={[styles.goalBox, { backgroundColor: colors.primary + '10' }]}>
                <Text style={[styles.goalValue, { color: colors.primary }]}>{data.requiredToGoal}</Text>
                <Text style={[styles.goalLabel, { color: colors.primary }]}>Classes to reach 75%</Text>
              </View>
            </View>
          </View>

          {/* History / Visual Header */}
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              History
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.filterBtn}
                onPress={handleFilterPress}
              >
                <MaterialIcons name="calendar-today" size={14} color={dateRange.start ? colors.primary : colors.textSecondary} />
                <Text style={[styles.filterText, { color: dateRange.start ? colors.primary : colors.textSecondary }]}>
                  {dateRange.start ? 'Filtered' : 'All Dates'}
                </Text>
                <MaterialIcons name="expand-more" size={16} color={dateRange.start ? colors.primary : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View 
            entering={FadeIn.duration(400)} 
            exiting={FadeOut.duration(200)}
            style={styles.historyList}
          >
            {data.history.length > 0 ? (
              data.history.map(item => (
                <HistoryItem 
                  key={item.id} 
                  {...item} 
                  colors={colors} 
                  onToggle={handleToggleAttendance} 
                />
              ))
            ) : (
              <View style={styles.emptyHistory}>
                <MaterialIcons name="event-note" size={48} color={colors.border} />
                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No history available</Text>
              </View>
            )}
          </Animated.View>

          {/* Bottom Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Mark Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.reportBtn}>
              <MaterialIcons name="flag" size={18} color={colors.textSecondary} />
              <Text style={[styles.reportBtnText, { color: colors.textSecondary }]}>Report an Issue</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <DateRangeModal 
          visible={showModal}
          onClose={() => setShowModal(false)}
          onApply={handleApplyRange}
          initialRange={dateRange}
        />

        <CustomAlert 
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: 8,
    paddingBottom: 16 
  },
  backBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  headerTitle: { fontSize: 18, fontFamily: THEME.fonts.bold },
  headerSubtitle: { fontSize: 11, fontFamily: THEME.fonts.medium },
  
  scrollContent: { paddingHorizontal: 20 },

  mainCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  progressWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  percentTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentValue: {
    fontSize: 28,
    fontFamily: THEME.fonts.extraBold,
  },
  statusBadgeMain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8
  },
  statusLabelMain: {
    fontSize: 12,
    fontFamily: THEME.fonts.bold,
    marginLeft: 6
  },
  requirementText: {
    fontSize: 11,
    fontFamily: THEME.fonts.medium
  },

  breakdownCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24
  },
  sectionTitleSmall: {
    fontSize: 15,
    fontFamily: THEME.fonts.bold,
    marginBottom: 16
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: 10,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 22,
    fontFamily: THEME.fonts.bold
  },
  statLabel: {
    fontSize: 11,
    fontFamily: THEME.fonts.medium,
    marginTop: 2
  },
  goalBox: {
    width: '50%',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  goalValue: {
    fontSize: 22,
    fontFamily: THEME.fonts.bold
  },
  goalLabel: {
    fontSize: 10,
    fontFamily: THEME.fonts.bold,
    textAlign: 'center'
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: THEME.fonts.bold
  },

  filterText: {
    fontSize: 12,
    fontFamily: THEME.fonts.medium
  },

  historyList: {
    gap: 12,
    marginBottom: 24
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1
  },
  historyDate: {
    fontSize: 15,
    fontFamily: THEME.fonts.bold
  },
  historyTime: {
    fontSize: 12,
    fontFamily: THEME.fonts.medium,
    marginTop: 2
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  toggleBtnText: {
    fontSize: 14,
    fontFamily: THEME.fonts.bold
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: THEME.fonts.bold
  },

  actions: {
    gap: 12,
    marginTop: 8
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 10
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: THEME.fonts.bold
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 8
  },
  reportBtnText: {
    fontSize: 14,
    fontFamily: THEME.fonts.bold
  },

  // Calendar Styles
  calendarCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8
  },
  calendarMonth: {
    fontSize: 14,
    fontFamily: THEME.fonts.bold
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 8
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: THEME.fonts.medium,
    color: 'rgba(0,0,0,0.4)'
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2
  },
  dayText: {
    fontSize: 12,
    fontFamily: THEME.fonts.medium
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2
  },
  selectedDay: {
    borderRadius: 8,
    borderWidth: 1.5,
  },
  expandCalendar: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4
  },
  
  // Header Actions & Toggle
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'visible'
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    width: 100 
  },
  modeToggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  
  // Calendar Mode Content
  calendarModeWrapper: {
    marginBottom: 10
  },
  calendarDetailInfo: {
    marginTop: 4,
    marginBottom: 20
  },
  detailTitle: {
    fontSize: 14,
    fontFamily: THEME.fonts.bold,
    marginBottom: 12
  },
  calendarHint: {
    alignItems: 'center',
    paddingVertical: 24,
    opacity: 0.3
  },
  hintText: {
    fontSize: 11,
    fontFamily: THEME.fonts.medium,
    marginTop: 8
  },
  emptyHistory: {
    paddingVertical: 40,
    alignItems: 'center',
    opacity: 0.5
  }
});