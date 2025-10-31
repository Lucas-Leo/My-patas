import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Link, useNavigation } from "expo-router";
import { useState } from "react";

import { Eye, EyeOff } from 'lucide-react-native';

const logoApp = require("@/assets/images/LogoPataAzul.png");

export default function Register() {
  const [nome, setNome] = useState<string>(null);
  const [login, setLogin] = useState<string>(null);
  const [password, setPassword] = useState<string>(null);
  const [password2, setPassword2] = useState<string>(null);
  const [viewPassword, setViewPassord] = useState<boolean>(false);
  const [ celular, setCelular] = useState<number>(null);

  function onClickRegistrar() {
    console.log("clicou para fazer registro");
    console.log(nome);
    console.log(login);
    console.log(password);
    console.log(password2);
    console.log( celular );

    if ( password != password2 )
      Alert.alert(" senhas não coincidem ...")

  }
  
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
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
          <TextInput style={styles.input}
            placeholder="Nome"
            onChangeText={(value) => { setNome(value) }}
            value={nome || ""}
          />
        </View>

        <View style={styles.containerInput}>
          <TextInput style={styles.input}
            placeholder="E-mail"
            onChangeText={(value) => { setLogin(value) }}
            value={login || ""}
          />
        </View>

        <View style={styles.containerInput}>
          <TextInput style={styles.input}
            placeholder="Telefone"
            onChangeText={(value) => { setCelular(value) }}
            value={celular || ""}
            maxLength={14}
            inputMode="tel"
          />
        </View>

        <View style={styles.containerInput}>

          <View style={styles.containerSenha}>

            <TextInput style={styles.input}
              placeholder="Senha"
              onChangeText={(value) => { setPassword(value) }}
              value={password || ""}
              secureTextEntry={viewPassword}
              maxLength={8}
            />

            <TouchableOpacity
              onPress={() => { setViewPassord(!viewPassword) }}
              style={[styles.iconPassword]}
            >
              { ( ! viewPassword ) ? (<EyeOff size={30} color={"red"} />) :
              ( <Eye size={30} color={"blue"} />) }
              

            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.containerInput}>
          <TextInput style={styles.input}
            placeholder="Confirme sua senha"
            onChangeText={(valor) => { setPassword2(valor) }}
            value={password2}
            secureTextEntry={true}
            maxLength={8}
          />
        </View>


        <TouchableOpacity
          style={[styles.button]}
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

  header: {
    flex: 3 / 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,

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
  }
  ,
  containerSenha: {
    flexDirection: "row",
    gap: 3,
  }
  , 
  iconPassword :{
    alignItems : "center",
    justifyContent: "center"
  }
});
