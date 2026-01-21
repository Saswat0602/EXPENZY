#!/bin/bash

# Setup script for ML service
echo "=========================================="
echo "🐍 Setting up Python ML Service"
echo "=========================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    echo "   Please install Python 3.8 or higher"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✅ Virtual environment created"
echo ""
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "  1. Activate the environment: source venv/bin/activate"
echo "  2. Train the model: python train.py"
echo "  3. Test the model: python test_model.py"
echo "  4. Upload to HuggingFace: python upload_to_hf.py"
echo ""
echo "=========================================="
