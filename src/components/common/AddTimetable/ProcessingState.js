import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

export const ProcessingState = ({ fileName, progress = 0, statusMessage = 'Initializing...' }) => {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>Scanning Timetable</Text>
      <Text style={styles.subHeader}>We’re extracting your class schedule…</Text>

      <View style={styles.progressContainer}>
        {/* Simple Progress Circle/Bar could be better, but sticking to ActivityIndicator + Text for now or a simple bar */}
        <ActivityIndicator size="large" color={colors.primary} style={{ transform: [{ scale: 1.5 }], marginBottom: 20 }} />
        <View style={{ width: 200, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.primary }} />
        </View>
      </View>

      <Text style={[styles.statusText, { color: colors.textPrimary }]}>
        {statusMessage}
      </Text>

      <View style={[styles.fileCard, { backgroundColor: colors.cardSlate }]}>
        <View style={[styles.fileIcon, { backgroundColor: colors.border }]}>
          <MaterialIcons name="image" size={24} color={colors.textSecondary} />
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
  header: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subHeader: { color: '#64748b', marginBottom: 40 },
  progressContainer: { width: 120, height: 120, marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 18, fontWeight: '600', height: 30 },
  fileCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, width: '100%', marginTop: 40 },
  fileIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fileName: { flex: 1, fontWeight: '500' }
});