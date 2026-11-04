import { 
  CallRecord, Contact, AssistantSettings, CallHandlingSettings, 
  NotificationSettings, DashboardStats, PriorityLevel, CallSummary, TranscriptItem 
} from '../types';

const STORAGE_KEYS = {
  CALLS: 'yazhi_calls_v1',
  CONTACTS: 'yazhi_contacts_v1',
  ASSISTANT: 'yazhi_assistant_v1',
  HANDLING: 'yazhi_handling_v1',
  NOTIFICATIONS: 'yazhi_notifications_v1',
  LOGS: 'yazhi_logs_v1',
};

// Initial Seed Data for Sakthi
const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    name: 'Dr. Sundaramoorthy',
    phoneNumber: '+91 98401 23456',
    organization: 'Anna University / Aegis Partner',
    email: 'sundar@annauniv.edu',
    category: 'College',
    importance: 'High',
    isTrusted: true,
    customHandlingNotes: 'Academic Dean; flag research calls immediately.',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'cnt-2',
    name: 'Priya Raman',
    phoneNumber: '+91 97123 45678',
    organization: 'HyperScale Cloud Labs',
    email: 'priya@hyperscalelabs.io',
    category: 'Business',
    importance: 'High',
    isTrusted: true,
    customHandlingNotes: 'Enterprise client discussing AI infrastructure contract.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'cnt-3',
    name: 'Kavitha M.',
    phoneNumber: '+91 98845 67890',
    organization: 'Aegis Academy Student Lead',
    email: 'kavitha@aegis.ac',
    category: 'Aegis Academy',
    importance: 'Normal',
    isTrusted: true,
    customHandlingNotes: 'Student coordinator for upcoming AI Hackathon.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cnt-4',
    name: 'Vikram Chandran',
    phoneNumber: '+91 94440 11223',
    organization: 'Apex Venture Capital',
    email: 'vikram@apexvc.com',
    category: 'Business',
    importance: 'VIP',
    isTrusted: true,
    customHandlingNotes: 'Managing Partner; priority callback requested.',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'cnt-5',
    name: 'Rohan Sharma',
    phoneNumber: '+91 80123 99999',
    organization: 'QuickFin Commercial',
    email: 'rohan@quickfin.in',
    category: 'General',
    importance: 'Low',
    isTrusted: false,
    customHandlingNotes: 'Telemarketer offering commercial line of credit.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'call-101',
    callerPhone: '+91 97123 45678',
    callerName: 'Priya Raman',
    organization: 'HyperScale Cloud Labs',
    callStartTime: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    callEndTime: new Date(Date.now() - 1000 * 60 * 72).toISOString(),
    durationSeconds: 165,
    status: 'AI Answered',
    category: 'Business',
    priority: 'HIGH',
    callbackRequested: true,
    callbackPreference: 'Today evening after 5:00 PM',
    privateNotes: 'HyperScale board approved SLA revisions. Sakthi needs to review addendum PDF in email.',
    summary: {
      purpose: 'Urgent review of revised AI deployment SLA terms.',
      keyPoints: [
        'HyperScale is finalizing their quarterly vendor onboarding.',
        'Requested a brief 10-minute check-in with Sakthi.',
        'Confirmed final proposal document was sent to Sakthi’s email.'
      ],
      actionItems: [
        'Sakthi to review HyperScale proposal in inbox.',
        'Schedule brief callback today evening after 5:00 PM.'
      ],
      callerSentiment: 'Professional & Warm',
      summaryText: 'Priya Raman from HyperScale called regarding final SLA sign-off. YAZHI gathered requirements, confirmed Sakthi’s unavailability, and scheduled a callback.',
      urgencyReason: 'Quarterly enterprise onboarding deadline today at 6 PM.',
      priority: 'HIGH',
      callbackRequested: true,
      callbackPreference: 'Today evening after 5:00 PM',
      category: 'Business'
    },
    transcripts: [
      { speaker: 'assistant', content: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
      { speaker: 'caller', content: "Hi YAZHI, this is Priya Raman from HyperScale Cloud Labs. I'm calling for Sakthi regarding our AI deployment contract terms." },
      { speaker: 'assistant', content: "Hello Priya. Thank you for reaching out. Sakthi is in a deep work session right now. Could you share the key update you'd like me to pass along?" },
      { speaker: 'caller', content: "Our executive board accepted his proposed revisions. We just need him to review the final addendum before 6 PM today so we can activate the cluster." },
      { speaker: 'assistant', content: "Understood. I will mark this as high priority and notify Sakthi immediately with your callback request for this evening. Is there anything else you'd like me to pass along?" },
      { speaker: 'caller', content: "No, that is perfect YAZHI. Thank you so much!" },
      { speaker: 'assistant', content: "You're welcome Priya. Have a great day!" }
    ],
    isSimulation: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    id: 'call-102',
    callerPhone: '+91 98845 67890',
    callerName: 'Kavitha M.',
    organization: 'Aegis Academy',
    callStartTime: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    callEndTime: new Date(Date.now() - 1000 * 60 * 238).toISOString(),
    durationSeconds: 142,
    status: 'Completed',
    category: 'Aegis Academy',
    priority: 'NORMAL',
    callbackRequested: false,
    privateNotes: 'Hackathon registrations confirmed at 240 students.',
    summary: {
      purpose: 'Update on Aegis Academy upcoming AI Hackathon registration milestone.',
      keyPoints: [
        'Registrations crossed 240 students across 6 partner engineering colleges.',
        'Student council finalized venue booking at main auditorium.'
      ],
      actionItems: [
        'Review Hackathon problem statements draft when free.'
      ],
      callerSentiment: 'Enthusiastic',
      summaryText: 'Kavitha updated YAZHI that 240 students enrolled for the Aegis AI Hackathon. No urgent callback required.',
      priority: 'NORMAL',
      callbackRequested: false,
      category: 'Aegis Academy'
    },
    transcripts: [
      { speaker: 'assistant', content: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?" },
      { speaker: 'caller', content: "Hi YAZHI, it's Kavitha from Aegis Academy. Just wanted to let Sakthi know that registration crossed our target of 200 participants!" },
      { speaker: 'assistant', content: "That's wonderful news Kavitha! I have noted the registration milestone and will include it in Sakthi's daily briefing." },
      { speaker: 'caller', content: "Thanks YAZHI! Tell him the council is ready for his review tomorrow." }
    ],
    isSimulation: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'call-103',
    callerPhone: '+91 94440 11223',
    callerName: 'Vikram Chandran',
    organization: 'Apex Venture Capital',
    callStartTime: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    callEndTime: new Date(Date.now() - 1000 * 60 * 417).toISOString(),
    durationSeconds: 180,
    status: 'AI Answered',
    category: 'Business',
    priority: 'HIGH',
    callbackRequested: true,
    callbackPreference: 'Tomorrow morning 10 AM',
    privateNotes: 'Apex VC seed round co-investment syndicate opportunity.',
    summary: {
      purpose: 'Discussing co-investment in new generative AI infrastructure startup.',
      keyPoints: [
        'Apex VC is leading a $2.5M seed round for developer tooling.',
        'Vikram wants Sakthi as technical advisor / angel syndicate participant.'
      ],
      actionItems: [
        'Schedule 15-minute call tomorrow at 10 AM.'
      ],
      callerSentiment: 'Respectful & Urgent',
      summaryText: 'Vikram from Apex VC called regarding technical advisory on an AI infrastructure round. Flagged for Sakthi’s attention.',
      priority: 'HIGH',
      callbackRequested: true,
      callbackPreference: 'Tomorrow morning 10 AM',
      category: 'Business'
    },
    transcripts: [
      { speaker: 'assistant', content: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. May I know your name and how I can help you?" },
      { speaker: 'caller', content: "Hi, Vikram Chandran here from Apex VC. Looking to connect with Sakthi regarding an investment syndicate." }
    ],
    isSimulation: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
  },
  {
    id: 'call-104',
    callerPhone: '+91 99551 88888',
    callerName: 'Sanjay Verma',
    organization: 'IIT Madras Research Lab',
    callStartTime: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    callEndTime: new Date(Date.now() - 1000 * 60 * 596).toISOString(),
    durationSeconds: 210,
    status: 'AI Answered',
    category: 'Project Collaboration',
    priority: 'NORMAL',
    callbackRequested: true,
    callbackPreference: 'Anytime this week',
    summary: {
      purpose: 'Inviting Sakthi as keynote guest speaker for AI Research Symposium.',
      keyPoints: [
        'Symposium scheduled for December 14th.',
        'Honorarium and travel arrangements handled by IIT Madras.'
      ],
      actionItems: [
        'Check calendar availability for Dec 14th keynote.'
      ],
      callerSentiment: 'Respectful',
      summaryText: 'Sanjay from IIT Madras reached out to invite Sakthi as guest keynote speaker for the annual AI Symposium.',
      priority: 'NORMAL',
      callbackRequested: true,
      category: 'Project Collaboration'
    },
    transcripts: [],
    isSimulation: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
  {
    id: 'call-105',
    callerPhone: '+91 80123 99999',
    callerName: 'Rohan Sharma',
    organization: 'QuickFin Commercial',
    callStartTime: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
    callEndTime: new Date(Date.now() - 1000 * 60 * 899).toISOString(),
    durationSeconds: 45,
    status: 'AI Answered',
    category: 'Spam',
    priority: 'LOW',
    callbackRequested: false,
    summary: {
      purpose: 'Unsolicited pre-approved credit line sales offer.',
      keyPoints: [
        'Sales representative offering unsecured commercial credit line.',
        'YAZHI politely declined commercial solicitations per policy.'
      ],
      actionItems: ['No action required.'],
      callerSentiment: 'Promotional',
      summaryText: 'QuickFin cold call offering commercial credit line. YAZHI declined politely and terminated the call.',
      priority: 'LOW',
      callbackRequested: false,
      category: 'Spam'
    },
    transcripts: [],
    isSimulation: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
  }
];

export const StorageService = {
  getCalls(): CallRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CALLS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(INITIAL_CALLS));
      return INITIAL_CALLS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CALLS;
    }
  },

  saveCalls(calls: CallRecord[]) {
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
  },

  addCall(call: CallRecord) {
    const calls = this.getCalls();
    const updated = [call, ...calls];
    this.saveCalls(updated);
    return updated;
  },

  updateCall(id: string, partial: Partial<CallRecord>) {
    const calls = this.getCalls();
    const updated = calls.map(c => c.id === id ? { ...c, ...partial } : c);
    this.saveCalls(updated);
    return updated;
  },

  deleteCall(id: string) {
    const calls = this.getCalls();
    const updated = calls.filter(c => c.id !== id);
    this.saveCalls(updated);
    return updated;
  },

  getContacts(): Contact[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(INITIAL_CONTACTS));
      return INITIAL_CONTACTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CONTACTS;
    }
  },

  saveContacts(contacts: Contact[]) {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  },

  addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Contact {
    const contacts = this.getContacts();
    const newContact: Contact = {
      ...contact,
      id: 'cnt-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.saveContacts([newContact, ...contacts]);
    return newContact;
  },

  updateContact(id: string, updatedData: Partial<Contact>) {
    const contacts = this.getContacts();
    const updated = contacts.map(c => c.id === id ? { ...c, ...updatedData } : c);
    this.saveContacts(updated);
    return updated;
  },

  deleteContact(id: string) {
    const contacts = this.getContacts();
    const updated = contacts.filter(c => c.id !== id);
    this.saveContacts(updated);
    return updated;
  },

  getAssistantSettings(): AssistantSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSISTANT);
    if (!raw) {
      const defaults: AssistantSettings = {
        assistantName: 'YAZHI',
        voicePersonality: 'Zephyr',
        primaryLanguage: 'English',
        openingMessage: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?",
        responseStyle: 'Professional, intelligent, polite, confident and friendly',
        maxCallDurationSeconds: 300,
        conversationTimeoutSeconds: 20,
        collectCallbackInfo: true,
        priorityClassificationEnabled: true,
        approvedBusinessInfo: 'Sakthinathan Jayakumar (Sakthi) is a technology architect, AI researcher, and founder/educator at Aegis Academy. He is open to strategic partnerships, student mentorship, and technology consulting.',
        approvedFaqs: [
          { q: 'What is Aegis Academy?', a: 'Aegis Academy is Sakthi’s technical training and research institute focusing on advanced AI, systems architecture, and engineering.' },
          { q: 'Is Sakthi accepting student internship inquiries?', a: 'Yes, Sakthi reviews student internship applications for Aegis Academy and research projects based on technical merit.' },
          { q: 'When can Sakthi return my call?', a: 'Sakthi reviews prioritized summaries from YAZHI throughout the day and calls back urgent or scheduled inquiries as soon as free.' }
        ],
        isActive: true
      };
      localStorage.setItem(STORAGE_KEYS.ASSISTANT, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        assistantName: 'YAZHI',
        voicePersonality: 'Zephyr',
        primaryLanguage: 'English',
        openingMessage: "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?",
        responseStyle: 'Professional, intelligent, polite, confident and friendly',
        maxCallDurationSeconds: 300,
        conversationTimeoutSeconds: 20,
        collectCallbackInfo: true,
        priorityClassificationEnabled: true,
        approvedBusinessInfo: 'Sakthinathan Jayakumar (Sakthi) is a technology architect, AI researcher, and founder/educator at Aegis Academy.',
        approvedFaqs: [],
        isActive: true
      };
    }
  },

  saveAssistantSettings(settings: AssistantSettings) {
    localStorage.setItem(STORAGE_KEYS.ASSISTANT, JSON.stringify(settings));
  },

  getCallHandlingSettings(): CallHandlingSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.HANDLING);
    if (!raw) {
      const defaults: CallHandlingSettings = {
        aiEnabled: true,
        unansweredForwardingEnabled: true,
        forwardingTimeoutSeconds: 25,
        telecomProvider: 'Airtel India',
        forwardingNumber: '+91 80 4719 9999',
        workingHoursStart: '09:00',
        workingHoursEnd: '20:00',
        weekendAvailability: true,
        emergencyBypassEnabled: true,
        emergencyKeywords: ['hospital', 'accident', 'medical emergency', 'critical failure', 'immediate family']
      };
      localStorage.setItem(STORAGE_KEYS.HANDLING, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        aiEnabled: true,
        unansweredForwardingEnabled: true,
        forwardingTimeoutSeconds: 25,
        telecomProvider: 'Airtel India',
        forwardingNumber: '+91 80 4719 9999',
        workingHoursStart: '09:00',
        workingHoursEnd: '20:00',
        weekendAvailability: true,
        emergencyBypassEnabled: true,
        emergencyKeywords: ['hospital', 'accident', 'medical emergency']
      };
    }
  },

  saveCallHandlingSettings(settings: CallHandlingSettings) {
    localStorage.setItem(STORAGE_KEYS.HANDLING, JSON.stringify(settings));
  },

  getNotificationSettings(): NotificationSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      const defaults: NotificationSettings = {
        telegramEnabled: true,
        telegramBotToken: '',
        telegramChatId: '',
        notifyOnAllCalls: true,
        notifyOnUrgentOnly: false,
        includeTranscriptPreview: true,
        sendAudioRecording: false
      };
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        telegramEnabled: true,
        telegramBotToken: '',
        telegramChatId: '',
        notifyOnAllCalls: true,
        notifyOnUrgentOnly: false,
        includeTranscriptPreview: true,
        sendAudioRecording: false
      };
    }
  },

  saveNotificationSettings(settings: NotificationSettings) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(settings));
  },

  getDashboardStats(): DashboardStats {
    const calls = this.getCalls();
    const totalCalls = calls.length;
    const aiAnsweredCalls = calls.filter(c => c.status === 'AI Answered' || c.status === 'Completed').length;
    const missedCalls = calls.filter(c => c.status === 'Missed').length;
    const urgentCalls = calls.filter(c => c.priority === 'URGENT').length;
    const importantCalls = calls.filter(c => c.priority === 'URGENT' || c.priority === 'HIGH').length;
    
    const durations = calls.map(c => c.durationSeconds).filter(d => d > 0);
    const averageDurationSeconds = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    return {
      totalCalls,
      aiAnsweredCalls,
      missedCalls,
      importantCalls,
      urgentCalls,
      averageDurationSeconds,
      totalAiConversations: aiAnsweredCalls,
      systemStatus: {
        gemini: 'Connected',
        telephony: 'Connected',
        database: 'Connected',
        telegram: 'Connected'
      }
    };
  }
};
