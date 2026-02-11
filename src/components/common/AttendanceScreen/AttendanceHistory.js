import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { THEME } from '../../../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCLE_LENGTH = 314; // 2 * PI * 50
const R = 50;

/**
 * Animated Circular Progress Component
 */
const CircularProgress = ({ percentage, color }) => {
  const colors = useTheme();
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

/**
 * Record Item Component
 */
const RecordItem = ({ id, subject, date, time, status, colors, onToggle }) => {
  const isPresent = status.toLowerCase() === 'present';
  const isAbsent = status.toLowerCase() === 'absent';
  const isCancelled = status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'rescheduled';
  
  const formatDate = (dStr) => {
    if (!dStr) return "TBD";
    if (dStr === 'Today') return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
    const dateObj = new Date(dStr);
    return !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : dStr.split('T')[0];
  };

  return (
    <View style={[
      styles.recordItem, 
      { backgroundColor: colors.card, borderColor: colors.border },
      isCancelled && { opacity: 0.5 }
    ]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.recordSubject, { color: colors.textPrimary }]}>{subject}</Text>
        <Text style={[styles.recordTime, { color: colors.textSecondary }]}>
          {formatDate(date)}{time ? `, ${time}` : ''}
        </Text>
      </View>
      
      {isCancelled ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.border + '20' }]}>
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>{status}</Text>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => onToggle(id, 'present')}
            style={[
              styles.toggleBtn, 
              isPresent && { backgroundColor: colors.statusPerfect + '20', borderColor: colors.statusPerfect }
            ]}
          >
            <Text style={[styles.toggleBtnText, { color: isPresent ? colors.statusPerfect : colors.textSecondary }]}>P</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onToggle(id, 'absent')}
            style={[
              styles.toggleBtn, 
              isAbsent && { backgroundColor: colors.statusCritical + '20', borderColor: colors.statusCritical }
            ]}
          >
            <Text style={[styles.toggleBtnText, { color: isAbsent ? colors.statusCritical : colors.textSecondary }]}>A</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export const AttendanceHistory = ({ 
  percentage = 82, 
  todayRecords = [], 
  historyRecords = [], 
  loading = false, 
  onMarkAttendance, 
  onToggleAttendance, 
  onFilterPress 
}) => {
  const colors = useTheme();

  // Dynamic logic for status
  const getStatusInfo = () => {
    if (percentage >= 75) return { label: 'Good Standing', color: colors.statusPerfect, icon: 'check-circle' };
    if (percentage >= 65) return { label: 'Warning', color: colors.statusWarning, icon: 'warning' };
    return { label: 'Critical Alert', color: colors.statusCritical, icon: 'error' };
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Attendance</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your class attendance</Text>
      </View>

      {/* Main Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <CircularProgress percentage={percentage} color={statusInfo.color} />
        
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.color + '15' }]}>
          <MaterialIcons name={statusInfo.icon} size={16} color={statusInfo.color} />
          <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
        
        <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
          Minimum required: <Text style={{ color: colors.textPrimary, fontFamily: THEME.fonts.bold }}>75%</Text>
        </Text>
      </View>

      {/* Today's Classes Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today's Classes</Text>
      </View>

      <View style={styles.recordsList}>
        {todayRecords.length > 0 ? (
          todayRecords.map((record, index) => (
            <RecordItem key={record.id || index} {...record} colors={colors} onToggle={onToggleAttendance} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.textSecondary, fontFamily: THEME.fonts.medium }}>No classes for today</Text>
          </View>
        )}
      </View>

      {/* Previous Records Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Previous Records</Text>
        <TouchableOpacity 
          onPress={onFilterPress}
          style={[styles.filterBtn, { backgroundColor: colors.border + '20' }]}
        >
          <MaterialIcons name="event" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.recordsList}>
        {historyRecords.length > 0 ? (
          historyRecords.map((record, index) => (
            <RecordItem key={record.id || index} {...record} colors={colors} onToggle={onToggleAttendance} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.textSecondary, fontFamily: THEME.fonts.medium }}>No previous records found</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={onMarkAttendance}
        >
          <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>View Full History</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontFamily: THEME.fonts.bold },
  subtitle: { fontSize: 13, fontFamily: THEME.fonts.medium, marginTop: 4 },
  
  // Progress Card
  statsCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    marginBottom: 32,
  },
  progressWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  percentTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentValue: {
    fontSize: 28,
    fontFamily: THEME.fonts.extraBold,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: THEME.fonts.bold,
    marginLeft: 6,
  },
  requirementText: {
    fontSize: 11,
    fontFamily: THEME.fonts.medium,
  },

  // Records List
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16 
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 18, fontFamily: THEME.fonts.bold },
  recordsList: { gap: 12, marginBottom: 32 },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  recordSubject: { fontSize: 15, fontFamily: THEME.fonts.bold },
  recordTime: { fontSize: 12, fontFamily: THEME.fonts.medium, marginTop: 2 },
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
  statusText: { fontSize: 11, fontFamily: THEME.fonts.bold },
  emptyState: { paddingVertical: 20, alignItems: 'center' },

  // Actions
  actionContainer: { gap: 12 },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: THEME.light.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: THEME.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: THEME.fonts.bold },
  secondaryBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontFamily: THEME.fonts.bold },
});

export default AttendanceHistory;