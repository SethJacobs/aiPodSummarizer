#!/bin/bash

# QuickPod ML Environment Setup Script
# This ensures NumPy compatibility across all environments

set -e

echo "🚀 Setting up QuickPod ML environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "ml_helper/venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv ml_helper/venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source ml_helper/venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install NumPy first with version constraint to prevent compatibility issues
echo "🔢 Installing NumPy with version constraint (this prevents compatibility issues)..."
pip install "numpy>=1.21.0,<2.0.0" --force-reinstall

# Install other requirements
echo "📚 Installing other requirements..."
pip install -r ml_helper/requirements.txt

echo ""
echo "✅ ML environment setup complete!"
echo "📊 Installed versions:"
echo "  NumPy: $(python -c 'import numpy; print(numpy.__version__)')"
echo "  PyTorch: $(python -c 'import torch; print(torch.__version__)')"
echo "  Whisper: $(python -c 'import whisper; print(whisper.__version__)')"
echo "  Transformers: $(python -c 'import transformers; print(transformers.__version__)')"

echo ""
echo "🧪 Running validation..."
python validate_ml_env.py

echo ""
echo "🎉 Environment is ready! You can now run the ML helper scripts."