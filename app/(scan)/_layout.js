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
        name="AddTimetableScreen" 
        options={{ headerShown: false }} // We are using our own custom header
      />
    </Stack>
  );
};

export default Layout;
