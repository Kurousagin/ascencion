// ─── Mural da Cidadela ───────────────────────────────────────────────────────
// Feed vivo dos acontecimentos notáveis recentes (state.feed) — entrega orgânica
// dos eventos de autonomia sem exigir abrir o log cru. Separado do LogScreen.

import { ScrollText } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { visualDe } from './acontecimento-visual';

export function MuralAcontecimentos() {
  const { state } = useGame();
  const feed = state?.feed ?? [];

  return (
    <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-3">
      <div className="flex items-center gap-2 mb-3">
        <ScrollText size={12} className="text-primary/70" />
        <h3 className="text-xs font-cinzel text-primary tracking-[0.25em]">MURAL DA CIDADELA</h3>
      </div>

      {feed.length === 0 ? (
        <p className="text-xs text-muted-foreground/70 italic py-3 text-center">
          A Torre está quieta. Os acontecimentos aparecerão aqui.
        </p>
      ) : (
        <ul className="space-y-2">
          {feed.slice(0, 7).map(ac => {
            const v = visualDe(ac.tipo);
            return (
              <li key={ac.id} className={`flex items-start gap-2.5 border-l-2 ${v.borda} pl-2.5 py-0.5`}>
                <v.Icon size={13} className={`${v.cor} mt-0.5 shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-white/75 leading-snug">{ac.mensagem}</p>
                  <span className="text-[10px] text-muted-foreground/60">Dia {ac.dia}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
