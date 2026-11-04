import React, { useState, useEffect } from 'react';
import { 
  Radio, PhoneOff, PhoneForwarded, AlertTriangle, Flame, 
  MessageSquare, Mic, Volume2, ShieldAlert, Sparkles, 
  PhoneCall, Bot, Play, CheckCircle2 
} from 'lucide-react';
import { CallRecord, PriorityLevel, TranscriptItem } from '../types';

interface LiveCallsPageProps {
  onOpenSimulator: () => void;
  onSelectCall: (call: CallRecord) => void;
}

export const LiveCallsPage: React.FC<LiveCallsPageProps> = ({
  onOpenSimulator,
  onSelectCall
}) => {
  const [hasActiveCall, setHasActiveCall] = useState(false);
  const [callerName, setCallerName] = useState('Priya Raman');
  const [callerPhone, setCallerPhone] = useState('+91 97123 45678');
  const [organization, setOrganization] = useState('HyperScale Cloud Labs');
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [callDuration, setCallDuration] = useState(74);
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    { speaker: 'assistant', content: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
    { speaker: 'caller', content: "Hi YAZHI, this is Priya Raman from HyperScale Cloud Labs. Calling for Sakthi regarding our AI deployment contract addendum." },
    { speaker: 'assistant', content: "Hello Priya. Thank you for reaching out. Sakthi is in a deep work session right now. Could you share the key update you'd like me to pass along?" },
    { speaker: 'caller', content: "Our executive board accepted his revisions. We just need him to review the final addendum before 6 PM today so we can activate the compute cluster." }
  ]);

  useEffect(() => {
    let interval: any = null;
    if (hasActiveCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasActiveCall]);

  const minutes = Math.floor(callDuration / 60);
  const seconds = callDuration % 60;
  const durationFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Real-Time Telephony Stream Monitor
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Live Calls & Barge-In Console</h1>
          <p className="text-sm text-slate-400">
            Real-time telemetry stream from Exotel Voicebot & Gemini Live API session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!hasActiveCall ? (
            <button
              onClick={() => {
                setHasActiveCall(true);
                setCallDuration(1);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Simulate Active In-Flight Call</span>
            </button>
          ) : (
            <button
              onClick={() => setHasActiveCall(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Reset Monitor
            </button>
          )}
        </div>
      </div>

      {/* Main Live Interface */}
      {hasActiveCall ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Call Metadata & Controls (1 Col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Call In Progress
                </span>
                <span className="text-sm font-mono font-bold text-white">{durationFormatted}</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white tracking-tight">{callerName}</h3>
                <span className="text-xs font-mono text-slate-400 block">{callerPhone}</span>
                <span className="text-xs text-slate-300 font-medium mt-0.5 block">{organization}</span>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Current Assessed Priority
                </label>
                <div className="flex gap-2">
                  {(['URGENT', 'HIGH', 'NORMAL', 'LOW'] as PriorityLevel[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        priority === p
                          ? (p === 'URGENT' ? 'bg-red-500 text-white shadow-md shadow-red-500/25' :
                             p === 'HIGH' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' :
                             'bg-blue-600 text-white')
                          : 'bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Audio Visualizer */}
              <div className="p-3.5 rounded-xl bg-[#080B14] border border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#477BFF]" />
                    <span>Gemini Live Bidirectional PCM</span>
                  </span>
                  <span className="text-emerald-400 text-[11px] font-mono">16kHz / 24kHz</span>
                </div>
                <div className="flex items-center justify-center gap-1 h-8">
                  <div className="w-1.5 bg-[#477BFF] rounded-full animate-wave-1" />
                  <div className="w-1.5 bg-[#477BFF] rounded-full animate-wave-2" />
                  <div className="w-1.5 bg-[#477BFF] rounded-full animate-wave-3" />
                  <div className="w-1.5 bg-[#477BFF] rounded-full animate-wave-4" />
                  <div className="w-1.5 bg-[#477BFF] rounded-full animate-wave-5" />
                  <div className="w-1.5 bg-emerald-400 rounded-full animate-wave-2" />
                  <div className="w-1.5 bg-emerald-400 rounded-full animate-wave-4" />
                  <div className="w-1.5 bg-[#477BFF] rounded-full animate-wave-3" />
                </div>
              </div>

              {/* Owner Operator Controls */}
              <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                <button
                  onClick={() => alert("Initiating warm transfer directive to Sakthi's registered mobile line (+91 98400 00000) via Exotel Call Transfer API.")}
                  className="w-full py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-[#477BFF]/20 transition-all"
                >
                  <PhoneForwarded className="w-3.5 h-3.5" /> Transfer Call to Sakthi
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                      isMuted 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-[#111827] text-slate-300 border-[#1E293B] hover:bg-[#151B2B]'
                    }`}
                  >
                    <Mic className="w-3 h-3" /> {isMuted ? 'AI Muted' : 'Mute AI'}
                  </button>

                  <button
                    onClick={() => {
                      alert("YAZHI ending call with polite closing statement.");
                      setHasActiveCall(false);
                    }}
                    className="py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneOff className="w-3 h-3" /> End AI Session
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Real-Time Live Transcript Viewer (2 Cols) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#477BFF]" />
                <h3 className="text-sm font-bold text-white tracking-tight">Live Transcription Stream</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Stream ID: exo_live_{callDuration}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {transcripts.map((t, idx) => {
                const isAssistant = t.speaker === 'assistant';
                return (
                  <div 
                    key={idx} 
                    className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isAssistant 
                        ? 'bg-[#151B2B] text-slate-200 border border-[#1E293B]' 
                        : 'bg-[#477BFF]/20 text-blue-100 border border-[#477BFF]/30'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                        <span className={isAssistant ? 'text-[#477BFF]' : 'text-blue-300'}>
                          {isAssistant ? 'YAZHI (Voice Agent)' : callerName}
                        </span>
                      </div>
                      <p className="text-sm">{t.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Protected stream: raw audio is not persisted or exposed publicly.</span>
              </span>
              <span className="text-emerald-400 font-medium">Barge-in detection active</span>
            </div>
          </div>

        </div>
      ) : (
        /* Empty State when no live active call */
        <div className="p-12 text-center rounded-2xl bg-[#0E1322] border border-[#1E293B] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#477BFF]/10 text-[#477BFF] border border-[#477BFF]/20 flex items-center justify-center mx-auto">
            <Radio className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">No Active Telephone Calls Right Now</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              When a caller dials Sakthi's number and remains unanswered for 25 seconds, Airtel routes the call here in real time.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setHasActiveCall(true);
                setCallDuration(1);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#477BFF]/20 transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Launch Live Monitor Demo</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Interactive Call Simulator
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
