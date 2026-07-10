// ─── PRIMORDIAL API — wrapper silencioso sobre o client gerado ───────────────
// Cada primordial é único no mundo: apenas UM jogador pode tê-lo por temporada.
// O contrato vive em lib/api-spec/openapi.yaml (paths /primordial*).
// Erros são silenciosos — o jogo funciona offline; a verificação é best-effort.

import {
  consultarPrimordial,
  reivindicarPrimordial,
  liberarPrimordiais,
  type PrimordialTipo,
} from '@workspace/api-client-react';

export async function checkPrimordialDisponivel(
  tipo: string,
  deviceId: string,
): Promise<boolean> {
  try {
    const data = await consultarPrimordial(tipo as PrimordialTipo, { deviceId });
    return data.disponivel;
  } catch {
    return true; // offline/erro: assume disponível (best-effort)
  }
}

// Libera todos os claims de primordial deste device.
// Chamado quando o jogador inicia um novo jogo — permite que outro player receba o primordial.
export async function releaseAllPrimordialClaims(deviceId: string): Promise<void> {
  try {
    await liberarPrimordiais({ deviceId });
  } catch {
    // Silencioso — será tentado novamente na próxima vez (sem bloquear o novo jogo)
  }
}

export async function claimPrimordial(
  tipo: string,
  deviceId: string,
): Promise<boolean> {
  try {
    // 200 = reivindicado (novo ou idempotente para o mesmo device).
    // 409 (outro jogador já reivindicou) lança ApiError → false, bloqueando a concessão local.
    await reivindicarPrimordial({ tipo: tipo as PrimordialTipo, deviceId });
    return true;
  } catch {
    return false;
  }
}
