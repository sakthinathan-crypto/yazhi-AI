import React, { useState } from 'react';
import { 
  X, Phone, Building2, Clock, Calendar, AlertTriangle, 
  CheckCircle2, FileText, MessageSquare, Play, Pause, 
  Volume2, Trash2, Edit3, Send, Check 
} from 'lucide-react';
import { CallRecord, PriorityLevel } from '../types';

interface CallDetailModalProps {
  call: CallRecord;
  onClose: () => void;
  onUpdateNotes: (callId: string, notes: string) => void;
  onToggleCallback: (callId: string) => void;
  onDeleteCall: (callId: string) => void;
}

export const CallDetailModal: React.FC<CallDetailModalProps> = ({
  call,
  onClose,
  onUpdateNotes,
  onToggleCallback,
  onDeleteCall
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState(call.privateNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> URGENT</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">HIGH</span>;
      case 'NORMAL':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">NORMAL</span>;
      case 'LOW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">LOW / SPAM</span>;
    }
  };

  const handleSaveNotes = () => {
    onUpdateNotes(call.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const minutes = Math.floor(call.durationSeconds / 60);
  const seconds = call.durationSeconds % 60;
  const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0E1322] border border-[#1E293B] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#477BFF]/10 border border-[#477BFF]/30 flex items-center justify-center text-[#477BFF]">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {call.callerName || 'Unregistered Caller'}
                </h2>
                {getPriorityBadge(call.priority)}
                {call.isSimulation && (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    SIMULATED CALL
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-slate-300">
                  {call.callerPhone}
                </span>
                {call.organization && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> {call.organization}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {durationFormatted}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(call.callStartTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Executive Summary Card */}
          {call.summary && (
            <div className="p-5 rounded-xl bg-[#151B2B] border border-[#1E293B] shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#477BFF]/20 text-[#477BFF]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                    YAZHI Executive Intelligence Brief
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Model: Gemini 3.8 Flash</span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Purpose</h4>
                <p className="text-base text-slate-100 font-medium">{call.summary.purpose}</p>
              </div>

              {call.summary.urgencyReason && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-200 text-sm flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-red-300">Urgency Rationale: </span>
                    {call.summary.urgencyReason}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Discussion Points</h4>
                <ul className="space-y-1.5">
                  {call.summary.keyPoints.map((pt, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-[#477BFF] font-bold mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {call.summary.actionItems && call.summary.actionItems.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recommended Action Items
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {call.summary.actionItems.map((act, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#0B1020] border border-[#1E293B] text-xs text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Callback Preference Pill */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#1E293B] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Callback Status:</span>
                  <button
                    onClick={() => onToggleCallback(call.id)}
                    className={`px-3 py-1 rounded-full font-medium transition-colors ${
                      call.callbackRequested 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {call.callbackRequested ? 'Callback Requested' : 'No Callback Required'}
                  </button>
                  {call.callbackPreference && (
                    <span className="text-slate-400 italic">
                      (Preferred: {call.callbackPreference})
                    </span>
                  )}
                </div>
                <div className="text-slate-400">
                  Caller Sentiment: <span className="text-slate-200 font-medium">{call.summary.callerSentiment}</span>
                </div>
              </div>
            </div>
          )}

          {/* Audio Player Simulation */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-[#477BFF] hover:bg-[#3b6ee0] text-white flex items-center justify-center transition-colors shadow-lg shadow-[#477BFF]/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div>
                <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#477BFF]" />
                  <span>Call Audio Recording (16kHz PCM Stream)</span>
                </div>
                <span className="text-xs text-slate-400">
                  {isPlaying ? 'Simulating streaming playback...' : `Duration: ${durationFormatted}`}
                </span>
              </div>
            </div>
            {/* Visualizer wave bars */}
            <div className="flex items-center gap-1 h-6">
              {[40, 75, 55, 90, 60, 30, 80, 95, 65, 45, 85, 30, 60].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying ? 'bg-[#477BFF]' : 'bg-slate-700'
                  }`}
                  style={{ height: isPlaying ? `${Math.max(15, Math.round(h * Math.random()))}%` : `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Full Conversation Transcript */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#477BFF]" />
              Conversation Transcript ({call.transcripts.length} exchanges)
            </h3>
            
            {call.transcripts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-[#111827] rounded-xl border border-[#1E293B]">
                No transcript turns recorded for this call.
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-xl bg-[#0B1020] border border-[#1E293B]">
                {call.transcripts.map((t, idx) => {
                  const isAssistant = t.speaker === 'assistant';
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                        isAssistant 
                          ? 'bg-[#151B2B] text-slate-200 border border-[#1E293B]' 
                          : 'bg-[#477BFF]/15 text-blue-100 border border-[#477BFF]/30'
                      }`}>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                          <span className={isAssistant ? 'text-[#477BFF]' : 'text-blue-300'}>
                            {isAssistant ? 'YAZHI (AI Assistant)' : (call.callerName || 'Caller')}
                          </span>
                        </div>
                        <p>{t.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Private Notes Section */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#477BFF]" /> Sakthi's Private Notes
              </h4>
              {isSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes for your reference (e.g. follow-up context, agreement details)..."
              rows={3}
              className="w-full p-3 rounded-lg bg-[#080B14] border border-[#1E293B] text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 rounded-lg bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-semibold text-white transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1E293B] bg-[#111827] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this call record?')) {
                onDeleteCall(call.id);
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Call Record
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
