import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert, Crosshair, Sparkles, Brain, Dna, Swords, Wind, BookOpen, Shield, Hammer, X, UserPlus, Dumbbell } from 'lucide-react';
import { NPC, getProfissao, PROFISSOES, POSTO_AFIM, BUILDINGS, nomeEdificio, EdificioTipo, ProfissaoId, podeTreinarNpc, podeEstudarNpc, podeEstudarNpcT1, calcCustoTreinamento, calcCustoEstudo, calcCustoEstudoT1, MAX_TREINAMENTOS, calcInstrutor, statTreinamento, calcNpcPower, PRIMORDIAL_RECUPERACAO_T1, PASSIVAS, HABILIDADES, type PassivaId } from '../lib/game-data';
import { humorDe, vinculosDe, tipoVinculo, type TipoVinculo } from '../npc-engine';
import { FAMA_CASA, tituloNobreza, TITULO_LABEL } from '../npc-engine/fama';
import * as Dialog from '@radix-ui/react-dialog';
export function People() {
  const { state, assignPosto, treinarNpc, estudarNpc, jurarNpc, sugerirJuramentos } = useGame();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mostrarMortos, setMostrarMortos] = useState(false);
  // Censo: filtro de triagem ativo (null = todos) e critério de ordenação.
  const [filtro, setFiltro] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<'poder' | 'fadiga' | 'lealdade' | 'nome'>('poder');
  // Quadro de Postos: edifício cuja vaga está sendo preenchida (null = fechado).
  const [vagaPicker, setVagaPicker] = useState<EdificioTipo | null>(null);
  // Filtro por casa nobre (null = todas). Só aparece quando existem casas.
  const [filtroCasa, setFiltroCasa] = useState<string | null>(null);

  const vivos = state.npcs.filter(n => n.vivo).length;

  const getProfIcon = (id: ProfissaoId) => {
    switch (id) {
      case 'combatente': return <Swords size={10} />;
      case 'batedor': return <Wind size={10} />;
      case 'erudito': return <BookOpen size={10} />;
      case 'sentinela': return <Shield size={10} />;
    }
  };

  // Edifícios de trabalho construídos com vaga livre para este NPC
  const postosDisponiveis = (npc: NPC): EdificioTipo[] => {
    return state.edificios
      .filter(e => e.nivel >= 1 && (e.tipo in POSTO_AFIM))
      .filter(e => {
        const ocupados = state.npcs.filter(n => n.vivo && n.posto === e.tipo && n.id !== npc.id).length;
        return ocupados < e.nivel;
      })
      .map(e => e.tipo);
  };

  const getFadigaLabel = (f: number) => {
    if (f >= 90) return { label: 'INCAPACITADO', color: 'text-destructive bg-destructive/10 border-destructive/30' };
    if (f >= 70) return { label: 'EXAUSTO', color: 'text-orange bg-orange/10 border-orange/30' };
    if (f >= 50) return { label: 'CANSADO', color: 'text-warning bg-warning/10 border-warning/30' };
    return { label: 'APTO', color: 'text-success bg-success/10 border-success/30' };
  };

  const Bar = ({ value, label, inverted = false }: { value: number, label: string, inverted?: boolean }) => {
    let colorClass = 'bg-success';
    if (inverted) {
      if (value > 70) colorClass = 'bg-destructive';
      else if (value > 40) colorClass = 'bg-warning';
      else colorClass = 'bg-[#4A9EFF]';
    } else {
      if (value < 30) colorClass = 'bg-destructive';
      else if (value < 60) colorClass = 'bg-warning';
      else colorClass = 'bg-[#2ED573]';
    }

    return (
      <div className="flex-1">
        <div className="text-[12px] text-secondary mb-1 flex justify-between items-baseline tracking-widest font-inter">
          <span>{label}</span>
          <span className="text-foreground/70 font-bold">{Math.round(value)}</span>
        </div>
        <div className="h-2 bg-black/50 w-full rounded-sm overflow-hidden border border-white/5">
          <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  };

  const getRarityColorHex = (r: string) => {
    switch(r) {
      case 'Comum':    return 'var(--rarity-comum)';
      case 'Incomum':  return 'var(--rarity-incomum)';
      case 'Raro':     return 'var(--rarity-raro)';
      case 'Épico':    return 'var(--rarity-epico)';
      case 'Lendário': return 'var(--rarity-lendario)';
      case 'Divino':   return 'var(--rarity-divino)';
      default: return 'var(--rarity-comum)';
    }
  };

  const getRarityStars = (r: string) => {
    switch(r) {
      case 'Comum':    return '★';
      case 'Incomum':  return '★★';
      case 'Raro':     return '★★★';
      case 'Épico':    return '★★★★';
      case 'Lendário': return '★★★★★';
      case 'Divino':   return '✦✦✦✦✦✦';
      default: return '★';
    }
  };

  const getHabIcon = (id: string) => {
    switch(id) {
      case 'guardiao': return <ShieldAlert size={10} />;
      case 'explorador': return <Crosshair size={10} />;
      case 'curandeiro': return <Sparkles size={10} />;
      case 'estrategista': return <Brain size={10} />;
      case 'berserker': return <Dna size={10} />;
      default: return <Sparkles size={10} />;
    }
  };

  const renderCard = (npc: NPC) => {
    const isExpanded = expandedId === npc.id;
    const fStatus = getFadigaLabel(npc.fadiga);
    const rarityColor = getRarityColorHex(npc.raridade);

    if (!npc.vivo) {
      return (
        <div key={npc.id} className="bg-[#0D1117] border border-destructive/20 p-3 opacity-60 grayscale flex justify-between items-center rounded-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-destructive/50 flex items-center justify-center bg-background text-destructive text-xs font-cinzel">X</div>
            <span className="font-bold font-inter text-muted-foreground line-through decoration-destructive">{npc.nome}</span>
          </div>
          <span className="text-[12px] text-destructive tracking-widest border border-destructive/50 px-2 py-1 bg-destructive/10 rounded-sm">FALECIDO</span>
        </div>
      );
    }

    const dominantStat = Math.max(npc.forca, npc.agilidade, npc.inteligencia, npc.resistencia);
    let domLetter = 'F';
    let domKey: 'forca' | 'agilidade' | 'inteligencia' | 'resistencia' = 'forca';
    if (dominantStat === npc.agilidade) { domLetter = 'A'; domKey = 'agilidade'; }
    else if (dominantStat === npc.inteligencia) { domLetter = 'I'; domKey = 'inteligencia'; }
    else if (dominantStat === npc.resistencia) { domLetter = 'R'; domKey = 'resistencia'; }
    const poder = Math.round(calcNpcPower(npc) * 10) / 10;
    const humor = humorDe(npc);
    const humorCor = humor.tom === 'bom' ? 'text-success' : humor.tom === 'critico' ? 'text-destructive' : humor.tom === 'ruim' ? 'text-warning' : 'text-secondary';
    const vinculosResolvidos = vinculosDe(state, npc.id)
      .map(v => { const o = state.npcs.find(n => n.id === v.id && n.vivo); return o ? { id: v.id, nome: o.nome, afinidade: v.afinidade, tipo: tipoVinculo(state, npc.id, v.id) } : null; })
      .filter((v): v is { id: string; nome: string; afinidade: number; tipo: TipoVinculo | null } => v !== null);
    const aliados = vinculosResolvidos.filter(v => v.afinidade > 0).slice(0, 2);
    const rival = vinculosResolvidos.filter(v => v.afinidade < 0).slice(-1);
    const vinculosMostrar = [...aliados, ...rival];

    return (
      <div 
        key={npc.id} 
        className={`bg-gradient-to-r from-[#1C2333] to-[#161B22] border transition-all cursor-pointer rounded-sm overflow-hidden flex relative shadow-md ${isExpanded ? 'border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-card-border hover:border-primary/50'}`}
        onClick={() => setExpandedId(isExpanded ? null : npc.id)}
      >
        <div className="w-1.5 shrink-0" style={{ backgroundColor: rarityColor }} />
        <div className="flex-1 p-3.5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-cinzel font-bold text-lg shadow-inner border-2 border-background"
                style={{ backgroundColor: rarityColor }}
              >
                {domLetter}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-lg font-inter">{npc.nome}</span>
                  <span className="text-[12px]" style={{ color: rarityColor }}>{getRarityStars(npc.raridade)}</span>
                  <span
                    className="text-[12px] font-cinzel font-bold px-1.5 py-0.5 rounded-sm border flex items-center gap-1 tracking-wider"
                    style={{ color: rarityColor, borderColor: `${rarityColor}55`, backgroundColor: `${rarityColor}14` }}
                    title="Poder de combate (stats + habilidade, penalizado por fadiga)"
                  >
                    <Swords size={10} /> {poder.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[12px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-sm flex items-center gap-1 uppercase tracking-wider font-bold">
                    {getProfIcon(getProfissao(npc))} {PROFISSOES[getProfissao(npc)].nome}
                  </span>
                  <span className="text-[12px] px-2 py-0.5 bg-black/40 text-secondary border border-white/10 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                    {getHabIcon(npc.habilidade)} {HABILIDADES[npc.habilidade].nome}
                  </span>
                  {npc.posto && (
                    <span className="text-xs px-1.5 py-0.5 bg-success/10 text-success border border-success/30 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                      <Hammer size={9} /> {npc.posto}
                    </span>
                  )}
                  {npc.obscuro && (
                    <span className="text-xs bg-orange/10 border border-orange text-orange px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider animate-pulse">
                      <ShieldAlert size={10}/> OBSCURO
                    </span>
                  )}
                  {npc.emprestado && (
                    <span className="text-xs bg-primary/15 border border-primary text-primary px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                      <UserPlus size={10}/> EMPRESTADO{npc.donoNome ? ` · ${npc.donoNome}` : ''}{npc.emprestadoAte != null ? ` · volta dia ${npc.emprestadoAte}` : ''}
                    </span>
                  )}
                  {npc.reforco && (
                    <span className="text-xs bg-blue-500/15 border border-blue-400 text-blue-300 px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                      <UserPlus size={10}/> REFORÇO{npc.donoNome ? ` · ${npc.donoNome}` : ''}{npc.reforcoConcluido ? ' · aguardando retorno' : ' · em campo'}
                    </span>
                  )}
                  {npc.emGuerra && (
                    <span className="text-xs bg-destructive/15 border border-destructive text-destructive px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider animate-pulse">
                      <Swords size={10}/> NO FRONT
                    </span>
                  )}
                  {npc.lancamento && (() => {
                    const totalFrags = state.codexFragmentos.length;
                    const nivelAtual = npc.primordialNivel ?? 0;
                    const nivelMax = PRIMORDIAL_RECUPERACAO_T1.length;
                    const proximoNivel = PRIMORDIAL_RECUPERACAO_T1[nivelAtual];
                    const completo = nivelAtual >= nivelMax;
                    return (
                      <span className={`text-xs px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider border ${completo ? 'bg-primary/20 border-primary text-primary' : 'bg-primary/8 border-primary/40 text-primary/80'}`}>
                        ✦ PRIMORDIAL · {nivelAtual}/{nivelMax}
                        {!completo && proximoNivel && ` · ${totalFrags}/${proximoNivel.minFragmentos} frags`}
                      </span>
                    );
                  })()}
                  {npc.vestigio && npc.passivaId && (
                    <span className="text-xs px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider border bg-[#7A3D00]/20 border-[#CC6B00]/50 text-[#FF8C00]/90">
                      ◈ VESTÍGIO
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-sm border ${fStatus.color} tracking-widest`}>{fStatus.label}</span>
          </div>

          <div className="flex gap-4 mb-2">
            <Bar value={npc.sanidade} label="SANIDADE" />
            <Bar value={npc.lealdade} label="LEALDADE" />
            <Bar value={npc.fadiga} label="FADIGA" inverted />
          </div>

          {npc.lealdade < 30 && (
            <div className="mt-3 text-[12px] text-destructive bg-destructive/10 border border-destructive/30 px-2 py-1.5 rounded-sm flex items-center justify-center font-bold tracking-widest animate-pulse">
              ⚠ RISCO DE TRAIÇÃO IMINENTE
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-white/5">
              {/* Retrato: humor com motivo + fama (o motor de vida visível) */}
              <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                <span className={humorCor}>
                  {humor.tom === 'bom' ? '😊' : humor.tom === 'critico' ? '😰' : humor.tom === 'ruim' ? '😟' : '😐'} {humor.rotulo}
                </span>
                <span className="text-white/50 text-right">
                  <span className="text-secondary tracking-wider">{TITULO_LABEL[tituloNobreza(state.npcs, npc)].toUpperCase()} · </span>
                  {npc.sobrenome && (
                    <span className="text-primary/80">⚜ CASA {npc.sobrenome.toUpperCase()}
                      {(() => { const m = state.npcs.filter(x => x.vivo && x.sobrenome === npc.sobrenome).length; return m > 1 ? ` (${m})` : ''; })()} ·{' '}
                    </span>
                  )}
                  FAMA <span className="text-primary font-bold font-cinzel">{npc.fama ?? 0}</span>
                  {!npc.sobrenome && (npc.fama ?? 0) >= FAMA_CASA && <span className="text-primary/70"> · digno de fundar uma casa</span>}
                </span>
              </div>

              {/* Juramento: a quem este morador serve (troca com fôlego de 10 dias) */}
              {!npc.emprestado && !npc.reforco && (
                <div className="flex items-center justify-between gap-2 mb-3 text-xs" onClick={e => e.stopPropagation()}>
                  <span className="text-white/50 min-w-0 truncate">
                    {npc.juramento === 'escalada' ? '🗡 Jurou à Escalada — descansa 25% mais rápido'
                      : npc.juramento === 'oficio' ? '⚒ Jurou ao Ofício — +15% no posto'
                      : 'Ainda não jurou diante da Fogueira'}
                  </span>
                  {(() => {
                    const restante = npc.juramentoDia != null ? 10 - (state.dia - npc.juramentoDia) : 0;
                    if (restante > 0 && npc.juramento) {
                      return <span className="text-white/30 shrink-0">fôlego {restante}d</span>;
                    }
                    if (!npc.juramento) {
                      return (
                        <span className="flex gap-1 shrink-0">
                          <button onClick={() => jurarNpc(npc.id, 'escalada')} className="px-2 py-1 border border-primary/40 text-primary/80 rounded-sm hover:bg-primary/10 touch-manipulation">🗡 ESCALADA</button>
                          <button onClick={() => jurarNpc(npc.id, 'oficio')} className="px-2 py-1 border border-secondary/40 text-secondary rounded-sm hover:bg-secondary/10 touch-manipulation">⚒ OFÍCIO</button>
                        </span>
                      );
                    }
                    const alvo = npc.juramento === 'escalada' ? 'oficio' : 'escalada';
                    return (
                      <button onClick={() => jurarNpc(npc.id, alvo)} className="shrink-0 px-2 py-1 border border-card-border text-white/50 rounded-sm hover:border-primary/40 touch-manipulation">
                        {alvo === 'escalada' ? 'JURAR À ESCALADA' : 'JURAR AO OFÍCIO'}
                      </button>
                    );
                  })()}
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                {([
                  { key: 'forca',        label: 'FOR', value: npc.forca },
                  { key: 'agilidade',    label: 'AGI', value: npc.agilidade },
                  { key: 'inteligencia', label: 'INT', value: npc.inteligencia },
                  { key: 'resistencia',  label: 'RES', value: npc.resistencia },
                ] as const).map(stat => {
                  const isDom = stat.key === domKey;
                  return (
                    <div
                      key={stat.key}
                      className={`py-2 border rounded-sm relative ${isDom ? 'bg-primary/10 border-primary/50' : 'bg-black/30 border-white/5'}`}
                    >
                      <div className={`text-xs mb-1 tracking-widest ${isDom ? 'text-primary/80' : 'text-secondary'}`}>{stat.label}</div>
                      <div className={`font-bold font-cinzel text-sm ${isDom ? 'text-primary' : 'text-foreground'}`}>{stat.value}</div>
                      {isDom && <div className="absolute top-0.5 right-1 text-[7px] text-primary/70">▲</div>}
                    </div>
                  );
                })}
              </div>

              {/* Identidade: profissão + habilidade e seus efeitos */}
              <div className="grid grid-cols-2 gap-2 mb-1">
                <div className="bg-black/20 border border-white/5 rounded-sm p-2.5">
                  <div className="text-xs text-primary/70 tracking-widest mb-1 flex items-center gap-1 font-bold uppercase">
                    {getProfIcon(getProfissao(npc))} {PROFISSOES[getProfissao(npc)].nome}
                  </div>
                  <div className="text-[12px] text-white/55 leading-snug">{PROFISSOES[getProfissao(npc)].descricao}</div>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-sm p-2.5">
                  <div className="text-xs text-secondary tracking-widest mb-1 flex items-center gap-1 font-bold uppercase">
                    {getHabIcon(npc.habilidade)} {HABILIDADES[npc.habilidade].nome}
                  </div>
                  <div className="text-[12px] text-white/55 leading-snug">{HABILIDADES[npc.habilidade].descricao}</div>
                </div>
              </div>

              {/* Motor de vida: humor, casa e vínculos */}
              <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary tracking-widest">HUMOR</span>
                  <span className={`text-[12px] font-bold ${humorCor}`}>{humor.rotulo}</span>
                </div>
                {npc.sobrenome && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary tracking-widest">CASA</span>
                    <span className="text-[12px] text-primary/80 flex items-center gap-1">
                      {npc.casaFundador && <span title="Fundador da casa">♜</span>}
                      {npc.casaFundador ? `Fundador · Casa ${npc.sobrenome}` : `Casa ${npc.sobrenome}`}
                    </span>
                  </div>
                )}
                {vinculosMostrar.length > 0 && (
                  <div>
                    <div className="text-xs text-secondary tracking-widest mb-1">VÍNCULOS</div>
                    <div className="flex flex-wrap gap-1">
                      {vinculosMostrar.map(v => {
                        // Ícone e rótulo SEMPRE explícitos (antes um '♥' sem rótulo era
                        // confundido com romance). Romance = par romântico (não há
                        // casamento no jogo); afinidade fraca sem arco = "Afinidade"/"Tensão".
                        const meta: Record<string, { icone: string; rotulo: string }> = {
                          romance:    { icone: '❤️', rotulo: 'Romance' },
                          mentoria:   { icone: '🎓', rotulo: 'Mentoria' },
                          amizade:    { icone: '🤝', rotulo: 'Amizade' },
                          rivalidade: { icone: '⚔️', rotulo: 'Rivalidade' },
                        };
                        const info = v.tipo
                          ? meta[v.tipo]
                          : v.afinidade >= 0
                            ? { icone: '🔗', rotulo: 'Afinidade' }
                            : { icone: '⚡', rotulo: 'Tensão' };
                        return (
                          <button
                            key={v.id}
                            title={`${info.rotulo} — ver ${v.nome}`}
                            onClick={e => { e.stopPropagation(); setExpandedId(v.id); }}
                            className={`text-xs px-1.5 py-0.5 rounded-sm border flex items-center gap-1 touch-manipulation active:scale-95 transition-all ${v.afinidade >= 0 ? 'text-success border-success/30 bg-success/5 hover:bg-success/10' : 'text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10'}`}
                          >
                            {info.icone} {v.nome} <span className="opacity-70">{v.afinidade > 0 ? '+' : ''}{v.afinidade}</span>
                            <span className="opacity-70">· {info.rotulo}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-around text-[12px] text-muted-foreground font-inter bg-[#0D1117] py-2 rounded-sm border border-card-border">
                <div>SAN: <span className="text-foreground">{Math.floor(npc.sanidade)}</span>/100</div>
                <div>LEA: <span className="text-foreground">{Math.floor(npc.lealdade)}</span>/100</div>
                <div>FAD: <span className="text-foreground">{Math.floor(npc.fadiga)}</span>/100</div>
              </div>

              {/* Recuperação primordial */}
              {npc.lancamento && (() => {
                const totalFrags = state.codexFragmentos.length;
                const nivelAtual = npc.primordialNivel ?? 0;
                const nivelMax = PRIMORDIAL_RECUPERACAO_T1.length;
                const proximoNivel = PRIMORDIAL_RECUPERACAO_T1[nivelAtual];
                const completo = nivelAtual >= nivelMax;
                const progressoFrac = completo ? 1 :
                  proximoNivel
                    ? Math.min(1, totalFrags / proximoNivel.minFragmentos)
                    : 1;
                return (
                  <div className="mt-3 pt-3 border-t border-primary/20 bg-primary/5 rounded-sm p-3">
                    <div className="text-xs text-primary/70 tracking-widest mb-2 flex items-center gap-1 font-bold">
                      ✦ RECUPERAÇÃO PRIMORDIAL — {nivelAtual}/{nivelMax}
                    </div>
                    {/* Barra de progresso */}
                    <div className="w-full h-1 bg-black/40 rounded-full mb-2 overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${Math.round(progressoFrac * 100)}%` }}
                      />
                    </div>
                    {completo ? (
                      <div className="text-[12px] text-primary italic">Recuperação máxima atingida. Ainda o mais fraco dos primordiais — o que, por si só, já diz muito.</div>
                    ) : proximoNivel ? (
                      <div className="text-[12px] text-white/60">
                        <span className="text-primary/90 font-bold">{totalFrags}/{proximoNivel.minFragmentos}</span> fragmentos para Nível {nivelAtual + 1}
                        {' '} · +{proximoNivel.bonus.forca} FOR · +{proximoNivel.bonus.agilidade} AGI · +{proximoNivel.bonus.inteligencia} INT · +{proximoNivel.bonus.resistencia} RES
                      </div>
                    ) : null}
                    {nivelAtual > 0 && (
                      <div className="text-xs text-primary/40 mt-1">
                        Níveis aplicados: {PRIMORDIAL_RECUPERACAO_T1.slice(0, nivelAtual).map((r, i) =>
                          `${i + 1} (${r.minFragmentos}+)`
                        ).join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Passiva do vestígio */}
              {npc.vestigio && npc.passivaId && PASSIVAS[npc.passivaId as PassivaId] && (() => {
                const p = PASSIVAS[npc.passivaId as PassivaId];
                return (
                  <div className="mt-3 pt-3 border-t border-[#7A3D00]/30 bg-[#7A3D00]/5 rounded-sm p-3">
                    <div className="text-xs text-[#FF8C00]/70 tracking-widest mb-1 flex items-center gap-1 font-bold">
                      ◈ PASSIVA — {p.nome.toUpperCase()}
                    </div>
                    <div className="text-[12px] text-white/60 leading-relaxed">{p.descricao}</div>
                  </div>
                );
              })()}

              {/* Alocação de trabalho */}
              <div className="mt-3 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                <div className="text-xs text-secondary tracking-widest mb-2 flex items-center gap-1">
                  <Hammer size={10} className="text-primary" /> POSTO DE TRABALHO
                </div>
                {npc.emGuerra ? (
                  <div className="text-[12px] text-destructive/80 italic">Mobilizado na guerra — indisponível até a campanha terminar.</div>
                ) : npc.emExpedicao ? (
                  <div className="text-[12px] text-warning/80 italic">Em expedição — não pode trabalhar agora.</div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        const disponiveis = postosDisponiveis(npc);
                        const opcoes = Array.from(new Set([...(npc.posto ? [npc.posto] : []), ...disponiveis]));
                        if (opcoes.length === 0) {
                          return <span className="text-[12px] text-muted-foreground italic">Nenhum edifício de trabalho com vaga. Construa/melhore na Cidadela.</span>;
                        }
                        return opcoes.map(tipo => {
                          const ativo = npc.posto === tipo;
                          const afim = POSTO_AFIM[tipo];
                          const compat = afim === getProfissao(npc);
                          return (
                            <button
                              key={tipo}
                              onClick={() => assignPosto(npc.id, ativo ? null : tipo)}
                              className={`text-[12px] px-2 py-1 rounded-sm border transition-all touch-manipulation flex items-center gap-1 ${
                                ativo
                                  ? 'bg-success/15 border-success text-success font-bold'
                                  : compat
                                    ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20'
                                    : 'bg-black/30 border-card-border text-secondary hover:border-primary/40'
                              }`}
                            >
                              {ativo && <X size={10} />}
                              {BUILDINGS[tipo].nome}
                              {compat && !ativo && <span className="text-[10px] text-primary">★</span>}
                            </button>
                          );
                        });
                      })()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">★ = profissão compatível (bônus maior). Toque no posto ativo para dispensar.</div>
                  </>
                )}
              </div>

              {/* Treinamento no Quartel (Combatente / Batedor / Sentinela) */}
              {(() => {
                const profissao = getProfissao(npc);
                if (profissao !== 'combatente' && profissao !== 'batedor' && profissao !== 'sentinela') return null;
                const quartelEd = state.edificios.find(e => e.tipo === 'Quartel');
                const quartelNivel = quartelEd?.nivel ?? 0;
                const treinamentos = npc.treinamentos ?? 0;
                const custo = calcCustoTreinamento(treinamentos);
                const podeT = podeTreinarNpc(npc, quartelNivel, state.andarAtual);
                const statKey = statTreinamento(npc);
                const statLabel = statKey === 'agilidade' ? 'AGI' : statKey === 'resistencia' ? 'RES' : 'FOR';
                const instrutor = calcInstrutor(npc.id, state.npcs, statKey);
                const instrutorStat = instrutor ? instrutor[statKey] : 0;
                const ganho = (instrutor && instrutorStat > npc[statKey]) ? 2 : 1;

                let bloqueio: string | null = null;
                if (state.andarAtual < 6) bloqueio = 'Disponível após vencer o chefe do andar 5.';
                else if (quartelNivel < 1) bloqueio = 'Requer Quartel construído.';
                else if (treinamentos >= MAX_TREINAMENTOS) bloqueio = 'Limite de sessões atingido.';
                else if (npc.emGuerra) bloqueio = 'Mobilizado na guerra — retorna ao fim da campanha.';
                else if (npc.emExpedicao) bloqueio = 'Em expedição — aguarde o retorno.';
                else if (npc.fadiga >= 60) bloqueio = 'Fadiga alta demais (< 60 para treinar).';
                else if (npc.emprestado || npc.reforco) bloqueio = 'Só moradores próprios podem treinar.';

                if (state.andarAtual < 6 && quartelNivel < 1) return null;
                return (
                  <div className="mt-3 pt-3 border-t border-white/5" onClick={e => e.stopPropagation()}>
                    <div className="text-xs text-secondary tracking-widest mb-2 flex items-center gap-2">
                      <Dumbbell size={10} className="text-primary" /> TREINAMENTO — QUARTEL
                      <span className="ml-auto text-xs text-primary/70 font-bold tracking-widest">{treinamentos}/{MAX_TREINAMENTOS} SESSÕES</span>
                    </div>
                    {bloqueio ? (
                      <div className="text-[12px] text-muted-foreground italic">{bloqueio}</div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[12px] text-secondary flex items-center gap-3">
                            <span className="flex items-center gap-1"><span className="text-success">🪵</span> {custo.madeira} madeira</span>
                            <span className="flex items-center gap-1"><span className="text-primary">⚡</span> {custo.ferro} ferro</span>
                          </div>
                          <span className="text-xs text-primary/80 font-bold">+{ganho} {statLabel}</span>
                        </div>
                        {instrutor ? (
                          <div className={`text-xs px-2 py-1 rounded-sm mb-2 flex items-center gap-1 border ${ganho === 2 ? 'text-success bg-success/10 border-success/30' : 'text-secondary bg-white/5 border-white/10'}`}>
                            <Swords size={9} />
                            Instrutor: <span className="font-bold ml-1">{instrutor.nome}</span>
                            <span className="ml-1 opacity-70">({statLabel}:{instrutorStat})</span>
                            {ganho === 2 ? <span className="ml-auto font-bold text-success">+2 {statLabel} ↑</span> : <span className="ml-auto opacity-60">+1 {statLabel}</span>}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-2 py-1 rounded-sm mb-2">
                            Sem instrutor — treinamento solo (+1 {statLabel})
                          </div>
                        )}
                        <button
                          onClick={() => treinarNpc(npc.id)}
                          disabled={!podeT || state.recursos.madeira < custo.madeira || state.recursos.ferro < custo.ferro}
                          className="w-full text-[12px] py-2 bg-primary/10 border border-primary/40 text-primary font-bold font-cinzel tracking-widest rounded-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors touch-manipulation"
                        >
                          <Dumbbell size={12} /> TREINAR
                          {(state.recursos.madeira < custo.madeira || state.recursos.ferro < custo.ferro) && (
                            <span className="text-xs text-destructive font-inter normal-case tracking-normal ml-1">(recursos insuficientes)</span>
                          )}
                        </button>
                        <div className="text-xs text-muted-foreground mt-1.5">Gasta +25 fadiga. Raridade recalculada automaticamente.</div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Estudo INT — T1 via Templo (andar 10+) · T2 via Arquivo (andar 21+) */}
              {(() => {
                type EstudoPath =
                  | { local: 'ARQUIVO'; custo: { pedra: number; comida: number }; podeE: boolean; semRecursos: boolean; mult: string }
                  | { local: 'TEMPLO';  custo: { comida: number; madeira: number }; podeE: boolean; semRecursos: boolean; mult: string };

                const isErudito = getProfissao(npc) === 'erudito';
                const arquivoEd = state.edificios.find(e => e.tipo === 'Arquivo');
                const arquivoNivel = arquivoEd?.nivel ?? 0;
                const temploEd = state.edificios.find(e => e.tipo === 'Templo');
                const temploNivel = temploEd?.nivel ?? 0;
                const treinamentos = npc.treinamentos ?? 0;

                // Não exibir se ainda longe do threshold e nenhum prédio construído
                if (state.andarAtual < 10 && temploNivel < 1 && arquivoNivel < 1) return null;

                // Resolve caminho ativo — Arquivo (T2) tem prioridade quando disponível para exibição
                const path: EstudoPath = (state.andarAtual >= 21 && arquivoNivel >= 1)
                  ? (() => {
                      const custo = calcCustoEstudo(treinamentos, isErudito);
                      return {
                        local: 'ARQUIVO',
                        custo,
                        podeE: podeEstudarNpc(npc, arquivoNivel, state.andarAtual),
                        semRecursos: state.recursos.pedra < custo.pedra || state.recursos.comida < custo.comida,
                        mult: isErudito ? '' : '×1,5',
                      };
                    })()
                  : (() => {
                      const custo = calcCustoEstudoT1(treinamentos, isErudito);
                      return {
                        local: 'TEMPLO',
                        custo,
                        podeE: podeEstudarNpcT1(npc, temploNivel, state.andarAtual),
                        semRecursos: state.recursos.comida < custo.comida || state.recursos.madeira < custo.madeira,
                        mult: isErudito ? '' : '×1,3',
                      };
                    })();

                const instrutor = calcInstrutor(npc.id, state.npcs, 'inteligencia');
                const instrutorStat = instrutor ? instrutor.inteligencia : 0;
                const ganho = (instrutor && instrutorStat > npc.inteligencia) ? 2 : 1;

                let bloqueio: string | null = null;
                if (state.andarAtual < 10) bloqueio = 'Disponível a partir do Andar 10.';
                else if (path.local === 'TEMPLO' && temploNivel < 1) bloqueio = 'Requer Templo construído (ou Arquivo na T2).';
                else if (treinamentos >= MAX_TREINAMENTOS) bloqueio = 'Limite de sessões atingido.';
                else if (npc.emGuerra) bloqueio = 'Mobilizado na guerra — retorna ao fim da campanha.';
                else if (npc.emExpedicao) bloqueio = 'Em expedição — aguarde o retorno.';
                else if (npc.fadiga >= 60) bloqueio = 'Fadiga alta demais (< 60 para estudar).';
                else if (npc.emprestado || npc.reforco) bloqueio = 'Só moradores próprios podem estudar.';

                return (
                  <div className="mt-3 pt-3 border-t border-white/5" onClick={e => e.stopPropagation()}>
                    <div className="text-xs text-secondary tracking-widest mb-2 flex items-center gap-2">
                      <Brain size={10} className="text-primary" /> ESTUDO — {path.local}
                      {path.mult && <span className="text-[10px] text-warning/70 normal-case tracking-normal font-inter">(custo {path.mult})</span>}
                      <span className="ml-auto text-xs text-primary/70 font-bold tracking-widest">{treinamentos}/{MAX_TREINAMENTOS} SESSÕES</span>
                    </div>
                    {bloqueio ? (
                      <div className="text-[12px] text-muted-foreground italic">{bloqueio}</div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[12px] text-secondary flex items-center gap-3">
                            {path.local === 'ARQUIVO' ? (
                              <>
                                <span className="flex items-center gap-1"><span>🪨</span> {path.custo.pedra} pedra</span>
                                <span className="flex items-center gap-1"><span>🌾</span> {path.custo.comida} comida</span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center gap-1"><span>🌾</span> {path.custo.comida} comida</span>
                                <span className="flex items-center gap-1"><span>🪵</span> {path.custo.madeira} madeira</span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-primary/80 font-bold">+{ganho} INT</span>
                        </div>
                        {instrutor ? (
                          <div className={`text-xs px-2 py-1 rounded-sm mb-2 flex items-center gap-1 border ${ganho === 2 ? 'text-success bg-success/10 border-success/30' : 'text-secondary bg-white/5 border-white/10'}`}>
                            <BookOpen size={9} />
                            Tutor: <span className="font-bold ml-1">{instrutor.nome}</span>
                            <span className="ml-1 opacity-70">(INT:{instrutorStat})</span>
                            {ganho === 2 ? <span className="ml-auto font-bold text-success">+2 INT ↑</span> : <span className="ml-auto opacity-60">+1 INT</span>}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-2 py-1 rounded-sm mb-2">
                            Sem tutor disponível — estudo solo (+1 INT)
                          </div>
                        )}
                        <button
                          onClick={() => estudarNpc(npc.id)}
                          disabled={!path.podeE || path.semRecursos}
                          className="w-full text-[12px] py-2 bg-primary/10 border border-primary/40 text-primary font-bold font-cinzel tracking-widest rounded-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors touch-manipulation"
                        >
                          <Brain size={12} /> ESTUDAR
                          {path.semRecursos && (
                            <span className="text-xs text-destructive font-inter normal-case tracking-normal ml-1">(recursos insuficientes)</span>
                          )}
                        </button>
                        <div className="text-xs text-muted-foreground mt-1.5">Gasta +25 fadiga. Raridade recalculada automaticamente.</div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative flex justify-between items-end" data-tour="povo">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">HABITANTES</h2>
        <span className="text-[12px] text-primary bg-primary/10 px-2 py-1 border border-primary/20 rounded-sm font-bold tracking-widest">
          {vivos} VIVOS
        </span>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      {/* ── CENSO: triagem, ordenação e grupos por profissão ─────────────── */}
      {(() => {
        const vivosL = state.npcs.filter(n => n.vivo);
        const TRIAGEM: Array<{ id: string; label: string; pred: (n: NPC) => boolean }> = [
          { id: 'exaustos',  label: '😴 Exaustos',          pred: n => n.fadiga >= 70 },
          { id: 'abalados',  label: '🩸 Sanidade baixa',    pred: n => n.sanidade < 50 },
          { id: 'lealdade',  label: '⚠ Lealdade em risco', pred: n => n.lealdade < 30 },
          { id: 'sem_posto', label: '🛠 Sem posto',         pred: n => !n.posto && !n.emprestado && !n.reforco },
          { id: 'hospedes',  label: '🤝 Hóspedes',          pred: n => !!n.emprestado || !!n.reforco },
        ];
        const chips = TRIAGEM.map(t => ({ ...t, n: vivosL.filter(t.pred).length })).filter(t => t.n > 0);
        const precisaAtencao = (n: NPC) => TRIAGEM.slice(0, 3).some(t => t.pred(n));

        const filtroDef = TRIAGEM.find(t => t.id === filtro);
        let lista = filtroDef ? vivosL.filter(filtroDef.pred) : vivosL;
        // Casas existentes (para o filtro discreto) + aplicação do filtro.
        const casas = [...new Set(vivosL.map(n => n.sobrenome).filter(Boolean) as string[])].sort();
        if (filtroCasa) lista = lista.filter(n => n.sobrenome === filtroCasa);
        lista = [...lista].sort((a, b) =>
          ordem === 'nome' ? a.nome.localeCompare(b.nome)
          : ordem === 'fadiga' ? b.fadiga - a.fadiga
          : ordem === 'lealdade' ? a.lealdade - b.lealdade
          : calcNpcPower(b) - calcNpcPower(a));

        const emojiHumor = (n: NPC) => {
          const tom = humorDe(n).tom;
          return tom === 'bom' ? '😊' : tom === 'critico' ? '😰' : tom === 'ruim' ? '😟' : '😐';
        };

        const renderCompacto = (n: NPC) => {
          const rarityColor = getRarityColorHex(n.raridade);
          return (
            <div
              key={n.id}
              onClick={() => setExpandedId(n.id)}
              className="flex items-stretch gap-0 bg-[#11161F] border border-card-border hover:border-primary/40 rounded-sm cursor-pointer overflow-hidden transition-all touch-manipulation"
            >
              <div className="w-1 shrink-0" style={{ backgroundColor: rarityColor }} />
              <div className="flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-2">
                <span className="text-sm shrink-0">{emojiHumor(n)}</span>
                <span className="font-bold text-sm text-foreground truncate">{n.nome}</span>
                {n.juramento && <span className="text-[12px] shrink-0 opacity-70" title={n.juramento === 'escalada' ? 'Jurou à Escalada' : 'Jurou ao Ofício'}>{n.juramento === 'escalada' ? '🗡' : '⚒'}</span>}
                {n.posto && <Hammer size={11} className="text-success shrink-0" />}
                {(n.emprestado || n.reforco) && <UserPlus size={11} className="text-[#4A9EFF] shrink-0" />}
                <span className="ml-auto flex items-center gap-2 shrink-0">
                  <span className="w-14 space-y-[3px]">
                    <span className="block h-[3px] bg-black/60 rounded-full overflow-hidden">
                      <span className={`block h-full ${n.fadiga > 60 ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${100 - n.fadiga}%` }} />
                    </span>
                    <span className="block h-[3px] bg-black/60 rounded-full overflow-hidden">
                      <span className={`block h-full ${n.sanidade < 50 ? 'bg-warning' : 'bg-[#4A9EFF]'}`} style={{ width: `${n.sanidade}%` }} />
                    </span>
                  </span>
                  <span className="text-xs font-cinzel font-bold text-primary w-9 text-right">{calcNpcPower(n).toFixed(0)}</span>
                  {precisaAtencao(n) && <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse-atencao" />}
                </span>
              </div>
            </div>
          );
        };

        const PROFS: ProfissaoId[] = ['combatente', 'batedor', 'erudito', 'sentinela'];
        return (
          <>
            {/* Triagem: o checklist do dia */}
            {chips.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1">
                {chips.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFiltro(f => (f === t.id ? null : t.id))}
                    className={`shrink-0 text-[12px] px-2.5 py-1.5 rounded-sm border tracking-wide font-bold transition-all touch-manipulation ${
                      filtro === t.id ? 'border-primary text-primary bg-primary/10' : 'border-card-border text-white/60 bg-[#11161F]'
                    }`}
                  >
                    {t.label} ({t.n})
                  </button>
                ))}
              </div>
            )}

            {/* Ordenação + filtro de casa (discreto: um select, só se há casas) */}
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-secondary tracking-widest shrink-0">ORDENAR:</span>
              {(['poder', 'fadiga', 'lealdade', 'nome'] as const).map(o => (
                <button
                  key={o}
                  onClick={() => setOrdem(o)}
                  className={`px-2 py-1 rounded-sm uppercase tracking-wider touch-manipulation ${ordem === o ? 'text-primary font-bold bg-primary/10' : 'text-white/40'}`}
                >
                  {o}
                </button>
              ))}
              {casas.length > 0 && (
                <select
                  value={filtroCasa ?? ''}
                  onChange={e => setFiltroCasa(e.target.value || null)}
                  className={`ml-auto max-w-[42%] bg-[#11161F] border rounded-sm px-1.5 py-1 text-[12px] touch-manipulation ${filtroCasa ? 'border-primary/50 text-primary' : 'border-card-border text-white/50'}`}
                >
                  <option value="">⚜ Todas as casas</option>
                  {casas.map(c => (
                    <option key={c} value={c}>⚜ {c} ({vivosL.filter(n => n.sobrenome === c).length})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Quadro de Postos: gestão por vaga, não por pessoa */}
            {state.edificios.some(e => e.nivel >= 1 && e.tipo in POSTO_AFIM) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <span className="text-xs font-cinzel text-primary/80 tracking-[0.2em]">QUADRO DE POSTOS</span>
                  {vivosL.some(n => !n.juramento && !n.emprestado && !n.reforco) && (
                    <button
                      onClick={sugerirJuramentos}
                      className="text-[12px] px-2 py-1 border border-primary/40 text-primary/80 rounded-sm hover:bg-primary/10 touch-manipulation tracking-wider"
                    >
                      🔥 SUGERIR JURAMENTOS
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {state.edificios.filter(e => e.nivel >= 1 && e.tipo in POSTO_AFIM).map(e => {
                    const ocupantes = vivosL.filter(n => n.posto === e.tipo);
                    return (
                      <div key={e.tipo} className="border border-card-border bg-[#11161F] rounded-sm p-2 space-y-1">
                        <div className="text-[12px] text-secondary tracking-wider flex justify-between gap-1">
                          <span className="truncate">{nomeEdificio(e.tipo, state.andarAtual)}</span>
                          <span className="text-white/35 shrink-0">{ocupantes.length}/{e.nivel}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ocupantes.map(n => (
                            <button
                              key={n.id}
                              onClick={() => setExpandedId(n.id)}
                              className="text-[12px] px-1.5 py-0.5 border border-success/30 text-success bg-success/5 rounded-sm truncate max-w-full touch-manipulation"
                            >
                              {n.nome.split(' ')[0]}
                            </button>
                          ))}
                          {ocupantes.length < e.nivel && (
                            <button
                              onClick={() => setVagaPicker(e.tipo)}
                              className="text-[12px] px-1.5 py-0.5 border border-dashed border-primary/40 text-primary/70 rounded-sm hover:bg-primary/10 touch-manipulation"
                            >
                              + vaga
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grupos por profissão */}
            {PROFS.map(prof => {
              const doGrupo = lista.filter(n => getProfissao(n) === prof);
              if (doGrupo.length === 0) return null;
              const poderGrupo = doGrupo.reduce((s, n) => s + calcNpcPower(n), 0);
              return (
                <div key={prof} className="space-y-1.5">
                  <div className="flex items-baseline gap-2 border-b border-white/10 pb-1">
                    <span className="text-xs font-cinzel text-primary/80 tracking-[0.2em] flex items-center gap-1.5">
                      {getProfIcon(prof)} {PROFISSOES[prof].nome.toUpperCase()}S
                    </span>
                    <span className="text-[12px] text-white/40">quantidade ={doGrupo.length} · poder total = {poderGrupo.toFixed(0)}</span>
                  </div>
                  {doGrupo.map(n => (expandedId === n.id ? renderCard(n) : renderCompacto(n)))}
                </div>
              );
            })}
            {lista.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">Ninguém neste filtro. A cidadela agradece.</p>
            )}
          </>
        );
      })()}

      {/* Picker de vaga do Quadro de Postos: candidatos ordenados por afinidade */}
      <Dialog.Root open={vagaPicker !== null} onOpenChange={o => { if (!o) setVagaPicker(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[70]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm max-h-[70dvh] bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 rounded-sm p-4 z-[70] flex flex-col outline-none">
            {vagaPicker && (() => {
              const afim = POSTO_AFIM[vagaPicker];
              const candidatos = state.npcs
                .filter(n => n.vivo && !n.emprestado && !n.reforco && n.posto !== vagaPicker)
                .sort((a, b) => {
                  const aAfim = getProfissao(a) === afim ? 1 : 0;
                  const bAfim = getProfissao(b) === afim ? 1 : 0;
                  const aOficio = a.juramento === 'oficio' ? 1 : 0;
                  const bOficio = b.juramento === 'oficio' ? 1 : 0;
                  return bAfim - aAfim || bOficio - aOficio || calcNpcPower(b) - calcNpcPower(a);
                });
              return (
                <>
                  <Dialog.Title className="font-cinzel font-bold text-primary tracking-widest text-sm mb-1">
                    VAGA — {nomeEdificio(vagaPicker, state.andarAtual).toUpperCase()}
                  </Dialog.Title>
                  <p className="text-[12px] text-white/45 mb-3">
                    Afinidade: <span className="text-white/70">{afim ? PROFISSOES[afim].nome : '—'}</span> (★ recebe bônus maior)
                  </p>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                    {candidatos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Ninguém disponível.</p>}
                    {candidatos.map(n => {
                      const isAfim = getProfissao(n) === afim;
                      return (
                        <button
                          key={n.id}
                          onClick={() => { assignPosto(n.id, vagaPicker); setVagaPicker(null); }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm border text-left touch-manipulation transition-all ${
                            isAfim ? 'border-success/40 bg-success/5 hover:border-success/70' : 'border-card-border bg-[#0D1117] hover:border-primary/40'
                          }`}
                        >
                          <span className="text-sm font-bold text-foreground truncate">
                            {isAfim && <span className="text-success">★ </span>}{n.nome}
                            {n.posto && <span className="text-[12px] text-white/35 font-normal"> · sai de {n.posto}</span>}
                          </span>
                          <span className="text-[12px] text-secondary shrink-0 flex items-center gap-1">
                            {getProfIcon(getProfissao(n))} {PROFISSOES[getProfissao(n)].nome}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Seção colapsável de falecidos */}
      {state.npcs.filter(n => !n.vivo).length > 0 && (
        <div>
          <button
            onClick={() => setMostrarMortos(m => !m)}
            className="w-full flex items-center justify-between px-3 py-2 border border-destructive/20 bg-destructive/5 text-destructive text-[12px] font-bold tracking-widest font-cinzel rounded-sm touch-manipulation"
          >
            <span>{state.npcs.filter(n => !n.vivo).length} FALECIDO{state.npcs.filter(n => !n.vivo).length !== 1 ? 'S' : ''}</span>
            <span className="text-xs opacity-60">{mostrarMortos ? '▴ OCULTAR' : '▾ MOSTRAR'}</span>
          </button>
          {mostrarMortos && (
            <div className="space-y-2 mt-2">
{state.npcs.filter(n => !n.vivo).map(npc => (
                <div key={npc.id} className="bg-[#0D1117] border border-destructive/20 p-3 opacity-55 grayscale flex justify-between items-center rounded-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full border border-destructive/40 flex items-center justify-center bg-background text-destructive text-[12px] font-cinzel">✕</div>
                    <div>
                      <span className="font-bold font-inter text-muted-foreground line-through decoration-destructive text-sm">{npc.nome}</span>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-sm flex items-center gap-1 uppercase tracking-wider font-bold">
                          {getProfIcon(getProfissao(npc))} {PROFISSOES[getProfissao(npc)].nome}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-black/40 text-secondary border border-white/10 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                          {getHabIcon(npc.habilidade)} {HABILIDADES[npc.habilidade].nome}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-destructive tracking-widest border border-destructive/40 px-2 py-0.5 bg-destructive/8 rounded-sm shrink-0 self-start">FALECIDO</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
