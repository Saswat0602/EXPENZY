

This guides your team on how to deploy your trained model to the HuggingFace Hub.

# 🚀 Deploying Your ML Model to HuggingFace Hub

For: Expense Categorization Model (DistilBERT)
Stack: HuggingFace Hub + Python + CLI

# 1. Introduction

This document explains how to upload and deploy your trained machine learning model to the HuggingFace Model Hub, so it can be used by your services (NestJS backend, FastAPI microservice, mobile app, etc.).

Once deployed, you can access your model at:

https://huggingface.co/<username>/<model-name>


And use it via FREE Hosted Inference API.

# 2. Prerequisites
✔ Python installed
✔ HuggingFace CLI installed
pip install huggingface_hub

✔ HuggingFace account

Create one at
https://huggingface.co/join

✔ Access token (WRITE permission)

Generate at
https://huggingface.co/settings/tokens

# 3. Login to HuggingFace (CLI)
huggingface-cli login


Paste your access token when prompted.

# 4. Prepare Your Model Files

Your trained folder must contain:

model/
  config.json
  tokenizer.json
  tokenizer_config.json
  vocab.txt (if exists)
  pytorch_model.bin
labels.pkl (optional)


If you trained using the provided script, your folder is already structured correctly.

# 5. Create a Model Repository

You can create a repo via CLI:

huggingface-cli repo create expense-category-model


Or via UI:

Go to https://huggingface.co/new

Choose: Model

Repo name: expense-category-model

Visibility: Public (free inference)

Create Repository

This creates:

https://huggingface.co/<username>/expense-category-model

# 6. Upload the Model Using CLI

Upload entire folder:

huggingface-cli upload ./model --repo-id <username>/expense-category-model


Or upload recursively:

huggingface-cli upload model/ --repo-id <username>/expense-category-model

# 7. Upload with Python (Alternative)

Create a file: upload.py

from huggingface_hub import upload_folder

upload_folder(
    folder_path="model",
    repo_id="<username>/expense-category-model",
    token="<HF_ACCESS_TOKEN>"
)


Run:

python upload.py

# 8. Verify Model Deployment

Go to:

https://huggingface.co/<username>/expense-category-model


You should see:

✔ Model files
✔ Inference widget
✔ Model card

⭐ The Hosted Inference API becomes available automatically.

# 9. Using the Model in Your Backend
Example (NestJS/HuggingFace inference API):
const res = await fetch(
  "https://api-inference.huggingface.co/models/<username>/expense-category-model",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: description }),
  }
);

const data = await res.json();

# 10. (Optional) Add README to Your Model

Inside your model/ folder, create:

📄 README.md
# Expense Category Classification Model

This model classifies expense descriptions into categories:
food, groceries, travel, shopping, medicine, entertainment, bills, others.

- Base Model: distilbert-base-uncased  
- Training Data: Custom dataset  
- Framework: HuggingFace Transformers  


Upload it along with the model.

# 11. Tips for Free Tier Usage

✔ Free up to ~100 requests/hr
✔ Cold starts may take 3–10 seconds
✔ Lightweight models run best (DistilBERT recommended)
✔ Make sure to implement caching in your backend

# 12. Deployment Checklist
Step	Status
Install HF CLI	☐
Login using access token	☐
Prepare model directory	☐
Create HF repo	☐
Upload model files	☐
Verify deployment	☐
Test inference via API	☐
# 13. Done!

Your model is now live on HuggingFace 🎉
You can integrate it with:

NestJS

FastAPI

React/Next.js

Mobile apps

Serverless functions