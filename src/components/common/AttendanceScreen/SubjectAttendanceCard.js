import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { THEME } from '../../../constants/colors';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SubjectAttendanceCard = ({ subject, professor, percentage, attended, total, recentHistory, onPress }) => {
  const colors = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Dynamic Logic for Status Colors
  const getStatus = () => {
    if (percentage >= 75) {
      // Classes they can miss before dropping below 75%
      const margin = Math.max(0, Math.floor((4 * attended - 3 * total) / 3));
      return { 
        color: colors.statusPerfect, 
        label: margin > 0 ? `Can miss ${margin}` : 'Safe', 
        badge: colors.badgeGreen,
        icon: 'check-circle'
      };
    }
    
    // Classes needed to reach exactly >= 75%
    const requiredClasses = (3 * total) - (4 * attended);
    const label = `Attend ${requiredClasses} more`;

    if (percentage >= 65) {
      return { 
        color: colors.statusWarning, 
        label: label, 
        badge: colors.badgeYellow,
        icon: 'warning'
      };
    }
    return { 
      color: colors.statusCritical, 
      label: label, 
      badge: colors.badgeRed,
      icon: 'error-outline'
    };
  };

  const status = getStatus();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={toggleExpand} 
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
          <View style={styles.headerRight}>
            <View style={styles.percentContainer}>
              <Text style={[styles.percentText, { color: status.color }]}>{percentage}%</Text>
            </View>
            <MaterialIcons 
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={colors.textSecondary} 
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
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

            {/* History section */}
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>Recent History</Text>
                <TouchableOpacity onPress={onPress}>
                  <Text style={[styles.detailLink, { color: colors.primary }]}>View Details</Text>
                </TouchableOpacity>
              </View>
              {recentHistory && recentHistory.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
                  {[...recentHistory].sort((a, b) => new Date(a.date) - new Date(b.date)).map((record, index) => {
                    const dateObj = new Date(record.date);
                    const day = dateObj.getDate();
                    const recordStatus = record?.status ? String(record.status).toLowerCase().trim() : '';
                    
                    let dotColor = colors.border || '#e2e8f0';
                    let hasDot = false;
                    let isDash = false;

                    if (recordStatus === 'present') {
                      dotColor = colors.statusPerfect || '#22c55e';
                      hasDot = true;
                    } else if (recordStatus === 'absent') {
                      dotColor = colors.statusCritical || '#ef4444';
                      hasDot = true;
                    } else {
                      isDash = true;
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
        )}
      </TouchableOpacity>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  expandedContent: {
    marginTop: 0,
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
    paddingTop: 20,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 13,
    fontFamily: THEME.fonts.bold,
  },
  detailLink: {
    fontSize: 12,
    fontFamily: THEME.fonts.bold,
  },
  historyScroll: {
    gap: 10,
  },
  dateBox: {
    width: 36,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
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
