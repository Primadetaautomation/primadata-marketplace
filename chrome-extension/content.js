// Content script for LinkedIn profile extraction
// Updated selectors for LinkedIn 2024-2025 DOM structure
console.log('Recruitment Outreach Engine: Content script loaded v2.0');

// Function to extract profile data from LinkedIn page
function extractProfileData() {
  const profile = {
    url: window.location.href.split('?')[0], // Clean URL without query params
    fullName: '',
    firstName: '',
    lastName: '',
    headline: '',
    currentTitle: '',
    currentCompany: '',
    location: '',
    about: '',
    experience: [],
    education: [],
    skills: [],
    profileImageUrl: '',
    connectionDegree: '',
    followers: '',
    extractedAt: new Date().toISOString()
  };

  try {
    // ===== NAME EXTRACTION (Multiple fallbacks) =====
    const nameSelectors = [
      'h1.text-heading-xlarge',
      'h1[class*="text-heading"]',
      '.pv-text-details__left-panel h1',
      '[data-generated-suggestion-target="urn:li:fsu_profileActionDelegate"] h1',
      '.ph5 h1',
      'section.artdeco-card h1'
    ];

    for (const selector of nameSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        profile.fullName = el.innerText.trim();
        break;
      }
    }

    if (profile.fullName) {
      const nameParts = profile.fullName.split(' ').filter(p => p);
      profile.firstName = nameParts[0] || '';
      profile.lastName = nameParts.slice(1).join(' ') || '';
    }

    // ===== HEADLINE EXTRACTION =====
    const headlineSelectors = [
      '.text-body-medium.break-words',
      '[data-generated-suggestion-target] .text-body-medium',
      '.pv-text-details__left-panel .text-body-medium',
      '.ph5 .text-body-medium',
      'div[class*="text-body-medium"]'
    ];

    for (const selector of headlineSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim() && !el.innerText.includes('followers') && !el.innerText.includes('connections')) {
        profile.headline = el.innerText.trim();
        break;
      }
    }

    // ===== LOCATION EXTRACTION =====
    const locationSelectors = [
      '.text-body-small.inline.t-black--light.break-words',
      '.pv-text-details__left-panel .text-body-small.t-black--light',
      'span.text-body-small[class*="t-black--light"]',
      '.ph5 .text-body-small.t-black--light'
    ];

    for (const selector of locationSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        const text = el.innerText.trim();
        // Filter out connection/follower counts
        if (!text.includes('follower') && !text.includes('connection') && text.length < 100) {
          profile.location = text;
          break;
        }
      }
    }

    // ===== CONNECTION DEGREE =====
    const degreeSelectors = [
      '.dist-value',
      'span[class*="distance-badge"]',
      '.pv-top-card--list .text-body-small'
    ];

    for (const selector of degreeSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        const text = el.innerText.trim();
        if (text.includes('1st') || text.includes('2nd') || text.includes('3rd')) {
          profile.connectionDegree = text;
          break;
        }
      }
    }

    // ===== CURRENT POSITION FROM TOP CARD =====
    // Try to get from the profile header first (most reliable)
    const topCardExperienceSelectors = [
      '.pv-text-details__right-panel .text-body-small',
      'button[aria-label*="Current company"]',
      'a[data-field="experience_company_logo"]',
    ];

    // ===== EXPERIENCE SECTION =====
    const experienceSection = findSection(['experience', 'ervaring']);

    if (experienceSection) {
      const experienceItems = experienceSection.querySelectorAll('li.artdeco-list__item, li[class*="pvs-list__paged-list-item"]');

      experienceItems.forEach((item, index) => {
        const exp = extractExperienceItem(item);
        if (exp && exp.title) {
          profile.experience.push(exp);
          // Set current position from first experience
          if (index === 0) {
            if (!profile.currentTitle) profile.currentTitle = exp.title;
            if (!profile.currentCompany) profile.currentCompany = exp.company;
          }
        }
      });
    }

    // Fallback: Try alternative experience extraction
    if (profile.experience.length === 0) {
      const altExperienceItems = document.querySelectorAll('[data-view-name="profile-component-entity"]');
      altExperienceItems.forEach((item, index) => {
        const exp = extractExperienceItemAlt(item);
        if (exp && exp.title) {
          profile.experience.push(exp);
          if (index === 0) {
            if (!profile.currentTitle) profile.currentTitle = exp.title;
            if (!profile.currentCompany) profile.currentCompany = exp.company;
          }
        }
      });
    }

    // ===== ABOUT/SUMMARY SECTION =====
    const aboutSection = findSection(['about', 'over', 'info']);
    if (aboutSection) {
      const aboutText = aboutSection.querySelector('.full-width span[aria-hidden="true"], .inline-show-more-text span[aria-hidden="true"], div[class*="display-flex"] span[aria-hidden="true"]');
      if (aboutText) {
        profile.about = aboutText.innerText.trim();
      }
    }

    // Fallback for about
    if (!profile.about) {
      const aboutSpans = document.querySelectorAll('#about ~ div span[aria-hidden="true"], section[id*="about"] span[aria-hidden="true"]');
      aboutSpans.forEach(span => {
        if (span.innerText.length > 50 && !profile.about) {
          profile.about = span.innerText.trim();
        }
      });
    }

    // ===== EDUCATION SECTION =====
    const educationSection = findSection(['education', 'opleiding']);
    if (educationSection) {
      const eduItems = educationSection.querySelectorAll('li.artdeco-list__item, li[class*="pvs-list__paged-list-item"]');
      eduItems.forEach(item => {
        const edu = extractEducationItem(item);
        if (edu && edu.institution) {
          profile.education.push(edu);
        }
      });
    }

    // ===== SKILLS SECTION =====
    const skillsSection = findSection(['skills', 'vaardigheden']);
    if (skillsSection) {
      const skillElements = skillsSection.querySelectorAll('span[aria-hidden="true"], [data-field="skill_name"]');
      const seenSkills = new Set();
      skillElements.forEach(el => {
        const skill = el.innerText.trim();
        // Filter out non-skill text
        if (skill &&
            skill.length < 50 &&
            !skill.includes('·') &&
            !skill.includes('endorsement') &&
            !skill.includes('Show all') &&
            !skill.includes('Toon alle') &&
            !seenSkills.has(skill.toLowerCase())) {
          seenSkills.add(skill.toLowerCase());
          profile.skills.push(skill);
        }
      });
    }

    // Limit skills to first 20
    profile.skills = profile.skills.slice(0, 20);

    // ===== PROFILE IMAGE =====
    const imageSelectors = [
      'img.pv-top-card-profile-picture__image',
      '.pv-top-card__photo img',
      'img[class*="profile-photo-edit__preview"]',
      'img.presence-entity__image',
      'img[class*="pv-top-card"][src*="profile"]',
      'button[aria-label*="photo"] img',
      '.ember-view.profile-photo-edit img'
    ];

    for (const selector of imageSelectors) {
      const img = document.querySelector(selector);
      if (img && img.src && !img.src.includes('ghost') && !img.src.includes('default')) {
        profile.profileImageUrl = img.src;
        break;
      }
    }

    // ===== FOLLOWERS COUNT =====
    const followerSelectors = [
      'span.t-bold:not(.text-heading-xlarge)',
      'p.text-body-small span.t-bold'
    ];

    document.querySelectorAll('span, p').forEach(el => {
      const text = el.innerText;
      if (text && (text.includes('followers') || text.includes('volgers'))) {
        profile.followers = text.trim();
      }
    });

    // Log extracted data for debugging
    console.log('Extracted profile data:', profile);

  } catch (error) {
    console.error('Error extracting profile data:', error);
  }

  return profile;
}

// Helper: Find a section by ID keywords
function findSection(keywords) {
  // Try by ID
  for (const keyword of keywords) {
    const section = document.querySelector(`section[id*="${keyword}"], div[id*="${keyword}"], [data-view-name="profile-card"][id*="${keyword}"]`);
    if (section) return section;
  }

  // Try by aria-label
  for (const keyword of keywords) {
    const section = document.querySelector(`section[aria-label*="${keyword}" i], div[aria-label*="${keyword}" i]`);
    if (section) return section;
  }

  // Try by heading text
  const headings = document.querySelectorAll('h2, h3, [class*="pvs-header__title"]');
  for (const heading of headings) {
    for (const keyword of keywords) {
      if (heading.innerText.toLowerCase().includes(keyword)) {
        // Return parent section
        return heading.closest('section') || heading.closest('[class*="artdeco-card"]') || heading.parentElement;
      }
    }
  }

  return null;
}

// Helper: Extract experience item data
function extractExperienceItem(item) {
  const exp = { title: '', company: '', duration: '', description: '', location: '' };

  // Get all text spans
  const spans = item.querySelectorAll('span[aria-hidden="true"]');
  const texts = Array.from(spans).map(s => s.innerText.trim()).filter(t => t);

  // First significant text is usually title
  if (texts[0]) exp.title = texts[0];

  // Look for company name
  const companyLink = item.querySelector('a[data-field="experience_company_logo"]');
  if (companyLink) {
    const companySpan = companyLink.querySelector('span[aria-hidden="true"]');
    if (companySpan) exp.company = companySpan.innerText.trim();
  }

  // If no company found, try second text element
  if (!exp.company && texts[1]) {
    exp.company = texts[1].replace(/·.*/, '').trim();
  }

  // Look for duration (contains 'yr' or 'mo' or 'jaar' or 'maand')
  texts.forEach(text => {
    if ((text.includes(' yr') || text.includes(' mo') || text.includes('jaar') || text.includes('maand') || text.includes(' - ')) && !exp.duration) {
      exp.duration = text;
    }
  });

  // Look for location
  const locationSpan = item.querySelector('.t-black--light.t-normal');
  if (locationSpan) {
    exp.location = locationSpan.innerText.trim();
  }

  return exp;
}

// Helper: Alternative experience extraction
function extractExperienceItemAlt(item) {
  const exp = { title: '', company: '', duration: '', description: '' };

  const titleEl = item.querySelector('[data-field="experience_title"]');
  const companyEl = item.querySelector('[data-field="experience_company_name"]');
  const durationEl = item.querySelector('[data-field="experience_date_range"]');
  const descriptionEl = item.querySelector('[data-field="experience_description"]');

  if (titleEl) exp.title = titleEl.innerText.trim();
  if (companyEl) exp.company = companyEl.innerText.trim().replace('·', '').trim();
  if (durationEl) exp.duration = durationEl.innerText.trim();
  if (descriptionEl) exp.description = descriptionEl.innerText.trim();

  return exp;
}

// Helper: Extract education item data
function extractEducationItem(item) {
  const edu = { degree: '', institution: '', year: '', field: '' };

  const spans = item.querySelectorAll('span[aria-hidden="true"]');
  const texts = Array.from(spans).map(s => s.innerText.trim()).filter(t => t);

  // Institution is usually first or in a link
  const institutionLink = item.querySelector('a[data-field="education_school_name"]');
  if (institutionLink) {
    const span = institutionLink.querySelector('span[aria-hidden="true"]');
    if (span) edu.institution = span.innerText.trim();
  } else if (texts[0]) {
    edu.institution = texts[0];
  }

  // Look for degree
  texts.forEach(text => {
    if (text.includes('Bachelor') || text.includes('Master') || text.includes('PhD') ||
        text.includes('MBA') || text.includes('BSc') || text.includes('MSc') ||
        text.includes('WO') || text.includes('HBO')) {
      edu.degree = text;
    }
  });

  // Look for year
  texts.forEach(text => {
    const yearMatch = text.match(/\d{4}\s*[-–]\s*\d{4}|\d{4}/);
    if (yearMatch) {
      edu.year = yearMatch[0];
    }
  });

  return edu;
}

// Function to create floating button
function createCaptureButton() {
  // Check if button already exists
  if (document.getElementById('recruitment-capture-btn')) {
    return;
  }

  const button = document.createElement('div');
  button.id = 'recruitment-capture-btn';
  button.innerHTML = `
    <button class="recruitment-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      <span>Capture Profile</span>
    </button>
    <div class="recruitment-status" id="recruitment-status"></div>
  `;

  document.body.appendChild(button);

  // Add click handler
  button.querySelector('.recruitment-btn').addEventListener('click', handleCaptureClick);
}

// Handle capture button click
async function handleCaptureClick() {
  const statusEl = document.getElementById('recruitment-status');
  const button = document.querySelector('.recruitment-btn');

  try {
    // Disable button and show loading
    button.disabled = true;
    button.classList.add('loading');
    statusEl.textContent = 'Extracting profile...';
    statusEl.className = 'recruitment-status show info';

    // Extract profile data
    const profileData = extractProfileData();

    if (!profileData.fullName) {
      throw new Error('Could not extract profile name. Please scroll down and try again.');
    }

    // Get API settings from storage
    const { apiKey, apiUrl } = await chrome.storage.sync.get(['apiKey', 'apiUrl']);

    if (!apiKey) {
      throw new Error('API key not configured. Please set it in extension options.');
    }

    const endpoint = apiUrl || 'http://localhost:3000';

    // Send to backend
    statusEl.textContent = 'Sending to CRM...';

    const response = await fetch(`${endpoint}/api/linkedin/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save profile');
    }

    const result = await response.json();

    // Show success message
    statusEl.textContent = `✓ ${profileData.fullName} captured!`;
    statusEl.className = 'recruitment-status show success';

    // Store last captured profile
    await chrome.storage.local.set({
      lastCaptured: {
        name: profileData.fullName,
        url: profileData.url,
        timestamp: new Date().toISOString()
      }
    });

    // Update capture count
    const { captureCount = 0 } = await chrome.storage.local.get('captureCount');
    await chrome.storage.local.set({ captureCount: captureCount + 1 });

    // Hide status after 5 seconds
    setTimeout(() => {
      statusEl.className = 'recruitment-status';
    }, 5000);

  } catch (error) {
    console.error('Capture error:', error);
    statusEl.textContent = `Error: ${error.message}`;
    statusEl.className = 'recruitment-status show error';

    // Hide error after 5 seconds
    setTimeout(() => {
      statusEl.className = 'recruitment-status';
    }, 5000);

  } finally {
    // Re-enable button
    button.disabled = false;
    button.classList.remove('loading');
  }
}

// Initialize extension when page loads
function initialize() {
  // Only run on LinkedIn profile pages
  if (!window.location.href.includes('linkedin.com/in/')) {
    return;
  }

  console.log('Recruitment Engine: Initializing on profile page...');

  // Wait for page to load key elements with multiple selector attempts
  let attempts = 0;
  const maxAttempts = 15;

  const checkInterval = setInterval(() => {
    attempts++;

    const nameSelectors = [
      'h1.text-heading-xlarge',
      'h1[class*="text-heading"]',
      '.pv-text-details__left-panel h1'
    ];

    let nameFound = false;
    for (const selector of nameSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        nameFound = true;
        break;
      }
    }

    if (nameFound) {
      clearInterval(checkInterval);
      console.log('Recruitment Engine: Name element found, creating button');
      createCaptureButton();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.log('Recruitment Engine: Could not find name element after', maxAttempts, 'attempts');
      // Still create button, user can try manually
      createCaptureButton();
    }
  }, 500);
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Handle navigation changes (LinkedIn is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Remove old button
    const oldButton = document.getElementById('recruitment-capture-btn');
    if (oldButton) oldButton.remove();

    if (url.includes('linkedin.com/in/')) {
      // Small delay to let new page render
      setTimeout(initialize, 1500);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractProfile') {
    const profile = extractProfileData();
    sendResponse({ success: true, profile });
  } else if (request.action === 'triggerCapture') {
    // Use existing capture handler
    handleCaptureClick().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  } else if (request.action === 'getStatus') {
    const hasName = !!document.querySelector('h1.text-heading-xlarge, h1[class*="text-heading"]');
    sendResponse({
      isProfilePage: window.location.href.includes('linkedin.com/in/'),
      hasNameElement: hasName
    });
  }
  return true;
});
