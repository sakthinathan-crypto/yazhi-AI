import React, { useState, useEffect, useRef } from 'react';
import { 
  X, PhoneCall, PhoneOff, Mic, Send, Bot, User, 
  Sparkles, CheckCircle2, AlertCircle, Play, ShieldAlert,
  ArrowRight, MessageSquare
} from 'lucide-react';
import { CallRecord, PriorityLevel, TranscriptItem } from '../types';

interface CallSimulatorModalProps {
  onClose: () => void;
  onCallCompleted: (newCall: CallRecord) => void;
}

interface Scenario {
  id: string;
  name: string;
  phone: string;
  organization: string;
  scenarioTitle: string;
  expectedPriority: PriorityLevel;
  script: { speaker: 'caller' | 'assistant'; text: string }[];
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'hyperscale',
    name: 'Priya Raman',
    phone: '+91 97123 45678',
    organization: 'HyperScale Cloud Labs',
    scenarioTitle: 'Enterprise SLA Sign-off (High Priority)',
    expectedPriority: 'HIGH',
    script: [
      { speaker: 'assistant', text: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
      { speaker: 'caller', text: "Hi YAZHI, this is Priya Raman from HyperScale Cloud Labs. I'm calling for Sakthi regarding our AI deployment contract terms." },
      { speaker: 'assistant', text: "Hello Priya. Thank you for reaching out. Sakthi is in a deep work session right now. Could you share the key update you'd like me to pass along?" },
      { speaker: 'caller', text: "Our executive board accepted his revisions. We just need him to review the final addendum before 6 PM today so we can activate the compute cluster." },
      { speaker: 'assistant', text: "Understood. I will mark this as a high priority item and notify Sakthi immediately with your callback request for this evening. Is there anything else you'd like me to pass along?" },
      { speaker: 'caller', text: "No, that is perfect YAZHI. Thank you so much!" },
      { speaker: 'assistant', text: "You're welcome Priya. Have a wonderful day!" }
    ]
  },
  {
    id: 'aegis_hackathon',
    name: 'Kavitha M.',
    phone: '+91 98845 67890',
    organization: 'Aegis Academy Student Council',
    scenarioTitle: 'Aegis AI Hackathon 240 Enrollments (Normal)',
    expectedPriority: 'NORMAL',
    script: [
      { speaker: 'assistant', text: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
      { speaker: 'caller', text: "Hi YAZHI, it's Kavitha from Aegis Academy. Just wanted to let Sakthi know that registration crossed our target of 200 participants!" },
      { speaker: 'assistant', text: "That's wonderful news Kavitha! I have noted the registration milestone and will include it in Sakthi's daily briefing." },
      { speaker: 'caller', text: "Thanks YAZHI! Tell him the student council is ready for his review tomorrow." },
      { speaker: 'assistant', text: "I have recorded that. Thank you for calling and congratulations to the team!" }
    ]
  },
  {
    id: 'emergency',
    name: 'Sundar (Family/Associate)',
    phone: '+91 94440 99999',
    organization: 'Personal / Immediate',
    scenarioTitle: 'Urgent Medical Emergency (URGENT)',
    expectedPriority: 'URGENT',
    script: [
      { speaker: 'assistant', text: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
      { speaker: 'caller', text: "YAZHI, this is an urgent matter. Sakthi's colleague met with an accident and has been taken to Apollo Hospital. Please inform Sakthi immediately!" },
      { speaker: 'assistant', text: "I understand the extreme urgency. I am marking this call as an emergency alert and dispatching an instant priority notification directly to Sakthi's phone right now. Is there a doctor or coordinator contact number?" },
      { speaker: 'caller', text: "Yes, Dr. Selvam at +91 98400 11111." },
      { speaker: 'assistant', text: "Noted. Sakthi is being alerted immediately. Thank you." }
    ]
  },
  {
    id: 'internship',
    name: 'Arjun Swaminathan',
    phone: '+91 95511 23456',
    organization: 'PSG College of Technology',
    scenarioTitle: 'Aegis Academy Student Internship (Normal)',
    expectedPriority: 'NORMAL',
    script: [
      { speaker: 'assistant', text: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
      { speaker: 'caller', text: "Hi YAZHI, I am Arjun Swaminathan, a 3rd year Computer Science student at PSG Tech. I want to inquire about Sakthi's summer AI research internship at Aegis Academy." },
      { speaker: 'assistant', text: "Hello Arjun. Sakthi welcomes talented student applicants for Aegis Academy research. Have you submitted your GitHub portfolio and project links through the Aegis Academy portal?" },
      { speaker: 'caller', text: "Yes, I submitted it yesterday under application reference AG-402." },
      { speaker: 'assistant', text: "Thank you for the reference code. I will record this for Sakthi's review. Is there any particular question you'd like him to answer?" },
      { speaker: 'caller', text: "Just whether he prefers PyTorch or JAX for the computer vision project." },
      { speaker: 'assistant', text: "I have noted that question and your application code. Thank you for calling Arjun!" }
    ]
  },
  {
    id: 'spam',
    name: 'QuickLoans Telemarketing',
    phone: '+91 80123 99999',
    organization: 'Commercial Sales',
    scenarioTitle: 'Unsolicited Personal Loan (LOW / SPAM)',
    expectedPriority: 'LOW',
    script: [
      { speaker: 'assistant', text: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
      { speaker: 'caller', text: "Good morning sir! Are you interested in getting an instant pre-approved personal loan up to 10 lakhs with no collateral?" },
      { speaker: 'assistant', text: "Sakthi does not accept unsolicited commercial or financial sales inquiries through this channel. I am noting this as promotional and concluding the call. Good day." }
    ]
  }
];

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({
  onClose,
  onCallCompleted
}) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'completed'>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [ringCountdown, setRingCountdown] = useState(3);
  const [callDuration, setCallDuration] = useState(0);
  const durationTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, []);

  const handleStartCall = () => {
    setCallState('ringing');
    setRingCountdown(3);
    setTranscripts([]);
    setStepIndex(0);
    setCallDuration(0);

    const ringInterval = setInterval(() => {
      setRingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(ringInterval);
          startActiveConversation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startActiveConversation = () => {
    setCallState('connected');
    
    // Start duration timer
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Initial greeting
    const firstTurn = selectedScenario.script[0];
    setTranscripts([
      { speaker: firstTurn.speaker, content: firstTurn.text, timeStr: '00:01' }
    ]);
    setStepIndex(1);
  };

  const handleNextScriptTurn = () => {
    if (stepIndex >= selectedScenario.script.length) return;
    
    const turn = selectedScenario.script[stepIndex];
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    const timeStr = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    setTranscripts((prev) => [
      ...prev,
      { speaker: turn.speaker, content: turn.text, timeStr }
    ]);
    setStepIndex((prev) => prev + 1);
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const callerText = customInput.trim();
    setCustomInput('');

    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    const timeStr = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Add caller turn
    setTranscripts((prev) => [
      ...prev,
      { speaker: 'caller', content: callerText, timeStr }
    ]);

    // Intelligent YAZHI reply
    setTimeout(() => {
      let assistantReply = "Thank you for providing those details. I have recorded your message and will ensure Sakthi receives this in his executive briefing.";
      const lower = callerText.toLowerCase();

      if (lower.includes('name is') || lower.includes("i am") || lower.includes("this is")) {
        assistantReply = "Thank you for introducing yourself. May I know the exact purpose of your call so I can categorize it appropriately for Sakthi?";
      } else if (lower.includes('internship') || lower.includes('aegis academy') || lower.includes('student')) {
        assistantReply = "Thank you. Sakthi reviews Aegis Academy and research projects based on technical merit. May I have your contact preference or portfolio link to note down?";
      } else if (lower.includes('emergency') || lower.includes('hospital') || lower.includes('urgent')) {
        assistantReply = "I understand this is critical. I am flagging this call with URGENT priority and sending an instant notification directly to Sakthi right now.";
      } else if (lower.includes('callback') || lower.includes('call me back') || lower.includes('reach sakthi')) {
        assistantReply = "I have noted your callback request. Sakthi will be notified with your preferred contact details as soon as his schedule permits.";
      }

      setTranscripts((prev) => [
        ...prev,
        { speaker: 'assistant', content: assistantReply, timeStr: '00:' + (callDuration + 2) }
      ]);
    }, 900);
  };

  const handleEndCall = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallState('completed');

    // Synthesize structured summary
    const combined = transcripts.map(t => t.content.toLowerCase()).join(' ');
    let priority: PriorityLevel = selectedScenario.expectedPriority;
    let urgencyReason = undefined;

    if (combined.includes('emergency') || combined.includes('hospital')) {
      priority = 'URGENT';
      urgencyReason = 'Caller reported urgent medical or life-safety matter.';
    } else if (combined.includes('hyperscale') || combined.includes('contract') || combined.includes('deadline')) {
      priority = 'HIGH';
      urgencyReason = 'Time-sensitive enterprise business contract review.';
    }

    const callbackRequested = combined.includes('callback') || combined.includes('call back') || combined.includes('today evening');

    const simulatedCall: CallRecord = {
      id: 'sim-' + Date.now(),
      callerPhone: selectedScenario.phone,
      callerName: selectedScenario.name,
      organization: selectedScenario.organization,
      callStartTime: new Date(Date.now() - callDuration * 1000).toISOString(),
      callEndTime: new Date().toISOString(),
      durationSeconds: Math.max(callDuration, 45),
      status: 'AI Answered',
      category: priority === 'URGENT' ? 'Urgent Matters' : (selectedScenario.id === 'hyperscale' ? 'Business' : 'Aegis Academy'),
      priority,
      callbackRequested,
      callbackPreference: callbackRequested ? 'As soon as possible' : undefined,
      privateNotes: `Simulated via YAZHI Call Studio (${selectedScenario.scenarioTitle}). Tested end-to-end dialog and priority classifier.`,
      summary: {
        purpose: `Discussion regarding ${selectedScenario.scenarioTitle} handled by YAZHI.`,
        keyPoints: [
          `Identified caller as ${selectedScenario.name} (${selectedScenario.organization}).`,
          `YAZHI conducted dialog following Step 1-5 conversation protocol.`,
          `Priority classified accurately as ${priority}.`
        ],
        actionItems: [
          callbackRequested ? `Return call to ${selectedScenario.phone} regarding ${selectedScenario.scenarioTitle}.` : 'Review conversation logs in dashboard.'
        ],
        callerSentiment: priority === 'URGENT' ? 'Urgent & Distressed' : 'Courteous & Cooperative',
        summaryText: `${selectedScenario.name} from ${selectedScenario.organization} called regarding ${selectedScenario.scenarioTitle}. YAZHI handled the call, logged caller intent, and verified next steps.`,
        urgencyReason,
        priority,
        callbackRequested,
        category: selectedScenario.organization.includes('Academy') ? 'Aegis Academy' : 'Business'
      },
      transcripts,
      isSimulation: true,
      createdAt: new Date().toISOString()
    };

    onCallCompleted(simulatedCall);
  };

  const minutes = Math.floor(callDuration / 60);
  const seconds = callDuration % 60;
  const timerFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0E1322] border border-[#1E293B] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#477BFF]/20 text-[#477BFF] border border-[#477BFF]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">YAZHI Interactive Call Simulator</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  DEMO MODE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulates real-world unanswered forwarding from Sakthi's Airtel SIM to YAZHI Voice Agent.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {callState === 'idle' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Select Call Scenario
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRESET_SCENARIOS.map((sc) => {
                    const isSelected = selectedScenario.id === sc.id;
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setSelectedScenario(sc)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? 'bg-[#151B2B] border-[#477BFF] shadow-lg shadow-[#477BFF]/10 ring-1 ring-[#477BFF]' 
                            : 'bg-[#111827] border-[#1E293B] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-white">{sc.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            sc.expectedPriority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                            sc.expectedPriority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                            sc.expectedPriority === 'LOW' ? 'bg-slate-500/20 text-slate-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {sc.expectedPriority}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mb-1">{sc.organization}</div>
                        <div className="text-xs text-slate-300 line-clamp-1">{sc.scenarioTitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Telephony Forwarding Simulation Notice */}
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <PhoneCall className="w-4 h-4 text-[#477BFF]" />
                  <span>How the simulation executes:</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  1. Simulates caller ringing Sakthi's Airtel phone for 25 seconds without answer.<br />
                  2. Telecom conditional forwarding activates and connects call to YAZHI Voicebot.<br />
                  3. YAZHI speaks opening greeting, collects purpose, and evaluates priority.<br />
                  4. Generates structured intelligence summary and dispatches Telegram notification.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="px-6 py-3 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-[#477BFF]/25 transition-all"
                >
                  <PhoneCall className="w-4 h-4" /> Start Simulated Call
                </button>
              </div>
            </div>
          )}

          {callState === 'ringing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-bounce">
                  <PhoneCall className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
              </div>
              <h3 className="text-xl font-bold text-white">Sakthi's Phone is Ringing...</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Unanswered call forwarding in progress. If unanswered in {ringCountdown}s, call will route to YAZHI AI assistant.
              </p>
              <div className="text-xs font-mono text-slate-500">
                Forwarding target: {selectedScenario.phone} → Exotel Virtual Trunk
              </div>
            </div>
          )}

          {callState === 'connected' && (
            <div className="space-y-4">
              {/* Call In-Progress Bar */}
              <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedScenario.name}</span>
                      <span className="text-xs text-slate-400 font-mono">({selectedScenario.phone})</span>
                    </div>
                    <div className="text-xs text-slate-400">{selectedScenario.organization}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">Call Duration</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{timerFormatted}</span>
                  </div>
                  <button
                    onClick={handleEndCall}
                    className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneOff className="w-3.5 h-3.5" /> End Call
                  </button>
                </div>
              </div>

              {/* Audio Wave Visualizer */}
              <div className="py-2 px-4 rounded-xl bg-[#080B14] border border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#477BFF]" />
                  <span>Gemini Live Voicebot Bridge (16kHz in / 24kHz out)</span>
                </span>
                <div className="flex items-center gap-1 h-5">
                  <div className="w-1 bg-[#477BFF] rounded-full animate-wave-1" />
                  <div className="w-1 bg-[#477BFF] rounded-full animate-wave-2" />
                  <div className="w-1 bg-[#477BFF] rounded-full animate-wave-3" />
                  <div className="w-1 bg-[#477BFF] rounded-full animate-wave-4" />
                  <div className="w-1 bg-[#477BFF] rounded-full animate-wave-5" />
                </div>
              </div>

              {/* Live Transcript Stream */}
              <div className="p-4 rounded-xl bg-[#080B14] border border-[#1E293B] min-h-[220px] max-h-[300px] overflow-y-auto space-y-3">
                {transcripts.map((t, idx) => {
                  const isAssistant = t.speaker === 'assistant';
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        isAssistant 
                          ? 'bg-[#151B2B] text-slate-200 border border-[#1E293B]' 
                          : 'bg-[#477BFF]/20 text-blue-100 border border-[#477BFF]/30'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                          <span className={isAssistant ? 'text-[#477BFF]' : 'text-blue-300'}>
                            {isAssistant ? 'YAZHI' : selectedScenario.name}
                          </span>
                          <span>{t.timeStr}</span>
                        </div>
                        <p>{t.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Script Progression & Interactive Inputs */}
              <div className="space-y-3 pt-2">
                {stepIndex < selectedScenario.script.length && (
                  <button
                    type="button"
                    onClick={handleNextScriptTurn}
                    className="w-full py-2.5 rounded-xl bg-[#151B2B] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Advance Script Turn ({stepIndex + 1}/{selectedScenario.script.length})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#477BFF]" />
                  </button>
                )}

                {/* Free-form Interactive Dialogue Input */}
                <form onSubmit={handleSendCustomMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Speak or type as the caller..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-white text-xs font-bold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {callState === 'completed' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Call Completed & Summarized!</h3>
              <p className="text-xs text-slate-400 max-w-md">
                YAZHI successfully concluded the call. The conversation transcript was analyzed with Gemini 3.8 Flash, categorized, and added to Sakthi's Call History.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white transition-colors"
                >
                  View in Call History
                </button>
                <button
                  onClick={() => setCallState('idle')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Simulate Another Call
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
