// ─── usePioneer — hook de polling do sistema Pioneer ─────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { registrarPioneer, consultarPioneer, type PioneerStatus, type RegistrarResult } from '../lib/pioneer-api';
import { getDeviceId, getNomeLocal } from '../lib/alliance-identity';

const POLL_MS       = 30_000;
const LS_PIONEER    = 'torre_obscura_pioneer_registered'; // 'andar_20' quando registrou com sucesso
const LS_POSICAO    = 'torre_obscura_pioneer_posicao';    // '1'-'10' se ficou no top 10
const LS_T2_SEEN    = 'torre_obscura_t2_banner_seen';
const LS_FIRST_SEEN = 'torre_obscura_pioneer_first_seen';

export interface PioneerState {
  status: PioneerStatus | null;
  foiPrimeiro: boolean;
  foiTop10: boolean;
  posicao: number | null;
  bannerVisto: boolean;
  notificacaoVista: boolean;
  dispensarBanner: () => void;
  dispensarNotificacao: () => void;
}

export function usePioneer(andarAtual: number): PioneerState {
  const [status, setStatus]     = useState<PioneerStatus | null>(null);
  const [posicao, setPosicao]   = useState<number | null>(() => {
    const v = localStorage.getItem(LS_POSICAO);
    return v ? parseInt(v, 10) : null;
  });
  const [bannerVisto, setBannerVisto]         = useState(() => !!localStorage.getItem(LS_T2_SEEN));
  const [notificacaoVista, setNotificacaoVista] = useState(() => !!localStorage.getItem(LS_FIRST_SEEN));

  // tentandoRef: evita dupla tentativa de registro (mas não persiste entre reloads).
  // LS_PIONEER: persiste entre reloads quando o POST teve sucesso.
  const tentando = useRef(false);

  const atualizar = useCallback(async () => {
    const s = await consultarPioneer('andar_20');
    if (s) setStatus(s);
  }, []);

  // Registrar quando chegar ao andar 20 — só escreve LS_PIONEER após sucesso.
  useEffect(() => {
    if (andarAtual < 20) return;
    if (localStorage.getItem(LS_PIONEER)) return; // já registrou com sucesso
    if (tentando.current) return;
    tentando.current = true;

    const deviceId = getDeviceId();
    const nome     = getNomeLocal() || 'Observador';

    void (async () => {
      const result: RegistrarResult | null = await registrarPioneer(deviceId, nome, 'andar_20');
      if (!result) {
        // Falha — libera para tentar novamente na próxima vez que andarAtual mudar
        tentando.current = false;
        return;
      }

      // Só persiste quando o servidor confirmou o registro
      localStorage.setItem(LS_PIONEER, 'andar_20');
      setStatus(result);

      if (result.posicao !== null) {
        setPosicao(result.posicao);
        localStorage.setItem(LS_POSICAO, String(result.posicao));
      }
    })();
  }, [andarAtual]);

  // Polling periódico
  useEffect(() => {
    void atualizar();
    const t = setInterval(() => { if (!document.hidden) void atualizar(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') void atualizar(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [atualizar]);

  const dispensarBanner = useCallback(() => {
    localStorage.setItem(LS_T2_SEEN, '1');
    setBannerVisto(true);
  }, []);

  const dispensarNotificacao = useCallback(() => {
    localStorage.setItem(LS_FIRST_SEEN, '1');
    setNotificacaoVista(true);
  }, []);

  return {
    status,
    foiPrimeiro: posicao === 1,
    foiTop10:    posicao !== null,
    posicao,
    bannerVisto,
    notificacaoVista,
    dispensarBanner,
    dispensarNotificacao,
  };
}
