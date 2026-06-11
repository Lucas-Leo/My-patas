import { PetApp, formatarIdadePet } from "./pets";

export type AdoptionPet = Pick<
  PetApp,
  "id" | "nome" | "name" | "ong" | "idade" | "imageUri" | "foto"
>;

export type Etapa1Adocao = {
  nome: string;
  idade: string;
  telefone: string;
  cidade: string;
  moradia: string;
  possuiAnimais: string;
  possuiCriancas: string;
};

export type Etapa2Adocao = {
  motivacao: string;
  motivacaoOutro: string;
  experiencia: string;
  experienciaTexto: string;
  apoioFamilia: string;
  rotina: string;
  financeiro: string;
  ambiente: string;
};

export type ApiSolicitacaoAdocao = {
  id?: number;
  idsolicitacao?: number;
  fk_idpet?: number;
  fk_idusuario?: number;
  status?: string | null;
  pet?: string | null;
  pet_idade?: number | string | null;
  pet_foto?: string | null;
  ong?: string | null;
  data_solicitacao?: string | null;
  data_criacao?: string | null;
  created_at?: string | null;
};

export type AdoptionListItem = {
  id: string;
  petName: string;
  ong: string;
  date: string;
  status: string;
  statusColor: string;
  statusBg: string;
  icon: string;
  imageUri?: string | null;
  idade: string;
};

export function stringifyParam(value: unknown) {
  return JSON.stringify(value);
}

export function parseParam<T>(value: string | string[] | undefined, fallback: T): T {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toAdoptionPet(pet: PetApp): AdoptionPet {
  return {
    id: pet.id,
    nome: pet.nome,
    name: pet.name,
    ong: pet.ong,
    idade: pet.idade,
    imageUri: pet.imageUri,
    foto: pet.foto,
  };
}

export function getPetDisplayName(pet?: Partial<AdoptionPet> | null) {
  return pet?.nome || pet?.name || "Pet";
}

export function getPetImageUri(pet?: Partial<AdoptionPet> | null) {
  return pet?.imageUri || pet?.foto || null;
}

export function formatarSimNao(valor: string) {
  if (valor === "sim") return "Sim";
  if (valor === "nao") return "Nao";
  return valor || "Nao informado";
}

export function formatarResposta(valor: string) {
  const respostas: Record<string, string> = {
    casa: "Casa",
    apartamento: "Apartamento",
    companhia: "Companhia",
    lar: "Dar um lar",
    familia: "Familia",
    cresci: "Cresci com pets",
    outro: "Outro",
    conversando: "Ainda estou conversando",
    nunca: "Quase nunca",
    algumas_horas: "Algumas horas",
    muito_tempo: "Muito tempo sozinho",
    parcialmente: "Parcialmente",
  };

  return respostas[valor] || formatarSimNao(valor);
}

export function montarMotivacao(etapa2: Etapa2Adocao) {
  if (etapa2.motivacao === "outro" && etapa2.motivacaoOutro.trim()) {
    return etapa2.motivacaoOutro.trim();
  }

  return formatarResposta(etapa2.motivacao);
}

export function montarExperiencia(etapa2: Etapa2Adocao) {
  if (etapa2.experiencia === "sim" && etapa2.experienciaTexto.trim()) {
    return etapa2.experienciaTexto.trim();
  }

  return formatarResposta(etapa2.experiencia);
}

export function getStatusConfig(status?: string | null) {
  const normalized = status || "Solicitacao enviada";

  if (normalized === "Em analise" || normalized === "Em análise") {
    return {
      status: "Em analise",
      statusColor: "#F7B500",
      statusBg: "#FFF6D8",
      icon: "time-outline",
    };
  }

  if (normalized === "Entrevista agendada") {
    return {
      status: normalized,
      statusColor: "#8B5CF6",
      statusBg: "#EFE7FF",
      icon: "calendar-outline",
    };
  }

  if (normalized === "Aprovado" || normalized === "Aprovada") {
    return {
      status: "Aprovado",
      statusColor: "#22C55E",
      statusBg: "#DCFCE7",
      icon: "checkmark-circle-outline",
    };
  }

  if (normalized === "Reprovado" || normalized === "Nao aprovado") {
    return {
      status: "Nao aprovado",
      statusColor: "#EF4444",
      statusBg: "#FEE2E2",
      icon: "close-circle-outline",
    };
  }

  return {
    status: normalized,
    statusColor: "#3B82F6",
    statusBg: "#DBEAFE",
    icon: "paper-plane-outline",
  };
}

export function formatarDataAdocao(value?: string | null) {
  if (!value) {
    return "Hoje";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function normalizarSolicitacaoAdocao(
  solicitacao: ApiSolicitacaoAdocao
): AdoptionListItem {
  const config = getStatusConfig(solicitacao.status);
  const data =
    solicitacao.data_solicitacao ||
    solicitacao.data_criacao ||
    solicitacao.created_at;

  return {
    id: String(solicitacao.idsolicitacao || solicitacao.id || ""),
    petName: solicitacao.pet || "Pet",
    ong: solicitacao.ong || "ONG nao informada",
    date: formatarDataAdocao(data),
    imageUri: solicitacao.pet_foto,
    idade: formatarIdadePet(solicitacao.pet_idade),
    ...config,
  };
}
