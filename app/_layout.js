import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { notificationListener } from '../src/utils/notification-helper';
import FlashMessage from 'react-native-flash-message';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold, Urbanist_800ExtraBold, Urbanist_900Black } from '@expo-google-fonts/urbanist';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// 1. Mandatory Background Handler (Must be outside the component)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

import { View } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';

// Define the fade transition to prevent white flash
const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

function RootLayoutNav() {
  const colors = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack 
        screenOptions={{ 
          headerShown: false, 
          // Applies background to screens container
          contentStyle: { backgroundColor: colors.background },
          // Fixes flash using the JS stack approach requested
          cardStyleInterpolator: forFade,
        }} 
      />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // 2. Setup listeners (Foreground, Background Open, Quit Open)
    const unsubscribe = notificationListener();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
        <FlashMessage position="top" />
      </ThemeProvider>
    </AuthProvider>
  );
}
