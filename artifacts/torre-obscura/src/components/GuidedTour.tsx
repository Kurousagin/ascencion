import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

// ─── Tour guiado interativo ───────────────────────────────────────────────────
// Navega pelas abas reais do jogo e ilumina (spotlight) o elemento de cada
// funcionalidade, com um card explicativo ao lado. Os alvos são marcados nas
// páginas com atributos `data-tour="..."`. Se um alvo não renderizar (estado do
// jogo diferente), o passo é pulado automaticamente — o tour nunca trava.

interface TourStep {
  tab: string;
  selector: string;
  titulo: string;
  texto: string;
}

const STEPS: TourStep[] = [
  {
    tab: 'obs',
    selector: '[data-tour="vitais"]',
    titulo: 'Sinais vitais',
    texto: 'O coração da cidadela: o dia atual, os andares conquistados e a comida e moral dos seus. Se a comida zerar, moradores morrem; se a moral cair, alguns traem.',
  },
  {
    tab: 'obs',
    selector: '[data-tour="mural"]',
    titulo: 'Mural da Cidadela',
    texto: 'Os momentos marcantes dos seus moradores aparecem aqui. O registro completo de tudo — mortes, descobertas, traições — vive na sub-aba CRÔNICAS, logo acima.',
  },
  {
    tab: 'obs',
    selector: '[data-tour="metas"]',
    titulo: 'Metas de hoje',
    texto: 'Todo dia real, a Torre propõe 3 metas. Cumpra as três e reivindique o Presente da Torre. Elas resetam à meia-noite do mundo real.',
  },
  {
    tab: 'obs',
    selector: '[data-tour="velocidade"]',
    titulo: 'O tempo da Torre',
    texto: 'Os dias correm sozinhos — nesta velocidade. Fechar o jogo não pausa o mundo: ao voltar, a Torre lembra os dias que passaram.',
  },
  {
    tab: 'torre',
    selector: '[data-tour="expedicao"]',
    titulo: 'Expedições',
    texto: 'Monte um grupo e suba. Poder, fadiga, moral e o bioma do andar decidem o resultado. A cada 5 andares, um Chefe guarda a passagem.',
  },
  {
    tab: 'torre',
    selector: '[data-tour="codex"]',
    titulo: 'Codex Obscuro',
    texto: 'Cada conquista revela fragmentos da história. Este ícone pisca em dourado quando há algo novo — e, com os fragmentos reunidos, abre-se o Livro da temporada.',
  },
  {
    tab: 'cidadela',
    selector: '[data-tour="ritual"]',
    titulo: 'Ritual em Trindade',
    texto: 'Recrute sobreviventes: três chegam por ritual, pagos em recursos. O custo cresce com a população — e Primordiais são únicos no mundo inteiro.',
  },
  {
    tab: 'cidadela',
    selector: '[data-tour="infraestrutura"]',
    titulo: 'Infraestrutura',
    texto: 'Edifícios sustentam tudo: comida, descanso, moral, população. Fazenda e Fogueira primeiro; Alojamento antes de cada leva de recrutas.',
  },
  {
    tab: 'povo',
    selector: '[data-tour="povo"]',
    titulo: 'O seu povo',
    texto: 'Cada morador tem atributos, profissão, lealdade e fadiga. Aqui você atribui postos em edifícios e treina os melhores no Quartel e no Arquivo.',
  },
  {
    tab: 'alianca',
    selector: '[data-tour="alianca"]',
    titulo: 'Aliança & Guerra',
    texto: 'Pareie com até 3 cidadelas reais por código: envie recursos, empreste moradores, mande reforços. A GUERRA vive na sub-aba aqui em cima — invasões têm prazo para responder.',
  },
  {
    tab: 'obs',
    selector: '[data-tour="nav"]',
    titulo: 'A Torre aguarda',
    texto: 'É isso, Observador. Cinco caminhos, uma subida. Comece pela comida, suba com cuidado — e leia o que a Torre deixar escapar.',
  },
];

interface Props {
  active: boolean;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onFinish: () => void;
}

const PAD = 6; // respiro do spotlight ao redor do alvo

export function GuidedTour({ active, currentTab, onNavigate, onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const alvoRef = useRef<Element | null>(null);
  const step = STEPS[idx];

  const finish = useCallback(() => {
    setIdx(0);
    setRect(null);
    onFinish();
  }, [onFinish]);

  const next = useCallback(() => {
    if (idx >= STEPS.length - 1) finish();
    else { setRect(null); setIdx(i => i + 1); }
  }, [idx, finish]);

  // Localiza o alvo do passo atual: navega para a aba, espera o elemento
  // renderizar (pol de 100ms, até 2s), centraliza e mede. Alvo ausente = pula.
  useEffect(() => {
    if (!active || !step) return;
    let cancelado = false;
    let tentativas = 0;

    if (currentTab !== step.tab) onNavigate(step.tab);

    const procurar = () => {
      if (cancelado) return;
      const el = document.querySelector(step.selector);
      if (!el) {
        tentativas++;
        if (tentativas > 20) { next(); return; }
        setTimeout(procurar, 100);
        return;
      }
      alvoRef.current = el;
      el.scrollIntoView({ block: 'center', behavior: 'auto' });
      // espera a transição de aba (150ms) e o scroll assentarem antes de medir
      setTimeout(() => { if (!cancelado) setRect(el.getBoundingClientRect()); }, 220);
    };
    // pequeno atraso inicial para a página da aba montar
    setTimeout(procurar, 60);

    const remedir = () => {
      if (alvoRef.current) setRect(alvoRef.current.getBoundingClientRect());
    };
    window.addEventListener('resize', remedir);
    return () => {
      cancelado = true;
      window.removeEventListener('resize', remedir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, idx]);

  if (!active || !step) return null;

  // Posição do card: SEMPRE fixado na metade da tela oposta ao centro do alvo.
  // Posicionar relativo ao rect quebrava com alvos altos (ex.: seção do Ritual):
  // o card caía fora do viewport e o tour parecia travado. Fixar por cima/baixo
  // nunca sai da tela e o env() respeita Dynamic Island / home indicator.
  const vh = window.innerHeight;
  const centroAlvo = rect ? rect.top + rect.height / 2 : vh;
  const cardNoTopo = centroAlvo >= vh / 2;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-label="Tour guiado">
      {/* Spotlight: o box-shadow gigante escurece tudo menos o alvo */}
      <AnimatePresence>
        {rect && (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute rounded-md border border-primary/70 pointer-events-none"
            style={{
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              boxShadow: '0 0 0 9999px rgba(5, 5, 8, 0.84), 0 0 24px rgba(212, 175, 55, 0.35)',
            }}
          />
        )}
      </AnimatePresence>
      {/* Procurando o alvo: escurece, mas nunca sem saída — PULAR sempre à mão */}
      {!rect && (
        <div className="absolute inset-0 bg-[#050508]/84 flex items-end justify-center">
          <button
            onClick={finish}
            className="text-xs text-white/40 tracking-wider touch-manipulation min-h-[44px] px-6"
            style={{ marginBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
          >
            PULAR TOUR
          </button>
        </div>
      )}

      {/* Card do passo */}
      {rect && (
        <motion.div
          key={`card-${idx}`}
          initial={{ opacity: 0, y: cardNoTopo ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="absolute left-1/2 -translate-x-1/2 w-[92vw] max-w-sm bg-gradient-to-b from-[#1A1F2E] to-[#111520] border border-primary/40 rounded-sm shadow-2xl p-4 max-h-[45dvh] overflow-y-auto"
          style={cardNoTopo
            ? { top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }
            : { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <p className="font-cinzel font-bold text-primary tracking-widest text-sm mb-1">{step.titulo}</p>
          <p className="text-xs text-white/70 leading-relaxed">{step.texto}</p>
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={finish}
              className="text-xs text-white/35 tracking-wider touch-manipulation min-h-[40px] pr-3"
            >
              PULAR TOUR
            </button>
            <span className="text-xs text-white/25 tracking-widest">{idx + 1}/{STEPS.length}</span>
            <button
              onClick={next}
              className="flex items-center gap-1 text-xs text-primary font-cinzel font-bold tracking-wider touch-manipulation min-h-[40px] pl-3"
            >
              {idx === STEPS.length - 1 ? 'COMEÇAR' : 'PRÓXIMO'} <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
