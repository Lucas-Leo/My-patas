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
import { useRouter } from "expo-router";
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import * as ImagePicker from 'expo-image-picker';

const profileImage = require('@/assets/images/perfil.png');
const logoApp = require('@/assets/images/LogoPataAzul.png');

type UsuarioPerfil = {
  nome?: string;
  email?: string;
  telefone?: string | null;
  endereco?: {
    cidade?: string;
  };
};

const ProfileScreen = () => {

  const router = useRouter();

  const { theme, toggleTheme } = useThemeContext();

  const isDark = theme === 'dark';

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  const [editingField, setEditingField] = useState("");
  const [tempValue, setTempValue] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackEmoji, setFeedbackEmoji] = useState("🐾");

  const [feedbackAction, setFeedbackAction] = useState<
    "save" | "logout" | "delete" | "deleted" | null
  >(null);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    carregarUsuario();
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

  async function carregarUsuario() {

    const usuarioSalvo = await AsyncStorage.getItem("usuario");

    if (!usuarioSalvo) {
      return;
    }

    const usuario = JSON.parse(usuarioSalvo) as UsuarioPerfil;

    setNome(usuario.nome || "");
    setEmail(usuario.email || "");
    setTelefone(usuario.telefone || "");
    setCidade(usuario.endereco?.cidade || "");

    const fotoSalva = await AsyncStorage.getItem("fotoPerfil");

    if (fotoSalva) {
      setFotoPerfil(fotoSalva);
    }
  }

  async function alterarFotoPerfil() {

    const permissao =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {

      setFeedbackEmoji("📷");

      setFeedbackTitle("Permissão necessária");

      setFeedbackMessage(
        "Precisamos da permissão para acessar suas fotos."
      );

      setFeedbackAction("save");

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
      "fotoPerfil",
      novaFoto
    );

    setFeedbackEmoji("🖼️");

    setFeedbackTitle("Foto atualizada");

    setFeedbackMessage(
      "Sua foto de perfil foi alterada com sucesso."
    );

    setFeedbackAction("save");

    setFeedbackVisible(true);
  }

  function openEditModal(field: string, currentValue: string) {

    setEditingField(field);
    setTempValue(currentValue);
    setModalVisible(true);
  }

  async function atualizarUsuarioSalvo(field: string, value: string) {

    const usuarioSalvo = await AsyncStorage.getItem("usuario");

    if (!usuarioSalvo) {
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    if (field === "cidade") {

      usuario.endereco = {
        ...usuario.endereco,
        cidade: value,
      };

    } else {
      usuario[field] = value;
    }

    await AsyncStorage.setItem(
      "usuario",
      JSON.stringify(usuario)
    );
  }

  async function saveEdit() {

    switch (editingField) {

      case "nome":
        setNome(tempValue);
        break;

      case "email":
        setEmail(tempValue);
        break;

      case "telefone":
        setTelefone(tempValue);
        break;

      case "cidade":
        setCidade(tempValue);
        break;
    }

    await atualizarUsuarioSalvo(
      editingField,
      tempValue
    );

    setModalVisible(false);

    setFeedbackEmoji("✅");

    setFeedbackTitle(
      "Alterações salvas"
    );

    setFeedbackMessage(
      "Suas informações foram atualizadas com sucesso."
    );

    setFeedbackAction("save");

    setFeedbackVisible(true);
  }

  async function logout() {

    setFeedbackEmoji("👋");

    setFeedbackTitle(
      "Até logo!"
    );

    setFeedbackMessage(
      "Você saiu da sua conta com sucesso."
    );

    setFeedbackAction("logout");

    setFeedbackVisible(true);
  }

  async function confirmarLogout() {

    await AsyncStorage.multiRemove([
      "usuario",
      "token",
      "ong",
      "fotoPerfil"
    ]);

    router.replace("/login");
  }

  function excluirConta() {

    setFeedbackEmoji("⚠️");

    setFeedbackTitle(
      "Excluir conta"
    );

    setFeedbackMessage(
      "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita."
    );

    setFeedbackAction("delete");

    setFeedbackVisible(true);
  }

  async function confirmarExclusao() {

    await AsyncStorage.multiRemove([
      "usuario",
      "token",
      "ong",
      "fotoPerfil"
    ]);

    setFeedbackEmoji("🗑️");

    setFeedbackTitle(
      "Conta excluída"
    );

    setFeedbackMessage(
      "Sua conta foi excluída com sucesso."
    );

    setFeedbackAction("deleted");
  }

  function getFieldTitle() {

    switch (editingField) {

      case "nome":
        return "Editar nome";

      case "email":
        return "Editar e-mail";

      case "telefone":
        return "Editar telefone";

      case "cidade":
        return "Editar cidade";

      default:
        return "";
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
                  ? "#1E1E1E"
                  : "#FFFFFF"
              }
            ]}
          >

            <Text
              style={[
                styles.modalTitle,
                {
                  color: isDark
                    ? "#FFFFFF"
                    : "#0E457D"
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
                    ? "#2A2A2A"
                    : "#F1F5F4",

                  color: isDark
                    ? "#FFFFFF"
                    : "#000000"
                }
              ]}
            />

            <View style={styles.modalButtons}>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>
                  Salvar
                </Text>
              </TouchableOpacity>

            </View>

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
                  ? "#1E1E1E"
                  : "#FFFFFF",

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
                    ? "#FFFFFF"
                    : "#0E457D"
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
                    ? "#CCCCCC"
                    : "#555555"
                }
              ]}
            >
              {feedbackMessage}
            </Text>

            {
              feedbackAction === "delete"
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

                      if (feedbackAction === "logout") {
                        await confirmarLogout();
                      }

                      if (feedbackAction === "deleted") {
                        router.replace("/login");
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
                ? "#1E1E1E"
                : "#FFFFFF"
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

          <Text
            style={[
              styles.profileName,
              {
                color: isDark
                  ? "#FFFFFF"
                  : "#0E457D"
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
                  ? "#BBBBBB"
                  : "#666666"
              }
            ]}
          >
            {email}
          </Text>

        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark
                ? "#1E1E1E"
                : "#FFFFFF"
            }
          ]}
        >

          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? "#FFFFFF"
                  : "#0E457D"
              }
            ]}
          >
            Informações pessoais
          </Text>

          {[
            { label: "Nome", value: nome, field: "nome" },
            { label: "E-mail", value: email, field: "email" },
            { label: "Telefone", value: telefone, field: "telefone" },
            { label: "Cidade", value: cidade, field: "cidade" },
          ].map((item, index) => (

            <View key={index}>

              <View style={styles.fieldItem}>

                <View>

                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? "#BDBDBD"
                          : "#666"
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
                          ? "#FFFFFF"
                          : "#000000"
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
                index !== 3 &&
                <View style={styles.divider} />
              }

            </View>

          ))}

        </View>

        <TouchableOpacity
          style={[
            styles.fullEditCard,
            {
              backgroundColor: isDark
                ? "#1E1E1E"
                : "#FFFFFF"
            }
          ]}
          onPress={() => router.push("/editaruserComum")}
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
                      ? "#FFFFFF"
                      : "#0E457D"
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
                      ? "#BBBBBB"
                      : "#666666"
                  }
                ]}
              >
                Acesse endereço e outros dados
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
                ? "#1E1E1E"
                : "#FFFFFF"
            }
          ]}
        >

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/quests")}
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
                      ? "#FFFFFF"
                      : "#000000"
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
                      ? "#FFFFFF"
                      : "#000000"
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
    alignItems: "center",
  },

  header: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: "center",
  },

  logo: {
    width: 200,
    height: 90,
  },

  profileCard: {
    width: "90%",
    borderRadius: 28,
    alignItems: "center",
    paddingVertical: 30,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  photoContainer: {
    position: "relative",
  },

  profilePhoto: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: "#FF42B3",
  },

  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF42B3",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "bold",
  },

  profileEmail: {
    marginTop: 5,
    fontSize: 15,
  },

  infoCard: {
    width: "90%",
    borderRadius: 28,
    marginTop: 25,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 25,
  },

  fieldItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fieldLabel: {
    fontSize: 13,
    marginBottom: 4,
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 18,
  },

  fullEditCard: {
    width: "90%",
    borderRadius: 28,
    marginTop: 20,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  fullEditLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  fullEditIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FF42B3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  fullEditTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },

  fullEditSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    width: "92%",
  },

  settingsCard: {
    width: "90%",
    borderRadius: 28,
    marginTop: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  settingText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },

  deleteButton: {
    width: "90%",
    height: 58,
    backgroundColor: "#FF3B3B",
    borderRadius: 18,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  logoutButton: {
    width: "90%",
    height: 58,
    backgroundColor: "#0E457D",
    borderRadius: 18,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  modalContainer: {
    width: "100%",
    borderRadius: 25,
    padding: 25,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  modalInput: {
    width: "100%",
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  cancelButton: {
    width: "48%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 15,
  },

  saveButton: {
    width: "48%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FF42B3",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  feedbackContainer: {
    width: "100%",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
  },

  feedbackEmoji: {
    fontSize: 55,
  },

  feedbackTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },

  feedbackMessage: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
    lineHeight: 24,
  },

  feedbackButton: {
    backgroundColor: "#FF42B3",
    width: "100%",
    height: 55,
    borderRadius: 16,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  feedbackButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },

  feedbackButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  cancelDeleteButton: {
    width: "48%",
    height: 55,
    borderRadius: 16,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmDeleteButton: {
    width: "48%",
    height: 55,
    borderRadius: 16,
    backgroundColor: "#FF3B3B",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelDeleteText: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 16,
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

});

export default ProfileScreen;