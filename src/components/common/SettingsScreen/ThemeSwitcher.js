import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

const CONTAINER_WIDTH = 140;
const PADDING = 4;
const TAB_WIDTH = (CONTAINER_WIDTH - PADDING * 2) / 3;

export const ThemeSwitcher = ({ currentMode, onChange }) => {
  const colors = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;

  const modes = [
    { id: "light", icon: "light-mode" },
    { id: "dark", icon: "dark-mode" },
    { id: "system", icon: "brightness-auto" },
  ];

  useEffect(() => {
    const index = modes.findIndex((mode) => mode.id === currentMode);
    if (index !== -1) {
      Animated.timing(translateX, {
        toValue: index * TAB_WIDTH,
        duration: 250,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [currentMode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardSlate }]}>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            backgroundColor: colors.card,
            width: TAB_WIDTH,
            transform: [{ translateX }],
          },
        ]}
      />
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode.id}
          onPress={() => onChange(mode.id)}
          style={styles.tab}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={mode.icon}
            size={20}
            color={
              currentMode === mode.id ? colors.primary : colors.textSecondary
            }
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: PADDING,
    borderRadius: 10,
    width: CONTAINER_WIDTH,
    position: "relative",
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    zIndex: 1,
  },
  activeIndicator: {
    position: "absolute",
    top: PADDING,
    left: PADDING,
    bottom: PADDING,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});
