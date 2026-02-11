import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

export const QuickAction = ({ icon, label, onPress, badge }) => {
  const colors = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.btn, { backgroundColor: colors.cardSlate }]}
    >
      {badge && (
        <View style={[styles.badge, { backgroundColor: colors.danger || '#ef4444' }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <MaterialIcons name={icon} size={36} color={colors.primary} />
      <Text style={[styles.text, { color: colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 16,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  text: { fontSize: 16, fontFamily: 'Urbanist_700Bold' },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 6.5,
    fontFamily: 'Urbanist_800ExtraBold',
    textTransform: 'uppercase',
  },
});
