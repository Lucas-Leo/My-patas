import { ThemeContext, type AppTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<AppTheme>((systemColorScheme as AppTheme) ?? 'light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="login">
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="criarconta" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="completarperfil" options={{ headerShown: false }} />
          <Stack.Screen name="registerONG" options={{ headerShown: false }} />
          <Stack.Screen name="novasenha" options={{ headerShown: false }} />
          <Stack.Screen name="perfil" options={{ headerShown: false }} />
          <Stack.Screen name="editaruserComum" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="ongs" options={{ headerShown: false }} />
          <Stack.Screen name="favoritos" options={{ headerShown: false }} />
          <Stack.Screen name="perfilONG" options={{ headerShown: false }} />

          <Stack.Screen name="adocao" options={{ headerShown: false }} />
          <Stack.Screen name="adocaoEtapa2" options={{ headerShown: false }} />
          <Stack.Screen name="adocaoEtapa3" options={{ headerShown: false }} />
          <Stack.Screen name="adocaoSucesso" options={{ headerShown: false }} />
          <Stack.Screen name="acompanharAdocao" options={{ headerShown: false }} />
          <Stack.Screen name="solicitacoesAdocao" options={{ headerShown: false }} />
          <Stack.Screen name="gerenciarSolicitacoes" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="quests" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
