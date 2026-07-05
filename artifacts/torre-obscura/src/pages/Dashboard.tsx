import { useGame } from '../context/GameContext';
import { useAlliance } from '../context/AllianceContext';
import { ShieldAlert, Users, Bell, Gift, Check } from 'lucide-react';
import { getEfeitos, POP_BASE, METAS_DIARIAS_META } from '../lib/game-data';
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
  const [pushLoading, setPushLoading] = useState(false);
  const [pushEnabled, setPushEnabledState] = useState(isPushEnabled());

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
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">OBSERVATÓRIO</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-4 flex flex-col justify-between rounded shadow-lg relative overflow-hidden">
          <span className="text-[10px] text-secondary tracking-widest mb-1 relative z-10">DIA</span>
          <span className="text-4xl text-primary font-bold font-cinzel relative z-10">{state.dia}</span>
          <div className="absolute -right-4 -bottom-4 text-primary/5 font-cinzel text-6xl pointer-events-none select-none">
            {state.dia}
          </div>
        </div>
        
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-4 flex flex-col justify-between rounded shadow-lg">
          <span className="text-[10px] text-secondary tracking-widest mb-2">ANDARES</span>
          <div className="flex flex-col gap-1">
            <span className="text-xl text-foreground font-bold font-cinzel">{Math.min(state.andarAtual - 1, t2Desbloqueado ? 40 : 20)} / {t2Desbloqueado ? 40 : 20}</span>
            <div className="flex gap-0.5 mt-1">
              {Array.from({length: t2Desbloqueado ? 40 : 20}).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 ${i < state.andarAtual - 1 ? 'bg-primary' : 'bg-background border border-primary/20'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-4 flex flex-col justify-between rounded shadow-lg col-span-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-secondary tracking-widest">MORAL GLOBAL</span>
            <span className={`text-xl font-bold font-cinzel ${getMoralColor(state.moral)}`}>{Math.round(state.moral)}%</span>
          </div>
          <div className="w-full bg-background h-1.5 rounded overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-500 ${
                state.moral > 60 ? 'bg-success' : state.moral < 40 ? 'bg-destructive' : 'bg-warning'
              }`}
              style={{ width: `${state.moral}%` }}
            />
          </div>
        </div>
        
        <div className={`bg-gradient-to-b from-[#1C2333] to-[#161B22] p-4 flex flex-col justify-between rounded shadow-lg col-span-2 border ${
          superlotado ? 'border-destructive/60' : 'border-primary/30'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <Users size={10} className={superlotado ? 'text-destructive' : 'text-secondary'} />
              <span className={`text-[10px] tracking-widest ${superlotado ? 'text-destructive' : 'text-secondary'}`}>
                POPULAÇÃO VIVA
              </span>
            </div>
            {superlotado && (
              <span className="text-[9px] font-bold text-destructive tracking-widest animate-pulse">
                ⚠ SUPERLOTADO +{excedente}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-cinzel ${
              superlotado ? 'text-destructive' : vivos <= 3 ? 'text-destructive animate-pulse' : 'text-foreground'
            }`}>
              {proprios}
            </span>
            <span className={`text-sm font-cinzel mb-1 ${superlotado ? 'text-destructive/70' : 'text-muted-foreground'}`}>
              / {cap}
            </span>
            {vivos !== proprios && (
              <span className="text-[10px] text-secondary/50 mb-1 font-cinzel">
                +{vivos - proprios} hóspedes
              </span>
            )}
          </div>
          {/* Barra de ocupação */}
          <div className="w-full bg-background h-1 rounded overflow-hidden border border-white/5 mt-2">
            <div
              className={`h-full transition-all duration-500 ${
                superlotado ? 'bg-destructive' : proprios / cap > 0.8 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min(100, (proprios / cap) * 100)}%` }}
            />
          </div>
          {superlotado && (
            <p className="text-[9px] text-destructive/70 mt-1.5 leading-snug">
              Penalidades ativas: consumo extra de comida, -moral, -sanidade, -lealdade e fadiga acumulando.
            </p>
          )}
        </div>
      </div>

      {/* ── Metas de Hoje ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <span className="text-[10px] text-secondary tracking-widest border-b border-primary/20 pb-1 block w-max">METAS DE HOJE</span>
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 rounded shadow-lg p-4 space-y-3">
          {md.objetivos.map(id => {
            const meta = METAS_DIARIAS_META[id];
            const feito = md.progresso.includes(id);
            return (
              <div key={id} className="flex items-center gap-3">
                <span className={`text-xl leading-none ${feito ? '' : 'opacity-60'}`}>{meta.icone}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-cinzel font-bold ${feito ? 'text-success' : 'text-foreground'}`}>{meta.titulo}</div>
                  <div className="text-[10px] text-secondary/70 leading-snug">{meta.descricao}</div>
                </div>
                <span className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-sm border ${
                  feito ? 'bg-success/20 border-success text-success' : 'border-card-border text-white/20'
                }`}>
                  {feito ? <Check size={14} /> : ''}
                </span>
              </div>
            );
          })}

          {/* Presente da Torre */}
          {md.recompensaColetada ? (
            <div className="w-full h-11 flex items-center justify-center gap-2 rounded-sm border border-success/40 bg-success/10 text-success font-cinzel font-bold tracking-widest text-sm">
              <Check size={16} /> PRESENTE COLETADO HOJE
            </div>
          ) : (
            <button
              onClick={reivindicarPresenteDaTorre}
              disabled={!metasCompletas}
              className={`w-full h-11 flex items-center justify-center gap-2 rounded-sm font-cinzel font-bold tracking-widest text-sm transition-all touch-manipulation ${
                metasCompletas
                  ? 'bg-primary text-primary-foreground glow-gold animate-pulse'
                  : 'border border-card-border text-white/30 bg-[#161B22] cursor-not-allowed'
              }`}
            >
              <Gift size={16} /> {metasCompletas ? 'REIVINDICAR PRESENTE DA TORRE' : `PRESENTE DA TORRE (${md.progresso.length}/${md.objetivos.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] text-secondary tracking-widest border-b border-primary/20 pb-1 block w-max">VELOCIDADE DO TEMPO</span>
        <div className="flex gap-2">
          {[1, 2, 5].map(spd => (
            <button
              key={spd}
              onClick={() => setSpeed(spd as any)}
              className={`flex-1 h-12 flex items-center justify-center rounded font-cinzel font-bold tracking-widest transition-all touch-manipulation ${
                state.velocidade === spd
                  ? 'border border-primary text-primary-foreground bg-primary glow-gold'
                  : 'border border-card-border text-secondary bg-[#161B22] hover:border-primary/50'
              }`}
            >
              {spd}X
            </button>
          ))}
        </div>
      </div>

      {isPushSupported() && (
        <div className="space-y-3">
          <span className="text-[10px] text-secondary tracking-widest border-b border-primary/20 pb-1 block w-max">NOTIFICAÇÕES</span>
          <button
            onClick={handlePushToggle}
            disabled={pushLoading}
            className={`w-full h-12 flex items-center justify-center gap-2 rounded font-cinzel font-bold tracking-widest transition-all touch-manipulation ${
              pushEnabled
                ? 'border border-primary text-primary-foreground bg-primary/20'
                : 'border border-card-border text-secondary bg-[#161B22] hover:border-primary/50'
            } ${pushLoading ? 'opacity-50' : ''}`}
          >
            <Bell size={16} />
            {pushLoading ? 'Atualizando...' : pushEnabled ? 'Notificações ativas' : 'Ativar notificações'}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <h3 className="text-xs font-cinzel text-primary tracking-widest flex items-center gap-2 border-b border-primary/20 pb-2">
          <ShieldAlert size={14} /> INTEL FEED
        </h3>
        <div className="space-y-3">
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).slice(0, 3).map(l => {
            const isMorte = l.tipo === 'morte';
            return (
              <div key={l.id} className="flex gap-3 text-sm items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isMorte ? 'bg-destructive shadow-[0_0_8px_rgba(248,81,73,0.6)]' : 'bg-warning shadow-[0_0_8px_rgba(227,179,65,0.6)]'}`} />
                <div className={`${isMorte ? 'text-destructive/90' : 'text-warning/90'} font-medium`}>
                  <span className="opacity-50 text-xs mr-2 font-mono">D{l.dia}</span> 
                  {l.mensagem}
                </div>
              </div>
            );
          })}
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).length === 0 && (
            <div className="text-xs text-muted-foreground italic pl-5">Nenhum evento crítico detectado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
