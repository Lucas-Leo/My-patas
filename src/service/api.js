import { create } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { notifyAdoptionUpdate } from '../utils/adoptionUpdates';

const debuggerHost = Constants.expoConfig?.hostUri;
const host = debuggerHost ? debuggerHost.split(':').shift() : 'localhost';
const localhost = Platform.OS === 'android' && ['localhost', '127.0.0.1'].includes(host)
  ? '10.0.2.2'
  : host;

const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') || `http://${localhost}:6789`,
  timeout: 15000,
});

api.interceptors.response.use(response => {
  const method = response.config.method?.toLowerCase();
  if (method && !['get', 'head', 'options'].includes(method)
    && /^\/(solicitacoesadocao|adocaoetapa[12]|historicoadocao|agendamentosadocao)(\/|$)/.test(response.config.url || '')
    && response.data?.success !== false) {
    notifyAdoptionUpdate();
  }
  return response;
});

export default api;
