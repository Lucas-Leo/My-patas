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
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import * as ImagePicker from 'expo-image-picker';

const profileImage = require('@/assets/images/perfil.png');
const logoApp = require('@/assets/images/LogoPataAzul.png');

type ONGPerfil = {
  nome?: string;
  email?: string;
  telefone?: string;
  instagram?: string;
  horario?: string;
  categoria?: string;
  endereco?: {
    cidade?: string;
  };
};

const PerfilONG = () => {

  const router = useRouter();

  const { theme, toggleTheme } = useThemeContext();

  const isDark = theme === 'dark';

  const [nome, setNome] = useState('Instituto Patinhas Felizes');
  const [email, setEmail] = useState('contato@patinhas.org');
  const [telefone, setTelefone] = useState('(16) 99999-9999');
  const [cidade, setCidade] = useState('Matão - SP');
  const [instagram, setInstagram] = useState('@patinhasfelizes');
  const [horario, setHorario] = useState('08h às 18h');
  const [categoria, setCategoria] = useState('ONG Parceira');

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

  async function carregarONG() {

    const ongSalva = await AsyncStorage.getItem('ong');

    if (ongSalva) {

      const ong = JSON.parse(ongSalva) as ONGPerfil;

      setNome(ong.nome || '');
      setEmail(ong.email || '');
      setTelefone(ong.telefone || '');
      setInstagram(ong.instagram || '');
      setHorario(ong.horario || '');
      setCategoria(ong.categoria || 'ONG Parceira');
      setCidade(ong.endereco?.cidade || '');
    }

    const fotoSalva = await AsyncStorage.getItem('fotoPerfilONG');

    if (fotoSalva) {
      setFotoPerfil(fotoSalva);
    }
  }

  async function alterarFotoPerfil() {

    const permissao =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {

      setFeedbackEmoji('📷');

      setFeedbackTitle('Permissão necessária');

      setFeedbackMessage(
        'Precisamos da permissão para acessar suas fotos.'
      );

      setFeedbackAction('save');

      setFeedbackVisible(true);

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

    setFotoPerfil(novaFoto);

    await AsyncStorage.setItem(
      'fotoPerfilONG',
      novaFoto
    );

    setFeedbackEmoji('🖼️');

    setFeedbackTitle('Logo updated');

    setFeedbackMessage(
      'A foto institucional da ONG foi atualizada com sucesso.'
    );

    setFeedbackAction('save');

    setFeedbackVisible(true);
  }

  function openEditModal(field: string, currentValue: string) {

    setEditingField(field);
    setTempValue(currentValue);
    setModalVisible(true);
  }

  async function saveEdit() {

    switch (editingField) {

      case 'nome':
        setNome(tempValue);
        break;

      case 'email':
        setEmail(tempValue);
        break;

      case 'telefone':
        setTelefone(tempValue);
        break;

      case 'cidade':
        setCidade(tempValue);
        break;

      case 'instagram':
        setInstagram(tempValue);
        break;

      case 'horario':
        setHorario(tempValue);
        break;
    }

    setModalVisible(false);

    setFeedbackEmoji('✅');

    setFeedbackTitle('Informações atualizadas');

    setFeedbackMessage(
      'Os dados da ONG foram atualizados com sucesso.'
    );

    setFeedbackAction('save');

    setFeedbackVisible(true);
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
          onPress={() => router.push('/gerenciarSolicitacoes')}
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
          onPress={() => router.push('/editarPerfilONG')}
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