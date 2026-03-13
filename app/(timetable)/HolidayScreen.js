import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";
import { router } from "expo-router";
import { AuthContext } from "../../src/context/AuthContext";
import holidayService from "../../src/services/holidayService";
import authService from "../../src/services/authService";
import AsyncStorage from '@react-native-async-storage/async-storage';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HOLIDAY_CACHE_KEY = 'HOLIDAY_DATA';

const HolidayCard = ({ item }) => {
  const colors = useTheme();

  const startDate = new Date(item.startDate);
  const endDate = item.endDate ? new Date(item.endDate) : startDate;

  const startDay = startDate.getDate();
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const getFullDateString = () => {
     const options = { month: 'short', day: '2-digit', year: 'numeric' };
     const sDate = startDate.toLocaleDateString('en-US', options);
     if (item.startDate !== item.endDate && item.endDate) {
         const eDate = endDate.toLocaleDateString('en-US', options);
         return `${sDate} - ${eDate}`;
     }
     return startDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: "AddHolidayScreen",
        params: {
          id: item.id,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
          mode: 'edit'
        }
      })}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardContent}>
          
          {/* Date Circle Box */}
          <View style={[styles.dateBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dateMonth, { color: colors.textSecondary }]}>
              {startMonth}
            </Text>
            <Text style={[styles.dateNumber, { color: colors.primary }]}>
              {startDay}
            </Text>
          </View>
  
          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {getFullDateString()}
            </Text>
          </View>
  
          {/* Days Badge */}
          <View style={[styles.daysBadge, { backgroundColor: colors.cardSlate || (colors.border + '40') }]}>
              <Text style={[styles.daysBadgeText, { color: colors.textSecondary }]}>
                  {item.daysCount} DAY{item.daysCount > 1 ? 'S' : ''}
              </Text>
          </View>
  
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HolidayScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Holidays');
  const [userRole, setUserRole] = useState([]);

  const totalDaysOff = holidays.reduce((acc, curr) => acc + (curr.daysCount || 0), 0);

  const handleTabChange = (tab) => {
    // Ensuring smooth animation properties
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const fetchHolidays = async () => {
    try {
      // 1. Fetch user role for FAB - Try cache first for instant appearance
      try {
        const dashCache = await AsyncStorage.getItem('DASHBOARD_DATA');
        if (dashCache) {
          const parsed = JSON.parse(dashCache);
          const roles = parsed.user?.role || parsed.roles || [];
          if (roles.length > 0) setUserRole(roles);
        }

        const dashRes = await authService.getDashboard(userToken);
        if (dashRes && dashRes.success && dashRes.data?.user?.role) {
          const fetchedRoles = dashRes.data.user.role;
          console.log("Detected user roles:", fetchedRoles);
          setUserRole(fetchedRoles);
        }
      } catch (dashError) {
        console.log("Dashboard fetch error (ignoring for holidays):", dashError.message);
      }

      // 2. Fetch real holidays from the backend
      try {
        const holidayRes = await holidayService.getHolidays(userToken);
        if (holidayRes && holidayRes.success && holidayRes.data) {
           const grouped = [];
           const dateKeys = Object.keys(holidayRes.data).sort((a, b) => new Date(a) - new Date(b));
           let currentGroup = null;

           for (const dateKey of dateKeys) {
             const title = holidayRes.data[dateKey];
             const dateObj = new Date(dateKey);

             if (!currentGroup) {
               currentGroup = {
                 id: dateKey,
                 title,
                 startDate: dateKey,
                 endDate: dateKey,
                 daysCount: 1,
               };
             } else {
               const prevEndObj = new Date(currentGroup.endDate);
               const diffTime = Math.abs(dateObj - prevEndObj);
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               
               // Group if adjacent day and same title Let's assume adjacent means diffDays = 1, wait, due to DST diffDays could slightly vary or be 1.
               if (diffDays === 1 && currentGroup.title === title) {
                   currentGroup.endDate = dateKey;
                   currentGroup.daysCount += 1;
               } else {
                   grouped.push(currentGroup);
                   currentGroup = {
                       id: dateKey,
                       title,
                       startDate: dateKey,
                       endDate: dateKey,
                       daysCount: 1,
                   };
               }
             }
           }
           if (currentGroup) {
             grouped.push(currentGroup);
           }
           
           // Cache the computed grouping locally just heavily incase offline mode returns
           await AsyncStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify(grouped));
           setHolidays(grouped);
        } else {
           // Provide fallback cache if network totally fails
           const cached = await AsyncStorage.getItem(HOLIDAY_CACHE_KEY);
           if (cached) setHolidays(JSON.parse(cached));
        }
      } catch (e) {
        console.log("Error fetching holidays from API:", e);
        const cached = await AsyncStorage.getItem(HOLIDAY_CACHE_KEY);
        if (cached) setHolidays(JSON.parse(cached));
      }
    } catch (e) {
      console.log('Error fetching holidays', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userToken) fetchHolidays();
    
    // Auto refresh listener
    const refreshListener = DeviceEventEmitter.addListener('REFRESH_HOLIDAYS', () => {
      fetchHolidays();
    });
    return () => refreshListener.remove();
  }, [userToken]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHolidays();
  }, [userToken]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.timetableBg || colors.background }}>
      <SafeAreaView edges={["top"]} style={styles.headerArea}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.cardSlate }]}>
            <MaterialIcons name="chevron-left" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Academic Calendar
          </Text>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary + '15' }]}>
            <MaterialIcons name="event" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 24, paddingHorizontal: 4, paddingTop: 16 }}>
           <TouchableOpacity onPress={() => handleTabChange('Holidays')} style={{ paddingBottom: 10, position: 'relative' }}>
               <Text style={{ fontSize: 16, fontFamily: activeTab === 'Holidays' ? 'Urbanist_700Bold' : 'Urbanist_600SemiBold', color: activeTab === 'Holidays' ? colors.primary : colors.textSecondary }}>Holidays</Text>
               {activeTab === 'Holidays' && <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />}
           </TouchableOpacity>
           <TouchableOpacity onPress={() => handleTabChange('Exams')} style={{ paddingBottom: 10, position: 'relative' }}>
               <Text style={{ fontSize: 16, fontFamily: activeTab === 'Exams' ? 'Urbanist_700Bold' : 'Urbanist_600SemiBold', color: activeTab === 'Exams' ? colors.primary : colors.textSecondary }}>Exams</Text>
               {activeTab === 'Exams' && <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />}
           </TouchableOpacity>
           <TouchableOpacity onPress={() => handleTabChange('Events')} style={{ paddingBottom: 10, position: 'relative' }}>
               <Text style={{ fontSize: 16, fontFamily: activeTab === 'Events' ? 'Urbanist_700Bold' : 'Urbanist_600SemiBold', color: activeTab === 'Events' ? colors.primary : colors.textSecondary }}>Events</Text>
               {activeTab === 'Events' && <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />}
           </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : activeTab === 'Holidays' ? (
        <FlatList
          data={holidays}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={{ marginBottom: 20, alignSelf: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                  <MaterialIcons name="calendar-today" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, fontFamily: 'Urbanist_700Bold', color: colors.primary }}>{totalDaysOff} Days Total Off</Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 20, fontFamily: 'Urbanist_700Bold', color: colors.textPrimary }}>Upcoming Holidays</Text>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.primary + '15' }}>
                     <Text style={{ fontSize: 12, fontFamily: 'Urbanist_700Bold', color: colors.primary }}>2023-24</Text>
                  </View>
              </View>
            </View>
          }
          ListFooterComponent={
            <View style={[styles.syncCard, { backgroundColor: colors.primary }]}>
              <View style={styles.syncCardContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Text style={styles.syncCardLabel}>STAY ORGANIZED</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>COMING SOON</Text>
                  </View>
                </View>
                <Text style={styles.syncCardTitle}>Sync your calendar with academic deadlines</Text>
                <TouchableOpacity style={styles.syncCardBtn} activeOpacity={0.8}>
                  <Text style={[styles.syncCardBtnText, { color: colors.primary }]}>Sync Now</Text>
                </TouchableOpacity>
              </View>
              <MaterialIcons name="event-available" size={120} color="rgba(255,255,255,0.1)" style={styles.syncCardIcon} />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={64} color={colors.border} />
              <Text style={{ color: colors.textSecondary, marginTop: 16, fontFamily: 'Urbanist_600SemiBold', fontSize: 16 }}>
                No holidays scheduled
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => <HolidayCard item={item} />}
        />
      ) : (
        <FlatList
          data={[]}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={64} color={colors.border} />
              <Text style={{ color: colors.textSecondary, marginTop: 16, fontFamily: 'Urbanist_600SemiBold', fontSize: 16 }}>
                No {activeTab.toLowerCase()} scheduled
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button for Admins */}
      {userRole.some(r => ['admin', 'local-admin'].includes(r)) && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push({ pathname: "AddHolidayScreen" })}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerArea: { paddingHorizontal: 16, paddingBottom: 0 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  headerTitle: { fontSize: 22, fontFamily: 'Urbanist_800ExtraBold' },
  backBtn: { padding: 8, borderRadius: 20 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 16 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  
  card: {
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dateNumber: {
    fontSize: 20,
    fontFamily: 'Urbanist_800ExtraBold',
    marginTop: -2,
  },
  dateMonth: {
    fontSize: 10,
    fontFamily: 'Urbanist_700Bold',
    letterSpacing: 1,
  },
  infoBox: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center'
  },
  title: {
    fontSize: 16,
    fontFamily: 'Urbanist_800ExtraBold',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    marginTop: 4,
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysBadgeText: {
    fontSize: 9,
    fontFamily: 'Urbanist_800ExtraBold',
    letterSpacing: 0.5,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 999,
  },
  syncCard: {
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 40,
    overflow: 'hidden',
    position: 'relative',
    padding: 20,
  },
  syncCardContent: {
    position: 'relative',
    zIndex: 10,
  },
  syncCardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontFamily: 'Urbanist_800ExtraBold',
    letterSpacing: 2,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: 'Urbanist_800ExtraBold',
  },
  syncCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Urbanist_800ExtraBold',
    lineHeight: 22,
    marginBottom: 12,
    paddingRight: 40,
  },
  syncCardBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#312e81',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  syncCardBtnText: {
    fontSize: 13,
    fontFamily: 'Urbanist_800ExtraBold',
  },
  syncCardIcon: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    transform: [{ rotate: '12deg' }],
  },
});
