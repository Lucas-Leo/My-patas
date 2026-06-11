import AsyncStorage from "@react-native-async-storage/async-storage";

export type ActiveProfile = "usuario" | "ong";

export async function setActiveProfile(profile: ActiveProfile) {
  await AsyncStorage.setItem("activeProfile", profile);
}

export async function getActiveProfile(): Promise<ActiveProfile> {
  const [[, profile], [, ong]] = await AsyncStorage.multiGet([
    "activeProfile",
    "ong",
  ]);

  if (profile === "ong" && ong) {
    return "ong";
  }

  return "usuario";
}

export async function getToken() {
  return AsyncStorage.getItem("token");
}

export async function clearSession() {
  await AsyncStorage.multiRemove([
    "usuario",
    "token",
    "ong",
    "activeProfile",
    "fotoPerfil",
    "fotoPerfilONG",
  ]);
}
