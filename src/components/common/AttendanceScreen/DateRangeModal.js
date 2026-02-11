import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  ScrollView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { THEME } from '../../../constants/colors';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

const DateRangeModal = ({ visible, onClose, onApply, initialRange }) => {
  const colors = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [range, setRange] = useState(initialRange || { start: null, end: null });

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Prev month padding
    for (let i = 0; i < firstDay; i++) {
      days.push({ 
        day: daysInPrevMonth - firstDay + i + 1, 
        month: 'prev', 
        year: month === 0 ? year - 1 : year,
        monthIdx: month === 0 ? 11 : month - 1 
      });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        month: 'curr', 
        year: year,
        monthIdx: month 
      });
    }
    
    // Next month padding
    const nextPadding = 42 - days.length;
    for (let i = 1; i <= nextPadding; i++) {
      days.push({ 
        day: i, 
        month: 'next',
        year: month === 11 ? year + 1 : year,
        monthIdx: month === 11 ? 0 : month + 1
      });
    }
    
    return days;
  }, [currentDate]);

  const handleDayPress = (dayObj) => {
    const dateStr = `${dayObj.year}-${String(dayObj.monthIdx + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
    
    if (!range.start || (range.start && range.end)) {
      setRange({ start: dateStr, end: null });
    } else {
      // If end is before start, swap them
      if (new Date(dateStr) < new Date(range.start)) {
        setRange({ start: dateStr, end: range.start });
      } else {
        setRange({ ...range, end: dateStr });
      }
    }
  };

  const isSelected = (dayObj) => {
    const dateStr = `${dayObj.year}-${String(dayObj.monthIdx + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
    return dateStr === range.start || dateStr === range.end;
  };

  const isInRange = (dayObj) => {
    if (!range.start || !range.end) return false;
    const date = new Date(dayObj.year, dayObj.monthIdx, dayObj.day);
    return date > new Date(range.start) && date < new Date(range.end);
  };

  const quickSelect = (type) => {
    const end = new Date();
    let start = new Date();
    
    switch(type) {
      case 'today':
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case 'month':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
    }
    
    setRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const changeMonth = (delta) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(next);
  };

  const formatDate = (dStr) => {
    if (!dStr) return "-";
    const d = new Date(dStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Select Range</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.quickOptions}>
            {['Today', '7 Days', '30 Days', 'This Month'].map((label, idx) => {
              const types = ['today', '7d', '30d', 'month'];
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.chip, { backgroundColor: colors.border + '20' }]}
                  onPress={() => quickSelect(types[idx])}
                >
                  <Text style={[styles.chipText, { color: colors.primary }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.calendarNav}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: colors.textPrimary }]}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <MaterialIcons name="chevron-right" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={[styles.weekdayText, { color: colors.textSecondary }]}>{d}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarData.map((item, idx) => {
              const selected = isSelected(item);
              const inRange = isInRange(item);
              const isCurr = item.month === 'curr';
              
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[
                    styles.dayCell,
                    selected && { backgroundColor: colors.primary, borderRadius: 8 },
                    inRange && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => handleDayPress(item)}
                >
                  <Text style={[
                    styles.dayText, 
                    { color: isCurr ? colors.textPrimary : colors.textSecondary + '60' },
                    selected && { color: '#fff', fontFamily: THEME.fonts.bold }
                  ]}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.rangePreview}>
              <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>Selected Period</Text>
              <Text style={[styles.rangeValue, { color: colors.textPrimary }]}>
                {formatDate(range.start)} - {formatDate(range.end)}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={() => onApply(range)}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontFamily: THEME.fonts.bold
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 12,
    fontFamily: THEME.fonts.bold
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  monthText: {
    fontSize: 16,
    fontFamily: THEME.fonts.bold
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  weekdayText: {
    width: (width - 88) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: THEME.fonts.bold
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 4
  },
  dayCell: {
    width: (width - 100) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontFamily: THEME.fonts.medium
  },
  footer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rangePreview: {
    flex: 1
  },
  rangeLabel: {
    fontSize: 11,
    fontFamily: THEME.fonts.medium
  },
  rangeValue: {
    fontSize: 14,
    fontFamily: THEME.fonts.bold,
    marginTop: 2
  },
  applyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#fff',
    fontFamily: THEME.fonts.bold,
    fontSize: 14
  }
});

export default DateRangeModal;
