import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import api from '../src/service/api';

const profileImageReadonly = require('@/assets/images/perfil.png');
const logoAppReadonly = require('@/assets/images/LogoPataAzul.png');

type OngBanco = {
  id?: number;
  idong?: number;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  descricao?: string | null;
  foto?: string | null;
  idendereco?: number | null;
  fk_idendereco?: number | null;
  rua?: string | null;
  numero?: string | number | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  complemento?: string | null;
  sigla?: string | null;
  tipo?: string | null;
  estado?: {
    sigla?: string | null;
  } | null;
  endereco?: {
    rua?: string | null;
    numero?: string | number | null;
    bairro?: string | null;
    cidade?: string | null;
    cep?: string | null;
    complemento?: string | null;
    estado?: string | null;
  } | null;
};

type UsuarioSessaoBanco = {
  id?: number;
  idusuario?: number;
};

type PerfilOngView = {
  id: number | null;
  nome: string;
  email: string;
  telefone: string;
  descricao: string;
  foto: string | null;
  tipo: string;
  endereco: {
    cidade: string;
    estado: string;
    bairro: string;
    rua: string;
    numero: string;
    cep: string;
    complemento: string;
  };
};

const vazio = 'Nao informado';

function normalizarOngBanco(data: unknown): OngBanco | null {
  if (Array.isArray(data)) {
    return (data[0] as OngBanco) || null;
  }

  if (data && typeof data === 'object' && 'data' in data) {
    const resposta = data as { data?: OngBanco | OngBanco[] };
    return normalizarOngBanco(resposta.data);
  }

  if (data && typeof data === 'object') {
    return data as OngBanco;
  }

  return null;
}

function montarPerfilOng(ong: OngBanco): PerfilOngView {
  const endereco = ong.endereco || {};
  const id = Number(ong.idong || ong.id);

  return {
    id: Number.isFinite(id) && id > 0 ? id : null,
    nome: ong.nome || vazio,
    email: ong.email || vazio,
    telefone: ong.telefone || vazio,
    descricao: ong.descricao || vazio,
    foto: ong.foto || null,
    tipo: ong.tipo || 'ONG',
    endereco: {
      cidade: endereco.cidade || ong.cidade || vazio,
      estado: ong.estado?.sigla || ong.sigla || endereco.estado || vazio,
      bairro: endereco.bairro || ong.bairro || vazio,
      rua: endereco.rua || ong.rua || vazio,
      numero: String(endereco.numero || ong.numero || vazio),
      cep: endereco.cep || ong.cep || vazio,
      complemento: endereco.complemento || ong.complemento || vazio,
    },
  };
}

export default function PerfilONG() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  const [perfil, setPerfil] = useState<PerfilOngView | null>(null);
  const [totalPets, setTotalPets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarPerfilOng();
  }, []);

  async function descobrirIdOngNoBanco() {
    const usuarioSalvo = await AsyncStorage.getItem('usuario');

    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo) as UsuarioSessaoBanco;
      const idUsuario = Number(usuario.id || usuario.idusuario);

      if (Number.isFinite(idUsuario) && idUsuario > 0) {
        try {
          const response = await api.get(`/ongs/verificarOng/${idUsuario}`);
          const idBanco = Number(response.data?.conta?.fk_idong);

          if (Number.isFinite(idBanco) && idBanco > 0) {
            return idBanco;
          }
        } catch (error) {
          // Se o usuario nao tiver vinculo pela rota, tenta o id salvo da ONG.
        }
      }
    }

    const ongSalva = await AsyncStorage.getItem('ong');

    if (!ongSalva) {
      return null;
    }

    const ongSessao = JSON.parse(ongSalva) as OngBanco;
    const idSessao = Number(ongSessao.idong || ongSessao.id);

    return Number.isFinite(idSessao) && idSessao > 0 ? idSessao : null;
  }

  async function carregarTotalPets(idOng: number) {
    try {
      const response = await api.get(`/ongs/contar/${idOng}`);
      const total = Number(response.data?.total ?? response.data);
      setTotalPets(Number.isFinite(total) ? total : 0);
    } catch (error) {
      setTotalPets(0);
    }
  }

  async function carregarPerfilOng() {
    try {
      setLoading(true);
      setErro('');

      const idOng = await descobrirIdOngNoBanco();

      if (!idOng) {
        setPerfil(null);
        setErro('Nao foi possivel identificar uma ONG vinculada a esta conta.');
        return;
      }

      const response = await api.get(`/ongs/${idOng}`);
      const ongBanco = normalizarOngBanco(response.data);

      if (!ongBanco) {
        setPerfil(null);
        setErro('ONG nao encontrada no banco.');
        return;
      }

      setPerfil(montarPerfilOng(ongBanco));
      await carregarTotalPets(idOng);
    } catch (error) {
      const erroApi = error as {
        response?: { data?: { message?: string; erro?: string } };
        message?: string;
      };

      setPerfil(null);
      setErro(
        erroApi.response?.data?.message ||
        erroApi.response?.data?.erro ||
        erroApi.message ||
        'Nao foi possivel carregar os dados da ONG.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function sairDaConta() {
    await AsyncStorage.multiRemove(['usuario', 'token', 'ong', 'fotoPerfilONG']);
    router.replace('/login');
  }

  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#0E457D';
  const mutedColor = isDark ? '#BBBBBB' : '#666666';
  const borderColor = isDark ? '#303030' : '#E6ECF2';

  const detalhes = perfil
    ? [
        { label: 'Nome da ONG', value: perfil.nome, icon: 'office-building-outline' },
        { label: 'E-mail', value: perfil.email, icon: 'email-outline' },
        { label: 'Telefone', value: perfil.telefone, icon: 'phone-outline' },
        { label: 'Descricao', value: perfil.descricao, icon: 'text-box-outline' },
        { label: 'Cidade', value: perfil.endereco.cidade, icon: 'map-marker-outline' },
        { label: 'Estado', value: perfil.endereco.estado, icon: 'map-outline' },
        { label: 'Bairro', value: perfil.endereco.bairro, icon: 'home-map-marker' },
        { label: 'Rua', value: perfil.endereco.rua, icon: 'road-variant' },
        { label: 'Numero', value: perfil.endereco.numero, icon: 'numeric' },
        { label: 'CEP', value: perfil.endereco.cep, icon: 'map-marker-distance' },
        { label: 'Complemento', value: perfil.endereco.complemento, icon: 'information-outline' },
      ]
    : [];

  return (
    <SafeAreaView
      style={[
        readonlyStyles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#F4F7FB' },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={readonlyStyles.container}
      >
        <View style={readonlyStyles.header}>
          <Image source={logoAppReadonly} style={readonlyStyles.logo} />
        </View>

        {loading ? (
          <View style={[readonlyStyles.stateCard, { backgroundColor: cardColor }]}>
            <ActivityIndicator color="#FF42B3" size="large" />
            <Text style={[readonlyStyles.stateText, { color: mutedColor }]}>
              Carregando dados da ONG no banco...
            </Text>
          </View>
        ) : erro ? (
          <View style={[readonlyStyles.stateCard, { backgroundColor: cardColor }]}>
            <Icon name="alert-circle-outline" size={36} color="#FF42B3" />
            <Text style={[readonlyStyles.stateTitle, { color: textColor }]}>
              Perfil indisponivel
            </Text>
            <Text style={[readonlyStyles.stateText, { color: mutedColor }]}>
              {erro}
            </Text>
            <TouchableOpacity style={readonlyStyles.primaryButton} onPress={carregarPerfilOng}>
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={readonlyStyles.primaryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : perfil ? (
          <>
            <View style={[readonlyStyles.profileCard, { backgroundColor: cardColor }]}>
              <Image
                source={perfil.foto ? { uri: perfil.foto } : profileImageReadonly}
                style={readonlyStyles.profilePhoto}
              />

              <View style={readonlyStyles.verifiedBadge}>
                <Icon name="shield-check" size={16} color="#FFFFFF" />
                <Text style={readonlyStyles.verifiedText}>ONG cadastrada</Text>
              </View>

              <Text style={[readonlyStyles.profileName, { color: textColor }]}>
                {perfil.nome}
              </Text>

              <Text style={[readonlyStyles.profileEmail, { color: mutedColor }]}>
                {perfil.email}
              </Text>

              <View style={readonlyStyles.infoTagsContainer}>
                <View style={readonlyStyles.infoTag}>
                  <Icon name="map-marker-outline" size={16} color="#FF42B3" />
                  <Text style={readonlyStyles.infoTagText}>
                    {perfil.endereco.cidade}
                  </Text>
                </View>

                <View style={readonlyStyles.infoTag}>
                  <Icon name="paw-outline" size={16} color="#FF42B3" />
                  <Text style={readonlyStyles.infoTagText}>
                    {perfil.tipo}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[readonlyStyles.statsCard, { backgroundColor: cardColor }]}>
              <Icon name="paw" size={26} color="#FF42B3" />
              <View>
                <Text style={[readonlyStyles.statNumber, { color: textColor }]}>
                  {totalPets}
                </Text>
                <Text style={[readonlyStyles.statLabel, { color: mutedColor }]}>
                  Pets cadastrados no banco
                </Text>
              </View>
            </View>

            <View style={[readonlyStyles.infoCard, { backgroundColor: cardColor }]}>
              <Text style={[readonlyStyles.sectionTitle, { color: textColor }]}>
                Informacoes da ONG
              </Text>

              {detalhes.map((item, index) => (
                <View key={item.label}>
                  <View style={readonlyStyles.fieldItem}>
                    <Icon name={item.icon as any} size={22} color="#FF42B3" />
                    <View style={readonlyStyles.fieldTextBox}>
                      <Text style={[readonlyStyles.fieldLabel, { color: mutedColor }]}>
                        {item.label}
                      </Text>
                      <Text style={[readonlyStyles.fieldValue, { color: isDark ? '#FFFFFF' : '#111111' }]}>
                        {item.value}
                      </Text>
                    </View>
                  </View>

                  {index !== detalhes.length - 1 ? (
                    <View style={[readonlyStyles.divider, { backgroundColor: borderColor }]} />
                  ) : null}
                </View>
              ))}
            </View>

            <View style={[readonlyStyles.settingsCard, { backgroundColor: cardColor }]}>
              <TouchableOpacity
                style={readonlyStyles.settingItem}
                onPress={() => router.push('/quests')}
              >
                <View style={readonlyStyles.settingLeft}>
                  <Icon name="help-circle-outline" size={24} color="#FF42B3" />
                  <Text style={[readonlyStyles.settingText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Perguntas frequentes
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#999999" />
              </TouchableOpacity>

              <View style={[readonlyStyles.divider, { backgroundColor: borderColor }]} />

              <View style={readonlyStyles.settingItem}>
                <View style={readonlyStyles.settingLeft}>
                  <Icon
                    name={isDark ? 'weather-night' : 'weather-sunny'}
                    size={24}
                    color="#FF42B3"
                  />
                  <Text style={[readonlyStyles.settingText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Modo escuro
                  </Text>
                </View>

                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#B0BEC5', true: '#FF42B3' }}
                />
              </View>
            </View>

            <TouchableOpacity style={readonlyStyles.logoutButton} onPress={sairDaConta}>
              <Icon name="logout" size={20} color="#FFFFFF" />
              <Text style={readonlyStyles.logoutButtonText}>Sair da conta</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>

      <BottomNav isDark={isDark} activePage="perfil" />
    </SafeAreaView>
  );
}

const readonlyStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingBottom: 140,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 40,
  },
  logo: {
    height: 90,
    width: 200,
  },
  stateCard: {
    alignItems: 'center',
    borderRadius: 22,
    marginTop: 18,
    padding: 26,
    width: '90%',
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 14,
    textAlign: 'center',
  },
  stateText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0E457D',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 24,
    elevation: 5,
    marginTop: 15,
    paddingVertical: 30,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: '90%',
  },
  profilePhoto: {
    borderColor: '#FF42B3',
    borderRadius: 65,
    borderWidth: 4,
    height: 130,
    width: 130,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: '#0E457D',
    borderRadius: 50,
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 18,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 15,
    marginTop: 5,
  },
  infoTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 18,
  },
  infoTag: {
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoTagText: {
    color: '#0E457D',
    fontSize: 13,
    fontWeight: '600',
  },
  statsCard: {
    alignItems: 'center',
    borderRadius: 22,
    elevation: 4,
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: '90%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  infoCard: {
    borderRadius: 24,
    elevation: 5,
    marginTop: 25,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: '90%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  fieldItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
  },
  fieldTextBox: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 18,
    width: '100%',
  },
  settingsCard: {
    borderRadius: 24,
    elevation: 5,
    marginTop: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: '90%',
  },
  settingItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#0E457D',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    height: 58,
    justifyContent: 'center',
    marginTop: 25,
    width: '90%',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

/*
Codigo antigo comentado a pedido do usuario. A nova versao acima remove funcoes,
botoes e entradas de alteracao de dados, e renderiza somente informacoes reais
buscadas na API.

import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  TextInput,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import * as ImagePicker from 'expo-image-picker';
import api from '../src/service/api';

const profileImage = require('@/assets/images/perfil.png');
const logoApp = require('@/assets/images/LogoPataAzul.png');

type ONGPerfil = {
  id?: number;
  idong?: number;
  id_responsavel?: number | null;
  fk_idresponsavel?: number | null;
  nome?: string;
  email?: string;
  telefone?: string;
  descricao?: string;
  foto?: string | null;
  banner?: string | null;
  idendereco?: number;
  fk_idendereco?: number;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  complemento?: string;
  sigla?: string;
  tipo?: string;
  estado?: {
    sigla?: string;
  };
  endereco?: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    cep?: string;
    complemento?: string;
    estado?: string;
  };
};

type UsuarioSessao = {
  id?: number;
  idusuario?: number;
};

type IdResponse = {
  id?: number;
  message?: string;
};

const PerfilONG = () => {

  const router = useRouter();

  const { theme, toggleTheme } = useThemeContext();

  const isDark = theme === 'dark';

  const [ongId, setOngId] = useState<number | null>(null);
  const [fkIdEndereco, setFkIdEndereco] = useState<number | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');
  const [categoria, setCategoria] = useState('');

  const [totalPets, setTotalPets] = useState(0);
  const [loadingPerfil, setLoadingPerfil] = useState(true);

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  const [editingField, setEditingField] = useState('');
  const [tempValue, setTempValue] = useState('');

  const [modalVisible, setModalVisible] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmoji, setFeedbackEmoji] = useState('🐾');

  const [feedbackAction, setFeedbackAction] = useState<
    'save' | 'logout' | 'delete' | 'deleted' | null
  >(null);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    carregarONG();
  }, []);

  useEffect(() => {

    if (feedbackVisible) {

      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),

        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),

      ]).start();
    }

  }, [feedbackVisible]);

  function abrirFeedback(
    emoji: string,
    title: string,
    message: string,
    action: 'save' | 'logout' | 'delete' | 'deleted' | null = 'save'
  ) {
    setFeedbackEmoji(emoji);
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackAction(action);
    setFeedbackVisible(true);
  }

  function obterMensagemErro(error: unknown) {
    const erro = error as {
      response?: { data?: { message?: string; erro?: string } };
      message?: string;
    };

    return (
      erro.response?.data?.message ||
      erro.response?.data?.erro ||
      erro.message ||
      'Nao foi possivel concluir a operacao.'
    );
  }

  function normalizarOng(data: unknown): ONGPerfil | null {
    if (Array.isArray(data)) {
      return (data[0] as ONGPerfil) || null;
    }

    if (data && typeof data === 'object' && 'data' in data) {
      const resposta = data as { data?: ONGPerfil | ONGPerfil[] };
      return normalizarOng(resposta.data);
    }

    return (data as ONGPerfil) || null;
  }

  function preencherOng(ong: ONGPerfil) {
    const id = Number(ong.idong || ong.id);
    const endereco = ong.endereco || {};
    const siglaEstado = ong.estado?.sigla || ong.sigla || endereco.estado || '';

    setOngId(Number.isFinite(id) ? id : null);
    setFkIdEndereco(Number(ong.fk_idendereco || ong.idendereco) || null);
    setNome(ong.nome || '');
    setEmail(ong.email || '');
    setTelefone(ong.telefone || '');
    setDescricao(ong.descricao || '');
    setFotoPerfil(ong.foto || null);
    setCidade(endereco.cidade || ong.cidade || '');
    setEstado(siglaEstado);
    setBairro(endereco.bairro || ong.bairro || '');
    setRua(endereco.rua || ong.rua || '');
    setNumero(endereco.numero || ong.numero || '');
    setCep(endereco.cep || ong.cep || '');
    setComplemento(endereco.complemento || ong.complemento || '');
    setCategoria(ong.tipo || 'ONG');
  }

  async function carregarTotalPets(id: number) {
    try {
      const response = await api.get(`/ongs/contar/${id}`);
      const total = Number(response.data?.total ?? response.data);

      setTotalPets(Number.isFinite(total) ? total : 0);
    } catch (error) {
      setTotalPets(0);
    }
  }

  async function descobrirIdOng() {
    const [ongSalva, usuarioSalvo] = await Promise.all([
      AsyncStorage.getItem('ong'),
      AsyncStorage.getItem('usuario')
    ]);

    if (ongSalva) {
      const ongSessao = JSON.parse(ongSalva) as ONGPerfil;
      const idSessao = Number(ongSessao.idong || ongSessao.id);

      if (Number.isFinite(idSessao) && idSessao > 0) {
        return idSessao;
      }
    }

    if (!usuarioSalvo) {
      return null;
    }

    const usuario = JSON.parse(usuarioSalvo) as UsuarioSessao;
    const idUsuario = Number(usuario.id || usuario.idusuario);

    if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
      return null;
    }

    const response = await api.get(`/ongs/verificarOng/${idUsuario}`);
    const idBanco = Number(response.data?.conta?.fk_idong);

    return Number.isFinite(idBanco) && idBanco > 0 ? idBanco : null;
  }

  async function carregarONG() {
    try {
      setLoadingPerfil(true);

      const id = await descobrirIdOng();

      if (!id) {
        abrirFeedback(
          '!',
          'ONG nao encontrada',
          'Nao foi possivel identificar uma ONG vinculada a sua conta.',
          'save'
        );
        return;
      }

      const response = await api.get(`/ongs/${id}`);
      const ong = normalizarOng(response.data);

      if (!ong) {
        throw new Error('ONG nao encontrada no banco.');
      }

      preencherOng(ong);
      await carregarTotalPets(id);
    } catch (error) {
      abrirFeedback(
        '!',
        'Erro ao carregar ONG',
        obterMensagemErro(error),
        'save'
      );
    } finally {
      setLoadingPerfil(false);
    }
  }

  async function alterarFotoPerfil() {

    if (!ongId) {
      abrirFeedback(
        '!',
        'ONG nao carregada',
        'Carregue o perfil da ONG antes de alterar a foto.'
      );
      return;
    }

    const permissao =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {

      abrirFeedback(
        '!',
        'Permissao necessaria',
        'Precisamos da permissao para acessar suas fotos.'
      );

      return;
    }

    const resultado =
      await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        allowsEditing: true,

        aspect: [1, 1],

        quality: 1,
      });

    if (resultado.canceled) {
      return;
    }

    const novaFoto = resultado.assets[0].uri;
    const nomeArquivo = novaFoto.split('/').pop() || `ong-${ongId}.jpg`;
    const extensao = nomeArquivo.split('.').pop()?.toLowerCase() || 'jpg';
    const tipoArquivo =
      resultado.assets[0].mimeType ||
      `image/${extensao === 'jpg' ? 'jpeg' : extensao}`;

    const formData = new FormData();

    formData.append('foto', {
      uri: novaFoto,
      name: nomeArquivo,
      type: tipoArquivo,
    } as any);

    try {
      const response = await api.patch(
        `/ongs/foto/${ongId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setFotoPerfil(response.data?.path || novaFoto);

      abrirFeedback(
        'OK',
        'Foto atualizada',
        'A foto institucional da ONG foi salva no banco.'
      );
    } catch (error) {
      abrirFeedback(
        '!',
        'Erro ao atualizar foto',
        obterMensagemErro(error)
      );
    }
  }

  function openEditModal(field: string, currentValue: string) {

    setEditingField(field);
    setTempValue(currentValue);
    setModalVisible(true);
  }

  function extrairId(resposta: IdResponse, nomeEntidade: string) {
    const id = Number(resposta.id);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(`Nao foi possivel criar ${nomeEntidade}.`);
    }

    return id;
  }

  function separarCidadeEstado(valor: string) {
    const partes = valor.split('-');
    const cidadeNova = partes[0]?.trim() || '';
    const estadoNovo = partes[1]?.trim().toUpperCase() || estado.trim().toUpperCase();

    return { cidadeNova, estadoNovo };
  }

  async function criarEnderecoParaCidade(cidadeNova: string, estadoNovo: string) {
    if (!cidadeNova || !estadoNovo || !bairro || !rua || !numero || !cep) {
      throw new Error('Endereco da ONG incompleto para alterar a cidade.');
    }

    const estadoResponse = await api.post<IdResponse>('/estados', {
      sigla: estadoNovo,
      estado: estadoNovo
    });
    const idEstado = extrairId(estadoResponse.data, 'o estado');

    const cidadeResponse = await api.post<IdResponse>('/cidades', {
      cidade: cidadeNova,
      fk_idestado: idEstado
    });
    const idCidade = extrairId(cidadeResponse.data, 'a cidade');

    const bairroResponse = await api.post<IdResponse>('/bairros', {
      bairro,
      fk_idcidade: idCidade
    });
    const idBairro = extrairId(bairroResponse.data, 'o bairro');

    const ruaResponse = await api.post<IdResponse>('/ruas', {
      rua,
      fk_idbairro: idBairro
    });
    const idRua = extrairId(ruaResponse.data, 'a rua');

    const enderecoResponse = await api.post<IdResponse>('/enderecos', {
      fk_idcidade: idCidade,
      fk_idbairro: idBairro,
      fk_idrua: idRua,
      fk_idestado: idEstado,
      numero,
      cep,
      complemento
    });

    return extrairId(enderecoResponse.data, 'o endereco');
  }

  async function saveEdit() {
    if (!ongId) {
      abrirFeedback(
        '!',
        'ONG nao carregada',
        'Carregue o perfil da ONG antes de alterar os dados.'
      );
      return;
    }

    const valor = tempValue.trim();
    const payload: {
      nome?: string;
      email?: string;
      telefone?: string;
      descricao?: string;
      fk_idendereco?: number;
    } = {};

    try {
      switch (editingField) {
        case 'nome':
          payload.nome = valor;
          break;

        case 'email':
          payload.email = valor.toLowerCase();
          break;

        case 'telefone':
          payload.telefone = valor;
          break;

        case 'descricao':
          payload.descricao = valor;
          break;

        case 'cidade': {
          const { cidadeNova, estadoNovo } = separarCidadeEstado(valor);
          payload.fk_idendereco = await criarEnderecoParaCidade(cidadeNova, estadoNovo);
          break;
        }

        default:
          throw new Error('Campo invalido para edicao.');
      }

      await api.put(`/ongs/${ongId}`, payload);
      setModalVisible(false);
      await carregarONG();

      abrirFeedback(
        'OK',
        'Informacoes atualizadas',
        'Os dados da ONG foram salvos no banco.'
      );
    } catch (error) {
      abrirFeedback(
        '!',
        'Erro ao salvar',
        obterMensagemErro(error)
      );
    }
  }

  function logout() {

    setFeedbackEmoji('👋');

    setFeedbackTitle('Sessão encerrada');

    setFeedbackMessage(
      'Você saiu da conta da ONG com sucesso.'
    );

    setFeedbackAction('logout');

    setFeedbackVisible(true);
  }

  async function confirmarLogout() {

    await AsyncStorage.multiRemove([
      'usuario',
      'token',
      'ong',
      'fotoPerfilONG'
    ]);

    router.replace('/login');
  }

  function excluirConta() {

    setFeedbackEmoji('⚠️');

    setFeedbackTitle('Excluir conta');

    setFeedbackMessage(
      'Tem certeza que deseja excluir a conta da ONG? Essa ação não poderá ser desfeita.'
    );

    setFeedbackAction('delete');

    setFeedbackVisible(true);
  }

  async function confirmarExclusao() {

    await AsyncStorage.multiRemove([
      'usuario',
      'token',
      'ong',
      'fotoPerfilONG'
    ]);

    setFeedbackEmoji('🗑️');

    setFeedbackTitle('Conta excluída');

    setFeedbackMessage(
      'A conta da ONG foi excluída com sucesso.'
    );

    setFeedbackAction('deleted');
  }

  function getFieldTitle() {

    switch (editingField) {

      case 'nome':
        return 'Editar nome da ONG';

      case 'email':
        return 'Editar e-mail';

      case 'telefone':
        return 'Editar telefone';

      case 'cidade':
        return 'Editar cidade';

      case 'instagram':
        return 'Editar Instagram';

      case 'horario':
        return 'Editar horário';

      default:
        return '';
    }
  }

  return (

    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark
            ? '#121212'
            : '#F4F7FB'
        },
      ]}
    >

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: isDark
                  ? '#1E1E1E'
                  : '#FFFFFF'
              }
            ]}
          >

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >

              <Icon
                name="close"
                size={24}
                color={isDark ? '#FFFFFF' : '#0E457D'}
              />

            </TouchableOpacity>

            <Text
              style={[
                styles.modalTitle,
                {
                  color: isDark
                    ? '#FFFFFF'
                    : '#0E457D'
                }
              ]}
            >
              {getFieldTitle()}
            </Text>

            <TextInput
              value={tempValue}
              onChangeText={setTempValue}
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark
                    ? '#2A2A2A'
                    : '#F1F5F4',

                  color: isDark
                    ? '#FFFFFF'
                    : '#000000'
                }
              ]}
            />

            <TouchableOpacity
              style={styles.saveButtonFull}
              onPress={saveEdit}
            >
              <Text style={styles.saveButtonText}>
                Salvar alterações
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={feedbackVisible}
      >

        <View style={styles.modalOverlay}>

          <Animated.View
            style={[
              styles.feedbackContainer,
              {
                backgroundColor: isDark
                  ? '#1E1E1E'
                  : '#FFFFFF',

                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >

            <Text style={styles.feedbackEmoji}>
              {feedbackEmoji}
            </Text>

            <Text
              style={[
                styles.feedbackTitle,
                {
                  color: isDark
                    ? '#FFFFFF'
                    : '#0E457D'
                }
              ]}
            >
              {feedbackTitle}
            </Text>

            <Text
              style={[
                styles.feedbackMessage,
                {
                  color: isDark
                    ? '#CCCCCC'
                    : '#555555'
                }
              ]}
            >
              {feedbackMessage}
            </Text>

            {
              feedbackAction === 'delete'
                ? (
                  <View style={styles.feedbackButtons}>

                    <TouchableOpacity
                      style={styles.cancelDeleteButton}
                      onPress={() =>
                        setFeedbackVisible(false)
                      }
                    >
                      <Text style={styles.cancelDeleteText}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmDeleteButton}
                      onPress={confirmarExclusao}
                    >
                      <Text style={styles.confirmDeleteText}>
                        Excluir
                      </Text>
                    </TouchableOpacity>

                  </View>
                )
                : (
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={async () => {

                      setFeedbackVisible(false);

                      if (feedbackAction === 'logout') {
                        await confirmarLogout();
                      }

                      if (feedbackAction === 'deleted') {
                        router.replace('/login');
                      }
                    }}
                  >
                    <Text style={styles.feedbackButtonText}>
                      Entendi
                    </Text>
                  </TouchableOpacity>
                )
            }

          </Animated.View>

        </View>

      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: isDark
              ? '#121212'
              : '#F4F7FB'
          },
        ]}
      >

        <View style={styles.header}>

          <Image
            source={logoApp}
            style={styles.logo}
          />

        </View>

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark
                ? '#1E1E1E'
                : '#FFFFFF'
            }
          ]}
        >

          <View style={styles.photoContainer}>

            <Image
              source={
                fotoPerfil
                  ? { uri: fotoPerfil }
                  : profileImage
              }
              style={styles.profilePhoto}
            />

            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={alterarFotoPerfil}
            >

              <Icon
                name="camera"
                size={20}
                color="#FFFFFF"
              />

            </TouchableOpacity>

          </View>

          <View style={styles.verifiedBadge}>

            <Icon
              name="shield-check"
              size={16}
              color="#FFFFFF"
            />

            <Text style={styles.verifiedText}>
              ONG verificada
            </Text>

          </View>

          <Text
            style={[
              styles.profileName,
              {
                color: isDark
                  ? '#FFFFFF'
                  : '#0E457D'
              }
            ]}
          >
            {nome}
          </Text>

          <Text
            style={[
              styles.profileEmail,
              {
                color: isDark
                  ? '#BBBBBB'
                  : '#666666'
              }
            ]}
          >
            {email}
          </Text>

          <View style={styles.infoTagsContainer}>

            <View style={styles.infoTag}>

              <Icon
                name="map-marker-outline"
                size={16}
                color="#FF42B3"
              />

              <Text style={styles.infoTagText}>
                {cidade}
              </Text>

            </View>

            <View style={styles.infoTag}>

              <Icon
                name="paw-outline"
                size={16}
                color="#FF42B3"
              />

              <Text style={styles.infoTagText}>
                {categoria}
              </Text>

            </View>

          </View>

        </View>

        <View style={styles.statsContainer}>

          {[
            {
              icon: 'paw',
              title: 'Pets',
              value: '18'
            },
            {
              icon: 'heart',
              title: 'Adoções',
              value: '42'
            },
            {
              icon: 'file-document',
              title: 'Pendentes',
              value: '7'
            }
          ].map((item, index) => (

            <View
              key={index}
              style={[
                styles.statCard,
                {
                  backgroundColor: isDark
                    ? '#1E1E1E'
                    : '#FFFFFF'
                }
              ]}
            >

              <Icon
                name={item.icon as any}
                size={24}
                color="#FF42B3"
              />

              <Text
                style={[
                  styles.statNumber,
                  {
                    color: isDark
                      ? '#FFFFFF'
                      : '#0E457D'
                  }
                ]}
              >
                {item.value}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark
                      ? '#BBBBBB'
                      : '#666666'
                  }
                ]}
              >
                {item.title}
              </Text>

            </View>

          ))}

        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark
                ? '#1E1E1E'
                : '#FFFFFF'
            }
          ]}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? '#FFFFFF'
                  : '#0E457D'
              }
            ]}
          >
            Informações da ONG
          </Text>

          {[
            { label: 'Nome da ONG', value: nome, field: 'nome' },
            { label: 'E-mail', value: email, field: 'email' },
            { label: 'Telefone', value: telefone, field: 'telefone' },
            { label: 'Cidade', value: cidade, field: 'cidade' },
            { label: 'Instagram', value: instagram, field: 'instagram' },
            { label: 'Funcionamento', value: horario, field: 'horario' },
          ].map((item, index) => (

            <View key={index}>

              <View style={styles.fieldItem}>

                <View style={{ flex: 1 }}>

                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? '#BDBDBD'
                          : '#666'
                      }
                    ]}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={[
                      styles.fieldValue,
                      {
                        color: isDark
                          ? '#FFFFFF'
                          : '#000000'
                      }
                    ]}
                  >
                    {item.value}
                  </Text>

                </View>

                <TouchableOpacity
                  onPress={() =>
                    openEditModal(item.field, item.value)
                  }
                >

                  <Icon
                    name="square-edit-outline"
                    size={22}
                    color="#FF42B3"
                  />

                </TouchableOpacity>

              </View>

              {
                index !== 5 &&
                <View style={styles.divider} />
              }

            </View>

          ))}

        </View>

        <TouchableOpacity
          style={[
            styles.requestCard,
            {
              backgroundColor: isDark
                ? '#1B2330'
                : '#EDF5FF'
            }
          ]}
          onPress={() => router.push('/solicitacoesAdocao')}
          activeOpacity={0.85}
        >

          <View style={styles.requestLeft}>

            <View style={styles.requestIconContainer}>

              <Icon
                name="file-document-outline"
                size={28}
                color="#FFFFFF"
              />

            </View>

            <View style={{ flex: 1 }}>

              <View style={styles.requestTitleRow}>

                <Text
                  style={[
                    styles.requestTitle,
                    {
                      color: isDark
                        ? '#FFFFFF'
                        : '#0E457D'
                    }
                  ]}
                >
                  Solicitações de adoção
                </Text>

                <View style={styles.badge}>

                  <Text style={styles.badgeText}>
                    7
                  </Text>

                </View>

              </View>

              <Text
                style={[
                  styles.requestSubtitle,
                  {
                    color: isDark
                      ? '#CCCCCC'
                      : '#5E6B78'
                  }
                ]}
              >
                Analise e acompanhe pedidos recebidos
              </Text>

            </View>

          </View>

          <Icon
            name="chevron-right"
            size={30}
            color="#999"
          />

        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.fullEditCard,
            {
              backgroundColor: isDark
                ? '#1E1E1E'
                : '#FFFFFF'
            }
          ]}
          onPress={() => router.push('/perfilONG')}
          activeOpacity={0.8}
        >

          <View style={styles.fullEditLeft}>

            <View style={styles.fullEditIconContainer}>

              <Icon
                name="account-edit-outline"
                size={26}
                color="#FFFFFF"
              />

            </View>

            <View>

              <Text
                style={[
                  styles.fullEditTitle,
                  {
                    color: isDark
                      ? '#FFFFFF'
                      : '#0E457D'
                  }
                ]}
              >
                Editar perfil completo
              </Text>

              <Text
                style={[
                  styles.fullEditSubtitle,
                  {
                    color: isDark
                      ? '#BBBBBB'
                      : '#666666'
                  }
                ]}
              >
                Acesse documentos, endereço e informações completas
              </Text>

            </View>

          </View>

          <Icon
            name="chevron-right"
            size={28}
            color="#999"
          />

        </TouchableOpacity>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: isDark
                ? '#1E1E1E'
                : '#FFFFFF'
            }
          ]}
        >

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/quests')}
          >

            <View style={styles.settingLeft}>

              <Icon
                name="help-circle-outline"
                size={24}
                color="#FF42B3"
              />

              <Text
                style={[
                  styles.settingText,
                  {
                    color: isDark
                      ? '#FFFFFF'
                      : '#000000'
                  }
                ]}
              >
                Perguntas frequentes
              </Text>

            </View>

            <Icon
              name="chevron-right"
              size={24}
              color="#999"
            />

          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingItem}>

            <View style={styles.settingLeft}>

              <Icon
                name={isDark
                  ? 'weather-night'
                  : 'weather-sunny'}
                size={24}
                color="#FF42B3"
              />

              <Text
                style={[
                  styles.settingText,
                  {
                    color: isDark
                      ? '#FFFFFF'
                      : '#000000'
                  }
                ]}
              >
                Modo escuro
              </Text>

            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor="#FFFFFF"
              trackColor={{
                false: '#B0BEC5',
                true: '#FF42B3'
              }}
            />

          </View>

        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >

          <Icon
            name="logout"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.deleteButtonText}>
            Sair da conta
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={excluirConta}
        >

          <Icon
            name="delete-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.deleteButtonText}>
            Excluir conta
          </Text>

        </TouchableOpacity>

      </ScrollView>

      <BottomNav
        isDark={isDark}
        activePage="perfil"
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
  },

  container: {
    paddingBottom: 140,
    alignItems: 'center',
  },

  header: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center',
  },

  logo: {
    width: 200,
    height: 90,
  },

  profileCard: {
    width: '90%',
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  photoContainer: {
    position: 'relative',
  },

  profilePhoto: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#FF42B3',
  },

  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF42B3',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifiedBadge: {
    marginTop: 18,
    backgroundColor: '#0E457D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  verifiedText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },

  profileName: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  profileEmail: {
    marginTop: 5,
    fontSize: 15,
  },

  infoTagsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  infoTag: {
    backgroundColor: '#F4F7FB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  infoTagText: {
    fontSize: 13,
    color: '#0E457D',
    fontWeight: '600',
  },

  statsContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  statCard: {
    width: '31%',
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  statNumber: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
  },

  infoCard: {
    width: '90%',
    borderRadius: 28,
    marginTop: 25,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fieldLabel: {
    fontSize: 13,
    marginBottom: 4,
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 18,
  },

  requestCard: {
    width: '90%',
    borderRadius: 28,
    marginTop: 22,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6E7FF',
    shadowColor: '#0E457D',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  requestIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0E457D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  requestSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
  },

  badge: {
    backgroundColor: '#FF42B3',
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  fullEditCard: {
    width: '90%',
    borderRadius: 28,
    marginTop: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  fullEditLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  fullEditIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF42B3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  fullEditTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  fullEditSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    width: '92%',
  },

  settingsCard: {
    width: '90%',
    borderRadius: 28,
    marginTop: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },

  logoutButton: {
    width: '90%',
    height: 58,
    backgroundColor: '#0E457D',
    borderRadius: 18,
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  deleteButton: {
    width: '90%',
    height: 58,
    backgroundColor: '#FF3B3B',
    borderRadius: 18,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  modalContainer: {
    width: '100%',
    borderRadius: 25,
    padding: 25,
  },

  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  modalInput: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },

  saveButtonFull: {
    backgroundColor: '#FF42B3',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  feedbackContainer: {
    width: '85%',
    borderRadius: 28,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },

  feedbackEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },

  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  feedbackMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },

  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  cancelDeleteButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelDeleteText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },

  confirmDeleteButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FF3B3B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  feedbackButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0E457D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  feedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerfilONG;
*/
