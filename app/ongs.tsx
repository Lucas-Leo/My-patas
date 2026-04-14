import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const logoApp = require('@/assets/images/LogoPataAzul.png');

type Pet = {
  id: string;
  nome: string;
  idade: string;
  porte: string;
  vacinado: boolean;
  foto: any;
};

type Ong = {
  id: string;
  nome: string;
  descricao: string;
  imagem: any;
  pets: Pet[];
};

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
    descricao: 'Não compre. adote um animalzinho!',
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

type OngCardProps = {
  ong: Ong;
  expanded: boolean;
  onPress: () => void;
  onPetPress: (pet: Pet) => void;
  isDark: boolean;
};

const OngCard = ({ ong, expanded, onPress, onPetPress, isDark }: OngCardProps) => {
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
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1F1F1F' : '#fff',
          borderColor: isDark ? '#424242' : '#eee',
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardHeader}>
        <Image source={ong.imagem} style={styles.ongImage} resizeMode="cover" />
        <View style={styles.ongTextBox}>
          <Text
            style={[
              styles.ongName,
              { color: isDark ? '#BBDEFB' : '#0E457D' },
            ]}
          >
            {ong.nome}
          </Text>
          <Text
            style={[
              styles.ongDesc,
              { color: isDark ? '#E0E0E0' : '#555' },
            ]}
          >
            {ong.descricao}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={isDark ? '#90CAF9' : '#0E457D'}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.expandedContent,
          {
            maxHeight: animatedMaxHeight,
            opacity: animatedOpacity,
            backgroundColor: isDark ? '#121212' : '#fff',
            borderTopColor: isDark ? '#424242' : '#EEE',
          },
        ]}
      >
        <Text
          style={[
            styles.petTitle,
            { color: isDark ? '#90CAF9' : '#0E457D' },
          ]}
        >
          Animais disponíveis
        </Text>

        {ong.pets.map((pet) => (
          <View key={pet.id} style={styles.petRow}>
            <TouchableOpacity style={styles.petInfo} onPress={() => onPetPress(pet)}>
              <Image source={pet.foto} style={styles.petThumb} />
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={[
                    styles.petName,
                    { color: isDark ? '#FFFFFF' : '#333' },
                  ]}
                >
                  {pet.nome}
                </Text>
                <Text
                  style={[
                    styles.petDetails,
                    { color: isDark ? '#BDBDBD' : '#555' },
                  ]}
                >
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
            </TouchableOpacity>

            <TouchableOpacity style={styles.heartButton}>
              <Ionicons
                name="heart-outline"
                size={24}
                color={isDark ? '#FF80AB' : '#FF2BAA'}
              />
            </TouchableOpacity>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default function OngsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const closePetModal = () => setSelectedPet(null);
  const handleAdotar = () => {
    Alert.alert('Adoção', 'Sua solicitação de adoção foi registrada!');
    closePetModal();
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#ffffff' },
      ]}
    >
      <View style={styles.header}>
        <Image height={50} width={100} source={logoApp} style={styles.logo} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.title,
            { color: isDark ? '#FF80AB' : '#FF2BAA' },
          ]}
        >
          ONGS
        </Text>

        {ONGS.map((ong) => (
          <OngCard
            key={ong.id}
            ong={ong}
            expanded={expandedId === ong.id}
            onPress={() => toggleExpand(ong.id)}
            onPetPress={(pet) => setSelectedPet(pet)}
            isDark={isDark}
          />
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNav isDark={isDark} activePage="ongs" />

      <Modal visible={!!selectedPet} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E1E1E' : 'white' },
            ]}
          >
            {selectedPet && (
              <>
                <TouchableOpacity
                  onPress={closePetModal}
                  style={[
                    styles.closeIconButton,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar"
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDark ? '#FFFFFF' : '#111111'}
                  />
                </TouchableOpacity>
                <Image source={selectedPet.foto} style={styles.petImage} />
                <Text
                  style={[
                    styles.modalPetName,
                    { color: isDark ? '#BBDEFB' : '#0E457D' },
                  ]}
                >
                  {selectedPet.nome}
                </Text>
                <Pressable onPress={handleAdotar} style={styles.adoptButton}>
                  <Text style={styles.adoptText}>Adotar</Text>
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
  petThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
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
  closeIconButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  adoptButton: {
    backgroundColor: '#FF2BAA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  adoptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
