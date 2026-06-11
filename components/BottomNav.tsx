import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { getActiveProfile, getToken } from '@/src/utils/session';

type NavPage = 'home' | 'ongs' | 'favoritos' | 'perfil';

type BottomNavProps = {
  isDark: boolean;
  activePage?: NavPage;
};

const navItems: {
  key: NavPage;
  label: string;
  route: '/home' | '/ongs' | '/favoritos' | '/perfil';
  renderIcon: (color: string) => React.ReactNode;
}[] = [
  {
    key: 'home',
    label: 'Início',
    route: '/home',
    renderIcon: (color) => <MaterialCommunityIcons name="home" size={28} color={color} />,
  },
  {
    key: 'ongs',
    label: 'ONGs',
    route: '/ongs',
    renderIcon: (color) => <MaterialIcons name="pets" size={28} color={color} />,
  },
  {
    key: 'favoritos',
    label: 'Favoritos',
    route: '/favoritos',
    renderIcon: (color) => <AntDesign name="heart" size={26} color={color} />,
  },
  {
    key: 'perfil',
    label: 'Perfil',
    route: '/perfil',
    renderIcon: (color) => <FontAwesome5 name="user-alt" size={24} color={color} />,
  },
];

export default function BottomNav({ isDark, activePage }: BottomNavProps) {
  const defaultColor = isDark ? '#90CAF9' : '#0E457D';
  const activeColor = isDark ? '#BBDEFB' : '#0E457D';

  async function handleNavigate(item: (typeof navItems)[number]) {
    if (item.key !== 'perfil') {
      router.push(item.route);
      return;
    }

    const token = await getToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    const profile = await getActiveProfile();
    router.push(profile === 'ong' ? '/perfilONG' : '/perfil');
  }

  return (
    <View style={[styles.bottomNav, { backgroundColor: isDark ? '#181818' : '#fff' }]}>
      {navItems.map((item) => {
        const isActive = item.key === activePage;
        const color = isActive ? activeColor : defaultColor;

        return (
          <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => handleNavigate(item)}>
            {item.renderIcon(color)}
            <View
              style={[
                styles.activeUnderline,
                {
                  backgroundColor: color,
                  opacity: isActive ? 1 : 0,
                },
              ]}
            />
            <Text style={[styles.navLabel, { color }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    width: '100%',
    height: 86,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 15,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  navLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  activeUnderline: {
    width: 28,
    height: 2,
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 2,
  },
});
