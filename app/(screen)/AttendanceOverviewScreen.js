import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  DeviceEventEmitter
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { THEME } from '../../src/constants/colors';
import { SubjectAttendanceCard } from '../../src/components/common/AttendanceScreen/SubjectAttendanceCard';
import { router } from 'expo-router';
import { useScrollToTop } from '@react-navigation/native';
import { AuthContext } from '../../src/context/AuthContext';
import attendanceService from '../../src/services/attendanceService';

// Summary Card Component for internal use or could be moved to components
const SummaryCard = ({ colors, totalPercentage, totalAttended, totalClasses }) => (
  <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
    <View style={styles.summaryHeader}>
      <View>
        <Text style={styles.summaryLabel}>Overall Attendance</Text>
        <Text style={styles.summaryValue}>{totalPercentage}%</Text>
      </View>
      <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <MaterialIcons name="insert-chart" size={24} color="#fff" />
      </View>
    </View>
    
    <View style={styles.summaryFooter}>
      <View style={styles.summaryStat}>
        <Text style={styles.statLabel}>Attended</Text>
        <Text style={styles.statValue}>{totalAttended}</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
      <View style={styles.summaryStat}>
        <Text style={styles.statLabel}>Total</Text>
        <Text style={styles.statValue}>{totalClasses}</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
      <View style={styles.summaryStat}>
        <Text style={styles.statLabel}>Status</Text>
        <Text style={styles.statValue}>{totalPercentage >= 75 ? 'Safe' : 'Short'}</Text>
      </View>
    </View>
  </View>
);

export default function AttendanceOverviewScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    overall: { percentage: "0", total: 0, present: 0 },
    subjectWise: []
  });

  const fetchAttendanceStats = async (silent = false) => {
    try {
      if (!userToken) return;
      if (!silent) setLoading(true);
      
      const response = await attendanceService.getSubjectAnalytics(userToken);
      if (response.success || response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      if (!silent) Alert.alert("Error", "Could not fetch attendance statistics.");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStats();

    const sub = DeviceEventEmitter.addListener('REFRESH_ATTENDANCE', () => {
      fetchAttendanceStats(true); // Silent update
    });

    return () => sub.remove();
  }, [userToken]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendanceStats();
  }, [userToken]);

  const { overall, subjectWise } = stats;
  const overallPercentage = parseFloat(overall.percentage) || 0;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
            <MaterialIcons name="chevron-left" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Attendance</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Current Semester</Text>
          </View>
          <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]}>
            <MaterialIcons name="filter-list" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Summary Section */}
          <SummaryCard 
            colors={colors} 
            totalPercentage={overallPercentage} 
            totalAttended={overall.present || 0} 
            totalClasses={overall.total || 0} 
          />

          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: colors.isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff' }]}>
            <MaterialIcons name="info" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.slate600 || colors.textSecondary }]}>
              Minimum <Text style={{ fontFamily: THEME.fonts.bold, color: colors.primary }}>75%</Text> required for exams.
            </Text>
          </View>

          {/* List Section */}
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subject wise</Text>
            <TouchableOpacity onPress={() => router.push('/(attendance)/AttendanceHistoryScreen')}>
              <Text style={{ color: colors.primary, fontFamily: THEME.fonts.bold, fontSize: 13 }}>View History</Text>
            </TouchableOpacity>
          </View>

          {subjectWise.map((item, index) => (
            <SubjectAttendanceCard 
              key={item.subjectId || item.subjectName || index} 
              subject={item.subjectName}
              professor={item.professor || "Faculty"}
              percentage={Math.round(parseFloat(item.percentage))}
              attended={item.present || 0}
              total={item.total || 0}
              onPress={() => router.push({
                pathname: '/(attendance)/SubjectAttendanceDetail',
                params: { 
                  id: item.subjectId || item.subjectName, 
                  subjectName: item.subjectName,
                  professor: item.professor || "Faculty",
                  percentage: Math.round(parseFloat(item.percentage)),
                  attended: item.present || 0,
                  total: item.total || 0
                }
              })}
            />
          ))}
          
          <View style={{ height: 40 }} />
        </ScrollView>

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
  iconBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: THEME.fonts.bold },
  headerSubtitle: { fontSize: 11, fontFamily: THEME.fonts.medium },
  
  scrollContent: { paddingHorizontal: 20 },
  
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: THEME.fonts.medium },
  summaryValue: { color: '#fff', fontSize: 34, fontFamily: THEME.fonts.extraBold, marginTop: 2 },
  summaryIconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
  },
  summaryStat: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 20 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: THEME.fonts.medium, marginBottom: 2 },
  statValue: { color: '#fff', fontSize: 14, fontFamily: THEME.fonts.bold },

  infoBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    padding: 14, 
    borderRadius: 14,
    marginBottom: 20 
  },
  infoText: { fontSize: 12, fontFamily: THEME.fonts.medium },
  
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2
  },
  sectionTitle: { fontSize: 16, fontFamily: THEME.fonts.bold },
});