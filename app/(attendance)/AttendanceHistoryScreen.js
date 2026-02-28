import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Alert, DeviceEventEmitter, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { AuthContext } from '../../src/context/AuthContext';
import attendanceService from '../../src/services/attendanceService';

import authService from '../../src/services/authService';

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
      // Process History Records
      let history = [];

      if (dateRange.start && dateRange.end) {
        // Advanced History: Fetch Schedule + Marked to show "Not Marked"
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        const dateList = [];
        let current = new Date(startDate);
        
        // Generate list of dates (one per week) to fetch schedule
        // Safe bet: Fetch individually or by week. getWeeklySchedule helps.
        while (current <= endDate) {
            dateList.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 7);
        }
        // Ensure we cover the end week if loop logic missed a partial week
        if (dateList.length === 0 || new Date(dateList[dateList.length-1]) < endDate) {
           // This logic is tricky. Let's just rely on getWeeklySchedule returning the whole week
           // If user selects 1 day (e.g. Wed), getWeeklySchedule(Wed) gets Mon-Sun.
        }

        // Just fetch for start and every 7 days
        const schedulePromises = dateList.map(d => authService.getWeeklySchedule(userToken, d));
        // Add one more for end date just in case
        schedulePromises.push(authService.getWeeklySchedule(userToken, dateRange.end));

        const responses = await Promise.all(schedulePromises);
        
        const allSessionsMap = new Map();
        responses.forEach(res => {
            if (res.data?.classes) {
                res.data.classes.forEach(s => {
                    const d = s.date.split('T')[0];
                    if (d >= dateRange.start && d <= dateRange.end) {
                        allSessionsMap.set(s._id, s);
                    }
                });
            }
        });

        // Merge with history marks
        const markedMap = new Map();
        (historyRes.data?.records || []).forEach(r => {
             const sessId = r.session?._id || r.session;
             if (sessId) markedMap.set(sessId, r);
        });

        history = Array.from(allSessionsMap.values()).map(session => {
            const marked = markedMap.get(session._id);
            if (marked) {
                const sessionStatus = (marked.session?.status || "").toLowerCase();
                const itemStatus = (marked.status || "").toLowerCase();
                let displayStatus = marked.status || "Not Marked";

                if (sessionStatus === 'cancelled' || itemStatus === 'cancelled') displayStatus = "Cancelled";
                else if (sessionStatus === 'rescheduled' || itemStatus === 'rescheduled') displayStatus = "Rescheduled"; 
                
                return {
                    id: session._id, // Session ID
                    subject: marked.subject?.name || "Unknown",
                    date: marked.date,
                    time: session.startTime ? `${session.startTime} - ${session.endTime}` : "",
                    status: displayStatus
                };
            } else {
                 // Unmarked or just Cancelled/Rescheduled in schedule
                 const statusStr = (session.status || "").toLowerCase();
                 let displayStatus = "Not Marked"; // Default for past unmarked
                 
                 // If it is today, show as Not Marked (but usually today is handled separately)
                 // If properly cancelled in schedule
                 if (statusStr === 'cancelled') displayStatus = "Cancelled";
                 if (statusStr === 'rescheduled') displayStatus = "Rescheduled";
                 
                 return {
                    id: session._id,
                    subject: session.subject?.name || session.title || "Unknown",
                    date: session.date.split('T')[0],
                    time: `${session.startTime} - ${session.endTime}`,
                    status: displayStatus
                 };
            }
        });
        
        // Sort descending
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

      } else {
          // Default: Show only marked history (as per API)
          history = (historyRes.data?.records || []).map(item => {
            const sessionStatus = (item.session?.status || "").toLowerCase();
            const itemStatus = (item.status || "").toLowerCase();
            let displayStatus = item.status || "Not Marked";

            if (sessionStatus === 'cancelled' || itemStatus === 'cancelled') displayStatus = "Cancelled";
            else if (sessionStatus === 'rescheduled' || itemStatus === 'rescheduled') displayStatus = "Rescheduled";

            return {
              id: item.session?._id || item._id, 
              subject: item.subject?.name || "Unknown",
              date: item.date,
              time: item.session?.startTime ? `${item.session.startTime} - ${item.session.endTime}` : "",
              status: displayStatus
            };
          });
      }

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
    // Check if we need to update
    const targetStatus = status.toLowerCase();
    const inToday = attendanceData.todayRecords.find(r => r.id === sessionId);
    const inHistory = attendanceData.historyRecords.find(r => r.id === sessionId);

    const alreadySetInToday = inToday && inToday.status.toLowerCase() === targetStatus;
    const alreadySetInHistory = inHistory && inHistory.status.toLowerCase() === targetStatus;

    // If the record exists in a list and is NOT already set to the target status, we proceed.
    // If it exists in neither, nothing to do (shouldn't happen).
    // If it exists in both, and both are already set, we return.
    
    // Simplest check: If it's not present or already correct in all places it appears, return.
    const needsUpdateToday = inToday && !alreadySetInToday;
    const needsUpdateHistory = inHistory && !alreadySetInHistory;

    if (!needsUpdateToday && !needsUpdateHistory) return;

    // Store previous state for rollback
    const prevToday = [...attendanceData.todayRecords];
    const prevHistory = [...attendanceData.historyRecords];

    // Optimistic Update
    const newStatusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    
    const newToday = attendanceData.todayRecords.map(r => 
      r.id === sessionId ? { ...r, status: newStatusLabel } : r
    );
    const newHistory = attendanceData.historyRecords.map(r => 
      r.id === sessionId ? { ...r, status: newStatusLabel } : r
    );

    setAttendanceData(prev => ({ 
      ...prev, 
      todayRecords: newToday,
      historyRecords: newHistory 
    }));

    try {
      if (!userToken) return;
      const response = await attendanceService.markAttendance(userToken, sessionId, status);
      // DeviceEventEmitter.emit('REFRESH_ATTENDANCE'); // Removed to prevent view reset
      if (response.stats) {
        setAttendanceData(prev => ({ ...prev, percentage: Math.round(parseFloat(response.stats.percentage)) }));
      }
    } catch (error) {
      // Rollback
      setAttendanceData(prev => ({ 
        ...prev, 
        todayRecords: prevToday,
        historyRecords: prevHistory 
      }));
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
