import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function AdocaoEtapa3() {
  const router = useRouter();

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  // DADOS MOCKADOS
  // Preparado para futura integração com API/backend
  const pet = {
    nome: 'Luke',
    idade: '2 anos',
    ong: 'ONG Paz e Amor',
    foto: require('@/assets/images/cachorro01.jpg'),
  };

  const etapa1 = {
    nome: 'Lucas Leonardo',
    cidade: 'Matão - SP',
    moradia: 'Casa com quintal',
    animais: 'Sim',
    criancas: 'Não',
  };

  const etapa2 = {
    motivacao: 'Dar um lar ❤️',
    experiencia: 'Já teve pets',
    rotina: 'Fica poucas horas sozinho',
    financeiro: 'Sim',
  };

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  // ANIMAÇÕES
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.97,
        useNativeDriver: true,
      }),

      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!accepted || loading) return;

    animateButton();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      setShowSuccessModal(true);

      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          useNativeDriver: true,
        }),

        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        // FUTURA TELA DE SUCESSO
        router.push('/adocaoSucesso');
      }, 2400);
    }, 2500);
  };

  const renderInfoRow = (
    icon: any,
    label: string,
    value: string
  ) => {
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Ionicons
            name={icon}
            size={18}
            color={isDark ? '#FF80AB' : '#FF2BAA'}
          />

          <Text
            style={[
              styles.infoLabel,
              {
                color: isDark ? '#CFCFCF' : '#666',
              },
            ]}
          >
            {label}
          </Text>
        </View>

        <Text
          style={[
            styles.infoValue,
            {
              color: isDark ? '#FFFFFF' : '#222',
            },
          ]}
        >
          {value}
        </Text>
      </View>
    );
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

            <View style={styles.petInfo}>
              <Image
                source={pet.foto}
                style={styles.petImage}
                resizeMode="cover"
              />

              <View>
                <Text
                  style={[
                    styles.petName,
                    {
                      color: isDark ? '#fff' : '#0E457D',
                    },
                  ]}
                >
                  {pet.nome} 🐶
                </Text>

                <Text
                  style={[
                    styles.processText,
                    {
                      color: isDark ? '#CFCFCF' : '#666',
                    },
                  ]}
                >
                  Etapa 3 de 3
                </Text>
              </View>
            </View>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: isDark
                    ? '#2A2A2A'
                    : '#EAEAEA',
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: '100%',
                    backgroundColor: isDark
                      ? '#FF80AB'
                      : '#FF2BAA',
                  },
                ]}
              />
            </View>

            <View style={styles.progressRow}>
              <Text
                style={[
                  styles.stepText,
                  {
                    color: isDark ? '#E0E0E0' : '#666',
                  },
                ]}
              >
                Etapa final ✨
              </Text>

              <Text
                style={[
                  styles.completeText,
                  {
                    color: isDark ? '#FFB3CF' : '#FF2BAA',
                  },
                ]}
              >
                100% concluído 🎉
              </Text>
            </View>

            <Text
              style={[
                styles.emotionalText,
                {
                  color: isDark ? '#E4E4E4' : '#555',
                },
              ]}
            >
              Você está prestes a enviar sua solicitação de
              adoção ❤️
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {/* PET */}
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
                Pet escolhido 🐾
              </Text>

              <View style={styles.petCardContent}>
                <Image
                  source={pet.foto}
                  style={styles.largePetImage}
                  resizeMode="cover"
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.petCardName,
                      {
                        color: isDark ? '#fff' : '#222',
                      },
                    ]}
                  >
                    {pet.nome}
                  </Text>

                  <Text
                    style={[
                      styles.petCardInfo,
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
                      styles.petCardInfo,
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

            {/* DADOS */}
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
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: isDark ? '#fff' : '#111',
                    },
                  ]}
                >
                  Seus dados 👤
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.editButton,
                    {
                      backgroundColor: isDark
                        ? '#242424'
                        : '#F3F4F6',
                    },
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={
                      isDark ? '#fff' : '#333'
                    }
                  />

                  <Text
                    style={[
                      styles.editButtonText,
                      {
                        color: isDark
                          ? '#fff'
                          : '#333',
                      },
                    ]}
                  >
                    Editar dados
                  </Text>
                </TouchableOpacity>
              </View>

              {renderInfoRow(
                'person-outline',
                'Nome',
                etapa1.nome
              )}

              {renderInfoRow(
                'location-outline',
                'Cidade',
                etapa1.cidade
              )}

              {renderInfoRow(
                'home-outline',
                'Moradia',
                etapa1.moradia
              )}

              {renderInfoRow(
                'paw-outline',
                'Outros animais',
                etapa1.animais
              )}

              {renderInfoRow(
                'happy-outline',
                'Possui crianças',
                etapa1.criancas
              )}
            </Animated.View>

            {/* PERFIL */}
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
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: isDark ? '#fff' : '#111',
                    },
                  ]}
                >
                  Perfil emocional ❤️
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.editButton,
                    {
                      backgroundColor: isDark
                        ? '#242424'
                        : '#F3F4F6',
                    },
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={
                      isDark ? '#fff' : '#333'
                    }
                  />

                  <Text
                    style={[
                      styles.editButtonText,
                      {
                        color: isDark
                          ? '#fff'
                          : '#333',
                      },
                    ]}
                  >
                    Editar respostas
                  </Text>
                </TouchableOpacity>
              </View>

              {renderInfoRow(
                'heart-outline',
                'Motivo da adoção',
                etapa2.motivacao
              )}

              {renderInfoRow(
                'paw-outline',
                'Experiência',
                etapa2.experiencia
              )}

              {renderInfoRow(
                'time-outline',
                'Rotina',
                etapa2.rotina
              )}

              {renderInfoRow(
                'cash-outline',
                'Responsabilidade financeira',
                etapa2.financeiro
              )}
            </Animated.View>

            {/* CHECKBOX */}
            <Animated.View
              style={[
                styles.checkboxCard,
                {
                  backgroundColor: isDark
                    ? '#1B1B1B'
                    : '#FFFFFF',
                  borderColor: accepted
                    ? isDark
                      ? '#FF80AB'
                      : '#FF2BAA'
                    : isDark
                    ? '#2B2B2B'
                    : '#ECECEC',
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.checkboxContainer}
                onPress={() =>
                  setAccepted(!accepted)
                }
              >
                <Animated.View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: accepted
                        ? isDark
                          ? '#FF80AB'
                          : '#FF2BAA'
                        : 'transparent',

                      borderColor: accepted
                        ? isDark
                          ? '#FF80AB'
                          : '#FF2BAA'
                        : isDark
                        ? '#4A4A4A'
                        : '#D7D7D7',
                    },
                  ]}
                >
                  {accepted && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#fff"
                    />
                  )}
                </Animated.View>

                <Text
                  style={[
                    styles.checkboxText,
                    {
                      color: isDark
                        ? '#F1F1F1'
                        : '#444',
                    },
                  ]}
                >
                  Declaro que as informações fornecidas são
                  verdadeiras e que estou ciente das
                  responsabilidades envolvidas na adoção de
                  um pet.
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ height: 160 }} />
          </ScrollView>

          {/* BOTÃO */}
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
                onPress={handleSubmit}
                disabled={!accepted || loading}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      !accepted || loading
                        ? isDark
                          ? '#3B3B3B'
                          : '#D7D7D7'
                        : isDark
                        ? '#FF80AB'
                        : '#FF2BAA',
                  },
                ]}
              >
                {loading ? (
                  <>
                    <ActivityIndicator
                      color="#fff"
                      size="small"
                    />

                    <Text style={styles.submitText}>
                      Enviando sua solicitação...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitText}>
                      Enviar solicitação
                    </Text>

                    <Ionicons
                      name="heart"
                      size={20}
                      color="#fff"
                    />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* MODAL SUCESSO */}
          <Modal transparent visible={showSuccessModal}>
            <View style={styles.modalOverlay}>
              <Animated.View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: isDark
                      ? '#1B1B1B'
                      : '#FFFFFF',

                    transform: [{ scale: modalScale }],
                    opacity: modalOpacity,
                  },
                ]}
              >
                <View
                  style={[
                    styles.modalIcon,
                    {
                      backgroundColor: isDark
                        ? '#FF80AB20'
                        : '#FFE5F2',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 34 }}>
                    ❤️
                  </Text>
                </View>

                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Solicitação enviada!
                </Text>

                <Text
                  style={[
                    styles.modalText,
                    {
                      color: isDark
                        ? '#D2D2D2'
                        : '#666',
                    },
                  ]}
                >
                  A ONG irá analisar suas respostas com
                  carinho 🐾
                </Text>
              </Animated.View>
            </View>
          </Modal>
        </Animated.View>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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

  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 35,
  },

  petImage: {
    width: 58,
    height: 58,
    borderRadius: 18,
  },

  petName: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  processText: {
    fontSize: 14,
    marginTop: 4,
  },

  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  progressBar: {
    height: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 20,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  stepText: {
    fontSize: 14,
    fontWeight: '600',
  },

  completeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  emotionalText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
    marginTop: 22,
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
  },

  largePetImage: {
    width: 92,
    height: 92,
    borderRadius: 24,
  },

  petCardName: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  petCardInfo: {
    marginTop: 6,
    fontSize: 15,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 14,
  },

  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 14,

    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.10)',
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: '50%',
    textAlign: 'right',
  },

  checkboxCard: {
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    marginTop: 6,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 2,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 14,
    marginTop: 2,
  },

  checkboxText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },

  submitButton: {
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

  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 24,
  },

  modalCard: {
    width: '100%',
    borderRadius: 30,
    padding: 30,

    alignItems: 'center',
  },

  modalIcon: {
    width: 90,
    height: 90,
    borderRadius: 50,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 22,
  },

  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modalText: {
    marginTop: 14,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 25,
  },
});