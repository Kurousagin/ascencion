import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { AllianceProvider, useAlliance } from './context/AllianceContext';
import { WarProvider } from './context/WarContext';
import { BottomNav } from './components/layout/BottomNav';
import { TitleScreen } from './pages/TitleScreen';
import { Dashboard } from './pages/Dashboard';
import { Tower } from './pages/Tower';
import { Citadel } from './pages/Citadel';
import { People } from './pages/People';
import { Alliance } from './pages/Alliance';
import { War } from './pages/War';
import { LogScreen } from './pages/LogScreen';
import { GameOverScreen } from './pages/GameOver';
import { Onboarding } from './components/Onboarding';
import { CamaraDescobertaModal } from './components/CamaraDescobertaModal';
import { ResultadoCamaraModal } from './components/ResultadoCamaraModal';
import { GachaLancamento } from './components/GachaLancamento';
import { PioneerPessoal, T2GlobalBanner } from './components/PioneerBanner';
import { usePioneer } from './hooks/usePioneer';
import { useNotificationsHeartbeat } from './hooks/useNotificationsHeartbeat';
import { useTier2EventUpdate } from './hooks/useTier2EventUpdate';
import { ONBOARDING_KEY, ONBOARDING_PENDING, GACHA_LANCAMENTO_PENDING, GACHA_LANCAMENTO_DONE, GACHA_LANCAMENTO_RESULT, GACHA_T2_PENDING, GACHA_T2_DONE, GACHA_T2_RESULT } from './lib/onboarding-keys';
import { LANCAMENTO_ATIVO, LANCAMENTO_T2 } from './lib/lancamento';
import { AnimatePresence, motion } from 'framer-motion';

function GuerraPendenteAlert({ onGoToWar }: { onGoToWar: () => void }) {
  const { state } = useGame();
  const gp = state?.guerraPendente;
  if (!gp) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-destructive/15 border-b border-destructive/50 text-[12px] animate-pulse">
      <span className="text-destructive font-bold tracking-wide flex items-center gap-1.5 min-w-0">
        ⚔ INVASÃO: <span className="font-normal truncate">{gp.rival.nome}</span>
        <span className="text-destructive/70 font-normal shrink-0">— {gp.prazoResposta} dia{gp.prazoResposta !== 1 ? 's' : ''} para responder</span>
      </span>
      <button
        onClick={onGoToWar}
        className="shrink-0 px-2 py-1 bg-destructive text-destructive-foreground rounded-sm font-bold tracking-widest touch-manipulation text-[12px]"
      >
        DEFENDER
      </button>
    </div>
  );
}

// ─── Conteúdo interno: acessa GameContext + AllianceContext ──────────────────
// AllianceProvider é subido para envolver também TitleScreen e GameOverScreen,
// permitindo que dissolveAll() seja chamado antes de startNewGame().
function MainGameInner() {
  const { state } = useGame();
  const { caixa } = useAlliance();
  const [tab, setTab] = useState('obs');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [gachaOpen, setGachaOpen] = useState(false);
  const [gachaT2Open, setGachaT2Open] = useState(false);

  const andarAtual = state?.andarAtual ?? 0;
  const pioneer = usePioneer(andarAtual);

  // Push notifications hooks
  useNotificationsHeartbeat();
  useTier2EventUpdate();

  // Rede de segurança: ao ENTRAR no jogo (state null→não-nulo), garante que
  // nenhum lock de modal do Radix ficou preso no <body>. Se um Dialog for
  // desmontado abruptamente (ex.: carregar cidadela de teste desmonta a
  // TitleScreen com o Dialog ainda aberto), o Radix pode deixar o <body> com
  // `pointer-events: none` + `data-scroll-locked` — a UI renderiza mas nenhum
  // clique funciona. Como nenhum Dialog está aberto ao entrar no jogo, limpar
  // aqui é sempre seguro.
  const emJogo = state !== null;
  useEffect(() => {
    if (!emJogo) return;
    document.body.style.pointerEvents = '';
    document.body.removeAttribute('data-scroll-locked');
  }, [emJogo]);

  // Quando o jogo inicia (state null→não-nulo), verifica sinais de pending/recovery.
  useEffect(() => {
    if (!state) return;
    // 1. Gacha first-launch (sessionStorage signal)
    if (sessionStorage.getItem(GACHA_LANCAMENTO_PENDING)) {
      sessionStorage.removeItem(GACHA_LANCAMENTO_PENDING);
      setGachaOpen(true);
      return;
    }
    // 2. Recovery após refresh mid-ritual: resultado persiste em localStorage mas DONE ausente
    if (
      LANCAMENTO_ATIVO &&
      !localStorage.getItem(GACHA_LANCAMENTO_DONE) &&
      localStorage.getItem(GACHA_LANCAMENTO_RESULT)
    ) {
      setGachaOpen(true);
      return;
    }
    // 3. T2 Gacha: quando 10 pioneers completam andar 20, libera andar 21+
    if (sessionStorage.getItem(GACHA_T2_PENDING)) {
      sessionStorage.removeItem(GACHA_T2_PENDING);
      setGachaOpen(true);
      return;
    }
    // 4. Recovery T2: resultado persiste mas DONE ausente
    if (
      LANCAMENTO_T2 &&
      !localStorage.getItem(GACHA_T2_DONE) &&
      localStorage.getItem(GACHA_T2_RESULT)
    ) {
      setGachaOpen(true);
      return;
    }
    // 5. Onboarding
    if (sessionStorage.getItem(ONBOARDING_PENDING)) {
      sessionStorage.removeItem(ONBOARDING_PENDING);
      setOnboardingOpen(true);
    }
  }, [state]);

  // Monitor T2 unlock: quando milestone é atingido globalmente, dispara gacha
  useEffect(() => {
    const t2Desbloqueado = pioneer.status?.desbloqueado ?? false;
    if (!t2Desbloqueado) return;
    if (!LANCAMENTO_T2) return;
    if (localStorage.getItem(GACHA_T2_DONE)) return; // já fez gacha de T2

    // Dispara gacha T2
    localStorage.removeItem(GACHA_T2_DONE);
    localStorage.removeItem(GACHA_T2_RESULT);
    sessionStorage.setItem(GACHA_T2_PENDING, '1');
    setGachaT2Open(true);
  }, [pioneer.status?.desbloqueado]);

  if (!state) return <TitleScreen />;
  if (state.gameOver || state.vitoria) return <GameOverScreen />;

  // Notificação pessoal: player está entre os top 10 e ainda não viu
  const t2Desbloqueado = pioneer.status?.desbloqueado ?? false;
  const mostrarPessoal = pioneer.foiTop10 && !pioneer.notificacaoVista;
  // Banner global: T2 desbloqueado e ainda não foi dispensado
  const mostrarT2Banner = t2Desbloqueado && !pioneer.bannerVisto;

  return (
    <>
    <WarProvider>
      <div
        className="relative w-full h-dvh max-w-lg mx-auto bg-background border-x border-border shadow-2xl flex flex-col"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <GuerraPendenteAlert onGoToWar={() => setTab('guerra')} />

        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {tab === 'obs'      && <Dashboard t2Desbloqueado={t2Desbloqueado} />}
              {tab === 'torre'    && <Tower t2Desbloqueado={t2Desbloqueado} pioneerPosicao={pioneer.posicao} pioneersTotal={pioneer.status?.total ?? 0} />}
              {tab === 'cidadela' && <Citadel />}
              {tab === 'povo'     && <People />}
              {tab === 'alianca'  && <Alliance />}
              {tab === 'guerra'   && <War />}
              {tab === 'log'      && <LogScreen />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-50 flex-shrink-0">
          <BottomNav currentTab={tab} onTabChange={setTab} badges={{ alianca: caixa.length }} />
        </div>
      </div>
    </WarProvider>

    {/* Câmaras secretas: evento de descoberta + resultado da exploração (globais) */}
    <CamaraDescobertaModal />
    <ResultadoCamaraModal />

    {/* Gacha de lançamento T1 — abre ao iniciar novo jogo na temporada ativa */}
    {LANCAMENTO_ATIVO && (
      <GachaLancamento
        open={gachaOpen}
        lancamento={LANCAMENTO_ATIVO}
        tipo="T1"
        onClose={() => {
          setGachaOpen(false);
          if (sessionStorage.getItem(ONBOARDING_PENDING)) {
            sessionStorage.removeItem(ONBOARDING_PENDING);
            setOnboardingOpen(true);
          }
        }}
      />
    )}

    {/* Gacha de lançamento T2 — abre quando 10 pioneers completam andar 20 */}
    {LANCAMENTO_T2 && (
      <GachaLancamento
        open={gachaT2Open}
        lancamento={LANCAMENTO_T2}
        tipo="T2"
        onClose={() => {
          setGachaT2Open(false);
        }}
      />
    )}

    {/* Onboarding — tutorial da primeira vez */}
    <Onboarding
      open={onboardingOpen}
      onClose={() => {
        localStorage.setItem(ONBOARDING_KEY, '1');
        setOnboardingOpen(false);
      }}
    />

    {/* Notificação pessoal: player entre os top 10 pioneers */}
    {mostrarPessoal && pioneer.posicao !== null && (
      <PioneerPessoal
        posicao={pioneer.posicao}
        visible={mostrarPessoal}
        onDismiss={pioneer.dispensarNotificacao}
      />
    )}

    {/* Banner global: T2 desbloqueado */}
    <T2GlobalBanner
      nomes={pioneer.status?.nomes ?? []}
      visible={mostrarT2Banner}
      onDismiss={pioneer.dispensarBanner}
    />
    </>
  );
}

function MainGameArea() {
  return (
    <AllianceProvider>
      <MainGameInner />
    </AllianceProvider>
  );
}

function App() {
  return (
    <GameProvider>
      <div className="min-h-dvh bg-[#050508] flex justify-center text-foreground font-sans">
        <MainGameArea />
      </div>
    </GameProvider>
  );
}

export default App;
