import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useThemeContext } from '@/context/ThemeContext';
import BottomNav from '@/components/BottomNav';
import { Picker } from '@react-native-picker/picker';

const profileImage = require('@/assets/images/perfil.png');
const logoApp = require('@/assets/images/LogoPataAzul.png');

const uf = [
  { label: "Selecione o Estado", value: "" },
  { label: "Acre", value: "AC" }, { label: "Alagoas", value: "AL" }, { label: "Amapá", value: "AP" },
  { label: "Amazonas", value: "AM" }, { label: "Bahia", value: "BA" }, { label: "Ceará", value: "CE" },
  { label: "Distrito Federal", value: "DF" }, { label: "Espírito Santo", value: "ES" }, { label: "Goiás", value: "GO" },
  { label: "Maranhão", value: "MA" }, { label: "Mato Grosso", value: "MT" }, { label: "Mato Grosso do Sul", value: "MS" },
  { label: "Minas Gerais", value: "MG" }, { label: "Pará", value: "PA" }, { label: "Paraíba", value: "PB" },
  { label: "Paraná", value: "PR" }, { label: "Pernambuco", value: "PE" }, { label: "Piauí", value: "PI" },
  { label: "Rio de Janeiro", value: "RJ" }, { label: "Rio Grande do Norte", value: "RN" }, { label: "Rio Grande do Sul", value: "RS" },
  { label: "Rondônia", value: "RO" }, { label: "Roraima", value: "RR" }, { label: "Santa Catarina", value: "SC" },
  { label: "São Paulo", value: "SP" }, { label: "Sergipe", value: "SE" }, { label: "Tocantins", value: "TO" }
];

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  const [carregando, setCarregando] = useState(true);
  
  // Estados para os campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [sexo, setSexo] = useState("");
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    async function carregarUsuario() {
      const usuarioSalvo = await SecureStore.getItemAsync("usuario");
      if (usuarioSalvo) {
        const dados = JSON.parse(usuarioSalvo);
        setNome(dados.nome || "");
        setEmail(dados.email || "");
        setTelefone(dados.telefone || "");
        setCep(dados.cep || ""); 
        setRua(dados.rua || "");
        setBairro(dados.bairro || "");
        setCidade(dados.cidade || "");
        setEstado(dados.estado || "");
        setComplemento(dados.complemento || "");
        setSexo(dados.fk_idsexo?.toString() || "");
        setFoto(dados.foto);
      } else {
        router.replace("/login");
      }
      setCarregando(false);
    }
    carregarUsuario();
  }, []);

  // Função para busca automática de CEP
  const buscarCep = async (valor: string) => {
    setCep(valor);
    if (valor.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${valor}/json/`);
        if (!response.data.erro) {
          setRua(response.data.logradouro);
          setBairro(response.data.bairro);
          setCidade(response.data.localidade);
          setEstado(response.data.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  if (carregando) return null;

  // Função para renderizar campo, se é input ou texto
  const renderField = (label: string, value: string, setter: (val: string) => void, placeholder: string, type: 'default' | 'numeric' = 'default') => {
    const naoInformado = !value || value === "";

    return (
      <View style={styles.field}>
        <Text style={[styles.label, { color: isDark ? '#E5E5E5' : '#444' }]}>{label}:</Text>
        {naoInformado ? (
          <TextInput
            style={[styles.input, { color: isDark ? '#FFF' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
            value={value}
            onChangeText={setter}
            placeholder={placeholder}
            placeholderTextColor="#888"
            keyboardType={type}
          />
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>{value}</Text>
            <TouchableOpacity onPress={() => setter("")}>
              <Icon name="square-edit-outline" size={20} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDark ? '#1E1E1E' : '#ffffff' }]}>
        
        <View style={styles.header}>
          <Image source={logoApp} style={styles.logo} />
        </View>

        <View style={styles.photoContainer}>
          <Image source={foto ? { uri: foto } : profileImage} style={styles.profilePhoto} />
          <TouchableOpacity style={styles.editPhotoIcon}>
            <Icon name="camera" size={22} color={isDark ? "#FFF" : "#000"} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {renderField("Nome", nome, setNome, "Digite seu nome")}
          <View style={styles.divider} />
          
          {renderField("E-mail", email, setEmail, "seu@email.com")}
          <View style={styles.divider} />

          {renderField("Telefone", telefone, setTelefone, "(00) 00000-0000", "numeric")}
          <View style={styles.divider} />

          {/* CEP e Endereço */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#E5E5E5' : '#444' }]}>CEP:</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#FFF' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
              value={cep}
              onChangeText={buscarCep}
              placeholder="00000000"
              keyboardType="numeric"
              maxLength={8}
            />
          </View>
          
          {renderField("Rua", rua, setRua, "Rua/Avenida")}
          {renderField("Bairro", bairro, setBairro, "Seu bairro")}
          {renderField("Cidade", cidade, setCidade, "Sua cidade")}

          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#E5E5E5' : '#444' }]}>Estado:</Text>
            <View style={[styles.pickerContainer, { borderColor: isDark ? '#444' : '#ccc' }]}>
              <Picker
                selectedValue={estado}
                onValueChange={(itemValue) => setEstado(itemValue)}
                style={{ color: isDark ? '#FFF' : '#000' }}
                dropdownIconColor={isDark ? '#FFF' : '#000'}
              >
                {uf.map(est => (
                  <Picker.Item key={est.value} label={est.label} value={est.value} />
                ))}
              </Picker>
            </View>
          </View>

          {renderField("Complemento", complemento, setComplemento, "Apto, Bloco, etc.")}
          <View style={styles.divider} />

          {/* Sexo */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#E5E5E5' : '#444' }]}>Sexo:</Text>
            <View style={[styles.pickerContainer, { borderColor: isDark ? '#444' : '#ccc' }]}>
              <Picker
                selectedValue={sexo}
                onValueChange={(val) => setSexo(val)}
                style={{ color: isDark ? '#FFF' : '#000' }}
              >
                <Picker.Item label="Selecione" value="" />
                <Picker.Item label="Masculino" value="1" />
                <Picker.Item label="Feminino" value="2" />
                <Picker.Item label="Outro" value="3" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: isDark ? '#E53935' : '#FF3B3B' }]}>
            <Text style={styles.deleteButtonText}>Excluir conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.extraSection}>
          <View style={styles.extraItem}>
            <Icon name={isDark ? 'weather-night' : 'weather-sunny'} size={24} color={isDark ? '#FFD54F' : '#333'} />
            <Text style={[styles.extraText, { color: isDark ? '#E5E5E5' : '#333' }]}>Modo escuro</Text>
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
      <BottomNav isDark={isDark} activePage="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: 100, alignItems: "center" },
  header: { marginTop: 40, marginBottom: 10 },
  logo: { width: 150, height: 70, resizeMode: 'contain' },
  photoContainer: { marginTop: 10, alignItems: "center" },
  profilePhoto: { width: 120, height: 120, borderRadius: 60 },
  editPhotoIcon: { position: "absolute", right: 0, bottom: 5, backgroundColor: '#FFF', borderRadius: 15, padding: 5 },
  section: { width: "85%", marginTop: 25 },
  field: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  value: { fontSize: 16, marginTop: 4 },
  input: { borderBottomWidth: 1, paddingVertical: 5, fontSize: 16 },
  pickerContainer: { borderBottomWidth: 1, marginTop: 5 },
  divider: { width: "100%", height: 1, backgroundColor: "#ccc", marginVertical: 10 },
  saveButton: { paddingVertical: 12, borderRadius: 10, marginTop: 20, alignItems: "center" },
  deleteButton: { paddingVertical: 12, borderRadius: 10, marginTop: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  deleteButtonText: { color: "#fff", fontWeight: "bold" },
  extraSection: { width: "85%", marginTop: 20 },
  extraItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  extraText: { marginLeft: 10, fontSize: 16 },
});
