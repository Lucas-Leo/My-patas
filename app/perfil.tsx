import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
// Certifique-se de que 'react-native-vector-icons' esteja instalado e configurado
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

const logoApp = require('@/assets/images/LogoPataAzul.png');

const PADDING_HORIZONTAL = 20;

const profileData = {
  name: 'Nome',
  email: 'nome@gmail.com',
  phone: '1699000-0000',
};

// ** Importante **: Assumindo que 'router' está disponível no escopo (ex: se estiver usando Expo Router)
// E que as imagens estão nos caminhos especificados. 
// Para que este código funcione em um ambiente de teste local, substitua os caminhos das imagens
// ou crie os placeholders necessários.

// Função placeholder para simular o 'router.push' se não estiver usando um sistema de roteamento real
const mockRouter = {
  push: (path) => console.log(`Navegando para: ${path}`),
};
const router = mockRouter; // Usando o mock para evitar erros

// Componente para um item da lista de navegação
const NavItem = ({ iconName, label, onPress }) => (
  <TouchableOpacity style={styles.topNavItem} onPress={onPress}>
    {/* Usando Icon para a navegação interna da tela de perfil */}
    <Icon name={iconName} size={24} color="#333" style={styles.navIcons} />
    <Text style={styles.navText}>{label}</Text>
  </TouchableOpacity>
);

// Componente principal da tela
const ProfileScreen = () => {
  const handleEdit = () => console.log('Editar Perfil');
  const handleDelete = () => console.log('Excluir Conta');
  const handleNavigation = (screen) => console.log(`Navegar para: ${screen}`);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>

        <View style={styles.header}>
                <Image height={50} width={100} source={logoApp} style={styles.logo} />
              </View>

        {/* Informações do Perfil */}
        <View style={styles.profileSection}>
          {/* Icone de Perfil */}
          <View style={styles.profileIconContainer}>
            <Icon name="account" size={60} color="#FFF" />
          </View>
          
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileEmail}>Email: {profileData.email}</Text>
            <Text style={styles.profileText}>Senha: ********</Text>
            <Text style={styles.profileText}>Telefone: {profileData.phone}</Text>
            
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Excluir conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Itens de Navegação */}
        <View style={styles.navigationSection}>
          <NavItem 
            iconName="home-outline" 
            label="Início" 
            onPress={() => handleNavigation('Início')} 
          />
          <NavItem 
            iconName="owl" 
            label="ONGS" 
            onPress={() => handleNavigation('ONGs')} 
          />
          <NavItem 
            iconName="heart-outline" 
            label="Favoritos" 
            onPress={() => handleNavigation('Favoritos')} 
          />
          <NavItem 
            iconName="account-group-outline" 
            label="Sobre Nós" 
            onPress={() => handleNavigation('Sobre Nós')} 
          />
          <NavItem 
            iconName="help-circle-outline" 
            label="Perguntas" 
            onPress={() => handleNavigation('Perguntas')} 
          />
        </View>
      </ScrollView>
      
      {/* ------------------------------------------------------------------- */}
      {/* BARRA DE NAVEGAÇÃO INFERIOR ATUALIZADA (bottomNav) */}
      {/* ------------------------------------------------------------------- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/home")}>
          {/* Substitua esta imagem pelo seu asset real */}
          <Image 
            source={require('@/assets/images/home.png')} 
            style={[styles.bottomNavIcon, styles.iconActive]} // Icone ativo (home)
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/ongs")}>
          {/* Substitua esta imagem pelo seu asset real */}
          <Image 
            source={require('@/assets/images/ongs.png')} 
            style={styles.bottomNavIcon} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/favoritos")}>
          {/* Substitua esta imagem pelo seu asset real */}
          <Image 
            source={require('@/assets/images/coracao.png')} 
            style={styles.bottomNavIcon} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/perfil")}>
          {/* Substitua esta imagem pelo seu asset real */}
          <Image 
            source={require('@/assets/images/perfil.png')} 
            style={styles.bottomNavIcon} 
          />
        </TouchableOpacity>
      </View>
      {/* ------------------------------------------------------------------- */}
    </SafeAreaView>
  );
};

// Estilização
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#ffffff",
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 90,
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: PADDING_HORIZONTAL,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F56E9D', // Cor de fundo do ícone (rosa)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  profileText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  editButton: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  editButtonText: {
    fontSize: 14,
    color: '#F56E9D', 
    textDecorationLine: 'underline',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#E91E63', 
    textDecorationLine: 'underline',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: PADDING_HORIZONTAL,
    marginBottom: 15,
  },
  navigationSection: {
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  topNavItem: { // Estilo para os itens de navegação do perfil (com ícone e texto)
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navIcons: { // Ícones dos itens de navegação do perfil
    marginRight: 15,
  },
  navText: {
    fontSize: 16,
    color: '#333',
  },
  themeItem: {
    justifyContent: 'space-between',
    marginTop: 10,
  },
  themeText: {
    fontSize: 16,
    color: '#333',
  },
  bottomNav: {
    width: '100%',
    height: 60,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 15,
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

export default ProfileScreen;