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
import api from "../src/service/api";
import axios from "axios";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeContext } from "@/context/ThemeContext";

type UsuarioPerfil = {
  id?: number;
  idusuario?: number;
  nome?: string;
  email?: string;
  cpf?: string;
  dataNascimento?: string;
  data_nasc?: string;
  telefone?: string;
  fk_idsexo?: number | null;
  fk_idendereco?: number | null;
  fk_idtipo?: number | null;
  foto?: string | null;
  sexo?: string | {
    id?: number;
    descricao?: string;
  };
  estado?: {
    id?: number;
    sigla?: string;
  };

  endereco?: {
    estado?: string;
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
  // const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sexo, setSexo] = useState("");

  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [estado, setEstado] = useState("");
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function obterIdUsuarioLogado() {

    // Usa o armazenamento local apenas para pegar o id da sessao.
    const usuarioSalvo = await AsyncStorage.getItem("usuario");

    if (!usuarioSalvo) return null;

    const usuarioLocal = JSON.parse(usuarioSalvo) as UsuarioPerfil;

    return usuarioLocal.id || usuarioLocal.idusuario || null;
  }

  function formatarDataParaTela(data?: string) {
    if (!data) {
      return "";
    }

    const dataLimpa = data.slice(0, 10);

    if (!dataLimpa.includes("-")) {
      return data;
    }

    const [ano, mes, dia] = dataLimpa.split("-");

    if (!ano || !mes || !dia) {
      return dataLimpa;
    }

    return `${dia}/${mes}/${ano}`;
  }

  async function carregarUsuario() {

    try {
      const idUsuario = await obterIdUsuarioLogado();

      if (!idUsuario) return;

      const response = await api.get(`/usuarios/perfil-comum/${idUsuario}`);
      const usuario = response.data?.data as UsuarioPerfil;

      if (!usuario) return;

      setUsuario(usuario);

      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      // setCpf(usuario.cpf?.startsWith("$2") ? "" : usuario.cpf || "");
      setDataNascimento(formatarDataParaTela(usuario.dataNascimento || usuario.data_nasc));
      setTelefone(usuario.telefone || "");
      setSexo(
        typeof usuario.sexo === "string"
          ? usuario.sexo
          : usuario.sexo?.descricao || ""
      );

      setEstado(usuario.endereco?.estado || usuario.estado?.sigla || "");
      setCep(usuario.endereco?.cep || "");
      setCidade(usuario.endereco?.cidade || "");
      setBairro(usuario.endereco?.bairro || "");
      setRua(usuario.endereco?.rua || "");
      setNumero(usuario.endereco?.numero || "");
      setComplemento(usuario.endereco?.complemento || "");
    } catch (error) {
      Alert.alert("Erro", obterMensagemErro(error));
    }
  }

  async function buscarCep(valorCep: string) {

    setCep(valorCep);

    const cepLimpo = valorCep.replace(/\D/g, "");

    if (cepLimpo.length < 8) return;

    try {

      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data = await response.json();

      setCidade(data.localidade || "");
      setBairro(data.bairro || "");
      setRua(data.logradouro || "");
      setEstado(data.uf || "");

    } catch (error) {

      Alert.alert(
        "Erro",
        "Não foi possível buscar o CEP."
      );
    }
  }

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

    return "Nao foi possivel atualizar o perfil.";
  }

  function obterIdUsuario() {
    return usuario?.id || usuario?.idusuario;
  }

  function obterIdSexo() {
    if (usuario?.fk_idsexo) {
      return usuario.fk_idsexo;
    }

    if (typeof usuario?.sexo === "object" && usuario.sexo?.id) {
      return usuario.sexo.id;
    }

    const sexoMap: Record<string, number> = {
      Masculino: 1,
      Feminino: 2,
      "Prefiro nÃ£o dizer": 3,
      "Prefiro não dizer": 3,
    };

    return sexoMap[sexo] || null;
  }

  function formatarDataParaApi(data: string) {
    if (!data) {
      return undefined;
    }

    if (data.includes("-")) {
      return data.slice(0, 10);
    }

    const [dia, mes, ano] = data.split("/");

    if (!dia || !mes || !ano) {
      return data;
    }

    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  async function salvarAlteracoes() {

    try {
      const idUsuario = obterIdUsuario();

      if (!idUsuario) {
        Alert.alert("Erro", "UsuÃ¡rio nÃ£o encontrado.");
        return;
      }

      const body = {
        nome,
        email,
        telefone,
        fk_idsexo: obterIdSexo(),
        data_nasc: formatarDataParaApi(dataNascimento),
        // ...(cpf ? { cpf } : {}),
        endereco: {
          estado,
          cep,
          cidade,
          bairro,
          rua,
          numero,
          complemento,
        },
      };

      const response = await api.put(`/usuarios/editar-comum/${idUsuario}`, body);

      if (response.data?.success === false) {
        throw new Error(response.data.message || "Nao foi possivel atualizar o perfil.");
      }

      Alert.alert(
        "Sucesso",
        "Perfil atualizado com sucesso."
      );

      router.back();
    } catch (error) {
      Alert.alert(
        "Erro",
        obterMensagemErro(error)
      );
    }
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

          {/* <Input
            label="CPF"
            value={cpf}
            onChangeText={setCpf}
            isDark={isDark}
          /> */}

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



// import React, { useEffect, useRef, useState } from "react";

// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   TextInput,
//   KeyboardTypeOptions,
//   Modal,
//   Animated,
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useThemeContext } from "@/context/ThemeContext";

// type UsuarioPerfil = {
//   nome?: string;
//   email?: string;
//   cpf?: string;
//   dataNascimento?: string;
//   telefone?: string;
//   sexo?: string;
//   senha?: string;

//   endereco?: {
//     cep?: string;
//     cidade?: string;
//     bairro?: string;
//     rua?: string;
//     numero?: string;
//     complemento?: string;
//   };
// };

// const EditarUserComum = () => {

//   const router = useRouter();

//   const { theme } = useThemeContext();

//   const isDark = theme === "dark";

//   const [nome, setNome] = useState("");
//   const [email, setEmail] = useState("");
//   const [cpf, setCpf] = useState("");
//   const [dataNascimento, setDataNascimento] = useState("");
//   const [telefone, setTelefone] = useState("");
//   const [sexo, setSexo] = useState("");

//   const [cep, setCep] = useState("");
//   const [cidade, setCidade] = useState("");
//   const [bairro, setBairro] = useState("");
//   const [rua, setRua] = useState("");
//   const [numero, setNumero] = useState("");
//   const [complemento, setComplemento] = useState("");

//   // =========================
//   // SENHA
//   // =========================

//   const [senhaSalva, setSenhaSalva] = useState("");

//   const [senhaAtual, setSenhaAtual] = useState("");
//   const [novaSenha, setNovaSenha] = useState("");
//   const [confirmarSenha, setConfirmarSenha] = useState("");

//   const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
//   const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
//   const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

//   // =========================
//   // MODAL FEEDBACK
//   // =========================

//   const [feedbackVisible, setFeedbackVisible] = useState(false);

//   const [feedbackEmoji, setFeedbackEmoji] = useState("✅");
//   const [feedbackTitle, setFeedbackTitle] = useState("");
//   const [feedbackMessage, setFeedbackMessage] = useState("");

//   const scaleAnim = useRef(new Animated.Value(0.7)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     carregarUsuario();
//   }, []);

//   useEffect(() => {

//     if (feedbackVisible) {

//       scaleAnim.setValue(0.7);
//       opacityAnim.setValue(0);

//       Animated.parallel([
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           useNativeDriver: true,
//         }),

//         Animated.timing(opacityAnim, {
//           toValue: 1,
//           duration: 250,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }

//   }, [feedbackVisible]);

//   // =========================
//   // MÁSCARAS
//   // =========================

//   function maskTelefone(value: string) {

//     let cleaned = value.replace(/\D/g, "");

//     cleaned = cleaned.slice(0, 11);

//     if (cleaned.length <= 2) {
//       return `(${cleaned}`;
//     }

//     if (cleaned.length <= 7) {
//       return cleaned.replace(
//         /^(\d{2})(\d+)/,
//         "($1) $2"
//       );
//     }

//     return cleaned.replace(
//       /^(\d{2})(\d{5})(\d+)/,
//       "($1) $2-$3"
//     );
//   }

//   function maskCPF(value: string) {

//     let cleaned = value.replace(/\D/g, "");

//     cleaned = cleaned.slice(0, 11);

//     return cleaned
//       .replace(/^(\d{3})(\d)/, "$1.$2")
//       .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
//       .replace(/\.(\d{3})(\d)/, ".$1-$2");
//   }

//   function maskCEP(value: string) {

//     let cleaned = value.replace(/\D/g, "");

//     cleaned = cleaned.slice(0, 8);

//     return cleaned.replace(
//       /^(\d{5})(\d)/,
//       "$1-$2"
//     );
//   }

//   function maskDataNascimento(value: string) {

//     let cleaned = value.replace(/\D/g, "");

//     cleaned = cleaned.slice(0, 8);

//     return cleaned
//       .replace(/^(\d{2})(\d)/, "$1/$2")
//       .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
//   }

//   // =========================
//   // CARREGAR USUÁRIO
//   // =========================

//   async function carregarUsuario() {

//     const usuarioSalvo = await AsyncStorage.getItem("usuario");

//     if (!usuarioSalvo) return;

//     const usuario = JSON.parse(usuarioSalvo) as UsuarioPerfil;

//     setNome(usuario.nome || "");
//     setEmail(usuario.email || "");

//     setCpf(
//       maskCPF(usuario.cpf || "")
//     );

//     setDataNascimento(
//       maskDataNascimento(
//         usuario.dataNascimento || ""
//       )
//     );

//     setTelefone(
//       maskTelefone(usuario.telefone || "")
//     );

//     setSexo(usuario.sexo || "");

//     setSenhaSalva(usuario.senha || "");

//     setCep(
//       maskCEP(usuario.endereco?.cep || "")
//     );

//     setCidade(usuario.endereco?.cidade || "");
//     setBairro(usuario.endereco?.bairro || "");
//     setRua(usuario.endereco?.rua || "");
//     setNumero(usuario.endereco?.numero || "");
//     setComplemento(usuario.endereco?.complemento || "");
//   }

//   // =========================
//   // BUSCAR CEP
//   // =========================

//   async function buscarCep(valorCep: string) {

//     const cepFormatado = maskCEP(valorCep);

//     setCep(cepFormatado);

//     const cepLimpo = valorCep.replace(/\D/g, "");

//     if (cepLimpo.length < 8) return;

//     try {

//       const response = await fetch(
//         `https://viacep.com.br/ws/${cepLimpo}/json/`
//       );

//       const data = await response.json();

//       setCidade(data.localidade || "");
//       setBairro(data.bairro || "");
//       setRua(data.logradouro || "");

//     } catch (error) {

//       setFeedbackEmoji("⚠️");

//       setFeedbackTitle("Erro");

//       setFeedbackMessage(
//         "Não foi possível buscar o CEP."
//       );

//       setFeedbackVisible(true);
//     }
//   }

//   // =========================
//   // SALVAR ALTERAÇÕES
//   // =========================

//   async function salvarAlteracoes() {

//     // =========================
//     // VALIDAÇÃO SENHA
//     // =========================

//     if (
//       senhaAtual ||
//       novaSenha ||
//       confirmarSenha
//     ) {

//       if (senhaAtual !== senhaSalva) {

//         setFeedbackEmoji("🔒");

//         setFeedbackTitle("Senha incorreta");

//         setFeedbackMessage(
//           "A senha atual informada está incorreta."
//         );

//         setFeedbackVisible(true);

//         return;
//       }

//       if (novaSenha.length < 6) {

//         setFeedbackEmoji("⚠️");

//         setFeedbackTitle("Senha inválida");

//         setFeedbackMessage(
//           "A nova senha deve ter pelo menos 6 caracteres."
//         );

//         setFeedbackVisible(true);

//         return;
//       }

//       if (novaSenha !== confirmarSenha) {

//         setFeedbackEmoji("❌");

//         setFeedbackTitle("Senhas diferentes");

//         setFeedbackMessage(
//           "A confirmação da senha não confere."
//         );

//         setFeedbackVisible(true);

//         return;
//       }
//     }

//     const usuarioAtualizado = {

//       nome,
//       email,
//       cpf,
//       dataNascimento,
//       telefone,
//       sexo,

//       senha: novaSenha
//         ? novaSenha
//         : senhaSalva,

//       endereco: {
//         cep,
//         cidade,
//         bairro,
//         rua,
//         numero,
//         complemento,
//       },
//     };

//     await AsyncStorage.setItem(
//       "usuario",
//       JSON.stringify(usuarioAtualizado)
//     );

//     setFeedbackEmoji("✅");

//     setFeedbackTitle("Perfil atualizado");

//     setFeedbackMessage(
//       "Suas alterações foram salvas com sucesso."
//     );

//     setFeedbackVisible(true);
//   }

//   return (

//     <SafeAreaView
//       style={[
//         styles.safeArea,
//         {
//           backgroundColor: isDark
//             ? "#121212"
//             : "#F4F7FB"
//         }
//       ]}
//     >

//       {/* MODAL SUCESSO */}

//       <Modal
//         transparent
//         animationType="fade"
//         visible={feedbackVisible}
//       >

//         <View style={styles.modalOverlay}>

//           <Animated.View
//             style={[
//               styles.feedbackContainer,
//               {
//                 backgroundColor: isDark
//                   ? "#1E1E1E"
//                   : "#FFFFFF",

//                 opacity: opacityAnim,
//                 transform: [{ scale: scaleAnim }],
//               }
//             ]}
//           >

//             <Text style={styles.feedbackEmoji}>
//               {feedbackEmoji}
//             </Text>

//             <Text
//               style={[
//                 styles.feedbackTitle,
//                 {
//                   color: isDark
//                     ? "#FFFFFF"
//                     : "#0E457D"
//                 }
//               ]}
//             >
//               {feedbackTitle}
//             </Text>

//             <Text
//               style={[
//                 styles.feedbackMessage,
//                 {
//                   color: isDark
//                     ? "#CCCCCC"
//                     : "#555555"
//                 }
//               ]}
//             >
//               {feedbackMessage}
//             </Text>

//             <TouchableOpacity
//               style={styles.feedbackButton}
//               onPress={() => {

//                 setFeedbackVisible(false);

//                 if (
//                   feedbackTitle ===
//                   "Perfil atualizado"
//                 ) {
//                   router.back();
//                 }
//               }}
//             >

//               <Text style={styles.feedbackButtonText}>
//                 Entendi
//               </Text>

//             </TouchableOpacity>

//           </Animated.View>

//         </View>

//       </Modal>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.container}
//       >

//         {/* HEADER */}

//         <View style={styles.header}>

//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >

//             <Icon
//               name="arrow-left"
//               size={28}
//               color="#FFFFFF"
//             />

//           </TouchableOpacity>

//           <Text style={styles.headerTitle}>
//             Editar Perfil
//           </Text>

//         </View>

//         {/* DADOS PESSOAIS */}

//         <View
//           style={[
//             styles.card,
//             {
//               backgroundColor: isDark
//                 ? "#1E1E1E"
//                 : "#FFFFFF"
//             }
//           ]}
//         >

//           <Text
//             style={[
//               styles.sectionTitle,
//               {
//                 color: isDark
//                   ? "#FFFFFF"
//                   : "#0E457D"
//               }
//             ]}
//           >
//             Dados pessoais
//           </Text>

//           <Input
//             label="Nome"
//             value={nome}
//             onChangeText={setNome}
//             isDark={isDark}
//           />

//           <Input
//             label="E-mail"
//             value={email}
//             onChangeText={setEmail}
//             isDark={isDark}
//             keyboardType="email-address"
//           />

//           <Input
//             label="CPF"
//             value={cpf}
//             onChangeText={(text) =>
//               setCpf(maskCPF(text))
//             }
//             isDark={isDark}
//             keyboardType="numeric"
//           />

//           <Input
//             label="Data de nascimento"
//             value={dataNascimento}
//             onChangeText={(text) =>
//               setDataNascimento(
//                 maskDataNascimento(text)
//               )
//             }
//             isDark={isDark}
//             keyboardType="numeric"
//           />

//           <Input
//             label="Telefone"
//             value={telefone}
//             onChangeText={(text) =>
//               setTelefone(
//                 maskTelefone(text)
//               )
//             }
//             isDark={isDark}
//             keyboardType="numeric"
//           />

//         </View>

//         {/* ALTERAR SENHA */}

//         <View
//           style={[
//             styles.card,
//             {
//               backgroundColor: isDark
//                 ? "#1E1E1E"
//                 : "#FFFFFF"
//             }
//           ]}
//         >

//           <Text
//             style={[
//               styles.sectionTitle,
//               {
//                 color: isDark
//                   ? "#FFFFFF"
//                   : "#0E457D"
//               }
//             ]}
//           >
//             Alterar senha
//           </Text>

//           <PasswordInput
//             label="Senha atual"
//             value={senhaAtual}
//             onChangeText={setSenhaAtual}
//             isDark={isDark}
//             secureTextEntry={!mostrarSenhaAtual}
//             onToggleVisibility={() =>
//               setMostrarSenhaAtual(
//                 !mostrarSenhaAtual
//               )
//             }
//             visible={mostrarSenhaAtual}
//           />

//           <PasswordInput
//             label="Nova senha"
//             value={novaSenha}
//             onChangeText={setNovaSenha}
//             isDark={isDark}
//             secureTextEntry={!mostrarNovaSenha}
//             onToggleVisibility={() =>
//               setMostrarNovaSenha(
//                 !mostrarNovaSenha
//               )
//             }
//             visible={mostrarNovaSenha}
//           />

//           <PasswordInput
//             label="Confirmar nova senha"
//             value={confirmarSenha}
//             onChangeText={setConfirmarSenha}
//             isDark={isDark}
//             secureTextEntry={!mostrarConfirmarSenha}
//             onToggleVisibility={() =>
//               setMostrarConfirmarSenha(
//                 !mostrarConfirmarSenha
//               )
//             }
//             visible={mostrarConfirmarSenha}
//           />

//         </View>

//         {/* ENDEREÇO */}

//         <View
//           style={[
//             styles.card,
//             {
//               backgroundColor: isDark
//                 ? "#1E1E1E"
//                 : "#FFFFFF"
//             }
//           ]}
//         >

//           <Text
//             style={[
//               styles.sectionTitle,
//               {
//                 color: isDark
//                   ? "#FFFFFF"
//                   : "#0E457D"
//               }
//             ]}
//           >
//             Endereço
//           </Text>

//           <Input
//             label="CEP"
//             value={cep}
//             onChangeText={buscarCep}
//             isDark={isDark}
//             keyboardType="numeric"
//           />

//           <Input
//             label="Cidade"
//             value={cidade}
//             onChangeText={setCidade}
//             isDark={isDark}
//           />

//           <Input
//             label="Bairro"
//             value={bairro}
//             onChangeText={setBairro}
//             isDark={isDark}
//           />

//           <Input
//             label="Rua"
//             value={rua}
//             onChangeText={setRua}
//             isDark={isDark}
//           />

//           <Input
//             label="Número"
//             value={numero}
//             onChangeText={setNumero}
//             isDark={isDark}
//             keyboardType="numeric"
//           />

//           <Input
//             label="Complemento"
//             value={complemento}
//             onChangeText={setComplemento}
//             isDark={isDark}
//           />

//         </View>

//         {/* BOTÃO */}

//         <TouchableOpacity
//           style={styles.saveButton}
//           onPress={salvarAlteracoes}
//         >

//           <Icon
//             name="content-save-outline"
//             size={22}
//             color="#FFFFFF"
//           />

//           <Text style={styles.saveButtonText}>
//             Salvar alterações
//           </Text>

//         </TouchableOpacity>

//       </ScrollView>

//     </SafeAreaView>
//   );
// };

// type InputProps = {
//   label: string;
//   value: string;
//   onChangeText: (text: string) => void;
//   isDark: boolean;
//   keyboardType?: KeyboardTypeOptions;
// };

// const Input = ({
//   label,
//   value,
//   onChangeText,
//   isDark,
//   keyboardType = "default"
// }: InputProps) => {

//   return (

//     <View style={styles.inputContainer}>

//       <Text
//         style={[
//           styles.inputLabel,
//           {
//             color: isDark
//               ? "#BBBBBB"
//               : "#666666"
//           }
//         ]}
//       >
//         {label}
//       </Text>

//       <TextInput
//         value={value}
//         onChangeText={onChangeText}
//         keyboardType={keyboardType}
//         style={[
//           styles.input,
//           {
//             backgroundColor: isDark
//               ? "#2A2A2A"
//               : "#F1F5F4",

//             color: isDark
//               ? "#FFFFFF"
//               : "#000000"
//           }
//         ]}
//         placeholder={label}
//         placeholderTextColor="#999"
//       />

//     </View>
//   );
// };

// type PasswordInputProps = {
//   label: string;
//   value: string;
//   onChangeText: (text: string) => void;
//   isDark: boolean;
//   secureTextEntry: boolean;
//   onToggleVisibility: () => void;
//   visible: boolean;
// };

// const PasswordInput = ({
//   label,
//   value,
//   onChangeText,
//   isDark,
//   secureTextEntry,
//   onToggleVisibility,
//   visible,
// }: PasswordInputProps) => {

//   return (

//     <View style={styles.inputContainer}>

//       <Text
//         style={[
//           styles.inputLabel,
//           {
//             color: isDark
//               ? "#BBBBBB"
//               : "#666666"
//           }
//         ]}
//       >
//         {label}
//       </Text>

//       <View
//         style={[
//           styles.passwordContainer,
//           {
//             backgroundColor: isDark
//               ? "#2A2A2A"
//               : "#F1F5F4",
//           }
//         ]}
//       >

//         <TextInput
//           value={value}
//           onChangeText={onChangeText}
//           secureTextEntry={secureTextEntry}
//           style={[
//             styles.passwordInput,
//             {
//               color: isDark
//                 ? "#FFFFFF"
//                 : "#000000"
//             }
//           ]}
//           placeholder={label}
//           placeholderTextColor="#999"
//         />

//         <TouchableOpacity
//           onPress={onToggleVisibility}
//         >

//           <Icon
//             name={
//               visible
//                 ? "eye-off-outline"
//                 : "eye-outline"
//             }
//             size={22}
//             color="#999"
//           />

//         </TouchableOpacity>

//       </View>

//     </View>
//   );
// };

// const styles = StyleSheet.create({

//   safeArea: {
//     flex: 1,
//   },

//   container: {
//     paddingBottom: 60,
//     alignItems: "center",
//   },

//   header: {
//     width: "90%",
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 30,
//     marginBottom: 25,
//   },

//   backButton: {
//     width: 45,
//     height: 45,
//     borderRadius: 14,
//     backgroundColor: "#FF42B3",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 30,
//   },

//   headerTitle: {
//     fontSize: 26,
//     fontWeight: "bold",
//     color: "#0E457D",
//     marginLeft: 18,
//     marginTop: 25,
//   },

//   card: {
//     width: "90%",
//     borderRadius: 28,
//     padding: 24,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 10,
//     elevation: 5,
//   },

//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 25,
//   },

//   inputContainer: {
//     marginBottom: 18,
//   },

//   inputLabel: {
//     fontSize: 14,
//     marginBottom: 8,
//     fontWeight: "500",
//   },

//   input: {
//     width: "100%",
//     height: 56,
//     borderRadius: 16,
//     paddingHorizontal: 18,
//     fontSize: 16,
//   },

//   passwordContainer: {
//     width: "100%",
//     height: 56,
//     borderRadius: 16,
//     paddingHorizontal: 18,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   passwordInput: {
//     flex: 1,
//     fontSize: 16,
//   },

//   saveButton: {
//     width: "90%",
//     height: 60,
//     backgroundColor: "#FF42B3",
//     borderRadius: 18,
//     marginTop: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//   },

//   saveButtonText: {
//     color: "#FFFFFF",
//     fontSize: 17,
//     fontWeight: "bold",
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 30,
//   },

//   feedbackContainer: {
//     width: "100%",
//     borderRadius: 25,
//     padding: 30,
//     alignItems: "center",
//   },

//   feedbackEmoji: {
//     fontSize: 55,
//   },

//   feedbackTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginTop: 15,
//     textAlign: "center",
//   },

//   feedbackMessage: {
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 15,
//     lineHeight: 24,
//   },

//   feedbackButton: {
//     backgroundColor: "#FF42B3",
//     width: "100%",
//     height: 55,
//     borderRadius: 16,
//     marginTop: 25,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   feedbackButtonText: {
//     color: "#FFFFFF",
//     fontWeight: "bold",
//     fontSize: 18,
//   },

// });

// export default EditarUserComum;