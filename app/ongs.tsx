import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

const logoApp = require('@/assets/images/LogoPataAzul.png');

const ONGS = [
  {
    id: '1',
    nome: 'ONG Paz e Amor',
    descricao: 'Cuidando de animais com amor e responsabilidade.',
    imagem: require('@/assets/images/ong01.png'),
    pets: [
      { id: 'p1', nome: 'Luke', idade: '2 anos', porte: 'Médio', vacinado: true, foto: require('@/assets/images/cachorro01.jpg') },
      { id: 'p2', nome: 'Mingau', idade: '3 anos', porte: 'Médio', vacinado: true, foto: require('@/assets/images/gato01.jpg') }
    ],
  },
  {
    id: '2',
    nome: 'ONG Amigo Fiel',
    descricao: 'Promovendo adoções conscientes e felizes.',
    imagem: require('@/assets/images/ong02.png'),
    pets: [
      { id: 'p3', nome: 'Princesa', idade: '2 anos', porte: 'Médio', vacinado: true, foto: require('@/assets/images/cachorro02.jpg') },
      { id: 'p4', nome: 'Salem', idade: '1 ano', porte: 'Médio', vacinado: false, foto: require('@/assets/images/gato02.jpg') }
    ],
  },
  {
    id: '3',
    nome: 'Abrigo do Coração',
    descricao: 'Um lar temporário para quem mais precisa.',
    imagem: require('@/assets/images/ong03.png'),
    pets: [
      { id: 'p5', nome: 'Max', idade: '3 anos', porte: 'Pequeno', vacinado: true, foto: require('@/assets/images/cachorro03.jpg') },
      { id: 'p6', nome: 'Theo', idade: '4 anos', porte: 'Médio', vacinado: true, foto: require('@/assets/images/cachorro04.jpg') },
      { id: 'p7', nome: 'Matheo', idade: '3 anos', porte: 'Grande', vacinado: true, foto: require('@/assets/images/gato03.jpg') },
      { id: 'p8', nome: 'Guarfield', idade: '3 anos', porte: 'Pequeno', vacinado: true, foto: require('@/assets/images/gato04.jpg') }
    ],
  },
  {
    id: '4',
    nome: 'Amigos de quatro patas',
    descricao: 'Não compre adote um animalzinho!',
    imagem: require('@/assets/images/ong4.png'),
    pets: [
      { id: 'p9', nome: 'Dalila', idade: '3 anos', porte: 'Médio', vacinado: true, foto: require('@/assets/images/cachorro05.jpg') },
      { id: 'p10', nome: 'Kity', idade: '5 meses', porte: 'Médio', vacinado: false, foto: require('@/assets/images/gato05.jpg') }
    ],
  },
  {
    id: '5',
    nome: 'Aumigos',
    descricao: 'Adote um AUmigo!',
    imagem: require('@/assets/images/ong05.png'),
    pets: [
      { id: 'p11', nome: 'Billy', idade: '3 anos', porte: 'Médio', vacinado: true, foto: require('@/assets/images/cachorro06.jpg') },
      { id: 'p12', nome: 'Chicó', idade: '6 meses', porte: 'Médio', vacinado: false, foto: require('@/assets/images/gato06.jpg') }
    ],
  },
];

const OngCard = ({ ong, expanded, onPress, onPetPress }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const animatedMaxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ong.pets.length * 110],
  });

  const animatedOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardHeader}>
        <Image source={ong.imagem} style={styles.ongImage} resizeMode="cover" />
        <View style={styles.ongTextBox}>
          <Text style={styles.ongName}>{ong.nome}</Text>
          <Text style={styles.ongDesc}>{ong.descricao}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="#0E457D" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.expandedContent,
          {
            maxHeight: animatedMaxHeight,
            opacity: animatedOpacity,
          },
        ]}
      >
        <Text style={styles.petTitle}>Animais disponíveis</Text>

        {ong.pets.map((pet) => (
          <View key={pet.id} style={styles.petRow}>
            <TouchableOpacity style={styles.petInfo} onPress={() => onPetPress(pet)}>
              <Ionicons name="paw-outline" size={22} color="#0E457D" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.petName}>{pet.nome}</Text>
                <Text style={styles.petDetails}>Idade: {pet.idade} • Porte: {pet.porte}</Text>
                <Text
                  style={[
                    styles.petVacinado,
                    { color: pet.vacinado ? '#4CAF50' : '#FF2BAA' },
                  ]}
                >
                  {pet.vacinado ? 'Vacinado' : 'Não vacinado'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.heartButton}>
              <Ionicons name="heart-outline" size={24} color="#FF2BAA" />
            </TouchableOpacity>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default function OngsScreen() {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image height={50} width={100} source={logoApp} style={styles.logo} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>ONGS</Text>

        {ONGS.map((ong) => (
          <OngCard
            key={ong.id}
            ong={ong}
            expanded={expandedId === ong.id}
            onPress={() => toggleExpand(ong.id)}
            onPetPress={(pet) => setSelectedPet(pet)}
          />
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Entypo name="home" size={30} color="#0E457D" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ongs")}
        >
          <MaterialIcons name="pets" size={30} color="#0E457D" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/favoritos")}
        >
          <AntDesign name="heart" size={30} color="#0E457D" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/perfil")}
        >
          <FontAwesome5 name="user-alt" size={30} color="#0E457D" />
        </TouchableOpacity>

      </View>

      <Modal visible={!!selectedPet} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPet && (
              <>
                <Image source={selectedPet.foto} style={styles.petImage} />
                <Text style={styles.modalPetName}>{selectedPet.nome}</Text>
                <Pressable onPress={() => setSelectedPet(null)} style={styles.closeButton}>
                  <Text style={styles.closeText}>Fechar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#ffffff",
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
    color: '#FF2BAA',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
  },
  ongImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  ongTextBox: {
    flex: 1,
  },
  ongName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E457D',
  },
  ongDesc: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  expandedContent: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  petTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0E457D',
    marginVertical: 10,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  petDetails: {
    fontSize: 15,
    color: '#555',
  },
  petVacinado: {
    fontSize: 14,
    fontWeight: '600',
  },
  heartButton: {
    padding: 8,
  },
  bottomNav: {
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 15,
  },
  navItem: {
    padding: 10,
  },
  navIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#0E457D',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  petImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 15,
  },
  modalPetName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#0E457D',
  },
  closeButton: {
    backgroundColor: '#FF2BAA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
  },
});
