import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Alert, DeviceEventEmitter, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { AuthContext } from '../../src/context/AuthContext';
import attendanceService from '../../src/services/attendanceService';

// Component Import
import AttendanceHistory from '../../src/components/common/AttendanceScreen/AttendanceHistory';
import DateRangeModal from '../../src/components/common/AttendanceScreen/DateRangeModal';

export default function AttendanceHistoryScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    percentage: 0,
    todayRecords: [],
    historyRecords: []
  });

  // Date Filter State
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showModal, setShowModal] = useState(false);

  const fetchAttendanceHistory = async (silent = false) => {
    try {
      if (!userToken) return;
      if (!silent) setLoading(true);

      const params = { limit: 50 };
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const [todayRes, historyRes, statsRes] = await Promise.all([
        attendanceService.getTodayDashboard(userToken),
        attendanceService.getGlobalHistory(userToken, params),
        attendanceService.getSubjectAnalytics(userToken)
      ]);

      // Process Today's Records
      const today = (todayRes.data || []).map(item => {
        const statusStr = (item.status || "").toLowerCase();
        let displayStatus = item.attendanceStatus || "Not Marked";
        
        if (statusStr === 'cancelled' || item.isCancelled) displayStatus = "Cancelled";
        else if (statusStr === 'rescheduled' || item.isRescheduled) displayStatus = "Rescheduled";
        
        return {
          id: item._id,
          subject: item.subject?.name || "Unknown",
          date: "Today",
          time: `${item.startTime} - ${item.endTime}`,
          status: displayStatus
        };
      });

      // Process History Records
      const history = (historyRes.data?.records || []).map(item => {
        const sessionStatus = (item.session?.status || "").toLowerCase();
        const itemStatus = (item.status || "").toLowerCase();
        let displayStatus = item.status || "Not Marked";

        if (sessionStatus === 'cancelled' || itemStatus === 'cancelled') displayStatus = "Cancelled";
        else if (sessionStatus === 'rescheduled' || itemStatus === 'rescheduled') displayStatus = "Rescheduled";

        return {
          id: item._id,
          subject: item.subject?.name || "Unknown",
          date: item.date,
          time: item.session?.startTime ? `${item.session.startTime} - ${item.session.endTime}` : "",
          status: displayStatus
        };
      });

      const percentage = statsRes.data?.overall?.percentage || 0;

      setAttendanceData({
        percentage: Math.round(parseFloat(percentage)),
        todayRecords: today,
        historyRecords: history
      });
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      if (!silent) Alert.alert("Error", "Could not fetch attendance records.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [userToken, dateRange]);

  const handleFilterPress = () => {
    setShowModal(true);
  };

  const handleApplyRange = (newRange) => {
    setDateRange(newRange);
    setShowModal(false);
  };

  const handleToggleAttendance = async (sessionId, status) => {
    // Determine which list contains the ID
    const isToday = attendanceData.todayRecords.some(r => r.id === sessionId);
    const targetKey = isToday ? 'todayRecords' : 'historyRecords';
    
    const previousRecords = [...attendanceData[targetKey]];
    const updatedRecords = attendanceData[targetKey].map(record => 
      record.id === sessionId ? { ...record, status: status.charAt(0).toUpperCase() + status.slice(1) } : record
    );

    setAttendanceData(prev => ({ ...prev, [targetKey]: updatedRecords }));

    try {
      if (!userToken) return;
      const response = await attendanceService.markAttendance(userToken, sessionId, status);
      DeviceEventEmitter.emit('REFRESH_ATTENDANCE');
      if (response.stats) {
        setAttendanceData(prev => ({ ...prev, percentage: Math.round(parseFloat(response.stats.percentage)) }));
      }
    } catch (error) {
      setAttendanceData(prev => ({ ...prev, [targetKey]: previousRecords }));
      Alert.alert("Error", "Could not update attendance.");
    }
  };

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('REFRESH_ATTENDANCE', () => {
      fetchAttendanceHistory(true);
    });
    return () => sub.remove();
  }, [userToken]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <AttendanceHistory 
          percentage={attendanceData.percentage}
          todayRecords={attendanceData.todayRecords}
          historyRecords={attendanceData.historyRecords}
          loading={loading}
          onMarkAttendance={() => router.push('/(scan)/AddTimetableScreen')}
          onToggleAttendance={handleToggleAttendance}
          onFilterPress={handleFilterPress}
          activeFilter={!!(dateRange.start || dateRange.end)}
        />

        <DateRangeModal 
          visible={showModal}
          onClose={() => setShowModal(false)}
          onApply={handleApplyRange}
          initialRange={dateRange}
        />
      </SafeAreaView>
    </View>
  );
}
