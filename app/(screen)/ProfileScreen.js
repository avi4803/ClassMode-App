import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";

// Component Imports
import { ProfileHero } from "../../src/components/common/ProfileScreen/ProfileHero";
import { InfoRow } from "../../src/components/common/ProfileScreen/InfoRow";

//for autoscroll up
import { useRef } from "react"; 
import { router, useFocusEffect } from "expo-router"; 
import { useScrollToTop } from "@react-navigation/native";

import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";

export default function ProfileScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const scrollRef = useRef(null); 
  useScrollToTop(scrollRef);

  // Initial Data
  const [userData, setUserData] = useState({
    name: "User",
    initials: "U",
    college: "-",
    details: "-",
    info: []
  });

  const fetchProfile = async () => {
    try {
      const response = await authService.getDashboard(userToken);
      if (response.success && response.data) {
        const { user } = response.data;
        
        const details = `${user.batch?.year ? user.batch.year : '-'} · ${user.section?.name ? 'Section ' + user.section.name : '-'}`;
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

        setUserData({
          name: user.name,
          initials,
          college: user.college?.name || "-",
          details,
          info: [
            {
              id: 1,
              icon: "school",
              label: "College",
              value: user.college?.name || "-",
            },
            {
              id: 2,
              icon: "calendar-today",
              label: "Batch/Year",
              value: `${user.batch?.year || '-'} / ${user.batch?.program || '-'}`,
            },
            { id: 3, icon: "groups", label: "Section", value: user.section?.name ? `Section ${user.section.name}` : "-" },
            {
              id: 4,
              icon: "email",
              label: "Email",
              value: user.email,
              isVerified: true, // Assuming true or check backend
            },
          ]
        });
      }
    } catch (error) {
      console.log("Fetch Profile Error", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userToken]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  // 2. Trigger scroll to top whenever this screen is focused
  // useFocusEffect(
  //   useCallback(() => {
  //     // Small timeout ensures the layout is ready before scrolling
  //     const timeout = setTimeout(() => {
  //       scrollRef.current?.scrollTo({ y: 0, animated: true });
  //     }, 10);

  //     return () => clearTimeout(timeout);
  //   }, [])
  // );

  if (loading) {
     return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: colors.background}}>
           <ActivityIndicator size="large" color={colors.primary} />
        </View>
     )
  }

  const ActionButton = ({ icon, label , onPress }) => (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.actionLeft}>
        <MaterialIcons name={icon} size={22} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.textPrimary }]}>
          {label}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <ProfileHero
            name={userData.name}
            initials={userData.initials}
            college={userData.college}
            details={userData.details}
          />

          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            {userData.info.map((item) => (
              <InfoRow key={item.id} {...item} />
            ))}
          </View>

          <View style={styles.actionList}>
            <ActionButton icon="edit" label="Edit Profile" onPress= {() => {router.push('EditProfileScreen') ; }} />
            <ActionButton icon="notifications" label="Notification Settings" onPress= {() => {router.push('NotificationSettingsScreen') ; }}/>
            <ActionButton icon="settings" label="App Settings" onPress= {() => {router.push('SettingsScreen') ; }} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  infoCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  actionList: { gap: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    
    
    
    
  },
  actionLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  actionText: { fontSize: 16, fontFamily: 'Urbanist_700Bold' },
});
