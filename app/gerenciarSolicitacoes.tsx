import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function DetalhesSolicitacaoONG() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const primaryColor = isDark ? '#FF80AB' : '#FF2BAA';
  const shadowColor = '#000000';

  const [solicitacao, setSolicitacao] = useState({
    pet: {
      nome: 'Thor',
      emoji: '🐶',
      imagem: require('@/assets/images/cachorro02.jpg'),
    },
    adotante: {
      nome: 'Lucas Silva',
      idade: 28,
      cidade: 'Matão',
      estado: 'SP',
      telefone: '5516999999999',
      email: 'lucas.silva@email.com',
      foto: require('@/assets/images/cachorro01.jpg'),
    },
    resumo: {
      dataSolicitacao: '28 Maio 2026',
      tipoMoradia: 'Casa',
      possuiQuintal: 'Sim, amplo e fechado',
      experienciaAnimais: 'Já teve um cão por 12 anos',
    },
    questionario: [
      { id: '1', pergunta: 'Por que deseja adotar?', resposta: 'Busco um companheiro para caminhadas e para fazer parte da nossa família.' },
      { id: '2', pergunta: 'Quanto tempo ficará sozinho?', resposta: 'No máximo 4 horas por dia, trabalho em modelo híbrido.' },
      { id: '3', pergunta: 'Quem cuidará do pet?', resposta: 'Eu e minha esposa dividiremos os cuidados diários.' },
      { id: '4', pergunta: 'Possui outros animais?', resposta: 'Não no momento, mas a casa está totalmente preparada.' },
    ],
    perfilEmocional: {
      responsabilidade: 80,
      comprometimento: 90,
      disponibilidade: 75,
      perfilFamiliar: 85,
    },
    status: 'Em análise',
  });

  const [observacao, setObservacao] = useState('Família aparenta ser altamente compatível com o perfil ativo do pet.');
  const [modalStatusVisivel, setModalStatusVisivel] = useState(false);

  const statusConfig: { [key: string]: { label: string; color: string; bg: string; icon: IconName } } = {
    'Em análise': { label: 'Solicitação em análise', color: '#F7B500', bg: '#FFF6D8', icon: 'time-outline' },
    'Entrevista': { label: 'Entrevista agendada', color: '#8B5CF6', bg: '#EFE7FF', icon: 'calendar-outline' },
    'Visita': { label: 'Visita agendada', color: '#3B82F6', bg: '#EFF6FF', icon: 'home-outline' },
    'Aprovado': { label: 'Aprovado', color: '#22C55E', bg: '#DCFCE7', icon: 'checkmark-circle-outline' },
    'Entregue': { label: 'Pet entregue! ❤️', color: '#EC4899', bg: '#FCE7F3', icon: 'heart-done-outline' },
    'Reprovado': { label: 'Reprovado', color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
  };

  const todasEtapas: { key: string; label: string; icon: IconName }[] = [
    { key: 'Solicitação enviada', label: 'Solicitação enviada', icon: 'paper-plane-outline' },
    { key: 'Em análise', label: 'Em análise', icon: 'time-outline' },
    { key: 'Entrevista', label: 'Entrevista', icon: 'chatbubble-ellipses-outline' },
    { key: 'Visita', label: 'Visita Residencial', icon: 'home-outline' },
    { key: 'Aprovado', label: 'Aprovação', icon: 'ribbon-outline' },
    { key: 'Entregue', label: 'Entrega do pet', icon: 'happy-outline' },
  ];

  const obterPassosTimeline = () => {
    const statusAtual = solicitacao.status;
    let indiceAtual = todasEtapas.findIndex(e => e.key === statusAtual);
    if (statusAtual === 'Reprovado') indiceAtual = 1;

    return todasEtapas.map((etapa, index) => ({
      ...etapa,
      completo: index <= indiceAtual,
      ativo: etapa.key === statusAtual || (statusAtual === 'Reprovado' && etapa.key === 'Em análise'),
    }));
  };

  const simularEnvioNotificacao = (novoStatus: string) => {
    console.log(`[PUSH NOTIFICATION] Para: ${solicitacao.adotante.email}. Status: ${novoStatus}.`);
  };

  const atualizarStatusGeral = (novoStatus: string) => {
    setSolicitacao(prev => ({ ...prev, status: novoStatus }));
    setModalStatusVisivel(false);
    simularEnvioNotificacao(novoStatus);
    Alert.alert('Status Atualizado', `O processo agora está na etapa: ${novoStatus}. O adotante foi notificado.`);
  };

  const abrirWhatsAppAdotante = () => {
    const mensagem = `Olá ${solicitacao.adotante.nome}, aqui é da ONG do app Patas Conscientes. Estamos analisando sua solicitação de adoção para o ${solicitacao.pet.nome}!`;
    const url = `whatsapp://send?phone=${solicitacao.adotante.telefone}&text=${encodeURIComponent(mensagem)}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Erro', 'O WhatsApp não está instalado neste dispositivo.');
        }
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.'));
  };

  const renderBarraProgresso = (porcentagem: number) => {
    const totalBlocos = 10;
    const blocosAtivos = Math.round((porcentagem / 100) * totalBlocos);
    return '█'.repeat(blocosAtivos) + '░'.repeat(totalBlocos - blocosAtivos) + ` ${porcentagem}%`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FB' }]}>
      
      {/* HEADER FIXO SUPERIOR */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerMainTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>
            Gerenciar Adoção
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* HEADER DA TELA */}
        <View style={[styles.profileHeaderCard, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EFEFEF' }]}>
          <Image source={solicitacao.pet.imagem} style={styles.petAvatar} resizeMode="cover" />
          <View style={styles.petHeaderDetails}>
            <Text style={[styles.petNameText, { color: isDark ? '#FFFFFF' : '#111111' }]}>
              {solicitacao.pet.nome} {solicitacao.pet.emoji}
            </Text>
            
            <View style={[styles.statusBadge, { backgroundColor: isDark ? `${statusConfig[solicitacao.status].color}20` : statusConfig[solicitacao.status].bg }]}>
              <Ionicons name={statusConfig[solicitacao.status].icon} size={14} color={statusConfig[solicitacao.status].color} />
              <Text style={[styles.statusText, { color: statusConfig[solicitacao.status].color }]}>
                {statusConfig[solicitacao.status].label}
              </Text>
            </View>

            <Text style={[styles.requestedByText, { color: isDark ? '#BDBDBD' : '#666666' }]}>
              Solicitado por <Text style={{ fontWeight: '700', color: primaryColor }}>{solicitacao.adotante.nome}</Text>
            </Text>
          </View>
        </View>

        {/* CARD RESUMO DA SOLICITAÇÃO */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EFEFEF' }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="document-text-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Resumo da Solicitação</Text>
          </View>
          
          <View style={styles.quickInfoGrid}>
            <View style={[styles.quickInfoBox, { backgroundColor: isDark ? '#242424' : '#F8F9FB' }]}>
              <Text style={styles.infoLabel}>Data do Envio</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>{solicitacao.resumo.dataSolicitacao}</Text>
            </View>
            <View style={[styles.quickInfoBox, { backgroundColor: isDark ? '#242424' : '#F8F9FB' }]}>
              <Text style={styles.infoLabel}>Tipo de Moradia</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>{solicitacao.resumo.tipoMoradia}</Text>
            </View>
            <View style={[styles.quickInfoBox, { backgroundColor: isDark ? '#242424' : '#F8F9FB' }]}>
              <Text style={styles.infoLabel}>Possui Quintal?</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>{solicitacao.resumo.possuiQuintal}</Text>
            </View>
            <View style={[styles.quickInfoBox, { backgroundColor: isDark ? '#242424' : '#F8F9FB' }]}>
              <Text style={styles.infoLabel}>Experiência Prévia</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>{solicitacao.resumo.experienciaAnimais}</Text>
            </View>
            <View style={[styles.quickInfoBox, { backgroundColor: isDark ? '#242424' : '#F8F9FB', width: '100%' }]}>
              <Text style={styles.infoLabel}>Localização</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                {solicitacao.adotante.cidade} - {solicitacao.adotante.estado}
              </Text>
            </View>
          </View>
        </View>

        {/* CARD PERFIL DO ADOTANTE */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EFEFEF' }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="person-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Perfil do Adotante</Text>
          </View>

          <View style={styles.adotanteRow}>
            <Image source={solicitacao.adotante.foto} style={styles.adotanteImage} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.adotanteName, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                {solicitacao.adotante.nome}, {solicitacao.adotante.idade} anos
              </Text>
              <Text style={[styles.adotanteContact, { color: isDark ? '#BDBDBD' : '#666666' }]}>
                <Ionicons name="mail-outline" size={13} /> {solicitacao.adotante.email}
              </Text>
              <Text style={[styles.adotanteContact, { color: isDark ? '#BDBDBD' : '#666666' }]}>
                <Ionicons name="call-outline" size={13} /> {solicitacao.adotante.telefone}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.whatsappButton} activeOpacity={0.9} onPress={abrirWhatsAppAdotante}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.whatsappButtonText}>Conversar no WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* CARD QUESTIONÁRIO DE ADOÇÃO */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EFEFEF' }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="help-circle-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Questionário de Adoção</Text>
          </View>

          {solicitacao.questionario.map(item => (
            <View key={item.id} style={[styles.questionInnerCard, { backgroundColor: isDark ? '#242424' : '#F4F5F7' }]}>
              <Text style={[styles.questionText, { color: primaryColor }]}>{item.pergunta}</Text>
              <Text style={[styles.answerText, { color: isDark ? '#E4E4E4' : '#444444' }]}>"{item.resposta}"</Text>
            </View>
          ))}

          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: primaryColor }]} 
            activeOpacity={0.8}
            onPress={() => Alert.alert('Questionário Completo', 'Redirecionando para o formulário integral.')}
          >
            <Text style={[styles.secondaryButtonText, { color: primaryColor }]}>Ver questionário completo</Text>
          </TouchableOpacity>
        </View>

        {/* CARD PERFIL EMOCIONAL */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EFEFEF' }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="analytics-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Análise de Perfil Emocional</Text>
          </View>

          <View style={styles.metricContainer}>
            <Text style={[styles.metricLabel, { color: isDark ? '#E4E4E4' : '#333333' }]}>Responsabilidade</Text>
            <Text style={[styles.progressBarText, { color: primaryColor }]}>
              {renderBarraProgresso(solicitacao.perfilEmocional.responsabilidade)}
            </Text>
          </View>

          <View style={styles.metricContainer}>
            <Text style={[styles.metricLabel, { color: isDark ? '#E4E4E4' : '#333333' }]}>Comprometimento</Text>
            <Text style={[styles.progressBarText, { color: primaryColor }]}>
              {renderBarraProgresso(solicitacao.perfilEmocional.comprometimento)}
            </Text>
          </View>

          <View style={styles.metricContainer}>
            <Text style={[styles.metricLabel, { color: isDark ? '#E4E4E4' : '#333333' }]}>Disponibilidade de Tempo</Text>
            <Text style={[styles.progressBarText, { color: primaryColor }]}>
              {renderBarraProgresso(solicitacao.perfilEmocional.disponibilidade)}
            </Text>
          </View>

          <View style={styles.metricContainer}>
            <Text style={[styles.metricLabel, { color: isDark ? '#E4E4E4' : '#333333' }]}>Adequação do Perfil Familiar</Text>
            <Text style={[styles.progressBarText, { color: primaryColor }]}>
              {renderBarraProgresso(solicitacao.perfilEmocional.perfilFamiliar)}
            </Text>
          </View>
        </View>

        {/* TIMELINE DO PROCESSO */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EFEFEF' }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="git-commit-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Timeline do Processo</Text>
          </View>

          <View style={styles.timelineWrapper}>
            {obterPassosTimeline().map((passo, index) => (
              <View key={passo.key} style={styles.timelineItem}>
                <View style={styles.timelineLeftColumn}>
                  <View style={[
                    styles.timelineNode, 
                    { 
                      backgroundColor: passo.ativo 
                        ? primaryColor 
                        : (passo.completo ? `${primaryColor}B0` : (isDark ? '#2A2A2A' : '#ECECEC'))
                    }
                  ]}>
                    <Ionicons 
                      name={passo.completo ? 'checkmark' : passo.icon} 
                      size={14} 
                      color={passo.completo || passo.ativo ? '#FFFFFF' : '#888888'} 
                    />
                  </View>
                  {index !== todasEtapas.length - 1 && (
                    <View style={[
                      styles.timelineLine, 
                      { backgroundColor: passo.completo ? `${primaryColor}60` : (isDark ? '#2A2A2A' : '#ECECEC') }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTitleText, 
                    { 
                      color: passo.ativo ? primaryColor : (isDark ? '#FFFFFF' : '#111111'),
                      fontWeight: passo.ativo ? '800' : '500'
                    }
                  ]}>
                    {passo.label} {passo.ativo ? '• (Etapa Atual)' : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CARD OBSERVAÇÕES DA ONG */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF', borderColor: isDark ? '#2A2A2A' : '#EFEFEF' }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="create-outline" size={20} color={primaryColor} />
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Observações Internas (ONG)</Text>
          </View>

          <TextInput
            style={[styles.textArea, { 
              backgroundColor: isDark ? '#242424' : '#F8F9FB', 
              color: isDark ? '#FFFFFF' : '#333333',
              borderColor: isDark ? '#3A3A3A' : '#E2E8F0'
            }]}
            multiline
            numberOfLines={4}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Digite anotações internas..."
            placeholderTextColor="#888888"
          />

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: isDark ? '#333333' : '#F1F5F9' }]}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Sucesso', 'Observações internas salvas.')}
          >
            <Ionicons name="save-outline" size={16} color={isDark ? '#FFFFFF' : '#333333'} />
            <Text style={[styles.saveButtonText, { color: isDark ? '#FFFFFF' : '#333333' }]}>Salvar observação</Text>
          </TouchableOpacity>
        </View>

        {/* AÇÕES DE GERENCIAMENTO DA ONG */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitleLabel, { color: isDark ? '#BDBDBD' : '#666666' }]}>Ações de Gestão do Processo</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionGridButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => atualizarStatusGeral('Entrevista')}
            >
              <Ionicons name="calendar" size={18} color="#FFFFFF" />
              <Text style={styles.actionGridButtonText}>Agendar Entrevista</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionGridButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => Alert.alert('Informações', 'Documentos solicitados.')}
            >
              <Ionicons name="information-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionGridButtonText}>Pedir Info Extra</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.primaryActionFullButton, { backgroundColor: primaryColor, shadowColor }]}
            activeOpacity={0.9}
            onPress={() => setModalStatusVisivel(true)}
          >
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionFullButtonText}>Atualizar Status do Processo</Text>
          </TouchableOpacity>

          <View style={styles.decisionRow}>
            <TouchableOpacity 
              style={[styles.decisionButton, { backgroundColor: '#22C55E' }]}
              activeOpacity={0.9}
              onPress={() => {
                Alert.alert('Confirmar Aprovação', 'Deseja aprovar definitivamente esta solicitação?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sim, Aprovar', onPress: () => atualizarStatusGeral('Aprovado') }
                ]);
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.decisionButtonText}>Aprovar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.decisionButton, { backgroundColor: '#EF4444' }]}
              activeOpacity={0.9}
              onPress={() => {
                Alert.alert('Confirmar Reprovação', 'Tem certeza que deseja reprovar esta solicitação?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sim, Reprovar', onPress: () => atualizarStatusGeral('Reprovado') }
                ]);
              }}
            >
              <Ionicons name="close-circle" size={18} color="#FFFFFF" />
              <Text style={styles.decisionButtonText}>Reprovar</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* MODAL ATUALIZAR STATUS */}
      <Modal visible={modalStatusVisivel} transparent animationType="fade" onRequestClose={() => setModalStatusVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: isDark ? '#1B1B1B' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111111' }]}>Alterar Status</Text>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#BDBDBD' : '#666666' }]}>Selecione a fase atual do fluxo</Text>
              </View>
              <TouchableOpacity onPress={() => setModalStatusVisivel(false)} style={[styles.closeModalButton, { backgroundColor: isDark ? '#2A2A2A' : '#F4F4F4' }]}>
                <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalOptionsContainer}>
              {Object.keys(statusConfig).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.modalOptionRow,
                    { 
                      backgroundColor: isDark ? '#242424' : '#F8F9FB',
                      borderColor: solicitacao.status === key ? primaryColor : 'transparent',
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => atualizarStatusGeral(key)}
                >
                  <View style={[styles.modalOptionIconWrapper, { backgroundColor: `${statusConfig[key].color}20` }]}>
                    <Ionicons name={statusConfig[key].icon} size={18} color={statusConfig[key].color} />
                  </View>
                  <Text style={[styles.modalOptionLabel, { color: isDark ? '#FFFFFF' : '#333333', fontWeight: solicitacao.status === key ? '700' : '500' }]}>
                    {statusConfig[key].label}
                  </Text>
                  {solicitacao.status === key && (
                    <Ionicons name="checkmark-circle" size={20} color={primaryColor} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
  fixedHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 30,
  },
  headerTitleContainer: {
    flex: 1,
    marginTop: 25,
  },
  headerMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 50,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  petAvatar: {
    width: 84,
    height: 84,
    borderRadius: 20,
  },
  petHeaderDetails: {
    flex: 1,
    gap: 6,
  },
  petNameText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requestedByText: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickInfoBox: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  adotanteRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  adotanteImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  adotanteName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  adotanteContact: {
    fontSize: 13,
    marginTop: 2,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  questionInnerCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    gap: 6,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  answerText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricContainer: {
    marginBottom: 14,
    gap: 6,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarText: {
    fontFamily: 'monospace',
    fontSize: 15,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  timelineWrapper: {
    paddingLeft: 8,
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 14,
    minHeight: 46,
  },
  timelineLeftColumn: {
    alignItems: 'center',
  },
  timelineNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  timelineTitleText: {
    fontSize: 14,
  },
  textArea: {
    borderRadius: 16,
    padding: 14,
    height: 90,
    textAlignVertical: 'top',
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  sectionTitleLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionGridButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  actionGridButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryActionFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 8,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 2,
  },
  primaryActionFullButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  decisionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  decisionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionsContainer: {
    gap: 12,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 14,
  },
  modalOptionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionLabel: {
    fontSize: 15,
  },
});