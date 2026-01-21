#!/usr/bin/env python3
"""
Upload trained model to HuggingFace Hub
"""

import os
from huggingface_hub import HfApi, create_repo, upload_folder

# Configuration
MODEL_DIR = "./model"
LABELS_FILE = "./labels.pkl"
REPO_NAME = "expense-category-model"  # Change this to your desired repo name
USERNAME = None  # Will be auto-detected from login

def upload_to_huggingface():
    """Upload model to HuggingFace Hub"""
    print("=" * 60)
    print("🚀 UPLOADING MODEL TO HUGGINGFACE HUB")
    print("=" * 60)
    
    # Check if model exists
    if not os.path.exists(MODEL_DIR):
        print("❌ Error: Model directory not found!")
        print(f"   Please train the model first using: python train.py")
        return
    
    # Initialize API
    api = HfApi()
    
    # Get username
    try:
        user_info = api.whoami()
        username = user_info['name']
        print(f"\n✅ Logged in as: {username}")
    except Exception as e:
        print("\n❌ Error: Not logged in to HuggingFace!")
        print("   Please run: huggingface-cli login")
        print(f"   Error details: {e}")
        return
    
    repo_id = f"{username}/{REPO_NAME}"
    
    # Create repository
    print(f"\n📦 Creating repository: {repo_id}")
    try:
        create_repo(
            repo_id=repo_id,
            repo_type="model",
            exist_ok=True,
            private=False
        )
        print("✅ Repository created/verified")
    except Exception as e:
        print(f"⚠️  Repository might already exist: {e}")
    
    # Create README
    readme_content = f"""---
language: en
tags:
- text-classification
- expense-categorization
- finance
license: mit
datasets:
- custom
metrics:
- accuracy
---

# Expense Category Classification Model

This model classifies expense descriptions into categories for personal finance tracking.

## Categories

- food
- groceries
- travel
- shopping
- medicine
- bills
- entertainment
- housing
- education
- fitness
- insurance
- investment
- pets
- other

## Model Details

- **Base Model**: distilbert-base-uncased
- **Training Data**: 15,000 expense descriptions
- **Framework**: HuggingFace Transformers
- **Task**: Multi-class text classification

## Usage

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

tokenizer = AutoTokenizer.from_pretrained("{repo_id}")
model = AutoModelForSequenceClassification.from_pretrained("{repo_id}")

text = "Paid rent for apartment"
inputs = tokenizer(text, return_tensors="pt")
outputs = model(**inputs)
predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
```

## Inference API

You can also use the HuggingFace Inference API:

```bash
curl https://api-inference.huggingface.co/models/{repo_id} \\
  -X POST \\
  -H "Authorization: Bearer YOUR_HF_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{{"inputs": "Paid rent for apartment"}}'
```

## Training

Trained using the HuggingFace Transformers library with the following parameters:
- Learning rate: 2e-5
- Batch size: 16
- Epochs: 3
- Max sequence length: 64

## License

MIT License
"""
    
    readme_path = os.path.join(MODEL_DIR, "README.md")
    with open(readme_path, "w") as f:
        f.write(readme_content)
    print("✅ README.md created")
    
    # Upload model folder
    print(f"\n📤 Uploading model files to {repo_id}...")
    try:
        upload_folder(
            folder_path=MODEL_DIR,
            repo_id=repo_id,
            repo_type="model",
        )
        print("✅ Model uploaded successfully!")
    except Exception as e:
        print(f"❌ Error uploading model: {e}")
        return
    
    # Upload labels file separately
    print("\n📤 Uploading label encoder...")
    try:
        api.upload_file(
            path_or_fileobj=LABELS_FILE,
            path_in_repo="labels.pkl",
            repo_id=repo_id,
            repo_type="model",
        )
        print("✅ Labels uploaded successfully!")
    except Exception as e:
        print(f"❌ Error uploading labels: {e}")
        return
    
    print("\n" + "=" * 60)
    print("✅ UPLOAD COMPLETE!")
    print("=" * 60)
    print(f"\n🌐 Model URL: https://huggingface.co/{repo_id}")
    print(f"\n🔗 Inference API endpoint:")
    print(f"   https://api-inference.huggingface.co/models/{repo_id}")
    print("\n💡 Next steps:")
    print("  1. Wait 5-10 minutes for the model to load on HuggingFace")
    print("  2. Test the inference API")
    print("  3. Update your .env file with:")
    print(f"     HF_MODEL_URL=https://api-inference.huggingface.co/models/{repo_id}")
    print("=" * 60)

if __name__ == "__main__":
    upload_to_huggingface()
