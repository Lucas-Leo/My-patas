import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import React from "react";
import { router } from "expo-router";

const logoApp = require("@/assets/images/LogoPataAzul.png");

export default function TelaCadastro() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image height={50} width={100} source={logoApp} style={styles.logo} />
        <Text style={styles.textlogin}>Cadastre-se</Text>
      </View>

      <View style={styles.main}>
      
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#0E457D" }]}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonText}>Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#0E457D" }]}
          onPress={() => router.push("/registerONG")}
        >
          <Text style={styles.buttonText}>Cadastro ONG</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text>Já tenho conta.</Text>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Fazer Login.</Text>
          </TouchableOpacity>
        </View>
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
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    marginTop: 40,
  },

  main: {
    flex: 5 / 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#0E457D",
  },

  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  logo: {
    width: 200,
    height: 90,
  },

  textlogin: {
    fontWeight: "bold",
    fontSize: 36,
    color: "#0E457D",
  },

  link: {
    color: "#0E457D",
    fontWeight: "bold",
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

});

