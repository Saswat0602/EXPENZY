#!/usr/bin/env python3
"""
Expense Category Classification Model Training Script
Trains a DistilBERT model on expense descriptions
"""

import pandas as pd
import pickle
import os
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer
)
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Configuration
DATASET_PATH = "../dataset/expense_training_dataset_15000.csv"
MODEL_NAME = "distilbert-base-uncased"
OUTPUT_DIR = "./model"
LABELS_FILE = "./labels.pkl"

# Training parameters (optimized for free tier)
BATCH_SIZE = 16
EPOCHS = 3
LEARNING_RATE = 2e-5
MAX_LENGTH = 64

def load_and_preprocess_data():
    """Load CSV dataset and preprocess"""
    print("📊 Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    
    print(f"✅ Loaded {len(df)} samples")
    print(f"📋 Categories: {df['category'].unique().tolist()}")
    print(f"📈 Category distribution:\n{df['category'].value_counts()}")
    
    # Encode labels
    le = LabelEncoder()
    df["label"] = le.fit_transform(df["category"])
    
    print(f"\n🏷️  Label mapping:")
    for idx, category in enumerate(le.classes_):
        print(f"  {idx}: {category}")
    
    return df, le

def create_dataset(df):
    """Create HuggingFace dataset"""
    print("\n🔄 Creating train/test split...")
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['label'])
    
    train_dataset = Dataset.from_pandas(train_df[['description', 'label']])
    test_dataset = Dataset.from_pandas(test_df[['description', 'label']])
    
    print(f"✅ Train samples: {len(train_dataset)}")
    print(f"✅ Test samples: {len(test_dataset)}")
    
    return train_dataset, test_dataset

def tokenize_dataset(train_dataset, test_dataset, tokenizer):
    """Tokenize datasets"""
    print("\n🔤 Tokenizing datasets...")
    
    def tokenize_function(examples):
        return tokenizer(
            examples["description"],
            truncation=True,
            padding="max_length",
            max_length=MAX_LENGTH
        )
    
    train_dataset = train_dataset.map(tokenize_function, batched=True)
    test_dataset = test_dataset.map(tokenize_function, batched=True)
    
    # Remove unnecessary columns
    train_dataset = train_dataset.remove_columns(["description"])
    test_dataset = test_dataset.remove_columns(["description"])
    
    # Set format for PyTorch
    train_dataset.set_format("torch")
    test_dataset.set_format("torch")
    
    print("✅ Tokenization complete")
    return train_dataset, test_dataset

def train_model(train_dataset, test_dataset, num_labels):
    """Train the model"""
    print(f"\n🤖 Loading model: {MODEL_NAME}")
    
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=num_labels
    )
    
    print("\n⚙️  Setting up training arguments...")
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=LEARNING_RATE,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        num_train_epochs=EPOCHS,
        weight_decay=0.01,
        logging_dir=f"{OUTPUT_DIR}/logs",
        logging_steps=100,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        save_total_limit=2,
        push_to_hub=False,
    )
    
    print("\n🚀 Starting training...")
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
    )
    
    trainer.train()
    
    print("\n💾 Saving model...")
    trainer.save_model(OUTPUT_DIR)
    
    return model, trainer

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("🎯 EXPENSE CATEGORY CLASSIFICATION - MODEL TRAINING")
    print("=" * 60)
    
    # Load data
    df, label_encoder = load_and_preprocess_data()
    
    # Create datasets
    train_dataset, test_dataset = create_dataset(df)
    
    # Load tokenizer
    print(f"\n📝 Loading tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    # Tokenize
    train_dataset, test_dataset = tokenize_dataset(train_dataset, test_dataset, tokenizer)
    
    # Train
    model, trainer = train_model(train_dataset, test_dataset, len(label_encoder.classes_))
    
    # Save tokenizer
    print("\n💾 Saving tokenizer...")
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    # Save label encoder
    print("💾 Saving label encoder...")
    with open(LABELS_FILE, "wb") as f:
        pickle.dump(label_encoder, f)
    
    # Evaluate
    print("\n📊 Final evaluation...")
    eval_results = trainer.evaluate()
    print(f"✅ Evaluation results: {eval_results}")
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\n📁 Model saved to: {OUTPUT_DIR}")
    print(f"📁 Labels saved to: {LABELS_FILE}")
    print("\n🎉 Next steps:")
    print("  1. Test the model locally")
    print("  2. Upload to HuggingFace using upload_to_hf.py")
    print("=" * 60)

if __name__ == "__main__":
    main()
