import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const logoApp = require("@/assets/images/LogoPataAzul.png");

const { width } = Dimensions.get('window');

const initialPets = [
  { id: 1, name: 'Luke', ong: 'ONG1 - Paz e Amor', image: require('@/assets/images/cachorro01.jpg') },
  { id: 2, name: 'Princesa', ong: 'ONG Amigo Fiel', image: require('@/assets/images/cachorro02.jpg') },
  { id: 3, name: 'Max', ong: 'Abrigo do Coração', image: require('@/assets/images/cachorro03.jpg') },
];

// card
const PetCard = ({ pet }) => (
  <View style={styles.cardContainer}>
    <Image source={pet.image} style={styles.petImage} resizeMode="cover" />

    <View style={styles.infoBox}>
      <Text style={styles.petName}>{pet.name}</Text>
      <Text style={styles.petONG}>{pet.ong}</Text>
    </View>
  </View>
);

const SwipeScreen = () => {
  const [pets, setPets] = useState(initialPets); // lista de pets a serem exibidos
  const [favorites, setFavorites] = useState([]); // lista de pets favoritos

  // pet que está no topo da pilha
  const currentPet = pets[0];

  /**
   * função para processar as ações like e skip
   * @param {string} action - like ou skip
   */
  const handleAction = (action) => {
    if (!currentPet) return; // se nao tiver pets nao faz nada

    // favoritar
    if (action === 'like') {
      setFavorites(prevFavorites => [...prevFavorites, currentPet]);
      console.log(`Adicionado aos favoritos: ${currentPet.name}`);
    } else {
      console.log(`Pulado: ${currentPet.name}`);
    }

    // remover o pet e passar para o proximo
    setPets(prevPets => prevPets.slice(1));
  };

  const handleLike = () => handleAction('like');
  const handleSkip = () => handleAction('skip');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header} >

        <Image
          height={50}
          width={100}
          source={logoApp}
          style={styles.logo}
        />

      </View>

      <View style={styles.mainContent}>
        {currentPet ? (
          <>
            <PetCard pet={currentPet} />
            <View style={styles.actionButtons}>
              {/* botao X */}
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={handleSkip}
              >
                <AntDesign name="close" size={32} color="white" />
              </TouchableOpacity>

              {/* botao de coração */}
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
            <Text style={styles.noMoreText}>Fim da lista!</Text>
            <Text>Volte mais tarde para ver novos pets.</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Ionicons name="home-outline" size={28} color="#0E457D" />
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#0E457D" />
        <Ionicons name="heart-outline" size={28} color="#0E457D" onPress={() => console.log('Ver favoritos:', favorites)} />
        <Ionicons name="person-outline" size={28} color="#0E457D" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flex: 3 / 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,

  },
  logo: {
    width: 200,
     height: 90,
   },
  mainContent: {
    flex: 1,
    alignItems: 'center',
 
  },
  cardContainer: {
    width: width * 0.9, 
    aspectRatio: 1 / 1.3, 
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  petImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  infoBox: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  petONG: {
    fontSize: 16,
    color: '#0E457D',
    fontWeight: '600',
  },
  // botoes like e skip
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,
    width: width * 0.6,
    justifyContent: 'space-around',
    zIndex: 10,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  skipButton: {
    backgroundColor: '#0E457D',
  },
  likeButton: {
    backgroundColor: '#FF2BAA',
  },
  //acabou os pets
  noMorePets: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  //menu
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
});

export default SwipeScreen;