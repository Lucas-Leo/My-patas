import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons, Fontisto } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useThemeContext } from '@/context/ThemeContext';


const logoApp = require("@/assets/images/LogoPataAzul.png");

const { width } = Dimensions.get('window');

const Lista01 = [
  "Escolha o Seu Novo Amigo: Explore nosso catálogo de animais disponíveis para adoção. Cada um tem uma ficha completa com informações sobre personalidade, necessidades especiais e histórico.",
  "Preencha o Formulário de Adoção: Após encontrar o animalzinho ideal, preencha nosso formulário de adoção. Esse passo é fundamental para entender melhor suas expectativas e garantir que o animal se adapte bem ao seu estilo de vida.",
  "Assinatura do Termo de Adoção: Se tudo correr bem, você assinará um termo de adoção que formaliza o compromisso de cuidar do novo membro da família.",
  "Ajuste e Acompanhamento: Nos primeiros dias, faremos um acompanhamento para garantir que a adaptação esteja ocorrendo de maneira tranquila. Estamos aqui para oferecer suporte e responder a qualquer dúvida.",
  "Adotar é um gesto de amor e responsabilidade. Estamos aqui para ajudar em cada passo dessa jornada. Venha fazer parte da nossa comunidade e transforme a vida de um animalzinho!"
];

const Lista02 = [
  "Adote um Animal: A forma mais direta de ajudar é adotando um dos nossos animalzinhos. Ofereça um lar cheio de amor e carinho para um animal que precisa.",
  "Seja um Lar Temporário: Se não pode adotar permanentemente, considere ser um lar temporário. Hospedar um animal até que ele encontre um lar definitivo é uma ajuda imensurável.",
  "Faça Doações: Sua contribuição financeira ajuda a cobrir custos de alimentação, cuidados veterinários, castrações e outras necessidades dos nossos animalzinhos. Toda doação faz a diferença!",
  "Voluntarie-se: Doar seu tempo é uma excelente maneira de ajudar. Precisamos de voluntários para cuidar dos animais, participar de eventos e ajudar em campanhas de adoção.",
  "Divulgue Nossas Ações: Compartilhe nossas postagens nas redes sociais, fale sobre nosso trabalho com amigos e familiares. Aumentar a visibilidade ajuda a encontrar mais adotantes e apoiadores.",
  "Participe de Nossas Campanhas: Engaje-se em campanhas de conscientização e eventos de arrecadação de fundos. Sua participação ativa é essencial para o sucesso dessas iniciativas.",
  "Cada gesto conta e faz a diferença na vida dos animais. Junte-se a nós no Patas Conscientes e ajude a promover a adoção consciente e o bem-estar animal. Sua ajuda é fundamental!"
];

type ListItemProps = {
  children: React.ReactNode;
  isDark: boolean;
};

const ListItem = ({ children, isDark }: ListItemProps) => (
  <View style={styles.listItem}>
    <Text
      style={[
        styles.bullet,
        { color: isDark ? '#FF80AB' : '#FF2BAA' },
      ]}
    >
      •
    </Text>
    <Text
      style={[
        styles.listItemText,
        { color: isDark ? '#E0E0E0' : '#1E1E1E' },
      ]}
    >
      {children}
    </Text>
  </View>
);

export default function QuestsScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#fff' },
      ]}
    >

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back-outline"
            size={28}
            color={isDark ? '#90CAF9' : '#0E457D'}
          />
        </TouchableOpacity>
        <View style={styles.header}>
          <Image source={logoApp} style={styles.logo} />
        </View>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FF80AB' : '#FF2BAA' },
            ]}
          >
            Como posso adotar?
          </Text>
          <Text
            style={[
              styles.aboutText,
              { color: isDark ? '#E0E0E0' : '#1E1E1E' },
            ]}
          >
            Adotar um animal de estimação é um ato de amor que transforma vidas, tanto a sua quanto a do animal. No Patas Conscientes, incentivamos a adoção consciente, garantindo que cada animalzinho encontre um lar cheio de carinho e responsabilidade. Aqui estão os passos para adotar:
          </Text>
        </View>

        <View style={styles.ulContainer}>
          {Lista01.map((step, index) => (
            <ListItem key={index} isDark={isDark}>
              {step}
            </ListItem>
          ))}
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FF80AB' : '#FF2BAA' },
            ]}
          >
            Como você pode ajudar a causa animal?
          </Text>
          <Text
            style={[
              styles.aboutText,
              { color: isDark ? '#E0E0E0' : '#1E1E1E' },
            ]}
          >
            No Patas Conscientes, acreditamos que todos podem contribuir para o bem-estar dos animais de várias maneiras. Aqui estão algumas formas de você se envolver e fazer a diferença:
          </Text>
        </View>

        <View style={styles.ulContainer}>
          {Lista02.map((step, index) => (
            <ListItem key={index} isDark={isDark}>
              {step}
            </ListItem>
          ))}
        </View>

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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 25,
    marginTop: 10,
  },
  backButton: {
    marginLeft: 30,
    marginTop: 30,
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
    marginTop: 8,
    marginHorizontal: 8,
    color: '#1E1E1E',
  },
  ulContainer: {
    paddingHorizontal: 25,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    marginRight: 8,
    color: '#FF2BAA',
    fontWeight: 'bold',
  },
  listItemText: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#1E1E1E',
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
