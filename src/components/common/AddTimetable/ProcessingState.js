import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export const ProcessingState = ({ fileName, progress = 0, statusMessage = 'Initializing...' }) => {
  const colors = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>Scanning Timetable</Text>
      <Text style={[styles.subHeader, { color: colors.textSecondary }]}>We’re extracting your class schedule…</Text>

      <View style={styles.progressContainer}>
        {/* Simple Progress Circle/Bar */}
        <ActivityIndicator size="large" color={colors.primary} style={{ transform: [{ scale: 1.5 }], marginBottom: 20 }} />
        <View style={{ width: 220, height: 8, backgroundColor: colors.cardSlate, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.primary }} />
        </View>
      </View>

      <Text style={[styles.statusText, { color: colors.textPrimary }]}>
        {statusMessage}
      </Text>

      <View style={[styles.fileCard, { backgroundColor: colors.cardSlate, borderColor: colors.border, borderWidth: 1 }]}>
        <View style={[styles.fileIcon, { backgroundColor: colors.background }]}>
          <MaterialIcons name="image" size={22} color={colors.primary} />
        </View>
        <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
          {fileName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { fontSize: 26, fontFamily: 'Urbanist_800ExtraBold', marginBottom: 8 },
  subHeader: { fontSize: 16, fontFamily: 'Urbanist_500Medium', marginBottom: 40, textAlign: 'center' },
  progressContainer: { width: '100%', marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 18, fontFamily: 'Urbanist_700Bold', height: 30, textAlign: 'center' },
  fileCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, width: '100%', marginTop: 60 },
  fileIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  fileName: { flex: 1, fontSize: 15, fontFamily: 'Urbanist_600SemiBold' }
});