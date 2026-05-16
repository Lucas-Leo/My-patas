// ======================================================
// IMPORTS
// ======================================================
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

// ======================================================
// LOGO APP
// ======================================================
const logoApp = require("@/assets/images/LogoPataAzul.png");

export default function NovaSenha() {

  const router = useRouter();

  // ======================================================
  // RECEBE PARAMS DA TELA ANTERIOR
  // ======================================================
  const { email, code } = useLocalSearchParams();

  // ======================================================
  // STATES
  // ======================================================
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading botão
  const [loading, setLoading] = useState(false);

  // ======================================================
  // MODAIS FEEDBACK
  // ======================================================
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // VALIDAR SENHA
  // ======================================================
  function validatePassword(password: string) {

    // mínimo 6 caracteres
    return password.length >= 6;
  }

  // ======================================================
  // ALTERAR SENHA
  // ======================================================
  async function handleChangePassword() {

    // =========================================
    // VALIDA CAMPOS
    // =========================================
    if (!newPassword || !confirmPassword) {

      setErrorMessage(
        "Preencha todos os campos."
      );

      setErrorModalVisible(true);

      return;
    }

    // =========================================
    // VALIDA TAMANHO SENHA
    // =========================================
    if (!validatePassword(newPassword)) {

      setErrorMessage(
        "A senha deve conter no mínimo 6 caracteres."
      );

      setErrorModalVisible(true);

      return;
    }

    // =========================================
    // VALIDA CONFIRMAÇÃO
    // =========================================
    if (newPassword !== confirmPassword) {

      setErrorMessage(
        "As senhas não coincidem."
      );

      setErrorModalVisible(true);

      return;
    }

    try {

      setLoading(true);

      // =========================================
      // SIMULAÇÃO BACKEND
      // =========================================
      // Aqui futuramente vocês trocarão
      // pela chamada real da API
      // =========================================
      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      console.log("=================================");
      console.log("SENHA ALTERADA");
      console.log("EMAIL:", email);
      console.log("CODE:", code);
      console.log("NOVA SENHA:", newPassword);
      console.log("=================================");

      // =========================================
      // MODAL SUCESSO
      // =========================================
      setSuccessModalVisible(true);

    } catch (error) {

      setErrorMessage(
        "Não foi possível alterar sua senha."
      );

      setErrorModalVisible(true);

    } finally {

      setLoading(false);
    }
  }

  // ======================================================
  // REDIRECIONAR LOGIN
  // ======================================================
  function handleGoToLogin() {

    setSuccessModalVisible(false);

    // volta para login
    router.replace("/login");
  }

  return (

    <View style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}
      <View style={styles.header}>

        <Image
          source={logoApp}
          style={styles.logo}
        />

        <Text style={styles.title}>
          Nova senha
        </Text>

        <Text style={styles.subtitle}>
          Crie uma nova senha para acessar sua conta.
        </Text>

      </View>

      {/* ======================================================
          MAIN
      ====================================================== */}
      <View style={styles.main}>

        {/* ======================================================
            NOVA SENHA
        ====================================================== */}
        <View style={styles.containerInput}>

          {newPassword ? (

            <Text style={styles.fieldLabel}>
              Nova senha
            </Text>

          ) : null}

          <View style={styles.passwordContainer}>

            <TextInput
              style={styles.inputPassword}
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >

              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#0E457D"
              />

            </TouchableOpacity>

          </View>

        </View>

        {/* ======================================================
            CONFIRMAR SENHA
        ====================================================== */}
        <View style={styles.containerInput}>

          {confirmPassword ? (

            <Text style={styles.fieldLabel}>
              Confirmar senha
            </Text>

          ) : null}

          <View style={styles.passwordContainer}>

            <TextInput
              style={styles.inputPassword}
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >

              <Ionicons
                name={
                  showConfirmPassword
                    ? "eye"
                    : "eye-off"
                }
                size={24}
                color="#0E457D"
              />

            </TouchableOpacity>

          </View>

        </View>

        {/* ======================================================
            BOTÃO ALTERAR SENHA
        ====================================================== */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
        >

          <Text style={styles.buttonText}>
            {loading
              ? "Alterando..."
              : "Confirmar nova senha"}
          </Text>

        </TouchableOpacity>

      </View>

      {/* ======================================================
          MODAL SUCESSO
      ====================================================== */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.successModalContainer}>

            <Ionicons
              name="checkmark-circle"
              size={70}
              color="#22C55E"
            />

            <Text style={styles.successTitle}>
              Senha alterada!
            </Text>

            <Text style={styles.successDescription}>
              Sua senha foi redefinida com sucesso.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={handleGoToLogin}
            >

              <Text style={styles.modalButtonText}>
                Ir para login
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      {/* ======================================================
          MODAL ERRO
      ====================================================== */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.errorModalContainer}>

            <Ionicons
              name="alert-circle"
              size={70}
              color="#FF4242"
            />

            <Text style={styles.errorTitle}>
              Ops!
            </Text>

            <Text style={styles.errorDescription}>
              {errorMessage}
            </Text>

            <TouchableOpacity
              style={styles.errorButton}
              onPress={() =>
                setErrorModalVisible(false)
              }
            >

              <Text style={styles.modalButtonText}>
                Fechar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  // ======================================================
  // CONTAINER
  // ======================================================
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  // ======================================================
  // HEADER
  // ======================================================
  header: {
    flex: 3 / 10,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 200,
    height: 90,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#0E457D",
    marginBottom: 10,
    marginTop: 50,
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 10,
  },

  // ======================================================
  // MAIN
  // ======================================================
  main: {
    flex: 5 / 10,
    justifyContent: "center",
    gap: 25,
  },

  containerInput: {
    width: "100%",
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0E457D",
    marginBottom: 6,
    marginLeft: 14,
  },

  // ======================================================
  // INPUT SENHA
  // ======================================================
  passwordContainer: {
    backgroundColor: "#F1F5F4",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 60,
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 20,
  },

  inputPassword: {
    flex: 1,
    fontSize: 16,
  },

  eyeButton: {
    paddingHorizontal: 5,
  },

  // ======================================================
  // BOTÃO
  // ======================================================
  button: {
    marginTop: 30,
    backgroundColor: "#FF42B3",
    width: "100%",
    height: 55,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  // ======================================================
  // MODAIS
  // ======================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  successModalContainer: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
  },

  successTitle: {
    marginTop: 15,
    fontSize: 26,
    fontWeight: "bold",
    color: "#22C55E",
  },

  successDescription: {
    marginTop: 10,
    textAlign: "center",
    color: "#555",
    fontSize: 15,
    marginBottom: 25,
  },

  successButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#22C55E",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // ======================================================
  // MODAL ERRO
  // ======================================================
  errorModalContainer: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF4242",
  },

  errorDescription: {
    marginTop: 10,
    textAlign: "center",
    color: "#555",
    fontSize: 15,
    marginBottom: 25,
  },

  errorButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#FF4242",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});