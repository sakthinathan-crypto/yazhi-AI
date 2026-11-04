import React, { useState } from 'react';
import { 
  Bot, Save, Sparkles, Volume2, ShieldAlert, Plus, 
  Trash2, HelpCircle, CheckCircle2, Lock, MessageSquare 
} from 'lucide-react';
import { AssistantSettings } from '../types';

interface AiAssistantPageProps {
  settings: AssistantSettings;
  onSaveSettings: (settings: AssistantSettings) => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<AssistantSettings>(settings);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFormData({
      ...formData,
      approvedFaqs: [...formData.approvedFaqs, { q: newFaqQ.trim(), a: newFaqA.trim() }]
    });
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleRemoveFaq = (index: number) => {
    setFormData({
      ...formData,
      approvedFaqs: formData.approvedFaqs.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Voice Assistant – YAZHI</h1>
          <p className="text-sm text-slate-400">
            Configure conversational persona, voice attributes, approved knowledge base, and guardrails.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Changes Applied
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#477BFF]/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Persona Settings (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#477BFF]" />
              Voice Personality & Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Assistant Name
                </label>
                <input
                  type="text"
                  value={formData.assistantName}
                  onChange={(e) => setFormData({ ...formData, assistantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Gemini Voice Persona
                </label>
                <select
                  value={formData.voicePersonality}
                  onChange={(e) => setFormData({ ...formData, voicePersonality: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#477BFF]"
                >
                  <option value="Zephyr">Zephyr (Warm, natural, confident - Recommended)</option>
                  <option value="Puck">Puck (Energetic, friendly)</option>
                  <option value="Charon">Charon (Deep, formal, calm)</option>
                  <option value="Fenrir">Fenrir (Authoritative, direct)</option>
                  <option value="Kore">Kore (Soft, polite, executive)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Opening Telephone Greeting
              </label>
              <textarea
                value={formData.openingMessage}
                onChange={(e) => setFormData({ ...formData, openingMessage: e.target.value })}
                rows={3}
                className="w-full p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-slate-200 focus:outline-none focus:border-[#477BFF] leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must clearly identify YAZHI as an AI assistant and explain Sakthi's unavailability.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Max Call Duration (Seconds)
                </label>
                <input
                  type="number"
                  min={60}
                  max={600}
                  step={30}
                  value={formData.maxCallDurationSeconds}
                  onChange={(e) => setFormData({ ...formData, maxCallDurationSeconds: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Silence Timeout (Seconds)
                </label>
                <input
                  type="number"
                  min={10}
                  max={45}
                  value={formData.conversationTimeoutSeconds}
                  onChange={(e) => setFormData({ ...formData, conversationTimeoutSeconds: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>
          </div>

          {/* Approved Knowledge Base about Sakthi */}
          <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Approved Information About Sakthi
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Ground Truth Only
              </span>
            </div>

            <p className="text-xs text-slate-400">
              YAZHI only answers caller questions using this explicit verified brief. If a caller asks something outside this scope, YAZHI politely declines to invent details and records the question.
            </p>

            <textarea
              value={formData.approvedBusinessInfo}
              onChange={(e) => setFormData({ ...formData, approvedBusinessInfo: e.target.value })}
              rows={4}
              className="w-full p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-slate-200 focus:outline-none focus:border-[#477BFF] leading-relaxed"
            />
          </div>

          {/* Frequently Asked Questions (FAQ) Knowledge Base */}
          <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#477BFF]" />
              Approved FAQs for Callers
            </h3>

            <div className="space-y-3">
              {formData.approvedFaqs.map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Q: {faq.q}</span>
                    <span className="text-xs text-slate-300 block">A: {faq.a}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New FAQ Row */}
            <div className="pt-2 p-3.5 rounded-xl bg-[#080B14] border border-[#1E293B] space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Add New Approved Q&A
              </span>
              <input
                type="text"
                placeholder="Caller question (e.g., How do I apply for Aegis Academy?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
              />
              <textarea
                placeholder="Authorized answer (e.g., Please visit aegis.ac/apply and submit your project portfolio.)"
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
              />
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3.5 py-1.5 rounded-lg bg-[#151B2B] hover:bg-[#1E293B] text-xs font-bold text-slate-200 border border-[#1E293B] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add to Knowledge Base
              </button>
            </div>
          </div>

        </div>

        {/* Behavioral Guardrails & Rules Card (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Strict Telephony Guardrails
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforced dynamically in system prompt and audio bridge rules.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>No Pretending:</strong> Identifies as YAZHI in sentence one.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>No Commercial Commitments:</strong> Refuses to negotiate pricing or terms.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Zero Sensitive Data:</strong> Never requests or accepts OTPs, bank pins, or passwords.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>No Invented Timelines:</strong> Promises Sakthi will review, never gives fixed callback minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Spam Defense:</strong> Concludes unsolicited telemarketing politely and rapidly.</span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
              India Telecom & DND alignment: YAZHI discloses AI identity and call recording status automatically at call initiation.
            </div>
          </div>
        </div>

      </div>

    </form>
  );
};
