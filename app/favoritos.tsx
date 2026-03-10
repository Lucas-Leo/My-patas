import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useThemeContext } from '@/context/ThemeContext';

const logoApp = require('@/assets/images/LogoPataAzul.png');

export default function Favoritos() {
  const favoritos = [
    {
      id: '1',
      nome: 'Luke',
      idade: '2 anos',
      descricao: 'Cachorro dócil, cheio de energia e ótimo com crianças.',
      foto: require('@/assets/images/cachorro01.jpg'),
      ong: 'ONG Paz e Amor',
    },
    {
      id: '2',
      nome: 'Salem',
      idade: '1 ano',
      descricao: 'Gato carinhoso, curioso e muito tranquilo.',
      foto: require('@/assets/images/gato02.jpg'),
      ong: 'ONG Amigo Fiel',
    },
    {
      id: '3',
      nome: 'Max',
      idade: '3 anos',
      descricao: 'Muito sociável, se dá bem com todos os animais.',
      foto: require('@/assets/images/cachorro03.jpg'),
      ong: 'Abrigo do Coração',
    },
  ];

  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#ffffff' },
      ]}
    >
      
      <View style={styles.header}>
        <Image height={50} width={100} source={logoApp} style={styles.logo} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={[
            styles.title,
            { color: isDark ? '#FF80AB' : '#FF2BAA' },
          ]}
        >
          Meus Favoritos
        </Text>

        {favoritos.map((pet) => (
          <View
            key={pet.id}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1F1F1F' : '#fff',
                borderColor: isDark ? '#424242' : '#eee',
              },
            ]}
          >

            <Image source={pet.foto} style={styles.petImage} />

            <View style={styles.petInfoBox}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.petName,
                      { color: isDark ? '#BBDEFB' : '#0E457D' },
                    ]}
                  >
                    {pet.nome}
                  </Text>
                  <Text
                    style={[
                      styles.petAge,
                      { color: isDark ? '#E0E0E0' : '#444' },
                    ]}
                  >
                    {pet.idade}
                  </Text>
                  <Text
                    style={[
                      styles.petOng,
                      { color: isDark ? '#B0BEC5' : '#777' },
                    ]}
                  >
                    {pet.ong}
                  </Text>
                </View>

                <TouchableOpacity style={styles.heartButton}>
                  <Ionicons
                    name="heart"
                    size={26}
                    color={isDark ? '#FF80AB' : '#FF2BAA'}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.petDescription,
                  { color: isDark ? '#E0E0E0' : '#555' },
                ]}
              >
                {pet.descricao}
              </Text>
            </View>

          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          { backgroundColor: isDark ? '#181818' : 'white' },
        ]}
      >

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Entypo
            name="home"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ongs")}
        >
          <MaterialIcons
            name="pets"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/favoritos")}
        >
          <AntDesign
            name="heart"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/perfil")}
        >
          <FontAwesome5
            name="user-alt"
            size={30}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  scroll: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF2BAA',
    marginBottom: 15,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },

  petImage: {
    width: 105,
    height: 105,
    borderRadius: 14,
  },

  petInfoBox: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0E457D",
  },

  petAge: {
    fontSize: 15,
    color: "#444",
    marginTop: 2,
  },

  petOng: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },

  petDescription: {
    fontSize: 15,
    color: "#555",
    marginTop: 10,
    lineHeight: 20,
  },

  heartButton: {
    padding: 4,
    marginRight: 5,
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
