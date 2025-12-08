// Popup script for Chrome Extension
document.addEventListener('DOMContentLoaded', async () => {
  // Load current status
  await loadStatus();
  await loadHistory();
  await checkConnection();
  await loadEnrichableCount();

  // Add event listeners
  document.getElementById('capture-btn').addEventListener('click', captureCurrentProfile);
  document.getElementById('dashboard-btn').addEventListener('click', openDashboard);
  document.getElementById('settings-link').addEventListener('click', openSettings);
  document.getElementById('batch-enrich-btn').addEventListener('click', startBatchEnrichment);
});

// Load extension status
async function loadStatus() {
  try {
    const { captureCount = 0, history = [] } = await chrome.storage.local.get(['captureCount', 'history']);

    // Update total count
    document.getElementById('captured-total').textContent = captureCount;

    // Calculate today's captures
    const today = new Date().toDateString();
    const todayCaptures = history.filter(item =>
      new Date(item.capturedAt).toDateString() === today
    ).length;
    document.getElementById('captured-today').textContent = todayCaptures;

    // Calculate this week's captures
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCaptures = history.filter(item =>
      new Date(item.capturedAt) > weekAgo
    ).length;
    document.getElementById('captured-week').textContent = weekCaptures;

  } catch (error) {
    console.error('Error loading status:', error);
  }
}

// Load capture history
async function loadHistory() {
  try {
    const { history = [] } = await chrome.storage.local.get('history');
    const historyList = document.getElementById('history-list');

    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No profiles captured yet</div>';
      return;
    }

    // Show last 5 captures
    const recentHistory = history.slice(0, 5);
    historyList.innerHTML = recentHistory.map(item => `
      <div class="history-item">
        <a href="${item.url}" target="_blank">${item.name}</a>
        <div class="meta">${item.title || 'Unknown'} at ${item.company || 'Unknown'}</div>
        <div class="meta">${formatTime(item.capturedAt)}</div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// Check API connection
async function checkConnection() {
  try {
    const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
    const connectionStatus = document.getElementById('connection-status');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    if (!apiKey) {
      connectionStatus.textContent = 'API key not configured';
      statusDot.classList.add('inactive');
      statusText.textContent = 'Please configure API key';
      return;
    }

    // Try to ping the API
    const response = await fetch(`${apiUrl}/api/health`, {
      headers: { 'x-api-key': apiKey }
    }).catch(() => null);

    if (response && response.ok) {
      connectionStatus.textContent = 'Connected to CRM';
      statusDot.classList.remove('inactive');
      statusText.textContent = 'Ready to capture profiles';
    } else {
      connectionStatus.textContent = 'Cannot connect to API';
      statusDot.classList.add('inactive');
      statusText.textContent = 'Check API configuration';
    }

  } catch (error) {
    console.error('Connection check error:', error);
    document.getElementById('connection-status').textContent = 'Connection error';
  }
}

// Capture current profile
async function captureCurrentProfile() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('linkedin.com/in/')) {
      alert('Please navigate to a LinkedIn profile page first');
      return;
    }

    // Disable button and show loading
    const button = document.getElementById('capture-btn');
    button.disabled = true;
    button.textContent = 'Capturing...';

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'triggerCapture' }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        alert('Error: Please refresh the LinkedIn page and try again');
      } else {
        // Refresh status
        await loadStatus();
        await loadHistory();
      }

      // Re-enable button
      button.disabled = false;
      button.textContent = 'Capture Current Profile';
    });

  } catch (error) {
    console.error('Capture error:', error);
    alert('Error capturing profile: ' + error.message);
  }
}

// Open dashboard
async function openDashboard() {
  const { apiUrl } = await chrome.storage.sync.get('apiUrl');
  const dashboardUrl = apiUrl.replace('/api', '').replace(':3000', ':5173');
  chrome.tabs.create({ url: dashboardUrl });
}

// Open settings
function openSettings(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
}

// Format time helper
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  // Otherwise show date
  return date.toLocaleDateString();
}

// Load count of enrichable candidates
async function loadEnrichableCount() {
  try {
    const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);

    if (!apiUrl || !apiKey) {
      document.getElementById('enrichable-count').textContent = '-';
      document.getElementById('total-linkedin').textContent = '-';
      return;
    }

    const response = await fetch(`${apiUrl}/api/linkedin/enrich-batch`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch enrichable count');
      return;
    }

    const data = await response.json();
    document.getElementById('enrichable-count').textContent = data.enrichable || 0;
    document.getElementById('total-linkedin').textContent = data.total || 0;

    // Enable button if there are candidates to enrich
    const btn = document.getElementById('batch-enrich-btn');
    if (data.enrichable > 0) {
      btn.disabled = false;
    }

  } catch (error) {
    console.error('Error loading enrichable count:', error);
  }
}

// Start batch enrichment process
async function startBatchEnrichment() {
  const btn = document.getElementById('batch-enrich-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  try {
    const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey']);

    if (!apiUrl || !apiKey) {
      alert('Please configure API settings first');
      return;
    }

    // Disable button and show progress
    btn.disabled = true;
    btn.textContent = 'Fetching candidates...';
    progressContainer.style.display = 'block';

    // Get candidates with LinkedIn URLs
    const response = await fetch(`${apiUrl}/api/linkedin/enrich-batch`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }

    const data = await response.json();
    const candidates = data.candidates.filter(c => c.needs_enrichment);

    if (candidates.length === 0) {
      alert('No candidates need enrichment');
      btn.disabled = false;
      btn.textContent = 'Start Batch Enrichment';
      progressContainer.style.display = 'none';
      return;
    }

    // Request the batch queue
    const queueResponse = await fetch(`${apiUrl}/api/linkedin/enrich-batch`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        kandidaat_ids: candidates.map(c => c.id)
      })
    });

    if (!queueResponse.ok) {
      throw new Error('Failed to queue candidates');
    }

    const queueData = await queueResponse.json();
    const profiles = queueData.profiles;

    btn.textContent = 'Enriching...';
    progressText.textContent = `0 / ${profiles.length}`;

    // Process each profile
    let enriched = 0;
    for (const profile of profiles) {
      try {
        // Open LinkedIn profile in background tab and extract data
        const profileData = await enrichSingleProfile(profile.linkedin_url);

        if (profileData) {
          // Send enriched data back to API
          await fetch(`${apiUrl}/api/linkedin/enrich-batch`, {
            method: 'PUT',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              kandidaat_id: profile.kandidaat_id,
              profile_data: profileData
            })
          });
        }

        enriched++;
        const progress = (enriched / profiles.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${enriched} / ${profiles.length}`;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error enriching ${profile.naam}:`, error);
        enriched++;
        progressText.textContent = `${enriched} / ${profiles.length} (some errors)`;
      }
    }

    // Done
    btn.textContent = `Done! ${enriched} enriched`;
    btn.className = 'btn btn-success';

    // Reload counts after 2 seconds
    setTimeout(async () => {
      await loadEnrichableCount();
      btn.textContent = 'Start Batch Enrichment';
      btn.className = 'btn btn-primary';
      btn.disabled = false;
      progressContainer.style.display = 'none';
      progressFill.style.width = '0%';
    }, 2000);

  } catch (error) {
    console.error('Batch enrichment error:', error);
    alert('Error during batch enrichment: ' + error.message);
    btn.disabled = false;
    btn.textContent = 'Start Batch Enrichment';
    progressContainer.style.display = 'none';
  }
}

// Enrich a single profile by opening LinkedIn URL
async function enrichSingleProfile(linkedinUrl) {
  return new Promise((resolve) => {
    // Create a new tab with the LinkedIn URL
    chrome.tabs.create({ url: linkedinUrl, active: false }, (tab) => {
      // Wait for page to load
      const checkReady = setInterval(() => {
        chrome.tabs.get(tab.id, (updatedTab) => {
          if (chrome.runtime.lastError) {
            clearInterval(checkReady);
            resolve(null);
            return;
          }

          if (updatedTab.status === 'complete') {
            clearInterval(checkReady);

            // Give page a moment to render
            setTimeout(() => {
              // Send message to content script to extract data
              chrome.tabs.sendMessage(tab.id, { action: 'extractProfile' }, (response) => {
                // Close the tab
                chrome.tabs.remove(tab.id);

                if (chrome.runtime.lastError || !response) {
                  resolve(null);
                } else {
                  resolve(response.profile);
                }
              });
            }, 2000);
          }
        });
      }, 500);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        chrome.tabs.remove(tab.id).catch(() => {});
        resolve(null);
      }, 30000);
    });
  });
}