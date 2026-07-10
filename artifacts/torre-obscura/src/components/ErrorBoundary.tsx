import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Boundary raiz: uma exceção de render em qualquer página vira esta tela em vez
// de um app branco permanente (num PWA standalone o usuário nem tem botão de
// reload). O save em localStorage não é tocado — recarregar retoma o jogo.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-dvh bg-[#050508] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-cinzel text-primary text-xl tracking-[0.2em]">ALGO DESPERTOU ONDE NÃO DEVIA</p>
        <p className="text-muted-foreground text-sm max-w-xs">
          A Torre tropeçou em si mesma. Sua cidadela está a salvo — o progresso fica guardado neste dispositivo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-6 h-12 border border-primary text-primary font-cinzel font-bold tracking-[0.2em] touch-manipulation"
        >
          RETORNAR À TORRE
        </button>
        <p className="text-[12px] text-muted-foreground/60 break-all max-w-xs">{this.state.error.message}</p>
      </div>
    );
  }
}
