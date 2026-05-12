import {
  Alert,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Picker } from '@react-native-picker/picker';

const logoApp = require("@/assets/images/LogoPataAzul.png");

type Usuario = {
  id: number;
  idusuario?: number;
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

type UsuarioSalvo = Partial<Usuario> & {
  data?: Usuario;
  usuario?: Usuario;
  idusuario?: number;
};

export default function CompletarPerfil() {

  const navigation = useNavigation();

  const [telefone, setTelefone] = useState<string>("");
  const [sexo, setSexo] = useState<string>("");

  const [cep, setCep] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [bairro, setBairro] = useState<string>("");
  const [rua, setRua] = useState<string>("");
  const [numero, setNumero] = useState<string>("");
  const [complemento, setComplemento] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isFormComplete = !!(
    telefone &&
    sexo &&
    cep &&
    estado &&
    cidade &&
    bairro &&
    rua &&
    numero
  );

  function normalizarUsuarioSalvo(valor: string): Usuario | null {
    const parsed = JSON.parse(valor) as UsuarioSalvo;
    const usuario = parsed.usuario || parsed.data || parsed;

    if (!usuario.nome) {
      return null;
    }

    const id = usuario.id || usuario.idusuario;

    if (!id) {
      return null;
    }

    return {
      ...usuario,
      id,
    } as Usuario;
  }

  async function atualizarPerfil() {
    try {

      const usuarioSalvo = await AsyncStorage.getItem("usuario");

      if (!usuarioSalvo) {
        Alert.alert("Erro", "Usuário não encontrado");
        return;
      }

      const usuario = normalizarUsuarioSalvo(usuarioSalvo);

      if (!usuario) {
        Alert.alert("Erro", "Usuario nao encontrado");
        return;
      }

      const sexoMap: any = {
        "Masculino": 1,
        "Feminino": 2,
        "Prefiro não dizer": 3
      };

      const body = {
        nome: usuario.nome,
        telefone,
        fk_idsexo: sexoMap[sexo],
        estado,
        cidade,
        bairro,
        rua,
        numero,
        cep,
        complemento
      };

      console.log("ID:", usuario.id);
      console.log("BODY:", body);

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuario,
          telefone,
          fk_idsexo: sexoMap[sexo],
          endereco: {
            rua,
            numero,
            bairro,
            cidade,
            cep,
            complemento,
            estado,
          }
        })
      );

      setModalVisible(true);
    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil"
      );
    }
  }

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

      setTimeout(() => {
        navigation.navigate("home" as never);
      }, 2500);
    }

  }, [modalVisible]);

  function formatarTelefone(valor: string) {

    let numeros = valor.replace(/\D/g, "");

    if (numeros.length > 11) {
      numeros = numeros.slice(0, 11);
    }

    if (numeros.length <= 2) {
      return `(${numeros}`;
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  function formatarCEP(valor: string) {

    let numeros = valor.replace(/\D/g, "");

    if (numeros.length > 8) {
      numeros = numeros.slice(0, 8);
    }

    return numeros.replace(/(\d{5})(\d)/, "$1-$2");
  }

  async function buscarCEP(valor: string) {

    const cepLimpo = valor.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      const data = await response.json();

      if (data.erro) {
        return;
      }

      setEstado(data.uf || "");
      setCidade(data.localidade || "");
      setBairro(data.bairro || "");
      setRua(data.logradouro || "");

    } catch (error) { }
  }

  async function onClickFinalizar() {

    if (!isFormComplete) {
      Alert.alert("Preencha todos os campos");
      return;
    }

    await atualizarPerfil();
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
              🎉
            </Text>

            <Text style={styles.modalTitle}>
              Cadastro concluído
            </Text>

            <Text style={styles.modalText}>
              Sua conta foi criada com sucesso.
              Agora você já pode encontrar seu novo melhor amigo 🐶🐱
            </Text>

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
            Etapa 2 de 2
          </Text>

          <Text style={styles.inputText}>
            Complete seu perfil
          </Text>

        </View>

        <View style={styles.main}>

          <View style={styles.containerInput}>
            {telefone ? <Text style={styles.fieldLabel}>Telefone</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Telefone"
              onChangeText={(value) => setTelefone(formatarTelefone(value))}
              value={telefone}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.containerInput}>
            {sexo ? <Text style={styles.fieldLabel}>Sexo</Text> : null}

            <View style={styles.pickerContainer}>

              <Picker
                selectedValue={sexo}
                onValueChange={(itemValue) => setSexo(itemValue)}
              >
                <Picker.Item label="Selecione o sexo" value="" />
                <Picker.Item label="Feminino" value="Feminino" />
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Prefiro não dizer" value="Prefiro não dizer" />
              </Picker>

            </View>
          </View>

          <View style={styles.containerInput}>
            {cep ? <Text style={styles.fieldLabel}>CEP</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="CEP"
              value={cep}
              onChangeText={(value) => {

                const cepFormatado = formatarCEP(value);

                setCep(cepFormatado);

                if (cepFormatado.length === 9) {
                  buscarCEP(cepFormatado);
                }
              }}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          <View style={styles.containerInput}>
            {estado ? <Text style={styles.fieldLabel}>Estado</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Estado"
              value={estado}
              onChangeText={setEstado}
            />
          </View>

          <View style={styles.containerInput}>
            {cidade ? <Text style={styles.fieldLabel}>Cidade</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Cidade"
              value={cidade}
              onChangeText={setCidade}
            />
          </View>

          <View style={styles.containerInput}>
            {bairro ? <Text style={styles.fieldLabel}>Bairro</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Bairro"
              value={bairro}
              onChangeText={setBairro}
            />
          </View>

          <View style={styles.containerInput}>
            {rua ? <Text style={styles.fieldLabel}>Rua</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Rua"
              value={rua}
              onChangeText={setRua}
            />
          </View>

          <View style={styles.containerInput}>
            {numero ? <Text style={styles.fieldLabel}>Número</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Número"
              value={numero}
              onChangeText={setNumero}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.containerInput}>
            {complemento ? <Text style={styles.fieldLabel}>Complemento</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Complemento"
              value={complemento}
              onChangeText={setComplemento}
            />
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
            onPress={onClickFinalizar}
          >

            <Text style={styles.buttonText}>
              Finalizar cadastro
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

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
    fontWeight: "bold",
    fontSize: 30,
    color: "#0E457D",
    paddingTop: 10,
  },

  main: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    gap: 20,
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

  pickerContainer: {
    backgroundColor: '#F1F5F4',
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    overflow: "hidden",
  },

  button: {
    marginTop: 45,
    width: "100%",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
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

});
