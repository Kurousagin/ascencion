import { Eye, Building2, Landmark, Users, ScrollText } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'obs', label: 'OBS', icon: Eye },
    { id: 'torre', label: 'TORRE', icon: Building2 },
    { id: 'cidadela', label: 'CIDADELA', icon: Landmark },
    { id: 'povo', label: 'POVO', icon: Users },
    { id: 'log', label: 'LOG', icon: ScrollText },
  ];

  return (
    <div className="bg-[#0D1117] border-t border-[rgba(212,175,55,0.3)] z-50 min-h-[64px] pb-2 flex px-2 relative font-inter shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center pt-3 pb-1 relative transition-transform active:scale-95"
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
            )}
            <Icon 
              size={22} 
              className={`mb-1.5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} 
            />
            <span className={`text-[9px] font-bold tracking-widest ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
