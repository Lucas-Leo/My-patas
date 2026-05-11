import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from '@expo/vector-icons';
import { Link, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";

const logoApp = require("@/assets/images/LogoPataAzul.png");

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

  const [modalVisible, setModalVisible] = useState(false);

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

  const navigation = useNavigation();

  useEffect(() => {
    if (modalVisible) {
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
  }, [modalVisible]);

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

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  function onClickRegistrar() {

    if (!isFormComplete) {
      return;
    }

    if (!validarEmail(login)) {
      return;
    }

    if (!validarCPF(cpf)) {
      return;
    }

    if (CPFsCadastrados.includes(cpf.replace(/\D/g, ""))) {
      return;
    }

    if (!validarData(dataNascimento)) {
      return;
    }

    const idade = calcularIdade(dataNascimento);

    if (idade < 18) {
      return;
    }

    if (password !== password2) {
      return;
    }

    if (password.length < 4) {
      return;
    }

    setModalVisible(true);
  }

  return (
    <View style={styles.container}>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
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
              🐾
            </Text>

            <Text style={styles.modalTitle}>
              Falta só mais um passo
            </Text>

            <Text style={styles.modalText}>
              Queremos conhecer melhor você para deixar sua experiência mais personalizada.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("completarperfil" as never);
              }}
            >
              <Text style={styles.modalButtonText}>
                Completar perfil
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
            {dataNascimento ? <Text style={styles.fieldLabel}>Data de nascimento</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Data de nascimento"
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
            {password2 ? <Text style={styles.fieldLabel}>Confirmar senha</Text> : null}

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
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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