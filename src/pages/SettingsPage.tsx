import React, { useState } from 'react';
import { 
  PhoneForwarded, Clock, ShieldCheck, Copy, Check, Save, 
  AlertTriangle, Smartphone, Plus, Trash2, CheckCircle2 
} from 'lucide-react';
import { CallHandlingSettings } from '../types';

interface SettingsPageProps {
  settings: CallHandlingSettings;
  onSaveSettings: (settings: CallHandlingSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<CallHandlingSettings>(settings);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const cleanNum = formData.forwardingNumber.replace(/[^0-9]/g, '');

  const ussdCodes = {
    unanswered: `*61*${cleanNum}*11*${formData.forwardingTimeoutSeconds}#`,
    unreachable: `*62*${cleanNum}#`,
    busy: `*67*${cleanNum}#`,
    status: `*#61#`,
    cancel: `##61#`
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    setFormData({
      ...formData,
      emergencyKeywords: [...formData.emergencyKeywords, newKeyword.trim().toLowerCase()]
    });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    setFormData({
      ...formData,
      emergencyKeywords: formData.emergencyKeywords.filter((_, i) => i !== index)
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Call Handling & Forwarding Config</h1>
          <p className="text-sm text-slate-400">
            Configure telecom carrier conditional forwarding, ringing duration, and working hours.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#477BFF]/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save Settings
          </button>
        </div>
      </div>

      {/* Airtel SIM Conditional Forwarding Setup Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0E1528] via-[#0E1322] to-[#111827] border border-[#1E293B] shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#477BFF]/20 text-[#477BFF] border border-[#477BFF]/30">
              <PhoneForwarded className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Airtel India Conditional Forwarding USSD Codes
              </h2>
              <p className="text-xs text-slate-400">
                Dial these codes once from Sakthi's Airtel mobile dialer to route unanswered calls to YAZHI.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start md:self-auto">
            GSM Standard 3GPP Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          
          {/* Unanswered forwarding code */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Forward When Unanswered ({formData.forwardingTimeoutSeconds}s)</span>
              <button
                type="button"
                onClick={() => handleCopy(ussdCodes.unanswered, 'unanswered')}
                className="text-xs text-[#477BFF] hover:text-white flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'unanswered' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'unanswered' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#080B14] font-mono text-xs text-emerald-400 border border-[#1E293B] tracking-wider select-all">
              {ussdCodes.unanswered}
            </div>
            <span className="text-[11px] text-slate-400 block">
              Rings Sakthi's phone for {formData.forwardingTimeoutSeconds} seconds first before routing.
            </span>
          </div>

          {/* When unreachable */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Forward When Unreachable</span>
              <button
                type="button"
                onClick={() => handleCopy(ussdCodes.unreachable, 'unreachable')}
                className="text-xs text-[#477BFF] hover:text-white flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'unreachable' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'unreachable' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#080B14] font-mono text-xs text-emerald-400 border border-[#1E293B] tracking-wider select-all">
              {ussdCodes.unreachable}
            </div>
            <span className="text-[11px] text-slate-400 block">
              Routes to YAZHI when phone is switched off or out of coverage.
            </span>
          </div>

          {/* Cancel code */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Cancel Forwarding</span>
              <button
                type="button"
                onClick={() => handleCopy(ussdCodes.cancel, 'cancel')}
                className="text-xs text-[#477BFF] hover:text-white flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'cancel' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'cancel' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#080B14] font-mono text-xs text-slate-300 border border-[#1E293B] tracking-wider select-all">
              {ussdCodes.cancel}
            </div>
            <span className="text-[11px] text-slate-400 block">
              Deactivates unanswered call forwarding anytime.
            </span>
          </div>

        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Forwarding Timing & Number */}
        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#477BFF]" />
            Timing & Forwarding Rules
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Exotel Virtual Forwarding Trunk Number
            </label>
            <input
              type="text"
              value={formData.forwardingNumber}
              onChange={(e) => setFormData({ ...formData, forwardingNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white font-mono focus:outline-none focus:border-[#477BFF]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Unanswered Ringing Duration Before AI Answers
              </label>
              <span className="text-sm font-bold text-[#477BFF] font-mono">
                {formData.forwardingTimeoutSeconds} Seconds
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={formData.forwardingTimeoutSeconds}
              onChange={(e) => setFormData({ ...formData, forwardingTimeoutSeconds: Number(e.target.value) })}
              className="w-full accent-[#477BFF]"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>10s (Fast)</span>
              <span>20s</span>
              <span>25s (Default Recommended)</span>
              <span>30s (Max)</span>
            </div>
          </div>

          {/* Working hours */}
          <div className="pt-2 border-t border-[#1E293B] space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Active Operational Window
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.workingHoursStart}
                  onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.workingHoursEnd}
                  onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-[#477BFF]"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B] cursor-pointer">
              <span className="text-xs text-slate-200 font-medium">Screen calls during weekends</span>
              <input
                type="checkbox"
                checked={formData.weekendAvailability}
                onChange={(e) => setFormData({ ...formData, weekendAvailability: e.target.checked })}
                className="rounded text-[#477BFF]"
              />
            </label>
          </div>
        </div>

        {/* Emergency Bypass Keywords */}
        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-400" />
              Emergency Bypass Triggers
            </h3>
            <span className="text-[11px] text-red-400 font-semibold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
              Immediate High Alert
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            If a caller speaks any of these keywords during their initial statements, YAZHI immediately classifies the call as <strong className="text-red-400">URGENT</strong> and triggers emergency notification overrides.
          </p>

          <div className="flex flex-wrap gap-2">
            {formData.emergencyKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(idx)}
                  className="text-red-400 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add keyword (e.g. ICU, urgent flight, family hospital)..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-4 py-2 rounded-xl bg-[#151B2B] hover:bg-[#1E293B] text-xs font-bold text-slate-200 border border-[#1E293B] flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

      </div>

    </form>
  );
};
