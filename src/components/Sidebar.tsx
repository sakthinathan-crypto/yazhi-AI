import React from 'react';
import { 
  LayoutDashboard, History, Radio, Users, Bot, 
  BarChart3, Bell, Settings, Layers, ChevronLeft, 
  ChevronRight, Sparkles, ShieldCheck 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'call_history', label: 'Call History', icon: History },
    { id: 'live_calls', label: 'Live Calls', icon: Radio, badge: 'Live' },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'ai_assistant', label: 'AI Assistant', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Call Forwarding', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Layers },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0B1020] border-r border-[#1E293B] flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#477BFF] to-[#60a5fa] flex items-center justify-center text-white shadow-lg shadow-[#477BFF]/30 font-black text-lg">
                Y
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-wider block">YAZHI</span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-mono">Personal AI Assistant</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#477BFF] to-[#60a5fa] flex items-center justify-center text-white shadow-lg shadow-[#477BFF]/30 font-black text-xl mx-auto">
              Y
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151B2B] transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-[#477BFF] text-white shadow-lg shadow-[#477BFF]/25 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151B2B]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {!isCollapsed && item.badge && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Owner Badge Footer */}
      <div className="p-3 border-t border-[#1E293B]">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-[#151B2B] border border-[#1E293B] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Owner Profile</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="font-bold text-xs text-white truncate">Sakthinathan Jayakumar</div>
            <div className="text-[10px] text-slate-400 font-mono">Preferred: Sakthi</div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-[#151B2B] border border-[#1E293B] flex items-center justify-center text-xs font-bold text-slate-300 mx-auto">
            SJ
          </div>
        )}
      </div>

    </aside>
  );
};
