import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'expo-router';

const logoApp = require('@/assets/images/LogoPataAzul.png');

const { width } = Dimensions.get('window');

export default function Favoritos() {
  const router = useRouter();

  const favoritos = [
    {
      id: '1',
      nome: 'Luke',
      idade: '2 anos',
      descricao: 'Cachorro dócil, cheio de energia e ótimo com crianças.',
      foto: require('@/assets/images/cachorro01.jpg'),
      ong: 'ONG Paz e Amor',
      badges: ['🐶 Dócil', '👶 Ama crianças', '🏠 Precisa de espaço'],
    },
    {
      id: '2',
      nome: 'Salem',
      idade: '1 ano',
      descricao: 'Gato carinhoso, curioso e muito tranquilo.',
      foto: require('@/assets/images/gato02.jpg'),
      ong: 'ONG Amigo Fiel',
      badges: ['🐱 Carinhoso', '🛋️ Tranquilo', '❤️ Companheiro'],
    },
    {
      id: '3',
      nome: 'Max',
      idade: '3 anos',
      descricao: 'Muito sociável, se dá bem com todos os animais.',
      foto: require('@/assets/images/cachorro03.jpg'),
      ong: 'Abrigo do Coração',
      badges: ['🐕 Sociável', '🐾 Brincalhão', '🏡 Ama quintal'],
    },
  ];

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const openModal = (pet: any) => {
    setSelectedPet(pet);
    setModalVisible(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 40,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const handleContinue = () => {
    closeModal();

    setTimeout(() => {
      router.push('/adocao');
    }, 250);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121212' : '#ffffff',
        },
      ]}
    >
      <View style={styles.header}>
        <Image source={logoApp} style={styles.logo} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              color: isDark ? '#FF80AB' : '#FF2BAA',
            },
          ]}
        >
          Meus Favoritos
        </Text>

        {favoritos.map((pet) => (
          <View
            key={pet.id}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1F1F1F' : '#fff',
                borderColor: isDark ? '#424242' : '#eee',
              },
            ]}
          >
            <Image source={pet.foto} style={styles.petImage} />

            <View style={styles.petInfoBox}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.petName,
                      {
                        color: isDark ? '#BBDEFB' : '#0E457D',
                      },
                    ]}
                  >
                    {pet.nome}
                  </Text>

                  <Text
                    style={[
                      styles.petAge,
                      {
                        color: isDark ? '#E0E0E0' : '#444',
                      },
                    ]}
                  >
                    {pet.idade}
                  </Text>

                  <Text
                    style={[
                      styles.petOng,
                      {
                        color: isDark ? '#B0BEC5' : '#777',
                      },
                    ]}
                  >
                    {pet.ong}
                  </Text>
                </View>

                <TouchableOpacity style={styles.heartButton}>
                  <Ionicons
                    name="heart"
                    size={26}
                    color={isDark ? '#FF80AB' : '#FF2BAA'}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.petDescription,
                  {
                    color: isDark ? '#E0E0E0' : '#555',
                  },
                ]}
              >
                {pet.descricao}
              </Text>

              <TouchableOpacity
                onPress={() => openModal(pet)}
                style={[
                  styles.adoptButton,
                  {
                    backgroundColor: isDark ? '#FF80AB' : '#FF2BAA',
                  },
                ]}
              >
                <Text style={styles.adoptText}>Adotar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* MODAL */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {selectedPet && (
              <>
                <Image
                  source={selectedPet.foto}
                  style={styles.modalImage}
                />

                <View style={styles.modalContent}>
                  <Text
                    style={[
                      styles.modalPetName,
                      {
                        color: isDark ? '#fff' : '#0E457D',
                      },
                    ]}
                  >
                    {selectedPet.nome}
                  </Text>

                  <Text
                    style={[
                      styles.modalAge,
                      {
                        color: isDark ? '#DADADA' : '#666',
                      },
                    ]}
                  >
                    {selectedPet.idade}
                  </Text>

                  <View style={styles.ongRow}>
                    <Ionicons
                      name="paw"
                      size={16}
                      color={isDark ? '#FF80AB' : '#FF2BAA'}
                    />

                    <Text
                      style={[
                        styles.modalOng,
                        {
                          color: isDark ? '#BDBDBD' : '#777',
                        },
                      ]}
                    >
                      {selectedPet.ong}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.emotionalText,
                      {
                        color: isDark ? '#F1F1F1' : '#444',
                      },
                    ]}
                  >
                    Você está iniciando o processo de adoção deste pet ❤️
                  </Text>

                  {/* BADGES */}
                  <View style={styles.badgesContainer}>
                    {selectedPet.badges.map((badge: string, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.badge,
                          {
                            backgroundColor: isDark
                              ? '#2A2A2A'
                              : '#F6F6F6',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            {
                              color: isDark ? '#fff' : '#444',
                            },
                          ]}
                        >
                          {badge}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* ETAPAS */}
                  <View
                    style={[
                      styles.stepsBox,
                      {
                        backgroundColor: isDark
                          ? '#2A2A2A'
                          : '#FAFAFA',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepsTitle,
                        {
                          color: isDark ? '#fff' : '#222',
                        },
                      ]}
                    >
                      Como funciona a adoção
                    </Text>

                    <View style={styles.stepsRow}>
                      {[
                        'Solicitação',
                        'Análise',
                        'Entrevista',
                        'Finalização',
                      ].map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                          <View
                            style={[
                              styles.stepCircle,
                              {
                                backgroundColor: isDark
                                  ? '#FF80AB'
                                  : '#FF2BAA',
                              },
                            ]}
                          >
                            <Text style={styles.stepNumber}>
                              {index + 1}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.stepText,
                              {
                                color: isDark ? '#DDD' : '#555',
                              },
                            ]}
                          >
                            {step}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* BOTÕES */}
                  <TouchableOpacity
                    onPress={handleContinue}
                    style={[
                      styles.continueButton,
                      {
                        backgroundColor: isDark
                          ? '#FF80AB'
                          : '#FF2BAA',
                      },
                    ]}
                  >
                    <Text style={styles.continueText}>
                      Continuar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.cancelButton}
                  >
                    <Text
                      style={[
                        styles.cancelText,
                        {
                          color: isDark ? '#CFCFCF' : '#666',
                        },
                      ]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      <BottomNav isDark={isDark} activePage="favoritos" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
  },

  header: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },

  logo: {
    width: 200,
    height: 90,
  },

  scroll: {
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
  },

  petImage: {
    width: 105,
    height: 105,
    borderRadius: 14,
  },

  petInfoBox: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  petName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  petAge: {
    fontSize: 15,
    marginTop: 2,
  },

  petOng: {
    fontSize: 14,
    marginTop: 2,
  },

  petDescription: {
    fontSize: 15,
    marginTop: 10,
    lineHeight: 20,
  },

  heartButton: {
    padding: 4,
    marginRight: 5,
  },

  adoptButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  adoptText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* MODAL */

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContainer: {
    width: width * 0.92,
    borderRadius: 30,
    overflow: 'hidden',
  },

  modalImage: {
    width: '100%',
    height: 240,
  },

  modalContent: {
    padding: 22,
  },

  modalPetName: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modalAge: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 5,
  },

  ongRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },

  modalOng: {
    fontSize: 15,
  },

  emotionalText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18,
    fontWeight: '500',
  },

  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 18,
    gap: 10,
  },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  stepsBox: {
    marginTop: 24,
    borderRadius: 22,
    padding: 18,
  },

  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },

  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  stepItem: {
    alignItems: 'center',
    width: 65,
  },

  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },

  stepText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },

  continueButton: {
    marginTop: 28,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF2BAA',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  continueText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  cancelButton: {
    marginTop: 14,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});