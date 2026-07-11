// ─── PRIMORDIAL API — wrapper silencioso sobre o client gerado ───────────────
// Cada primordial é único no mundo: apenas UM jogador pode tê-lo por temporada.
// O contrato vive em lib/api-spec/openapi.yaml (paths /primordial*).
// Erros são silenciosos — o jogo funciona offline; a verificação é best-effort.

import {
  consultarPrimordial,
  reivindicarPrimordial,
  liberarPrimordiais,
  ApiError,
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

// A unicidade de primordial é regra DURA (um por mundo, por temporada): o NPC
// só é concedido com 'ok' confirmado pelo servidor. Distinguir o conflito real
// (409 = outro jogador levou → re-sortear) de falha de rede ('erro' → manter o
// resultado e tentar de novo) evita tanto duplicatas quanto roubar o sorteio.
export type ClaimResultado = 'ok' | 'conflito' | 'erro';

export async function claimPrimordial(
  tipo: string,
  deviceId: string,
): Promise<ClaimResultado> {
  try {
    // 200 = reivindicado (novo ou idempotente para o mesmo device).
    await reivindicarPrimordial({ tipo: tipo as PrimordialTipo, deviceId });
    return 'ok';
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) return 'conflito';
    return 'erro';
  }
}
