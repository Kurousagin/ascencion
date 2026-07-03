import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FLOORS, calcNpcPower } from '../lib/game-data';
import { Skull, ChevronUp, Swords, Wheat, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';

export function Tower() {
  const { state, sendExpedition } = useGame();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);

  const floorData = FLOORS[state.andarAtual - 1];
  const isBoss = floorData?.isBoss;

  const eligibles = state.npcs.filter(n => n.vivo && !n.emExpedicao && n.fadiga < 90);
  
  const cost = selectedNpcs.length * (3 + (floorData?.tier || 1));
  const canAfford = state.recursos.comida >= cost;

  let groupPower = 0;
  const group = state.npcs.filter(n => selectedNpcs.includes(n.id));
  group.forEach(n => {
    groupPower += calcNpcPower(n);
  });

  const handleToggle = (id: string) => {
    if (selectedNpcs.includes(id)) setSelectedNpcs(selectedNpcs.filter(i => i !== id));
    else setSelectedNpcs([...selectedNpcs, id]);
  };

  const handleConfirm = () => {
    if (!canAfford || selectedNpcs.length === 0) return;
    sendExpedition(selectedNpcs);
    setSelectedNpcs([]);
    setModalOpen(false);
  };

  if (state.andarAtual > 20) {
    return <div className="p-6 text-center text-primary mt-20 font-cinzel text-xl drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] tracking-widest">ÁPICE ALCANÇADO</div>;
  }

  const getTierBg = (tier: number, isBoss: boolean) => {
    if (isBoss) return 'from-[#2A0E0E] to-[#180808] border-destructive';
    switch (tier) {
      case 1: return 'from-[#2A1F0E] to-[#1A1408] border-[#8B5E3C]';
      case 2: return 'from-[#0E1A2A] to-[#0A1018] border-[#566C8B]';
      case 3: return 'from-[#1A0E2A] to-[#100818] border-[#7B4EA8]';
      case 4: return 'from-[#2A0E0E] to-[#180808] border-[#C0392B]';
      default: return 'from-[#1C2333] to-[#161B22] border-card-border';
    }
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

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">TORRE OBSCURA</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      <div className={`bg-gradient-to-b border p-6 relative rounded-sm shadow-2xl overflow-hidden ${getTierBg(floorData.tier, isBoss)} ${isBoss ? 'shadow-[0_0_20px_rgba(248,81,73,0.3)]' : ''}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] pointer-events-none rounded-full" />
        
        {isBoss && (
          <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-4 py-1.5 text-[10px] font-bold flex items-center gap-1 tracking-[0.2em] rounded-bl-sm z-10">
            <Skull size={12} /> CHEFE
          </div>
        )}
        
        <div className="text-[10px] text-white/50 tracking-[0.2em] mb-1 font-inter relative z-10">ALVO ATUAL</div>
        <div className="text-5xl font-bold text-white font-cinzel flex items-baseline gap-2 mb-2 drop-shadow-md relative z-10">
          {floorData.floor} <span className="text-xl text-white/70">ANDAR</span>
        </div>
        <div className="text-sm text-primary tracking-[0.2em] mb-6 font-cinzel glow-gold block w-max relative z-10">{floorData.tierName.toUpperCase()}</div>

        <div className="grid grid-cols-2 gap-4 mb-8 bg-black/30 p-4 rounded-sm border border-white/5 relative z-10">
          <div>
            <div className="text-[10px] text-white/50 mb-1 tracking-widest">DIFICULDADE</div>
            <div className="text-lg font-bold text-white/90 flex items-center gap-2"><Swords size={14} className="text-primary"/> {floorData.difficulty} PWR</div>
          </div>
          <div>
            <div className="text-[10px] text-white/50 mb-1 tracking-widest">RISCO BASE</div>
            <div className="text-lg font-bold text-warning">{floorData.mortality}% MORT.</div>
          </div>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className={`w-full h-14 font-cinzel font-bold tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 relative z-10 ${
            isBoss 
              ? 'bg-destructive text-destructive-foreground shadow-[0_0_15px_rgba(248,81,73,0.4)]' 
              : 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]'
          } rounded-sm`}
        >
          <ChevronUp /> PREPARAR EXPEDIÇÃO
        </button>
      </div>

      <div className="space-y-3 mt-10">
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-b border-primary/20 pb-2">
          HISTÓRICO DA ESCALADA
        </h3>
        <div className="space-y-2">
          {FLOORS.slice(0, state.andarAtual - 1).reverse().map(f => (
            <div key={f.floor} className="flex justify-between items-center p-3 bg-gradient-to-r from-[#161B22] to-transparent border-l-2 border-card-border text-sm hover:border-primary/50 transition-colors">
              <div className="flex flex-col">
                <span className="font-bold font-cinzel text-foreground">ANDAR {f.floor}</span>
                <span className="text-[10px] text-secondary tracking-widest">{f.tierName.toUpperCase()}</span>
              </div>
              <span className="text-primary font-bold text-[10px] tracking-widest flex items-center gap-1">
                <Check size={12} /> CONQUISTADO
              </span>
            </div>
          ))}
        </div>
      </div>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 transition-opacity" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md max-h-[85vh] bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-5 flex flex-col z-50 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <Dialog.Title className="text-xl font-cinzel font-bold text-primary tracking-widest mb-4 border-b border-primary/20 pb-2">FORMAR GRUPO</Dialog.Title>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-5 custom-scrollbar pr-2">
              {eligibles.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm font-inter">Nenhum habitante apto para combate.</div>
              ) : (
                eligibles.map(n => {
                  const p = calcNpcPower(n);
                  const isSelected = selectedNpcs.includes(n.id);
                  const rarityColor = getRarityColorHex(n.raridade);
                  return (
                    <div 
                      key={n.id} 
                      className={`flex items-stretch gap-0 border transition-all cursor-pointer rounded-sm overflow-hidden ${isSelected ? 'border-primary bg-primary/5' : 'border-card-border bg-[#0D1117] hover:border-primary/40'}`}
                      onClick={() => handleToggle(n.id)}
                    >
                      <div className="w-1.5 shrink-0" style={{ backgroundColor: rarityColor }} />
                      <div className="flex-1 p-3 flex items-center gap-3">
                        <Checkbox.Root 
                          checked={isSelected} 
                          className={`w-5 h-5 border flex items-center justify-center shrink-0 rounded-sm ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-secondary bg-transparent'}`}
                        >
                          <Checkbox.Indicator>
                            <Check size={14} strokeWidth={3} />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{n.nome}</span>
                              <span className="text-[10px]" style={{ color: rarityColor }}>{getRarityStars(n.raridade)}</span>
                            </div>
                            <span className="text-primary font-bold text-sm font-cinzel">{p.toFixed(1)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] px-1.5 py-[1px] bg-secondary/20 text-secondary border border-secondary/30 rounded-sm tracking-wider uppercase">
                              {n.habilidade}
                            </span>
                          </div>

                          <div className="w-full bg-background h-1.5 flex rounded-sm overflow-hidden border border-white/5">
                            <div className={`h-full ${n.fadiga > 60 ? 'bg-destructive' : 'bg-success'}`} style={{width: `${100 - n.fadiga}%`}} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-4 bg-black/40 p-4 rounded-sm border border-primary/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-cinzel tracking-widest text-[11px]">PODER TOTAL</span>
                <span className={`font-bold font-cinzel text-lg flex items-center gap-2 ${groupPower >= floorData.difficulty ? 'text-success drop-shadow-[0_0_5px_rgba(63,185,80,0.5)]' : 'text-destructive'}`}>
                  <Swords size={16}/> {groupPower.toFixed(1)} <span className="text-xs text-muted-foreground">/ {floorData.difficulty}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-cinzel tracking-widest text-[11px]">CUSTO DE SUPRIMENTOS</span>
                <span className={`font-bold font-inter text-base flex items-center gap-2 ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                  <Wheat size={16} className={canAfford ? 'text-warning' : 'text-destructive'}/> {cost} <span className="text-xs text-muted-foreground">/ {Math.floor(state.recursos.comida)}</span>
                </span>
              </div>
              
              <button
                onClick={handleConfirm}
                disabled={!canAfford || selectedNpcs.length === 0}
                className="w-full h-14 bg-primary text-primary-foreground font-cinzel font-bold tracking-[0.2em] text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 rounded-sm shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                INICIAR ESCALADA
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
