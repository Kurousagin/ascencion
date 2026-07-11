// Constantes de armazenamento do onboarding — importadas por TitleScreen e App.
export const ONBOARDING_KEY     = 'torre_obscura_onboarding_visto';   // localStorage: marcado após primeira exibição
export const ONBOARDING_PENDING = 'torre_obscura_onboarding_pending'; // sessionStorage: sinal para abrir ao entrar no jogo

// Tour guiado interativo (spotlight nas telas reais) — roda uma vez, após o guia
export const TOUR_DONE = 'torre_obscura_tour_done'; // localStorage: tour concluído ou pulado

// Gacha de lançamento de temporada
export const GACHA_LANCAMENTO_DONE    = 'torre_obscura_gacha_t1_done';    // localStorage: gacha concluído com NPC adicionado (não repete)
export const GACHA_LANCAMENTO_PENDING = 'torre_obscura_gacha_t1_pending'; // sessionStorage: sinal first-launch para abrir o gacha
export const GACHA_LANCAMENTO_RESULT  = 'torre_obscura_gacha_t1_result';  // localStorage: resultado sorteado (persiste refresh mid-ritual)

// Gacha de T2 (quando 10 pioneers completam andar 20, libera andar 21+ para todos)
export const GACHA_T2_DONE    = 'torre_obscura_gacha_t2_done';    // localStorage: T2 gacha concluído com NPC primordial adicionado
export const GACHA_T2_PENDING = 'torre_obscura_gacha_t2_pending'; // sessionStorage: sinal para abrir gacha T2
export const GACHA_T2_RESULT  = 'torre_obscura_gacha_t2_result';  // localStorage: resultado sorteado T2
