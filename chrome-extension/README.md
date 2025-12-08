# LinkedIn Recruitment Chrome Extension

## Overview

This Chrome extension enables one-click capture of LinkedIn profiles directly into your recruitment pipeline. It adds a floating button on LinkedIn profile pages that allows recruiters to instantly add candidates to campaigns.

## Features

- ✅ One-click profile capture from LinkedIn
- ✅ Automatic data extraction (name, headline, company, location)
- ✅ Campaign selection dropdown
- ✅ Floating action button on profile pages
- ✅ Real-time sync with backend API
- ✅ Non-intrusive design
- ✅ Works on all LinkedIn profile URLs

## Installation

### Method 1: Load Unpacked (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. The extension will now be active!

### Method 2: Install from ZIP

1. Run the build script:
   ```bash
   ./build.sh
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Drag and drop `linkedin-recruitment-extension.zip` into the browser

### Method 3: Manual Installation

1. Download all extension files to a folder
2. Open Chrome settings → Extensions
3. Enable Developer mode
4. Click "Load unpacked" and select your folder

## Configuration

Before using the extension, you need to configure the API endpoint:

1. Click the extension icon in Chrome toolbar
2. Enter your API configuration:
   - **API URL**: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - **API Key**: Your secure API key
3. Click "Save Settings"

## Usage

### Capturing Profiles

1. Navigate to any LinkedIn profile
2. Wait for the page to load completely
3. Look for the purple "Capture Profile" button (bottom right)
4. Click the button to open the capture dialog
5. Select a campaign from the dropdown
6. Click "Add to Campaign"
7. The candidate will be added to your recruitment pipeline

### Viewing Captured Candidates

1. Open your recruitment dashboard
2. Navigate to the "Candidates" section
3. New candidates will appear with status "NEW"
4. The system will automatically enrich them with contact information

## How It Works

1. **Profile Detection**: The extension detects when you're on a LinkedIn profile page
2. **Data Extraction**: It reads the visible profile information (no scraping of hidden data)
3. **API Communication**: Sends the profile data to your backend API
4. **Campaign Assignment**: Associates the candidate with your selected campaign
5. **Enrichment Queue**: The backend automatically enriches the profile with additional data

## Privacy & Compliance

- ✅ Only captures publicly visible information
- ✅ No automated scraping or bot behavior
- ✅ Respects LinkedIn's terms of service
- ✅ GDPR compliant data handling
- ✅ All data is encrypted in transit

## Troubleshooting

### Extension Not Appearing

- Ensure you're on a LinkedIn profile page (linkedin.com/in/*)
- Refresh the page after installation
- Check that the extension is enabled in Chrome

### API Connection Issues

- Verify your API URL is correct (no trailing slash)
- Check that your API key is valid
- Ensure your backend is deployed and running
- Check browser console for error messages (F12)

### Capture Button Not Showing

- Wait for the LinkedIn page to fully load
- Try refreshing the page
- Check if you're logged into LinkedIn
- Disable other LinkedIn extensions that might conflict

## API Endpoints Used

The extension communicates with these backend endpoints:

- `GET /api/campaigns` - Fetch available campaigns
- `POST /api/linkedin/profile` - Submit captured profile data
- `GET /api/health` - Check API connectivity

## Development

### Project Structure

```
chrome-extension/
├── manifest.json       # Extension configuration
├── content.js         # LinkedIn page interaction
├── background.js      # Background service worker
├── popup.html         # Extension popup UI
├── popup.js          # Popup functionality
├── build.sh          # Build script
└── README.md         # This file
```

### Building from Source

```bash
# Install dependencies (if any)
npm install

# Run build script
./build.sh

# Output will be in dist/ folder
```

### Testing

1. Load the unpacked extension in Chrome
2. Navigate to a LinkedIn profile
3. Open Chrome DevTools (F12) and check console for logs
4. Test the capture functionality
5. Verify data appears in your dashboard

## Security Considerations

- API keys are stored locally in Chrome's secure storage
- All API communications use HTTPS
- No sensitive data is logged to console
- Profile data is transmitted securely to your backend

## Updates

To update the extension:

1. Pull the latest code
2. Run `./build.sh`
3. In Chrome extensions page, click "Reload" on the extension
4. Clear cache if needed (Ctrl+Shift+R on LinkedIn)

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify your API configuration
3. Ensure your backend is operational
4. Check the [Issues](https://github.com/your-repo/issues) section

## License

This extension is part of the Recruitment Outreach Engine project.

---

Made with 💜 for efficient recruitment