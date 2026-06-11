import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Agendamento() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/home')}>
        <Text style={styles.buttonText}>Ir para inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#0E457D',
    fontSize: 24,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E457D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
