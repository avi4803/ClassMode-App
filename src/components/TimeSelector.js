import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../../src/hooks/useTheme";

export const TimeSelector = ({ selectedTime, onSelect }) => {
  const colors = useTheme();
  const options = [10, 15, 30];
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const PADDING = 4;
  const tabWidth = containerWidth ? (containerWidth - PADDING * 2) / 3 : 0;

  useEffect(() => {
    const index = options.indexOf(selectedTime);
    if (index !== -1 && tabWidth > 0) {
      Animated.timing(translateX, {
        toValue: index * tabWidth,
        duration: 250,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [selectedTime, tabWidth]);

  const handleLayout = (event) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.cardSlate }]}
      onLayout={handleLayout}
    >
      {tabWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: colors.card,
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      {options.map((time) => (
        <TouchableOpacity
          key={time}
          onPress={() => onSelect(time)}
          style={styles.optionBtn}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.text, 
            { color: selectedTime === time ? colors.primary : colors.textSecondary }
          ]}>
            {time} mins
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
    position: "relative",
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    zIndex: 1,
  },
  text: {
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