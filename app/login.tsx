import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Link, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
const logoApp = require('@/assets/images/LogoPataAzul.png');

export default function Login() {
  const navigation = useNavigation();
  const router = useRouter();

  // declarar variaveis
  const [login, setLogin] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  
  function onClickButtonDisabled() {
    Alert.alert( "botão desabilitadao ! \nInforme os dados para acesso !")
    return
  }

  function OnClickLogin() {
    // validar se login e um email valido
    
    if( ! login ){
        Alert.alert(" email invalido ...");
        return
    }
    // validar login e password
    if ( login != "teste@teste.com" || password != "123"){
        Alert.alert(" login ou senha invalido...");
        return
    }
    // chama a tela de dashboard
    router.navigate('/(tabs)')
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
          <TextInput style={styles.input}
            value={login || ""}
            placeholder=" Digite seu e-mail ..."
            onChangeText={(e) => setLogin(e)}
          />
        </View>

        <View style={styles.containerInput}>
          <TextInput style={styles.input}
            placeholder="Digite sua senha..."
            onChangeText={(e) => setPassword(e)}
          />
        </View>

        { (login || password) && (
          <TouchableOpacity
            style={[styles.button]}
            onPress={ () => (OnClickLogin()) }>
            <Text style={[styles.buttonText]} > Acessar </Text>
          </TouchableOpacity>
        )}
        { !login && !password && (
          <TouchableOpacity
            onPress={ onClickButtonDisabled }
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

        <Link href="/criarconta">
          <Text style={styles.link}>
            Criar conta agora.
          </Text>
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
    padding : 20,
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

  inputText: {
    fontWeight: "bold",
    fontSize: 22,
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
    backgroundColor: '#0E457D', // Visual indication of disabled state
    opacity: 0.7,
  },

  textlogin: {
    fontWeight: "bold",
    fontSize: 36,
    color: "#0E457D"
  },
});

