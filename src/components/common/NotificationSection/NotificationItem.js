import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const NotificationItem = ({ type, title, message, time, isUnread, onPress, originalData }) => {
  const colors = useTheme();
  const [expanded, setExpanded] = useState(false);

  // 1. Dynamic Style Logic based on 'type'
  const getStyles = () => {
    // Override class notifications based on title keywords
    if (type === 'class') {
        const titleLower = title?.toLowerCase() || '';
        if (titleLower.includes('cancelled') || titleLower.includes('canceled')) {
             return { bg: colors.iconRedBg, icon: colors.danger, iconName: 'event-busy', isCancelled: true };
        }
        if (titleLower.includes('rescheduled')) {
             return { bg: colors.bgIndigo, icon: colors.primary, iconName: 'update' };
        }
        if (titleLower.includes('new class') || titleLower.includes('extra class')) {
             return { bg: colors.bgLime, icon: colors.success, iconName: 'event-available', isNew: true };
        }
    }

    switch (type) {
      case 'critical': // Attendance Alerts
        return { bg: colors.iconRedBg, icon: colors.danger, iconName: 'error' };
      case 'warning': 
        return { bg: colors.iconYellowBg, icon: colors.yellow, iconName: 'location-off' }; 
      case 'admin':
        return { bg: colors.iconTealBg, icon: colors.iconTeal, iconName: 'campaign' };
      case 'class':
      default:
        return { bg: colors.bgIndigo, icon: colors.primary, iconName: 'schedule' };
    }
  };

  const styleConfig = getStyles();

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    if (isUnread && onPress) {
      onPress();
    }
  };

  const renderExtraData = () => {
    if (!originalData?.data) return null;
    const entries = Object.entries(originalData.data);
    if (entries.length === 0) return null;

    return (
      <View style={[styles.extraDataContainer, { borderTopColor: colors.border }]}>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.dataRow}>
            <Text style={[styles.dataKey, { color: colors.textSecondary }]}>{key}:</Text>
            <Text style={[styles.dataValue, { color: colors.textPrimary }]}>{String(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.8}
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card, 
          borderColor: expanded ? colors.primary : colors.border,
          borderWidth: expanded ? 1.5 : 1
        }
      ]}
    >
      <View style={styles.mainRow}>
        {/* Icon Circle */}
        <View style={[styles.iconBox, { backgroundColor: styleConfig.bg }]}>
          <MaterialIcons name={styleConfig.iconName} size={24} color={styleConfig.icon} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                <Text 
                  style={[
                    styles.title, 
                    { 
                        color: styleConfig.isCancelled ? colors.danger : (styleConfig.isNew ? styleConfig.icon : (type === 'critical' ? colors.danger : (type === 'warning' ? colors.yellow : colors.textPrimary))),
                        flex: 0, // Allow width to be determined by text
                        marginRight: 6
                    }
                  ]}
                  numberOfLines={expanded ? undefined : 1}
                >
                  {title}
                </Text>
                {/* Badge removed */}
            </View>
            {<Text style={[styles.time, { color: colors.textSecondary }]}>{time}</Text>}
          </View>
          <Text 
            style={[styles.message, { color: colors.textSecondary }]} 
            numberOfLines={expanded ? undefined : 2}
          >
            {message}
          </Text>
        </View>

        {/* Unread Dot / Expand Arrow */}
        <View style={styles.rightAction}>
           {isUnread && !expanded && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
           <MaterialIcons 
             name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
             size={20} 
             color={colors.textSecondary} 
             style={{ marginTop: expanded ? 0 : 4 }}
           />
        </View>
      </View>     
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    // Optional border for cleaner look
    borderWidth: 1, 
    elevation: 0,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
  },
  message: {
    fontSize: 13,
    fontFamily: 'Urbanist_500Medium',
    lineHeight: 18,
  },
  rightAction: {
    alignItems: 'center',
    marginLeft: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
  },
  fullTime: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    marginBottom: 12,
  },
  extraDataContainer: {
    marginTop: 8,
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataKey: {
    fontSize: 13,
    fontFamily: 'Urbanist_700Bold',
    textTransform: 'capitalize',
  },
  dataValue: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
  }
});