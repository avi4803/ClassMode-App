import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '../../theme/ThemeContext';

const AppToast = ({ visible, message, onClose, timestamp }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset to 0 to force re-animation (reappear effect)
      fadeAnim.setValue(0);
      
      // Fade In
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, timestamp, message]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <MaterialIcons name="verified" size={24} color={colors.success} style={styles.icon} />
          <Text style={styles.text}>{message}</Text>
        </View>
        <Pressable onPress={handleClose}>
          <MaterialIcons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20, // pb-safe-bottom approximation
    left: 16,
    right: 16,
    zIndex: 50,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.toastBg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? colors.toastBorder : 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.toastText,
  },
});

export default AppToast;