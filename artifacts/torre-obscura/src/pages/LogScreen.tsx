import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { LogEntry } from '../lib/game-data';

// Filtros de leitura: cada chip agrega os tipos que contam a mesma história.
const FILTROS: { id: string; label: string; tipos: LogEntry['tipo'][] }[] = [
  { id: 'todos',    label: 'TODOS',         tipos: [] },
  { id: 'perdas',   label: '⚔ PERDAS',      tipos: ['morte', 'traicao'] },
  { id: 'descob',   label: '✦ DESCOBERTAS', tipos: ['descoberta'] },
  { id: 'vitorias', label: '🏆 VITÓRIAS',    tipos: ['vitoria'] },
  { id: 'alertas',  label: '⚠ ALERTAS',     tipos: ['alerta'] },
  { id: 'vida',     label: '🎭 VIDA',        tipos: ['evento', 'info'] },
];

// Quantas entradas renderizar por vez (o log guarda até 200).
const LOTE = 60;

// A cor do tipo vive só no marcador da timeline — mensagem em cor neutra
// cansa menos que parede de texto colorido.
const getDot = (tipo: LogEntry['tipo']) => {
  switch (tipo) {
    case 'morte':
    case 'traicao': return 'bg-destructive shadow-[0_0_8px_rgba(248,81,73,0.8)]';
    case 'descoberta': return 'bg-[#4A9EFF] shadow-[0_0_8px_rgba(74,158,255,0.8)]';
    case 'vitoria': return 'bg-success shadow-[0_0_8px_rgba(63,185,80,0.8)]';
    case 'alerta': return 'bg-warning shadow-[0_0_8px_rgba(227,179,65,0.8)]';
    case 'evento': return 'bg-[#9B5DE5] shadow-[0_0_8px_rgba(155,93,229,0.8)]';
    default: return 'bg-secondary';
  }
};

export function LogScreen() {
  const { state } = useGame();
  const [filtro, setFiltro] = useState('todos');
  const [visiveis, setVisiveis] = useState(LOTE);

  const tipos = FILTROS.find(f => f.id === filtro)?.tipos ?? [];
  const filtrado = tipos.length > 0 ? state.log.filter(l => tipos.includes(l.tipo)) : state.log;
  const recorte = filtrado.slice(0, visiveis);

  // Agrupa entradas consecutivas do mesmo dia (o log é newest-first):
  // o cabeçalho "DIA 042" aparece uma vez, não em cada linha.
  const grupos: { dia: number; entradas: LogEntry[] }[] = [];
  for (const l of recorte) {
    const g = grupos[grupos.length - 1];
    if (g && g.dia === l.dia) g.entradas.push(l);
    else grupos.push({ dia: l.dia, entradas: [l] });
  }

  return (
    <div className="p-4 pb-24 h-full flex flex-col gap-3">
      <header className="pb-3 border-b border-primary/30 relative shrink-0">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">REGISTROS</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      {/* Filtros por tipo de história */}
      <div className="flex gap-1.5 overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1 shrink-0">
        {FILTROS.map(f => (
          <button
            key={f.id}
            onClick={() => { setFiltro(f.id); setVisiveis(LOTE); }}
            className={`shrink-0 text-[12px] px-2.5 py-1.5 rounded-sm border tracking-wide font-bold transition-all touch-manipulation ${
              filtro === f.id ? 'border-primary text-primary bg-primary/10' : 'border-card-border text-white/60 bg-[#11161F]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pl-2 relative">
        <div className="absolute left-[13px] top-4 bottom-4 w-px bg-card-border" />
        <div className="space-y-5 pt-4 pb-4">
          {grupos.map(g => (
            <div key={`${g.dia}-${g.entradas[0].id}`}>
              <div className="relative pl-8 mb-2 z-10">
                <span className="text-[11px] font-mono text-primary/80 tracking-wider bg-[#161B22] px-2 py-0.5 rounded-sm border border-primary/25">
                  DIA {g.dia.toString().padStart(3, '0')}
                </span>
              </div>
              <div className="space-y-2.5">
                {g.entradas.map(l => (
                  <div key={l.id} className="relative pl-8">
                    <div className={`absolute left-0 top-[5px] w-2.5 h-2.5 rounded-full ${getDot(l.tipo)} z-10 outline outline-4 outline-[#0D1117]`} />
                    <div className="text-sm font-inter leading-relaxed text-white/80">
                      {l.mensagem}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtrado.length > visiveis && (
            <div className="relative pl-8">
              <button
                onClick={() => setVisiveis(v => v + LOTE)}
                className="w-full py-2 text-[12px] tracking-widest font-bold text-primary/70 border border-primary/25 rounded-sm hover:bg-primary/10 touch-manipulation"
              >
                CARREGAR MAIS ({filtrado.length - visiveis} restantes)
              </button>
            </div>
          )}

          {filtrado.length === 0 && (
            <div className="text-secondary text-sm font-inter italic text-center mt-10">
              {state.log.length === 0 ? 'O vazio do silêncio.' : 'Nada sob este filtro ainda.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
