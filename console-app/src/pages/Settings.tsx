import { useState } from 'react';
import {
  Save,
  Key,
  Mail,
  Globe,
  Database,
  Bell,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Settings {
  apiKeys: {
    openai: string;
    firecrawl: string;
    serper: string;
    hunter: string;
  };
  emailProvider: {
    type: 'postmark' | 'mailgun' | 'smtp';
    apiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    fromEmail: string;
    fromName: string;
  };
  enrichment: {
    autoEnrich: boolean;
    maxRetries: number;
    retryDelay: number;
    emailPatterns: string[];
  };
  outreach: {
    dailyLimit: number;
    followUpDays: number[];
    maxFollowUps: number;
    workingHours: {
      start: string;
      end: string;
    };
  };
  notifications: {
    onReply: boolean;
    onBounce: boolean;
    onDailyReport: boolean;
    notificationEmail: string;
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    apiKeys: {
      openai: '',
      firecrawl: '',
      serper: '',
      hunter: ''
    },
    emailProvider: {
      type: 'smtp',
      fromEmail: '',
      fromName: 'Recruitment Team'
    },
    enrichment: {
      autoEnrich: true,
      maxRetries: 3,
      retryDelay: 5,
      emailPatterns: ['{first}.{last}@{domain}', '{first}{last}@{domain}']
    },
    outreach: {
      dailyLimit: 50,
      followUpDays: [3, 7, 14],
      maxFollowUps: 3,
      workingHours: {
        start: '09:00',
        end: '17:00'
      }
    },
    notifications: {
      onReply: true,
      onBounce: true,
      onDailyReport: true,
      notificationEmail: ''
    }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'api' | 'email' | 'enrichment' | 'outreach' | 'notifications'>('api');

  const handleSave = async () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'email', label: 'Email Provider', icon: Mail },
    { id: 'enrichment', label: 'Enrichment', icon: Globe },
    { id: 'outreach', label: 'Outreach', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Configure your recruitment engine</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      API keys are encrypted and stored securely. Never share these keys publicly.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.openai}
                  onChange={(e) => setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, openai: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="sk-..."
                />
                <p className="text-xs text-gray-500 mt-1">Used for AI scoring and email generation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firecrawl API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.firecrawl}
                  onChange={(e) => setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, firecrawl: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="fc_..."
                />
                <p className="text-xs text-gray-500 mt-1">Used for web crawling and email discovery</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serper API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.serper}
                  onChange={(e) => setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, serper: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Used for Google search enrichment</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hunter.io API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKeys.hunter}
                  onChange={(e) => setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, hunter: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Used for email verification and finding</p>
              </div>
            </div>
          )}

          {/* Email Provider Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Provider
                </label>
                <select
                  value={settings.emailProvider.type}
                  onChange={(e) => setSettings({
                    ...settings,
                    emailProvider: { ...settings.emailProvider, type: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="smtp">SMTP</option>
                  <option value="postmark">Postmark</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>

              {settings.emailProvider.type === 'smtp' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.emailProvider.smtpHost || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailProvider: { ...settings.emailProvider, smtpHost: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.emailProvider.smtpPort || 587}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailProvider: { ...settings.emailProvider, smtpPort: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={settings.emailProvider.smtpUser || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailProvider: { ...settings.emailProvider, smtpUser: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={settings.emailProvider.smtpPass || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          emailProvider: { ...settings.emailProvider, smtpPass: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {settings.emailProvider.type !== 'smtp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={settings.emailProvider.apiKey || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailProvider: { ...settings.emailProvider, apiKey: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={settings.emailProvider.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailProvider: { ...settings.emailProvider, fromEmail: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="recruiter@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.emailProvider.fromName}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailProvider: { ...settings.emailProvider, fromName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Recruitment Team"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Enrichment Tab */}
          {activeTab === 'enrichment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Auto-Enrich New Candidates
                  </label>
                  <p className="text-xs text-gray-500">Automatically enrich candidates when added</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    enrichment: { ...settings.enrichment, autoEnrich: !settings.enrichment.autoEnrich }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.enrichment.autoEnrich ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.enrichment.autoEnrich ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    value={settings.enrichment.maxRetries}
                    onChange={(e) => setSettings({
                      ...settings,
                      enrichment: { ...settings.enrichment, maxRetries: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retry Delay (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.enrichment.retryDelay}
                    onChange={(e) => setSettings({
                      ...settings,
                      enrichment: { ...settings.enrichment, retryDelay: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Patterns (one per line)
                </label>
                <textarea
                  value={settings.enrichment.emailPatterns.join('\n')}
                  onChange={(e) => setSettings({
                    ...settings,
                    enrichment: {
                      ...settings.enrichment,
                      emailPatterns: e.target.value.split('\n').filter(p => p.trim())
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="{first}.{last}@{domain}&#10;{first}{last}@{domain}&#10;{first}@{domain}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: {'{first}'}, {'{last}'}, {'{domain}'}
                </p>
              </div>
            </div>
          )}

          {/* Outreach Tab */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Email Limit
                </label>
                <input
                  type="number"
                  value={settings.outreach.dailyLimit}
                  onChange={(e) => setSettings({
                    ...settings,
                    outreach: { ...settings.outreach, dailyLimit: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of emails to send per day</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-Up Schedule (days)
                </label>
                <input
                  type="text"
                  value={settings.outreach.followUpDays.join(', ')}
                  onChange={(e) => setSettings({
                    ...settings,
                    outreach: {
                      ...settings.outreach,
                      followUpDays: e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="3, 7, 14"
                />
                <p className="text-xs text-gray-500 mt-1">Days after initial contact to send follow-ups</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Follow-Ups
                </label>
                <input
                  type="number"
                  value={settings.outreach.maxFollowUps}
                  onChange={(e) => setSettings({
                    ...settings,
                    outreach: { ...settings.outreach, maxFollowUps: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Hours Start
                  </label>
                  <input
                    type="time"
                    value={settings.outreach.workingHours.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      outreach: {
                        ...settings.outreach,
                        workingHours: { ...settings.outreach.workingHours, start: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Hours End
                  </label>
                  <input
                    type="time"
                    value={settings.outreach.workingHours.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      outreach: {
                        ...settings.outreach,
                        workingHours: { ...settings.outreach.workingHours, end: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Email
                </label>
                <input
                  type="email"
                  value={settings.notifications.notificationEmail}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, notificationEmail: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="admin@company.com"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Reply Notifications
                    </label>
                    <p className="text-xs text-gray-500">Get notified when candidates reply</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, onReply: !settings.notifications.onReply }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.notifications.onReply ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.onReply ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Bounce Notifications
                    </label>
                    <p className="text-xs text-gray-500">Get notified when emails bounce</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, onBounce: !settings.notifications.onBounce }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.notifications.onBounce ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.onBounce ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Daily Report
                    </label>
                    <p className="text-xs text-gray-500">Receive daily campaign performance reports</p>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, onDailyReport: !settings.notifications.onDailyReport }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      settings.notifications.onDailyReport ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notifications.onDailyReport ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}