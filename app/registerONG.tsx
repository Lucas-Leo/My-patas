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
const isFormComplete = !!(nome && nomeresponsavel && login && cnpj && celular && password && password2);

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
{ backgroundColor: isFormComplete ? "#FF42B3" : "#0E457D" }
]}
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

</ScrollView>
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
}

});