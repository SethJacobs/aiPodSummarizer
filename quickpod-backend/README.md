QuickPod Backend (Java + Python ML helper)
========================================

Files:
  - pom.xml
  - src/main/java/...  (Spring Boot app)
  - ml_helper/local_transcribe_summarize.py
  - ml_helper/requirements.txt

Prereqs (install on your machine):
  - Java 17+, Maven
  - Python 3.10+, pip
  - ffmpeg (in PATH)
  - yt-dlp (in PATH) -> pip install yt-dlp

Python setup (recommended inside a venv):
  cd quickpod-backend
  
  # Option 1: Use the setup script (recommended)
  ./setup_ml_env.sh
  
  # Option 2: Manual setup
  python3 -m venv ml_helper/venv
  source ml_helper/venv/bin/activate
  pip install --upgrade pip
  pip install "numpy>=1.21.0,<2.0.0"  # Install NumPy first to prevent compatibility issues
  pip install -r ml_helper/requirements.txt
  
  # Option 3: Use constraints file for additional safety
  pip install -r ml_helper/requirements.txt -c ml_helper/constraints.txt

Build & run:
  mvn package
  java -jar target/quickpod-backend-0.0.1.jar

API:
  POST http://localhost:8080/api/summarize
  Body JSON: { "url": "https://www.youtube.com/watch?v=..." }

Notes:
  - Models will download the first time you run the Python script (Whisper + HF summarizer).
  - For faster runs on CPU use whisper 'tiny' or 'small' models.
