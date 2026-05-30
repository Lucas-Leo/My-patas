import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator // Adicionado para o feedback visual de carregamento
} from "react-native";

import { Link, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

const logoApp = require("@/assets/images/LogoPataAzul.png");

export default function RegisterONG(){

  const [nome,setNome] = useState("");
  const [nomeresponsavel,setNomeResponsavel] = useState("");
  const [login,setLogin] = useState("");
  const [cnpj,setCNPJ] = useState("");
  const [password,setPassword] = useState("");
  const [password2,setPassword2] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [showConfirmPassword,setShowConfirmPassword] = useState(false);
  const [celular,setCelular] = useState("");

  const [usuarioComumCriado,setUsuarioComumCriado] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar a requisição da API

  const [modalVisible,setModalVisible] = useState(false);
  const [modalTitle,setModalTitle] = useState("");
  const [modalMessage,setModalMessage] = useState("");
  const [showRedirectButton,setShowRedirectButton] = useState(false);

  const isFormComplete = !!(
    nome &&
    nomeresponsavel &&
    login &&
    cnpj &&
    celular &&
    password &&
    password2
  );

  function abrirModal(title,message,redirect = false){
    setModalTitle(title);
    setModalMessage(message);
    setShowRedirectButton(redirect);
    setModalVisible(true);
  }

  function mascaraCNPJ(value){
    value = value.replace(/\D/g,"")
    value = value.replace(/^(\d{2})(\d)/,"$1.$2")
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3")
    value = value.replace(/\.(\d{3})(\d)/,".$1/$2")
    value = value.replace(/(\d{4})(\d)/,"$1-$2")
    return value
  }

  function mascaraTelefone(value){
    value = value.replace(/\D/g,"")
    value = value.replace(/^(\d{2})(\d)/g,"($1) $2")
    value = value.replace(/(\d)(\d{4})$/,"$1-$2")
    return value
  }

  function validarCNPJ(cnpj){
    const numero = cnpj.replace(/\D/g,"")
    return numero.length === 14
  }

  function validarTelefone(telefone){
    const numero = telefone.replace(/\D/g,"")
    return numero.length >= 10
  }

  function validarEmail(email){
    const regex = /\S+@\S+\.\S+/
    return regex.test(email)
  }

  // Função assíncrona para consultar a API gratuita da BrasilAPI
  async function verificarCNPJNoRegistro(cnpjLimpo) {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (response.status === 404) {
        return { valido: false, mensagem: "CNPJ não encontrado na base de dados da Receita Federal." };
      }

      if (!response.ok) {
        return { valido: false, mensagem: "Erro ao conectar com o serviço de verificação. Tente novamente." };
      }

      const dados = await response.json();

      // Verifica se a empresa/ONG está ativa
      if (dados.situacao_cadastral !== 2 && dados.descricao_situacao_cadastral !== "ATIVA") {
        return { valido: false, mensagem: `Este CNPJ não está ativo (Situação: ${dados.descricao_situacao_cadastral || 'Inativa'}).` };
      }

      return { valido: true, dados };
    } catch (error) {
      console.log("Erro na requisição da API:", error);
      return { valido: false, mensagem: "Não foi possível validar o CNPJ no momento. Verifique sua conexão." };
    }
  }

  async function onClickRegistrarONG(){
    // Evita cliques múltiplos enquanto a API processa
    if (loading) return; 

    try {
      let camposFaltando = []

      if(!nome) camposFaltando.push("Nome da ONG")
      if(!nomeresponsavel) camposFaltando.push("Nome do responsável")
      if(!login) camposFaltando.push("E-mail")
      if(!cnpj) camposFaltando.push("CNPJ")
      if(!celular) camposFaltando.push("Telefone")
      if(!password) camposFaltando.push("Senha")
      if(!password2) camposFaltando.push("Confirmação de senha")

      if(camposFaltando.length > 0){
        abrirModal("Campos obrigatórios", "Preencha todos os campos para continuar.")
        return
      }

      if(!validarEmail(login)){
        abrirModal("Erro", "E-mail inválido.")
        return
      }

      if(!validarCNPJ(cnpj)){
        abrirModal("Erro", "Formato de CNPJ inválido.")
        return
      }

      if(!validarTelefone(celular)){
        abrirModal("Erro", "Telefone inválido.")
        return
      }

      if(password !== password2){
        abrirModal("Erro", "As senhas não coincidem.")
        return
      }

      // --- 1º PASSO: VALIDAÇÃO DO CNPJ NA API EXTERNA ---
      setLoading(true);
      const cnpjLimpo = cnpj.replace(/\D/g, "");
      const resultadoAPI = await verificarCNPJNoRegistro(cnpjLimpo);
      setLoading(false);

      if (!resultadoAPI.valido) {
        abrirModal("CNPJ Inválido/Inativo", resultadoAPI.mensagem);
        return;
      }
      
      // --- 2º PASSO: AGORA VERIFICA SE O USUÁRIO COMUM JÁ EXISTE ---
      if(!usuarioComumCriado){
        abrirModal(
          "Conta necessária",
          "Para criar uma conta de ONG, primeiro é necessário criar uma conta de usuário comum.",
          true
        )
        return
      }

      // Tudo validado com sucesso e conta comum vinculada
      abrirModal(
        "Sucesso",
        "Conta de ONG criada com sucesso!"
      )
      console.log("Cadastro ONG realizado com sucesso", resultadoAPI.dados)

    } catch(error) {
      setLoading(false);
      console.log("Erro no processo:", error)
      abrirModal(
        "Erro",
        "Ocorreu um problema durante o processo."
      )
    }
  }

  return(
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.header}>
          <Image source={logoApp} style={styles.logo}/>
          <Text style={styles.inputText}>Criar Conta</Text>
        </View>

        <View style={styles.main}>

          <View style={styles.containerInput}>
            {nome ? <Text style={styles.fieldLabel}>Nome da ONG</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Nome da ONG"
              onChangeText={(value)=>setNome(value)}
              value={nome}
            />
          </View>

          <View style={styles.containerInput}>
            {nomeresponsavel ? <Text style={styles.fieldLabel}>Nome do Responsável</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Nome do Responsável"
              onChangeText={(value)=>setNomeResponsavel(value)}
              value={nomeresponsavel}
            />
          </View>

          <View style={styles.containerInput}>
            {login ? <Text style={styles.fieldLabel}>E-mail</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              onChangeText={(value)=>setLogin(value)}
              value={login}
            />
          </View>

          <View style={styles.containerInput}>
            {cnpj ? <Text style={styles.fieldLabel}>CNPJ</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="CNPJ"
              onChangeText={(value)=>setCNPJ(mascaraCNPJ(value))}
              value={cnpj}
              keyboardType="numeric"
              maxLength={18}
              editable={!loading} // Desabilita o input enquanto carrega
            />
          </View>

          <View style={styles.containerInput}>
            {celular ? <Text style={styles.fieldLabel}>Telefone</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              onChangeText={(value)=>setCelular(mascaraTelefone(value))}
              value={celular}
              keyboardType="numeric"
              maxLength={15}
            />
          </View>

          <View style={styles.containerInput}>
            {password ? <Text style={styles.fieldLabel}>Senha</Text> : null}

            <View style={styles.containerSenha}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Senha"
                onChangeText={(value)=>setPassword(value)}
                value={password}
                secureTextEntry={!showPassword}
                maxLength={8}
              />
              <TouchableOpacity
                onPress={()=>setShowPassword(!showPassword)}
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
                onChangeText={(value)=>setPassword2(value)}
                value={password2}
                secureTextEntry={!showConfirmPassword}
                maxLength={8}
              />
              <TouchableOpacity
                onPress={()=>setShowConfirmPassword(!showConfirmPassword)}
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
                backgroundColor: loading ? "#cccccc" : (isFormComplete ? "#FF42B3" : "#0E457D")
              }
            ]}
            onPress={()=>onClickRegistrarONG()}
            disabled={loading} // Bloqueia o botão durante o loading
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Criar Conta</Text>
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
              onPress={()=>{
                setModalVisible(false);
              }}
            >
              <Ionicons
                name="close"
                size={28}
                color="#0E457D"
              />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <View style={styles.modalButtons}>
              {showRedirectButton && (
                <TouchableOpacity
                  style={[styles.modalButton,{backgroundColor:"#FF42B3"}]}
                  onPress={()=>{
                    setModalVisible(false);
                    router.push("/register");
                  }}
                >
                  <Text style={styles.modalButtonText}>Criar conta comum</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
}

export const styles = StyleSheet.create({
  container:{
    flex:1,
    marginTop:45,
    backgroundColor:"#ffffff",
    paddingLeft:20,
    paddingRight:20
  },
  scrollContent:{
    paddingBottom:20
  },
  header:{
    width:"100%",
    alignItems:"center",
    justifyContent:"center",
    padding:20,
    marginTop:20
  },
  main:{
    width:"100%",
    alignItems:"center",
    justifyContent:"flex-start",
    padding:20,
    gap:20
  },
  footer:{
    width:"100%",
    alignItems:"center",
    justifyContent:"center",
    paddingTop:10,
    paddingBottom:20,
    flexDirection:"row",
    gap:5
  },
  logo:{
    width:200,
    height:90
  },
  containerInput:{
    width:"100%",
    padding:5,
    borderRadius:15,
    paddingLeft:10
  },
  inputText:{
    fontWeight:"bold",
    fontSize:30,
    color:"#0E457D",
    padding:30
  },
  input:{
    backgroundColor:"#F1F5F4",
    width:"100%",
    height:60,
    marginTop:4,
    borderRadius:30,
    fontSize:16,
    padding:20
  },
  fieldLabel:{
    fontSize:13,
    fontWeight:"600",
    color:"#0E457D",
    marginBottom:6,
    marginLeft:14
  },
  link:{
    color:"#0E457D",
    fontWeight:"bold"
  },
  button:{
    marginTop:45,
    width:"100%",
    height:50,
    borderRadius:10,
    alignItems:"center",
    justifyContent:"center"
  },
  buttonText:{
    color:"#ffffff",
    fontSize:20,
    fontWeight:"bold"
  },
  containerSenha:{
    backgroundColor:"#F1F5F4",
    flexDirection:"row",
    alignItems:"center",
    width:"100%",
    height:60,
    borderRadius:30,
    paddingLeft:20,
    paddingRight:20
  },
  inputPassword:{
    flex:1,
    fontSize:16
  },
  iconPassword:{
    alignItems:"center",
    justifyContent:"center",
    paddingHorizontal:5
  },
  modalOverlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.5)",
    justifyContent:"center",
    alignItems:"center",
    padding:20
  },
  modalContainer:{
    width:"100%",
    backgroundColor:"#fff",
    borderRadius:25,
    padding:25,
    alignItems:"center",
    position:"relative"
  },
  closeButton:{
    position:"absolute",
    top:15,
    right:15,
    zIndex:10
  },
  modalTitle:{
    fontSize:22,
    fontWeight:"bold",
    color:"#0E457D",
    marginBottom:15,
    textAlign:"center",
    marginTop:10
  },
  modalMessage:{
    fontSize:16,
    color:"#444",
    textAlign:"center",
    lineHeight:24
  },
  modalButtons:{
    width:"100%",
    marginTop:25,
    gap:10
  },
  modalButton:{
    width:"100%",
    height:50,
    backgroundColor:"#0E457D",
    borderRadius:12,
    alignItems:"center",
    justifyContent:"center"
  },
  modalButtonText:{
    color:"#fff",
    fontSize:16,
    fontWeight:"bold"
  }
});