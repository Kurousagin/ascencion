import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FLOORS } from '../lib/game-data';
import { Skull, ChevronUp, Swords, Cookie } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';

export function Tower() {
  const { state, sendExpedition } = useGame();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
  const [resultVisible, setResultVisible] = useState(false);

  const floorData = FLOORS[state.andarAtual - 1];
  const isBoss = floorData?.isBoss;

  const eligibles = state.npcs.filter(n => n.vivo && !n.emExpedicao && n.fadiga < 90);
  
  const cost = selectedNpcs.length * (3 + (floorData?.tier || 1));
  const canAfford = state.recursos.comida >= cost;

  let groupPower = 0;
  const group = state.npcs.filter(n => selectedNpcs.includes(n.id));
  group.forEach(n => {
    let p = (n.forca * 0.3) + (n.agilidade * 0.25) + (n.resistencia * 0.25) + (n.inteligencia * 0.2);
    if (n.fadiga >= 50 && n.fadiga <= 69) p *= 0.85;
    else if (n.fadiga >= 70 && n.fadiga <= 89) p *= 0.65;
    groupPower += p;
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
    return <div className="p-6 text-center text-primary mt-20">TORRE TOTALMENTE CONQUISTADA.</div>;
  }

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto">
      <header className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-widest text-foreground">TORRE OBSCURA</h2>
      </header>

      <div className={`bg-card border-2 p-5 ${isBoss ? 'border-destructive' : 'border-card-border'} relative overflow-hidden`}>
        {isBoss && (
          <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold flex items-center gap-1 tracking-widest">
            <Skull size={12} /> CHEFE
          </div>
        )}
        <div className="text-xs text-secondary mb-1">PRÓXIMO ALVO</div>
        <div className="text-2xl font-bold text-foreground flex items-center gap-2 mb-1">
          ANDAR {floorData.floor}
        </div>
        <div className="text-sm text-primary tracking-widest mb-4">{floorData.tierName.toUpperCase()}</div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-[10px] text-secondary">DIFICULDADE</div>
            <div className="text-lg font-bold">{floorData.difficulty} PODER</div>
          </div>
          <div>
            <div className="text-[10px] text-secondary">RISCO (BASE)</div>
            <div className="text-lg font-bold text-warning">{floorData.mortality}% MORTALIDADE</div>
          </div>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className={`w-full h-14 font-bold tracking-widest flex items-center justify-center gap-2 ${
            isBoss ? 'bg-destructive text-destructive-foreground' : 'bg-foreground text-background'
          }`}
        >
          <ChevronUp /> PREPARAR EXPEDIÇÃO
        </button>
      </div>

      <div className="space-y-2 mt-8">
        <h3 className="text-xs text-secondary tracking-widest mb-3">HISTÓRICO</h3>
        {FLOORS.slice(0, state.andarAtual - 1).reverse().map(f => (
          <div key={f.floor} className="flex justify-between items-center p-3 bg-card border border-card-border text-sm">
            <div className="flex flex-col">
              <span className="font-bold">Andar {f.floor}</span>
              <span className="text-[10px] text-secondary">{f.tierName}</span>
            </div>
            <span className="text-success font-bold text-xs">CONQUISTADO</span>
          </div>
        ))}
      </div>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[85vh] bg-card border border-border p-4 flex flex-col z-50">
            <Dialog.Title className="text-lg font-bold text-foreground mb-4">SELECIONAR GRUPO</Dialog.Title>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 border-y border-border py-2 pr-1">
              {eligibles.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm">Nenhum habitante apto.</div>
              ) : (
                eligibles.map(n => {
                  const p = (n.forca * 0.3) + (n.agilidade * 0.25) + (n.resistencia * 0.25) + (n.inteligencia * 0.2);
                  return (
                    <div 
                      key={n.id} 
                      className={`flex items-center gap-3 p-3 border ${selectedNpcs.includes(n.id) ? 'border-primary bg-primary/5' : 'border-card-border bg-background'}`}
                      onClick={() => handleToggle(n.id)}
                    >
                      <Checkbox.Root 
                        checked={selectedNpcs.includes(n.id)} 
                        className="w-5 h-5 border border-primary flex items-center justify-center bg-card shrink-0"
                      >
                        <Checkbox.Indicator className="text-primary">
                          <div className="w-3 h-3 bg-primary" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm flex justify-between">
                          <span>{n.nome}</span>
                          <span className="text-secondary">{p.toFixed(1)} Pwr</span>
                        </div>
                        <div className="w-full bg-background h-1 mt-1 flex">
                          <div className={`h-full ${n.fadiga > 60 ? 'bg-destructive' : 'bg-primary'}`} style={{width: `${100 - n.fadiga}%`}} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Poder do Grupo</span>
                <span className={`font-bold ${groupPower >= floorData.difficulty ? 'text-success' : 'text-destructive'} flex items-center gap-1`}>
                  <Swords size={14}/> {groupPower.toFixed(1)} / {floorData.difficulty}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Custo em Comida</span>
                <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'} flex items-center gap-1`}>
                  <Cookie size={14}/> {cost} / {Math.floor(state.recursos.comida)}
                </span>
              </div>
              
              <button
                onClick={handleConfirm}
                disabled={!canAfford || selectedNpcs.length === 0}
                className="w-full h-12 bg-primary text-background font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONFIRMAR
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
