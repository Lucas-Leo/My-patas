import {
Alert,
Image,
StyleSheet,
Text,
TextInput,
TouchableOpacity,
View
} from "react-native";

import { Link, router } from "expo-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";

const logoApp = require("@/assets/images/LogoPataAzul.png");

export default function RegisterONG(){

const [nome,setNome] = useState("");
const [nomeresponsavel,setNomeResponsavel] = useState("");
const [login,setLogin] = useState("");
const [cnpj,setCNPJ] = useState("");
const [password,setPassword] = useState("");
const [password2,setPassword2] = useState("");
const [viewPassword,setViewPassord] = useState(true);
const [celular,setCelular] = useState("");

const [usuarioComumCriado,setUsuarioComumCriado] = useState(false);

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

function onClickRegistrarONG(){

try{

let camposFaltando = []

if(!nome) camposFaltando.push("Nome da ONG")
if(!nomeresponsavel) camposFaltando.push("Nome do responsável")
if(!login) camposFaltando.push("E-mail")
if(!cnpj) camposFaltando.push("CNPJ")
if(!celular) camposFaltando.push("Telefone")
if(!password) camposFaltando.push("Senha")
if(!password2) camposFaltando.push("Confirmação de senha")

if(camposFaltando.length > 0){
Alert.alert(
"Erro",
"Preencha os campos obrigatórios:\n\n" +
camposFaltando.map(campo => `${campo}: Campo obrigatório`).join("\n")
)
return
}

if(!validarEmail(login)){
Alert.alert("Erro","E-mail inválido.")
return
}

if(!validarCNPJ(cnpj)){
Alert.alert("Erro","CNPJ inválido.")
return
}

if(!validarTelefone(celular)){
Alert.alert("Erro","Telefone inválido.")
return
}

if(password !== password2){
Alert.alert("Erro","As senhas não coincidem.")
return
}

if(!usuarioComumCriado){
Alert.alert(
"Aviso",
"Para criar uma conta de ONG, é necessário ter uma conta de usuário comum.",
[
{
text: "Cancelar",
style: "cancel"
},
{
text: "Criar conta de usuário",
onPress: () => router.push("/register")
}
]
)
return
}

Alert.alert(
"Sucesso",
"Conta de ONG criada com sucesso!"
)

console.log("Cadastro ONG realizado com sucesso")

}catch(error){

console.log("Erro no processo:",error)
Alert.alert("Erro","Ocorreu um problema durante o processo.")

}

}

return(
<View style={styles.container}>

<View style={styles.header}>
<Image source={logoApp} style={styles.logo}/>
<Text style={styles.inputText}>Criar Conta</Text>
</View>

<View style={styles.main}>

<View style={styles.containerInput}>
<TextInput
style={styles.input}
placeholder="Nome da ONG"
onChangeText={(value)=>setNome(value)}
value={nome}
/>
</View>

<View style={styles.containerInput}>
<TextInput
style={styles.input}
placeholder="Nome do Responsável"
onChangeText={(value)=>setNomeResponsavel(value)}
value={nomeresponsavel}
/>
</View>

<View style={styles.containerInput}>
<TextInput
style={styles.input}
placeholder="E-mail"
onChangeText={(value)=>setLogin(value)}
value={login}
/>
</View>

<View style={styles.containerInput}>
<TextInput
style={styles.input}
placeholder="CNPJ"
onChangeText={(value)=>setCNPJ(mascaraCNPJ(value))}
value={cnpj}
keyboardType="numeric"
maxLength={18}
/>
</View>

<View style={styles.containerInput}>
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

<View style={styles.containerSenha}>

<TextInput
style={styles.input}
placeholder="Senha"
onChangeText={(value)=>setPassword(value)}
value={password}
secureTextEntry={viewPassword}
maxLength={8}
/>

<TouchableOpacity
onPress={()=>setViewPassord(!viewPassword)}
style={styles.iconPassword}
>

{!viewPassword ?
<Eye size={30} color={"blue"}/> :
<EyeOff size={30} color={"red"}/>
}

</TouchableOpacity>

</View>

</View>

<View style={styles.containerInput}>
<TextInput
style={styles.input}
placeholder="Confirme sua senha"
onChangeText={(value)=>setPassword2(value)}
value={password2}
secureTextEntry={true}
maxLength={8}
/>
</View>

<TouchableOpacity
style={styles.button}
onPress={()=>onClickRegistrarONG()}
>

<Text style={styles.buttonText}>
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

header:{
flex:3/10,
width:"100%",
alignItems:"center",
justifyContent:"center",
padding:20
},

main:{
flex:5/10,
width:"100%",
alignItems:"center",
justifyContent:"center",
padding:20
},

footer:{
flex:2/10,
width:"100%",
alignItems:"center",
justifyContent:"center",
padding:20,
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
padding:30,
marginBottom:30
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

link:{
color:"#0E457D",
fontWeight:"bold"
},

button:{
marginTop:10,
backgroundColor:"#0E457D",
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
flexDirection:"row",
gap:3
},

iconPassword:{
alignItems:"center",
justifyContent:"center"
}

});