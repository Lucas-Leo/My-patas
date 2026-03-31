import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useThemeContext } from '@/context/ThemeContext';

const profileImage = require('@/assets/images/perfil.png');
const logoApp = require('@/assets/images/LogoPataAzul.png');

const ProfileScreen = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#121212' : '#F5F5F5' },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? '#1E1E1E' : '#ffffff' },
        ]}
      >

        <View style={styles.header}>
           <Image height={50} width={100} source={logoApp} style={styles.logo}  />
        </View>

        <View style={styles.photoContainer}>
          <Image source={profileImage} style={styles.profilePhoto} />
          <TouchableOpacity style={styles.editPhotoIcon}>
            <Icon name="square-edit-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>

          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#E5E5E5' : '#444' }]}>
              Nome:
            </Text>
            <Text
              style={[
                styles.value,
                { color: isDark ? '#FFFFFF' : '#000000' },
              ]}
            >
              Margarete da Rosa Silva
            </Text>
            <TouchableOpacity style={styles.editIcon}>
              <Icon
                name="square-edit-outline"
                size={20}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#E5E5E5' : '#444' }]}>
              E-mail:
            </Text>
            <Text
              style={[
                styles.value,
                { color: isDark ? '#FFFFFF' : '#000000' },
              ]}
            >
              margareterosasilva@gmail.com
            </Text>
            <TouchableOpacity style={styles.editIcon}>
              <Icon
                name="square-edit-outline"
                size={20}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#E5E5E5' : '#444' }]}>
              Senha:
            </Text>
            <Text
              style={[
                styles.value,
                { color: isDark ? '#FFFFFF' : '#000000' },
              ]}
            >
              *********
            </Text>
            <TouchableOpacity style={styles.editIcon}>
              <Icon
                name="square-edit-outline"
                size={20}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              { backgroundColor: isDark ? '#E53935' : '#FF3B3B' },
            ]}
          >
            <Text style={styles.deleteButtonText}>Excluir conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.extraSection}>
          <TouchableOpacity style={styles.extraItem} onPress={() => router.push("/quests")}>
            <Icon
              name="help-circle-outline"
              size={24}
              color={isDark ? '#E5E5E5' : '#333'}
            />
            <Text
              style={[
                styles.extraText,
                { color: isDark ? '#E5E5E5' : '#333' },
              ]}
            >
              Perguntas
            </Text>
          </TouchableOpacity>

          <View style={styles.extraItem}>
            <Icon
              name={isDark ? 'weather-night' : 'weather-sunny'}
              size={24}
              color={isDark ? '#FFD54F' : '#333'}
            />
            <Text
              style={[
                styles.extraText,
                { color: isDark ? '#E5E5E5' : '#333' },
              ]}
            >
              Modo escuro
            </Text>
            <View style={{ flex: 1 }} />
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#B0BEC5', true: '#4CAF50' }}
            />
          </View>
        </View>

      </ScrollView>
            <View
        style={[
          styles.bottomNav,
          { backgroundColor: isDark ? '#181818' : '#fff' },
        ]}
      >

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <MaterialIcons
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
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  container: {
    flex: 1,
    marginTop: 45,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },

  logo: {
    width: 200,
    height: 90,
  },

  photoContainer: {
    marginTop: 10,
    alignItems: "center",
  },

  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },

  editPhotoIcon: {
    position: "absolute",
    right: 1,
    bottom: 5,
  },

  section: {
    width: "85%",
    marginTop: 25,
  },

  field: {
    marginBottom: 5,
  },

  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#444",
  },

  value: {
    fontSize: 15,
    marginTop: 4,
    paddingRight: 30,
  },

  editIcon: {
    position: "absolute",
    right: 0,
    top: 22,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 12,
  },

  deleteButton: {
    backgroundColor: "#FF3B3B",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  extraSection: {
    width: "85%",
    marginTop: 35,
  },

  extraItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  extraText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },

  bottomNav: {
    width: "100%",
    height: 70,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    padding: 10,
  },

  bottomIcon: {
    width: 35,
    height: 35,
    tintColor: "#0E457D",
  },
});

export default ProfileScreen;
