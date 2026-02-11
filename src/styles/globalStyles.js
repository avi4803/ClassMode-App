import { StyleSheet, Platform } from 'react-native';

export const globalStyles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowCard: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15, // Adjusted for cleaner look
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  shadowButton: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});