import axios from 'axios';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost ? debuggerHost.split(':').shift() : 'localhost';

const api = axios.create({
  baseURL: `http://${localhost}:6789`, 
});

export default api;