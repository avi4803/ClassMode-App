import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../hooks/useTheme';

export const AttendanceCard = ({ percentage }) => {
  const colors = useTheme();
  const { width } = useWindowDimensions();
  
  // Responsive Scaling
  const isSmallScreen = width < 380;
  const size = isSmallScreen ? 48 : 56;
  const strokeWidth = isSmallScreen ? 3 : 4;
  
  // --- SVG Math ---
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate how much of the stroke to show
  const progress = (percentage / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardSlate }]}>
      {/* Ribbon Badge */}
      <View style={styles.ribbonContainer}>
        <View style={[styles.ribbon, { backgroundColor: colors.primary }]}>
          <Text style={[styles.ribbonText, { color: '#ffffff' }]}>COMING SOON</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={[styles.progressContainer, { width: size, height: size }]}>
          <Svg width={size} height={size} style={styles.svg}>
            {/* Background Circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.border}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Foreground Circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke='#22c55e'
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          <View style={styles.textOverlay}>
            <Text style={[styles.percentText, { color: colors.textPrimary, fontSize: isSmallScreen ? 11 : 13 }]}>
              {percentage}%
            </Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text 
            numberOfLines={1} 
            style={[styles.title, { color: colors.textPrimary, fontSize: isSmallScreen ? 15 : 17 }]}
          >
            Attendance
          </Text>
          <Text 
            numberOfLines={1} 
            style={[styles.subtitle, { color: colors.textSecondary, fontSize: isSmallScreen ? 11 : 12 }]}
          >
            On track (Min 75%)
          </Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: '#22c55e' }]}>
        <MaterialIcons name="thumb-up" size={isSmallScreen ? 12 : 14} color={colors.cardSlate} />
        <Text style={[styles.statusText, { color: colors.cardSlate, fontSize: isSmallScreen ? 11 : 13 }]}>
          {percentage >= 75 ? 'Good' : 'Bad'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 24,
    overflow: 'hidden', // Ensures ribbon is clipped properly
    position: 'relative'
  },
  contentRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1, // Takes available space
    marginRight: 8
  },
  progressContainer: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  svg: {
    position: 'absolute',
  },
  textOverlay: {
    flex: 1,
    paddingBottom: "10%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: { fontFamily: 'Urbanist_800ExtraBold' },
  textContainer: { 
    marginLeft: 12,
    flex: 1, // Prevents text from pushing ribbon/badge out
  },
  title: { fontFamily: 'Urbanist_700Bold' },
  subtitle: { fontFamily: 'Urbanist_500Medium', marginTop: 2 },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 10,
    minWidth: 60,
    justifyContent: 'center'
  },
  statusText: { fontFamily: 'Urbanist_700Bold', marginLeft: 4 },
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    overflow: 'hidden',
    zIndex: 10,
  },
  ribbon: {
    position: 'absolute',
    top: 15,
    right: -25,
    width: 100,
    paddingVertical: 3,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  ribbonText: {
    fontSize: 7,
    fontFamily: 'Urbanist_900Black',
    letterSpacing: 1,
  },
});