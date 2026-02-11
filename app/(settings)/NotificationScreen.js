import React, { useState, useCallback, useContext, useEffect } from "react";
import { View, Text, SectionList, RefreshControl, StyleSheet, TouchableOpacity, ActivityIndicator, DeviceEventEmitter } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";
import { AuthContext } from "../../src/context/AuthContext";
import authService from "../../src/services/authService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

const CACHE_KEY = 'NOTIFICATION_DATA';

// Component
import { NotificationItem } from "../../src/components/common/NotificationSection/NotificationItem";

export default function NotificationScreen() {
  const colors = useTheme();
  const { userToken } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);

  const formatTime = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const groupNotifications = (notifications) => {
    const categories = {
      "ClassReminders": "Class Reminders",
      "AttendanceAlerts": "Attendance Alerts",
      "AdminAnnouncements": "Admin Announcements"
    };

    const groups = {};
    Object.values(categories).forEach(cat => groups[cat] = []);

    notifications.forEach(notif => {
      const typeMap = {
        "ClassReminders": "class",
        "AttendanceAlerts": notif.type === "CRITICAL" ? "critical" : "warning",
        "AdminAnnouncements": "admin"
      };

      const groupName = categories[notif.category] || "General";
      if (!groups[groupName]) groups[groupName] = [];

      groups[groupName].push({
        id: notif._id,
        type: typeMap[notif.category] || "class",
        title: notif.title,
        message: notif.body,
        time: formatTime(notif.createdAt),
        isUnread: !notif.isRead,
        originalData: notif
      });
    });

    return Object.keys(groups)
      .filter(key => groups[key].length > 0)
      .map(key => ({
        title: key,
        data: groups[key]
      }));
  };

  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setSections(groupNotifications(parsed));
          setLoading(false);
          return;
        }
      }

      const res = await authService.getNotifications(userToken);
      if (res.success && res.data) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
        const grouped = groupNotifications(res.data);
        setSections(grouped);
      }
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userToken]);

  const handleMarkAsRead = async (id) => {
    try {
      // Optimistic update
      setSections(prevSections => 
        prevSections.map(section => ({
          ...section,
          data: section.data.map(item => 
            item.id === id ? { ...item, isUnread: false } : item
          )
        }))
      );
      
      await authService.markNotificationAsRead(userToken, id);
      
      // Update cache
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        let parsed = JSON.parse(cached);
        parsed = parsed.map(n => n._id === id ? { ...n, isRead: true } : n);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      }
    } catch (error) {
      console.error("Mark as Read Error:", error);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchNotifications();

      const refreshListener = DeviceEventEmitter.addListener('REFRESH_DATA', (event) => {
        console.log('Refreshing Notifications due to arrival:', event?.type);
        fetchNotifications(true);
      });

      return () => {
        refreshListener.remove();
      };
    }
  }, [userToken, fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(true);
  }, [fetchNotifications]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <TouchableOpacity 
            style={[styles.settingsBtn, { backgroundColor: colors.cardSlate }]}
            onPress={() => router.push("/(settings)/NotificationSettingsScreen")}
          >
            <MaterialIcons name="settings" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            
            renderItem={({ item }) => (
              <NotificationItem 
                {...item} 
                onPress={() => handleMarkAsRead(item.id)}
              />
            )}

            renderSectionHeader={({ section: { title } }) => (
              <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>
                {title}
              </Text>
            )}

            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="notifications-off" size={48} color={colors.border} />
                <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No new notifications</Text>
              </View>
            }

            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.card}
              />
            }
          />
        )}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Urbanist_800ExtraBold',
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Urbanist_700Bold',
    marginTop: 24,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  }
});