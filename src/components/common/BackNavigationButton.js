import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons , MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function OverlayBackButton({ color = "black" }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <MaterialIcons name="arrow-back-ios" size={26} color={color} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 25,
    zIndex: 1000,
    marginVertical: -30,
  },
});
