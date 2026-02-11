import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

export const UpNextCard = ({
  title,
  time,
  location,
  instructor,
  countdown,
}) => {
  const colors = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBlue }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, { color: colors.accentBlue }]}>
            UP NEXT
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.bgIndigo }]}>
          <Text style={[styles.badgeText, {  color: colors.accentBlue }]}>
            {countdown}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <MaterialIcons
            name="schedule"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {time}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons
            name="meeting-room"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {[location, instructor].filter(Boolean).join(" • ")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 16, marginBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: { 
    fontSize: 11, 
    fontFamily: 'Urbanist_800ExtraBold', 
    letterSpacing: 1, 
    marginBottom: 4 
  },
  title: { 
    fontSize: 22, 
    fontFamily: 'Urbanist_700Bold' 
  },
  badge: {marginHorizontal: -12, marginVertical: -7 , borderRadius: 6, paddingHorizontal:6 , paddingVertical: 3 , position: "absolute" , top: 0 , right: 0 , display: "none"},
  badgeText: { 
    fontSize: 13, 
    fontFamily: 'Urbanist_700Bold',
  },
  footer: { marginTop: 16, gap: 8 , },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8,  },
  infoText: { 
    fontSize: 14, 
    fontFamily: 'Urbanist_600SemiBold' , 
  },
});
