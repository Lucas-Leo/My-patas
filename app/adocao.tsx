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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProcessoAdocao() {
  const router = useRouter();

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  // PET MOCKADO
  // futuramente virá via params/navigation
  const pet = {
    nome: 'Luke',
    idade: '2 anos',
    foto: require('@/assets/images/cachorro01.jpg'),
  };

  // ETAPAS
  const [currentStep, setCurrentStep] = useState(1);

  // FORM
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    telefone: '',
    cidade: '',
    moradia: '',
    possuiAnimais: '',
    possuiCriancas: '',
  });

  // ANIMAÇÕES
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
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

  const handleNext = () => {
    setCurrentStep(2);

    // NAVEGA PARA A PRÓXIMA TELA
    router.push('/adocaoEtapa2');
  };

  const renderOptionCard = (
    label: string,
    value: string,
    field: string,
    icon: any
  ) => {
    const selected = formData[field as keyof typeof formData] === value;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleSelect(field, value)}
        style={[
          styles.optionCard,

          {
            backgroundColor: selected
              ? isDark
                ? '#FF80AB'
                : '#FF2BAA'
              : isDark
              ? '#1E1E1E'
              : '#FFFFFF',

            borderColor: selected
              ? isDark
                ? '#FF80AB'
                : '#FF2BAA'
              : isDark
              ? '#333'
              : '#EAEAEA',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={
            selected
              ? '#FFFFFF'
              : isDark
              ? '#BDBDBD'
              : '#666'
          }
        />

        <Text
          style={[
            styles.optionText,
            {
              color: selected
                ? '#FFFFFF'
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
                    ? '#1F1F1F'
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
                    width: '33%',
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
              Etapa {currentStep} de 3
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
                Dados básicos
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color: isDark ? '#BDBDBD' : '#777',
                  },
                ]}
              >
                Essas informações ajudam a ONG a conhecer
                melhor seu perfil ❤️
              </Text>

              {/* INPUTS */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isDark ? '#E0E0E0' : '#444',
                    },
                  ]}
                >
                  Nome completo
                </Text>

                <TextInput
                  placeholder="Digite seu nome"
                  placeholderTextColor={
                    isDark ? '#8F8F8F' : '#999'
                  }
                  value={formData.nome}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      nome: text,
                    })
                  }
                  style={[
                    styles.input,
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
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
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
                    Idade
                  </Text>

                  <TextInput
                    placeholder="22"
                    keyboardType="numeric"
                    placeholderTextColor={
                      isDark ? '#8F8F8F' : '#999'
                    }
                    value={formData.idade}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        idade: text,
                      })
                    }
                    style={[
                      styles.input,
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
                </View>

                <View style={{ flex: 1 }}>
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
                    Telefone
                  </Text>

                  <TextInput
                    placeholder="(16) 99999-9999"
                    keyboardType="phone-pad"
                    placeholderTextColor={
                      isDark ? '#8F8F8F' : '#999'
                    }
                    value={formData.telefone}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        telefone: text,
                      })
                    }
                    style={[
                      styles.input,
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
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isDark ? '#E0E0E0' : '#444',
                    },
                  ]}
                >
                  Cidade
                </Text>

                <TextInput
                  placeholder="Digite sua cidade"
                  placeholderTextColor={
                    isDark ? '#8F8F8F' : '#999'
                  }
                  value={formData.cidade}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      cidade: text,
                    })
                  }
                  style={[
                    styles.input,
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
              </View>

              {/* MORADIA */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Tipo de moradia
                </Text>

                <View style={styles.optionRow}>
                  {renderOptionCard(
                    'Casa',
                    'casa',
                    'moradia',
                    'home'
                  )}

                  {renderOptionCard(
                    'Apartamento',
                    'apartamento',
                    'moradia',
                    'business'
                  )}
                </View>
              </View>

              {/* ANIMAIS */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Possui outros animais?
                </Text>

                <View style={styles.optionRow}>
                  {renderOptionCard(
                    'Sim',
                    'sim',
                    'possuiAnimais',
                    'paw'
                  )}

                  {renderOptionCard(
                    'Não',
                    'nao',
                    'possuiAnimais',
                    'close-circle'
                  )}
                </View>
              </View>

              {/* CRIANÇAS */}
              <View style={styles.sectionSpacing}>
                <Text
                  style={[
                    styles.questionTitle,
                    {
                      color: isDark ? '#fff' : '#222',
                    },
                  ]}
                >
                  Possui crianças?
                </Text>

                <View style={styles.optionRow}>
                  {renderOptionCard(
                    'Sim',
                    'sim',
                    'possuiCriancas',
                    'happy'
                  )}

                  {renderOptionCard(
                    'Não',
                    'nao',
                    'possuiCriancas',
                    'remove-circle'
                  )}
                </View>
              </View>
            </View>

            {/* PREVIEW FUTURAS ETAPAS */}
            <View
              style={[
                styles.nextStepsCard,
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
                  styles.nextTitle,
                  {
                    color: isDark ? '#fff' : '#222',
                  },
                ]}
              >
                Próximas etapas
              </Text>

              <View style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineCircle,
                    {
                      backgroundColor: isDark
                        ? '#FF80AB'
                        : '#FF2BAA',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.timelineText,
                    {
                      color: isDark ? '#DDD' : '#555',
                    },
                  ]}
                >
                  Questionário emocional
                </Text>
              </View>

              <View style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineCircle,
                    {
                      backgroundColor: isDark
                        ? '#FF80AB'
                        : '#FF2BAA',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.timelineText,
                    {
                      color: isDark ? '#DDD' : '#555',
                    },
                  ]}
                >
                  Revisão e envio da solicitação
                </Text>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* BOTÃO FIXO */}
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
              onPress={handleNext}
              style={[
                styles.nextButton,
                {
                  backgroundColor: isDark
                    ? '#FF80AB'
                    : '#FF2BAA',
                },
              ]}
            >
              <Text style={styles.nextButtonText}>
                Próximo
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
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
    fontSize: 26,
    fontWeight: 'bold',
  },

  sectionSubtitle: {
    marginTop: 8,
    lineHeight: 22,
    fontSize: 15,
  },

  inputGroup: {
    marginTop: 24,
  },

  label: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '600',
  },

  input: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    borderWidth: 1,
  },

  rowInputs: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
  },

  sectionSpacing: {
    marginTop: 30,
  },

  questionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 14,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 14,
  },

  optionCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  optionText: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 14,
  },

  nextStepsCard: {
    marginTop: 22,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },

  nextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 10,
    marginRight: 12,
  },

  timelineText: {
    fontSize: 15,
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

  nextButton: {
    borderRadius: 20,
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

  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});