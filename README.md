# QuickPod - AI Podcast Summarizer

QuickPod is a comprehensive AI-powered podcast transcription and summarization solution that consists of a **Chrome browser extension** and a **Java Spring Boot backend** with integrated Python ML capabilities. Get instant summaries of podcast episodes from YouTube, Spotify, Apple Podcasts, and more.

## 🎯 Features

- **One-click summarization** of podcast episodes from popular platforms
- **AI-powered transcription** using OpenAI's Whisper model
- **Intelligent summarization** with transformer-based models
- **Local processing** - your data never leaves your machine
- **Multi-platform support** - YouTube, Spotify, Apple Podcasts
- **Chrome extension** for seamless browser integration
- **Offline capabilities** - works without internet after initial setup

## 🏗️ Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Chrome Extension  │───▶│   Java Backend       │───▶│   Python ML Helper  │
│   (Frontend UI)     │    │   (Spring Boot API)  │    │   (Whisper + Models) │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

### Components:

1. **Chrome Extension** (`quickpod-extension/`)
   - Manifest V3 extension
   - Content scripts for podcast platform detection
   - Popup UI for user interaction
   - Options page for configuration

2. **Java Backend** (`quickpod-backend/`)
   - Spring Boot 3.1 REST API
   - Orchestrates ML processing pipeline
   - Handles audio extraction and processing
   - CORS-enabled for extension communication

3. **Python ML Helper** (`quickpod-backend/ml_helper/`)
   - Whisper-based audio transcription
   - Transformer-based text summarization
   - Configurable model sizes for performance tuning

## 🚀 Quick Start

### Prerequisites

- **Java 17+** and **Maven 3.6+**
- **Python 3.8+** with pip
- **Node.js** (for extension development)
- **Chrome browser**
- **ffmpeg** (in PATH) - for audio processing
- **yt-dlp** (install via `pip install yt-dlp`)

### 1. Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd aiPodSummarizer/quickpod-backend

# Set up Python environment (recommended)
./setup_ml_env.sh

# Or manually:
python3 -m venv ml_helper/venv
source ml_helper/venv/bin/activate
pip install -r ml_helper/requirements.txt

# Build and run Java backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Chrome Extension Setup

```bash
# Navigate to extension directory
cd ../quickpod-extension

# Load extension in Chrome
# 1. Open Chrome → chrome://extensions/
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked"
# 4. Select the quickpod-extension folder
```

### 3. Test the Setup

1. Navigate to a podcast on YouTube, Spotify, or Apple Podcasts
2. Click the QuickPod extension icon in your browser toolbar
3. The extension will automatically detect the podcast and send it for processing
4. View the generated summary and transcript in the popup

## 📖 Usage Guide

### Supported Platforms

- **YouTube** - Podcast episodes and long-form content
- **Spotify** - Podcast episodes (public episodes)
- **Apple Podcasts** - Public podcast content

### How It Works

1. **Content Detection**: Extension content scripts detect podcast URLs on supported platforms
2. **Audio Extraction**: Backend uses yt-dlp to extract audio from the provided URL
3. **Transcription**: Python ML helper transcribes audio using Whisper
4. **Summarization**: Transformer models generate concise summaries
5. **Display**: Results are displayed in the extension popup with tabs for summary/transcript

### Extension Features

- **Smart URL Detection**: Automatically identifies podcast content
- **Progress Indicators**: Real-time status updates during processing
- **Tabbed Interface**: Switch between summary and full transcript
- **Sponsor Integration**: Optional sponsor content support
- **Options Page**: Configure backend URL and other settings

## 🔧 Configuration

### Backend Configuration

Edit `quickpod-backend/src/main/resources/application.properties`:

```properties
# Server configuration
server.port=8080

# ML Helper configuration
ml.python.path=/usr/bin/python3
ml.script.path=./ml_helper/local_transcribe_summarize.py

# Model configuration (optional)
whisper.model.size=base  # tiny, base, small, medium, large
```

### Extension Configuration

The extension automatically connects to `http://localhost:8080`. To change this:

1. Right-click the extension icon → Options
2. Update the backend URL
3. Save settings

### Performance Tuning

**For faster processing on CPU:**
- Use smaller Whisper models (`tiny` or `small`)
- Reduce audio quality for transcription
- Process shorter audio segments

**For better accuracy:**
- Use larger Whisper models (`medium` or `large`)
- Ensure high-quality audio input
- Use GPU acceleration if available

## 🐳 Production Deployment

### Docker Deployment

```bash
# Build the application
cd quickpod-backend
mvn clean package

# Build Docker image
docker build -f Dockerfile.ml -t quickpod-backend .

# Run container
docker run -p 8080:8080 quickpod-backend
```

### Cloud Deployment Options

#### AWS
- **Elastic Beanstalk**: Easy deployment with auto-scaling
- **ECS**: Containerized deployment with full control
- **Lambda**: For serverless processing (requires modifications)

#### Google Cloud Platform
- **App Engine**: Managed platform with automatic scaling
- **Cloud Run**: Containerized serverless deployment
- **Compute Engine**: Full VM control

#### Azure
- **App Service**: Managed platform deployment
- **Container Instances**: Simple container deployment
- **Azure Functions**: Serverless option (requires modifications)

### Chrome Extension Distribution

#### Chrome Web Store Publishing

1. **Prepare for production:**
   ```bash
   cd quickpod-extension
   # Update manifest.json version
   # Update backend URL to production endpoint
   zip -r quickpod-extension.zip . -x "*.DS_Store" "README.md"
   ```

2. **Submit to Chrome Web Store:**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Upload the zip file
   - Complete store listing information
   - Submit for review

#### Enterprise Deployment

For internal company use, configure Chrome policies:

```json
{
  "ExtensionInstallForcelist": [
    "your-extension-id;https://your-domain.com/quickpod-extension.crx"
  ]
}
```

## 🛠️ Development

### Backend Development

```bash
# Run in development mode
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
mvn test

# Build production JAR
mvn clean package -Pprod
```

### Extension Development

```bash
# Watch for changes (if using build tools)
npm run watch

# Test on different podcast platforms
# - YouTube: https://www.youtube.com/watch?v=VIDEO_ID
# - Spotify: https://open.spotify.com/episode/EPISODE_ID
# - Apple Podcasts: https://podcasts.apple.com/podcast/id/EPISODE_ID
```

### Python ML Development

```bash
# Activate virtual environment
source ml_helper/venv/bin/activate

# Test transcription directly
python ml_helper/local_transcribe_summarize.py

# Install additional models
# Models are downloaded automatically on first use

# Validate environment
python validate_ml_env.py
```

## 📊 API Reference

### POST /api/summarize

Transcribe and summarize a podcast episode.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "ok": true,
  "summary": "Key points from the podcast...",
  "transcript": "Full transcript text...",
  "duration": "25:30",
  "processing_time_seconds": 45.2
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "Unable to extract audio from URL"
}
```

### GET /actuator/health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "UP",
  "components": {
    "ml_helper": {
      "status": "UP"
    }
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Connection Issues
```
Error: Failed to contact backend
```
**Solutions:**
- Verify backend is running on `http://localhost:8080`
- Check CORS configuration in Spring Boot
- Ensure no firewall blocking local connections

#### ML Processing Failures
```
Error: Python script execution failed
```
**Solutions:**
- Verify Python virtual environment is activated
- Check `pip install -r requirements.txt` completed successfully
- Ensure ffmpeg is installed and in PATH
- Verify yt-dlp is installed: `pip install yt-dlp`

#### Extension Not Loading
```
Extension appears grayed out or non-functional
```
**Solutions:**
- Reload extension in `chrome://extensions/`
- Check browser console for JavaScript errors
- Verify content scripts are injecting properly
- Test on supported podcast platforms only

#### Audio Extraction Issues
```
Error: Unable to extract audio from URL
```
**Solutions:**
- Verify URL is accessible and contains audio
- Check yt-dlp supports the platform: `yt-dlp --list-extractors`
- Try updating yt-dlp: `pip install --upgrade yt-dlp`
- Ensure internet connection for initial download

### Performance Issues

#### Slow Processing
- Use smaller Whisper models (`tiny`, `base`)
- Reduce audio quality for transcription
- Process shorter clips for testing
- Consider GPU acceleration for production

#### Memory Issues
- Monitor memory usage during ML processing
- Use smaller models or batch processing
- Increase JVM heap size if needed: `-Xmx2g`

### Debugging

#### Backend Logs
```bash
# View Spring Boot logs
tail -f logs/quickpod.log

# Enable debug logging
java -jar target/quickpod-backend-0.0.1.jar --logging.level.com.quickpod=DEBUG
```

#### Extension Debugging
1. Right-click extension → "Inspect popup"
2. Check browser console for errors
3. Use Chrome DevTools Network tab for API calls

#### Python ML Debugging
```bash
# Test Python script directly
cd ml_helper
python local_transcribe_summarize.py "https://www.youtube.com/watch?v=VIDEO_ID"

# Validate environment
python validate_ml_env.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and feature requests:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed information:
   - Operating system and versions
   - Browser version
   - Error messages and logs
   - Steps to reproduce

## 🗺️ Roadmap

- [ ] GPU acceleration support
- [ ] Real-time transcription streaming
- [ ] Multiple language support
- [ ] Custom model fine-tuning
- [ ] Batch processing capabilities
- [ ] Mobile app development
- [ ] Integration with podcast platforms APIs
- [ ] Advanced summarization options (bullet points, chapters, etc.)

---

**Note**: This is a local-processing solution designed for privacy and offline capability. Your podcast data never leaves your machine during the transcription and summarization process.
