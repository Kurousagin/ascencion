import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronRight, Compass } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { FLOORS, BIOMA_META, HABITANTES } from '../lib/game-data';
import { verificarQuestAndar } from '../quest-engine';
import { camarasDaTorre } from '../floor-engine';
import { climaDoDia } from '../lib/clima';
import { descricaoVivaDoAndar } from '../lib/lugar';
import { nivelFolego, multCadeia } from '../lib/folego';
import { estacaoDoDia, multEstacao } from '../lib/estacao';
import { eventoDoDia, multEventoParaAndar } from '../lib/eventos-andar';

// ─── ATLAS DA TORRE — a ficha de cada andar conquistado ──────────────────────
// Cada andar é um lugar com história própria: bioma, o tempo de hoje, quem o
// habita, o que ele rende, o que esconde — e quem ficou para trás nele.
// Todos os dados já vivem no save; o Atlas só os torna visíveis.

interface Props {
  floor: number | null;
  onClose: () => void;
  // Ações do andar (a ficha é o hub): explorar, falar com o habitante,
  // investigar uma câmara. A ficha fecha antes de abrir o fluxo seguinte.
  onExplorar?: (floor: number) => void;
  onHabitante?: (floor: number) => void;
  onCamara?: (camaraId: string) => void;
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] text-secondary tracking-[0.2em] block">{titulo}</span>
      {children}
    </div>
  );
}

export function AtlasAndar({ floor, onClose, onExplorar, onHabitante, onCamara }: Props) {
  const { state } = useGame();
  if (floor === null || !state) return null;
  const f = FLOORS[floor - 1];
  if (!f) return null;

  const bioma = BIOMA_META[f.bioma];
  const clima = climaDoDia(state.camaraSeed ?? 0, state.dia)[f.bioma];
  const estacao = estacaoDoDia(state.dia);
  const estacaoMult = multEstacao(estacao, f.bioma);
  const evento = eventoDoDia(state.camaraSeed ?? 0, state.dia);
  const eventoMult = multEventoParaAndar(evento, floor);
  const folego = nivelFolego(state, floor);
  const cadeiaAtiva = multCadeia(state, floor, f.bioma) > 1;
  const conquistadoDia = state.andarConquistadoDia?.[floor];
  const mortes = state.totalMortesAndar?.[floor] ?? 0;
  const memoriais = state.memoriais?.[floor] ?? [];
  const farms = state.farmsPerFloor?.[floor] ?? 0;
  const habData = HABITANTES[floor];
  const habEst = state.habitantesEstado[floor];
  const ecoAtivo = state.ecos.includes(floor);
  const bossEcoAtivo = f.isBoss && state.ecosCapitulo.includes(f.tier);

  const camaras = Object.entries(camarasDaTorre(state)).filter(([, c]) => c.floor === floor);
  const estadoDe = (id: string) => state.camarasSecretasEstado?.[id];
  const encontradas = camaras.filter(([id]) => estadoDe(id)?.encontrada);
  const comPista = camaras.filter(([id]) => estadoDe(id)?.descoberta && !estadoDe(id)?.encontrada);
  const ocultas = camaras.length - encontradas.length - comPista.length;

  const habEstLabel =
    habEst === 'concluido' ? 'em paz com a cidadela' :
    habEst === 'quest_ativa' || habEst === 'aguardando_escolha' ? 'aguarda o que pediu' :
    habEst === 'descoberto' ? 'aguarda contato' : 'ainda não se mostrou';
  const habInterativo = !!(habData && habEst && habEst !== 'oculto' && onHabitante);
  const habCompletavel = !!(habData && verificarQuestAndar(state, floor));

  return (
    <Dialog.Root open onOpenChange={o => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/92 backdrop-blur-sm z-[70]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md max-h-[82dvh] z-[70] outline-none">
          <div className="bg-gradient-to-b from-[#1A1F2E] to-[#111520] border border-primary/30 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[82dvh]">

            {/* Cabeçalho do lugar */}
            <div className="px-5 pt-5 pb-4 border-b border-primary/20 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-secondary tracking-[0.25em] block mb-1">
                    ATLAS DA TORRE · ANDAR {floor}{f.isBoss ? ' · GUARDIÃO' : ''}
                  </span>
                  <Dialog.Title className="font-cinzel font-bold text-primary tracking-widest text-lg leading-tight">
                    {f.isBoss ? '💀' : bioma.icone} {f.nome}
                  </Dialog.Title>
                  <span className="text-xs text-white/45 tracking-wider">
                    {bioma.label} · {f.tierName} · {bioma.dica}
                  </span>
                </div>
                <Dialog.Close asChild>
                  <button className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 touch-manipulation shrink-0" aria-label="Fechar">
                    <X size={16} />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto custom-scrollbar">

              {/* Descrição viva: o estado atual deste lugar, moldado pelo que
                  o jogador fez (e perdeu) nele */}
              <p className="text-xs text-white/60 italic leading-relaxed border-l-2 border-primary/30 pl-3">
                {descricaoVivaDoAndar(state, floor)}
              </p>

              {/* O tempo de hoje neste bioma */}
              <Secao titulo="HOJE">
                <p className="text-xs text-white/70">
                  {clima.icone} <span className="font-cinzel font-bold">{clima.nome}</span>
                  {clima.estado !== 'neutro' && (
                    <span className={clima.estado === 'favoravel' ? 'text-success' : 'text-warning'}>
                      {' '}({clima.estado === 'favoravel' ? '+10%' : '−10%'} saque)
                    </span>
                  )}
                </p>
                <p className="text-xs text-white/40 italic leading-snug">{clima.descricao}</p>
                {estacaoMult !== 1 && (
                  <p className="text-xs text-white/55">
                    {estacao.icone} {estacao.nome}
                    <span className={estacaoMult > 1 ? 'text-success' : 'text-warning'}> ({estacaoMult > 1 ? '+8%' : '−8%'} para {bioma.label.toLowerCase()}s)</span>
                  </p>
                )}
                {eventoMult !== 1 && evento && (
                  <p className="text-xs text-white/55">
                    {evento.icone} {evento.nome}
                    <span className={eventoMult > 1 ? 'text-success' : 'text-warning'}> ({eventoMult > 1 ? '+15%' : '−15%'} de saque aqui hoje)</span>
                  </p>
                )}
                {folego !== 'pleno' && (
                  <p className="text-xs text-warning/90">
                    {folego === 'exausto'
                      ? 'O andar precisa respirar — rendendo 70% até descansar.'
                      : 'O andar está cansado — rendendo 85%.'}
                  </p>
                )}
                {cadeiaAtiva && (
                  <p className="text-xs text-success/80">
                    A caça de outro lugar do bioma migrou para cá (+10% de saque).
                  </p>
                )}
              </Secao>

              {/* História local */}
              <Secao titulo="HISTÓRIA DESTE LUGAR">
                <div className="text-xs text-white/65 space-y-1">
                  <p>Conquistado {conquistadoDia != null ? `no dia ${conquistadoDia}` : 'em dias que o registro não guardou'}.</p>
                  <p>
                    {farms > 0 ? `${farms} exploração${farms > 1 ? 'ões' : ''} desde então.` : 'Nenhuma exploração desde a conquista.'}
                    {mortes > 0 ? ` ${mortes} dos seus ${mortes > 1 ? 'caíram' : 'caiu'} aqui.` : ' Nenhuma vida ficou para trás aqui.'}
                  </p>
                </div>
                {memoriais.length > 0 && (
                  <div className="mt-1 border-l-2 border-destructive/40 pl-2.5 space-y-0.5">
                    {memoriais.map((m, i) => (
                      <p key={i} className="text-xs text-white/50 truncate">✝ {m.nome} — dia {m.dia}</p>
                    ))}
                    {mortes > memoriais.length && (
                      <p className="text-xs text-white/35 italic">
                        …e mais {mortes - memoriais.length} cujo{mortes - memoriais.length > 1 ? 's nomes' : ' nome'} a Torre guardou consigo.
                      </p>
                    )}
                  </div>
                )}
              </Secao>

              {/* Habitante e ecos — a linha do habitante É a porta para falar com ele */}
              {(habData || bossEcoAtivo) && (
                <Secao titulo="PRESENÇAS">
                  {habData && (
                    habInterativo ? (
                      <button
                        onClick={() => { onClose(); onHabitante!(floor); }}
                        className={`w-full flex items-center justify-between gap-2 text-left px-2.5 py-2 rounded-sm border transition-all touch-manipulation ${
                          habCompletavel
                            ? 'border-success/50 bg-success/5'
                            : 'border-primary/20 bg-black/20 hover:border-primary/40'
                        }`}
                      >
                        <span className="text-xs text-white/70 min-w-0">
                          ✦ <span className="font-bold">{habData.nome}</span>
                          <span className="text-white/40"> — {habEstLabel}</span>
                          {habCompletavel && <span className="text-success font-bold"> · pronto para concluir</span>}
                          {ecoAtivo && <span className="text-success"> · eco +{habData.quest.ecoBonus}%</span>}
                        </span>
                        <ChevronRight size={14} className={`shrink-0 ${habCompletavel ? 'text-success' : 'text-primary/50'}`} />
                      </button>
                    ) : (
                      <p className="text-xs text-white/65">
                        ✦ <span className="font-bold">{habData.nome}</span>
                        <span className="text-white/40"> ({habData.papel})</span> — {habEstLabel}.
                        {ecoAtivo && <span className="text-success"> Eco ativo: +{habData.quest.ecoBonus}% de saque.</span>}
                      </p>
                    )
                  )}
                  {bossEcoAtivo && (
                    <p className="text-xs text-white/65">💀 O Guardião caiu. O Eco do Capítulo {f.tier} ressoa nestes andares.</p>
                  )}
                </Secao>
              )}

              {/* Câmaras secretas deste andar */}
              {camaras.length > 0 && (
                <Secao titulo="O QUE ESTE ANDAR ESCONDE">
                  {encontradas.map(([id, c]) => (
                    <p key={id} className="text-xs text-white/65">🚪 <span className="font-bold">{c.titulo}</span> — explorada.</p>
                  ))}
                  {comPista.map(([id, c]) => {
                    const est = estadoDe(id);
                    const esgotada = (est?.tentativas ?? 0) >= c.maxTentativas;
                    return (
                      <div key={id} className="text-xs text-white/65 space-y-1">
                        <p>🔍 <span className="font-bold">{c.titulo}</span> — pista encontrada:</p>
                        <p className="text-white/40 italic pl-4">{c.requisito.textoRequisito}</p>
                        {esgotada ? (
                          <p className="text-white/35 pl-4">As incursões se esgotaram. Ela guarda seus segredos.</p>
                        ) : onCamara && (
                          <button
                            onClick={() => { onClose(); onCamara(id); }}
                            className="ml-4 px-3 py-1.5 border border-secondary/50 text-secondary text-[12px] font-cinzel font-bold tracking-widest rounded-sm hover:bg-secondary/10 active:scale-95 transition-all touch-manipulation"
                          >
                            INVESTIGAR ({c.maxTentativas - (est?.tentativas ?? 0)} restantes)
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {ocultas > 0 && (
                    <p className="text-xs text-white/40 italic">
                      {ocultas === 1 ? 'Há rumores de algo que ainda não se revelou.' : `Há rumores de ${ocultas} segredos que ainda não se revelaram.`}
                    </p>
                  )}
                </Secao>
              )}

            </div>

            {/* Ação principal: explorar este território */}
            {onExplorar && (
              <div className="px-5 py-4 border-t border-primary/20 shrink-0">
                <button
                  onClick={() => { onClose(); onExplorar(floor); }}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-cinzel font-bold tracking-[0.2em] text-sm rounded-sm shadow-[0_0_12px_rgba(212,175,55,0.25)] active:scale-[0.99] transition-all touch-manipulation"
                >
                  <Compass size={16} /> EXPLORAR ESTE ANDAR
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
