import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  PanResponder,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'expo-router';
import api from '../src/service/api';
import { ApiPet, PetApp, normalizarPet, obterIdUsuarioLogado } from '../src/utils/pets';

const logoApp = require('@/assets/images/LogoPataAzul.png');
const { width, height } = Dimensions.get('window');

function petImageSource(pet?: PetApp | null) {
  return pet?.imageUri ? { uri: pet.imageUri } : logoApp;
}

export default function SwipeScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const [pets, setPets] = useState<PetApp[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLike, setSavingLike] = useState(false);
  
  // Estado para controlar a exibição do Modal de Passos para Adoção
  const [stepsModalVisible, setStepsModalVisible] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const likeAnim = useRef(new Animated.Value(0)).current;

  const sheetY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const stepsFadeAnim = useRef(new Animated.Value(0)).current;
  const stepsSlideAnim = useRef(new Animated.Value(40)).current;

  const currentPet = pets[0];

  useEffect(() => {
    carregarPets();
  }, []);

  async function carregarPets() {
    try {
      setLoading(true);

      const petsResponse = await api.get('/pets');
      const petsBanco = Array.isArray(petsResponse.data)
        ? petsResponse.data.map((pet: ApiPet) => normalizarPet(pet)).filter((pet: PetApp) => Number.isFinite(pet.id))
        : [];

      const idUsuario = await obterIdUsuarioLogado();

      if (!idUsuario) {
        setPets(petsBanco);
        return;
      }

      const favoritosResponse = await api.get(`/petsfavoritados/usuario/${idUsuario}`);
      const favoritosIds = new Set(
        Array.isArray(favoritosResponse.data)
          ? favoritosResponse.data.map((pet: ApiPet) => Number(pet.fk_idpet || pet.idpet))
          : []
      );

      setPets(petsBanco.filter((pet: PetApp) => !favoritosIds.has(pet.id)));
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar os pets do banco.');
    } finally {
      setLoading(false);
    }
  }

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const removeTopCard = () => {
    setPets(prev => prev.slice(1));
    position.setValue({ x: 0, y: 0 });
  };

  const triggerLikeAnimation = () => {
    likeAnim.setValue(0);
    Animated.sequence([
      Animated.spring(likeAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnim, {
        toValue: 0,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = async () => {
    if (!currentPet || savingLike) return;

    try {
      setSavingLike(true);

      const idUsuario = await obterIdUsuarioLogado();

      if (!idUsuario) {
        Alert.alert('Login necessario', 'Entre na sua conta para favoritar pets.');
        return;
      }

      await api.post('/petsfavoritados', {
        fk_idusuario: idUsuario,
        fk_idpet: currentPet.id,
      });

      triggerLikeAnimation();
      Animated.timing(position, {
        toValue: { x: width, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }).start(removeTopCard);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel favoritar este pet.');
      resetPosition();
    } finally {
      setSavingLike(false);
    }
  };

  const handleSkip = () => {
    Animated.timing(position, {
      toValue: { x: -width, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(removeTopCard);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const openSheet = (pet: PetApp) => {
    setSelectedPet(pet);
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setSelectedPet(null));
  };

  // Funções para abrir/fechar o Modal explicativo de Adoção
  const openStepsModal = () => {
    setStepsModalVisible(true);
    Animated.parallel([
      Animated.timing(stepsFadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(stepsSlideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeStepsModal = () => {
    Animated.parallel([
      Animated.timing(stepsFadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(stepsSlideAnim, {
        toValue: 40,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStepsModalVisible(false);
    });
  };

  const handleContinueAdoption = () => {
    closeStepsModal();
    closeSheet();
    setTimeout(() => {
      router.push('/adocao');
    }, 250);
  };

  const sheetPan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
    onPanResponderMove: (_, g) => {
      if (g.dy > 0) {
        sheetY.setValue(g.dy);
      }
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 150) {
        closeSheet();
      } else {
        Animated.spring(sheetY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        handleLike();
      } else if (gesture.dx < -120) {
        handleSkip();
      } else {
        resetPosition();
      }
    },
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#f8f8f8' }]}>
      <View style={styles.header}>
        <Image source={logoApp} style={styles.logo} />
      </View>

      <View style={styles.mainContent}>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: '40%',
            alignSelf: 'center',
            zIndex: 999,
            opacity: likeAnim,
            transform: [
              {
                scale: likeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1.8],
                }),
              },
            ],
          }}
        >
          <AntDesign name="heart" size={120} color="#FF3040" />
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF2BAA" />
        ) : currentPet ? (
          <>
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              }}
            >
              <TouchableOpacity activeOpacity={0.9} onPress={() => openSheet(currentPet)}>
                <View style={[styles.cardContainer, { backgroundColor: isDark ? '#1F1F1F' : '#fff' }]}>
                  <Image source={petImageSource(currentPet)} style={styles.petImage} />

                  <View style={styles.infoBox}>
                    <TouchableOpacity onPress={() => openSheet(currentPet)}>
                      <Text style={[styles.petName, { color: '#fff' }]}>
                        {currentPet.name}
                      </Text>
                    </TouchableOpacity>

                    <Text style={{ color: '#90CAF9' }}>
                      {currentPet.ong}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkip}>
                <AntDesign name="close" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={handleLike}>
                <AntDesign name="heart" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#0E457D' }]}>
            Nenhum pet disponivel agora.
          </Text>
        )}
      </View>

      {/* DETALHES DO PET (TELA CHEIA) */}
      {selectedPet && (
        <>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeSheet} />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: isDark ? '#1E1E1E' : '#fff',
                transform: [{ translateY: sheetY }],
              },
            ]}
            {...sheetPan.panHandlers}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.imageWrapper}>
                <Image source={petImageSource(selectedPet)} style={styles.sheetImage} />
                
                <TouchableOpacity style={styles.closeFloatingButton} onPress={closeSheet}>
                  <AntDesign name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                <View style={styles.sheetContent}>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.sheetTitle, { color: isDark ? '#fff' : '#222' }]}>
                      {selectedPet.name}
                    </Text>
                    <FontAwesome5 
                      name={selectedPet.porte?.toLowerCase().includes('gato') ? 'cat' : 'dog'} 
                      size={26} 
                      color="#FF2BAA" 
                    />
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagContainer}>
                    <View style={[styles.tag, { backgroundColor: isDark ? '#333' : '#F0F4F8' }]}>
                      <MaterialIcons name="hourglass-empty" size={16} color="#0E457D" style={styles.tagIcon} />
                      <Text style={[styles.tagText, { color: isDark ? '#eee' : '#333' }]}>{selectedPet.idade}</Text>
                    </View>

                    <View style={[styles.tag, { backgroundColor: isDark ? '#333' : '#F0F4F8' }]}>
                      <FontAwesome5 name="weight" size={14} color="#0E457D" style={styles.tagIcon} />
                      <Text style={[styles.tagText, { color: isDark ? '#eee' : '#333' }]}>{selectedPet.porte}</Text>
                    </View>

                    <View style={[styles.tag, { backgroundColor: selectedPet.vacinado ? '#E8F5E9' : '#FFEBEE' }]}>
                      <MaterialIcons 
                        name={selectedPet.vacinado ? 'verified' : 'gpp-bad'} 
                        size={16} 
                        color={selectedPet.vacinado ? '#2E7D32' : '#C62828'} 
                        style={styles.tagIcon} 
                      />
                      <Text style={[styles.tagText, { color: selectedPet.vacinado ? '#2E7D32' : '#C62828', fontWeight: '600' }]}>
                        {selectedPet.vacinado ? 'Vacinado' : 'Não vacinado'}
                      </Text>
                    </View>
                  </ScrollView>

                  <View style={[styles.ongCard, { backgroundColor: isDark ? '#2D2D2D' : '#F9F9F9', borderColor: isDark ? '#444' : '#EAEAEA' }]}>
                    <View style={styles.ongIconContainer}>
                      <MaterialIcons name="storefront" size={20} color="#FF2BAA" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Instituição / ONG</Text>
                      <Text style={[styles.ongName, { color: isDark ? '#BBB' : '#555' }]}>{selectedPet.ong}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre</Text>
                    <Text style={[styles.descriptionText, { color: isDark ? '#CCC' : '#666' }]}>
                      {selectedPet.description || 'Nenhuma descrição fornecida para este pet.'}
                    </Text>
                  </View>

                  {/* Dispara o modal de passos explicativos */}
                  <TouchableOpacity 
                    style={styles.actionPrimary} 
                    activeOpacity={0.8}
                    onPress={openStepsModal}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Adotar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </>
      )}

      {/* MODAL EXPLICATIVO DOS PASSOS DA ADOÇÃO */}
      <Modal
        transparent
        visible={stepsModalVisible}
        animationType="none"
        onRequestClose={closeStepsModal}
      >
        <View style={styles.stepsOverlay}>
          <Animated.View
            style={[
              styles.modalStepsContainer,
              {
                backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                opacity: stepsFadeAnim,
                transform: [{ translateY: stepsSlideAnim }],
              },
            ]}
          >
            {selectedPet && (
              <View style={{ flex: 1 }}>
                <View style={styles.stepsImageWrapper}>
                  <Image
                    source={petImageSource(selectedPet)}
                    style={styles.stepsModalImage}
                  />
                  <TouchableOpacity style={styles.closeFloatingButton} onPress={closeStepsModal}>
                    <AntDesign name="close" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                  <View style={styles.stepsModalContent}>
                    <Text style={[styles.stepsModalPetName, { color: isDark ? '#fff' : '#0E457D' }]}>
                      {selectedPet.name}
                    </Text>

                    <Text style={[styles.stepsModalAge, { color: isDark ? '#DADADA' : '#666' }]}>
                      {selectedPet.idade}
                    </Text>

                    <View style={styles.ongRow}>
                      <Ionicons name="paw" size={16} color={isDark ? '#FF80AB' : '#FF2BAA'} />
                      <Text style={[styles.stepsModalOng, { color: isDark ? '#BDBDBD' : '#777' }]}>
                        {selectedPet.ong}
                      </Text>
                    </View>

                    <Text style={[styles.emotionalText, { color: isDark ? '#F1F1F1' : '#444' }]}>
                      Você está iniciando o processo de adoção deste pet ❤️
                    </Text>

                    {/* BOX DE ETAPAS */}
                    <View style={[styles.stepsBox, { backgroundColor: isDark ? '#2A2A2A' : '#FAFAFA' }]}>
                      <Text style={[styles.stepsTitle, { color: isDark ? '#fff' : '#222' }]}>
                        Como funciona a adoção
                      </Text>

                      <View style={styles.stepsRow}>
                        {['Solicitação', 'Análise', 'Entrevista', 'Finalização'].map((step, index) => (
                          <View key={index} style={styles.stepItem}>
                            <View style={[styles.stepCircle, { backgroundColor: isDark ? '#FF80AB' : '#FF2BAA' }]}>
                              <Text style={styles.stepNumber}>{index + 1}</Text>
                            </View>
                            <Text style={[styles.stepText, { color: isDark ? '#DDD' : '#555' }]}>
                              {step}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* BOTÕES DE ENCAMINHAMENTO */}
                    <TouchableOpacity
                      onPress={handleContinueAdoption}
                      style={[styles.continueButton, { backgroundColor: isDark ? '#FF80AB' : '#FF2BAA' }]}
                    >
                      <Text style={styles.continueText}>Continuar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={closeStepsModal} style={styles.cancelButton}>
                      <Text style={[styles.cancelText, { color: isDark ? '#CFCFCF' : '#666' }]}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      <BottomNav isDark={isDark} activePage="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: 45
  },

  header: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20
  },

  logo: {
    width: 200,
    height: 90
  },

  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  cardContainer: {
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 15,
    overflow: 'hidden'
  },

  petImage: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },

  infoBox: {
    position: 'absolute',
    bottom: 0,
    padding: 15,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  petName: {
    fontSize: 26,
    fontWeight: 'bold'
  },

  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: width * 0.6,
    justifyContent: 'space-around'
  },

  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },

  skipButton: {
    backgroundColor: '#0E457D'
  },

  likeButton: {
    backgroundColor: '#FF2BAA'
  },

  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  imageWrapper: {
    width: width,
    height: height * 0.45,
    position: 'relative',
  },

  sheetImage: {
    width: '100%',
    height: '100%',
  },

  closeFloatingButton: {
    position: 'absolute',
    top: 45,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },

  scrollContainer: {
    flex: 1,
  },

  sheetContent: {
    padding: 24
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  sheetTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  tagContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  tagIcon: {
    marginRight: 5,
  },

  tagText: {
    fontSize: 14,
  },

  ongCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },

  ongIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 43, 170, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  ongName: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },

  section: {
    marginBottom: 24
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8
  },

  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },

  actionPrimary: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#FF2BAA',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2BAA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 40,
  },

  /* ESTILOS NOVOS DO FLUXO DE PASSOS (MODAL ADOÇÃO) */

  stepsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },

  modalStepsContainer: {
    width: width,
    height: height,
    flex: 1,
  },

  stepsImageWrapper: {
    width: width,
    height: height * 0.42,
    position: 'relative',
  },

  stepsModalImage: {
    width: '100%',
    height: '100%',
  },

  stepsModalContent: {
    padding: 24,
  },

  stepsModalPetName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  stepsModalAge: {
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

  stepsModalOng: {
    fontSize: 15,
  },

  emotionalText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18,
    fontWeight: '500',
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
    width: 70,
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
    paddingVertical: 16,
    borderRadius: 25,
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
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 40,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});