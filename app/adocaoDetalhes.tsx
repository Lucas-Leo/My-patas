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
  Linking,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AdoptionDetails() {
  const router = useRouter();

  const params = useLocalSearchParams();

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  // MOCK API COM 3 PETS
  const [adoptions] = useState([
    {
      id: '1',

      petName: 'Luke',
      age: '2 anos',
      ong: 'ONG Paz e Amor',
      image: require('@/assets/images/cachorro01.jpg'),

      currentStatus: 'Em análise',

      estimatedTime: '2 a 5 dias úteis',

      updates: [
        {
          id: 1,
          title: 'Seu perfil entrou em análise',
          date: 'Hoje',
        },
        {
          id: 2,
          title: 'Solicitação enviada com sucesso',
          date: 'Ontem',
        },
      ],

      messages: [
        {
          id: 1,
          from: 'ONG Paz e Amor',
          message:
            'Olá Lucas ❤️ Gostaríamos de conversar com você amanhã.',
          time: 'há 2 horas',
        },
      ],

      checklist: [
        {
          id: 1,
          title: 'Entrevista realizada',
          done: false,
        },
        {
          id: 2,
          title: 'Visita concluída',
          done: false,
        },
        {
          id: 3,
          title: 'Documentação enviada',
          done: true,
        },
      ],
    },

    {
      id: '2',

      petName: 'Mia',
      age: '1 ano',
      ong: 'ONG Amigos de Patas',
      image: require('@/assets/images/gato01.jpg'),

      currentStatus: 'Entrevista agendada',

      estimatedTime: '1 a 3 dias úteis',

      updates: [
        {
          id: 1,
          title: 'Entrevista marcada para amanhã',
          date: 'Hoje',
        },
        {
          id: 2,
          title: 'Seu perfil foi aprovado',
          date: 'Ontem',
        },
      ],

      messages: [
        {
          id: 1,
          from: 'ONG Amigos de Patas',
          message:
            'Estamos ansiosos para conversar com você 🐱❤️',
          time: 'há 1 hora',
        },
      ],

      checklist: [
        {
          id: 1,
          title: 'Entrevista realizada',
          done: false,
        },
        {
          id: 2,
          title: 'Visita concluída',
          done: false,
        },
        {
          id: 3,
          title: 'Documentação enviada',
          done: true,
        },
      ],
    },

    {
      id: '3',

      petName: 'Thor',
      age: '3 anos',
      ong: 'ONG Vida Animal',
      image: require('@/assets/images/cachorro02.jpg'),

      currentStatus: 'Aprovado',

      estimatedTime: 'Processo concluído ❤️',

      updates: [
        {
          id: 1,
          title: 'Sua adoção foi aprovada',
          date: 'Hoje',
        },
        {
          id: 2,
          title: 'Visita concluída com sucesso',
          date: 'Ontem',
        },
      ],

      messages: [
        {
          id: 1,
          from: 'ONG Vida Animal',
          message:
            'Parabéns ❤️ O Thor agora faz parte da sua família.',
          time: 'Agora',
        },
      ],

      checklist: [
        {
          id: 1,
          title: 'Entrevista realizada',
          done: true,
        },
        {
          id: 2,
          title: 'Visita concluída',
          done: true,
        },
        {
          id: 3,
          title: 'Documentação enviada',
          done: true,
        },
      ],
    },
  ]);

  // PEGA O PET SELECIONADO
  const adoption =
    adoptions.find(
      (item) => item.petName === params.petName
    ) || adoptions[0];

  // STATUS CONFIG
  const statusConfig: any = {
    'Solicitação enviada': {
      color: '#3B82F6',
      bg: '#DBEAFE',
      icon: 'paper-plane-outline',
    },

    'Em análise': {
      color: '#F7B500',
      bg: '#FFF6D8',
      icon: 'time-outline',
    },

    'Entrevista agendada': {
      color: '#8B5CF6',
      bg: '#EFE7FF',
      icon: 'chatbubble-ellipses-outline',
    },

    Aprovado: {
      color: '#22C55E',
      bg: '#DCFCE7',
      icon: 'heart-outline',
    },

    'Não aprovado': {
      color: '#EF4444',
      bg: '#FEE2E2',
      icon: 'close-circle-outline',
    },
  };

  // TIMELINE DINÂMICA
  const getTimelineSteps = () => {
    let currentIndex = 0;

    if (adoption.currentStatus === 'Em análise')
      currentIndex = 1;

    if (
      adoption.currentStatus ===
      'Entrevista agendada'
    )
      currentIndex = 2;

    if (adoption.currentStatus === 'Aprovado')
      currentIndex = 4;

    const steps = [
      {
        id: 1,
        title: 'Solicitação enviada',
        description:
          'Sua solicitação foi enviada com sucesso.',
        icon: 'paper-plane-outline',
      },

      {
        id: 2,
        title: 'Perfil em análise',
        description:
          'A ONG está analisando suas respostas.',
        icon: 'time-outline',
      },

      {
        id: 3,
        title: 'Entrevista',
        description:
          'Conversa inicial com a ONG.',
        icon: 'chatbubble-ellipses-outline',
      },

      {
        id: 4,
        title: 'Visita',
        description:
          'Momento de aproximação com o pet.',
        icon: 'home-outline',
      },

      {
        id: 5,
        title: 'Finalização',
        description:
          'Conclusão da adoção responsável ❤️',
        icon: 'heart-outline',
      },
    ];

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: index === currentIndex,
    }));
  };

  const timelineSteps = getTimelineSteps();

  // ANIMAÇÕES
  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(20)
  ).current;

  const pulseAnim = useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),

        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const currentStatus =
    statusConfig[adoption.currentStatus];

  const openWhatsApp = async () => {
    const url =
      'https://wa.me/5511999999999?text=Olá%20ONG%20❤️';

    Linking.openURL(url);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? '#121212'
            : '#F8F9FB',
        },
      ]}
    >
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim,
            },
          ],
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 50,
          }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/acompanharAdocao')} // CORREÇÃO REALIZADA AQUI
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

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: isDark ? '#fff' : '#111',
                  },
                ]}
              >
                Acompanhamento ❤️
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color: isDark
                      ? '#CFCFCF'
                      : '#666',
                  },
                ]}
              >
                Transparência em cada etapa
              </Text>
            </View>
          </View>

          {/* HERO */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2A2A2A'
                  : '#EFEFEF',
              },
            ]}
          >
            <Image
              source={adoption.image}
              style={styles.heroImage}
            />

            <View style={styles.overlayGradient} />

            <View style={styles.heroContent}>
              <Text style={styles.heroName}>
                {adoption.petName} 🐾
              </Text>

              <Text style={styles.heroAge}>
                {adoption.age}
              </Text>

              <View style={styles.heroOngRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color="#fff"
                />

                <Text style={styles.heroOng}>
                  {adoption.ong}
                </Text>
              </View>
            </View>
          </View>

          {/* STATUS */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2A2A2A'
                  : '#EFEFEF',
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
              Status atual
            </Text>

            <View
              style={[
                styles.mainStatusBadge,
                {
                  backgroundColor: isDark
                    ? `${currentStatus.color}20`
                    : currentStatus.bg,

                  shadowColor:
                    currentStatus.color,
                },
              ]}
            >
              <Ionicons
                name={currentStatus.icon}
                size={20}
                color={currentStatus.color}
              />

              <Text
                style={[
                  styles.mainStatusText,
                  {
                    color: currentStatus.color,
                  },
                ]}
              >
                {adoption.currentStatus}
              </Text>
            </View>

            <View
              style={[
                styles.estimateCard,
                {
                  backgroundColor: isDark
                    ? '#242424'
                    : '#F8F9FB',
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={isDark ? '#fff' : '#444'}
              />

              <Text
                style={[
                  styles.estimateText,
                  {
                    color: isDark
                      ? '#E4E4E4'
                      : '#555',
                  },
                ]}
              >
                Tempo médio desta etapa:{' '}
                {adoption.estimatedTime}
              </Text>
            </View>
          </View>

          {/* TIMELINE */}
          <View
            style={[
              styles.timelineCard,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2A2A2A'
                  : '#EFEFEF',
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
              Jornada da adoção 🐾
            </Text>

            <View style={{ marginTop: 28 }}>
              {timelineSteps.map((step, index) => (
                <View
                  key={step.id}
                  style={styles.timelineItem}
                >
                  <View style={styles.timelineLeft}>
                    <Animated.View
                      style={[
                        styles.timelineIcon,
                        {
                          transform: [
                            {
                              scale: step.current
                                ? pulseAnim
                                : 1,
                            },
                          ],

                          backgroundColor:
                            step.completed
                              ? '#22C55E'
                              : step.current
                              ? '#F7B500'
                              : isDark
                              ? '#2A2A2A'
                              : '#ECECEC',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          step.completed
                            ? 'checkmark'
                            : (step.icon as any)
                        }
                        size={18}
                        color={
                          step.completed ||
                          step.current
                            ? '#fff'
                            : isDark
                            ? '#777'
                            : '#999'
                        }
                      />
                    </Animated.View>

                    {index !==
                      timelineSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor:
                              step.completed
                                ? '#22C55E40'
                                : step.current
                                ? '#F7B50040'
                                : isDark
                                ? '#2A2A2A'
                                : '#ECECEC',
                          },
                        ]}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        {
                          color: isDark
                            ? '#fff'
                            : '#111',
                        },
                      ]}
                    >
                      {step.title}
                    </Text>

                    <Text
                      style={[
                        styles.timelineDescription,
                        {
                          color: isDark
                            ? '#CFCFCF'
                            : '#666',
                        },
                      ]}
                    >
                      {step.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ATUALIZAÇÕES */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2A2A2A'
                  : '#EFEFEF',
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
              Atualizações recentes ✨
            </Text>

            {adoption.updates.map((item) => (
              <View
                key={item.id}
                style={styles.updateItem}
              >
                <View
                  style={[
                    styles.updateDot,
                    {
                      backgroundColor: isDark
                        ? '#FF80AB'
                        : '#FF2BAA',
                    },
                  ]}
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.updateDate,
                      {
                        color: isDark
                          ? '#FF80AB'
                          : '#FF2BAA',
                      },
                    ]}
                  >
                    {item.date}
                  </Text>

                  <Text
                    style={[
                      styles.updateText,
                      {
                        color: isDark
                          ? '#E4E4E4'
                          : '#444',
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* MENSAGENS */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2A2A2A'
                  : '#EFEFEF',
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
              Mensagens da ONG 💌
            </Text>

            {adoption.messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageCard,
                  {
                    backgroundColor: isDark
                      ? '#242424'
                      : '#F8F9FB',
                  },
                ]}
              >
                <View style={styles.messageUser}>
                  <View
                    style={[
                      styles.messageAvatar,
                      {
                        backgroundColor: isDark
                          ? '#FF80AB20'
                          : '#FFE1F3',
                      },
                    ]}
                  >
                    <Ionicons
                      name="heart"
                      size={16}
                      color={
                        isDark
                          ? '#FF80AB'
                          : '#FF2BAA'
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.messageName,
                        {
                          color: isDark
                            ? '#fff'
                            : '#111',
                        },
                      ]}
                    >
                      {message.from}
                    </Text>

                    <Text
                      style={[
                        styles.messageTime,
                        {
                          color: isDark
                            ? '#BDBDBD'
                            : '#777',
                        },
                      ]}
                    >
                      {message.time}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.messageText,
                    {
                      color: isDark
                        ? '#E4E4E4'
                        : '#555',
                    },
                  ]}
                >
                  {message.message}
                </Text>
              </View>
            ))}
          </View>

          {/* CHECKLIST */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark
                  ? '#1B1B1B'
                  : '#FFFFFF',

                borderColor: isDark
                  ? '#2A2A2A'
                  : '#EFEFEF',
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
              Próximas etapas 📋
            </Text>

            {adoption.checklist.map((item) => (
              <View
                key={item.id}
                style={styles.checkItem}
              >
                <View
                  style={[
                    styles.checkCircle,
                    {
                      backgroundColor: item.done
                        ? '#22C55E'
                        : 'transparent',

                      borderColor: item.done
                        ? '#22C55E'
                        : isDark
                        ? '#555'
                        : '#CCC',
                    },
                  ]}
                >
                  {item.done && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#fff"
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.checkText,
                    {
                      color: isDark
                        ? '#E4E4E4'
                        : '#444',
                    },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            ))}
          </View>

          {/* BOTÃO */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={openWhatsApp}
            style={[
              styles.contactButton,
              {
                backgroundColor: isDark
                  ? '#FF80AB'
                  : '#FF2BAA',
              },
            ]}
          >
            <Ionicons
              name="logo-whatsapp"
              size={20}
              color="#fff"
            />

            <Text style={styles.contactButtonText}>
              Falar com ONG
            </Text>
          </TouchableOpacity>
        </ScrollView>
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

  headerTitle: {
    marginTop: 35,
    fontSize: 28,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 24,
  },

  heroCard: {
    marginTop: 26,
    marginHorizontal: 20,

    borderRadius: 34,
    overflow: 'hidden',

    borderWidth: 1,
  },

  heroImage: {
    width: '100%',
    height: 320,
  },

  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },

  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
  },

  heroName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  heroAge: {
    color: '#fff',
    fontSize: 16,
    marginTop: 6,
  },

  heroOngRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

    marginTop: 12,
  },

  heroOng: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  statusCard: {
    marginTop: 20,
    marginHorizontal: 20,

    borderRadius: 30,
    padding: 22,

    borderWidth: 1,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  mainStatusBadge: {
    marginTop: 22,

    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

    paddingHorizontal: 20,
    paddingVertical: 16,

    borderRadius: 999,

    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  mainStatusText: {
    fontSize: 16,
    fontWeight: '700',
  },

  estimateCard: {
    marginTop: 22,

    borderRadius: 22,
    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  estimateText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },

  timelineCard: {
    marginTop: 20,
    marginHorizontal: 20,

    borderRadius: 30,
    padding: 22,

    borderWidth: 1,
  },

  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 26,
  },

  timelineLeft: {
    alignItems: 'center',
  },

  timelineIcon: {
    width: 46,
    height: 46,
    borderRadius: 999,

    justifyContent: 'center',
    alignItems: 'center',
  },

  timelineLine: {
    width: 3,
    flex: 1,

    marginTop: 6,
    borderRadius: 999,
  },

  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  timelineDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
  },

  sectionCard: {
    marginTop: 20,
    marginHorizontal: 20,

    borderRadius: 30,
    padding: 22,

    borderWidth: 1,
  },

  updateItem: {
    marginTop: 22,

    flexDirection: 'row',
    gap: 14,
  },

  updateDot: {
    width: 12,
    height: 12,
    borderRadius: 999,

    marginTop: 6,
  },

  updateDate: {
    fontSize: 13,
    fontWeight: '700',
  },

  updateText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },

  messageCard: {
    marginTop: 20,

    borderRadius: 24,
    padding: 18,
  },

  messageUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  messageAvatar: {
    width: 42,
    height: 42,
    borderRadius: 999,

    justifyContent: 'center',
    alignItems: 'center',
  },

  messageName: {
    fontSize: 15,
    fontWeight: '700',
  },

  messageTime: {
    marginTop: 4,
    fontSize: 12,
  },

  messageText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 26,
  },

  checkItem: {
    marginTop: 20,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,

    borderWidth: 2,

    justifyContent: 'center',
    alignItems: 'center',
  },

  checkText: {
    fontSize: 15,
    fontWeight: '500',
  },

  contactButton: {
    marginTop: 26,
    marginHorizontal: 20,

    borderRadius: 24,
    paddingVertical: 20,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,

    shadowColor: '#FF2BAA',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },

  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});