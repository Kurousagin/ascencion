// ─── PIONEER API — wrapper silencioso sobre o client gerado ──────────────────
// O contrato vive em lib/api-spec/openapi.yaml (paths /pioneer*); o client
// gerado resolve os paths corretos (/api/...). Todos os erros são silenciosos —
// o sistema é cosmético e best-effort: o jogo funciona offline sem ele.

import {
  registrarPioneer as apiRegistrarPioneer,
  consultarPioneer as apiConsultarPioneer,
  type PioneerStatus,
  type PioneerRegistroResposta,
} from '@workspace/api-client-react';

export type { PioneerStatus };
export type RegistrarResult = PioneerRegistroResposta;

export async function registrarPioneer(
  deviceId: string,
  nome: string,
  tipo: 'andar_20' = 'andar_20',
): Promise<RegistrarResult | null> {
  try {
    return await apiRegistrarPioneer({ deviceId, nome, tipo });
  } catch {
    return null;
  }
}

export async function consultarPioneer(
  tipo: 'andar_20' = 'andar_20',
): Promise<PioneerStatus | null> {
  try {
    return await apiConsultarPioneer(tipo);
  } catch {
    return null;
  }
}
