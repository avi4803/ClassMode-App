import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";
import { router } from "expo-router";

export const ProfileHero = ({ name, college, details, initials }) => {
  const colors = useTheme();

  return (
    <LinearGradient colors={colors.profileGradient} style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatar, { backgroundColor: colors.avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <TouchableOpacity
          style={[styles.cameraBtn, { backgroundColor: colors.card }]}
        >
          <MaterialIcons name="photo-camera" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subText}>{college}</Text>
      <Text style={styles.subText}>{details}</Text>

      <TouchableOpacity style={styles.editBtn} onPress={() => {router.push('EditProfileScreen')}}>
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWeight: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarText: { color: "#fff", fontSize: 36, fontFamily: 'Urbanist_800ExtraBold' },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  name: { color: "#fff", fontSize: 24, fontFamily: 'Urbanist_800ExtraBold' },
  subText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: 'Urbanist_600SemiBold', marginTop: 4 },
  editBtn: {
    marginTop: 24,
    width: "100%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
  },
  editBtnText: { color: "#fff", fontFamily: 'Urbanist_700Bold', fontSize: 14 },
});
