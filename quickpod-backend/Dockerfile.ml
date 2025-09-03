FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY ml_helper/requirements.txt ./ml_helper/

# Install Python dependencies with NumPy constraint
RUN pip install --no-cache-dir "numpy>=1.21.0,<2.0.0" && \
    pip install --no-cache-dir -r ml_helper/requirements.txt

# Copy ML helper scripts
COPY ml_helper/ ./ml_helper/

# Create directory for audio files
RUN mkdir -p /app/audio

EXPOSE 8080

CMD ["python", "ml_helper/local_transcribe_summarize.py"]