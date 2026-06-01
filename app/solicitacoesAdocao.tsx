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
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

// Definição da interface para tipagem segura das solicitações
interface Solicitation {
  id: string;
  petName: string;
  candidateName: string;
  date: string;
  status: string;
  statusColor: string;
  statusBg: string;
  icon: string;
  image: any;
  currentStepIndex: number; // Define até onde a linha do tempo avançou (0 a 3)
}

export default function SolicitacoesONG() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  // ESTADOS DE BUSCA E FILTROS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todas');

  // MOCK API - Baseado nos requisitos de status e design do Patas Conscientes
  const [solicitations] = useState<Solicitation[]>([
    {
      id: '1',
      petName: 'Thor',
      candidateName: 'Lucas Souza',
      date: '15/06/2026',
      status: 'Nova',
      statusColor: '#3B82F6',
      statusBg: '#EFF6FF',
      icon: 'sparkles-outline',
      image: require('@/assets/images/cachorro02.jpg'),
      currentStepIndex: 0,
    },
    {
      id: '2',
      petName: 'Mia',
      candidateName: 'Beatriz Silva',
      date: '14/06/2026',
      status: 'Em análise',
      statusColor: '#F7B500',
      statusBg: '#FFF6D8',
      icon: 'time-outline',
      image: require('@/assets/images/gato01.jpg'),
      currentStepIndex: 1,
    },
    {
      id: '3',
      petName: 'Luke',
      candidateName: 'Carlos Eduardo',
      date: '12/06/2026',
      status: 'Entrevista agendada',
      statusColor: '#8B5CF6',
      statusBg: '#EFE7FF',
      icon: 'calendar-outline',
      image: require('@/assets/images/cachorro01.jpg'),
      currentStepIndex: 2,
    },
    {
      id: '4',
      petName: 'Luna',
      candidateName: 'Mariana Costa',
      date: '10/06/2026',
      status: 'Aguardando documentos',
      statusColor: '#EC4899',
      statusBg: '#FCE7F3',
      icon: 'document-text-outline',
      image: require('@/assets/images/gato01.jpg'),
      currentStepIndex: 2,
    },
    {
      id: '5',
      petName: 'Mel',
      candidateName: 'Roberto Almeida',
      date: '08/06/2026',
      status: 'Aprovadas',
      statusColor: '#22C55E',
      statusBg: '#DCFCE7',
      icon: 'checkmark-circle-outline',
      image: require('@/assets/images/cachorro01.jpg'),
      currentStepIndex: 3,
    },
  ]);

  // OPÇÕES DE FILTROS HORIZONTAIS (CHIPS)
  const filters = [
    'Todas',
    'Nova',
    'Em análise',
    'Entrevista agendada',
    'Aguardando documentos',
    'Aprovadas',
    'Reprovadas',
    'Finalizadas',
  ];

  // ETAPAS DA ADOÇÃO (Linha do tempo/Progresso)
  const steps = [
    { title: 'Triagem', icon: 'document-outline' },
    { title: 'Análise', icon: 'time-outline' },
    { title: 'Entrevista', icon: 'chatbubbles-outline' },
    { title: 'Final', icon: 'heart-outline' },
  ];

  // ANIMAÇÕES DE ENTRADA
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

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

  // FILTRAGEM DINÂMICA
  const filteredSolicitations = solicitations.filter((item) => {
    const matchesSearch =
      item.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.candidateName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'Todas' || item.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // Redireciona para a tela gerenciarSolicitacoes com os dados do item
  const handleGoToManage = (item: Solicitation) => {
    router.push({
      pathname: '/gerenciarSolicitacoes',
      params: { id: item.id, petName: item.petName, candidateName: item.candidateName },
    });
  };

  const renderStatusBadge = (status: string, color: string, bg: string, icon: any) => {
    return (
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: isDark ? `${color}20` : bg,
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Solicitation }) => {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
              borderColor: isDark ? '#2A2A2A' : '#EFEFEF',
            },
          ]}
        >
          {/* BLOCO DE INFORMAÇÕES PRINCIPAIS */}
          <View style={styles.cardTop}>
            <Image source={item.image} style={styles.petImage} resizeMode="cover" />

            <View style={{ flex: 1 }}>
              <View style={styles.petRow}>
                <Text style={[styles.petName, { color: isDark ? '#FFFFFF' : '#111' }]}>
                  {item.petName} 🐾
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleGoToManage(item)}
                  style={[
                    styles.arrowButton,
                    { backgroundColor: isDark ? '#242424' : '#F4F4F4' },
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? '#FFFFFF' : '#333'}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.candidateText, { color: isDark ? '#D2D2D2' : '#555' }]}>
                Interessado(a): <Text style={styles.boldText}>{item.candidateName}</Text>
              </Text>

              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={isDark ? '#BDBDBD' : '#777'}
                />
                <Text style={[styles.dateText, { color: isDark ? '#BDBDBD' : '#777' }]}>
                  Solicitado em {item.date}
                </Text>
              </View>
            </View>
          </View>

          {/* BADGE DE STATUS */}
          <View style={styles.statusContainer}>
            {renderStatusBadge(item.status, item.statusColor, item.statusBg, item.icon)}
          </View>

          {/* INDICADOR VISUAL / MINILINHA DO TEMPO */}
          <View style={[styles.timelineWrapper, { borderTopColor: isDark ? '#2A2A2A' : '#F4F4F4' }]}>
            <Text style={[styles.timelineSectionTitle, { color: isDark ? '#888' : '#777' }]}>
              Progresso do candidato:
            </Text>
            <View style={styles.miniTimeline}>
              {steps.map((step, idx) => {
                const isStepCompleted = idx <= item.currentStepIndex;
                const stepColor = isStepCompleted
                  ? isDark
                    ? '#FF80AB'
                    : '#FF2BAA'
                  : isDark
                  ? '#333333'
                  : '#E5E7EB';

                return (
                  <View key={idx} style={styles.timelineNode}>
                    <View style={[styles.circleNode, { backgroundColor: stepColor }]}>
                      <Ionicons
                        name={step.icon as any}
                        size={13}
                        color={isStepCompleted ? '#FFF' : isDark ? '#666' : '#9CA3AF'}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.nodeLabel,
                        {
                          color: isStepCompleted
                            ? isDark
                              ? '#FF80AB'
                              : '#FF2BAA'
                            : isDark
                            ? '#777'
                            : '#999',
                          fontWeight: isStepCompleted ? '600' : '400',
                        },
                      ]}
                    >
                      {step.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* AÇÃO DO CARD (BOTÃO PRINCIPAL) */}
          <View
            style={[
              styles.cardFooter,
              {
                borderTopColor: isDark ? '#2A2A2A' : '#F1F1F1',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? '#FF80AB' : '#FF2BAA' },
              ]}
              activeOpacity={0.8}
              onPress={() => handleGoToManage(item)}
            >
              <Text style={styles.actionButtonText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        </View>
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
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF' }]}>
          <Text style={{ fontSize: 44 }}>📋</Text>
        </View>

        <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#111' }]}>
          Nenhuma solicitação encontrada
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F8F9FB' },
      ]}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        
        {/* CABEÇALHO COM BOTÃO VOLTAR */}
        <View style={styles.header}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => router.push('/perfilONG')}
            style={[styles.backButton, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EAEAEA' }]}
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? '#FF80AB' : '#000000'} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#111' }]}>
              Solicitações
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#CFCFCF' : '#666' }]}>
              Gerencie os interessados em adotar seus pets
            </Text>
          </View>
        </View>

        {/* BARRA DE PESQUISA */}
        <View style={styles.searchWrapper}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF',
                borderColor: isDark ? '#2A2A2A' : '#EAEAEA',
              },
            ]}
          >
            <Ionicons name="search-outline" size={20} color={isDark ? '#888' : '#A0A0A0'} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#FFF' : '#111' }]}
              placeholder="Pesquisar solicitações..."
              placeholderTextColor={isDark ? '#666' : '#A0A0A0'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={isDark ? '#888' : '#A0A0A0'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FILTROS HORIZONTAIS (CHIPS) */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.8}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? '#FF80AB'
                          : '#FF2BAA'
                        : isDark
                        ? '#1B1B1B'
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? isDark
                          ? '#FF80AB'
                          : '#FF2BAA'
                        : isDark
                        ? '#2A2A2A'
                        : '#EFEFEF',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : isDark
                          ? '#BDBDBD'
                          : '#555555',
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LISTA DE SOLICITAÇÕES */}
        {filteredSolicitations.length > 0 ? (
          <FlatList
            data={filteredSolicitations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmpty()
        )}
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
    paddingTop: 24,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 30,
  },
  headerContent: {
    flex: 1,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterWrapper: {
    marginTop: 16,
    marginBottom: 6,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 18, 
    paddingVertical: 12,   
    borderRadius: 99,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  chipText: {
    fontSize: 15, 
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 16,
  },
  petImage: {
    width: 84,
    height: 84,
    borderRadius: 22,
  },
  petRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  candidateText: {
    marginTop: 6,
    fontSize: 14,
  },
  boldText: {
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    marginTop: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10, 
    borderRadius: 99,
  },
  statusText: {
    fontSize: 15, 
    fontWeight: '700',
  },
  timelineWrapper: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  timelineSectionTitle: {
    fontSize: 14, 
    fontWeight: '600',
    marginBottom: 12,
  },
  miniTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  timelineNode: {
    alignItems: 'center',
    width: '24%', 
  },
  circleNode: {
    width: 26, 
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  nodeLabel: {
    fontSize: 12, 
    textAlign: 'center',
  },
  cardFooter: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    height: 52, 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#FF2BAA',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15, // Aumentado de 14 para 15
    fontWeight: '700',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  emptySubtitle: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});