import { useGame } from '../context/GameContext';
import { useAlliance } from '../context/AllianceContext';
import { ShieldAlert, Users, Bell, Gift, Check, Hammer, ChevronDown } from 'lucide-react';
import { getEfeitos, POP_BASE, BUILDINGS, EdificioTipo, nomeEdificio, trabalhadoresDe, POSTO_AFIM } from '../lib/game-data';
import { METAS_DIARIAS_META } from '../quest-engine';
import { useTemporada } from '../hooks/useTemporada';
import { MuralAcontecimentos } from '../components/MuralAcontecimentos';
import {
  isPushSupported,
  getPermissionState,
  isPushEnabled,
  subscribeToPush,
  unsubscribeFromPush
} from '../lib/push-notifications';
import { getDeviceId } from '../lib/alliance-identity';
import { useState, useEffect } from 'react';

interface DashboardProps {
  t2Desbloqueado: boolean;
}

export function Dashboard({ t2Desbloqueado }: DashboardProps) {
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

  return (
    <div className="p-3 space-y-2 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-1.5 border-b border-primary/30 relative">
        <h2 className="text-xl font-cinzel font-bold tracking-widest text-primary">OBSERVATÓRIO</h2>
      </header>

      {/* ── Faixa da temporada ativa (muda visualmente ao desbloquear a T2) ── */}
      <div
        className="rounded px-3 py-1.5 flex items-center justify-between border"
        style={{ borderColor: `${temporada.data.corTema}55`, backgroundColor: `${temporada.data.corTema}12` }}
      >
        <span className="text-[11px] font-cinzel tracking-[0.2em]" style={{ color: temporada.data.corTema }}>
          TEMPORADA {temporada.romano} · {temporada.data.nome.toUpperCase()}
        </span>
        <span className="text-[10px] text-white/45">
          {t2Desbloqueado ? 'O véu entre as temporadas se rasgou' : 'A Torre parece acabar no vigésimo'}
        </span>
      </div>

      {/* ── VITALS SECTION (above the fold) ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#1C2333] border border-primary/30 p-2 rounded flex flex-col items-center justify-center">
          <span className="text-[10px] text-secondary tracking-widest mb-0.5">DIA</span>
          <span className="text-2xl text-primary font-bold font-cinzel">{state.dia}</span>
        </div>
        <div className="bg-[#1C2333] border border-primary/30 p-2 rounded flex flex-col justify-center">
          <span className="text-[10px] text-secondary tracking-widest mb-0.5">ANDARES</span>
          <span className="text-lg text-foreground font-bold font-cinzel">{Math.min(state.andarAtual - 1, temporada.andarMax)}/{temporada.andarMax}</span>
        </div>

        <div className="bg-[#1C2333] border border-primary/30 p-2 rounded flex flex-col justify-center">
          <span className="text-[10px] text-secondary tracking-widest mb-0.5">MORAL</span>
          <span className={`text-lg font-bold font-cinzel ${getMoralColor(state.moral)}`}>{Math.round(state.moral)}%</span>
        </div>
      </div>

      {/* ── POPULATION (full width) ────────────────────────────────────── */}
      <div className={`border p-2 rounded text-[12px] flex justify-between items-center ${
        superlotado ? 'bg-destructive/10 border-destructive/50' : 'bg-[#1C2333] border-primary/30'
      }`}>
        <span className={`tracking-widest font-cinzel ${superlotado ? 'text-destructive' : 'text-secondary'}`}>
          POPULAÇÃO: {proprios}/{cap} {superlotado && <span className="animate-pulse">⚠ +{excedente}</span>}
        </span>
        {vivos !== proprios && <span className="text-muted-foreground text-[11px]">+{vivos - proprios} hóspedes</span>}
      </div>

      {/* ── MURAL DA CIDADELA (feed de vida) ───────────────────────────────── */}
      <MuralAcontecimentos />

      {/* ── METAS DE HOJE ──────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <span className="text-[11px] text-secondary tracking-widest block">METAS DE HOJE</span>
        <div className="bg-[#1C2333] border border-primary/30 rounded p-2 space-y-1.5">
          {md.objetivos.map(id => {
            const meta = METAS_DIARIAS_META[id];
            const feito = md.progresso.includes(id);
            return (
              <div key={id} className={`flex items-start gap-2 p-1 rounded ${feito ? 'bg-success/10 border border-success/30' : ''}`}>
                <span className={`text-lg leading-none shrink-0 ${feito ? '' : 'opacity-50'}`}>{meta.icone}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-cinzel font-bold leading-tight ${feito ? 'text-success' : 'text-foreground'}`}>{meta.titulo}</div>
                  <div className="text-[11px] text-secondary/60 leading-tight">{meta.descricao}</div>
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

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-secondary tracking-widest">VELOCIDADE</span>
          <div className="flex gap-1">
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setSpeed(spd as any)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all ${
                  state.velocidade === spd
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-card-border text-secondary bg-[#161B22] hover:border-primary/50'
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {isPushSupported() && (
        <button
          onClick={handlePushToggle}
          disabled={pushLoading}
          className={`w-full h-8 flex items-center justify-center gap-1.5 rounded text-xs font-bold transition-all text-center ${
            pushEnabled
              ? 'border border-primary text-primary bg-primary/10'
              : 'border border-card-border text-secondary bg-[#161B22]'
          } ${pushLoading ? 'opacity-50' : ''}`}
        >
          <Bell size={12} />
          {pushLoading ? 'Atualizando...' : pushEnabled ? 'Push ativo' : 'Ativar Push'}
        </button>
      )}

      {/* ── COLLAPSED SECTIONS ──────────────────────────────────────────── */}
      <button
        onClick={() => setExpandedSection(expandedSection === 'construcoes' ? null : 'construcoes')}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-[#1C2333] border border-primary/30 rounded hover:border-primary/50 transition-all text-left"
      >
        <span className="text-[11px] font-cinzel text-primary tracking-widest flex items-center gap-1">
          <Hammer size={11} /> CONSTRUÇÕES
        </span>
        <ChevronDown size={12} className={`transition-transform ${expandedSection === 'construcoes' ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === 'construcoes' && (
        <div className="grid grid-cols-2 gap-1 text-[11px]">
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
        <span className="text-[11px] font-cinzel text-primary tracking-widest flex items-center gap-1">
          <ShieldAlert size={11} /> INTEL
        </span>
        <ChevronDown size={12} className={`transition-transform ${expandedSection === 'intel' ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === 'intel' && (
        <div className="space-y-0.5">
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).slice(0, 5).map(l => {
            const isMorte = l.tipo === 'morte';
            return (
              <div key={l.id} className={`flex gap-1.5 text-[11px] items-start p-1 rounded ${isMorte ? 'text-destructive/80' : 'text-warning/80'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${isMorte ? 'bg-destructive' : 'bg-warning'}`} />
                <div className="flex-1 min-w-0">
                  <span className="opacity-60 mr-1">D{l.dia}</span>
                  <span className="line-clamp-2">{l.mensagem}</span>
                </div>
              </div>
            );
          })}
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).length === 0 && (
            <div className="text-[11px] text-muted-foreground italic px-2 py-1">sem eventos críticos</div>
          )}
        </div>
      )}
    </div>
  );
}
