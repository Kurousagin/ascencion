import { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAlliance } from '../context/AllianceContext';
import { useWar } from '../context/WarContext';
import {
  Swords, Shield, RefreshCw, Wifi, WifiOff, X, Check, Skull, Users,
  Wheat, Trees, Mountain, Zap, Flame, Clock, ChevronRight, HeartPulse, History,
  AlertTriangle,
} from 'lucide-react';
import {
  NPC, RivalCidadela, calcNpcPower, calcPoderTropa, calcCustoMobilizacao,
  calcPoderMilitar, podeGuerrear, getProfissao, PROFISSOES, getEfeitos,
  GUERRA_DURACAO, GUERRA_MIN_TROPA,
} from '../lib/game-data';

type ResKey = 'comida' | 'madeira' | 'pedra' | 'ferro';
const RES_META: { key: ResKey; label: string; icon: any }[] = [
  { key: 'comida', label: 'Comida', icon: Wheat },
  { key: 'madeira', label: 'Madeira', icon: Trees },
  { key: 'pedra', label: 'Pedra', icon: Mountain },
  { key: 'ferro', label: 'Ferro', icon: Zap },
];

const POSTURA_LABEL: Record<string, string> = {
  agressiva: 'Agressiva', defensiva: 'Defensiva', equilibrada: 'Equilibrada',
};

export function War() {
  const { state, declararGuerra, responderGuerra } = useGame();
  const { rivais, online, carregando, refresh } = useWar();

  const [alvo, setAlvo] = useState<RivalCidadela | null>(null);
  const [tropaSel, setTropaSel] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);

  // Invasão pendente — defesa
  const [tropaDef, setTropaDef] = useState<Set<string>>(new Set());
  const [erroDefesa, setErroDefesa] = useState<string | null>(null);

  const guerra = state.guerra;
  const guerraPendente = state.guerraPendente;
  const ef = useMemo(() => getEfeitos(state.edificios, state.npcs), [state.edificios, state.npcs]);
  const poderMilitar = useMemo(() => calcPoderMilitar(state), [state]);
  const elegiveis = useMemo(() => state.npcs.filter(podeGuerrear), [state.npcs]);

  const abrirDeclaracao = (r: RivalCidadela) => {
    setAlvo(r);
    setTropaSel(new Set());
    setErro(null);
  };

  const toggleTropa = (id: string) => {
    setTropaSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tropaEscolhida = useMemo(
    () => state.npcs.filter(n => tropaSel.has(n.id)),
    [state.npcs, tropaSel],
  );
  const poderTropa = calcPoderTropa(tropaEscolhida, ef.poderBonus);
  const custo = calcCustoMobilizacao(tropaSel.size);
  const podePagar = (['comida', 'madeira', 'pedra', 'ferro'] as ResKey[])
    .every(k => state.recursos[k] >= (custo as any)[k]);

  const confirmarGuerra = () => {
    if (!alvo || tropaSel.size < GUERRA_MIN_TROPA) return;
    if (!podePagar) { setErro('Recursos insuficientes para a mobilização.'); return; }
    const ok = declararGuerra(alvo, [...tropaSel]);
    if (ok) { setAlvo(null); setTropaSel(new Set()); setErro(null); }
    else setErro('Não foi possível declarar guerra. Verifique tropa e recursos.');
  };

  const toggleDef = (id: string) => setTropaDef(prev => {
    const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next;
  });

  const confirmarDefesa = () => {
    if (tropaDef.size < GUERRA_MIN_TROPA) { setErroDefesa('Selecione ao menos 1 defensor.'); return; }
    const ok = responderGuerra([...tropaDef]);
    if (ok) { setTropaDef(new Set()); setErroDefesa(null); }
    else setErroDefesa('Não foi possível mobilizar a defesa.');
  };

  return (
    <div className="h-full overflow-y-auto px-4 pt-5 pb-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-cinzel text-xl text-primary tracking-widest flex items-center gap-2">
          <Swords size={20} className="text-primary" /> GUERRA
        </h1>
        <span className={`text-[10px] flex items-center gap-1 ${online ? 'text-success' : 'text-muted-foreground'}`}>
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          {online ? 'online' : 'offline'}
        </span>
      </div>
      <div className="h-px bg-gradient-to-r from-primary/60 via-primary/10 to-transparent mb-4" />

      {guerra ? (
        <GuerraAtivaPanel />
      ) : guerraPendente ? (
        /* ── Invasão pendente ──────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Banner de ameaça */}
          <div className="bg-gradient-to-b from-destructive/20 to-transparent border border-destructive/60 rounded-md p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-destructive" />
              <span className="text-[9px] text-destructive tracking-[0.25em] font-bold">INVASÃO DECLARADA</span>
            </div>
            <div className="font-cinzel text-lg text-foreground">{guerraPendente.rival.nome}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Postura {POSTURA_LABEL[guerraPendente.rival.postura]} · poder {guerraPendente.rival.poderBase} · andar {guerraPendente.rival.andar}
            </div>
          </div>

          {/* Contagem regressiva */}
          <div className="flex items-center justify-between bg-[#0D1117] border border-destructive/30 rounded-md px-4 py-3">
            <span className="text-[10px] text-secondary tracking-widest">PRAZO PARA DEFENDER</span>
            <span className={`font-cinzel text-2xl flex items-center gap-1 ${guerraPendente.prazoResposta <= 1 ? 'text-destructive' : 'text-warning'}`}>
              <Clock size={16} /> {guerraPendente.prazoResposta} dia{guerraPendente.prazoResposta !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Comparação de forças */}
          <div className="grid grid-cols-3 items-center gap-2 bg-[#0D1117] border border-card-border rounded-md p-3">
            <div className="text-center">
              <div className="text-[9px] text-secondary tracking-widest mb-1">SEU PODER</div>
              <div className="font-cinzel text-xl text-success">{Math.round(calcPoderMilitar(state))}</div>
            </div>
            <div className="text-center text-muted-foreground text-xs font-cinzel">VS</div>
            <div className="text-center">
              <div className="text-[9px] text-secondary tracking-widest mb-1">INVASOR</div>
              <div className="font-cinzel text-xl text-destructive">{guerraPendente.rival.poderBase}</div>
            </div>
          </div>

          {/* Seleção de defensores */}
          <div className="text-[9px] text-secondary tracking-widest mb-1">MOBILIZAR DEFENSORES ({tropaDef.size})</div>
          {elegiveis.length === 0 ? (
            <div className="text-[10px] text-destructive italic border border-destructive/30 bg-destructive/5 rounded-md p-3">
              Nenhum morador disponível! A cidadela será saqueada ao expirar o prazo.
            </div>
          ) : (
            <div className="space-y-1.5">
              {elegiveis.map(n => {
                const sel = tropaDef.has(n.id);
                const prof = PROFISSOES[getProfissao(n)];
                return (
                  <button
                    key={n.id}
                    onClick={() => toggleDef(n.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm border text-left transition-all touch-manipulation ${
                      sel ? 'bg-success/10 border-success' : 'bg-black/30 border-card-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${sel ? 'bg-success border-success' : 'border-muted-foreground'}`}>
                        {sel && <Check size={11} className="text-black" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-foreground truncate">{n.nome}</div>
                        <div className="text-[9px] text-muted-foreground">{prof.nome} · {Math.round(calcNpcPower(n))} pwr</div>
                      </div>
                    </div>
                    <div className="font-cinzel text-sm text-primary flex-shrink-0">{Math.round(calcNpcPower(n))}</div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-[9px] text-muted-foreground italic text-center">
            Defesa não tem custo de mobilização. Sem resposta: auto-defesa com todos os disponíveis (ou saque imediato).
          </div>

          {erroDefesa && <div className="text-[11px] text-destructive text-center">{erroDefesa}</div>}

          <button
            onClick={confirmarDefesa}
            disabled={tropaDef.size < GUERRA_MIN_TROPA || elegiveis.length === 0}
            className="w-full py-3 rounded-sm bg-success/10 border border-success text-success font-cinzel tracking-widest hover:bg-success/20 active:scale-[0.98] transition-all touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Shield size={16} /> DEFENDER CIDADELA ({tropaDef.size} combatente{tropaDef.size !== 1 ? 's' : ''})
          </button>
        </div>
      ) : (
        <>
          {/* Poder militar */}
          <div className="bg-[#0D1117] border border-card-border rounded-md p-3 mb-4 flex items-center justify-between">
            <div>
              <div className="text-[9px] text-secondary tracking-widest mb-1">SEU PODER MILITAR</div>
              <div className="font-cinzel text-2xl text-foreground flex items-center gap-2">
                <Flame size={18} className="text-orange" /> {poderMilitar}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {elegiveis.length} combatente(s) disponíveis {ef.poderBonus > 0 ? `· Quartel +${Math.round(ef.poderBonus * 100)}%` : ''}
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={carregando}
              className="text-[10px] flex items-center gap-1 px-3 py-2 rounded-sm border border-primary/40 text-primary hover:bg-primary/10 active:scale-95 transition-all touch-manipulation disabled:opacity-50"
            >
              <RefreshCw size={12} className={carregando ? 'animate-spin' : ''} /> RIVAIS
            </button>
          </div>

          {/* Lista de rivais */}
          <div className="text-[9px] text-secondary tracking-widest mb-2 flex items-center gap-1">
            <Users size={11} className="text-primary" /> RIVAIS AVISTADOS
          </div>

          {rivais.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs italic py-10 border border-dashed border-card-border rounded-md">
              {carregando ? 'Procurando cidadelas rivais...' : online
                ? 'Nenhum rival avistado. Toque em RIVAIS para procurar.'
                : 'Sem conexão com o mundo exterior. Tente novamente.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {rivais.map(r => (
                <RivalCard key={r.slug} rival={r} meuPoder={poderMilitar} onAtacar={() => abrirDeclaracao(r)} />
              ))}
            </div>
          )}

          {/* Histórico */}
          <HistoricoGuerras />
        </>
      )}

      {/* Modal de declaração */}
      {alvo && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end sm:items-center justify-center" onClick={() => setAlvo(null)}>
          <div
            className="w-full max-w-md bg-[#0D1117] border-t sm:border border-primary/40 rounded-t-xl sm:rounded-xl max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#0D1117] border-b border-card-border px-4 py-3 flex items-center justify-between z-10">
              <div className="font-cinzel text-primary tracking-wider flex items-center gap-2">
                <Swords size={16} /> Atacar {alvo.nome}
              </div>
              <button onClick={() => setAlvo(null)} className="text-muted-foreground hover:text-foreground touch-manipulation"><X size={18} /></button>
            </div>

            <div className="p-4">
              {/* Comparação de poder */}
              <div className="grid grid-cols-3 items-center gap-2 mb-4">
                <div className="text-center">
                  <div className="text-[9px] text-secondary tracking-widest mb-1">SUA TROPA</div>
                  <div className="font-cinzel text-xl text-success">{Math.round(poderTropa)}</div>
                </div>
                <div className="text-center text-muted-foreground text-xs font-cinzel">VS</div>
                <div className="text-center">
                  <div className="text-[9px] text-secondary tracking-widest mb-1">{alvo.nome}</div>
                  <div className="font-cinzel text-xl text-destructive">{alvo.poderBase}</div>
                </div>
              </div>
              <div className="text-[10px] text-center text-muted-foreground mb-4">
                Postura {POSTURA_LABEL[alvo.postura] ?? alvo.postura} · pop. {alvo.populacao} · andar {alvo.andar}
                {poderTropa > 0 && (
                  <div className={`mt-1 font-bold ${poderTropa >= alvo.poderBase ? 'text-success' : 'text-warning'}`}>
                    {poderTropa >= alvo.poderBase ? 'Vantagem estimada' : 'Você está em desvantagem'}
                  </div>
                )}
              </div>

              {/* Seleção de tropa */}
              <div className="text-[9px] text-secondary tracking-widest mb-2">MOBILIZAR COMBATENTES ({tropaSel.size})</div>
              {elegiveis.length === 0 ? (
                <div className="text-[10px] text-muted-foreground italic mb-4">
                  Nenhum morador disponível. Combatentes em expedição, emprestados ou de reforço não podem ir à guerra.
                </div>
              ) : (
                <div className="space-y-1.5 mb-4">
                  {elegiveis.map(n => {
                    const sel = tropaSel.has(n.id);
                    const prof = PROFISSOES[getProfissao(n)];
                    return (
                      <button
                        key={n.id}
                        onClick={() => toggleTropa(n.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-sm border text-left transition-all touch-manipulation ${
                          sel ? 'bg-success/10 border-success' : 'bg-black/30 border-card-border hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${sel ? 'bg-success border-success' : 'border-muted-foreground'}`}>
                            {sel && <Check size={11} className="text-black" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-foreground truncate">
                              {n.nome}{n.obscuro ? ' ⚫' : ''}
                            </div>
                            <div className="text-[9px] text-muted-foreground">{prof.nome} · fad {Math.floor(n.fadiga)}</div>
                          </div>
                        </div>
                        <div className="font-cinzel text-sm text-primary flex-shrink-0">{Math.round(calcNpcPower(n))}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custo de mobilização */}
              <div className="bg-black/30 border border-card-border rounded-sm p-3 mb-4">
                <div className="text-[9px] text-secondary tracking-widest mb-2">CUSTO DE MOBILIZAÇÃO</div>
                <div className="flex flex-wrap gap-3">
                  {RES_META.map(({ key, icon: Icon }) => {
                    const need = (custo as any)[key] as number;
                    if (!need) return null;
                    const falta = state.recursos[key] < need;
                    return (
                      <span key={key} className={`text-[11px] flex items-center gap-1 ${falta ? 'text-destructive' : 'text-foreground'}`}>
                        <Icon size={12} className={falta ? 'text-destructive' : 'text-muted-foreground'} /> {need}
                      </span>
                    );
                  })}
                  {tropaSel.size === 0 && <span className="text-[11px] text-muted-foreground italic">Selecione combatentes</span>}
                </div>
                <div className="text-[9px] text-muted-foreground mt-2">
                  Campanha de {GUERRA_DURACAO} dias. Os mobilizados ficam indisponíveis para torre e trabalho até o fim.
                </div>
              </div>

              {erro && <div className="text-[11px] text-destructive text-center mb-3">{erro}</div>}

              <button
                onClick={confirmarGuerra}
                disabled={tropaSel.size < GUERRA_MIN_TROPA || !podePagar}
                className="w-full py-3 rounded-sm bg-destructive/20 border border-destructive text-destructive font-cinzel tracking-widest hover:bg-destructive/30 active:scale-[0.98] transition-all touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Swords size={16} /> DECLARAR GUERRA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RivalCard({ rival, meuPoder, onAtacar }: { rival: RivalCidadela; meuPoder: number; onAtacar: () => void }) {
  const diff = meuPoder - rival.poderBase;
  const rel = diff >= rival.poderBase * 0.25 ? { t: 'Mais fraco', c: 'text-success' }
    : diff <= -rival.poderBase * 0.25 ? { t: 'Mais forte', c: 'text-destructive' }
    : { t: 'Equilibrado', c: 'text-warning' };
  return (
    <div className="bg-[#0D1117] border border-card-border rounded-md p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <div className="font-cinzel text-foreground text-sm truncate">{rival.nome}</div>
          <div className="text-[10px] text-muted-foreground">
            Postura {POSTURA_LABEL[rival.postura] ?? rival.postura} · pop. {rival.populacao} · andar {rival.andar}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="font-cinzel text-lg text-destructive flex items-center gap-1 justify-end">
            <Shield size={13} /> {rival.poderBase}
          </div>
          <div className={`text-[9px] font-bold tracking-wider ${rel.c}`}>{rel.t}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2.5">
          {RES_META.map(({ key, icon: Icon }) => (
            <span key={key} className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Icon size={10} /> {rival.recursos[key]}
            </span>
          ))}
        </div>
        <button
          onClick={onAtacar}
          className="text-[10px] flex items-center gap-1 px-3 py-1.5 rounded-sm bg-destructive/15 border border-destructive/50 text-destructive hover:bg-destructive/25 active:scale-95 transition-all touch-manipulation font-bold tracking-wider"
        >
          ATACAR <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function GuerraAtivaPanel() {
  const { state } = useGame();
  const { pedirAjuda } = useAlliance();
  const g = state.guerra!;
  const tropa: NPC[] = state.npcs.filter(n => g.tropaIds.includes(n.id));
  const vivos = tropa.filter(n => n.vivo);
  const diasRestantes = Math.max(0, g.duracao - g.diasDecorridos);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  // Barra de momento (-100..100), centrada em 0.
  const m = g.momento;
  const frac = Math.min(50, Math.abs(m) / 2); // % de cada lado do centro

  return (
    <div className="space-y-4">
      {/* Cartão do rival */}
      <div className="bg-gradient-to-b from-destructive/10 to-transparent border border-destructive/40 rounded-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-destructive tracking-widest mb-1 animate-pulse">CAMPANHA EM CURSO</div>
            <div className="font-cinzel text-lg text-foreground">{g.rival.nome}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-secondary tracking-widest">DIAS RESTANTES</div>
            <div className="font-cinzel text-2xl text-primary flex items-center gap-1 justify-end">
              <Clock size={16} /> {diasRestantes}
            </div>
          </div>
        </div>

        {/* Momento */}
        <div className="mt-4">
          <div className="flex justify-between text-[9px] tracking-widest mb-1">
            <span className="text-destructive">RECUO</span>
            <span className="text-secondary">MOMENTO {m > 0 ? '+' : ''}{m}</span>
            <span className="text-success">AVANÇO</span>
          </div>
          <div className="relative h-2.5 bg-black/60 rounded-full overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30 -translate-x-1/2 z-10" />
            {m >= 0 ? (
              <div className="absolute top-0 bottom-0 bg-success/80" style={{ left: '50%', width: `${frac}%` }} />
            ) : (
              <div className="absolute top-0 bottom-0 bg-destructive/80" style={{ right: '50%', width: `${frac}%` }} />
            )}
          </div>
        </div>

        {/* Suprimento */}
        <div className={`mt-3 text-[10px] flex items-center gap-1 ${g.suprido ? 'text-success' : 'text-destructive'}`}>
          {g.suprido ? <Check size={12} /> : <Flame size={12} />}
          {g.suprido ? 'Linhas de suprimento firmes' : 'SEM SUPRIMENTO — tropas enfraquecidas'}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground italic">{g.ultimoRelato}</div>
      </div>

      {/* Baixas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0D1117] border border-card-border rounded-md p-2.5 text-center">
          <div className="text-[9px] text-secondary tracking-widest mb-1">SEUS MORTOS</div>
          <div className="font-cinzel text-lg text-destructive flex items-center justify-center gap-1"><Skull size={14} /> {g.baixasJogador}</div>
        </div>
        <div className="bg-[#0D1117] border border-card-border rounded-md p-2.5 text-center">
          <div className="text-[9px] text-secondary tracking-widest mb-1">FERIDOS</div>
          <div className="font-cinzel text-lg text-warning flex items-center justify-center gap-1"><HeartPulse size={14} /> {g.feridosJogador}</div>
        </div>
        <div className="bg-[#0D1117] border border-card-border rounded-md p-2.5 text-center">
          <div className="text-[9px] text-secondary tracking-widest mb-1">BAIXAS RIVAIS</div>
          <div className="font-cinzel text-lg text-primary flex items-center justify-center gap-1"><Swords size={14} /> {g.baixasRival}</div>
        </div>
      </div>

      {/* Integridade do rival */}
      <div>
        <div className="flex justify-between text-[9px] text-secondary tracking-widest mb-1">
          <span>EXÉRCITO RIVAL</span><span>{Math.round(g.rivalIntegridade * 100)}%</span>
        </div>
        <div className="h-2 bg-black/60 rounded-full overflow-hidden">
          <div className="h-full bg-destructive/70" style={{ width: `${Math.round(g.rivalIntegridade * 100)}%` }} />
        </div>
      </div>

      {/* Tropa mobilizada */}
      <div>
        <div className="text-[9px] text-secondary tracking-widest mb-2 flex items-center gap-1">
          <Users size={11} className="text-primary" /> TROPA NO FRONT ({vivos.length}/{tropa.length})
        </div>
        <div className="space-y-1.5">
          {tropa.map(n => (
            <div key={n.id} className={`flex items-center justify-between px-3 py-2 rounded-sm border ${n.vivo ? 'bg-black/30 border-card-border' : 'bg-destructive/10 border-destructive/40 opacity-60'}`}>
              <div className="flex items-center gap-2 min-w-0">
                {!n.vivo && <Skull size={12} className="text-destructive flex-shrink-0" />}
                <span className="text-xs text-foreground truncate">{n.nome}{n.obscuro ? ' ⚫' : ''}</span>
              </div>
              {n.vivo ? (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground">fad {Math.floor(n.fadiga)}</span>
                  <span className="font-cinzel text-xs text-primary">{Math.round(calcNpcPower(n))}</span>
                </div>
              ) : (
                <span className="text-[9px] text-destructive tracking-widest">TOMBOU</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pedir Ajuda */}
      <button
        onClick={async () => {
          setEnviandoPedido(true);
          const res = await pedirAjuda(g.rival.nome, diasRestantes);
          setEnviandoPedido(false);
          if (res.ok) {
            // Feedback será através da notificação push e próximo sync
          }
        }}
        disabled={enviandoPedido}
        className="w-full py-2 px-3 bg-warning/20 hover:bg-warning/30 disabled:opacity-50 border border-warning/50 rounded-md text-[10px] text-warning font-bold tracking-widest transition-colors"
      >
        {enviandoPedido ? 'ENVIANDO...' : 'PEDIR AJUDA ÀS ALIADAS'}
      </button>

      <div className="text-[10px] text-muted-foreground text-center italic pt-2">
        A campanha avança sozinha a cada dia. Acompanhe o desfecho aqui e no Registro.
      </div>
    </div>
  );
}

function HistoricoGuerras() {
  const { state } = useGame();
  const h = state.guerrasHistorico;
  if (!h || h.length === 0) return null;
  return (
    <div className="mt-6">
      <div className="text-[9px] text-secondary tracking-widest mb-2 flex items-center gap-1">
        <History size={11} className="text-primary" /> CAMPANHAS PASSADAS
      </div>
      <div className="space-y-1.5">
        {h.map(reg => {
          const venceu = reg.resultado === 'vitoria';
          return (
            <div key={reg.id} className={`flex items-center justify-between px-3 py-2 rounded-sm border text-xs ${venceu ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
              <div className="min-w-0">
                <div className="text-foreground truncate">{reg.rivalNome}</div>
                <div className="text-[9px] text-muted-foreground">
                  dias {reg.diaInicio}–{reg.diaFim} · {reg.baixasJogador} baixas
                </div>
              </div>
              <span className={`text-[9px] font-bold tracking-widest flex-shrink-0 ml-2 ${venceu ? 'text-success' : 'text-destructive'}`}>
                {venceu ? 'VITÓRIA' : 'DERROTA'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
