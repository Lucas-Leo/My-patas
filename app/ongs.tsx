import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { useFocusEffect } from '@react-navigation/native';
import api from '../src/service/api';
import { ApiPet, PetApp, normalizarPet, obterIdUsuarioLogado } from '../src/utils/pets';

const logoApp = require('@/assets/images/LogoPataAzul.png');

type ApiOng = {
  idong?: number;
  id?: number;
  nome?: string | null;
  descricao?: string | null;
  foto?: string | null;
  banner?: string | null;
};

type Ong = {
  id: number;
  nome: string;
  descricao: string;
  imagem?: string | null;
  pets: PetApp[];
};

type OngCardProps = {
  ong: Ong;
  expanded: boolean;
  onPress: () => void;
  onPetPress: (pet: PetApp) => void;
  onToggleFavorite: (pet: PetApp) => void;
  favoritosIds: Set<number>;
  isDark: boolean;
};

function imagemSource(uri?: string | null) {
  return uri ? { uri } : logoApp;
}

const OngCard = ({
  ong,
  expanded,
  onPress,
  onPetPress,
  onToggleFavorite,
  favoritosIds,
  isDark
}: OngCardProps) => {
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
    outputRange: [0, Math.max(90, ong.pets.length * 110)],
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
        <Image source={imagemSource(ong.imagem)} style={styles.ongImage} resizeMode="cover" />
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
          Animais disponiveis
        </Text>

        {ong.pets.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDark ? '#BDBDBD' : '#555' }]}>
            Nenhum pet cadastrado nesta ONG.
          </Text>
        ) : (
          ong.pets.map((pet) => {
            const favoritado = favoritosIds.has(pet.id);

            return (
              <View key={pet.id} style={styles.petRow}>
                <TouchableOpacity style={styles.petInfo} onPress={() => onPetPress(pet)}>
                  <Image source={imagemSource(pet.foto)} style={styles.petThumb} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
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
                      Idade: {pet.idade} - Porte: {pet.porte}
                    </Text>
                    <Text
                      style={[
                        styles.petVacinado,
                        { color: pet.vacinado ? '#4CAF50' : '#FF2BAA' },
                      ]}
                    >
                      {pet.vacinado ? 'Vacinado' : 'Nao vacinado'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.heartButton} onPress={() => onToggleFavorite(pet)}>
                  <Ionicons
                    name={favoritado ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isDark ? '#FF80AB' : '#FF2BAA'}
                  />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </Animated.View>
    </View>
  );
};

export default function OngsScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedPet, setSelectedPet] = useState<PetApp | null>(null);
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [favoritosIds, setFavoritosIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function carregarDados() {
    try {
      setLoading(true);

      const [ongsResponse, petsResponse] = await Promise.all([
        api.get('/ongs'),
        api.get('/pets'),
      ]);

      const pets = Array.isArray(petsResponse.data)
        ? petsResponse.data.map((pet: ApiPet) => normalizarPet(pet)).filter((pet: PetApp) => Number.isFinite(pet.id))
        : [];

      const ongsBanco = Array.isArray(ongsResponse.data) ? ongsResponse.data : [];

      const ongsFormatadas = ongsBanco
        .map((ong: ApiOng) => {
          const id = Number(ong.idong || ong.id);

          return {
            id,
            nome: ong.nome || 'ONG sem nome',
            descricao: ong.descricao || 'Sem descricao cadastrada.',
            imagem: ong.foto || ong.banner || null,
            pets: pets.filter((pet: PetApp) => Number(pet.fk_idong) === id),
          };
        })
        .filter((ong: Ong) => Number.isFinite(ong.id));

      setOngs(ongsFormatadas);
      await carregarFavoritos();
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar as ONGs do banco.');
    } finally {
      setLoading(false);
    }
  }

  async function carregarFavoritos() {
    const idUsuario = await obterIdUsuarioLogado();

    if (!idUsuario) {
      setFavoritosIds(new Set());
      return;
    }

    const favoritosResponse = await api.get(`/petsfavoritados/usuario/${idUsuario}`);
    const ids = Array.isArray(favoritosResponse.data)
      ? favoritosResponse.data.map((pet: ApiPet) => Number(pet.fk_idpet || pet.idpet))
      : [];

    setFavoritosIds(new Set(ids));
  }

  async function toggleFavorito(pet: PetApp) {
    try {
      const idUsuario = await obterIdUsuarioLogado();

      if (!idUsuario) {
        Alert.alert('Login necessario', 'Entre na sua conta para favoritar pets.');
        return;
      }

      if (favoritosIds.has(pet.id)) {
        await api.delete(`/petsfavoritados/usuario/${idUsuario}/pet/${pet.id}`);
        setFavoritosIds((prev) => {
          const atualizado = new Set(prev);
          atualizado.delete(pet.id);
          return atualizado;
        });
        return;
      }

      await api.post('/petsfavoritados', {
        fk_idusuario: idUsuario,
        fk_idpet: pet.id,
      });

      setFavoritosIds((prev) => {
        const atualizado = new Set(prev);
        atualizado.add(pet.id);
        return atualizado;
      });
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel atualizar o favorito.');
    }
  }

  const closePetModal = () => setSelectedPet(null);

  const handleAdotar = () => {
    Alert.alert('Adocao', 'Sua solicitacao de adocao foi registrada!');
    closePetModal();
  };

  const toggleExpand = (id: number) => {
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

        {loading ? (
          <ActivityIndicator size="large" color="#FF2BAA" />
        ) : ongs.length === 0 ? (
          <Text style={[styles.emptyListText, { color: isDark ? '#E0E0E0' : '#555' }]}>
            Nenhuma ONG cadastrada.
          </Text>
        ) : (
          ongs.map((ong) => (
            <OngCard
              key={ong.id}
              ong={ong}
              expanded={expandedId === ong.id}
              onPress={() => toggleExpand(ong.id)}
              onPetPress={(pet) => setSelectedPet(pet)}
              onToggleFavorite={toggleFavorito}
              favoritosIds={favoritosIds}
              isDark={isDark}
            />
          ))
        )}

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
                <Image source={imagemSource(selectedPet.foto)} style={styles.petImage} />
                <Text
                  style={[
                    styles.modalPetName,
                    { color: isDark ? '#BBDEFB' : '#0E457D' },
                  ]}
                >
                  {selectedPet.nome}
                </Text>
                <Text style={[styles.modalPetDetails, { color: isDark ? '#E0E0E0' : '#555' }]}>
                  {selectedPet.idade} - {selectedPet.porte}
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
    backgroundColor: '#ffffff',
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
  emptyText: {
    fontSize: 14,
    marginBottom: 14,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
    color: '#0E457D',
  },
  modalPetDetails: {
    fontSize: 15,
    marginBottom: 15,
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
