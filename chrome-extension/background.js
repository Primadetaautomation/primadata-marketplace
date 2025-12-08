// Background service worker for Chrome Extension
console.log('Recruitment Outreach Engine: Background service worker started');

// Default configuration
const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:3000',
  apiKey: '',
  autoCapture: false,
  campaignId: null
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed:', details.reason);

  // Set default configuration
  const config = await chrome.storage.sync.get(Object.keys(DEFAULT_CONFIG));
  const newConfig = { ...DEFAULT_CONFIG, ...config };
  await chrome.storage.sync.set(newConfig);

  // Open options page on first install
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);

  switch (request.action) {
    case 'captureProfile':
      handleProfileCapture(request.data, sender, sendResponse);
      return true; // Will respond asynchronously

    case 'getConfig':
      handleGetConfig(sendResponse);
      return true;

    case 'updateBadge':
      updateBadge(request.count);
      break;

    case 'openDashboard':
      openDashboard();
      break;

    default:
      console.log('Unknown action:', request.action);
  }
});

// Handle profile capture
async function handleProfileCapture(profileData, sender, sendResponse) {
  try {
    const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);

    if (!apiKey) {
      sendResponse({
        success: false,
        error: 'API key not configured'
      });
      return;
    }

    const response = await fetch(`${apiUrl}/api/linkedin/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(profileData)
    });

    const result = await response.json();

    if (!response.ok) {
      sendResponse({
        success: false,
        error: result.message || 'Failed to save profile'
      });
      return;
    }

    // Update capture count
    const { captureCount = 0 } = await chrome.storage.local.get('captureCount');
    await chrome.storage.local.set({ captureCount: captureCount + 1 });
    updateBadge(captureCount + 1);

    // Store in history
    await addToHistory(profileData, result);

    sendResponse({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Profile capture error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Get configuration
async function handleGetConfig(sendResponse) {
  try {
    const config = await chrome.storage.sync.get(Object.keys(DEFAULT_CONFIG));
    sendResponse({
      success: true,
      data: { ...DEFAULT_CONFIG, ...config }
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Update extension badge
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Open dashboard in new tab
async function openDashboard() {
  const { apiUrl } = await chrome.storage.sync.get('apiUrl');
  const dashboardUrl = apiUrl.replace('/api', '').replace(':3000', ':5173'); // Assuming Vite dev server
  chrome.tabs.create({ url: dashboardUrl });
}

// Add captured profile to history
async function addToHistory(profile, result) {
  const { history = [] } = await chrome.storage.local.get('history');

  const historyEntry = {
    id: result.id || Date.now().toString(),
    name: profile.fullName,
    title: profile.currentTitle,
    company: profile.currentCompany,
    url: profile.url,
    capturedAt: new Date().toISOString()
  };

  // Add to beginning and keep only last 50 entries
  history.unshift(historyEntry);
  if (history.length > 50) {
    history.pop();
  }

  await chrome.storage.local.set({ history });
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on a LinkedIn profile page
  if (tab.url && tab.url.includes('linkedin.com/in/')) {
    // Send message to content script to trigger capture
    chrome.tabs.sendMessage(tab.id, { action: 'triggerCapture' });
  } else {
    // Open popup or dashboard
    openDashboard();
  }
});

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'captureProfile',
    title: 'Capture LinkedIn Profile',
    contexts: ['page'],
    documentUrlPatterns: ['https://www.linkedin.com/in/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'captureProfile') {
    chrome.tabs.sendMessage(tab.id, { action: 'triggerCapture' });
  }
});

// Handle alarms for periodic tasks
chrome.alarms.create('syncData', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncData') {
    syncCapturedData();
  }
});

// Sync captured data with backend
async function syncCapturedData() {
  try {
    const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
    const { pendingProfiles = [] } = await chrome.storage.local.get('pendingProfiles');

    if (!apiKey || pendingProfiles.length === 0) {
      return;
    }

    const response = await fetch(`${apiUrl}/api/linkedin/profiles/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ profiles: pendingProfiles })
    });

    if (response.ok) {
      // Clear pending profiles
      await chrome.storage.local.set({ pendingProfiles: [] });
      console.log('Successfully synced', pendingProfiles.length, 'profiles');
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Handle network status changes
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Monitor LinkedIn API calls if needed
    console.log('LinkedIn API call:', details.url);
  },
  { urls: ['https://www.linkedin.com/voyager/api/*'] },
  ['requestBody']
);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleProfileCapture,
    updateBadge,
    addToHistory
  };
}