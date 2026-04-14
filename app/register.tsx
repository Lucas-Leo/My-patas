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

import { Link, useNavigation } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

const logoApp = require("@/assets/images/LogoPataAzul.png");

export default function Register() {
  const [nome, setNome] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [celular, setCelular] = useState<string>("");
  const isFormComplete = !!(nome && login && password && password2 && celular);

  const navigation = useNavigation();

  function formatarTelefone(valor: string) {
    let numeros = valor.replace(/\D/g, "");

    if (numeros.length > 11) numeros = numeros.slice(0, 11);

    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  function validarEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function onClickRegistrar() {
    if (!nome || !login || !password || !password2 || !celular) {
      Alert.alert("Alerta:", "Preencha todos os campos obrigatórios");
      return;
    }

    if (!validarEmail(login)) {
      Alert.alert("Erro", "Digite um e-mail válido");
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
      Alert.alert("Sucesso", "Conta criada com sucesso");
      navigation.navigate("login" as never);
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um problema ao criar a conta");
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      <View style={styles.header} >

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
          <TextInput style={styles.input}
            placeholder="Nome"
            onChangeText={(value) => { setNome(value) }}
            value={nome || ""}
          />
        </View>

        <View style={styles.containerInput}>
          {login ? <Text style={styles.fieldLabel}>E-mail</Text> : null}
          <TextInput style={styles.input}
            placeholder="E-mail"
            onChangeText={(value) => { setLogin(value) }}
            value={login || ""}
          />
        </View>

        <View style={styles.containerInput}>
          {celular ? <Text style={styles.fieldLabel}>Telefone</Text> : null}
          <TextInput style={styles.input}
            placeholder="Telefone"
            onChangeText={(value) => { setCelular(formatarTelefone(value)) }}
            value={celular}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.containerInput}>
          {password ? <Text style={styles.fieldLabel}>Senha</Text> : null}

          <View style={styles.containerSenha}>

            <TextInput style={styles.inputPassword}
              placeholder="Senha"
              onChangeText={(value) => { setPassword(value) }}
              value={password || ""}
              secureTextEntry={!showPassword}
              maxLength={8}
            />

            <TouchableOpacity
              onPress={() => { setShowPassword(!showPassword) }}
              style={[styles.iconPassword]}
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
              onChangeText={(valor) => { setPassword2(valor) }}
              value={password2 || ""}
              secureTextEntry={!showConfirmPassword}
              maxLength={8}
            />
            <TouchableOpacity
              onPress={() => { setShowConfirmPassword(!showConfirmPassword) }}
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
          onPress={() => (onClickRegistrar())}>
          <Text style={[styles.buttonText]} >
            Criar Conta
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
    borderWidth: 0,
    borderColor: "gray",
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
    backgroundColor: "#0E457D",
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