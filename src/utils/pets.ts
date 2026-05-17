import AsyncStorage from "@react-native-async-storage/async-storage";

export type ApiPet = {
  id?: number;
  idpet?: number;
  idpetfavoritado?: number;
  fk_idpet?: number;
  fk_idong?: number | null;
  nome?: string | null;
  nome_ong?: string | null;
  descricao?: string | null;
  fotos?: string | null;
  idade?: number | string | null;
  porte?: string | null;
  vacinado?: boolean | number | string | null;
  especie?: string | null;
  raca?: string | null;
  sexopet?: string | null;
  status?: string | null;
  peso?: number | string | null;
};

export type PetApp = {
  id: number;
  favoriteId?: number;
  fk_idong?: number | null;
  nome: string;
  name: string;
  ong: string;
  descricao: string;
  description: string;
  idade: string;
  porte: string;
  vacinado: boolean;
  foto?: string | null;
  imageUri?: string | null;
  especie?: string | null;
  raca?: string | null;
  sexo?: string | null;
  status?: string | null;
  peso?: number | string | null;
};

export async function obterIdUsuarioLogado() {
  const usuarioSalvo = await AsyncStorage.getItem("usuario");

  if (!usuarioSalvo) {
    return null;
  }

  const usuario = JSON.parse(usuarioSalvo);
  return usuario?.id || usuario?.idusuario || null;
}

export function formatarIdadePet(idade?: number | string | null) {
  if (idade === null || idade === undefined || idade === "") {
    return "Idade nao informada";
  }

  const idadeNumero = Number(idade);

  if (Number.isNaN(idadeNumero)) {
    return String(idade);
  }

  if (idadeNumero <= 0) {
    return "Menos de 1 mes";
  }

  if (idadeNumero < 12) {
    return idadeNumero === 1 ? "1 mes" : `${idadeNumero} meses`;
  }

  const anos = Math.floor(idadeNumero / 12);
  const meses = idadeNumero % 12;
  const textoAnos = anos === 1 ? "1 ano" : `${anos} anos`;

  if (meses === 0) {
    return textoAnos;
  }

  return `${textoAnos} e ${meses} ${meses === 1 ? "mes" : "meses"}`;
}

export function normalizarPet(apiPet: ApiPet): PetApp {
  const id = Number(apiPet.idpet || apiPet.fk_idpet || apiPet.id);
  const nome = apiPet.nome || "Pet sem nome";
  const descricao = apiPet.descricao || "Sem descricao cadastrada.";
  const foto = apiPet.fotos || null;
  const ong = apiPet.nome_ong || "ONG nao informada";

  return {
    id,
    favoriteId: apiPet.idpetfavoritado,
    fk_idong: apiPet.fk_idong,
    nome,
    name: nome,
    ong,
    descricao,
    description: descricao,
    idade: formatarIdadePet(apiPet.idade),
    porte: apiPet.porte || "Nao informado",
    vacinado:
      apiPet.vacinado === true ||
      apiPet.vacinado === 1 ||
      apiPet.vacinado === "1",
    foto,
    imageUri: foto,
    especie: apiPet.especie,
    raca: apiPet.raca,
    sexo: apiPet.sexopet,
    status: apiPet.status,
    peso: apiPet.peso,
  };
}
