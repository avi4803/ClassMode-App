import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';

export const DashboardHeader = ({ userName, section , batch , onPressNotification , onPressSettings, hasUnread}) => {
  const colors = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
      <SafeAreaView edges={['top']}>
        <View style={styles.container}>
          {/* User Greeting */}
          <View style={styles.userInfo}>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>
              Hey, {userName} 👋
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              {batch} • {section}
            </Text>
          </View>

          {/* Action Icons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onPressNotification}>
              <MaterialIcons name="notifications" size={24} color={colors.textSecondary} />
              {/* Notification Red Dot */}
              {hasUnread && <View style={[styles.notificationDot, { borderColor: colors.background }]} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onPressSettings}>
              <MaterialIcons name="settings" size={24} color={colors.textSecondary}  />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    zIndex: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Urbanist_700Bold',
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444', // red-500
    borderWidth: 2,
  },
});