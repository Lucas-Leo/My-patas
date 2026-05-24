import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Animated,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function MyAdoptions() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  // MOCK API
  const [adoptions] = useState([
    {
      id: '1',
      petName: 'Luke',
      ong: 'ONG Paz e Amor',
      date: '12 Maio 2026',
      status: 'Em análise',
      statusColor: '#F7B500',
      statusBg: '#FFF6D8',
      icon: 'time-outline',
      image: require('@/assets/images/cachorro01.jpg'),
    },
    {
      id: '2',
      petName: 'Mia',
      ong: 'ONG Amigos de Patas',
      date: '08 Maio 2026',
      status: 'Entrevista agendada',
      statusColor: '#8B5CF6',
      statusBg: '#EFE7FF',
      icon: 'calendar-outline',
      image: require('@/assets/images/gato01.jpg'),
    },
    {
      id: '3',
      petName: 'Thor',
      ong: 'ONG Vida Animal',
      date: '03 Maio 2026',
      status: 'Aprovado',
      statusColor: '#22C55E',
      statusBg: '#DCFCE7',
      icon: 'checkmark-circle-outline',
      image: require('@/assets/images/cachorro02.jpg'),
    },
  ]);

  const [selectedAdoption, setSelectedAdoption] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // TIMELINE DINÂMICA
  const getAdoptionSteps = (currentStatus: string) => {
    // Definimos a hierarquia de status para saber até qual passo preencher
    let currentIndex = 0;
    if (currentStatus === 'Em análise') currentIndex = 1;
    if (currentStatus === 'Entrevista agendada') currentIndex = 2;
    if (currentStatus === 'Aprovado') currentIndex = 3;

    const steps = [
      {
        id: 1,
        title: 'Solicitação enviada',
        description: 'Sua solicitação foi enviada para a ONG.',
        icon: 'paper-plane-outline',
      },
      {
        id: 2,
        title: 'Em análise',
        description: 'A ONG está analisando suas respostas.',
        icon: 'time-outline',
      },
      {
        id: 3,
        title: 'Entrevista',
        description: 'Conversa inicial com a ONG.',
        icon: 'chatbubble-ellipses-outline',
      },
      {
        id: 4,
        title: 'Resultado final',
        description: 'Resultado da avaliação da adoção.',
        icon: 'heart-outline',
      },
    ];

    // Mapeia os passos definindo se estão completos baseados no index do status atual
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
    }));
  };

  const dynamicAdoptionSteps = getAdoptionSteps(selectedAdoption?.status || '');

  // ANIMAÇÕES
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateCard = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleOpenDetails = (item: any) => {
    animateCard();
    setSelectedAdoption(item);

    setTimeout(() => {
      setShowDetailsModal(true);
    }, 120);
  };

  const renderStatus = (
    status: string,
    color: string,
    bg: string,
    icon: any
  ) => {
    return (
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: isDark ? `${color}20` : bg,
          },
        ]}
      >
        <Ionicons name={icon} size={14} color={color} />
        <Text
          style={[
            styles.statusText,
            {
              color,
            },
          ]}
        >
          {status}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: any) => {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim,
            },
          ],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleOpenDetails(item)}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
              borderColor: isDark ? '#2A2A2A' : '#EFEFEF',
            },
          ]}
        >
          {/* TOPO */}
          <View style={styles.cardTop}>
            <Image
              source={item.image}
              style={styles.petImage}
              resizeMode="cover"
            />

            <View style={{ flex: 1 }}>
              <View style={styles.petRow}>
                <Text
                  style={[
                    styles.petName,
                    {
                      color: isDark ? '#FFFFFF' : '#111',
                    },
                  ]}
                >
                  {item.petName} 🐾
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenDetails(item)}
                  style={[
                    styles.arrowButton,
                    {
                      backgroundColor: isDark ? '#242424' : '#F4F4F4',
                    },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? '#FFFFFF' : '#333'}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.ongText,
                  {
                    color: isDark ? '#D2D2D2' : '#666',
                  },
                ]}
              >
                {item.ong}
              </Text>

              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={isDark ? '#BDBDBD' : '#777'}
                />

                <Text
                  style={[
                    styles.dateText,
                    {
                      color: isDark ? '#BDBDBD' : '#777',
                    },
                  ]}
                >
                  Solicitação enviada em {item.date}
                </Text>
              </View>
            </View>
          </View>

          {/* STATUS */}
          <View style={styles.statusContainer}>
            {renderStatus(
              item.status,
              item.statusColor,
              item.statusBg,
              item.icon
            )}
          </View>

          {/* FOOTER */}
          <View
            style={[
              styles.cardFooter,
              {
                borderTopColor: isDark ? '#2A2A2A' : '#F1F1F1',
              },
            ]}
          >
            <View style={styles.footerLeft}>
              <Ionicons
                name="heart"
                size={16}
                color={isDark ? '#FF80AB' : '#FF2BAA'}
              />

              <Text
                style={[
                  styles.footerText,
                  {
                    color: isDark ? '#E4E4E4' : '#555',
                  },
                ]}
              >
                Processo acompanhado pela ONG
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOpenDetails(item)}
            >
              <Text
                style={[
                  styles.detailsText,
                  {
                    color: isDark ? '#FF80AB' : '#FF2BAA',
                  },
                ]}
              >
                Ver detalhes
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    return (
      <Animated.View
        style={[
          styles.emptyContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim,
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            {
              backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
            },
          ]}
        >
          <Text style={{ fontSize: 44 }}>🐾</Text>
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color: isDark ? '#fff' : '#111',
            },
          ]}
        >
          Você ainda não possui processos de adoção.
        </Text>

        <Text
          style={[
            styles.emptySubtitle,
            {
              color: isDark ? '#CFCFCF' : '#666',
            },
          ]}
        >
          Explore pets disponíveis e encontre um novo melhor amigo ❤️
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/home')}
          style={[
            styles.emptyButton,
            {
              backgroundColor: isDark ? '#FF80AB' : '#FF2BAA',
            },
          ]}
        >
          <Text style={styles.emptyButtonText}>Explorar pets</Text>
        </TouchableOpacity>
      </Animated.View>
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
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/adocaoSucesso')}
            style={[
              styles.backButton,
              {
                backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? '#fff' : '#333'}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text
              style={[
                styles.title,
                {
                  color: isDark ? '#FFFFFF' : '#111',
                },
              ]}
            >
              Minhas adoções ❤️
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: isDark ? '#CFCFCF' : '#666',
                },
              ]}
            >
              Acompanhe o andamento dos seus processos
            </Text>
          </View>
        </View>

        {/* LISTA */}
        {adoptions.length > 0 ? (
          <FlatList
            data={adoptions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmpty()
        )}
      </Animated.View>

      {/* MODAL DETALHES */}
      <Modal visible={showDetailsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.detailsModal,
              {
                backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
              },
            ]}
          >
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: isDark ? '#FFFFFF' : '#111',
                    },
                  ]}
                >
                  Processo de adoção ❤️
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color: isDark ? '#CFCFCF' : '#666',
                    },
                  ]}
                >
                  Acompanhe cada etapa
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark ? '#2A2A2A' : '#F4F4F4',
                  },
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? '#fff' : '#333'}
                />
              </TouchableOpacity>
            </View>

            {/* PET */}
            <View
              style={[
                styles.modalPetCard,
                {
                  backgroundColor: isDark ? '#242424' : '#F8F9FB',
                },
              ]}
            >
              <Image
                source={selectedAdoption?.image}
                style={styles.modalPetImage}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.modalPetName,
                    {
                      color: isDark ? '#fff' : '#111',
                    },
                  ]}
                >
                  {selectedAdoption?.petName} 🐾
                </Text>

                <Text
                  style={[
                    styles.modalPetOng,
                    {
                      color: isDark ? '#CFCFCF' : '#666',
                    },
                  ]}
                >
                  {selectedAdoption?.ong}
                </Text>
              </View>
            </View>

            {/* TIMELINE */}
            <View style={{ marginTop: 26 }}>
              {dynamicAdoptionSteps.map((step, index) => (
                <View key={step.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineIcon,
                        {
                          backgroundColor: step.completed
                            ? isDark
                              ? '#FF80AB'
                              : '#FF2BAA'
                            : isDark
                            ? '#2A2A2A'
                            : '#ECECEC',
                        },
                      ]}
                    >
                      <Ionicons
                        name={step.icon as any}
                        size={18}
                        color={
                          step.completed
                            ? '#fff'
                            : isDark
                            ? '#888'
                            : '#999'
                        }
                      />
                    </View>

                    {index !== dynamicAdoptionSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: step.completed
                              ? isDark
                                ? '#FF80AB50'
                                : '#FF2BAA40'
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
                          color: isDark ? '#FFFFFF' : '#111',
                        },
                      ]}
                    >
                      {step.title}
                    </Text>

                    <Text
                      style={[
                        styles.timelineDescription,
                        {
                          color: isDark ? '#CFCFCF' : '#666',
                        },
                      ]}
                    >
                      {step.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* BOTÃO */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setShowDetailsModal(false);

                router.push({
                  pathname: '/adocaoDetalhes',
                  params: {
                    petName: selectedAdoption?.petName,
                    ong: selectedAdoption?.ong,
                    status: selectedAdoption?.status,
                    date: selectedAdoption?.date,
                  },
                });
              }}
              style={[
                styles.fullDetailsButton,
                {
                  backgroundColor: isDark ? '#FF80AB' : '#FF2BAA',
                },
              ]}
            >
              <Text style={styles.fullDetailsText}>
                Abrir detalhes completos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    gap: 16,
    alignItems: 'center',
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

  headerContent: {
    flex: 1,
    marginTop: 35,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 24,
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTop: {
    flexDirection: 'row',
    gap: 16,
  },

  petImage: {
    width: 92,
    height: 92,
    borderRadius: 24,
  },

  petRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  petName: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  ongText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },

  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },

  statusContainer: {
    marginTop: 20,
  },

  statusBadge: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 999,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },

  cardFooter: {
    marginTop: 20,
    paddingTop: 18,

    borderTopWidth: 1,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

    flex: 1,
  },

  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },

  detailsText: {
    fontSize: 13,
    fontWeight: '700',
  },

  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 999,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 28,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
  },

  emptySubtitle: {
    marginTop: 14,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 25,
  },

  emptyButton: {
    marginTop: 30,

    paddingHorizontal: 28,
    paddingVertical: 18,

    borderRadius: 22,

    shadowColor: '#FF2BAA',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },

  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 20,
  },

  detailsModal: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',
  },

  modalPetCard: {
    marginTop: 24,

    borderRadius: 24,
    padding: 16,

    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },

  modalPetImage: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },

  modalPetName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  modalPetOng: {
    marginTop: 6,
    fontSize: 14,
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
    width: 42,
    height: 42,
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

  fullDetailsButton: {
    marginTop: 10,

    paddingVertical: 18,
    borderRadius: 22,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#FF2BAA',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },

  fullDetailsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});