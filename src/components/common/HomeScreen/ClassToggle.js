import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, LayoutChangeEvent } from "react-native";
import { useTheme } from "../../../hooks/useTheme";

export const ClassToggle = ({ filter, setFilter }) => {
  const colors = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const tabs = ["All", "Upcoming", "Completed"];
  const PADDING = 4;
  
  // Calculate tab width based on container width
  const tabWidth = containerWidth ? (containerWidth - PADDING * 2) / 3 : 0;

  useEffect(() => {
    const index = tabs.indexOf(filter);
    if (index !== -1 && tabWidth > 0) {
      Animated.timing(translateX, {
        toValue: index * tabWidth,
        duration: 250,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [filter, tabWidth]);

  const handleLayout = (event) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View 
      style={[styles.toggleContainer, { backgroundColor: colors.cardSlate }]}
      onLayout={handleLayout}
    >
      {tabWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: colors.toggle,
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setFilter(tab)}
          style={styles.toggleTab}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleText,
              { color: filter === tab ? colors.textPrimary : colors.textSecondary },
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
    position: "relative",
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});