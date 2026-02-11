import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export const AnimatedSwitch = ({ value, onValueChange }) => {
  const colors = useTheme();
  
  // 1. Animated Value (0 = off, 1 = on)
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  // 2. Sync with prop changes
  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // backgroundColor requires false
    }).start();
  }, [value]);

  // 3. Animate Background Color
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.toggleTrackOff, colors.toggleTrackOn]
  });

  // 4. Animate Knob Position
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20]
  });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View 
          style={[
            styles.knob, 
            { 
              backgroundColor: colors.toggleKnob,
              transform: [{ translateX }]
            }
          ]} 
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2, // padding for the knob
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  }
});