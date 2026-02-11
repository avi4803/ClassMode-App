import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../src/hooks/useTheme";


export default function Layout() {
  const colors = useTheme();
  
  return (
    
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.background,
          height: 65,
          paddingBottom: 0,
          paddingTop: 0,
          borderTopWidth: 0.5,
          borderColor: colors.card,
          elevation: 1, // Android shadow
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="other-houses" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="TimetableScreen"
        options={{
          title: "Timetable",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-month" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="AttendanceOverviewScreen"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="location-on" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />

      
    </Tabs>

  
  );
}
