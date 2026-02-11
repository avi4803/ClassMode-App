import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ScheduleDetailScreen" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EditClassScreen" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
};

export default Layout;
