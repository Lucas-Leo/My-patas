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
  Easing,
} from 'react-native';
import { Ionicons, Fontisto } from '@expo/vector-icons';
import { router, useRouter } from "expo-router";

const { width } = Dimensions.get('window');

const logoApp = require('@/assets/images/LogoPataAzul.png');

const ONGS = [
  {
    id: '1',
    nome: 'ONG Paz e Amor',
    descricao: 'Cuidando de animais com amor e responsabilidade.',
    imagem: require('@/assets/images/ong01.png'),
    pets: [
      { id: 'p1', nome: 'Luke', idade: '2 anos', porte: 'Médio', vacinado: true },
      { id: 'p2', nome: 'Mingau', idade: '3 anos', porte: 'Médio', vacinado: true },
    ],
  },
  {
    id: '2',
    nome: 'ONG Amigo Fiel',
    descricao: 'Promovendo adoções conscientes e felizes.',
    imagem: require('@/assets/images/ong02.png'),
    pets: [
      { id: 'p3', nome: 'Princesa', idade: '2 anos', porte: 'Médio', vacinado: true },
      { id: 'p4', nome: 'Salem', idade: '1 ano', porte: 'Médio', vacinado: false },
    ],
  },
  {
    id: '3',
    nome: 'Abrigo do Coração',
    descricao: 'Um lar temporário para quem mais precisa.',
    imagem: require('@/assets/images/ong03.png'),
    pets: [
      { id: 'p5', nome: 'Max', idade: '3 anos', porte: 'Pequeno', vacinado: true },
      { id: 'p6', nome: 'Theo', idade: '4 anos', porte: 'Médio', vacinado: true },
      { id: 'p7', nome: 'Matheo', idade: '3 anos', porte: 'Grande', vacinado: true },
      { id: 'p8', nome: 'Guarfield', idade: '3 anos', porte: 'Pequeno', vacinado: true },
    ],
  },

  {
    id: '4',
    nome: 'Amigos de quatro patas',
    descricao: 'Não compre adote um animalzinho!',
    imagem: require('@/assets/images/ong4.png'),
    pets: [
      { id: 'p9', nome: 'Dalila', idade: '3 anos', porte: 'Médio', vacinado: true },
      { id: 'p10', nome: 'Kity', idade: '5 meses', porte: 'Médio', vacinado: false },
    ],
  },
  
  {
    id: '5',
    nome: 'Aumigos',
    descricao: 'Adote um AUmigo!',
    imagem: require('@/assets/images/ong05.png'),
    pets: [
      { id: 'p11', nome: 'Billy', idade: '3 anos', porte: 'Médio', vacinado: true },
      { id: 'p12', nome: 'Chicó', idade: '6 meses', porte: 'Médio', vacinado: false },
    ],
  },
];

const OngCard = ({ ong, expanded, onPress }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
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
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#0E457D"
        />
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
            <View style={styles.petInfo}>
              <Ionicons name="paw-outline" size={22} color="#0E457D" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.petName}>{pet.nome}</Text>
                <Text style={styles.petDetails}>
                  Idade: {pet.idade} • Porte: {pet.porte}
                </Text>
                <Text
                  style={[
                    styles.petVacinado,
                    { color: pet.vacinado ? '#4CAF50' : '#FF2BAA' },
                  ]}
                >
                  {pet.vacinado ? 'Vacinado' : 'Não vacinado'}
                </Text>
              </View>
            </View>

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
          />
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footer}>

        <TouchableOpacity style={styles.iconsFooter}>
          <Ionicons name="home-sharp" size={28} color="#0E457D" />
          <Text style={styles.iconsText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconsFooter}>
          <Ionicons name="paw" size={30} color="#0E457D" />
          <Text style={styles.iconsText}>ONGS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconsFooter}>
          <Fontisto name="heart" size={25} color="#0E457D" />
          <Text style={styles.iconsText}>Favoritos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconsFooter}>
          <Ionicons name="person-sharp" size={30} color="#0E457D" />
          <Text style={styles.iconsText}>Perfil</Text>
        </TouchableOpacity>
        
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
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
    paddingHorizontal: 10,
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

  //menu
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#43474bff',
    backgroundColor: '#fff',
  },
  
  iconsFooter: {
    alignItems: 'center',
    gap: 2,
  },

  iconsText: {
    fontWeight: 'bold',
  },

});
