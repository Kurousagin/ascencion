// ─── PRIMORDIAL API — cliente para o sistema de unicidade global de primordiais ──
// Cada primordial é único no mundo: apenas UM jogador pode tê-lo por temporada.
// Erros são silenciosos — o jogo funciona offline; a verificação é best-effort.

const BASE = '/api-server/api';

export async function checkPrimordialDisponivel(
  tipo: string,
  deviceId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/primordial/${tipo}?deviceId=${encodeURIComponent(deviceId)}`);
    if (!res.ok) return true; // fallback: assume disponível se servidor falhou
    const data = (await res.json()) as { disponivel: boolean };
    return data.disponivel;
  } catch {
    return true; // offline: assume disponível
  }
}

export async function claimPrimordial(
  tipo: string,
  deviceId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/primordial/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, deviceId }),
    });
    // 200 = reivindicado com sucesso (novo ou idempotente para o mesmo device).
    // 409 = outro jogador já reivindicou. Retorna false para bloquear concessão local.
    return res.ok;
  } catch {
    return false;
  }
}
