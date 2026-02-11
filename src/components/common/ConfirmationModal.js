import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Pressable, 
  Dimensions 
} from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title = "Delete this class?", 
  description = "This class will be removed from your timetable for this day.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDestructive = true 
}) => {
  const colors = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop with Blur effect */}
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Animated.View 
        
          
          style={[styles.backdropTint, { backgroundColor: 'rgba(15, 23, 42, 0.6)' }]} 
        />
      </Pressable>

      <View style={styles.container}>
        <Animated.View 
          
          style={[styles.sheet, { backgroundColor: colors.card }]}
        >
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>

            <View style={styles.buttonGroup}>
              {/* Confirm Button */}
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={onConfirm}
                style={[
                  styles.btn, 
                  { backgroundColor: isDestructive ? '#dc2626' : colors.primary }
                ]}
              >
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={onClose}
                style={[styles.btn, { backgroundColor: colors.cardSlate }]}
              >
                <Text style={[styles.cancelText, { color: colors.textPrimary }]}>{cancelLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Bottom Safe Area Padding */}
          <View style={{ height: 34 }} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  backdropTint: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    // Native shadow for elevated sheet
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
  },
  content: {
    paddingTop: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
