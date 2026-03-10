import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const AttendanceCard = ({ 
  percentage = 0, 
  present = 0, 
  total = 0, 
  absent = 0, 
  dateRange = "N/A" 
}) => {
  const colors = useTheme();
  const { width } = useWindowDimensions();
  
  const isSmallScreen = width < 380;

  const StatBox = ({ value, label }) => (
    <View style={[styles.statBox, { backgroundColor: colors.background || '#f8fafc' }]}>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.cardSlate || '#ffffff', borderColor: colors.border }]}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Attendance Percentage</Text>
          <Text style={[styles.dateRange, { color: colors.textSecondary }]}>{dateRange} schedule</Text>
        </View>
        <Text style={[styles.percentageText, { color: colors.textSecondary || '#cbd5e1' }]}>
          {percentage}%
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatBox value={present} label="Present" />
        <StatBox value={total} label="Total" />
        <StatBox value={absent} label="Absent" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    opacity: 0.8,
  },
  percentageText: {
    fontSize: 22,
    fontFamily: 'Urbanist_700Bold',
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    height: 70,
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Urbanist_800ExtraBold',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
  },
});

export default AttendanceCard;