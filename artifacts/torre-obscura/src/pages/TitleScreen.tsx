import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Onboarding } from '../components/Onboarding';
import { LancamentoModal } from '../components/LancamentoModal';
import { LANCAMENTO_ATIVO } from '../lib/lancamento';
import { ONBOARDING_KEY, ONBOARDING_PENDING, GACHA_LANCAMENTO_DONE, GACHA_LANCAMENTO_PENDING, GACHA_LANCAMENTO_RESULT } from '../lib/onboarding-keys';

export function TitleScreen() {
  const { hasSave, startNewGame, continueGame } = useGame();

  const [lancamentoOpen, setLancamentoOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

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

  const handleNovoJogo = () => {
    if (LANCAMENTO_ATIVO) {
      setLancamentoOpen(true);
    } else {
      agendarOnboarding();
      startNewGame();
    }
  };

  // Chamado ao clicar "REALIZAR O RITUAL E INICIAR" no LancamentoModal
  const handleIniciarRitual = () => {
    agendarGacha();
    agendarOnboarding();
    startNewGame(LANCAMENTO_ATIVO!);
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

            <button
              onClick={() => setOnboardingOpen(true)}
              className="w-full flex items-center justify-center gap-2 h-10 border border-white/10 text-white/35 hover:text-white/60 hover:border-white/20 font-cinzel text-[11px] tracking-[0.2em] transition-all touch-manipulation"
            >
              <HelpCircle size={13} /> COMO JOGAR
            </button>
          </div>

        </div>
      </div>

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
    </>
  );
}
