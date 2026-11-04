import React from 'react';
import { 
  PhoneCall, Bot, ShieldCheck, Bell, Sparkles, 
  CheckCircle2, Radio, User 
} from 'lucide-react';
import { DashboardStats } from '../types';

interface HeaderProps {
  stats: DashboardStats;
  isAiActive: boolean;
  onToggleAi: () => void;
  onOpenSimulator: () => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  isAiActive,
  onToggleAi,
  onOpenSimulator,
  onNavigate
}) => {
  return (
    <header className="h-16 px-6 bg-[#0B1020]/80 backdrop-blur-md border-b border-[#1E293B] flex items-center justify-between sticky top-0 z-30">
      
      {/* Left: Tagline & Quick Status */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-slate-300 block">
            "Your Personal AI. Your Calls. Your Control."
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Forwarding from Airtel (+91 98400 00000) • 25s Timeout
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* AI Availability Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#1E293B]">
          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isAiActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            YAZHI AI: {isAiActive ? 'Active' : 'Standby'}
          </span>
          <button
            onClick={onToggleAi}
            className={`w-8 h-4 rounded-full transition-colors relative flex items-center ${
              isAiActive ? 'bg-[#477BFF]' : 'bg-slate-700'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
              isAiActive ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Simulate Call Button */}
        <button
          onClick={onOpenSimulator}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#477BFF] to-[#3b6ee0] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#477BFF]/20 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Simulate Call</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => onNavigate('notifications')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#151B2B] transition-colors relative"
          title="Telegram Notification Logs"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#477BFF]" />
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1E293B]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#477BFF] to-[#93c5fd] text-white flex items-center justify-center font-bold text-xs shadow-md">
            S
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-bold text-white block leading-none">Sakthi</span>
            <span className="text-[10px] text-slate-400 block leading-none mt-1">Owner</span>
          </div>
        </div>

      </div>

    </header>
  );
};
