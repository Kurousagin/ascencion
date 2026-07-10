import { Eye, Building2, Landmark, Users, Handshake } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  // Contagem de pendências por aba (ex.: { alianca: 2 } = 2 itens não vistos
  // na caixa de aliança). Ausente ou 0 = sem badge.
  badges?: Partial<Record<string, number>>;
}

// 5 destinos (teto confortável para thumb reach em mobile). LOG vive dentro de
// OBS e GUERRA dentro de ALIANÇA, via sub-abas no App — o currentTab recebido
// aqui já vem agrupado (log→obs, guerra→alianca).
const tabs = [
  { id: 'obs',      label: 'OBS',      icon: Eye },
  { id: 'torre',    label: 'TORRE',    icon: Building2 },
  { id: 'cidadela', label: 'CIDADELA', icon: Landmark },
  { id: 'povo',     label: 'POVO',     icon: Users },
  { id: 'alianca',  label: 'ALIANÇA',  icon: Handshake },
];

export function BottomNav({ currentTab, onTabChange, badges }: BottomNavProps) {
  return (
    <nav
      className="
        bg-[#0D1117]
        border-t border-[rgba(212,175,55,0.3)]
        shadow-[0_-4px_20px_rgba(0,0,0,0.6)]
        flex
        px-1
      "
      style={{
        /* max() ensures at least 20px even when env() returns 0 (e.g. inside iframe preview).
           On iPhone with home indicator this resolves to ~34px. */
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
      }}
    >
      {tabs.map(t => {
        const Icon = t.icon;
        const active = currentTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            /* min 48px touch target for iOS HIG */
            className="
              flex-1 flex flex-col items-center justify-center
              min-h-[56px] pt-3 pb-2
              relative
              transition-transform active:scale-95
              touch-manipulation
              cursor-pointer
            "
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
            )}
            <span className="relative">
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                className={`mb-[3px] transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}
              />
              {!!badges?.[t.id] && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center border border-background animate-pulse-atencao leading-none">
                  {badges[t.id]! > 9 ? '9+' : badges[t.id]}
                </span>
              )}
            </span>
            <span className={`text-xs font-bold tracking-widest leading-none transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
