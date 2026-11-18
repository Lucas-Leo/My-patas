import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeedbackModal({ visible, title, message, onClose, isDark = false }: {
  visible: boolean; title: string; message: string; onClose: () => void; isDark?: boolean;
}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
        <Ionicons name="information-circle-outline" size={48} color="#FF2BAA" />
        <Text style={[styles.title, { color: isDark ? '#fff' : '#0E457D' }]}>{title}</Text>
        <Text style={[styles.message, { color: isDark ? '#ddd' : '#555' }]}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose} accessibilityRole="button">
          <Text style={styles.label}>Entendi</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: 24, padding: 24, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 12 },
  message: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginVertical: 18 },
  button: { backgroundColor: '#FF2BAA', padding: 14, width: '100%', borderRadius: 14, alignItems: 'center' },
  label: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
