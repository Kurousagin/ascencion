import { climaDoDia, type ClimaDoBioma } from '../lib/clima';
import { BIOMA_META, type BiomaTipo } from '../lib/game-data';

// ─── O tempo da Torre — como ela amanheceu hoje ───────────────────────────────
// Mostra só os biomas que se agitaram (favorável/adverso). Dia quieto = uma
// linha discreta. Determinístico por (seed, dia): recomputável, sem estado.

export function ClimaBanner({ seed, dia }: { seed: number; dia: number }) {
  const climas = climaDoDia(seed, dia);
  const ativos = (Object.entries(climas) as [BiomaTipo, ClimaDoBioma][])
    .filter(([, c]) => c.estado !== 'neutro');

  if (ativos.length === 0) {
    return (
      <p className="text-xs text-white/35 italic tracking-wide px-1">
        A Torre amanheceu quieta. Nenhum bioma se agita hoje.
      </p>
    );
  }

  return (
    <div className="rounded-sm border border-primary/20 bg-[#12161F] px-3 py-2 space-y-1.5">
      <span className="text-[10px] text-secondary tracking-[0.2em] block">O TEMPO DA TORRE</span>
      {ativos.map(([bioma, c]) => (
        <div key={bioma} className="space-y-0.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-white/75 min-w-0 truncate">
              {c.icone} <span className="font-cinzel font-bold">{c.nome}</span>
              <span className="text-white/40"> — {BIOMA_META[bioma].label}</span>
            </span>
            <span className={`shrink-0 font-bold ${c.estado === 'favoravel' ? 'text-success' : 'text-warning'}`}>
              {c.estado === 'favoravel' ? '+10%' : '−10%'} saque
            </span>
          </div>
          {ativos.length <= 2 && (
            <p className="text-xs text-white/40 italic leading-snug">{c.descricao}</p>
          )}
        </div>
      ))}
    </div>
  );
}
