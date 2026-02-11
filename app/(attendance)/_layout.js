import { View } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "../../src/hooks/useTheme";

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const _layout = () => {
  const colors = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          cardStyleInterpolator: forFade,
        }}>
        <Stack.Screen
          name="AttendanceHistoryScreen"   
        />
        <Stack.Screen
          name="SubjectAttendanceDetail"   
        />
      </Stack>
    </View>
  );
};

export default _layout;
