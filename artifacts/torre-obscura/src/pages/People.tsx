import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert, Crosshair, Sparkles, Brain, Dna, Swords, Wind, BookOpen, Shield, Hammer, X, ArrowRightLeft } from 'lucide-react';
import { NPC, getProfissao, PROFISSOES, POSTO_AFIM, BUILDINGS, EdificioTipo, ProfissaoId } from '../lib/game-data';

export function People() {
  const { state, assignPosto } = useGame();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <div className="text-[9px] text-secondary mb-1 flex justify-between tracking-widest font-inter">
          <span>{label}</span>
        </div>
        <div className="h-1.5 bg-black/50 w-full rounded-sm overflow-hidden border border-white/5">
          <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  };

  const getRarityColorHex = (r: string) => {
    switch(r) {
      case 'Comum': return 'var(--rarity-comum)';
      case 'Incomum': return 'var(--rarity-incomum)';
      case 'Raro': return 'var(--rarity-raro)';
      case 'Épico': return 'var(--rarity-epico)';
      default: return 'var(--rarity-comum)';
    }
  };

  const getRarityStars = (r: string) => {
    switch(r) {
      case 'Comum': return '★';
      case 'Incomum': return '★★';
      case 'Raro': return '★★★';
      case 'Épico': return '★★★★';
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
          <span className="text-[10px] text-destructive tracking-widest border border-destructive/50 px-2 py-1 bg-destructive/10 rounded-sm">FALECIDO</span>
        </div>
      );
    }

    const dominantStat = Math.max(npc.forca, npc.agilidade, npc.inteligencia, npc.resistencia);
    let domLetter = 'F';
    if (dominantStat === npc.agilidade) domLetter = 'A';
    else if (dominantStat === npc.inteligencia) domLetter = 'I';
    else if (dominantStat === npc.resistencia) domLetter = 'R';

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
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-lg font-inter">{npc.nome}</span>
                  <span className="text-[10px]" style={{ color: rarityColor }}>{getRarityStars(npc.raridade)}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-sm flex items-center gap-1 uppercase tracking-wider font-bold">
                    {getProfIcon(getProfissao(npc))} {PROFISSOES[getProfissao(npc)].nome}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-black/40 text-secondary border border-white/10 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                    {getHabIcon(npc.habilidade)} {npc.habilidade}
                  </span>
                  {npc.posto && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-success/10 text-success border border-success/30 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                      <Hammer size={9} /> {npc.posto}
                    </span>
                  )}
                  {npc.obscuro && (
                    <span className="text-[9px] bg-orange/10 border border-orange text-orange px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider animate-pulse">
                      <ShieldAlert size={10}/> OBSCURO
                    </span>
                  )}
                  {npc.emprestadoDe && (
                    <span className="text-[9px] bg-blue-500/10 border border-blue-400/40 text-blue-400 px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-wider">
                      <ArrowRightLeft size={9}/> EMPRESTADA{npc.retornaEm !== undefined ? ` (dia ${npc.retornaEm})` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className={`text-[9px] font-bold px-2 py-1 rounded-sm border ${fStatus.color} tracking-widest`}>{fStatus.label}</span>
          </div>

          <div className="flex gap-4 mb-2">
            <Bar value={npc.sanidade} label="SANIDADE" />
            <Bar value={npc.lealdade} label="LEALDADE" />
            <Bar value={npc.fadiga} label="FADIGA" inverted />
          </div>

          {npc.lealdade < 30 && (
            <div className="mt-3 text-[10px] text-destructive bg-destructive/10 border border-destructive/30 px-2 py-1.5 rounded-sm flex items-center justify-center font-bold tracking-widest animate-pulse">
              ⚠ RISCO DE TRAIÇÃO IMINENTE
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                <div className="bg-black/30 py-2 border border-white/5 rounded-sm">
                  <div className="text-[9px] text-secondary mb-1 tracking-widest">FOR</div>
                  <div className="font-bold text-foreground font-cinzel text-sm">{npc.forca}</div>
                </div>
                <div className="bg-black/30 py-2 border border-white/5 rounded-sm">
                  <div className="text-[9px] text-secondary mb-1 tracking-widest">AGI</div>
                  <div className="font-bold text-foreground font-cinzel text-sm">{npc.agilidade}</div>
                </div>
                <div className="bg-black/30 py-2 border border-white/5 rounded-sm">
                  <div className="text-[9px] text-secondary mb-1 tracking-widest">INT</div>
                  <div className="font-bold text-foreground font-cinzel text-sm">{npc.inteligencia}</div>
                </div>
                <div className="bg-black/30 py-2 border border-white/5 rounded-sm">
                  <div className="text-[9px] text-secondary mb-1 tracking-widest">RES</div>
                  <div className="font-bold text-foreground font-cinzel text-sm">{npc.resistencia}</div>
                </div>
              </div>
              <div className="flex justify-around text-[10px] text-muted-foreground font-inter bg-[#0D1117] py-2 rounded-sm border border-card-border">
                <div>SAN: <span className="text-foreground">{Math.floor(npc.sanidade)}</span>/100</div>
                <div>LEA: <span className="text-foreground">{Math.floor(npc.lealdade)}</span>/100</div>
                <div>FAD: <span className="text-foreground">{Math.floor(npc.fadiga)}</span>/100</div>
              </div>

              {/* Alocação de trabalho */}
              <div className="mt-3 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                <div className="text-[9px] text-secondary tracking-widest mb-2 flex items-center gap-1">
                  <Hammer size={10} className="text-primary" /> POSTO DE TRABALHO
                </div>
                {npc.emExpedicao ? (
                  <div className="text-[10px] text-warning/80 italic">Em expedição — não pode trabalhar agora.</div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        const disponiveis = postosDisponiveis(npc);
                        const opcoes = Array.from(new Set([...(npc.posto ? [npc.posto] : []), ...disponiveis]));
                        if (opcoes.length === 0) {
                          return <span className="text-[10px] text-muted-foreground italic">Nenhum edifício de trabalho com vaga. Construa/melhore na Cidadela.</span>;
                        }
                        return opcoes.map(tipo => {
                          const ativo = npc.posto === tipo;
                          const afim = POSTO_AFIM[tipo];
                          const compat = afim === getProfissao(npc);
                          return (
                            <button
                              key={tipo}
                              onClick={() => assignPosto(npc.id, ativo ? null : tipo)}
                              className={`text-[10px] px-2 py-1 rounded-sm border transition-all touch-manipulation flex items-center gap-1 ${
                                ativo
                                  ? 'bg-success/15 border-success text-success font-bold'
                                  : compat
                                    ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20'
                                    : 'bg-black/30 border-card-border text-secondary hover:border-primary/40'
                              }`}
                            >
                              {ativo && <X size={10} />}
                              {BUILDINGS[tipo].nome}
                              {compat && !ativo && <span className="text-[8px] text-primary">★</span>}
                            </button>
                          );
                        });
                      })()}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-1.5">★ = profissão compatível (bônus maior). Toque no posto ativo para dispensar.</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative flex justify-between items-end">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">HABITANTES</h2>
        <span className="text-[10px] text-primary bg-primary/10 px-2 py-1 border border-primary/20 rounded-sm font-bold tracking-widest">
          {vivos} VIVOS
        </span>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      <div className="space-y-3">
        {state.npcs.sort((a,b) => (b.vivo ? 1 : 0) - (a.vivo ? 1 : 0)).map(renderCard)}
      </div>
    </div>
  );
}
