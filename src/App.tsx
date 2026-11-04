import React, { useState, useEffect } from 'react';
import { StorageService } from './services/api';
import { 
  CallRecord, Contact, AssistantSettings, CallHandlingSettings, 
  NotificationSettings, DashboardStats 
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { CallHistoryPage } from './pages/CallHistoryPage';
import { LiveCallsPage } from './pages/LiveCallsPage';
import { ContactsPage } from './pages/ContactsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { CallDetailModal } from './components/CallDetailModal';
import { ContactModal } from './components/ContactModal';
import { CallSimulatorModal } from './components/CallSimulatorModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Core Persistent State
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [assistantSettings, setAssistantSettings] = useState<AssistantSettings>(StorageService.getAssistantSettings());
  const [callHandlingSettings, setCallHandlingSettings] = useState<CallHandlingSettings>(StorageService.getCallHandlingSettings());
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(StorageService.getNotificationSettings());

  // Modal States
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Load Initial Data
  useEffect(() => {
    setCalls(StorageService.getCalls());
    setContacts(StorageService.getContacts());
    setAssistantSettings(StorageService.getAssistantSettings());
    setCallHandlingSettings(StorageService.getCallHandlingSettings());
    setNotificationSettings(StorageService.getNotificationSettings());
  }, []);

  // Compute live dashboard stats
  const totalCalls = calls.length;
  const aiAnsweredCalls = calls.filter(c => c.status === 'AI Answered' || c.status === 'Completed').length;
  const missedCalls = calls.filter(c => c.status === 'Missed').length;
  const urgentCalls = calls.filter(c => c.priority === 'URGENT').length;
  const importantCalls = calls.filter(c => c.priority === 'URGENT' || c.priority === 'HIGH').length;
  const durations = calls.map(c => c.durationSeconds).filter(d => d > 0);
  const averageDurationSeconds = durations.length > 0 
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) 
    : 0;

  const stats: DashboardStats = {
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

  // Call Handlers
  const handleUpdateNotes = (callId: string, notes: string) => {
    const updated = StorageService.updateCall(callId, { privateNotes: notes });
    setCalls(updated);
    if (selectedCall && selectedCall.id === callId) {
      setSelectedCall({ ...selectedCall, privateNotes: notes });
    }
  };

  const handleToggleCallback = (callId: string) => {
    const call = calls.find(c => c.id === callId);
    if (!call) return;
    const updated = StorageService.updateCall(callId, { callbackRequested: !call.callbackRequested });
    setCalls(updated);
    if (selectedCall && selectedCall.id === callId) {
      setSelectedCall({ ...selectedCall, callbackRequested: !call.callbackRequested });
    }
  };

  const handleDeleteCall = (callId: string) => {
    const updated = StorageService.deleteCall(callId);
    setCalls(updated);
  };

  const handleCallSimulated = (newCall: CallRecord) => {
    const updated = StorageService.addCall(newCall);
    setCalls(updated);
  };

  // Contact Handlers
  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    if (editingContact) {
      const updated = StorageService.updateContact(editingContact.id, contactData);
      setContacts(updated);
    } else {
      StorageService.addContact(contactData);
      setContacts(StorageService.getContacts());
    }
    setEditingContact(null);
  };

  const handleDeleteContact = (contactId: string) => {
    const updated = StorageService.deleteContact(contactId);
    setContacts(updated);
  };

  // Settings Handlers
  const handleSaveAssistantSettings = (newSettings: AssistantSettings) => {
    StorageService.saveAssistantSettings(newSettings);
    setAssistantSettings(newSettings);
  };

  const handleSaveHandlingSettings = (newSettings: CallHandlingSettings) => {
    StorageService.saveCallHandlingSettings(newSettings);
    setCallHandlingSettings(newSettings);
  };

  const handleSaveNotificationSettings = (newSettings: NotificationSettings) => {
    StorageService.saveNotificationSettings(newSettings);
    setNotificationSettings(newSettings);
  };

  const handleToggleAiActive = () => {
    const updated = { ...assistantSettings, isActive: !assistantSettings.isActive };
    handleSaveAssistantSettings(updated);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          stats={stats}
          isAiActive={assistantSettings.isActive}
          onToggleAi={handleToggleAiActive}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onNavigate={setCurrentTab}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              stats={stats}
              recentCalls={calls}
              onSelectCall={setSelectedCall}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'call_history' && (
            <CallHistoryPage
              calls={calls}
              onSelectCall={setSelectedCall}
              onDeleteCall={handleDeleteCall}
              onToggleCallback={handleToggleCallback}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {currentTab === 'live_calls' && (
            <LiveCallsPage
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onSelectCall={setSelectedCall}
            />
          )}

          {currentTab === 'contacts' && (
            <ContactsPage
              contacts={contacts}
              calls={calls}
              onAddContact={() => {
                setEditingContact(null);
                setIsContactModalOpen(true);
              }}
              onEditContact={(contact) => {
                setEditingContact(contact);
                setIsContactModalOpen(true);
              }}
              onDeleteContact={handleDeleteContact}
              onSelectCall={setSelectedCall}
            />
          )}

          {currentTab === 'ai_assistant' && (
            <AiAssistantPage
              settings={assistantSettings}
              onSaveSettings={handleSaveAssistantSettings}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage stats={stats} />
          )}

          {currentTab === 'notifications' && (
            <NotificationsPage
              settings={notificationSettings}
              onSaveSettings={handleSaveNotificationSettings}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={callHandlingSettings}
              onSaveSettings={handleSaveHandlingSettings}
            />
          )}

          {currentTab === 'integrations' && (
            <IntegrationsPage />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
          onUpdateNotes={handleUpdateNotes}
          onToggleCallback={handleToggleCallback}
          onDeleteCall={handleDeleteCall}
        />
      )}

      {isContactModalOpen && (
        <ContactModal
          contact={editingContact}
          onClose={() => {
            setIsContactModalOpen(false);
            setEditingContact(null);
          }}
          onSave={handleSaveContact}
        />
      )}

      {isSimulatorOpen && (
        <CallSimulatorModal
          onClose={() => setIsSimulatorOpen(false)}
          onCallCompleted={(newCall) => {
            handleCallSimulated(newCall);
          }}
        />
      )}

    </div>
  );
}
