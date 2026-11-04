import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Building2, Phone, Mail, 
  ShieldCheck, Star, Edit, Trash2, PhoneCall, ChevronRight 
} from 'lucide-react';
import { Contact, CallRecord } from '../types';

interface ContactsPageProps {
  contacts: Contact[];
  calls: CallRecord[];
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onSelectCall: (call: CallRecord) => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  contacts,
  calls,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onSelectCall
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery) ||
      (c.organization && c.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCallCountForContact = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return calls.filter(c => c.callerPhone.replace(/[^0-9]/g, '').includes(cleanPhone.slice(-8))).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Contact Management</h1>
          <p className="text-sm text-slate-400">
            Maintain authorized directory, trusted callers, and custom AI handling instructions.
          </p>
        </div>
        <button
          onClick={onAddContact}
          className="px-4 py-2 rounded-xl bg-[#477BFF] hover:bg-[#3b6ee0] text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#477BFF]/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Contact
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 rounded-2xl bg-[#0E1322] border border-[#1E293B] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, organization..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['ALL', 'Business', 'Aegis Academy', 'College', 'VIP', 'General'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#477BFF] text-white shadow-md shadow-[#477BFF]/20'
                  : 'bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const callCount = getCallCountForContact(contact.phoneNumber);
          return (
            <div
              key={contact.id}
              className="p-5 rounded-2xl bg-[#0E1322] border border-[#1E293B] hover:border-[#477BFF]/40 transition-all shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#477BFF]/20 to-[#477BFF]/5 text-[#477BFF] border border-[#477BFF]/30 flex items-center justify-center font-bold text-base">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-[#477BFF] transition-colors">
                          {contact.name}
                        </h3>
                        {contact.isTrusted && (
                          <span title="Trusted Contact (Immediate Recognition)">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-slate-400 block">{contact.phoneNumber}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    contact.importance === 'VIP' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    contact.importance === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {contact.importance}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  {contact.organization && (
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> {contact.organization}
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {contact.email}
                    </div>
                  )}
                </div>

                {contact.customHandlingNotes && (
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] text-[11px] text-slate-300 leading-relaxed">
                    <span className="text-[#477BFF] font-semibold">YAZHI Instruction: </span>
                    {contact.customHandlingNotes}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <PhoneCall className="w-3 h-3 text-slate-500" /> {callCount} recorded calls
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditContact(contact)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete contact ${contact.name}?`)) {
                        onDeleteContact(contact.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
