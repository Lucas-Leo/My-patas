import {
  Animated,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../src/service/api";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import { Link, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";

const logoApp = require("@/assets/images/LogoPataAzul.png");

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type RegisterResponse = ApiResponse<Usuario>;

type Usuario = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  data_nasc: string;
  cpf: string;
  foto: string | null;
  fk_idsexo: number | null;
  fk_idendereco: number | null;
  fk_idtipo: number;
  data_criacao: string;
  data_att: string;
};

const ID_TIPO_USUARIO_PADRAO = 3;

export default function Register() {

  const [nome, setNome] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [dataNascimento, setDataNascimento] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);

  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalEmoji, setModalEmoji] = useState("🐾");

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isFormComplete = !!(
    nome &&
    login &&
    password &&
    password2 &&
    cpf &&
    dataNascimento
  );

  function obterMensagemErro(error: unknown) {
    if (axios.isAxiosError<{ erro?: string; message?: string }>(error)) {
      return (
        error.response?.data?.erro ||
        error.response?.data?.message ||
        error.message
      );
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Ocorreu um problema ao criar a conta";
  }

  function formatarDataParaApi(data: string) {
    const [dia, mes, ano] = data.split("/");

    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  async function criarConta(): Promise<Usuario> {
    try {

      const cpfLimpo = cpf.replace(/\D/g, "");

      const res = await api.post<RegisterResponse>("/usuarios", {
        nome: nome.trim(),
        email: login.trim().toLowerCase(),
        telefone: null,
        fk_idsexo: null,
        data_nasc: formatarDataParaApi(dataNascimento),
        cpf: cpfLimpo,
        senha: password,
        foto: null,
        fk_idendereco: null,
        fk_idtipo: ID_TIPO_USUARIO_PADRAO,
      });

      console.log("RESPOSTA DO BACKEND:", res.data);

      if (res.data.success === false || !res.data.data) {
        throw new Error(
          res.data.message || "Nao foi possivel criar a conta."
        );
      }

      return {
        ...res.data.data,
        fk_idtipo: ID_TIPO_USUARIO_PADRAO,
      };

    } catch (error) {

      console.log(obterMensagemErro(error));

      throw error;
    }
  }

  const navigation = useNavigation();

  useEffect(() => {

    if (modalVisible || modalErrorVisible) {

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

  }, [modalVisible, modalErrorVisible]);

  function validarEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function formatarCPF(valor: string) {

    let v = valor.replace(/\D/g, "").slice(0, 11);

    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    return v;
  }

  function validarCPF(cpf: string) {

    const clean = cpf.replace(/\D/g, "");

    if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) {
      return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += parseInt(clean[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    if (resto !== parseInt(clean[9])) {
      return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += parseInt(clean[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(clean[10]);
  }

  function formatarData(valor: string) {

    let v = valor.replace(/\D/g, "").slice(0, 8);

    v = v.replace(/(\d{2})(\d)/, "$1/$2");
    v = v.replace(/(\d{2})(\d)/, "$1/$2");

    return v;
  }

  function validarData(data: string) {

    const [dia, mes, ano] = data.split("/").map(Number);

    const date = new Date(ano, mes - 1, dia);

    return (
      date.getDate() === dia &&
      date.getMonth() === mes - 1 &&
      date.getFullYear() === ano
    );
  }

  function calcularIdade(data: string) {

    const [dia, mes, ano] = data.split("/").map(Number);

    const nascimento = new Date(ano, mes - 1, dia);

    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const m = hoje.getMonth() - nascimento.getMonth();

    if (
      m < 0 ||
      (m === 0 && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }

    return idade;
  }

  async function onClickRegistrar(): Promise<void> {

    if (!isFormComplete) {
      return;
    }

    if (!validarEmail(login)) {

      setModalEmoji("⚠️");

      setModalTitle(
        "E-mail inválido"
      );

      setModalMessage(
        "Digite um endereço de e-mail válido para continuar."
      );

      setModalErrorVisible(true);

      return;
    }

    if (!validarData(dataNascimento)) {

      setModalEmoji("⚠️");

      setModalTitle(
        "Data inválida"
      );

      setModalMessage(
        "Digite uma data de nascimento válida."
      );

      setModalErrorVisible(true);

      return;
    }

    const idade = calcularIdade(dataNascimento);

    if (idade < 18) {

      setModalEmoji("⚠️");

      setModalTitle(
        "Ops! Você ainda não pode criar uma conta"
      );

      setModalMessage(
        "Você precisa ter pelo menos 18 anos para criar uma conta no Patas Conscientes."
      );

      setModalErrorVisible(true);

      return;
    }

    if (password !== password2) {

      setModalEmoji("⚠️");

      setModalTitle(
        "Senhas diferentes"
      );

      setModalMessage(
        "As senhas digitadas não coincidem."
      );

      setModalErrorVisible(true);

      return;
    }

    if (password.length < 4) {

      setModalEmoji("⚠️");

      setModalTitle(
        "Senha muito curta"
      );

      setModalMessage(
        "Sua senha precisa ter pelo menos 4 caracteres."
      );

      setModalErrorVisible(true);

      return;
    }

    try {

      const usuario = await criarConta();

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
      );
      await AsyncStorage.setItem("senhaCadastro", password);

      setModalEmoji("🐾");

      setModalTitle(
        "Falta só mais um passo"
      );

      setModalMessage(
        "Queremos conhecer melhor você para deixar sua experiência mais personalizada."
      );

      setModalVisible(true);

    } catch (error) {

      setModalEmoji("⚠️");

      setModalTitle(
        "Erro ao criar conta"
      );

      setModalMessage(
        obterMensagemErro(error)
      );

      setModalErrorVisible(true);
    }
  }

  return (
    <View style={styles.container}>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible || modalErrorVisible}
      >
        <View style={styles.overlay}>

          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >

            <Text style={styles.modalEmoji}>
              {modalEmoji}
            </Text>

            <Text style={styles.modalTitle}>
              {modalTitle}
            </Text>

            <Text style={styles.modalText}>
              {modalMessage}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {

                if (modalErrorVisible) {
                  setModalErrorVisible(false);
                  return;
                }

                setModalVisible(false);

                navigation.navigate("completarperfil" as never);
              }}
            >
              <Text style={styles.modalButtonText}>
                {modalErrorVisible
                  ? "Entendi"
                  : "Completar perfil"}
              </Text>
            </TouchableOpacity>

          </Animated.View>

        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.header}>

          <Image
            source={logoApp}
            style={styles.logo}
          />

          <Text style={styles.stepText}>
            Etapa 1 de 2
          </Text>

          <Text style={styles.inputText}>
            Comece seu cadastro
          </Text>

        </View>

        <View style={styles.main}>

          <View style={styles.containerInput}>
            {nome
              ? <Text style={styles.fieldLabel}>Nome</Text>
              : null}

            <TextInput
              style={styles.input}
              placeholder="Nome"
              onChangeText={setNome}
              value={nome}
            />
          </View>

          <View style={styles.containerInput}>
            {login
              ? <Text style={styles.fieldLabel}>E-mail</Text>
              : null}

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              onChangeText={setLogin}
              value={login}
            />
          </View>

          <View style={styles.containerInput}>
            {cpf
              ? <Text style={styles.fieldLabel}>CPF</Text>
              : null}

            <TextInput
              style={styles.input}
              placeholder="CPF"
              onChangeText={(value) =>
                setCpf(formatarCPF(value))
              }
              value={cpf}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          <View style={styles.containerInput}>
            {dataNascimento
              ? <Text style={styles.fieldLabel}>Data de nascimento</Text>
              : null}

            <TextInput
              style={styles.input}
              placeholder="Data de nascimento"
              onChangeText={(value) =>
                setDataNascimento(formatarData(value))
              }
              value={dataNascimento}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.containerInput}>
            {password
              ? <Text style={styles.fieldLabel}>Senha</Text>
              : null}

            <View style={styles.containerSenha}>

              <TextInput
                style={styles.inputPassword}
                placeholder="Senha"
                onChangeText={setPassword}
                value={password}
                secureTextEntry={!showPassword}
                maxLength={8}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >
                <Ionicons
                  name={showPassword
                    ? "eye"
                    : "eye-off"}
                  size={24}
                  color="#0E457D"
                />
              </TouchableOpacity>

            </View>
          </View>

          <View style={styles.containerInput}>
            {password2
              ? <Text style={styles.fieldLabel}>Confirmar senha</Text>
              : null}

            <View style={styles.containerSenha}>

              <TextInput
                style={styles.inputPassword}
                placeholder="Confirmar senha"
                onChangeText={setPassword2}
                value={password2}
                secureTextEntry={!showConfirmPassword}
                maxLength={8}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                <Ionicons
                  name={showConfirmPassword
                    ? "eye"
                    : "eye-off"}
                  size={24}
                  color="#0E457D"
                />
              </TouchableOpacity>

            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isFormComplete
                  ? "#FF42B3"
                  : "#0E457D"
              },
            ]}
            onPress={onClickRegistrar}
          >
            <Text style={styles.buttonText}>
              Continuar
            </Text>
          </TouchableOpacity>

        </View>

        <View style={styles.footer}>

          <Text>
            Já tenho conta.
          </Text>

          <Link href="/login">
            <Text style={styles.link}>
              Fazer Login.
            </Text>
          </Link>

        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  header: {
    alignItems: "center",
    marginTop: 20,
  },

  logo: {
    width: 200,
    height: 90,
  },

  stepText: {
    color: "#FF42B3",
    fontWeight: "700",
    marginTop: 10,
  },

  inputText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0E457D",
    marginTop: 10,
  },

  main: {
    padding: 20,
    gap: 20,
  },

  containerInput: {
    width: "100%",
  },

  input: {
    backgroundColor: "#F1F5F4",
    width: "100%",
    height: 60,
    borderRadius: 30,
    fontSize: 16,
    paddingHorizontal: 20,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0E457D",
    marginBottom: 6,
    marginLeft: 14,
  },

  containerSenha: {
    backgroundColor: "#F1F5F4",
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 20,
  },

  inputPassword: {
    flex: 1,
    fontSize: 16,
  },

  button: {
    marginTop: 30,
    width: "100%",
    height: 55,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 10,
  },

  link: {
    color: "#0E457D",
    fontWeight: "bold",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
  },

  modalEmoji: {
    fontSize: 55,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0E457D",
    marginTop: 15,
    textAlign: "center",
  },

  modalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 24,
  },

  modalButton: {
    backgroundColor: "#FF42B3",
    width: "100%",
    height: 55,
    borderRadius: 16,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

});
