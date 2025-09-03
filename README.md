QuickPod
QuickPod is a Chrome extension that provides AI-powered podcast transcription and summarization. It consists of a Chrome extension frontend and a Java Spring Boot backend with Python ML capabilities.

Architecture
Chrome Extension: Frontend interface for podcast interaction
Java Backend: Spring Boot API server handling requests and orchestration
Python ML Helper: Whisper-based transcription and transformer-based summarization
Local Development Setup
Prerequisites
Java 17 or higher
Maven 3.6+
Python 3.8+
Node.js (for extension development)
Chrome browser
Backend Setup
Navigate to the backend directory:

cd quickpod-backend
Install Python dependencies:

cd ml_helper
pip install -r requirements.txt
cd ..
Build and run the Java application:

mvn clean install
mvn spring-boot:run
The backend will start on http://localhost:8080

Chrome Extension Setup
Navigate to the extension directory:

cd quickpod-extension
Load the extension in Chrome:

Open Chrome and go to chrome://extensions/
Enable "Developer mode" (toggle in top right)
Click "Load unpacked"
Select the quickpod-extension folder
Configure the extension:

The extension should automatically connect to http://localhost:8080
If needed, update the backend URL in the extension options
Testing the Setup
Navigate to any podcast website (e.g., Spotify, Apple Podcasts)
Click the QuickPod extension icon
Select a podcast episode to transcribe and summarize
Production Deployment
Backend Deployment
Option 1: Docker Deployment
Create a Dockerfile in the backend directory:

FROM openjdk:17-jdk-slim

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app
COPY ml_helper/requirements.txt ./ml_helper/
RUN pip3 install -r ml_helper/requirements.txt

COPY target/*.jar app.jar
COPY ml_helper/ ./ml_helper/

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
Build and deploy:

mvn clean package
docker build -t quickpod-backend .
docker run -p 8080:8080 quickpod-backend
Option 2: Cloud Deployment (AWS/GCP/Azure)
Package the application:

mvn clean package
Deploy to your cloud provider:

AWS: Use Elastic Beanstalk or ECS
GCP: Use App Engine or Cloud Run
Azure: Use App Service or Container Instances
Environment Configuration:

Set SPRING_PROFILES_ACTIVE=prod
Configure database connections if needed
Set up proper logging and monitoring
Chrome Extension Deployment
Publishing to Chrome Web Store
Update manifest.json for production:

Update the backend URL to your production endpoint
Increment version number
Ensure all permissions are properly documented
Create a production build:

# Remove development files
rm -rf .git* README.md

# Create a zip file
zip -r quickpod-extension.zip . -x "*.DS_Store" "node_modules/*"
Submit to Chrome Web Store:

Go to Chrome Web Store Developer Dashboard
Upload the zip file
Fill out store listing details
Submit for review
Enterprise Deployment
For internal company use:

Configure extension policies:

{
  "ExtensionInstallForcelist": [
    "your-extension-id;https://your-domain.com/quickpod-extension.crx"
  ]
}
Host the extension:

Upload the packaged extension to your internal server
Configure Chrome policies via Group Policy or MDM
Configuration
Backend Configuration
Create application-prod.properties:

server.port=8080
spring.profiles.active=prod

# Logging
logging.level.com.quickpod=INFO
logging.file.name=quickpod.log

# ML Helper Configuration
ml.python.path=/usr/bin/python3
ml.script.path=./ml_helper/local_transcribe_summarize.py
Extension Configuration
Update the backend URL in your extension files:

// In popup.js or background.js
const BACKEND_URL = 'https://your-production-domain.com';
Monitoring and Maintenance
Health Checks
The backend provides health check endpoints:

GET /actuator/health - Application health status
GET /actuator/info - Application information
Logs
Backend logs: Check application logs for API requests and ML processing
Extension logs: Use Chrome DevTools console for debugging
Updates
Backend Updates:

Deploy new versions using blue-green deployment
Run database migrations if needed
Monitor health checks post-deployment
Extension Updates:

Increment version in manifest.json
Submit updated version to Chrome Web Store
Users will receive automatic updates
Troubleshooting
Common Issues
Extension not connecting to backend:

Check CORS configuration in Spring Boot
Verify backend URL in extension settings
ML processing failures:

Ensure Python dependencies are installed
Check available disk space for model downloads
Verify audio file format compatibility
Performance issues:

Monitor memory usage during ML processing
Consider implementing request queuing for high load
Scale backend horizontally if needed
Support
For issues and feature requests, please check the project documentation or contact the development team.
