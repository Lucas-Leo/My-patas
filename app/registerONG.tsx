import {
  ActivityIndicator,
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
import axios from "axios";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../src/service/api";

const logoApp = require("@/assets/images/LogoPataAzul.png");

const ID_TIPO_ONG = 4;

type UsuarioLogado = {
  id?: number;
  idusuario?: number;
  nome?: string;
  email?: string;
  responsavelOng?: boolean;
};

type IdResponse = {
  id?: number;
  message?: string;
};

type CriarOngResponse = {
  id?: number;
  id_vinculo_responsavel?: number;
  message?: string;
};

type OngApi = {
  id?: number;
  idong?: number;
  fk_idresponsavel?: number | null;
  id_responsavel?: number | null;
  nome?: string;
  email?: string;
  telefone?: string;
  descricao?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  sigla?: string;
};

type ModalAction = "close" | "login" | "register" | "perfilONG";

export default function RegisterONG() {
  const router = useRouter();

  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [login, setLogin] = useState("");
  const [cnpj, setCNPJ] = useState("");
  const [celular, setCelular] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState<ModalAction>("close");

  const isFormComplete = !!(
    nome &&
    nomeResponsavel &&
    login &&
    cnpj &&
    celular &&
    descricao &&
    cep &&
    estado &&
    cidade &&
    bairro &&
    rua &&
    numero &&
    password &&
    password2
  );

  useEffect(() => {
    carregarSessao();
  }, []);

  async function carregarSessao() {
    const [usuarioSalvo, tokenSalvo] = await Promise.all([
      AsyncStorage.getItem("usuario"),
      AsyncStorage.getItem("token")
    ]);

    const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) as UsuarioLogado : null;
    const idUsuario = usuario?.id || usuario?.idusuario;

    setUsuarioLogado(usuario);
    setToken(tokenSalvo);
    setNomeResponsavel(usuario?.nome || "");

    if (!usuario || !idUsuario) {
      abrirModal(
        "Conta comum necessária",
        "Para cadastrar uma ONG, primeiro crie uma conta comum e faça login.",
        "register"
      );
      return;
    }

    if (!tokenSalvo) {
      abrirModal(
        "Login necessário",
        "Entre novamente na sua conta comum para liberar o cadastro de ONG.",
        "login"
      );
      return;
    }

    await verificarOngExistente(idUsuario, usuario);
  }

  async function verificarOngExistente(idUsuario: number, usuario: UsuarioLogado) {
    try {
      const response = await api.get(`/ongs/verificarOng/${idUsuario}`);
      const conta = response.data?.conta;
      const idOng = conta?.fk_idong;

      if (!idOng) {
        return;
      }

      const ongResponse = await api.get<OngApi[] | OngApi>(`/ongs/${idOng}`);
      const ongBanco = Array.isArray(ongResponse.data)
        ? ongResponse.data[0]
        : ongResponse.data;

      if (ongBanco) {
        await AsyncStorage.setItem(
          "ong",
          JSON.stringify(formatarOngParaStorage(ongBanco, idOng, conta?.idresponsavel))
        );
      }

      if (usuario) {
        const usuarioAtualizado = { ...usuario, responsavelOng: true };

        await AsyncStorage.setItem(
          "usuario",
          JSON.stringify(usuarioAtualizado)
        );

        setUsuarioLogado(usuarioAtualizado);
      }

      abrirModal(
        "ONG já cadastrada",
        "Sua conta já está vinculada a uma ONG. Você pode acessar o perfil dela agora.",
        "perfilONG"
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return;
      }

      console.log("Erro ao verificar ONG existente:", obterMensagemErro(error));
    }
  }

  function abrirModal(title: string, message: string, action: ModalAction = "close") {
    setModalTitle(title);
    setModalMessage(message);
    setModalAction(action);
    setModalVisible(true);
  }

  function fecharModal() {
    setModalVisible(false);

    if (modalAction === "login") {
      router.replace("/login");
    }

    if (modalAction === "register") {
      router.replace("/register");
    }

    if (modalAction === "perfilONG") {
      router.replace("/perfilONG");
    }
  }

  function obterTextoBotaoModal() {
    switch (modalAction) {
      case "login":
        return "Fazer login";
      case "register":
        return "Criar conta comum";
      case "perfilONG":
        return "Ir para perfil da ONG";
      default:
        return "Entendi";
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

    return "Não foi possível concluir a operação.";
  }

  function mascaraCNPJ(value: string) {
    let valor = value.replace(/\D/g, "").slice(0, 14);

    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");

    return valor;
  }

  function mascaraTelefone(value: string) {
    let valor = value.replace(/\D/g, "").slice(0, 11);

    if (valor.length <= 2) {
      return valor ? `(${valor}` : "";
    }

    if (valor.length <= 7) {
      return `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    }

    return `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
  }

  function formatarCEP(value: string) {
    const valor = value.replace(/\D/g, "").slice(0, 8);
    return valor.replace(/(\d{5})(\d)/, "$1-$2");
  }

  async function buscarCEP(value: string) {
    const cepLimpo = value.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

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
    } catch (error) {
      console.log("Erro ao buscar CEP:", error);
    }
  }

  // function validarCNPJ(cnpjValue: string) {
  //   const clean = cnpjValue.replace(/\D/g, "");

  //   if (clean.length !== 14 || /^(\d)\1+$/.test(clean)) {
  //     return false;
  //   }

  //   const calcularDigito = (base: string, pesos: number[]) => {
  //     const soma = base
  //       .split("")
  //       .reduce((acc, digit, index) => acc + Number(digit) * pesos[index], 0);
  //     const resto = soma % 11;

  //     return resto < 2 ? 0 : 11 - resto;
  //   };

  //   const primeiroDigito = calcularDigito(
  //     clean.slice(0, 12),
  //     [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  //   );
  //   const segundoDigito = calcularDigito(
  //     clean.slice(0, 12) + primeiroDigito,
  //     [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  //   );

  //   return clean.endsWith(`${primeiroDigito}${segundoDigito}`);
  // }

  function validarTelefone(telefone: string) {
    const numero = telefone.replace(/\D/g, "");
    return numero.length >= 10;
  }

  function validarEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function extrairId(resposta: IdResponse, nomeEntidade: string) {
    const id = Number(resposta.id);

    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(`Não foi possível criar ${nomeEntidade}.`);
    }

    return id;
  }

  async function criarEndereco() {
    const estadoNormalizado = estado.trim().toUpperCase();

    const estadoResponse = await api.post<IdResponse>("/estados", {
      sigla: estadoNormalizado,
      estado: estadoNormalizado
    });
    const idEstado = extrairId(estadoResponse.data, "o estado");

    const cidadeResponse = await api.post<IdResponse>("/cidades", {
      cidade: cidade.trim(),
      fk_idestado: idEstado
    });
    const idCidade = extrairId(cidadeResponse.data, "a cidade");

    const bairroResponse = await api.post<IdResponse>("/bairros", {
      bairro: bairro.trim(),
      fk_idcidade: idCidade
    });
    const idBairro = extrairId(bairroResponse.data, "o bairro");

    const ruaResponse = await api.post<IdResponse>("/ruas", {
      rua: rua.trim(),
      fk_idbairro: idBairro
    });
    const idRua = extrairId(ruaResponse.data, "a rua");

    const enderecoResponse = await api.post<IdResponse>("/enderecos", {
      fk_idcidade: idCidade,
      fk_idbairro: idBairro,
      fk_idrua: idRua,
      fk_idestado: idEstado,
      numero: numero.trim(),
      cep: cep.trim(),
      complemento: complemento.trim()
    });

    return extrairId(enderecoResponse.data, "o endereço");
  }

  function formatarOngParaStorage(
    ongBanco: OngApi,
    idFallback: number,
    idResponsavelFallback?: number | null
  ) {
    const id = Number(ongBanco.idong || ongBanco.id || idFallback);

    return {
      id,
      idong: id,
      id_responsavel:
        ongBanco.id_responsavel ||
        ongBanco.fk_idresponsavel ||
        idResponsavelFallback ||
        null,
      nome: ongBanco.nome || nome.trim(),
      email: ongBanco.email || login.trim().toLowerCase(),
      telefone: ongBanco.telefone || celular.trim(),
      descricao: ongBanco.descricao || descricao.trim(),
      categoria: "ONG Parceira",
      endereco: {
        rua: ongBanco.rua || rua.trim(),
        numero: ongBanco.numero || numero.trim(),
        bairro: ongBanco.bairro || bairro.trim(),
        cidade: ongBanco.cidade || cidade.trim(),
        cep: ongBanco.cep || cep.trim(),
        estado: ongBanco.sigla || estado.trim().toUpperCase()
      }
    };
  }

  async function salvarOngCriada(dataOng: CriarOngResponse) {
    const idNovaOng = Number(dataOng.id);

    if (!Number.isFinite(idNovaOng) || idNovaOng <= 0) {
      throw new Error(dataOng.message || "Não foi possível identificar a ONG criada.");
    }

    const ongResponse = await api.get<OngApi[] | OngApi>(`/ongs/${idNovaOng}`);
    const ongBanco = Array.isArray(ongResponse.data)
      ? ongResponse.data[0]
      : ongResponse.data;

    const ongParaSalvar = formatarOngParaStorage(
      ongBanco || {},
      idNovaOng,
      dataOng.id_vinculo_responsavel
    );

    await AsyncStorage.setItem("ong", JSON.stringify(ongParaSalvar));

    const usuarioSalvo = await AsyncStorage.getItem("usuario");
    const usuarioAtual = usuarioSalvo
      ? JSON.parse(usuarioSalvo) as UsuarioLogado
      : usuarioLogado;

    if (usuarioAtual) {
      const usuarioAtualizado = {
        ...usuarioAtual,
        responsavelOng: true
      };

      await AsyncStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
      setUsuarioLogado(usuarioAtualizado);
    }
  }

  async function onClickRegistrarONG() {
    if (loading) {
      return;
    }

    if (!isFormComplete) {
      abrirModal("Campos obrigatórios", "Preencha todos os campos para continuar.");
      return;
    }

    const idUsuario = usuarioLogado?.id || usuarioLogado?.idusuario;

    if (!usuarioLogado || !idUsuario) {
      abrirModal(
        "Conta comum necessária",
        "Para cadastrar uma ONG, primeiro crie uma conta comum e faça login.",
        "register"
      );
      return;
    }

    if (!token) {
      abrirModal(
        "Login necessário",
        "Entre novamente na sua conta comum para liberar o cadastro de ONG.",
        "login"
      );
      return;
    }

    if (!validarEmail(login)) {
      abrirModal("E-mail inválido", "Digite um endereço de e-mail válido.");
      return;
    }

    // if (!validarCNPJ(cnpj)) {
    //   abrirModal("CNPJ inválido", "Digite um CNPJ válido para continuar.");
    //   return;
    // }

    if (!validarTelefone(celular)) {
      abrirModal("Telefone inválido", "Digite um telefone com DDD.");
      return;
    }

    if (estado.trim().length !== 2) {
      abrirModal("Estado inválido", "Informe a UF com duas letras, como SP.");
      return;
    }

    if (password !== password2) {
      abrirModal("Senhas diferentes", "As senhas digitadas não coincidem.");
      return;
    }

    if (password.length < 4) {
      abrirModal("Senha muito curta", "A senha precisa ter pelo menos 4 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const fkIdEndereco = await criarEndereco();

      const responseOng = await api.post<CriarOngResponse>(
        "/ongs",
        {
          nome: nome.trim(),
          cnpj: cnpj.replace(/\D/g, ""),
          telefone: celular.trim(),
          descricao: descricao.trim(),
          fk_idendereco: fkIdEndereco,
          comp_estatuto: null,
          comp_cnpj: null,
          email: login.trim().toLowerCase(),
          senha: password,
          fk_idtipo: ID_TIPO_ONG
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await salvarOngCriada(responseOng.data);

      abrirModal(
        "ONG cadastrada",
        "Cadastro realizado com sucesso. Agora você pode acessar o perfil da ONG.",
        "perfilONG"
      );
    } catch (error) {
      console.log("Erro no cadastro de ONG:", obterMensagemErro(error));
      abrirModal("Erro ao cadastrar ONG", obterMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Image source={logoApp} style={styles.logo} />

          <Text style={styles.stepText}>
            Cadastro de ONG
          </Text>

          <Text style={styles.inputText}>
            Dados institucionais
          </Text>
        </View>

        <View style={styles.main}>
          <View style={styles.containerInput}>
            {nome ? <Text style={styles.fieldLabel}>Nome da ONG</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Nome da ONG"
              onChangeText={setNome}
              value={nome}
            />
          </View>

          <View style={styles.containerInput}>
            {nomeResponsavel ? <Text style={styles.fieldLabel}>Responsável</Text> : null}
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Responsável pela ONG"
              value={nomeResponsavel}
              editable={false}
            />
          </View>

          <View style={styles.containerInput}>
            {login ? <Text style={styles.fieldLabel}>E-mail da ONG</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="E-mail da ONG"
              onChangeText={setLogin}
              value={login}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.containerInput}>
            {cnpj ? <Text style={styles.fieldLabel}>CNPJ</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="CNPJ"
              onChangeText={(value) => setCNPJ(mascaraCNPJ(value))}
              value={cnpj}
              keyboardType="numeric"
              maxLength={18}
            />
          </View>

          <View style={styles.containerInput}>
            {celular ? <Text style={styles.fieldLabel}>Telefone</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              onChangeText={(value) => setCelular(mascaraTelefone(value))}
              value={celular}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>

          <View style={styles.containerInput}>
            {descricao ? <Text style={styles.fieldLabel}>Descrição</Text> : null}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição da ONG"
              onChangeText={setDescricao}
              value={descricao}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Endereço
          </Text>

          <View style={styles.containerInput}>
            {cep ? <Text style={styles.fieldLabel}>CEP</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="CEP"
              onChangeText={(value) => {
                const cepFormatado = formatarCEP(value);
                setCep(cepFormatado);

                if (cepFormatado.length === 9) {
                  buscarCEP(cepFormatado);
                }
              }}
              value={cep}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.containerInput, styles.smallInput]}>
              {estado ? <Text style={styles.fieldLabel}>UF</Text> : null}
              <TextInput
                style={styles.input}
                placeholder="UF"
                onChangeText={(value) => setEstado(value.toUpperCase().slice(0, 2))}
                value={estado}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>

            <View style={[styles.containerInput, styles.largeInput]}>
              {cidade ? <Text style={styles.fieldLabel}>Cidade</Text> : null}
              <TextInput
                style={styles.input}
                placeholder="Cidade"
                onChangeText={setCidade}
                value={cidade}
              />
            </View>
          </View>

          <View style={styles.containerInput}>
            {bairro ? <Text style={styles.fieldLabel}>Bairro</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Bairro"
              onChangeText={setBairro}
              value={bairro}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.containerInput, styles.largeInput]}>
              {rua ? <Text style={styles.fieldLabel}>Rua</Text> : null}
              <TextInput
                style={styles.input}
                placeholder="Rua"
                onChangeText={setRua}
                value={rua}
              />
            </View>

            <View style={[styles.containerInput, styles.smallInput]}>
              {numero ? <Text style={styles.fieldLabel}>Número</Text> : null}
              <TextInput
                style={styles.input}
                placeholder="Nº"
                onChangeText={setNumero}
                value={numero}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.containerInput}>
            {complemento ? <Text style={styles.fieldLabel}>Complemento</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Complemento"
              onChangeText={setComplemento}
              value={complemento}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Acesso
          </Text>

          <View style={styles.containerInput}>
            {password ? <Text style={styles.fieldLabel}>Senha da ONG</Text> : null}

            <View style={styles.containerSenha}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Senha da ONG"
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
              {
                backgroundColor: loading
                  ? "#B8B8B8"
                  : isFormComplete
                    ? "#FF42B3"
                    : "#0E457D"
              }
            ]}
            onPress={onClickRegistrarONG}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                Criar conta ONG
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text>Já tenho conta.</Text>

          <Link href="/login">
            <Text style={styles.link}>Fazer Login.</Text>
          </Link>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons
                name="close"
                size={28}
                color="#0E457D"
              />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={fecharModal}
            >
              <Text style={styles.modalButtonText}>
                {obterTextoBotaoModal()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#ffffff",
    paddingLeft: 20,
    paddingRight: 20
  },
  scrollContent: {
    paddingBottom: 20
  },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 20
  },
  main: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    gap: 18
  },
  footer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: "row",
    gap: 5
  },
  logo: {
    width: 200,
    height: 90
  },
  stepText: {
    color: "#FF42B3",
    fontWeight: "700",
    marginTop: 10
  },
  inputText: {
    fontWeight: "bold",
    fontSize: 30,
    color: "#0E457D",
    paddingTop: 10,
    textAlign: "center"
  },
  sectionTitle: {
    width: "100%",
    color: "#0E457D",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    paddingLeft: 10
  },
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 8
  },
  smallInput: {
    flex: 0.35
  },
  largeInput: {
    flex: 0.65
  },
  containerInput: {
    width: "100%",
    padding: 5,
    borderRadius: 15,
    paddingLeft: 10
  },
  input: {
    backgroundColor: "#F1F5F4",
    width: "100%",
    height: 60,
    marginTop: 4,
    borderRadius: 30,
    fontSize: 16,
    paddingHorizontal: 20
  },
  disabledInput: {
    color: "#555555"
  },
  textArea: {
    minHeight: 110,
    paddingTop: 18,
    borderRadius: 24
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0E457D",
    marginBottom: 6,
    marginLeft: 14
  },
  link: {
    color: "#0E457D",
    fontWeight: "bold"
  },
  button: {
    marginTop: 30,
    width: "100%",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold"
  },
  containerSenha: {
    backgroundColor: "#F1F5F4",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 60,
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 20
  },
  inputPassword: {
    flex: 1,
    fontSize: 16
  },
  iconPassword: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    position: "relative"
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0E457D",
    marginBottom: 15,
    textAlign: "center",
    marginTop: 10
  },
  modalMessage: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24
  },
  modalButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF42B3",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
