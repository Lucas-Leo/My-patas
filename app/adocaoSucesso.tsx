import React, { useEffect, useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AdoptionPet,
  getPetDisplayName,
  getPetImageUri,
  parseParam,
} from '../src/utils/adocao';

export default function AdocaoSucesso() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const fallbackPet: AdoptionPet = {
    id: 0,
    nome: 'Pet',
    name: 'Pet',
    idade: 'Idade nao informada',
    ong: 'ONG nao informada',
    foto: null,
    imageUri: null,
  };
  const pet = parseParam<AdoptionPet>(params.pet, fallbackPet);
  const petImageUri = getPetImageUri(pet);
  const petImage = petImageUri
    ? { uri: petImageUri }
    : require('@/assets/images/cachorro01.jpg');

  // ANIMAÇÕES
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const slideAnim = useRef(new Animated.Value(30)).current;

  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),

        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.96,
        useNativeDriver: true,
      }),

      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMyAdoptions = () => {
    animateButton();

    setTimeout(() => {
      router.replace('/acompanharAdocao');
    }, 180);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121212' : '#F8F9FB',
        },
      ]}
    >
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: isDark
                  ? '#1E1E1E'
                  : '#FFFFFF',
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? '#fff' : '#333'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* SUCESSO */}
          <View style={styles.successContainer}>
            <Animated.View
              style={[
                styles.successIconWrapper,
                {
                  backgroundColor: isDark
                    ? '#FF80AB20'
                    : '#FFE7F3',

                  transform: [
                    { scale: scaleAnim },
                    { scale: pulseAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.successEmoji}>
                ❤️
              </Text>
            </Animated.View>

            <Text
              style={[
                styles.successTitle,
                {
                  color: isDark ? '#FFFFFF' : '#111',
                },
              ]}
            >
              Solicitação enviada com sucesso! 🎉
            </Text>

            <Text
              style={[
                styles.successSubtitle,
                {
                  color: isDark ? '#D6D6D6' : '#666',
                },
              ]}
            >
              A ONG responsável irá analisar suas
              informações em breve.
            </Text>

            <Text
              style={[
                styles.successText,
                {
                  color: isDark ? '#BDBDBD' : '#777',
                },
              ]}
            >
              Você poderá acompanhar todo o processo
              diretamente pelo aplicativo ❤️
            </Text>
          </View>

          {/* CARD PET */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2B2B2B'
                  : '#EFEFEF',

                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                {
                  color: isDark ? '#fff' : '#111',
                },
              ]}
            >
              Pet escolhido 🐾
            </Text>

            <View style={styles.petCardContent}>
              <Image
                source={petImage}
                style={styles.petImage}
                resizeMode="cover"
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.petName,
                    {
                      color: isDark
                        ? '#FFFFFF'
                        : '#222',
                    },
                  ]}
                >
                  {getPetDisplayName(pet)} 🐶
                </Text>

                <Text
                  style={[
                    styles.petInfo,
                    {
                      color: isDark
                        ? '#CFCFCF'
                        : '#666',
                    },
                  ]}
                >
                  {pet.idade}
                </Text>

                <Text
                  style={[
                    styles.petInfo,
                    {
                      color: isDark
                        ? '#CFCFCF'
                        : '#666',
                    },
                  ]}
                >
                  {pet.ong}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* PRÓXIMAS ETAPAS */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2B2B2B'
                  : '#EFEFEF',
              },
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                {
                  color: isDark ? '#fff' : '#111',
                },
              ]}
            >
              Próximas etapas ✨
            </Text>

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepIcon,
                  {
                    backgroundColor: isDark
                      ? '#FF80AB20'
                      : '#FFE7F3',
                  },
                ]}
              >
                <Text style={styles.stepNumber}>
                  1
                </Text>
              </View>

              <Text
                style={[
                  styles.stepText,
                  {
                    color: isDark
                      ? '#E6E6E6'
                      : '#444',
                  },
                ]}
              >
                A ONG analisará seu perfil com
                carinho ❤️
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepIcon,
                  {
                    backgroundColor: isDark
                      ? '#FF80AB20'
                      : '#FFE7F3',
                  },
                ]}
              >
                <Text style={styles.stepNumber}>
                  2
                </Text>
              </View>

              <Text
                style={[
                  styles.stepText,
                  {
                    color: isDark
                      ? '#E6E6E6'
                      : '#444',
                  },
                ]}
              >
                Você poderá receber contato da ONG
                🐾
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepIcon,
                  {
                    backgroundColor: isDark
                      ? '#FF80AB20'
                      : '#FFE7F3',
                  },
                ]}
              >
                <Text style={styles.stepNumber}>
                  3
                </Text>
              </View>

              <Text
                style={[
                  styles.stepText,
                  {
                    color: isDark
                      ? '#E6E6E6'
                      : '#444',
                  },
                ]}
              >
                O status será atualizado no aplicativo
                📱
              </Text>
            </View>
          </Animated.View>

          {/* MENSAGEM FINAL */}
          <View
            style={[
              styles.messageCard,
              {
                backgroundColor: isDark
                  ? '#171717'
                  : '#FFF5FA',
              },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: isDark
                    ? '#FFD4E7'
                    : '#B03A74',
                },
              ]}
            >
              Obrigado por escolher transformar uma
              vida através da adoção 🐶❤️
            </Text>
          </View>

          <View style={{ height: 170 }} />
        </ScrollView>

        {/* BOTÕES */}
        <View
          style={[
            styles.bottomContainer,
            {
              backgroundColor: isDark
                ? '#121212'
                : '#F8F9FB',
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleMyAdoptions}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: isDark
                    ? '#FF80AB'
                    : '#FF2BAA',
                },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Acompanhar adoção
              </Text>

              <Ionicons
                name="heart"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/home')}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: isDark
                  ? '#1E1E1E'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2C2C2C'
                  : '#ECECEC',
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: isDark
                    ? '#FFFFFF'
                    : '#444',
                },
              ]}
            >
              Continuar explorando pets
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,

    marginTop: 35,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  successContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

  successIconWrapper: {
    width: 130,
    height: 130,
    borderRadius: 999,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 28,
  },

  successEmoji: {
    fontSize: 54,
  },

  successTitle: {
    fontSize: 31,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },

  successSubtitle: {
    marginTop: 20,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 10,
    fontWeight: '600',
  },

  successText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 25,
    paddingHorizontal: 20,
  },

  card: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 22,
  },

  petImage: {
    width: 100,
    height: 100,
    borderRadius: 26,
  },

  petName: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  petInfo: {
    marginTop: 7,
    fontSize: 15,
  },

  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    gap: 14,
  },

  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',
  },

  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF2BAA',
  },

  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },

  messageCard: {
    borderRadius: 24,
    padding: 22,
    marginTop: 4,
    marginBottom: 10,
  },

  messageText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 27,
    fontWeight: '600',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },

  primaryButton: {
    borderRadius: 24,
    paddingVertical: 19,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,

    shadowColor: '#FF2BAA',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  secondaryButton: {
    marginTop: 14,

    borderRadius: 22,
    paddingVertical: 17,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
