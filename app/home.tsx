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
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import api from '../src/service/api';
import { ApiPet, PetApp, normalizarPet, obterIdUsuarioLogado } from '../src/utils/pets';

const logoApp = require('@/assets/images/LogoPataAzul.png');
const { width, height } = Dimensions.get('window');

function petImageSource(pet?: PetApp | null) {
  return pet?.imageUri ? { uri: pet.imageUri } : logoApp;
}

export default function SwipeScreen() {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const [pets, setPets] = useState<PetApp[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLike, setSavingLike] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const likeAnim = useRef(new Animated.Value(0)).current;

  const sheetY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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

  const sheetPan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
    onPanResponderMove: (_, g) => {
      if (g.dy > 0) {
        sheetY.setValue(g.dy);
      }
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 120) {
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

      {selectedPet && (
        <>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeSheet} />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: sheetY }],
              },
            ]}
            {...sheetPan.panHandlers}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Image source={petImageSource(selectedPet)} style={styles.sheetImage} />

              <View style={styles.sheetContent}>
                <Text style={styles.sheetTitle}>{selectedPet.name}</Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ONG</Text>
                  <Text>{selectedPet.ong}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sobre</Text>
                  <Text>{selectedPet.description}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Detalhes</Text>
                  <Text>{selectedPet.idade} - {selectedPet.porte}</Text>
                  <Text>{selectedPet.vacinado ? 'Vacinado' : 'Nao vacinado'}</Text>
                </View>

                <TouchableOpacity style={styles.actionPrimary}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Adotar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </>
      )}

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
    backgroundColor: 'rgba(0,0,0,0.5)'
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.85,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },

  sheetImage: {
    width: '100%',
    height: 250
  },

  sheetContent: {
    padding: 20
  },

  sheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },

  section: {
    marginBottom: 15
  },

  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },

  actionPrimary: {
    marginTop: 20,
    backgroundColor: '#FF2BAA',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center'
  },
});
