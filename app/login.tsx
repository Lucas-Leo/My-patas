import * as SecureStore from 'expo-secure-store';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import api from "../backend/models/api"
import axios, { AxiosError } from "axios";
import { Link, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

const logoApp = require('@/assets/images/LogoPataAzul.png');

export default function Login() {
  const navigation = useNavigation();
  const router = useRouter();

  const [login, setLogin] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Tipo da resposta do backend
  type LoginResponse = {
    mensagem?: string;
    erro?: string;
    token?: string;
    usuario?: {
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
  };

  async function loginUsuario(): Promise<LoginResponse> {
    try {
      console.log("Iniciando login...");

      const res = await api.post<LoginResponse>(
        "/login",
        {
          email: login,
          senha: password,
        }
      );

      console.log("Login concluído com sucesso.");
      console.log("Status HTTP:", res.status);
      console.log("Resposta do servidor:", res.data);

      return res.data;
    } catch (error) {
      const err = error as AxiosError<LoginResponse>;

      console.log("=== ERRO NO LOGIN ===");
      console.log("Mensagem:", err.message);
      console.log("Código:", err.code);
      console.log("Status HTTP:", err.response?.status);
      console.log("Resposta do servidor:", err.response?.data);
      console.log("=====================");

      throw err;
    }
  }

  function validateEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function onClickButtonDisabled() {
    Alert.alert("Atenção", "Preencha os campos obrigatórios para acessar.");
    return;
  }

  async function OnClickLogin(): Promise<void> {
    if (!login || !password) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha todos os campos para continuar."
      );
      return;
    }

    if (!validateEmail(login)) {
      Alert.alert("Erro", "Digite um e-mail válido.");
      return;
    }

    try {
      const resposta = await loginUsuario();

      if (!resposta.token) {
        Alert.alert("Erro", "Token não foi retornado pelo servidor.");
        return;
      }

      await SecureStore.setItemAsync("token", resposta.token);

      if (resposta.usuario) {
        await SecureStore.setItemAsync(
          "usuario",
          JSON.stringify(resposta.usuario)
        );
      }

      Alert.alert(
        "Sucesso",
        resposta.mensagem || "Login realizado com sucesso!"
      );

      router.push("/perfil");
    } catch (error) {
      const err = error as AxiosError<{ erro?: string }>;

      Alert.alert(
        "Erro",
        err.response?.data?.erro ||
        "Ocorreu um problema ao realizar login"
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header} >
        <Image
          height={50}
          width={100}
          source={logoApp}
          style={styles.logo}
        />
        <Text style={styles.textlogin}>Login</Text>
      </View>

      <View style={styles.main}>

        <View style={styles.containerInput}>
          {login ? <Text style={styles.fieldLabel}>E-mail</Text> : null}
          <TextInput style={styles.input}
            value={login || ""}
            placeholder=" Digite seu e-mail ..."
            onChangeText={(e) => setLogin(e)}
          />
        </View>

        <View style={styles.containerInput}>
          {password ? <Text style={styles.fieldLabel}>Senha</Text> : null}
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
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#0E457D"
              />
            </TouchableOpacity>
          </View>
        </View>

        {(login || password) && (
          <TouchableOpacity
            style={[styles.button]}
            onPress={OnClickLogin}>
            <Text style={[styles.buttonText]} > Acessar </Text>
          </TouchableOpacity>
        )}

        {!login && !password && (
          <TouchableOpacity
            onPress={onClickButtonDisabled}
            style={[styles.disabledButton]}
          >
            <Text style={[styles.buttonText]} > Acessar </Text>
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
    borderWidth: 0,
    borderColor: "gray",
    borderRadius: 15,
    paddingLeft: 10,
  },

  input: {
    backgroundColor: '#F1F5F4',
    width: '100%',
    height: 60,
    borderColor: "gray",
    marginTop: 4,
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

  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
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
});