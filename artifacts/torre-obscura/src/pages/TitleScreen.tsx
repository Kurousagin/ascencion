import { useState, useEffect } from 'react';
import { HelpCircle, Code } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useAlliance } from '../context/AllianceContext';
import { Onboarding } from '../components/Onboarding';
import { LancamentoModal } from '../components/LancamentoModal';
import { LANCAMENTO_ATIVO } from '../lib/lancamento';
import { ONBOARDING_KEY, ONBOARDING_PENDING, GACHA_LANCAMENTO_DONE, GACHA_LANCAMENTO_PENDING, GACHA_LANCAMENTO_RESULT } from '../lib/onboarding-keys';
import { getTestSave, isValidTestCode } from '../lib/test-saves';

export function TitleScreen() {
  const { hasSave, startNewGame, startTestGame, continueGame } = useGame();
  const { dissolveAll } = useAlliance();

  const [lancamentoOpen, setLancamentoOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [confirmPendente, setConfirmPendente] = useState<'novo' | null>(null);
  const [testCodeOpen, setTestCodeOpen] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testError, setTestError] = useState('');

  // Atalho de teclado: Ctrl+Shift+T abre dialog de teste (funciona em dev e prod)
  // Easter egg seguro — assumimos que apenas devs conhecem este atalho
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setTestCodeOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  let saveDay = 0;
  let saveVivos = 0;
  if (hasSave) {
    try {
      const saved = localStorage.getItem('torre_obscura_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        saveDay = parsed.dia;
        saveVivos = parsed.npcs.filter((n: any) => n.vivo).length;
      }
    } catch(e) {}
  }

  // Sinaliza ao MainGameArea para abrir o onboarding após o jogo montar
  const agendarOnboarding = () => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      sessionStorage.setItem(ONBOARDING_PENDING, '1');
    }
  };

  // Sinaliza ao MainGameArea para abrir o gacha de lançamento após o jogo montar.
  // Limpa DONE/RESULT de saves anteriores — cada novo jogo recebe o gacha.
  const agendarGacha = () => {
    localStorage.removeItem(GACHA_LANCAMENTO_DONE);
    localStorage.removeItem(GACHA_LANCAMENTO_RESULT);
    sessionStorage.setItem(GACHA_LANCAMENTO_PENDING, '1');
  };

  const executarNovoJogo = async () => {
    await dissolveAll();
    if (LANCAMENTO_ATIVO) {
      setLancamentoOpen(true);
    } else {
      agendarOnboarding();
      startNewGame();
    }
  };

  const handleNovoJogo = async () => {
    if (hasSave) {
      setConfirmPendente('novo');
    } else {
      await executarNovoJogo();
    }
  };

  // Chamado ao clicar "REALIZAR O RITUAL E INICIAR" no LancamentoModal
  const handleIniciarRitual = async () => {
    await dissolveAll();
    agendarGacha();
    agendarOnboarding();
    startNewGame(LANCAMENTO_ATIVO!);
  };

  // Carrega cidadela de teste
  const handleLoadTestGame = async () => {
    const code = testCode.trim().toUpperCase();
    if (!isValidTestCode(code)) {
      setTestError('Código inválido. Tente: TEST123, FULL ou T2');
      return;
    }
    const testSave = getTestSave(code);
    if (!testSave) {
      setTestError('Não foi possível carregar cidadela de teste');
      return;
    }
    await dissolveAll();
    // IMPORTANTE: fecha o dialog ANTES de carregar o jogo. Carregar o jogo
    // desmonta a TitleScreen (e com ela o Dialog do Radix). Se o Dialog ainda
    // estiver `open` nesse instante, o Radix não roda o cleanup do modal e o
    // <body> fica preso com `pointer-events: none` + `data-scroll-locked` —
    // o jogo renderiza mas nada é clicável (a "lupa" não abre). Fechando aqui,
    // o Radix restaura o <body> com a TitleScreen ainda montada; só então,
    // no próximo tick, montamos o jogo.
    setTestCodeOpen(false);
    setTestCode('');
    setTestError('');
    setTimeout(() => startTestGame(testSave), 0);
  };

  return (
    <>
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="z-10 flex flex-col items-center text-center space-y-12 w-full max-w-sm">

          {/* Título */}
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 w-3/4">
              <div className="h-[1px] bg-gradient-to-r from-transparent to-primary/50 flex-1" />
              <div className="w-1.5 h-1.5 rotate-45 bg-primary/80" />
              <div className="h-[1px] bg-gradient-to-l from-transparent to-primary/50 flex-1" />
            </div>

            <h1 className="text-5xl md:text-6xl font-cinzel font-bold tracking-[0.2em] text-primary drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)] mb-6">
              TORRE OBSCURA
            </h1>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent glow-gold mb-6" />

            {LANCAMENTO_ATIVO && (
              <div className="flex items-center gap-2 px-3 py-1 border border-primary/40 bg-primary/5 rounded-sm mb-3">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] text-primary tracking-[0.25em] font-cinzel">
                  {LANCAMENTO_ATIVO.titulo}
                </span>
              </div>
            )}

            <p className="text-secondary font-inter text-sm tracking-[0.3em] uppercase">
              O OBSERVADOR AGUARDA
            </p>
          </div>

          {/* Log atmosférico */}
          <div className="text-muted text-xs leading-loose text-left border-l border-primary/30 pl-4 my-8 space-y-1 w-full max-w-[280px]">
            <p>• Conexão estabelecida.</p>
            <p>• Sinais vitais detectados.</p>
            <p>• Eles não sabem que você observa.</p>
          </div>

          {/* Botões */}
          <div className="space-y-3 w-full mt-auto">
            <button
              onClick={handleNovoJogo}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 font-cinzel font-bold text-lg tracking-[0.2em] transition-all touch-manipulation"
            >
              NOVO JOGO
            </button>

            <div className="relative w-full flex flex-col items-center">
              {hasSave && (
                <div className="absolute -top-7 px-3 py-1 bg-card border border-primary/30 rounded-full text-[10px] text-primary tracking-wider z-10 shadow-lg">
                  DIA {saveDay} • {saveVivos} SOBREVIVENTES
                </div>
              )}
              <button
                onClick={continueGame}
                disabled={!hasSave}
                className={`w-full border h-14 font-cinzel font-bold text-lg tracking-[0.2em] transition-all mt-3 touch-manipulation ${
                  hasSave
                    ? 'border-primary text-primary hover:bg-primary/10'
                    : 'border-muted text-muted cursor-not-allowed opacity-50'
                }`}
              >
                CONTINUAR
              </button>
            </div>

            <div className={`flex gap-2 ${import.meta.env.DEV ? '' : 'flex-col'}`}>
              <button
                onClick={() => setOnboardingOpen(true)}
                className={`flex items-center justify-center gap-2 h-10 border border-white/10 text-white/35 hover:text-white/60 hover:border-white/20 font-cinzel text-[11px] tracking-[0.2em] transition-all touch-manipulation ${
                  import.meta.env.DEV ? 'flex-1' : 'w-full'
                }`}
              >
                <HelpCircle size={13} /> COMO JOGAR
              </button>
              {import.meta.env.DEV && (
                <button
                  onClick={() => setTestCodeOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 h-10 border border-white/10 text-white/35 hover:text-white/60 hover:border-white/20 font-cinzel text-[11px] tracking-[0.2em] transition-all touch-manipulation"
                  title="🧪 Modo de teste (apenas em desenvolvimento)"
                >
                  <Code size={13} /> TESTE
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <Dialog.Root open={confirmPendente !== null} onOpenChange={o => { if (!o) setConfirmPendente(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/97 backdrop-blur-lg z-[70]" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[70] p-4 outline-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-sm bg-gradient-to-b from-[#1C1808] via-[#14120A] to-[#0E0D0B] border border-primary/50 rounded-sm shadow-[0_0_80px_rgba(212,175,55,0.15)] overflow-hidden"
            >
              <div className="relative px-6 pt-8 pb-5 text-center border-b border-primary/20">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
                <div className="w-1.5 h-1.5 rotate-45 bg-primary mx-auto mb-3 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                <Dialog.Title className="font-cinzel font-bold text-primary tracking-[0.2em] text-sm leading-tight mb-4">
                  APAGAR CIDADELA ATUAL?
                </Dialog.Title>
                <p className="text-[11px] text-secondary/80 leading-relaxed">
                  Dia {saveDay} • {saveVivos} sobreviventes serão perdidos para sempre. O Observador não sustenta duas realidades ao mesmo tempo.
                </p>
              </div>
              <div className="flex gap-2 p-5">
                <button
                  onClick={() => setConfirmPendente(null)}
                  className="flex-1 px-4 py-3 border border-primary/30 text-primary hover:bg-primary/5 text-xs font-cinzel tracking-wider transition-colors"
                >
                  CONTINUAR
                </button>
                <button
                  onClick={async () => {
                    setConfirmPendente(null);
                    await executarNovoJogo();
                  }}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-cinzel tracking-wider transition-colors"
                >
                  DESCARTAR E RECOMEÇAR
                </button>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {LANCAMENTO_ATIVO && (
        <LancamentoModal
          open={lancamentoOpen}
          lancamento={LANCAMENTO_ATIVO}
          onIniciarRitual={handleIniciarRitual}
          onClose={() => setLancamentoOpen(false)}
        />
      )}

      <Onboarding
        open={onboardingOpen}
        onClose={() => {
          localStorage.setItem(ONBOARDING_KEY, '1');
          setOnboardingOpen(false);
        }}
      />

      {/* Dialog de código de teste */}
      <Dialog.Root open={testCodeOpen} onOpenChange={setTestCodeOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/97 backdrop-blur-lg z-[70]" />
          <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[70] p-4 outline-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-primary/30 rounded-sm max-w-sm w-full p-6 space-y-4"
            >
              <Dialog.Title className="text-sm font-cinzel tracking-[0.2em] text-primary flex items-center gap-2">
                <Code size={16} /> MODO DE TESTE
              </Dialog.Title>
              <p className="text-[11px] text-secondary/80 leading-relaxed">
                Insira um código para carregar uma cidadela pré-populada com recursos e features ativas para teste.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-secondary/70 font-cinzel tracking-wider">CÓDIGO</label>
                  <input
                    type="text"
                    placeholder="Ex: TEST123, FULL, T2"
                    value={testCode}
                    onChange={(e) => {
                      setTestCode(e.target.value);
                      setTestError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLoadTestGame();
                    }}
                    className="w-full mt-1 px-3 py-2 bg-background border border-primary/30 text-primary placeholder:text-primary/30 font-mono text-sm focus:outline-none focus:border-primary/60 transition-colors"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5 text-[9px] text-secondary/60 bg-background/50 border border-primary/20 rounded-sm p-3">
                  <p><strong>TEST123</strong> — Cidadela básica (Andar 5, recursos moderados)</p>
                  <p><strong>FULL</strong> — Cidadela completa (Andar 20, todos edifícios L3, muito recursos)</p>
                  <p><strong>T2</strong> — Cidadela T2 (Andar 30, fragmentos T1+T2, relíquias T2)</p>
                </div>

                {testError && (
                  <p className="text-[10px] text-destructive font-medium">{testError}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setTestCodeOpen(false);
                    setTestCode('');
                    setTestError('');
                  }}
                  className="flex-1 px-4 py-3 border border-primary/30 text-primary hover:bg-primary/5 text-xs font-cinzel tracking-wider transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleLoadTestGame}
                  disabled={!testCode.trim()}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-xs font-cinzel tracking-wider transition-colors"
                >
                  CARREGAR
                </button>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
