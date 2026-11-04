import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, Clock, Bot, CheckCircle2, AlertTriangle, 
  Flame, Calendar, ShieldCheck 
} from 'lucide-react';
import { DashboardStats } from '../types';

interface AnalyticsPageProps {
  stats: DashboardStats;
}

const HOURLY_TRAFFIC = [
  { hour: '9 AM', calls: 3 },
  { hour: '10 AM', calls: 7 },
  { hour: '11 AM', calls: 12 },
  { hour: '12 PM', calls: 9 },
  { hour: '1 PM', calls: 4 },
  { hour: '2 PM', calls: 8 },
  { hour: '3 PM', calls: 14 },
  { hour: '4 PM', calls: 16 },
  { hour: '5 PM', calls: 11 },
  { hour: '6 PM', calls: 8 },
  { hour: '7 PM', calls: 5 },
  { hour: '8 PM', calls: 2 },
];

const RESOLUTION_STATS = [
  { name: 'Resolved by YAZHI (No Callback)', value: 68, color: '#22C55E' },
  { name: 'Callback Scheduled for Sakthi', value: 24, color: '#F59E0B' },
  { name: 'Spam Terminated', value: 8, color: '#64748B' },
];

const PRIORITY_DATA = [
  { name: 'URGENT', value: 8, color: '#EF4444' },
  { name: 'HIGH', value: 28, color: '#F59E0B' },
  { name: 'NORMAL', value: 54, color: '#3B82F6' },
  { name: 'LOW', value: 10, color: '#64748B' },
];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Telephony Analytics & Intelligence</h1>
        <p className="text-sm text-slate-400">
          In-depth traffic patterns, screening efficacy, and caller priority metrics.
        </p>
      </div>

      {/* Top 3 KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Screening Success Rate</span>
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">96.8%</div>
          <p className="text-xs text-slate-400">
            Calls answered and cataloged without Sakthi being interrupted during deep work.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Time Saved for Sakthi</span>
            <Clock className="w-4 h-4 text-[#477BFF]" />
          </div>
          <div className="text-3xl font-black text-[#477BFF]">~4.2 hrs</div>
          <p className="text-xs text-slate-400">
            Saved per week via instant Gemini executive briefings and spam filtering.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Alert Latency</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">&lt; 3.5s</div>
          <p className="text-xs text-slate-400">
            Average time from call conclusion to Telegram dispatch directly to Sakthi.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hourly Traffic Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Peak Calling Hours</h3>
              <p className="text-xs text-slate-400">Distribution of unanswered incoming calls throughout the day</p>
            </div>
            <span className="text-xs text-[#477BFF] font-semibold">Peak: 3-5 PM</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_TRAFFIC} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="calls" fill="#477BFF" radius={[4, 4, 0, 0]} name="Incoming Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Classification Distribution */}
        <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Priority Classification Ratio</h3>
              <p className="text-xs text-slate-400">Determined strictly by verified intent, not caller urgency demands</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PRIORITY_DATA}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PRIORITY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '0.5rem', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E293B]">
            {PRIORITY_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
