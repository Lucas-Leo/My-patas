import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeContext } from "@/context/ThemeContext";

type UsuarioPerfil = {
  nome?: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  telefone?: string;
  sexo?: string;

  endereco?: {
    cep?: string;
    cidade?: string;
    bairro?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
  };
};

const EditarUserComum = () => {

  const router = useRouter();

  const { theme } = useThemeContext();

  const isDark = theme === "dark";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sexo, setSexo] = useState("");

  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {

    const usuarioSalvo = await AsyncStorage.getItem("usuario");

    if (!usuarioSalvo) return;

    const usuario = JSON.parse(usuarioSalvo) as UsuarioPerfil;

    setNome(usuario.nome || "");
    setEmail(usuario.email || "");
    setCpf(usuario.cpf || "");
    setDataNascimento(usuario.dataNascimento || "");
    setTelefone(usuario.telefone || "");
    setSexo(usuario.sexo || "");

    setCep(usuario.endereco?.cep || "");
    setCidade(usuario.endereco?.cidade || "");
    setBairro(usuario.endereco?.bairro || "");
    setRua(usuario.endereco?.rua || "");
    setNumero(usuario.endereco?.numero || "");
    setComplemento(usuario.endereco?.complemento || "");
  }

  async function buscarCep(valorCep: string) {

    setCep(valorCep);

    if (valorCep.length < 8) return;

    try {

      const response = await fetch(
        `https://viacep.com.br/ws/${valorCep}/json/`
      );

      const data = await response.json();

      setCidade(data.localidade || "");
      setBairro(data.bairro || "");
      setRua(data.logradouro || "");

    } catch (error) {

      Alert.alert(
        "Erro",
        "Não foi possível buscar o CEP."
      );
    }
  }

  async function salvarAlteracoes() {

    const usuarioAtualizado = {

      nome,
      email,
      cpf,
      dataNascimento,
      telefone,
      sexo,

      endereco: {
        cep,
        cidade,
        bairro,
        rua,
        numero,
        complemento,
      },
    };

    await AsyncStorage.setItem(
      "usuario",
      JSON.stringify(usuarioAtualizado)
    );

    Alert.alert(
      "Sucesso",
      "Perfil atualizado com sucesso."
    );

    router.back();
  }

  return (

    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark
            ? "#121212"
            : "#F4F7FB"
        }
      ]}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >

            <Icon
              name="arrow-left"
              size={28}
              color="#FFFFFF"
            />

          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Editar Perfil
          </Text>

        </View>

        {/* DADOS PESSOAIS */}

        <View
          style={[
            styles.card,
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
            Dados pessoais
          </Text>

          <Input
            label="Nome"
            value={nome}
            onChangeText={setNome}
            isDark={isDark}
          />

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            isDark={isDark}
          />

          <Input
            label="CPF"
            value={cpf}
            onChangeText={setCpf}
            isDark={isDark}
          />

          <Input
            label="Data de nascimento"
            value={dataNascimento}
            onChangeText={setDataNascimento}
            isDark={isDark}
          />

          <Input
            label="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            isDark={isDark}
          />

        </View>

        {/* ENDEREÇO */}

        <View
          style={[
            styles.card,
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
            Endereço
          </Text>

          <Input
            label="CEP"
            value={cep}
            onChangeText={buscarCep}
            isDark={isDark}
          />

          <Input
            label="Cidade"
            value={cidade}
            onChangeText={setCidade}
            isDark={isDark}
          />

          <Input
            label="Bairro"
            value={bairro}
            onChangeText={setBairro}
            isDark={isDark}
          />

          <Input
            label="Rua"
            value={rua}
            onChangeText={setRua}
            isDark={isDark}
          />

          <Input
            label="Número"
            value={numero}
            onChangeText={setNumero}
            isDark={isDark}
          />

          <Input
            label="Complemento"
            value={complemento}
            onChangeText={setComplemento}
            isDark={isDark}
          />

        </View>

        {/* BOTÃO */}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={salvarAlteracoes}
        >

          <Icon
            name="content-save-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.saveButtonText}>
            Salvar alterações
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
};

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
};

const Input = ({
  label,
  value,
  onChangeText,
  isDark
}: InputProps) => {

  return (

    <View style={styles.inputContainer}>

      <Text
        style={[
          styles.inputLabel,
          {
            color: isDark
              ? "#BBBBBB"
              : "#666666"
          }
        ]}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          {
            backgroundColor: isDark
              ? "#2A2A2A"
              : "#F1F5F4",

            color: isDark
              ? "#FFFFFF"
              : "#000000"
          }
        ]}
        placeholder={label}
        placeholderTextColor="#999"
      />

    </View>
  );
};

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
  },

  container: {
    paddingBottom: 60,
    alignItems: "center",
  },

  header: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 25,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FF42B3",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0E457D",
    marginLeft: 18,
  },

  card: {
    width: "90%",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },

  inputContainer: {
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },

  input: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
  },

  saveButton: {
    width: "90%",
    height: 60,
    backgroundColor: "#FF42B3",
    borderRadius: 18,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

});

export default EditarUserComum;