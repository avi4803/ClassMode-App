import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { THEME } from '../../../constants/colors';

export const SubjectAttendanceCard = ({ subject, professor, percentage, attended, total, recentHistory, onPress }) => {
  const colors = useTheme();

  // Dynamic Logic for Status Colors
  const getStatus = () => {
    if (percentage >= 75) {
      return { 
        color: colors.statusPerfect, 
        label: percentage === 100 ? 'Perfect' : 'On Track', 
        badge: colors.badgeGreen,
        icon: 'check-circle'
      };
    }
    if (percentage >= 65) {
      return { 
        color: colors.statusWarning, 
        label: 'Warning', 
        badge: colors.badgeYellow,
        icon: 'warning'
      };
    }
    return { 
      color: colors.statusCritical, 
      label: 'Critical', 
      badge: colors.badgeRed,
      icon: 'error-outline'
    };
  };

  const status = getStatus();

  console.log('Rendering Subject:', subject, 'Recent History length:', recentHistory ? recentHistory.length : 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={onPress} 
        style={styles.touchableArea}
      >
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <Text style={[styles.subjectName, { color: colors.textPrimary }]} numberOfLines={1}>{subject}</Text>
            <View style={styles.profRow}>
              <MaterialIcons name="person" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.professor, { color: colors.textSecondary }]} numberOfLines={1}>{professor}</Text>
            </View>
          </View>
          <View style={styles.percentContainer}>
            <Text style={[styles.percentText, { color: status.color }]}>{percentage}%</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={[styles.track, { backgroundColor: colors.isDark ? '#1e293b' : '#f1f5f9' }]}>
            <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: status.color }]} />
          </View>
          
          <View style={styles.footerRow}>
            <View style={[styles.badge, { backgroundColor: status.badge }]}>
              <MaterialIcons name={status.icon} size={12} color={status.color} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={[styles.attendedCount, { color: colors.textPrimary }]}>{attended}</Text>
              <Text style={[styles.totalCount, { color: colors.textSecondary }]}>/{total} sessions</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* History section for the last ~10 days */}
      <View style={[styles.historySection, { borderTopColor: colors.border }]}>
        {recentHistory && recentHistory.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
            {[...recentHistory].reverse().map((record, index) => {
              const dateObj = new Date(record.date);
              const day = dateObj.getDate();
              const recordStatus = record.status;
              
              let dotColor = colors.border;
              let hasDot = false;
              let isDash = false;

              if (recordStatus === 'present') {
                dotColor = colors.statusPerfect;
                hasDot = true;
              } else if (recordStatus === 'absent') {
                dotColor = colors.statusCritical;
                hasDot = true;
              } else {
                isDash = true; // 'unmarked' or any other state
              }
              
              return (
                <View key={record.id || index} style={[styles.dateBox, { borderColor: colors.border, backgroundColor: colors.isDark ? '#1e293b' : '#f8fafc' }]}>
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>{day}</Text>
                  {hasDot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
                  {isDash && <Text style={{ color: colors.border, fontSize: 10, lineHeight: 10, fontWeight: 'bold' }}>-</Text>}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={{ fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', paddingVertical: 10 }}>
            No past records
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 12,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  touchableArea: {
    padding: 16,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  titleArea: { flex: 1, paddingRight: 8 },
  subjectName: { 
    fontSize: 16, 
    fontFamily: THEME.fonts.bold,
    marginBottom: 2 
  },
  profRow: { flexDirection: 'row', alignItems: 'center' },
  professor: { 
    fontSize: 12, 
    fontFamily: THEME.fonts.medium,
  },
  percentContainer: {
    alignItems: 'flex-end',
  },
  percentText: { 
    fontSize: 20, 
    fontFamily: THEME.fonts.extraBold,
    letterSpacing: -0.5 
  },
  progressSection: { marginTop: 14 },
  track: { 
    height: 6, 
    borderRadius: 3, 
    width: '100%', 
    overflow: 'hidden' 
  },
  bar: { height: '100%', borderRadius: 3 },
  footerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10 
  },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7, 
    paddingVertical: 3, 
    borderRadius: 5 
  },
  badgeText: { 
    fontSize: 10, 
    fontFamily: THEME.fonts.bold,
    textTransform: 'uppercase'
  },
  statsRow: { flexDirection: 'row', alignItems: 'baseline' },
  attendedCount: { 
    fontSize: 13, 
    fontFamily: THEME.fonts.bold 
  },
  totalCount: { 
    fontSize: 11, 
    fontFamily: THEME.fonts.medium,
    marginLeft: 2
  },
  historySection: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    borderTopWidth: 1,
  },
  historyScroll: {
    paddingRight: 16,
    gap: 10,
  },
  dateBox: {
    width: 36,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    justifyContent: 'space-between'
  },
  dateText: {
    fontSize: 12,
    fontFamily: THEME.fonts.semiBold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  }
});
