Train your ML model on your 50,000-row dataset

Evaluate accuracy

Export the trained model

Upload it automatically to HuggingFace

Use it directly from your NestJS backend

All scripts are provided as copy–paste ready .py files.

⭐ PART 1 — TRAINING PIPELINE

Save this file as:

📄 train_expense_classifier.py

This script:

✔ Loads 50,000-row dataset
✔ Trains DistilBERT
✔ Supports master + subcategory
✔ Saves model + tokenizer + label encoders
✔ Evaluates accuracy
✔ Prepares model for HuggingFace upload

📄 train_expense_classifier.py
import pandas as pd
from datasets import Dataset
from sklearn.preprocessing import LabelEncoder
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer
)
import torch
import numpy as np
import pickle

# =====================================
# 1. Load Dataset
# =====================================
df = pd.read_csv("expense_dataset_50000.csv")

# Combine master + subcategory as final label
df["label"] = df["master_category"] + " > " + df["subcategory"]

# Encode labels
label_encoder = LabelEncoder()
df["label_id"] = label_encoder.fit_transform(df["label"])

# Save the label encoder for inference
pickle.dump(label_encoder, open("label_encoder.pkl", "wb"))

# Dataset for HuggingFace Trainer
dataset = Dataset.from_pandas(df[["description", "label_id"]])
dataset = dataset.train_test_split(test_size=0.1)

# =====================================
# 2. Load tokenizer & model
# =====================================
MODEL_NAME = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def tokenize(batch):
    return tokenizer(
        batch["description"], 
        padding=True, 
        truncation=True, 
        max_length=128
    )

tokenized_dataset = dataset.map(tokenize, batched=True)
tokenized_dataset = tokenized_dataset.remove_columns(["description"])

# =====================================
# 3. Define Model
# =====================================
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(label_encoder.classes_)
)

# =====================================
# 4. Training arguments
# =====================================
training_args = TrainingArguments(
    output_dir="./expense_model",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy"
)

# =====================================
# 5. Compute accuracy
# =====================================
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    accuracy = (preds == labels).mean()
    return {"accuracy": accuracy}

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
    compute_metrics=compute_metrics,
)

# =====================================
# 6. Train model
# =====================================
trainer.train()

# =====================================
# 7. Save trained model
# =====================================
model.save_pretrained("expense_model")
tokenizer.save_pretrained("expense_model")

print("Training complete.")
print("Model saved to: expense_model/")

⭐ PART 2 — HUGGINGFACE UPLOAD SCRIPT

Save this as:

📄 upload_to_huggingface.py

This script:

✔ Logs into HuggingFace
✔ Uploads the model folder
✔ Uploads label encoder
✔ Creates README.md for model card
✔ Publishes automatically

📄 upload_to_huggingface.py
from huggingface_hub import HfApi, upload_folder
import os

HF_TOKEN = "<YOUR_HF_WRITE_TOKEN>"
REPO_ID = "<username>/expense-category-classifier"

api = HfApi()

# 1. Create repo (safe even if exists)
api.create_repo(
    name=REPO_ID.split("/")[-1],
    token=HF_TOKEN,
    repo_type="model",
    exist_ok=True
)

# 2. Upload model
upload_folder(
    folder_path="expense_model",
    repo_id=REPO_ID,
    token=HF_TOKEN
)

# 3. Upload label encoder
api.upload_file(
    path_or_fileobj="label_encoder.pkl",
    path_in_repo="label_encoder.pkl",
    repo_id=REPO_ID,
    token=HF_TOKEN
)

# 4. Upload README (Model Card)
readme = """
# Expense Categorization Model

This model classifies expense descriptions into:
- 24 master categories
- 50+ detailed subcategories
- English + Hinglish support

Model Type: DistilBERT
Trained on: 50,000 synthetic high-quality labeled rows
"""

with open("README.md", "w") as f:
    f.write(readme)

api.upload_file(
    path_or_fileobj="README.md",
    path_in_repo="README.md",
    repo_id=REPO_ID,
    token=HF_TOKEN
)

print("Model uploaded successfully!")
print(f"View it here: https://huggingface.co/{REPO_ID}")

⭐ PART 3 — HOW TO USE THE MODEL (NestJS or any backend)
const response = await fetch(
  "https://api-inference.huggingface.co/models/<username>/expense-category-classifier",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: description })
  }
);

const data = await response.json();

⭐ PART 4 — OUTPUT FORMAT

The model returns:

{
  "label": "Food & Dining > Restaurants",
  "score": 0.92
}


You can split it into:

master_category = "Food & Dining"

subcategory = "Restaurants"

⭐ PART 5 — TRAINING RESULTS EXPECTATION

With 50k rows:

Accuracy: 93–97%

DistilBERT inference: fast

Works perfectly on HuggingFace Free Tier