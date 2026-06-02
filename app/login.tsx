import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../src/service/api";
import axios from "axios";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';

// ======================================================
// LOGO
// ======================================================
const logoApp = require('@/assets/images/LogoPataAzul.png');

export default function Login() {

  const router = useRouter();

  // ======================================================
  // LOGIN
  // ======================================================
  const [login, setLogin] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  // ======================================================
  // MODAIS
  // ======================================================
  const [modalVisible, setModalVisible] = useState(false);

  // Modal código recuperação
  const [codeModalVisible, setCodeModalVisible] = useState(false);

  // Modal erro recuperação
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  // ======================================================
  // MODAL SUCESSO LOGIN
  // ======================================================
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successIsOng, setSuccessIsOng] = useState(false);

  // ======================================================
  // RECUPERAÇÃO SENHA
  // ======================================================
  const [emailRecovery, setEmailRecovery] = useState("");

  // Código digitado usuário
  const [recoveryCode, setRecoveryCode] = useState("");

  // Loading envio email
  const [loadingRecovery, setLoadingRecovery] = useState(false);

  // ======================================================
  // TIMER RECUPERAÇÃO
  // ======================================================
  const [timer, setTimer] = useState(60);

  // Quando true usuário pode reenviar código
  const [canResendCode, setCanResendCode] = useState(false);

  // ======================================================
  // TIMER
  // ======================================================
  useEffect(() => {

    let interval: ReturnType<typeof setInterval> | undefined;

    if (codeModalVisible && timer > 0) {

      interval = setInterval(() => {

        setTimer((prev) => prev - 1);

      }, 1000);
    }

    if (timer === 0) {

      setCanResendCode(true);
    }

    return () => {

      if (interval) clearInterval(interval);
    };

  }, [codeModalVisible, timer]);

  // ======================================================
  // VALIDAR EMAIL
  // ======================================================
  function validateEmail(email: string) {

    return /\S+@\S+\.\S+/.test(email);
  }

  // ======================================================
  // BOTÃO LOGIN DESABILITADO
  // ======================================================
  function onClickButtonDisabled() {

    Alert.alert(
      "Atenção",
      "Preencha os campos obrigatórios para acessar."
    );

    return;
  }

  // ======================================================
  // MENSAGEM ERRO LOGIN
  // ======================================================
  function obterMensagemErro(error: unknown) {

    if (axios.isAxiosError<{ message?: string; erro?: string }>(error)) {

      return (
        error.response?.data?.message ||
        error.response?.data?.erro ||
        "E-mail ou senha incorretos."
      );
    }

    return "Nao foi possivel fazer login.";
  }

  // ======================================================
  // LOGIN
  // ======================================================
  async function OnClickLogin() {

    if (!login || !password) {

      Alert.alert(
        "Campos obrigatórios",
        "Preencha todos os campos para continuar."
      );

      return;
    }

    if (!validateEmail(login)) {

      Alert.alert(
        "Erro",
        "Digite um e-mail válido."
      );

      return;
    }

    try {

      // ======================================================
      // LOGIN FICTÍCIO
      // ======================================================
      const fakeEmail = "teste@teste.com";
      const fakePassword = "123";

      // Simula delay backend
      await new Promise(resolve =>
        setTimeout(resolve, 1500)
      );

      // ======================================================
      // VALIDA LOGIN FICTÍCIO
      // ======================================================
      if (
        login.trim().toLowerCase() === fakeEmail &&
        password === fakePassword
      ) {

        // ======================================================
        // DADOS FICTÍCIOS USUÁRIO
        // ======================================================
        const fakeUser = {
          id: 1,
          nome: "Usuário Teste",
          email: fakeEmail,
          telefone: "(16) 99999-9999",
          endereco: {
            cidade: "Matão",
            estado: "SP",
          }
        };

        // Salva usuário fictício
        await AsyncStorage.setItem(
          "usuario",
          JSON.stringify(fakeUser)
        );

        // Salva token fictício
        await AsyncStorage.setItem(
          "token",
          "token-ficticio-123"
        );

        await AsyncStorage.removeItem("ong");

        // ======================================================
        // ABRE MODAL SUCESSO
        // ======================================================
        setSuccessIsOng(false);
        setSuccessModalVisible(true);

        // Fecha sozinho após 2 segundos
        setTimeout(() => {

          setSuccessModalVisible(false);

          router.push("/home");

        }, 2000);

        return;
      }

      const response = await api.post("/login", {
        email: login.trim().toLowerCase(),
        senha: password,
      });

      const usuarioSalvo = await AsyncStorage.getItem("usuario");

      const usuarioAnterior = usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : null;

      const usuarioApi = response.data.usuario;

      const mesmoEmail =
        usuarioAnterior?.email === usuarioApi?.email;

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuarioApi,
          telefone:
            usuarioApi?.telefone ||
            (mesmoEmail ? usuarioAnterior?.telefone : ""),

          endereco: {
            ...(mesmoEmail ? usuarioAnterior?.endereco : {}),
            ...usuarioApi?.endereco,
          },
        })
      );

      await AsyncStorage.setItem(
        "token",
        response.data.token
      );

      const possuiOng = Boolean(response.data.ong);

      if (possuiOng) {

        await AsyncStorage.setItem(
          "ong",
          JSON.stringify(response.data.ong)
        );
      } else {
        await AsyncStorage.removeItem("ong");
      }

      // ======================================================
      // ABRE MODAL SUCESSO
      // ======================================================
      setSuccessIsOng(possuiOng);
      setSuccessModalVisible(true);

      // Fecha sozinho após 2 segundos
      setTimeout(() => {

        setSuccessModalVisible(false);

        router.push(possuiOng ? "/perfilONG" : "/home");

      }, possuiOng ? 4500 : 2000);

    } catch (error) {

      Alert.alert(
        "Erro no login",
        obterMensagemErro(error)
      );
    }
  }

  // ======================================================
  // ENVIAR EMAIL RECUPERAÇÃO
  // ======================================================
  async function handleForgotPassword() {

    if (!emailRecovery) {

      Alert.alert(
        "Atenção",
        "Digite seu e-mail."
      );

      return;
    }

    if (!validateEmail(emailRecovery)) {

      Alert.alert(
        "Erro",
        "Digite um e-mail válido."
      );

      return;
    }

    try {

      setLoadingRecovery(true);

      // ======================================================
      // SIMULAÇÃO ENVIO EMAIL
      // ======================================================
      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      console.log("=================================");
      console.log("EMAIL FICTÍCIO ENVIADO");
      console.log("EMAIL:", emailRecovery);
      console.log("CÓDIGO TESTE: 123456");
      console.log("=================================");

      // Fecha modal email
      setModalVisible(false);

      // Abre modal código
      setCodeModalVisible(true);

      // Reinicia timer
      setTimer(60);

      // Bloqueia reenviar
      setCanResendCode(false);

    } catch (error) {

      console.log("ERRO RECUPERAÇÃO:", error);

      setErrorModalVisible(true);

    } finally {

      setLoadingRecovery(false);
    }
  }

  // ======================================================
  // REENVIAR CÓDIGO
  // ======================================================
  async function handleResendCode() {

    try {

      await new Promise(resolve =>
        setTimeout(resolve, 1500)
      );

      console.log("=================================");
      console.log("CÓDIGO REENVIADO");
      console.log("EMAIL:", emailRecovery);
      console.log("CÓDIGO TESTE: 123456");
      console.log("=================================");

      setTimer(60);

      setCanResendCode(false);

      Alert.alert(
        "Código reenviado",
        "Verifique novamente o console."
      );

    } catch (error) {

      Alert.alert(
        "Erro",
        "Não foi possível reenviar o código."
      );
    }
  }

  // ======================================================
  // VALIDAR CÓDIGO
  // ======================================================
  async function handleValidateCode() {

    if (!recoveryCode) {

      Alert.alert(
        "Atenção",
        "Digite o código recebido."
      );

      return;
    }

    try {

      if (recoveryCode !== "123456") {

        Alert.alert(
          "Código inválido",
          "O código informado está incorreto."
        );

        return;
      }

      await new Promise(resolve =>
        setTimeout(resolve, 1000)
      );

      setCodeModalVisible(false);

      router.push({
        pathname: "/novasenha",
        params: {
          email: emailRecovery,
          code: recoveryCode,
        }
      });

    } catch (error) {

      Alert.alert(
        "Erro",
        "Não foi possível validar o código."
      );
    }
  }

  return (

    <View style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}
      <View style={styles.header}>

        <Image
          height={50}
          width={100}
          source={logoApp}
          style={styles.logo}
        />

        <Text style={styles.textlogin}>
          Login
        </Text>

      </View>

      {/* ======================================================
          MAIN
      ====================================================== */}
      <View style={styles.main}>

        {/* EMAIL */}
        <View style={styles.containerInput}>

          {login ? (
            <Text style={styles.fieldLabel}>
              E-mail
            </Text>
          ) : null}

          <TextInput
            style={styles.input}
            value={login || ""}
            placeholder="Digite seu e-mail ..."
            onChangeText={(e) => setLogin(e)}
          />

        </View>

        {/* SENHA */}
        <View style={styles.containerInput}>

          {password ? (
            <Text style={styles.fieldLabel}>
              Senha
            </Text>
          ) : null}

          <View style={styles.passwordContainer}>

            <TextInput
              style={styles.inputPassword}
              value={password || ""}
              placeholder="Digite sua senha..."
              onChangeText={(e) => setPassword(e)}
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

          {/* ESQUECEU SENHA */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => setModalVisible(true)}
          >

            <Text style={styles.forgotPasswordText}>
              Esqueceu a senha?
            </Text>

          </TouchableOpacity>

        </View>

        {/* BOTÃO LOGIN */}
        {(login || password) && (

          <TouchableOpacity
            style={styles.button}
            onPress={OnClickLogin}
          >

            <Text style={styles.buttonText}>
              Acessar
            </Text>

          </TouchableOpacity>
        )}

        {/* BOTÃO DESABILITADO */}
        {!login && !password && (

          <TouchableOpacity
            onPress={onClickButtonDisabled}
            style={styles.disabledButton}
          >

            <Text style={styles.buttonText}>
              Acessar
            </Text>

          </TouchableOpacity>
        )}

      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}
      <View style={styles.footer}>

        <Text>
          Não tenho conta.
        </Text>

        <Link href="/criarconta" asChild>

          <TouchableOpacity>

            <Text style={styles.link}>
              Criar conta agora.
            </Text>

          </TouchableOpacity>

        </Link>

      </View>

      {/* ======================================================
          MODAL SUCESSO LOGIN
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
              color="#32C766"
            />

            <Text style={styles.successTitle}>
              Login realizado!
            </Text>

            <Text style={styles.successDescription}>
              {successIsOng
                ? "Conta de ONG identificada. Para gerenciar pets, solicitacoes e dados da ONG, acesse pelo site. No app o perfil fica apenas para consulta."
                : "Você será redirecionado em instantes."}
            </Text>

          </View>

        </View>

      </Modal>

      {/* ======================================================
          MODAL RECUPERAR SENHA
      ====================================================== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
              Recuperar senha
            </Text>

            <Text style={styles.modalDescription}>
              Digite seu e-mail para receber o código de recuperação.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Digite seu e-mail"
              value={emailRecovery}
              onChangeText={setEmailRecovery}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleForgotPassword}
            >

              <Text style={styles.modalButtonText}>
                {loadingRecovery ? "Enviando..." : "Enviar"}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
            >

              <Text style={styles.cancelText}>
                Cancelar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      {/* ======================================================
          MODAL CÓDIGO RECUPERAÇÃO
      ====================================================== */}
      <Modal
        visible={codeModalVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
              Validar código
            </Text>

            <Text style={styles.modalDescription}>
              Digite o código enviado para seu e-mail.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Digite o código"
              value={recoveryCode}
              onChangeText={setRecoveryCode}
              keyboardType="numeric"
            />

            {!canResendCode && (

              <Text style={styles.timerText}>
                Reenviar código em {timer}s
              </Text>
            )}

            {canResendCode && (

              <TouchableOpacity
                onPress={handleResendCode}
              >

                <Text style={styles.resendText}>
                  Reenviar código
                </Text>

              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleValidateCode}
            >

              <Text style={styles.modalButtonText}>
                Validar código
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCodeModalVisible(false)}
            >

              <Text style={styles.cancelText}>
                Cancelar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      {/* ======================================================
          MODAL ERRO ENVIO EMAIL
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
              size={60}
              color="#FF4242"
            />

            <Text style={styles.errorTitle}>
              Erro ao enviar
            </Text>

            <Text style={styles.errorDescription}>
              Não foi possível enviar o e-mail de recuperação.
              Tente novamente em alguns instantes.
            </Text>

            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setErrorModalVisible(false)}
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

// ======================================================
// STYLES
// ======================================================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#ffffff",
    paddingLeft: 20,
    paddingRight: 20,
  },

  header: {
    flex: 3 / 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 50,
  },

  main: {
    flex: 5 / 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },

  footer: {
    flex: 2 / 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flexDirection: "row",
    gap: 5,
  },

  logo: {
    width: 200,
    height: 90,
  },

  containerInput: {
    width: "100%",
    padding: 5,
    borderRadius: 15,
    paddingLeft: 10,
  },

  input: {
    backgroundColor: '#F1F5F4',
    width: '100%',
    height: 60,
    borderRadius: 30,
    fontSize: 16,
    padding: 20,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0E457D",
    marginBottom: 6,
    marginLeft: 14,
  },

  link: {
    color: "#0E457D",
    fontWeight: "bold",
  },

  button: {
    marginTop: 45,
    backgroundColor: "#FF42B3",
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },

  disabledButton: {
    marginTop: 45,
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#0E457D',
    opacity: 0.7,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
  },

  textlogin: {
    fontWeight: "bold",
    fontSize: 36,
    color: "#0E457D"
  },

  passwordContainer: {
    backgroundColor: '#F1F5F4',
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

  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginRight: 10,
  },

  forgotPasswordText: {
    color: "#0E457D",
    fontWeight: "600",
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0E457D",
    marginBottom: 10,
  },

  modalDescription: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
  },

  modalInput: {
    width: "100%",
    backgroundColor: "#F1F5F4",
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },

  modalButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF42B3",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  cancelText: {
    color: "#0E457D",
    fontWeight: "600",
    fontSize: 15,
  },

  timerText: {
    color: "#666",
    marginBottom: 15,
    fontSize: 14,
  },

  resendText: {
    color: "#0E457D",
    fontWeight: "bold",
    marginBottom: 15,
    fontSize: 15,
  },

  errorModalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 24,
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
    height: 50,
    backgroundColor: "#FF4242",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // ======================================================
  // MODAL SUCESSO LOGIN
  // ======================================================
  successModalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 35,
    alignItems: "center",
  },

  successTitle: {
    marginTop: 15,
    fontSize: 26,
    fontWeight: "bold",
    color: "#32C766",
  },

  successDescription: {
    marginTop: 10,
    textAlign: "center",
    color: "#555",
    fontSize: 16,
  },
});
