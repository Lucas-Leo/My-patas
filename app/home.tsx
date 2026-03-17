import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import Entypo from '@expo/vector-icons/Entypo';
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

const PetCard = ({ pet, isDark, onPressName }) => (
  <View
    style={[
      styles.cardContainer,
      {
        backgroundColor: isDark ? '#1F1F1F' : '#fff',
        borderColor: isDark ? '#424242' : '#ddd',
      },
    ]}
  >
    <Image source={pet.image} style={styles.petImage} resizeMode="cover" />

    <View
      style={[
        styles.infoBox,
        {
          backgroundColor: isDark
            ? 'rgba(18, 18, 18, 0.9)'
            : 'rgba(255, 255, 255, 0.7)',
        },
      ]}
    >
      <TouchableOpacity onPress={onPressName}>
        <Text
          style={[
            styles.petName,
            { color: isDark ? '#FFFFFF' : '#333' },
          ]}
        >
          {pet.name}
        </Text>
      </TouchableOpacity>
      <Text
        style={[
          styles.petONG,
          { color: isDark ? '#90CAF9' : '#0E457D' },
        ]}
      >
        {pet.ong}
      </Text>
    </View>
  </View>
);

const SwipeScreen = () => {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const [pets, setPets] = useState(initialPets);
  const [favorites, setFavorites] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  const currentPet = pets[0];

  const handleAction = (action) => {
    if (!currentPet) return;

    if (action === 'like') {
      setFavorites(prev => [...prev, currentPet]);
      Alert.alert("Sucesso", "Pet curtido com sucesso!");
    }

    const updatedPets = pets.slice(1);
    setPets(updatedPets);

    if (updatedPets.length === 0) {
      setTimeout(() => {
        router.push("/ongs");
      }, 500);
    }
  };

  const handleLike = () => handleAction('like');
  const handleSkip = () => handleAction('skip');

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#f8f8f8' },
      ]}
    >
      <View style={styles.header}>
        <Image source={logoApp} style={styles.logo} />
      </View>

      <View style={styles.mainContent}>
        {currentPet ? (
          <>
            <PetCard
              pet={currentPet}
              isDark={isDark}
              onPressName={() => setSelectedPet(currentPet)}
            />

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
              >
                <AntDesign name="close" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.likeButton]}
                onPress={handleLike}
              >
                <AntDesign name="heart" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noMorePets}>
            <Text
              style={[
                styles.noMoreText,
                { color: isDark ? '#FFFFFF' : '#000000' },
              ]}
            >
              Fim da lista!
            </Text>
          </View>
        )}
      </View>

      <Modal visible={!!selectedPet} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPet?.name}</Text>
            <Text style={styles.modalText}>{selectedPet?.ong}</Text>
            <Text style={styles.modalText}>{selectedPet?.description}</Text>

            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setSelectedPet(null)}
            >
              <Text style={{ color: '#fff' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View
        style={[
          styles.bottomNav,
          { backgroundColor: isDark ? '#181818' : 'white' },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Entypo
            name="home"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ongs")}
        >
          <MaterialIcons
            name="pets"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/favoritos")}
        >
          <AntDesign
            name="heart"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/perfil")}
        >
          <FontAwesome5
            name="user-alt"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flex: 0.25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: { width: 200, height: 90 },
  mainContent: { flex: 1, alignItems: 'center' },
  cardContainer: {
    width: width * 0.9,
    aspectRatio: 1 / 1.3,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  petImage: { width: '100%', height: '100%', position: 'absolute' },
  infoBox: { position: 'absolute', bottom: 0, width: '100%', padding: 15 },
  petName: { fontSize: 28, fontWeight: 'bold' },
  petONG: { fontSize: 16, fontWeight: '600' },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,
    width: width * 0.6,
    justifyContent: 'space-around',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  skipButton: { backgroundColor: '#0E457D' },
  likeButton: { backgroundColor: '#FF2BAA' },
  noMorePets: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noMoreText: { fontSize: 22, fontWeight: 'bold' },
  bottomNav: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: { padding: 10 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  closeModal: {
    marginTop: 10,
    backgroundColor: '#0E457D',
    padding: 10,
    borderRadius: 10,
  },
});

export default SwipeScreen;