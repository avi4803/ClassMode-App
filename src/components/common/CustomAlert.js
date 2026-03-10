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
import { useTheme } from '../../hooks/useTheme';
import { THEME } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Custom Alert Component
 * A themed, simple replacement for native Alert.alert
 */
export const CustomAlert = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title = "Alert", 
  message = "",
  confirmLabel = "OK",
  cancelLabel = null, // If null, shows only one button
  type = 'default', // 'default' or 'destructive'
  children
}) => {
  const colors = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      animationInTiming={100} 
      animationOutTiming={400}
      onRequestClose={onClose}
      useNativeDriver={true}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={[styles.alertBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          
          {message ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          ) : null}

          {children && <View style={styles.childrenContainer}>{children}</View>}

          <View style={[styles.buttonRow, cancelLabel && styles.buttonRowSplit]}>
            {cancelLabel && (
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={onClose}
                style={[styles.btn, styles.cancelBtn, { backgroundColor: colors.border + '30' }]}
              >
                <Text style={[styles.btnText, { color: colors.textSecondary }]}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={onConfirm || onClose}
              style={[
                styles.btn, 
                { backgroundColor: type === 'destructive' ? '#ef4444' : colors.primary },
                !cancelLabel && { width: '100%' }
              ]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>{confirmLabel}</Text>
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
    padding: 24
  },
  alertBox: {
    width: Math.min(SCREEN_WIDTH * 0.85, 340),
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: THEME.fonts.bold,
    textAlign: 'center',
    marginBottom: 12
  },
  message: {
    fontSize: 14,
    fontFamily: THEME.fonts.medium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  childrenContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center'
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12
  },
  buttonRowSplit: {
    justifyContent: 'space-between'
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    fontSize: 15,
    fontFamily: THEME.fonts.bold
  }
});

export default CustomAlert;
