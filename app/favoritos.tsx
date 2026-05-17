import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import api from '../src/service/api';
import { ApiPet, PetApp, normalizarPet, obterIdUsuarioLogado } from '../src/utils/pets';

const logoApp = require('@/assets/images/LogoPataAzul.png');

function petImageSource(pet: PetApp) {
  return pet.imageUri ? { uri: pet.imageUri } : logoApp;
}

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState<PetApp[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [])
  );

  async function carregarFavoritos() {
    try {
      setLoading(true);

      const idUsuario = await obterIdUsuarioLogado();

      if (!idUsuario) {
        setFavoritos([]);
        return;
      }

      const response = await api.get(`/petsfavoritados/usuario/${idUsuario}`);
      const pets = Array.isArray(response.data)
        ? response.data.map((pet: ApiPet) => normalizarPet(pet)).filter((pet: PetApp) => Number.isFinite(pet.id))
        : [];

      setFavoritos(pets);
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar seus favoritos.');
    } finally {
      setLoading(false);
    }
  }

  async function removerFavorito(pet: PetApp) {
    try {
      if (!pet.favoriteId) {
        const idUsuario = await obterIdUsuarioLogado();

        if (!idUsuario) return;

        await api.delete(`/petsfavoritados/usuario/${idUsuario}/pet/${pet.id}`);
      } else {
        await api.delete(`/petsfavoritados/${pet.favoriteId}`);
      }

      setFavoritos((prev) => prev.filter((item) => item.id !== pet.id));
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel remover este favorito.');
    }
  }

  function handleAdotar() {
    Alert.alert('Adocao', 'Sua solicitacao de adocao foi registrada!');
  }

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
          Meus Favoritos
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#FF2BAA" />
        ) : favoritos.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDark ? '#E0E0E0' : '#555' }]}>
            Voce ainda nao favoritou nenhum pet.
          </Text>
        ) : (
          favoritos.map((pet) => (
            <View
              key={`${pet.id}-${pet.favoriteId || 'favorito'}`}
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1F1F1F' : '#fff',
                  borderColor: isDark ? '#424242' : '#eee',
                },
              ]}
            >
              <Image source={petImageSource(pet)} style={styles.petImage} />

              <View style={styles.petInfoBox}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.petName,
                        { color: isDark ? '#BBDEFB' : '#0E457D' },
                      ]}
                    >
                      {pet.nome}
                    </Text>
                    <Text
                      style={[
                        styles.petAge,
                        { color: isDark ? '#E0E0E0' : '#444' },
                      ]}
                    >
                      {pet.idade}
                    </Text>
                    <Text
                      style={[
                        styles.petOng,
                        { color: isDark ? '#B0BEC5' : '#777' },
                      ]}
                    >
                      {pet.ong}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.heartButton} onPress={() => removerFavorito(pet)}>
                    <Ionicons
                      name="heart"
                      size={26}
                      color={isDark ? '#FF80AB' : '#FF2BAA'}
                    />
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.petDescription,
                    { color: isDark ? '#E0E0E0' : '#555' },
                  ]}
                >
                  {pet.descricao}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.adoptButton,
                    { backgroundColor: isDark ? '#FF80AB' : '#FF2BAA' },
                  ]}
                  onPress={handleAdotar}
                >
                  <Text style={styles.adoptText}>Adotar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNav isDark={isDark} activePage="favoritos" />
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
    marginBottom: 15,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },

  petImage: {
    width: 105,
    height: 105,
    borderRadius: 14,
  },

  petInfoBox: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E457D',
  },

  petAge: {
    fontSize: 15,
    color: '#444',
    marginTop: 2,
  },

  petOng: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },

  petDescription: {
    fontSize: 15,
    color: '#555',
    marginTop: 10,
    lineHeight: 20,
  },

  heartButton: {
    padding: 4,
    marginRight: 5,
  },

  adoptButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  adoptText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
  },
});
