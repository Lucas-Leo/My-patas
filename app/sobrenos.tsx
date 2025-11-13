import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView, // rolagem de conteúdo
} from 'react-native';
import { Ionicons, Fontisto } from '@expo/vector-icons';

const logoApp = require("@/assets/images/LogoPataAzul.png"); 

const { width } = Dimensions.get('window');

// membros
const Integrante = ({ nome, descricao, isFocused }) => (
  <View style={styles.integranteContainer}>
    {/* icone de pessoa (trocar por fotos) */}
    <View style={styles.integranteIcon}>
      <Ionicons name="person" size={30} color="#fff" /> 
    </View>
    <Text style={styles.integranteNome}>{nome}</Text>
    <Text style={styles.integranteDescricao}>{descricao}</Text>
  </View>
);

export default function SobreNosScreen() {

    return (
        <SafeAreaView style={styles.safeArea}>
            
            {/* logo patas */}
            <View style={styles.header}>
                <Image
                    source={logoApp}
                    style={styles.logo}
                />
            </View>

            <ScrollView style={styles.contentContainer}>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre Nós</Text>
                    <Text style={styles.aboutText}>
                        Somos apaixonados por animais e acreditamos que cada animalzinho merece amor, cuidado e um lar aconchegante. No Patas Conscientes, nossa missão é conectar tutores dedicados com ONGS para conhecer novos pets que precisam de um lar.
Nossa equipe é composta por amantes de animais que entendem a importância de tratar cada bichinho com o respeito e a atenção que eles merecem. Junte-se a nós nesta jornada de amor e cuidado pelos nossos amigos de quatro patas!
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Integrantes</Text>
                    <View style={styles.integrantesRow}>
                        <Integrante nome="Camilly" descricao="Oi Oi, tudo bem? Sou a Camilly! Sou apaixonada por programação e fico fascinada com o que podemos desenvolver com ela. Além disso, sou apaixonada pelo mundo pet, o que me motivou a entrar neste projeto. Meu objetivo é fazer a diferença, especialmente quando se trata de melhorar a vida dos animais e das pessoas que os amam. Estou super animada com o que podemos conquistar!" />
                        <Integrante nome="Lucas" descricao="Olá, meu nome é Lucas Leonardo, tenho 22 anos e sou apaixonado pelo mundo do design gráfico. Amo animais e acredito que a criatividade pode transformar o mundo ao nosso redor. Para saber mais me siga em minha redes sociais! @lucasalvesdesing" />
                        <Integrante nome="Bárbara" descricao="Oi! Eu sou a Bárbara, apaixonada por animais e dedicada a proteger nossos amigos de quatro patas. No Patas Conscientes, trabalhamos com muita alegria e dedicação para promover o bem-estar e a conscientização sobre os direitos dos animais. Junte-se a nós nessa causa tão importante!" />
                        <Integrante nome="Fernanda" descricao="Olá! Tenho 18 anos e sou apaixonada por animais, então participar deste projeto é realmente especial para mim! Segue o link do meu LinkedIn: www.linkedin.com" />
                    </View>
                </View>

                {/* espaço pro ultimo integrande não frudar no footer */}
                <View style={{ height: 20 }} /> 
            </ScrollView>

            <View style={styles.footer}>

                <View style={styles.iconsFooter}>
                <Ionicons name="home-sharp" size={28} color="#0E457D" />
                <Text style={styles.iconsText}>Início</Text>
                </View>

                <View style={styles.iconsFooter}>
                <Ionicons name="paw" size={30} color="#0E457D" />
                <Text style={styles.iconsText}>ONGS</Text>
                </View>

                <View style={styles.iconsFooter}>
                <Fontisto name="heart" size={25} color="#0E457D" />
                <Text style={styles.iconsText}>Favoritos</Text>
                </View>

                <View style={styles.iconsFooter}>
                <Ionicons name="person-sharp" size={30} color="#0E457D" />
                <Text style={styles.iconsText}>Perfil</Text>
                </View>
                
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
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
    contentContainer: {
        flex: 1, 
    },
    section: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    sectionTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FF2BAA',
        marginBottom: 10,
        textAlign: 'center',
    },
    aboutText: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        color: '#1E1E1E',
    },
    integrantesRow: {
        flexDirection: 'column', 
        alignItems: 'center',
        marginTop: 10,
    },
    integranteContainer: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    integranteIcon: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#0E457D',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    integranteNome: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 5,
    },
    integranteDescricao: {
        fontSize: 15,
        color: '#1E1E1E',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#fff',
    },
    tabButton: {
      padding: 10,
      alignItems: 'center',
    },
    //menu
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#43474bff',
    backgroundColor: '#fff',
  },
  iconsFooter: {
    alignItems: 'center',
    gap: 2,
  },
  iconsText: {
    fontWeight: 'bold',
  }
});