import { Shield, Activity, Users, TowerControl, AlignLeft } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'obs', label: 'OBS', icon: Activity },
    { id: 'torre', label: 'TORRE', icon: TowerControl },
    { id: 'cidadela', label: 'CIDADELA', icon: Shield },
    { id: 'povo', label: 'POVO', icon: Users },
    { id: 'log', label: 'LOG', icon: AlignLeft },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around h-16 items-center z-50 px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] tracking-wider font-bold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
