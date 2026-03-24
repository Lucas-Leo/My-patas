import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useThemeContext } from '@/context/ThemeContext';

const logoApp = require("@/assets/images/LogoPataAzul.png");
const { width } = Dimensions.get('window');

const initialPets = [
  { id: 1, name: 'Luke', ong: 'ONG1 - Paz e Amor', description: 'Cachorro dócil, ama brincar e é muito carinhoso.', image: require('@/assets/images/cachorro01.jpg') },
  { id: 2, name: 'Princesa', ong: 'ONG Amigo Fiel', description: 'Muito tranquila e ótima companhia.', image: require('@/assets/images/cachorro02.jpg') },
  { id: 3, name: 'Max', ong: 'Abrigo do Coração', description: 'Cheio de energia e adora correr.', image: require('@/assets/images/cachorro03.jpg') },
  { id: 4, name: 'Theo', ong: 'Abrigo do Coração', description: 'Carinhoso e ótimo com crianças.', image: require('@/assets/images/cachorro04.jpg') },
  { id: 5, name: 'Dalila', ong: 'Amigos de quatro patas', description: 'Muito calma e amorosa.', image: require('@/assets/images/cachorro05.jpg') },
  { id: 6, name: 'Billy', ong: 'Aumigos', description: 'Brincalhão e amigável.', image: require('@/assets/images/cachorro06.jpg') },
  { id: 7, name: 'Mingau', ong: 'ONG1 - Paz e Amor', description: 'Gato tranquilo e independente.', image: require('@/assets/images/gato01.jpg') },
  { id: 8, name: 'Salem', ong: 'ONG Amigo Fiel', description: 'Curioso e esperto.', image: require('@/assets/images/gato02.jpg') },
  { id: 9, name: 'Matheo', ong: 'Abrigo do Coração', description: 'Adora carinho e colo.', image: require('@/assets/images/gato03.jpg') },
  { id: 10, name: 'Garfield', ong: 'Abrigo do Coração', description: 'Preguiçoso e muito fofo.', image: require('@/assets/images/gato04.jpg') },
  { id: 11, name: 'Kity', ong: 'Amigos de quatro patas', description: 'Delicada e carinhosa.', image: require('@/assets/images/gato05.jpg') },
  { id: 12, name: 'Chicó', ong: 'Aumigos', description: 'Brincalhão e curioso.', image: require('@/assets/images/gato06.jpg') },
];

export default function SwipeScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const [pets, setPets] = useState(initialPets);
  const [selectedPet, setSelectedPet] = useState(null);

  const position = useRef(new Animated.ValueXY()).current;
  const likeAnim = useRef(new Animated.Value(0)).current;

  const currentPet = pets[0];

  useEffect(() => {
    if (pets.length === 0) {
      setTimeout(() => {
        router.push("/ongs");
      }, 300);
    }
  }, [pets]);

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

  const handleLike = () => {
    triggerLikeAnimation();
    Animated.timing(position, {
      toValue: { x: width, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(removeTopCard);
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

        {currentPet ? (
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
              <View style={[styles.cardContainer, { backgroundColor: isDark ? '#1F1F1F' : '#fff' }]}>
                <Image source={currentPet.image} style={styles.petImage} />

                <View style={styles.infoBox}>
                  <TouchableOpacity onPress={() => setSelectedPet(currentPet)}>
                    <Text style={[styles.petName, { color: '#fff' }]}>
                      {currentPet.name}
                    </Text>
                  </TouchableOpacity>

                  <Text style={{ color: '#90CAF9' }}>
                    {currentPet.ong}
                  </Text>
                </View>
              </View>
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
          <Text style={{ color: isDark ? '#fff' : '#000' }}>
            Redirecionando...
          </Text>
        )}
      </View>

      <Modal visible={!!selectedPet} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPet?.name}</Text>
            <Text>{selectedPet?.ong}</Text>
            <Text>{selectedPet?.description}</Text>

            <TouchableOpacity onPress={() => setSelectedPet(null)} style={styles.closeModal}>
              <Text style={{ color: '#fff' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.bottomNav, { backgroundColor: isDark ? '#181818' : '#fff' }]}>
        <TouchableOpacity onPress={() => router.push("/home")}>
          <MaterialCommunityIcons name="home" size={30} color={isDark ? '#90CAF9' : '#0E457D'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/ongs")}>
          <MaterialIcons name="pets" size={30} color={isDark ? '#90CAF9' : '#0E457D'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/favoritos")}>
          <AntDesign name="heart" size={30} color={isDark ? '#90CAF9' : '#0E457D'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/perfil")}>
          <FontAwesome5 name="user-alt" size={30} color={isDark ? '#90CAF9' : '#0E457D'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { alignItems: 'center', padding: 20 },
  logo: { width: 200, height: 90 },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  cardContainer: {
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 15,
    overflow: 'hidden',
  },

  petImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  infoBox: {
    position: 'absolute',
    bottom: 0,
    padding: 15,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  petName: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: width * 0.6,
    justifyContent: 'space-around',
  },

  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  skipButton: { backgroundColor: '#0E457D' },
  likeButton: { backgroundColor: '#FF2BAA' },

  bottomNav: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  closeModal: {
    marginTop: 10,
    backgroundColor: '#0E457D',
    padding: 10,
    borderRadius: 10,
  },
});