// Options page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Load saved options
  loadOptions();

  // Load campaigns for default selection
  loadCampaigns();

  // Load statistics
  loadStatistics();

  // Add event listeners
  document.getElementById('saveOptions').addEventListener('click', saveOptions);
  document.getElementById('restoreDefaults').addEventListener('click', restoreDefaults);
  document.getElementById('clearData').addEventListener('click', clearAllData);
  document.getElementById('testConnection').addEventListener('click', testApiConnection);
});

// Load saved options from Chrome storage
async function loadOptions() {
  try {
    const result = await chrome.storage.sync.get({
      // Default values
      apiUrl: '',
      apiKey: '',
      autoEnrich: true,
      showNotifications: true,
      duplicateCheck: true,
      defaultCampaign: '',
      buttonPosition: 'bottom-right',
      hideButton: false,
      buttonSize: 60
    });

    document.getElementById('apiUrl').value = result.apiUrl;
    document.getElementById('apiKey').value = result.apiKey;
    document.getElementById('autoEnrich').checked = result.autoEnrich;
    document.getElementById('showNotifications').checked = result.showNotifications;
    document.getElementById('duplicateCheck').checked = result.duplicateCheck;
    document.getElementById('defaultCampaign').value = result.defaultCampaign;
    document.getElementById('buttonPosition').value = result.buttonPosition;
    document.getElementById('hideButton').checked = result.hideButton;
    document.getElementById('buttonSize').value = result.buttonSize;
  } catch (error) {
    console.error('Error loading options:', error);
    showMessage('Error loading settings', 'error');
  }
}

// Save options to Chrome storage
async function saveOptions() {
  const options = {
    apiUrl: document.getElementById('apiUrl').value.replace(/\/$/, ''), // Remove trailing slash
    apiKey: document.getElementById('apiKey').value,
    autoEnrich: document.getElementById('autoEnrich').checked,
    showNotifications: document.getElementById('showNotifications').checked,
    duplicateCheck: document.getElementById('duplicateCheck').checked,
    defaultCampaign: document.getElementById('defaultCampaign').value,
    buttonPosition: document.getElementById('buttonPosition').value,
    hideButton: document.getElementById('hideButton').checked,
    buttonSize: parseInt(document.getElementById('buttonSize').value)
  };

  // Validate required fields
  if (!options.apiUrl || !options.apiKey) {
    showMessage('API URL and API Key are required', 'error');
    return;
  }

  // Validate API URL format
  try {
    new URL(options.apiUrl);
  } catch (e) {
    showMessage('Invalid API URL format', 'error');
    return;
  }

  // Validate button size
  if (options.buttonSize < 40 || options.buttonSize > 80) {
    showMessage('Button size must be between 40 and 80 pixels', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set(options);
    showMessage('Settings saved successfully!', 'success');

    // Notify all tabs to update their settings
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && tab.url.includes('linkedin.com')) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: options
          }).catch(() => {
            // Tab might not have content script loaded
          });
        }
      });
    });
  } catch (error) {
    console.error('Error saving options:', error);
    showMessage('Error saving settings', 'error');
  }
}

// Restore default settings
async function restoreDefaults() {
  if (!confirm('Are you sure you want to restore default settings?')) {
    return;
  }

  const defaults = {
    apiUrl: '',
    apiKey: '',
    autoEnrich: true,
    showNotifications: true,
    duplicateCheck: true,
    defaultCampaign: '',
    buttonPosition: 'bottom-right',
    hideButton: false,
    buttonSize: 60
  };

  try {
    await chrome.storage.sync.set(defaults);
    loadOptions(); // Reload the form
    showMessage('Settings restored to defaults', 'success');
  } catch (error) {
    console.error('Error restoring defaults:', error);
    showMessage('Error restoring defaults', 'error');
  }
}

// Clear all extension data
async function clearAllData() {
  if (!confirm('This will clear all extension data including settings and statistics. Are you sure?')) {
    return;
  }

  try {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    loadOptions(); // Reload the form
    loadStatistics(); // Reset statistics display
    showMessage('All data cleared successfully', 'success');
  } catch (error) {
    console.error('Error clearing data:', error);
    showMessage('Error clearing data', 'error');
  }
}

// Test API connection
async function testApiConnection() {
  const apiUrl = document.getElementById('apiUrl').value.replace(/\/$/, '');
  const apiKey = document.getElementById('apiKey').value;

  if (!apiUrl || !apiKey) {
    showMessage('Please enter API URL and API Key first', 'error');
    return;
  }

  const button = document.getElementById('testConnection');
  const originalText = button.textContent;
  button.textContent = 'Testing...';
  button.disabled = true;

  try {
    const response = await fetch(`${apiUrl}/api/health`, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      showMessage(`✅ Connection successful! API version: ${data.version || '1.0.0'}`, 'success');
    } else {
      showMessage(`Connection failed: ${response.status} ${response.statusText}`, 'error');
    }
  } catch (error) {
    showMessage(`Connection failed: ${error.message}`, 'error');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Load campaigns from API
async function loadCampaigns() {
  try {
    const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);

    if (!apiUrl || !apiKey) {
      return; // API not configured yet
    }

    const response = await fetch(`${apiUrl}/api/campaigns`, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (response.ok) {
      const campaigns = await response.json();
      const select = document.getElementById('defaultCampaign');

      // Clear existing options except first
      while (select.options.length > 1) {
        select.remove(1);
      }

      // Add campaigns
      campaigns.forEach(campaign => {
        const option = document.createElement('option');
        option.value = campaign.id;
        option.textContent = `${campaign.name} - ${campaign.jobTitle}`;
        select.appendChild(option);
      });

      // Update active campaigns count
      const activeCampaigns = campaigns.filter(c => c.isActive).length;
      document.getElementById('statsActiveCampaigns').textContent = activeCampaigns;
    }
  } catch (error) {
    console.error('Error loading campaigns:', error);
  }
}

// Load usage statistics
async function loadStatistics() {
  try {
    const stats = await chrome.storage.local.get({
      captureCount: 0,
      lastCaptureTime: null
    });

    document.getElementById('statsCaptured').textContent = stats.captureCount;

    if (stats.lastCaptureTime) {
      const date = new Date(stats.lastCaptureTime);
      const formatted = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      document.getElementById('statsLastCapture').textContent = formatted;
    } else {
      document.getElementById('statsLastCapture').textContent = 'Never';
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

// Show message to user
function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message show ${type}`;

  // Hide after 5 seconds
  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 5000);
}