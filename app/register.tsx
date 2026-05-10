import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import axios, { AxiosError } from "axios";
import { Link, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

const logoApp = require("@/assets/images/LogoPataAzul.png");

// Simulação de CPFs já cadastrados
const CPFsCadastrados = ["12345678900"];

export default function Register() {
  const [nome, setNome] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [dataNascimento, setDataNascimento] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

  const isFormComplete = !!(nome && login && password && password2 && cpf && dataNascimento);

  type UsuarioResponse = {
    mensagem?: string;
    erro?: string;
  };

  async function criarConta(): Promise<UsuarioResponse> {
    try {
      const res = await axios.post<UsuarioResponse>(
        "http://192.168.14.214:6788/usuarios",
        {
          nome,
          email: login,
          data_nasc: dataNascimento,
          cpf: cpf.replace(/\D/g, ""),
          senha: password,
          fk_idtipo: 1
        }
      );

      return res.data;

    } catch (error) {
      const err = error as AxiosError<UsuarioResponse>;

      console.log(err.response?.data || err.message);
      throw err;

    }
  }

  const navigation = useNavigation();

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

    if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(clean[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean[9])) return false;

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

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  async function onClickRegistrar(): Promise<void> {
    if (!nome || !login || !password || !password2 || !cpf || !dataNascimento) {
      Alert.alert("Alerta:", "Preencha todos os campos obrigatórios");
      return;
    } else if (!validarEmail(login)) {
      Alert.alert("Erro", "Digite um e-mail válido");
      return;
    // } else if (!validarCPF(cpf)) {
    //   Alert.alert("Erro", "CPF inválido");
    //   return;
    } else if (!validarData(dataNascimento)) {
      Alert.alert("Erro", "Data de nascimento inválida");
      return;
    }

    const idade = calcularIdade(dataNascimento);

    if (idade < 18) {
      Alert.alert("Erro", "É necessário ter 18 anos ou mais");
      return;
    }

    if (password !== password2) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    if (password.length < 4) {
      Alert.alert("Erro", "A senha deve ter pelo menos 4 caracteres");
      return;
    }

    try {
      await criarConta();

      Alert.alert("Sucesso", "Conta criada com sucesso");
      router.push("/login");

    } catch (error) {
      const err = error as AxiosError<{ erro?: string }>;

      Alert.alert(
        "Erro",
        err.response?.data?.erro || "Ocorreu um problema ao criar a conta"
      );
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Image
            height={50}
            width={100}
            source={logoApp}
            style={styles.logo}
          />
          <Text style={styles.inputText}>Criar Conta</Text>
        </View>

        <View style={styles.main}>

          <View style={styles.containerInput}>
            {nome ? <Text style={styles.fieldLabel}>Nome</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Nome"
              onChangeText={setNome}
              value={nome}
            />
          </View>

          <View style={styles.containerInput}>
            {login ? <Text style={styles.fieldLabel}>E-mail</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              onChangeText={setLogin}
              value={login}
            />
          </View>

          <View style={styles.containerInput}>
            {cpf ? <Text style={styles.fieldLabel}>CPF</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="CPF"
              onChangeText={(value) => setCpf(formatarCPF(value))}
              value={cpf}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          <View style={styles.containerInput}>
            {dataNascimento ? <Text style={styles.fieldLabel}>Data de Nascimento</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Data de Nascimento"
              onChangeText={(value) => setDataNascimento(formatarData(value))}
              value={dataNascimento}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.containerInput}>
            {password ? <Text style={styles.fieldLabel}>Senha</Text> : null}

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
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconPassword}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#0E457D"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.containerInput}>
            {password2 ? <Text style={styles.fieldLabel}>Confirme sua senha</Text> : null}
            <View style={styles.containerSenha}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Confirme sua senha"
                onChangeText={setPassword2}
                value={password2}
                secureTextEntry={!showConfirmPassword}
                maxLength={8}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.iconPassword}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#0E457D"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isFormComplete ? "#FF42B3" : "#0E457D" },
            ]}
            onPress={onClickRegistrar}
          >
            <Text style={styles.buttonText}>
              Criar Conta
            </Text>
          </TouchableOpacity>

        </View>

        <View style={styles.footer}>
          <Text>Já tenho conta.</Text>

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

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#ffffff",
    paddingLeft: 20,
    paddingRight: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  main: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    gap: 20,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 20,
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
  inputText: {
    fontWeight: "bold",
    fontSize: 30,
    color: "#0E457D",
    padding: 30,
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
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
  },
  containerSenha: {
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
  iconPassword: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  }
});