import { useGame } from '../context/GameContext';
import { useAlliance } from '../context/AllianceContext';
import { ShieldAlert, Bell, Gift, Check, Hammer, ChevronDown, HelpCircle, Footprints } from 'lucide-react';
import { getEfeitos, POP_BASE, EdificioTipo, nomeEdificio, trabalhadoresDe, POSTO_AFIM } from '../lib/game-data';
import { METAS_DIARIAS_META } from '../quest-engine';
import { useTemporada } from '../hooks/useTemporada';
import { MuralAcontecimentos } from '../components/MuralAcontecimentos';
import { ClimaBanner } from '../components/ClimaBanner';
import {
  isPushSupported,
  isPushEnabled,
  subscribeToPush,
  unsubscribeFromPush
} from '../lib/push-notifications';
import { getDeviceId } from '../lib/alliance-identity';
import { useState, useEffect } from 'react';

interface DashboardProps {
  t2Desbloqueado: boolean;
  // Reabre o guia de boas-vindas (slides) para quem se perdeu.
  onAjuda?: () => void;
  // Refaz o tour guiado pelas telas — pode ser revisto quantas vezes quiser.
  onRefazerTour?: () => void;
  // Navegação para outra aba (deep-link dos alertas e do rodapé do Mural).
  onNavegar?: (tab: string) => void;
}

// A home responde, nesta ordem: "tem algo errado AGORA?" (alertas), "como
// estamos?" (vitais), "o que eu faço?" (metas), "o que aconteceu?" (mural).
// Configuração (velocidade/push) vive no rodapé — ajusta-se uma vez, não toda sessão.
export function Dashboard({ t2Desbloqueado, onAjuda, onRefazerTour, onNavegar }: DashboardProps) {
  const { state, setSpeed, gerarMetasDiarias, reivindicarPresenteDaTorre } = useGame();
  const { aliadas } = useAlliance();
  const temporada = useTemporada(t2Desbloqueado);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushEnabled, setPushEnabledState] = useState(isPushEnabled());
  const [expandedSection, setExpandedSection] = useState<'construcoes' | 'intel' | null>(null);

  // Gera as metas do dia ao montar (no-op se já geradas hoje).
  useEffect(() => {
    gerarMetasDiarias(aliadas.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aliadas.length]);

  const md = state.metasDiarias;
  const metasCompletas = md.objetivos.length > 0 && md.progresso.length === md.objetivos.length;

  const getMoralColor = (m: number) => {
    if (m > 60) return 'text-success';
    if (m < 40) return 'text-destructive';
    return 'text-warning';
  };

  const handlePushToggle = async () => {
    if (!isPushSupported()) return;

    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush(getDeviceId());
        setPushEnabledState(false);
      } else {
        await subscribeToPush(getDeviceId());
        setPushEnabledState(true);
      }
    } catch (error) {
      console.error("Push toggle failed:", error);
    } finally {
      setPushLoading(false);
    }
  };

  const vivos        = state.npcs.filter(n => n.vivo).length;
  const ef           = getEfeitos(state.edificios, state.npcs);
  const cap          = ef.capPopulacao ?? POP_BASE;
  // Conta apenas moradores próprios (exclui hóspedes de aliança)
  const proprios     = state.npcs.filter(n => n.vivo && !n.emprestado && !n.reforco).length;
  const excedente    = Math.max(0, proprios - cap);
  const superlotado  = excedente > 0;

  // Balanço de comida (~ espelho do processDay: produção − consumo − superlotação).
  // Estimativa de exibição — o tick real escala a produção pelo humor de cada um.
  const consumoDia  = vivos * 1.2 + excedente * 1.5;
  const saldoComida = ef.comidaDia - consumoDia;
  const diasComida  = saldoComida >= 0 ? Infinity : Math.max(0, Math.floor(state.recursos.comida / -saldoComida));

  // Deep-link: abre o Censo já com a triagem certa aplicada.
  const irParaPovo = (triagem: string) => {
    sessionStorage.setItem('torre_povo_filtro', triagem);
    onNavegar?.('povo');
  };

  // Triagem do dia: só aparece quando existe problema, e cada alerta leva
  // direto para onde se resolve.
  const traidores = state.npcs.filter(n => n.vivo && n.lealdade < 30).length;
  const exaustos  = state.npcs.filter(n => n.vivo && n.fadiga >= 70).length;
  const alertas: { id: string; texto: string; tom: 'critico' | 'aviso'; acao?: () => void }[] = [];
  if (state.recursos.comida <= 0) {
    alertas.push({ id: 'fome', tom: 'critico', texto: '☠ SEM COMIDA — moradores passam fome', acao: () => onNavegar?.('cidadela') });
  } else if (diasComida <= 3) {
    alertas.push({ id: 'comida', tom: 'aviso', texto: `⚠ Comida para ~${diasComida} dia${diasComida !== 1 ? 's' : ''} no ritmo atual`, acao: () => onNavegar?.('cidadela') });
  }
  if (superlotado) {
    alertas.push({ id: 'lotacao', tom: 'aviso', texto: `⚠ Superlotação +${excedente} — melhore o Alojamento`, acao: () => onNavegar?.('cidadela') });
  }
  if (traidores > 0) {
    alertas.push({ id: 'lealdade', tom: 'critico', texto: `🗡 ${traidores} morador${traidores > 1 ? 'es' : ''} à beira da traição`, acao: () => irParaPovo('lealdade') });
  }
  if (exaustos >= 3) {
    alertas.push({ id: 'exaustos', tom: 'aviso', texto: `😴 ${exaustos} exaustos — descanso antes da próxima subida`, acao: () => irParaPovo('exaustos') });
  }

  return (
    <div className="p-3 space-y-2 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-1.5 border-b border-primary/30 relative flex items-center justify-between">
        <h2 className="text-xl font-cinzel font-bold tracking-widest text-primary">OBSERVATÓRIO</h2>
        <div className="flex items-center gap-1.5 shrink-0">
          {onRefazerTour && (
            <button
              onClick={onRefazerTour}
              aria-label="Refazer o tour pelas telas"
              title="Tour pelas telas"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-primary/30 text-primary/60 hover:text-primary hover:border-primary/60 transition-all touch-manipulation"
            >
              <Footprints size={16} />
            </button>
          )}
          {onAjuda && (
            <button
              onClick={onAjuda}
              aria-label="Como jogar"
              title="Como jogar"
              className="w-9 h-9 flex items-center justify-center rounded-sm border border-primary/30 text-primary/60 hover:text-primary hover:border-primary/60 transition-all touch-manipulation"
            >
              <HelpCircle size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ── Faixa da temporada ativa (muda visualmente ao desbloquear a T2) ── */}
      <div
        className="rounded px-3 py-1.5 flex items-center justify-between border"
        style={{ borderColor: `${temporada.data.corTema}55`, backgroundColor: `${temporada.data.corTema}12` }}
      >
        <span className="text-xs font-cinzel tracking-[0.2em]" style={{ color: temporada.data.corTema }}>
          TEMPORADA {temporada.romano} · {temporada.data.nome.toUpperCase()}
        </span>
        <span className="text-[10px] text-white/45">
          {t2Desbloqueado ? 'O véu entre as temporadas se rasgou' : 'A Torre parece acabar no vigésimo'}
        </span>
      </div>

      {/* ── ALERTAS — o que precisa de atenção AGORA (só quando existe) ──── */}
      {alertas.length > 0 && (
        <div className="space-y-1">
          {alertas.map(a => (
            <button
              key={a.id}
              onClick={a.acao}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded border text-left text-xs font-bold touch-manipulation transition-all active:scale-[0.99] ${
                a.tom === 'critico'
                  ? 'bg-destructive/10 border-destructive/50 text-destructive'
                  : 'bg-warning/10 border-warning/40 text-warning'
              }`}
            >
              <span className="min-w-0">{a.texto}</span>
              <span className="shrink-0 opacity-60">›</span>
            </button>
          ))}
        </div>
      )}

      {/* ── HOJE — como a Torre amanheceu (estação/evento/biomas) ────────── */}
      <ClimaBanner seed={state.camaraSeed ?? 0} dia={state.dia} andarAtual={state.andarAtual} />

      {/* ── VITAIS ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-1.5" data-tour="vitais">
        <div className="bg-[#1C2333] border border-primary/30 p-2 rounded flex flex-col items-center justify-center">
          <span className="text-[10px] text-secondary tracking-widest mb-0.5">DIA</span>
          <span className="text-lg text-primary font-bold font-cinzel">{state.dia}</span>
        </div>
        <div className="bg-[#1C2333] border border-primary/30 p-2 rounded flex flex-col items-center justify-center">
          <span className="text-[10px] text-secondary tracking-widest mb-0.5">ANDAR</span>
          <span className="text-lg text-foreground font-bold font-cinzel">{Math.min(state.andarAtual - 1, temporada.andarMax)}/{temporada.andarMax}</span>
        </div>
        <div className="bg-[#1C2333] border border-primary/30 p-2 rounded flex flex-col items-center justify-center">
          <span className="text-[10px] text-secondary tracking-widest mb-0.5">MORAL</span>
          <span className={`text-lg font-bold font-cinzel ${getMoralColor(state.moral)}`}>{Math.round(state.moral)}%</span>
        </div>
        <div
          className="bg-[#1C2333] border border-primary/30 p-2 rounded flex flex-col items-center justify-center"
          title="Balanço diário estimado de comida (produção − consumo)"
        >
          <span className="text-[10px] text-secondary tracking-widest mb-0.5">COMIDA</span>
          {saldoComida >= 0 ? (
            <span className="text-lg font-bold font-cinzel text-success">
              +{Math.round(saldoComida)}<span className="text-[10px] text-white/40">/d</span>
            </span>
          ) : (
            <span className={`text-lg font-bold font-cinzel ${diasComida <= 3 ? 'text-destructive' : diasComida <= 7 ? 'text-warning' : 'text-foreground'}`}>
              {diasComida}<span className="text-[10px] text-white/40">d</span>
            </span>
          )}
        </div>
      </div>

      {/* ── POPULAÇÃO (linha fina) ───────────────────────────────────────── */}
      <div className={`border p-2 rounded text-[12px] flex justify-between items-center ${
        superlotado ? 'bg-destructive/10 border-destructive/50' : 'bg-[#1C2333] border-primary/30'
      }`}>
        <span className={`tracking-widest font-cinzel ${superlotado ? 'text-destructive' : 'text-secondary'}`}>
          POPULAÇÃO: {proprios}/{cap} {superlotado && <span className="animate-pulse">⚠ +{excedente}</span>}
        </span>
        {vivos !== proprios && <span className="text-muted-foreground text-xs">+{vivos - proprios} hóspedes</span>}
      </div>

      {/* ── METAS DE HOJE — o loop diário vem antes do feed ─────────────── */}
      <div className="space-y-1" data-tour="metas">
        <span className="text-xs text-secondary tracking-widest block">METAS DE HOJE</span>
        <div className="bg-[#1C2333] border border-primary/30 rounded p-2 space-y-1.5">
          {md.objetivos.map(id => {
            const meta = METAS_DIARIAS_META[id];
            const feito = md.progresso.includes(id);
            return (
              <div key={id} className={`flex items-start gap-2 p-1 rounded ${feito ? 'bg-success/10 border border-success/30' : ''}`}>
                <span className={`text-lg leading-none shrink-0 ${feito ? '' : 'opacity-50'}`}>{meta.icone}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-cinzel font-bold leading-tight ${feito ? 'text-success' : 'text-foreground'}`}>{meta.titulo}</div>
                  <div className="text-xs text-secondary/60 leading-tight">{meta.descricao}</div>
                </div>
              </div>
            );
          })}

          {md.recompensaColetada ? (
            <div className="w-full h-8 flex items-center justify-center gap-1 rounded text-xs border border-success/40 bg-success/10 text-success font-bold">
              <Check size={12} /> PRESENTE COLETADO
            </div>
          ) : (
            <button
              onClick={reivindicarPresenteDaTorre}
              disabled={!metasCompletas}
              className={`w-full h-8 flex items-center justify-center gap-1 rounded text-xs font-bold transition-all touch-manipulation ${
                metasCompletas
                  ? 'bg-primary text-primary-foreground animate-pulse'
                  : 'border border-card-border text-white/30 bg-[#161B22] cursor-not-allowed'
              }`}
            >
              <Gift size={12} /> {metasCompletas ? 'REIVINDICAR' : `${md.progresso.length}/${md.objetivos.length}`}
            </button>
          )}
        </div>
      </div>

      {/* ── MURAL DA CIDADELA (feed de vida) ───────────────────────────────── */}
      <div data-tour="mural">
        <MuralAcontecimentos limite={5} onVerTodas={onNavegar ? () => onNavegar('log') : undefined} />
      </div>

      {/* ── COLLAPSED SECTIONS ──────────────────────────────────────────── */}
      <button
        onClick={() => setExpandedSection(expandedSection === 'construcoes' ? null : 'construcoes')}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-[#1C2333] border border-primary/30 rounded hover:border-primary/50 transition-all text-left"
      >
        <span className="text-xs font-cinzel text-primary tracking-widest flex items-center gap-1">
          <Hammer size={11} /> CONSTRUÇÕES
        </span>
        <ChevronDown size={12} className={`transition-transform ${expandedSection === 'construcoes' ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === 'construcoes' && (
        <div className="grid grid-cols-2 gap-1 text-xs">
          {(['Alojamento', 'Fazenda', 'Fogueira', 'Enfermaria', 'Templo', 'Quartel', 'Armazem', 'Arquivo', 'Mirante', 'RetratoTorre'] as EdificioTipo[]).map(tipo => {
            const edificio = state.edificios.find(e => e.tipo === tipo);
            const nivelAtual = edificio?.nivel || 0;
            if (nivelAtual === 0) return null;
            const workers = trabalhadoresDe(tipo, nivelAtual, state.npcs);
            const hasAfim = POSTO_AFIM[tipo];
            return (
              <div key={tipo} className="flex items-center justify-between px-2 py-1 bg-black/30 border border-primary/10 rounded">
                <span className="font-cinzel text-primary truncate">{nomeEdificio(tipo, state.andarAtual)}</span>
                {hasAfim ? (
                  <span className="text-secondary ml-1">
                    <span className="text-success font-bold">{workers.length}</span>/{nivelAtual}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[10px] ml-1">L{nivelAtual}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setExpandedSection(expandedSection === 'intel' ? null : 'intel')}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-[#1C2333] border border-primary/30 rounded hover:border-primary/50 transition-all text-left"
      >
        <span className="text-xs font-cinzel text-primary tracking-widest flex items-center gap-1">
          <ShieldAlert size={11} /> INTEL
        </span>
        <ChevronDown size={12} className={`transition-transform ${expandedSection === 'intel' ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === 'intel' && (
        <div className="space-y-0.5">
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).slice(0, 5).map(l => {
            const isMorte = l.tipo === 'morte';
            return (
              <div key={l.id} className={`flex gap-1.5 text-xs items-start p-1 rounded ${isMorte ? 'text-destructive/80' : 'text-warning/80'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${isMorte ? 'bg-destructive' : 'bg-warning'}`} />
                <div className="flex-1 min-w-0">
                  <span className="opacity-60 mr-1">D{l.dia}</span>
                  <span className="line-clamp-2">{l.mensagem}</span>
                </div>
              </div>
            );
          })}
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).length === 0 && (
            <div className="text-xs text-muted-foreground italic px-2 py-1">sem eventos críticos</div>
          )}
        </div>
      )}

      {/* ── PREFERÊNCIAS (configura-se uma vez; rodapé) ──────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5" data-tour="velocidade">
        <span className="text-xs text-secondary tracking-widest">VELOCIDADE</span>
        <div className="flex gap-1">
          {[1, 2, 5].map(spd => (
            <button
              key={spd}
              onClick={() => setSpeed(spd as any)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all touch-manipulation ${
                state.velocidade === spd
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-card-border text-secondary bg-[#161B22] hover:border-primary/50'
              }`}
            >
              {spd}×
            </button>
          ))}
        </div>
        {isPushSupported() && (
          <button
            onClick={handlePushToggle}
            disabled={pushLoading}
            className={`ml-auto h-7 px-2.5 flex items-center justify-center gap-1.5 rounded text-xs font-bold transition-all touch-manipulation ${
              pushEnabled
                ? 'border border-primary text-primary bg-primary/10'
                : 'border border-card-border text-secondary bg-[#161B22]'
            } ${pushLoading ? 'opacity-50' : ''}`}
          >
            <Bell size={12} />
            {pushLoading ? '...' : pushEnabled ? 'Push ativo' : 'Ativar Push'}
          </button>
        )}
      </div>
    </div>
  );
}
