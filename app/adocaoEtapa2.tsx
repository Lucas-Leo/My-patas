import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function AdocaoEtapa2() {
  const router = useRouter();

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const pet = {
    nome: 'Luke',
    foto: require('@/assets/images/cachorro01.jpg'),
  };

  const [formData, setFormData] = useState({
    motivacao: '',
    motivacaoOutro: '',
    experiencia: '',
    experienciaTexto: '',
    apoioFamilia: '',
    rotina: '',
    financeiro: '',
    ambiente: '',
  });

  const [showFeedbackModal, setShowFeedbackModal] =
    useState(false);

  // ANIMAÇÕES
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelect = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContinue = () => {
    setShowFeedbackModal(true);

    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        useNativeDriver: true,
      }),

      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      router.push('/adocaoEtapa3');
    }, 2200);
  };

  const renderOptionCard = (
    label: string,
    value: string,
    field: string,
    icon?: any,
    customStyle?: any
  ) => {
    const selected =
      formData[field as keyof typeof formData] === value;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handleSelect(field, value)}
        style={[
          styles.optionCard,
          customStyle,

          {
            backgroundColor: selected
              ? isDark
                ? '#FF80AB'
                : '#FF2BAA'
              : isDark
              ? '#1F1F1F'
              : '#FFFFFF',

            borderColor: selected
              ? isDark
                ? '#FF80AB'
                : '#FF2BAA'
              : isDark
              ? '#303030'
              : '#ECECEC',

            transform: [
              {
                scale: selected ? 1.02 : 1,
              },
            ],
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={
              selected
                ? '#fff'
                : isDark
                ? '#DADADA'
                : '#666'
            }
          />
        )}

        <Text
          style={[
            styles.optionText,
            {
              color: selected
                ? '#fff'
                : isDark
                ? '#F5F5F5'
                : '#333',
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
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
                      color: isDark ? '#D1D1D1' : '#666',
                    },
                  ]}
                >
                  Processo de adoção
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
                    ? '#2B2B2B'
                    : '#EAEAEA',
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: '66%',
                    backgroundColor: isDark
                      ? '#FF80AB'
                      : '#FF2BAA',
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.stepText,
                {
                  color: isDark ? '#DADADA' : '#666',
                },
              ]}
            >
              Etapa 2 de 3
            </Text>

            <Text
              style={[
                styles.emotionalText,
                {
                  color: isDark ? '#E4E4E4' : '#555',
                },
              ]}
            >
              Queremos garantir que o {pet.nome} encontre
              um lar cheio de amor ❤️
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {/* CARD PRINCIPAL */}
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: isDark
                    ? '#1B1B1B'
                    : '#FFFFFF',
                  borderColor: isDark ? '#2A2A2A' : '#EFEFEF',
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark ? '#fff' : '#111',
                  },
                ]}
              >
                Questionário emocional
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color: isDark ? '#BDBDBD' : '#777',
                  },
                ]}
              >
                Essas respostas ajudam a ONG a entender
                melhor seu momento e criar uma adoção mais
                segura e feliz 🐾
              </Text>

              {/* MOTIVAÇÃO */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Qual o principal motivo da adoção?
                </Text>

                {/* 2 EM CIMA */}
                <View style={styles.optionRow}>
                  {renderOptionCard(
                    '🐶 Companhia',
                    'companhia',
                    'motivacao'
                  )}

                  {renderOptionCard(
                    '❤️ Dar um lar',
                    'lar',
                    'motivacao'
                  )}
                </View>

                {/* 3 EMBAIXO */}
                <View style={styles.optionRowThree}>
                  {renderOptionCard(
                    '👨‍👩‍👧 Família',
                    'familia',
                    'motivacao',
                    undefined,
                    styles.smallCard
                  )}

                  {renderOptionCard(
                    '🏡 Cresci com pets',
                    'cresci',
                    'motivacao',
                    undefined,
                    styles.smallCard
                  )}

                  {renderOptionCard(
                    '✨ Outro',
                    'outro',
                    'motivacao',
                    undefined,
                    styles.smallCard
                  )}
                </View>

                {/* INPUT OUTRO */}
                {formData.motivacao === 'outro' && (
                  <Animated.View
                    style={{
                      marginTop: 18,
                    }}
                  >
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isDark
                            ? '#E0E0E0'
                            : '#444',
                        },
                      ]}
                    >
                      Conte para nós qual é seu motivo ❤️
                    </Text>

                    <TextInput
                      multiline
                      placeholder="Escreva rapidamente o motivo da adoção..."
                      placeholderTextColor={
                        isDark ? '#8F8F8F' : '#999'
                      }
                      value={formData.motivacaoOutro}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          motivacaoOutro: text,
                        })
                      }
                      style={[
                        styles.textArea,
                        {
                          backgroundColor: isDark
                            ? '#232323'
                            : '#F7F7F7',

                          color: isDark ? '#fff' : '#222',

                          borderColor: isDark
                            ? '#333'
                            : '#ECECEC',
                        },
                      ]}
                    />
                  </Animated.View>
                )}
              </View>

              {/* EXPERIÊNCIA */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Você já teve pets antes?
                </Text>

                <View style={styles.optionRow}>
                  {renderOptionCard(
                    'Sim',
                    'sim',
                    'experiencia',
                    'paw'
                  )}

                  {renderOptionCard(
                    'Não',
                    'nao',
                    'experiencia',
                    'close-circle'
                  )}
                </View>

                {formData.experiencia === 'sim' && (
                  <Animated.View
                    style={{
                      marginTop: 18,
                    }}
                  >
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isDark
                            ? '#E0E0E0'
                            : '#444',
                        },
                      ]}
                    >
                      Conte rapidamente como foi sua
                      experiência
                    </Text>

                    <TextInput
                      multiline
                      placeholder="Compartilhe um pouquinho da sua experiência..."
                      placeholderTextColor={
                        isDark ? '#8F8F8F' : '#999'
                      }
                      value={formData.experienciaTexto}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          experienciaTexto: text,
                        })
                      }
                      style={[
                        styles.textArea,
                        {
                          backgroundColor: isDark
                            ? '#232323'
                            : '#F7F7F7',

                          color: isDark ? '#fff' : '#222',

                          borderColor: isDark
                            ? '#333'
                            : '#ECECEC',
                        },
                      ]}
                    />
                  </Animated.View>
                )}
              </View>

              {/* APOIO */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Todos da casa concordam com a adoção?
                </Text>

                <View style={styles.cardsColumn}>
                  {renderOptionCard(
                    'Sim',
                    'sim',
                    'apoioFamilia',
                    'heart'
                  )}

                  {renderOptionCard(
                    'Ainda estou conversando',
                    'conversando',
                    'apoioFamilia',
                    'chatbubble-ellipses'
                  )}

                  {renderOptionCard(
                    'Não',
                    'nao',
                    'apoioFamilia',
                    'close-circle'
                  )}
                </View>
              </View>

              {/* ROTINA */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Quanto tempo o pet ficará sozinho?
                </Text>

                <View style={styles.cardsColumn}>
                  {renderOptionCard(
                    '⏰ Quase nunca',
                    'nunca',
                    'rotina'
                  )}

                  {renderOptionCard(
                    '🕑 Algumas horas',
                    'algumas_horas',
                    'rotina'
                  )}

                  {renderOptionCard(
                    '🌙 Muito tempo sozinho',
                    'muito_tempo',
                    'rotina'
                  )}
                </View>
              </View>

              {/* FINANCEIRO */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Você possui condições financeiras para
                  alimentação, vacinas e consultas?
                </Text>

                <View style={styles.cardsColumn}>
                  {renderOptionCard(
                    'Sim',
                    'sim',
                    'financeiro',
                    'cash'
                  )}

                  {renderOptionCard(
                    'Parcialmente',
                    'parcialmente',
                    'financeiro',
                    'wallet'
                  )}

                  {renderOptionCard(
                    'Não',
                    'nao',
                    'financeiro',
                    'alert-circle'
                  )}
                </View>
              </View>

              {/* AMBIENTE */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  O pet terá acesso seguro ao ambiente?
                </Text>

                <View style={styles.optionRow}>
                  {renderOptionCard(
                    'Sim',
                    'sim',
                    'ambiente',
                    'shield-checkmark'
                  )}

                  {renderOptionCard(
                    'Parcialmente',
                    'parcialmente',
                    'ambiente',
                    'shield-half'
                  )}
                </View>
              </View>
            </View>

            <View style={{ height: 140 }} />
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
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleContinue}
              style={[
                styles.continueButton,
                {
                  backgroundColor: isDark
                    ? '#FF80AB'
                    : '#FF2BAA',
                },
              ]}
            >
              <Text style={styles.continueText}>
                Continuar
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* MODAL FEEDBACK */}
          <Modal transparent visible={showFeedbackModal}>
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
                        : '#FFE4F3',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 34 }}>🐾</Text>
                </View>

                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Você está indo muito bem!
                </Text>

                <Text
                  style={[
                    styles.modalText,
                    {
                      color: isDark ? '#D2D2D2' : '#666',
                    },
                  ]}
                >
                  Falta pouco para concluir sua solicitação
                  de adoção ❤️
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

  stepText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },

  emotionalText: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  formCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  sectionSubtitle: {
    marginTop: 10,
    lineHeight: 23,
    fontSize: 15,
  },

  sectionSpacing: {
    marginTop: 34,
  },

  questionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 25,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },

  optionRowThree: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  cardsColumn: {
    gap: 12,
  },

  optionCard: {
    flex: 1,
    minHeight: 88,

    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1.5,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  smallCard: {
    minHeight: 92,
  },

  optionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },

  label: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '600',
  },

  textArea: {
    borderRadius: 18,
    borderWidth: 1,

    paddingHorizontal: 18,
    paddingVertical: 16,

    minHeight: 110,
    textAlignVertical: 'top',

    fontSize: 15,
    lineHeight: 22,
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },

  continueButton: {
    borderRadius: 22,
    paddingVertical: 18,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',
    gap: 10,

    shadowColor: '#FF2BAA',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },

  continueText: {
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
    fontSize: 24,
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