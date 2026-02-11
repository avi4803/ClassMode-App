import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';

export const TimelineCard = ({ item, isEditMode, onDelete, onAdd, onPress }) => {
  const theme = useTheme();
  const isFree = item.type === 'free';

  // --- RENDER: FREE SLOT ---
  if (isFree) {
    if (isEditMode) {
      // Edit Mode: "+ Add Class" Button
      return (
        <TouchableOpacity 
          onPress={() => onAdd(item)}
          activeOpacity={0.7}
          style={[styles.addClassBox, { backgroundColor: theme.addClassBg, borderColor: theme.addClassBorder }]}
        >
          <View style={styles.addInner}>
            <MaterialIcons name="add" size={24} color={theme.primary} />
            <Text style={[styles.addText, { color: theme.primary, fontFamily: theme.fonts.semiBold }]}>Add Class</Text>
          </View>
        </TouchableOpacity>
      );
    }
    // View Mode: Simple Dashed Line
    return (
      <View style={[styles.freeSlot, { borderColor: theme.border }]}>
        <Text style={[styles.freeText, { color: theme.textSecondary, fontFamily: theme.fonts.medium }]}>
          Free Slot — {item.duration}
        </Text>
      </View>
    );
  }

  const statusStyle = getStatusColor(item.status, theme);

  // --- RENDER: CLASS CARD ---
  return (
    <TouchableOpacity 
      activeOpacity={isEditMode ? 0.7 : 1} 
      onPress={() => onPress && onPress(item)}
      disabled={!isEditMode}
    >
      <View style={[
        styles.card, 
        { 
          backgroundColor: theme.card, 
          borderColor: isEditMode ? theme.border : (item.status === 'Ongoing' ? theme.primary : theme.border),
          opacity: statusStyle.isGreyscale ? 0.7 : 1
        },
        isEditMode && { borderWidth: 1, borderColor: theme.border } 
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fonts.bold }]}>{item.title}</Text>
          
          {isEditMode && !['Cancelled', 'Done', 'Passed', 'Completed'].includes(item.status) ? (
            // Edit Mode: Delete Button (Only for future/ongoing classes)
            <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={10}>
               <MaterialIcons name="delete" size={22} color={theme.deleteIcon} />
            </TouchableOpacity>
          ) : (
            // View Mode OR Passed/Cancelled Class: Status Badge
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text, fontFamily: theme.fonts.bold }]}>
                {item.status === 'Done' ? 'Passed' : item.status}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.duration, { color: theme.textSecondary, fontFamily: theme.fonts.medium }]}>
          {item.startTime} – {item.endTime}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialIcons name="room" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary, fontFamily: theme.fonts.medium }]}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="person-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary, fontFamily: theme.fonts.medium }]}>{item.instructor}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper for Badge Colors
const getStatusColor = (status, colors) => {
  switch (status) {
    case 'Upcoming': return { bg: colors.statusUpcomingBg, text: colors.statusUpcomingText };
    case 'Ongoing': return { bg: colors.statusOngoingBg, text: colors.statusOngoingText };
    case 'Completed': return { bg: colors.statusCompletedBg, text: colors.statusCompletedText };
    case 'Done': 
    case 'Passed':
      return { bg: '#f1f5f9', text: '#64748b', isGreyscale: true };
    default: return { bg: colors.cardSlate, text: colors.textSecondary };
  }
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3},
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 16, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, textTransform: 'uppercase' },
  duration: { fontSize: 13, marginBottom: 12 },
  detailsRow: { flex: 1 ,flexDirection: 'row', gap: 10 ,flexWrap: 'wrap',paddingRight:15},
  detailItem: {flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: {fontSize: 13 },
  
  // Free Slot Styles
  freeSlot: { height: 80, borderLeftWidth: 2, borderStyle: 'dashed', justifyContent: 'center', paddingLeft: 16, marginLeft: 10 },
  freeText: { fontSize: 14, fontStyle: 'italic' },
  
  // Add Class Button Styles
  addClassBox: { height: 90, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addText: { fontSize: 15 }
});