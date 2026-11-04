import React, { useState } from 'react';
import { X, UserPlus, Save, ShieldCheck } from 'lucide-react';
import { Contact } from '../types';

interface ContactModalProps {
  contact?: Contact | null;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt'>) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  contact,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(contact?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(contact?.phoneNumber || '');
  const [organization, setOrganization] = useState(contact?.organization || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [category, setCategory] = useState<Contact['category']>(contact?.category || 'General');
  const [importance, setImportance] = useState<Contact['importance']>(contact?.importance || 'Normal');
  const [isTrusted, setIsTrusted] = useState(contact?.isTrusted || false);
  const [customHandlingNotes, setCustomHandlingNotes] = useState(contact?.customHandlingNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) return;

    onSave({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      organization: organization.trim() || undefined,
      email: email.trim() || undefined,
      category,
      importance,
      isTrusted,
      customHandlingNotes: customHandlingNotes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0E1322] border border-[#1E293B] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#477BFF]/15 text-[#477BFF]">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">
              {contact ? 'Edit Contact Details' : 'Add New Contact'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Sundaramoorthy"
              className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF] font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Organization
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Aegis Academy"
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Contact['category'])}
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#477BFF]"
              >
                <option value="Business">Business</option>
                <option value="Aegis Academy">Aegis Academy</option>
                <option value="Professional">Professional</option>
                <option value="Internship">Internship</option>
                <option value="College">College</option>
                <option value="VIP">VIP</option>
                <option value="Personal">Personal</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Importance Level
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value as Contact['importance'])}
                className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#477BFF]"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sundar@annauniv.edu"
              className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Custom AI Handling Notes for YAZHI
            </label>
            <textarea
              value={customHandlingNotes}
              onChange={(e) => setCustomHandlingNotes(e.target.value)}
              placeholder="e.g. Academic partner; always notify Sakthi immediately upon completion."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#151B2B] border border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Trusted Contact Rule</span>
                <span className="text-[11px] text-slate-400">YAZHI recognizes caller by name immediately</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isTrusted}
                onChange={(e) => setIsTrusted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#477BFF]"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-[#477BFF]/20"
            >
              <Save className="w-3.5 h-3.5" /> Save Contact
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
