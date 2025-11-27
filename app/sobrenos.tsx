import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from "expo-router";

const logoApp = require("@/assets/images/LogoPataAzul.png");

const { width } = Dimensions.get('window');

const Integrante = ({ nome, descricao, foto }) => (
  <View style={styles.integranteContainer}>
    <Image source={foto} style={styles.integranteFoto} />
    <Text style={styles.integranteNome}>{nome}</Text>
    <Text style={styles.integranteDescricao}>{descricao}</Text>
  </View>
);

export default function SobreNos() {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Image source={logoApp} style={styles.logo} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.section}>
          <Text style={styles.titulo}>Nossa Equipe</Text>
        </View>

        <View style={styles.integrantesRow}>

          <Integrante
            nome="Camilly"
            descricao="Oi Oi, tudo bem? Sou a Camilly! Sou apaixonada por programação e fico fascinada com o que podemos desenvolver com ela. Além disso, sou apaixonada pelo mundo pet, o que me motivou a entrar neste projeto. Meu objetivo é fazer a diferença, especialmente quando se trata de melhorar a vida dos animais e das pessoas que os amam. Estou super animada com o que podemos conquistar!"
            foto={require('@/assets/images/fotoCamilly.jpg')}
          />

          <Integrante
            nome="Lucas"
            descricao="Olá, meu nome é Lucas Leonardo, tenho 23 anos e sou apaixonado pelo mundo do design gráfico. Amo animais e acredito que a criatividade pode transformar o mundo ao nosso redor. Para saber mais me siga em minha redes sociais! @lucasalvesdesing"
            foto={require('@/assets/images/fotoLucas.jpg')}
          />

          <Integrante
            nome="Bárbara"
            descricao="Oi! Eu sou a Bárbara, apaixonada por animais e dedicada a proteger nossos amigos de quatro patas. No Patas Conscientes, trabalhamos com muita alegria e dedicação para promover o bem-estar e a conscientização sobre os direitos dos animais. Junte-se a nós nessa causa tão importante!"
            foto={require('@/assets/images/fotoBarbara.jpg')}
          />

          <Integrante
            nome="Maria"
            descricao="Olá! Tenho 18 anos e sou apaixonada por animais, então participar deste projeto é realmente especial para mim! Segue o link do meu LinkedIn: www.linkedin.com"
            foto={require('@/assets/images/fotoMaria.jpg')}
          />

        </View>

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/home")}>
          <Image source={require('@/assets/images/home.png')} style={styles.navIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/ongs")}>
          <Image source={require('@/assets/images/ongs.png')} style={styles.navIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/favoritos")}>
          <Image source={require('@/assets/images/coracao.png')} style={styles.navIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/perfil")}>
          <Image source={require('@/assets/images/perfil.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 35,
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 90,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF2BAA',
    textAlign: 'center',
    marginBottom: 10,
  },
  integrantesRow: {
    paddingHorizontal: 20,
  },
  integranteContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  integranteFoto: {
    width: 200,
    height: 200,
    borderRadius: 100,
    objectFit: 'cover',
    marginBottom: 10,
  },
  integranteNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E457D',
    textAlign: 'center',
  },
  integranteDescricao: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1E1E1E',
    marginTop: 5,
    paddingHorizontal: 10,
    lineHeight: 22,
  },

  bottomNav: {
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 15,
    position: "absolute",
    bottom: 0,
  },
  navItem: {
    padding: 10,
  },
  navIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#0E457D',
  },
});
