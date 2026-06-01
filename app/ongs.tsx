import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import { Ionicons, AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import api from '../src/service/api';
import { ApiPet, PetApp, normalizarPet, obterIdUsuarioLogado } from '../src/utils/pets';

const logoApp = require('@/assets/images/LogoPataAzul.png');
const { width, height } = Dimensions.get('window');

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
    outputRange: [0, Math.max(120, ong.pets.length * 120)],
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
          Animais disponíveis
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
                  <Image source={imagemSource(pet.foto || pet.imageUri)} style={styles.petThumb} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={[
                        styles.petName,
                        { color: isDark ? '#FFFFFF' : '#333' },
                      ]}
                    >
                      {pet.nome || pet.name}
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
                      {pet.vacinado ? 'Vacinado' : 'Não vacinado'}
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
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedPet, setSelectedPet] = useState<PetApp | null>(null);
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [favoritosIds, setFavoritosIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  // Controle de exibição do segundo modal de passos da adoção
  const [stepsModalVisible, setStepsModalVisible] = useState(false);

  const stepsY = useRef(new Animated.Value(height)).current;

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
            descricao: ong.descricao || 'Sem descrição cadastrada.',
            imagem: ong.foto || ong.banner || null,
            pets: pets.filter((pet: PetApp) => Number(pet.fk_idong) === id),
          };
        })
        .filter((ong: Ong) => Number.isFinite(ong.id));

      setOngs(ongsFormatadas);
      await carregarFavoritos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as ONGs do banco.');
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
        Alert.alert('Login necessário', 'Entre na sua conta para favoritar pets.');
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
      Alert.alert('Erro', 'Não foi possível atualizar o favorito.');
    }
  }

  const closePetModal = () => setSelectedPet(null);

  const openStepsModal = () => {
    setStepsModalVisible(true);
    Animated.timing(stepsY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeStepsModal = () => {
    Animated.timing(stepsY, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStepsModalVisible(false);
    });
  };

  const handleContinueAdoption = () => {
    closeStepsModal();
    closePetModal();
    setTimeout(() => {
      router.push('/adocao');
    }, 250);
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
        <Image source={logoApp} style={styles.logo} />
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

      {/* MODAL 1: DETALHES COMPLETOS DO PET (TELA CHEIA) */}
      <Modal visible={!!selectedPet} transparent animationType="slide" onRequestClose={closePetModal}>
        <View style={[styles.fullModalContainer, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          {selectedPet && (
            <View style={{ flex: 1 }}>
              <View style={styles.imageWrapper}>
                <Image source={imagemSource(selectedPet.foto || selectedPet.imageUri)} style={styles.sheetImage} />
                <TouchableOpacity style={styles.closeFloatingButton} onPress={closePetModal}>
                  <AntDesign name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sheetContent}>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.sheetTitle, { color: isDark ? '#fff' : '#222' }]}>
                      {selectedPet.nome || selectedPet.name}
                    </Text>
                    <FontAwesome5 
                      name={selectedPet.porte?.toLowerCase().includes('gato') ? 'cat' : 'dog'} 
                      size={26} 
                      color="#FF2BAA" 
                    />
                  </View>

                  {/* Badges Horizontais */}
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

                  {/* Descrição */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre</Text>
                    <Text style={[styles.descriptionText, { color: isDark ? '#CCC' : '#666' }]}>
                      {selectedPet.description || selectedPet.descricao || 'Nenhuma descrição fornecida para este pet.'}
                    </Text>
                  </View>

                  {/* Botão Adotar (Abre os passos) */}
                  <TouchableOpacity style={styles.actionPrimary} activeOpacity={0.8} onPress={openStepsModal}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Adotar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* MODAL 2: PRÓXIMOS PASSOS DA ADOÇÃO (TELA CHEIA) */}
      <Modal transparent visible={stepsModalVisible} animationType="none" onRequestClose={closeStepsModal}>
        <View style={styles.stepsOverlay}>
          <Animated.View
            style={[
              styles.modalStepsContainer,
              {
                backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                transform: [{ translateY: stepsY }],
              },
            ]}
          >
            {selectedPet && (
              <View style={{ flex: 1 }}>
                <View style={styles.imageWrapper}>
                  <Image source={imagemSource(selectedPet.foto || selectedPet.imageUri)} style={styles.sheetImage} />
                  <TouchableOpacity style={styles.closeFloatingButton} onPress={closeStepsModal}>
                    <AntDesign name="close" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.sheetContent}>
                    <Text style={[styles.stepsModalPetName, { color: isDark ? '#fff' : '#222' }]}>
                      {selectedPet.nome || selectedPet.name}
                    </Text>

                    <Text style={[styles.emotionalText, { color: isDark ? '#CCC' : '#444' }]}>
                      Você está iniciando o processo de adoção deste pet ❤️
                    </Text>

                    {/* Box das Etapas */}
                    <View style={[styles.stepsBox, { backgroundColor: isDark ? '#2D2D2D' : '#F9F9F9', borderColor: isDark ? '#444' : '#EAEAEA' }]}>
                      <Text style={[styles.stepsTitle, { color: isDark ? '#fff' : '#222' }]}>
                        Como funciona a adoção
                      </Text>

                      <View style={styles.stepsRow}>
                        {['Solicitação', 'Análise', 'Entrevista', 'Finalização'].map((step, index) => (
                          <View key={index} style={styles.stepItem}>
                            <View style={[styles.stepCircle, { backgroundColor: '#FF2BAA' }]}>
                              <Text style={styles.stepNumber}>{index + 1}</Text>
                            </View>
                            <Text style={[styles.stepText, { color: isDark ? '#DDD' : '#555' }]}>
                              {step}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity onPress={handleContinueAdoption} style={styles.actionPrimary} activeOpacity={0.8}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Continuar</Text>
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
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
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
  },
  ongDesc: {
    fontSize: 15,
    marginTop: 4,
  },
  expandedContent: {
    overflow: 'hidden',
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  petTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petThumb: {
    width: 65,
    height: 65,
    borderRadius: 14,
  },
  petName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  petDetails: {
    fontSize: 14,
    marginTop: 2,
  },
  petVacinado: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
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

  /* ESTILOS DOS MODAIS EM TELA CHEIA */
  fullModalContainer: {
    width: width,
    height: height,
    flex: 1,
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
  sheetContent: {
    padding: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
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

  /* PASSOS DA ADOÇÃO */
  stepsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalStepsContainer: {
    width: width,
    height: height,
    flex: 1,
  },
  stepsModalPetName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  ongRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  stepsModalOng: {
    fontSize: 16,
    fontWeight: '500',
  },
  emotionalText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  stepsBox: {
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: width * 0.18,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  stepText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
  cancelButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});