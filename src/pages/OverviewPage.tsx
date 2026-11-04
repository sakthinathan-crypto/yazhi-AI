import React from 'react';
import { 
  PhoneCall, Bot, PhoneMissed, AlertTriangle, Flame, Clock, 
  Sparkles, CheckCircle2, ArrowUpRight, ShieldCheck, ChevronRight,
  TrendingUp, Radio, Activity, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { CallRecord, DashboardStats, PriorityLevel } from '../types';

interface OverviewPageProps {
  stats: DashboardStats;
  recentCalls: CallRecord[];
  onSelectCall: (call: CallRecord) => void;
  onOpenSimulator: () => void;
  onNavigate: (tab: string) => void;
}

const WEEKLY_DATA = [
  { day: 'Mon', total: 14, aiAnswered: 12, urgent: 1 },
  { day: 'Tue', total: 19, aiAnswered: 18, urgent: 2 },
  { day: 'Wed', total: 22, aiAnswered: 20, urgent: 3 },
  { day: 'Thu', total: 16, aiAnswered: 15, urgent: 0 },
  { day: 'Fri', total: 25, aiAnswered: 24, urgent: 4 },
  { day: 'Sat', total: 8, aiAnswered: 7, urgent: 1 },
  { day: 'Sun', total: 6, aiAnswered: 6, urgent: 0 },
];

const CATEGORY_COLORS = ['#477BFF', '#22C55E', '#F59E0B', '#A855F7', '#EF4444'];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  stats,
  recentCalls,
  onSelectCall,
  onOpenSimulator,
  onNavigate
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const categoryBreakdown = [
    { name: 'Business', value: 45 },
    { name: 'Aegis Academy', value: 30 },
    { name: 'College', value: 15 },
    { name: 'Internship', value: 8 },
    { name: 'Spam / Other', value: 2 },
  ];

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Flame className="w-3 h-3" /> HIGH</span>;
      case 'NORMAL':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">NORMAL</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">LOW</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Telephony Status Brief */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E1528] via-[#111827] to-[#0D1424] border border-[#1E293B] p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
                YAZHI Live Telephony Shield Active
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Good day, Sakthi.
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              YAZHI is monitoring your Airtel line. Unanswered calls ring your mobile for <span className="text-white font-semibold">25 seconds</span> before being answered by your AI Voice Agent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSimulator}
              className="px-5 py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#477BFF]/25 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Simulate Incoming Call</span>
            </button>
            <button
              onClick={() => onNavigate('live_calls')}
              className="px-4 py-2.5 rounded-xl bg-[#151B2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Live Calls Monitor</span>
            </button>
          </div>
        </div>

        {/* System Status Indicators Row */}
        <div className="mt-6 pt-5 border-t border-[#1E293B]/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${stats.systemStatus.gemini === 'Connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-500'}`} />
            <div>
              <span className="text-slate-400 block text-[11px]">Gemini 3.8 Live</span>
              <span className="text-slate-200 font-semibold">{stats.systemStatus.gemini}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${stats.systemStatus.telephony === 'Connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-500'}`} />
            <div>
              <span className="text-slate-400 block text-[11px]">Exotel Voicebot</span>
              <span className="text-slate-200 font-semibold">{stats.systemStatus.telephony}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${stats.systemStatus.database === 'Connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-500'}`} />
            <div>
              <span className="text-slate-400 block text-[11px]">Supabase DB</span>
              <span className="text-slate-200 font-semibold">{stats.systemStatus.database}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${stats.systemStatus.telegram === 'Connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-500'}`} />
            <div>
              <span className="text-slate-400 block text-[11px]">Telegram Alerts</span>
              <span className="text-slate-200 font-semibold">{stats.systemStatus.telegram}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 KPI Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
        
        <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Calls</span>
            <PhoneCall className="w-4 h-4 text-[#477BFF]" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalCalls}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14% this week
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Answered</span>
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.aiAnsweredCalls}</div>
          <div className="text-[11px] text-slate-400">
            {stats.totalCalls > 0 ? Math.round((stats.aiAnsweredCalls / stats.totalCalls) * 100) : 100}% screened
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Missed Calls</span>
            <PhoneMissed className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats.missedCalls}</div>
          <div className="text-[11px] text-emerald-400">0 unhandled</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Important</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.importantCalls}</div>
          <div className="text-[11px] text-slate-400">Flagged priority</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Calls</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{stats.urgentCalls}</div>
          <div className="text-[11px] text-red-400/80">Instant notify sent</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Duration</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatDuration(stats.averageDurationSeconds)}</div>
          <div className="text-[11px] text-slate-400">Efficient dialog</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1322] border border-[#1E293B] shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Dialogs</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalAiConversations}</div>
          <div className="text-[11px] text-purple-400">100% automated</div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Call Activity Graph (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Weekly Call Volume & AI Screening</h3>
              <p className="text-xs text-slate-400">Incoming calls forwarded from Airtel SIM vs AI answered</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#477BFF]" /> Total Incoming
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> YAZHI Answered
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#477BFF" radius={[4, 4, 0, 0]} name="Total Calls" />
                <Bar dataKey="aiAnswered" fill="#22C55E" radius={[4, 4, 0, 0]} name="AI Answered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Call Category Breakdown (1 Col) */}
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Call Categories</h3>
            <p className="text-xs text-slate-400 mb-2">Intent distribution determined by Gemini</p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '0.5rem', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx] }} />
                  {cat.name}
                </span>
                <span className="text-slate-400 font-mono">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Call Activity & Executive Summaries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Call Briefings</h3>
            <p className="text-xs text-slate-400">Latest telephone calls handled and categorized by YAZHI</p>
          </div>
          <button
            onClick={() => onNavigate('call_history')}
            className="text-xs font-semibold text-[#477BFF] hover:text-[#6894ff] flex items-center gap-1 transition-colors"
          >
            <span>View All Calls</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCalls.slice(0, 3).map((call) => (
            <div
              key={call.id}
              onClick={() => onSelectCall(call)}
              className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] hover:border-[#477BFF]/50 transition-all cursor-pointer shadow-lg hover:shadow-[#477BFF]/5 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#477BFF]/10 text-[#477BFF] flex items-center justify-center font-bold text-xs">
                      {call.callerName ? call.callerName.charAt(0) : 'C'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#477BFF] transition-colors">
                        {call.callerName || 'Unidentified'}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {call.callerPhone}
                      </span>
                    </div>
                  </div>
                  {getPriorityBadge(call.priority)}
                </div>

                {call.organization && (
                  <div className="text-xs font-medium text-slate-300">
                    {call.organization}
                  </div>
                )}

                {call.summary && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {call.summary.summaryText}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> {formatDuration(call.durationSeconds)}
                </span>
                {call.callbackRequested ? (
                  <span className="text-amber-400 font-semibold text-[11px]">Callback Required</span>
                ) : (
                  <span className="text-emerald-400 text-[11px]">AI Concluded</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
