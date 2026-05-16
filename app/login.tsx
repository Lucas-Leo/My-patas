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
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

const logoApp = require('@/assets/images/LogoPataAzul.png');

export default function Login() {

  const router = useRouter();

  const [login, setLogin] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [emailRecovery, setEmailRecovery] = useState("");

  function validateEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function onClickButtonDisabled() {
    Alert.alert(
      "Atenção",
      "Preencha os campos obrigatórios para acessar."
    );

    return;
  }

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

      if (response.data.ong) {

        await AsyncStorage.setItem(
          "ong",
          JSON.stringify(response.data.ong)
        );
      }

      Alert.alert(
        "Sucesso",
        "Login realizado com sucesso!"
      );

      router.push("/home");

    } catch (error) {

      Alert.alert(
        "Erro no login",
        obterMensagemErro(error)
      );
    }
  }

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

      await api.post("/forgot-password", {
        email: emailRecovery.trim().toLowerCase(),
      });

      Alert.alert(
        "Recuperação enviada",
        "Verifique seu e-mail para redefinir sua senha."
      );

      setModalVisible(false);
      setEmailRecovery("");

    } catch (error) {

      Alert.alert(
        "Erro",
        "Não foi possível enviar o e-mail de recuperação."
      );
    }
  }

  return (

    <View style={styles.container}>

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

      <View style={styles.main}>

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

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => setModalVisible(true)}
          >

            <Text style={styles.forgotPasswordText}>
              Esqueceu a senha?
            </Text>

          </TouchableOpacity>

        </View>

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
              Digite seu e-mail para receber o link de recuperação.
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
                Enviar
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

    </View>
  );
}

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
});