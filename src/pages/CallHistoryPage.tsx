import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Clock, Phone, AlertTriangle, 
  Flame, CheckCircle2, Building2, ChevronRight, MessageSquare, 
  Trash2, PhoneCall, Bot, Download, RefreshCw 
} from 'lucide-react';
import { CallRecord, PriorityLevel } from '../types';

interface CallHistoryPageProps {
  calls: CallRecord[];
  onSelectCall: (call: CallRecord) => void;
  onDeleteCall: (callId: string) => void;
  onToggleCallback: (callId: string) => void;
  onOpenSimulator: () => void;
}

export const CallHistoryPage: React.FC<CallHistoryPageProps> = ({
  calls,
  onSelectCall,
  onDeleteCall,
  onToggleCallback,
  onOpenSimulator
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [callbackOnly, setCallbackOnly] = useState(false);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch = 
      (call.callerName && call.callerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      call.callerPhone.includes(searchQuery) ||
      (call.organization && call.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (call.summary && call.summary.purpose.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'ALL' || call.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || call.category === categoryFilter;
    const matchesCallback = !callbackOnly || call.callbackRequested;

    return matchesSearch && matchesPriority && matchesCategory && matchesCallback;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit"><AlertTriangle className="w-3.5 h-3.5" /> URGENT</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit"><Flame className="w-3.5 h-3.5" /> HIGH</span>;
      case 'NORMAL':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 w-fit">NORMAL</span>;
      case 'LOW':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 w-fit">LOW / SPAM</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Call History & Logs</h1>
          <p className="text-sm text-slate-400">
            Every call screened by YAZHI with full transcripts, recordings, and intelligence briefs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-[#477BFF]/20 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Simulate Call
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search caller name, phone, topic..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#477BFF]"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">URGENT</option>
            <option value="HIGH">HIGH</option>
            <option value="NORMAL">NORMAL</option>
            <option value="LOW">LOW / SPAM</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-[#477BFF]"
          >
            <option value="ALL">All Categories</option>
            <option value="Business">Business</option>
            <option value="Aegis Academy">Aegis Academy</option>
            <option value="College">College Related</option>
            <option value="Internship">Internship Opportunities</option>
            <option value="Project Collaboration">Project Collaboration</option>
            <option value="Spam">Spam / Unsolicited</option>
          </select>

          {/* Callback toggle */}
          <button
            onClick={() => setCallbackOnly(!callbackOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              callbackOnly 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-[#111827] text-slate-400 border-[#1E293B] hover:text-white'
            }`}
          >
            Callback Needed
          </button>
        </div>

      </div>

      {/* Calls List / Table */}
      {filteredCalls.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-3">
          <Phone className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No call records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or trigger a simulated call to test YAZHI's screening flow.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              onClick={() => onSelectCall(call)}
              className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] hover:border-[#477BFF]/50 transition-all cursor-pointer shadow-md hover:shadow-lg hover:shadow-[#477BFF]/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#477BFF]/10 text-[#477BFF] border border-[#477BFF]/20 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  {call.callerName ? call.callerName.charAt(0) : 'C'}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white group-hover:text-[#477BFF] transition-colors">
                      {call.callerName || 'Unregistered Caller'}
                    </h3>
                    {getPriorityBadge(call.priority)}
                    {call.isSimulation && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        SIMULATED
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="font-mono text-slate-300">{call.callerPhone}</span>
                    {call.organization && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" /> {call.organization}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {formatDuration(call.durationSeconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {new Date(call.callStartTime).toLocaleDateString()} {new Date(call.callStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {call.summary && (
                    <p className="text-xs text-slate-300 line-clamp-1 pt-1">
                      <span className="font-semibold text-slate-400">Purpose: </span>{call.summary.purpose}
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#1E293B]">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] block font-semibold text-slate-400">Resolution</span>
                  {call.callbackRequested ? (
                    <span className="text-xs font-bold text-amber-400">Callback Requested</span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-400">Screened by AI</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCall(call);
                    }}
                    className="p-2 rounded-lg bg-[#111827] hover:bg-[#151B2B] text-slate-300 hover:text-white border border-[#1E293B] text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#477BFF]" />
                    <span>Brief</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this call record?')) {
                        onDeleteCall(call.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
