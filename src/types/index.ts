export type PriorityLevel = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export type CallStatus = 
  | 'AI Answered' 
  | 'Owner Answered' 
  | 'Missed' 
  | 'Failed' 
  | 'Completed' 
  | 'Transferred' 
  | 'In Progress';

export interface TranscriptItem {
  speaker: 'caller' | 'assistant' | 'system';
  content: string;
  timestampOffsetMs?: number;
  timeStr?: string;
}

export interface CallSummary {
  purpose: string;
  keyPoints: string[];
  actionItems: string[];
  callerSentiment: string;
  summaryText: string;
  urgencyReason?: string;
  priority: PriorityLevel;
  callbackRequested: boolean;
  callbackPreference?: string;
  category: string;
}

export interface CallRecord {
  id: string;
  callerPhone: string;
  callerName?: string;
  organization?: string;
  callStartTime: string;
  callEndTime?: string;
  durationSeconds: number;
  status: CallStatus;
  category: string;
  priority: PriorityLevel;
  callbackRequested: boolean;
  callbackPreference?: string;
  privateNotes?: string;
  recordingUrl?: string;
  recordingConsentObtained?: boolean;
  summary?: CallSummary;
  transcripts: TranscriptItem[];
  isSimulation: boolean;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  organization?: string;
  email?: string;
  category: 'Business' | 'Aegis Academy' | 'Professional' | 'Internship' | 'College' | 'Personal' | 'VIP' | 'General';
  importance: 'Low' | 'Normal' | 'High' | 'VIP';
  isTrusted: boolean;
  customHandlingNotes?: string;
  createdAt: string;
}

export interface AssistantSettings {
  assistantName: string;
  voicePersonality: 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir' | 'Kore';
  primaryLanguage: string;
  openingMessage: string;
  responseStyle: string;
  maxCallDurationSeconds: number;
  conversationTimeoutSeconds: number;
  collectCallbackInfo: boolean;
  priorityClassificationEnabled: boolean;
  approvedBusinessInfo: string;
  approvedFaqs: { q: string; a: string }[];
  isActive: boolean;
}

export interface CallHandlingSettings {
  aiEnabled: boolean;
  unansweredForwardingEnabled: boolean;
  forwardingTimeoutSeconds: number;
  telecomProvider: string;
  forwardingNumber: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  weekendAvailability: boolean;
  emergencyBypassEnabled: boolean;
  emergencyKeywords: string[];
}

export interface NotificationSettings {
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  notifyOnAllCalls: boolean;
  notifyOnUrgentOnly: boolean;
  includeTranscriptPreview: boolean;
  sendAudioRecording: boolean;
}

export interface SystemStatus {
  gemini: 'Connected' | 'Disconnected' | 'Testing';
  telephony: 'Connected' | 'Disconnected' | 'Testing';
  database: 'Connected' | 'Disconnected' | 'Testing';
  telegram: 'Connected' | 'Disconnected' | 'Testing';
}

export interface DashboardStats {
  totalCalls: number;
  aiAnsweredCalls: number;
  missedCalls: number;
  importantCalls: number;
  urgentCalls: number;
  averageDurationSeconds: number;
  totalAiConversations: number;
  systemStatus: SystemStatus;
}
