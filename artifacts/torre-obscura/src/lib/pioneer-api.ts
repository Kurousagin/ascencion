// ─── PIONEER API — cliente leve para o sistema de Pioneers ───────────────────
// Não usa o api-client-react gerado; fetch direto para evitar dependência de
// código gerado. Todos os erros são silenciosos — o sistema é cosmético.

const BASE = '/api-server/api';

export interface PioneerStatus {
  total: number;
  desbloqueado: boolean;
  nomes: string[];
}

export interface RegistrarResult extends PioneerStatus {
  novo: boolean;
  posicao: number | null; // 1-10 se entre os primeiros 10, null caso contrário
}

export async function registrarPioneer(
  deviceId: string,
  nome: string,
  tipo: 'andar_20' = 'andar_20',
): Promise<RegistrarResult | null> {
  try {
    const res = await fetch(`${BASE}/pioneer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, nome, tipo }),
    });
    if (!res.ok) return null;
    return (await res.json()) as RegistrarResult;
  } catch {
    return null;
  }
}

export async function consultarPioneer(
  tipo: 'andar_20' = 'andar_20',
): Promise<PioneerStatus | null> {
  try {
    const res = await fetch(`${BASE}/pioneer/${tipo}`);
    if (!res.ok) return null;
    return (await res.json()) as PioneerStatus;
  } catch {
    return null;
  }
}
