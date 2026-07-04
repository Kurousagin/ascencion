// Constantes de armazenamento do onboarding — importadas por TitleScreen e App.
export const ONBOARDING_KEY     = 'torre_obscura_onboarding_visto';   // localStorage: marcado após primeira exibição
export const ONBOARDING_PENDING = 'torre_obscura_onboarding_pending'; // sessionStorage: sinal para abrir ao entrar no jogo

// Gacha de lançamento de temporada
export const GACHA_LANCAMENTO_DONE    = 'torre_obscura_gacha_t1_done';    // localStorage: gacha concluído com NPC adicionado (não repete)
export const GACHA_LANCAMENTO_PENDING = 'torre_obscura_gacha_t1_pending'; // sessionStorage: sinal first-launch para abrir o gacha
export const GACHA_LANCAMENTO_RESULT  = 'torre_obscura_gacha_t1_result';  // localStorage: resultado sorteado (persiste refresh mid-ritual)
