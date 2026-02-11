import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { THEME } from '../../../constants/colors';

export const SubjectAttendanceCard = ({ subject, professor, percentage, attended, total, onPress }) => {
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

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress} 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
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

      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      <View style={styles.actionRow}>
        <Text style={[styles.detailBtnText, { color: colors.primary }]}>View detailed analysis</Text>
        <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    marginBottom: 12,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.4
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  detailBtnText: { 
    fontSize: 12, 
    fontFamily: THEME.fonts.bold 
  }
});
