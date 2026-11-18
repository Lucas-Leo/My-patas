import api from './api';
import { getToken } from '../utils/session';

export class AdoptionAlreadySentError extends Error {
  constructor() {
    super('Você já fez o processo de adoção para este pet. Acompanhe o andamento em Minhas adoções.');
  }
}

type Submission = {
  petId: number;
  userId: number;
  etapa1: Record<string, string>;
  etapa2: Record<string, string>;
};

// A retry completes the missing steps instead of creating another request.
export async function submitAdoption({ petId, userId, etapa1, etapa2 }: Submission) {
  const token = await getToken();
  if (!token || token === 'token-ficticio-123') {
    throw new Error('Entre novamente na sua conta para enviar a solicitação.');
  }
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const existing = await api.get(`/solicitacoesadocao/usuario/${userId}`, config);
  if (!Array.isArray(existing.data)) throw new Error('Não foi possível verificar suas solicitações. Tente novamente.');
  const matches = existing.data.filter((item: { fk_idpet: number }) => Number(item.fk_idpet) === petId);
  let id: number | undefined;
  let firstDone = false;
  let secondDone = false;
  for (const request of matches) {
    if (request.status && !['Nova', 'Solicitacao enviada', 'Solicitação enviada'].includes(request.status)) {
      throw new AdoptionAlreadySentError();
    }
    const requestId = Number(request.idsolicitacao || request.id);
    if (!requestId) throw new Error('Solicitação existente inválida.');
    const [first, second] = await Promise.all([
      api.get(`/adocaoetapa1/solicitacao/${requestId}`, config),
      api.get(`/adocaoetapa2/solicitacao/${requestId}`, config),
    ]);
    if (!Array.isArray(first.data) || !Array.isArray(second.data)) {
      throw new Error('Não foi possível verificar as etapas da solicitação.');
    }
    if (first.data.length && second.data.length) throw new AdoptionAlreadySentError();
    id = requestId;
    firstDone = first.data.length > 0;
    secondDone = second.data.length > 0;
  }
  if (!id) {
    const response = await api.post('/solicitacoesadocao', {
      fk_idpet: petId, fk_idusuario: userId, status: 'Nova',
    }, config);
    id = Number(response.data?.id || response.data?.idsolicitacao);
    if (!id) throw new Error(response.data?.message || 'A API não retornou o número da solicitação.');
  }
  for (const [route, done, fields] of [
    ['/adocaoetapa1', firstDone, etapa1],
    ['/adocaoetapa2', secondDone, etapa2],
  ] as const) {
    if (done) continue;
    const response = await api.post(route, { ...fields, fk_idsolicitacao: id }, config);
    if (!response.data?.id || response.data?.success === false) {
      throw new Error(response.data?.message || 'Não foi possível salvar todas as respostas. Tente enviar novamente.');
    }
  }
  return id;
}
