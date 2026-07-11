import { climaDoDia, type ClimaDoBioma } from '../lib/clima';
import { estacaoDoDia } from '../lib/estacao';
import { eventoDoDia, eventoVisivel } from '../lib/eventos-andar';
import { BIOMA_META, type BiomaTipo } from '../lib/game-data';

// ─── O tempo da Torre — como ela amanheceu hoje ───────────────────────────────
// Boletim do dia: a estação (respiração longa), o evento do dia (se visível) e
// os biomas que se agitaram. Tudo determinístico por (seed, dia) — sem estado.

export function ClimaBanner({ seed, dia, andarAtual }: { seed: number; dia: number; andarAtual: number }) {
  const climas = climaDoDia(seed, dia);
  const estacao = estacaoDoDia(dia);
  const evento = eventoDoDia(seed, dia);
  const mostrarEvento = eventoVisivel(evento, andarAtual);
  const ativos = (Object.entries(climas) as [BiomaTipo, ClimaDoBioma][])
    .filter(([, c]) => c.estado !== 'neutro');

  return (
    <div className="rounded-sm border border-primary/20 bg-[#12161F] px-3 py-2 space-y-1.5">
      <span className="text-[10px] text-secondary tracking-[0.2em] block">O TEMPO DA TORRE</span>

      {/* Estação: a respiração longa (ciclo de 30 dias) */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-white/75 min-w-0 truncate">
          {estacao.icone} <span className="font-cinzel font-bold">{estacao.nome}</span>
          <span className="text-white/40"> · dia {estacao.diaNoCiclo}/{estacao.duracao}</span>
        </span>
        <span className="shrink-0 text-white/45">
          {estacao.id === 'inspira' ? '+8% profundezas' : '+8% superfície'}
        </span>
      </div>

      {/* Evento do dia (só quando toca andares que o jogador já conhece) */}
      {mostrarEvento && evento && (
        <p className="text-xs text-primary/80 leading-snug">
          {evento.icone} <span className="font-cinzel font-bold">{evento.nome}</span>
          <span className="text-white/45 italic"> — {evento.texto}</span>
        </p>
      )}

      {/* Climas de bioma agitados */}
      {ativos.length === 0 ? (
        <p className="text-xs text-white/35 italic">Nenhum bioma se agita hoje.</p>
      ) : (
        ativos.map(([bioma, c]) => (
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
        ))
      )}
    </div>
  );
}
