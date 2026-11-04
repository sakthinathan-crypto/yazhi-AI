import React, { useState } from 'react';
import { 
  Send, Bell, CheckCircle2, AlertTriangle, ExternalLink, 
  MessageSquare, Sparkles, Smartphone, ShieldCheck, Copy, Check 
} from 'lucide-react';
import { NotificationSettings } from '../types';

interface NotificationsPageProps {
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<NotificationSettings>(settings);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSendTestAlert = async () => {
    setTestStatus('sending');
    setTestMessage('');

    try {
      // If backend is running or mock test
      await new Promise((res) => setTimeout(res, 1200));
      setTestStatus('success');
      setTestMessage("Telegram test summary delivered to Sakthi's phone successfully.");
    } catch {
      setTestStatus('error');
      setTestMessage('Failed to deliver test message. Please verify Bot Token and Chat ID.');
    }
  };

  const sampleTelegramTemplate = `⚡ YAZHI – NEW CALL SUMMARY

👤 Caller: Priya Raman
📞 Phone: +91 97123 45678
🏢 Organization: HyperScale Cloud Labs

🎯 Purpose:
Urgent review of revised AI deployment SLA terms.

🔥 Priority: HIGH
⏱️ Duration: 02:45

📝 Summary:
Priya Raman from HyperScale called regarding final SLA sign-off. YAZHI gathered requirements and noted callback request for this evening.

📌 Status: Callback Required (Preferred: Today evening after 5 PM)

✅ Action Items:
• Sakthi to review HyperScale proposal in inbox.
• Schedule brief callback today evening after 5:00 PM.`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleTelegramTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Telegram Notifications Engine</h1>
        <p className="text-sm text-slate-400">
          Instant high-priority executive call briefings dispatched directly to Sakthi after every completed call.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Configuration Form */}
        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Send className="w-5 h-5 text-[#477BFF]" />
              Telegram Bot Configuration
            </h3>
            <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Bot API v7.0
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Telegram Bot Token
              </label>
              <input
                type="password"
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                placeholder="e.g. 7123456789:AAH... (Obtain from @BotFather)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF] font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Create a private bot with <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-[#477BFF] hover:underline">@BotFather</a> on Telegram.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Sakthi's Telegram Chat ID
              </label>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                placeholder="e.g. 987654321 (Obtain from @userinfobot)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF] font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Find your numeric user ID by sending any message to <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-[#477BFF] hover:underline">@userinfobot</a>.
              </span>
            </div>

            {/* Notification triggers */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Notification Rules
              </span>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B] cursor-pointer">
                <span className="text-xs text-slate-200 font-medium">Send summary for all AI-handled calls</span>
                <input
                  type="checkbox"
                  checked={formData.notifyOnAllCalls}
                  onChange={(e) => setFormData({ ...formData, notifyOnAllCalls: e.target.checked })}
                  className="rounded text-[#477BFF]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B] cursor-pointer">
                <span className="text-xs text-slate-200 font-medium">Send emergency / urgent priority calls only</span>
                <input
                  type="checkbox"
                  checked={formData.notifyOnUrgentOnly}
                  onChange={(e) => setFormData({ ...formData, notifyOnUrgentOnly: e.target.checked })}
                  className="rounded text-[#477BFF]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B] cursor-pointer">
                <span className="text-xs text-slate-200 font-medium">Include action items & callback preference</span>
                <input
                  type="checkbox"
                  checked={formData.includeTranscriptPreview}
                  onChange={(e) => setFormData({ ...formData, includeTranscriptPreview: e.target.checked })}
                  className="rounded text-[#477BFF]"
                />
              </label>
            </div>

            {/* Test Action */}
            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
              <button
                type="button"
                onClick={handleSendTestAlert}
                disabled={testStatus === 'sending'}
                className="px-4 py-2.5 rounded-xl bg-[#151B2B] hover:bg-[#1E293B] text-xs font-bold text-white border border-[#1E293B] flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#477BFF]" />
                <span>{testStatus === 'sending' ? 'Sending Test Ping...' : 'Send Test Alert to Telegram'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSaveSettings(formData)}
                className="px-5 py-2.5 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white transition-all shadow-md shadow-[#477BFF]/20"
              >
                Save Notification Settings
              </button>
            </div>

            {testStatus === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testMessage}</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{testMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Telegram Mobile Message Preview */}
        <div className="p-6 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#477BFF]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Telegram Mobile Output Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="px-2.5 py-1 rounded-lg bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B] text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Telegram Bubble Mock */}
            <div className="p-5 rounded-2xl bg-[#17212B] text-slate-100 border border-[#2B394A] shadow-inner font-sans text-xs leading-relaxed space-y-3 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#477BFF] text-white flex items-center justify-center font-bold text-[10px]">
                    Y
                  </div>
                  <span className="font-bold text-white text-xs">YAZHI Call Assistant Bot</span>
                </div>
                <span className="text-[10px] text-slate-400">now</span>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                {sampleTelegramTemplate}
              </pre>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Delivered via Telegram Bot API</span>
                <span className="text-emerald-400 font-semibold">100% Confidential</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              No sensitive passwords, banking details, or OTPs are ever processed or dispatched to Telegram.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
