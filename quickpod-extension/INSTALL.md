# QuickPod Chrome Extension Installation Guide

## Prerequisites

1. **Backend Running**: Ensure the QuickPod backend is running on `http://localhost:8080`
   ```bash
   cd quickpod-backend
   java -jar target/quickpod-backend-0.0.1.jar
   ```

## Installation Steps

### 1. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Select the `quickpod-extension` folder
5. The QuickPod extension should now appear in your extensions list

### 2. Verify Installation

1. Navigate to a YouTube video (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
2. Click the QuickPod extension icon in the Chrome toolbar
3. The extension should detect the page and start processing

### 3. Supported Platforms

- ✅ **YouTube**: Full support with transcript extraction
- ✅ **Spotify**: Basic support (requires audio URL extraction)
- ✅ **Apple Podcasts**: Basic support

## Usage

1. **Navigate** to a supported podcast/video page
2. **Click** the QuickPod extension icon
3. **Wait** for processing (may take 30-60 seconds)
4. **View** the summary and transcript in the popup

## Troubleshooting

### Extension shows "Backend connection failed"
- Ensure the backend is running on `http://localhost:8080`
- Check that CORS is enabled in the backend
- Verify no firewall is blocking localhost connections

### Extension shows "This page isn't supported"
- Make sure you're on a YouTube, Spotify, or Apple Podcasts page
- Try refreshing the page and clicking the extension again

### Processing takes too long
- Large audio files may take several minutes to process
- Check the backend logs for any errors
- Ensure sufficient disk space for temporary files

## Development

To modify the extension:

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the QuickPod extension
4. Test your changes

## Permissions Explained

- **activeTab**: Access the current tab to extract page data
- **storage**: Store extension settings
- **scripting**: Inject content scripts into supported pages
- **host_permissions**: Access specific websites and localhost backend

## Security

This extension only communicates with your local backend at `http://localhost:8080`. No data is sent to external servers.