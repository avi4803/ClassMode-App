import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export const TimetableCard = ({ title, time, location, instructor, status }) => {
  const colors = useTheme();

  const getStatusStyle = () => {
    switch(status.toLowerCase()) {
      case 'completed': return { color: '#22c55e', bg: colors.statusCompletedBg, side: '#22c55e' };
      case 'ongoing': return { color: '#3b82f6', bg: colors.statusOngoingBg, side: '#3b82f6' };
      case 'upcoming': return { color: colors.primary, bg: colors.statusUpcomingBg, side: colors.primary };
      case 'cancelled': return { color: colors.danger, bg: colors.dangerBg, side: colors.danger };
      case 'rescheduled': return { color: '#f97316', bg: '#fff7ed', side: '#f97316' };
      case 'done':
      case 'passed':
        return { color: '#64748b', bg: '#f1f5f9', side: '#94a3b8', isPassed: true }; // Greyscale
      default: return { color: colors.textSecondary, bg: colors.cardSlate, side: colors.border };
    }
  };

  const style = getStatusStyle();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, opacity: style.isPassed ? 0.7 : 1 }]}>
      <View style={[styles.sideBar, { backgroundColor: style.side }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: style.bg }]}>
            <Text style={[styles.badgeText, { color: style.color }]}>{status.toLowerCase() === 'done' ? 'Passed' : status}</Text>
          </View>
        </View>
        <View style={styles.details}>
          <View style={styles.row}>
            <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{time}</Text>
          </View>
          <View style={styles.row}>
            <MaterialIcons name={location ? "location-on" : "person"} size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {location || instructor}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {flex:1 , borderRadius: 16, borderWeight: 1, marginBottom: 16, overflow: 'hidden', flexDirection: 'row'  },
  sideBar: { width: 4.5 },
  content: { flex: 1, padding: 16, paddingLeft: 20  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontFamily: 'Urbanist_700Bold'  , paddingRight: 100},
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 , position: 'absolute' , right: -1 , top: 2 },
  badgeText: { fontSize: 12, fontFamily: 'Urbanist_700Bold', textTransform: 'capitalize' },
  details: { flex: 1,marginTop: 12, gap: 4 ,paddingRight:100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold' },
});