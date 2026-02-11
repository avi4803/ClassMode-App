import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, FadeInDown, LinearTransition  } from "react-native-reanimated";
import { useTheme } from "../../../hooks/useTheme";

export const ClassItem = ({ title, time, location, status, faculty }) => {
  const colors = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return { color: "#22c55e", icon: "check-circle", badge: "Done" };
      case "now":
        return { color: "#eab308", icon: "schedule", badge: "NOW" };
      case "upcoming":
        return { color: "#6366f1", icon: "event", badge: "UPCOMING" };
      case "cancelled":
        return { color: "#ef4444", icon: "cancel", badge: "CANCELLED" };
      case "rescheduled":
        return { color: "#f97316", icon: "event-note", badge: "RESCHEDULED" };
      default:
        return { color: "#22c55e", icon: "check", badge: null };
    }
  };

  const config = getStatusConfig();

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition.springify()}>
      <Pressable 
        onPress={() => setExpanded(!expanded)}
        style={[styles.container, { backgroundColor: colors.cardSlate }]}
      >
        {/* Main Row */}
        <View style={styles.headerRow}>
            <View style={[styles.indicator, { backgroundColor: config.color }]} />
            
            <View style={styles.content}>
            <Text
                numberOfLines={2}
                style={[styles.title, { color: colors.textPrimary }]}
            >
                {title}
            </Text>
            
            {!expanded && (
                <Animated.Text 
                    entering={FadeIn} 
                    numberOfLines={1}
                    style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                {time} • {location}
                </Animated.Text>
            )}
            </View>

            {/* Status Icon/Badge - Only show badge if collapsed, or always? Let's keep it simple */}
            <View style={styles.statusContainer}>
             {config.badge && !expanded && (
                 <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
                 <Text style={[styles.badgeText, { color: config.color }]}>{config.badge}</Text>
                 </View>
             )}
             <MaterialIcons display= "none" name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={colors.textSecondary} />
            </View>
        </View>

        {/* Expanded Details */}
        {expanded && (
            <Animated.View style={styles.detailsContainer} entering={FadeInDown.duration(200)}>
                <View style={styles.divider} />
                
                {/* Detail Grid */}
                <View style={styles.detailRow}>
                    <DetailItem icon="access-time" label="Timing" value={time} color={colors.textSecondary} />
                    <DetailItem icon="meeting-room" label="Room" value={location} color={colors.textSecondary} />
                </View>

                {/* Animated Faculty Section */}
                <Animated.View 
                    style={[styles.facultyCard, { backgroundColor: colors.background }]}
                    entering={FadeIn.delay(20)}
                >
                    <View style={[styles.facultyIcon, { backgroundColor: `${colors.primary}20` }]}>
                        <MaterialIcons name="person" size={20} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={[styles.facultyLabel, { color: colors.textSecondary }]}>Faculty</Text>
                        <Text style={[styles.facultyName, { color: colors.textPrimary }]}>{faculty}</Text>
                    </View>
                </Animated.View>

            </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const DetailItem = ({ icon, label, value, color }) => (
    <View style={styles.detailItem}>
        <MaterialIcons name={icon} size={16} color={color} style={{ marginRight: 6 }} />
        <View>
            <Text style={{ fontSize: 10, color: color, opacity: 0.7 }}>{label}</Text>
            <Text style={{ fontSize: 13, color: color, fontWeight: '600' }}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  indicator: { width: 4, height: 40, borderRadius: 10, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 16, fontFamily: 'Urbanist_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold' },
  statusContainer: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: 'Urbanist_800ExtraBold' },
  
  detailsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
  },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  
  facultyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 12,
      gap: 12,
  },
  facultyIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
  },
  facultyLabel: { fontSize: 10, fontFamily: 'Urbanist_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  facultyName: { fontSize: 14, fontFamily: 'Urbanist_700Bold' , paddingRight: 20 },
});
