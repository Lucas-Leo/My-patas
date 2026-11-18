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

export function calcularIdadeUsuario(nascimento: unknown, hoje = new Date()): string {
  if (typeof nascimento !== 'string') return '';
  const iso = nascimento.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const br = nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!iso && !br) return '';
  const [ano, mes, dia] = iso ? [+iso[1], +iso[2], +iso[3]] : [+br![3], +br![2], +br![1]];
  const date = new Date(ano, mes - 1, dia);
  if (date.getFullYear() !== ano || date.getMonth() !== mes - 1 || date.getDate() !== dia || date > hoje) return '';
  const idade = hoje.getFullYear() - ano - (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia) ? 1 : 0);
  return String(idade);
}

export function etapa1Completa(data: Etapa1Adocao) {
  return Object.values(data).every(value => value.trim().length > 0)
    && /^\d+$/.test(data.idade) && Number(data.idade) >= 18
    && data.telefone.replace(/\D/g, '').length >= 10;
}

export function etapa2Completa(data: Etapa2Adocao) {
  return !!(data.motivacao && data.experiencia && data.apoioFamilia && data.rotina && data.financeiro && data.ambiente
    && (data.motivacao !== 'outro' || data.motivacaoOutro.trim())
    && (data.experiencia !== 'sim' || data.experienciaTexto.trim()));
}

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
  const value = (status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let label = status || 'Solicitacao enviada', color = '#3B82F6', bg = '#DBEAFE', icon = 'paper-plane-outline', step = 0;
  if (value.includes('reprov') || value.includes('nao aprovad') || value.includes('rejeitad') || value.includes('cancelad')) {
    label = value.includes('cancel') ? 'Cancelada' : 'Nao aprovado'; color = '#EF4444'; bg = '#FEE2E2'; icon = 'close-circle-outline'; step = -1;
  } else if (value.includes('entregue') || value.includes('finaliz') || value.includes('concluid')) {
    label = 'Entregue'; color = '#EC4899'; bg = '#FCE7F3'; icon = 'heart-outline'; step = 5;
  } else if (value.includes('aprovad')) {
    label = 'Aprovado'; color = '#22C55E'; bg = '#DCFCE7'; icon = 'checkmark-circle-outline'; step = 4;
  } else if (value.includes('visita')) {
    label = 'Visita agendada'; color = '#3B82F6'; bg = '#EFF6FF'; icon = 'home-outline'; step = 3;
  } else if (value.includes('document')) {
    label = 'Aguardando documentos'; color = '#F59E0B'; bg = '#FEF3C7'; icon = 'document-outline'; step = 3;
  } else if (value.includes('entrevista')) {
    label = 'Entrevista agendada'; color = '#8B5CF6'; bg = '#EFE7FF'; icon = 'calendar-outline'; step = 2;
  } else if (value.includes('analise')) {
    label = 'Em analise'; color = '#F7B500'; bg = '#FFF6D8'; icon = 'time-outline'; step = 1;
  } else if (!value || value.includes('nova') || value.includes('solicitacao')) {
    label = 'Solicitacao enviada';
  }
  return { status: label, statusColor: color, statusBg: bg, icon, step };
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
