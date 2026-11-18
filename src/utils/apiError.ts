import { isAxiosError } from 'axios';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Confira se a API e o MySQL estão ligados e tente novamente.';
    }
    const data = error.response.data;
    return data?.message || data?.erro || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
