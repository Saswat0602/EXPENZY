#!/usr/bin/env python3
"""
Test the trained model locally before uploading
"""

import pickle
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_DIR = "./model"
LABELS_FILE = "./labels.pkl"

def test_model():
    """Test the model with sample inputs"""
    print("=" * 60)
    print("🧪 TESTING TRAINED MODEL")
    print("=" * 60)
    
    # Load model and tokenizer
    print("\n📥 Loading model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    
    # Load label encoder
    print("📥 Loading label encoder...")
    with open(LABELS_FILE, "rb") as f:
        label_encoder = pickle.load(f)
    
    print(f"✅ Model loaded with {len(label_encoder.classes_)} categories")
    print(f"📋 Categories: {label_encoder.classes_.tolist()}")
    
    # Test cases
    test_cases = [
        "Paid rent for apartment",
        "Bought groceries from supermarket",
        "Uber ride to office",
        "Netflix subscription renewal",
        "Bought medicines from pharmacy",
        "Electricity bill payment",
        "Gym membership fee",
        "Ordered pizza from Dominos",
        "Flight ticket to Mumbai",
        "Mutual fund SIP payment",
        "Dog food and vet visit",
        "College tuition fee",
    ]
    
    print("\n" + "=" * 60)
    print("🔍 PREDICTIONS")
    print("=" * 60)
    
    for description in test_cases:
        # Tokenize
        inputs = tokenizer(description, return_tensors="pt", truncation=True, padding=True, max_length=64)
        
        # Predict
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)[0]
            predicted_idx = torch.argmax(probabilities).item()
            confidence = probabilities[predicted_idx].item()
        
        # Decode label
        predicted_category = label_encoder.inverse_transform([predicted_idx])[0]
        
        # Get top 3 predictions
        top3_indices = torch.topk(probabilities, 3).indices.tolist()
        top3_probs = torch.topk(probabilities, 3).values.tolist()
        
        print(f"\n📝 Description: {description}")
        print(f"   ✅ Predicted: {predicted_category} (confidence: {confidence:.2%})")
        print(f"   📊 Top 3:")
        for idx, prob in zip(top3_indices, top3_probs):
            cat = label_encoder.inverse_transform([idx])[0]
            print(f"      {cat}: {prob:.2%}")
    
    print("\n" + "=" * 60)
    print("✅ TESTING COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    test_model()
