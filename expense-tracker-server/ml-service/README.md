# ML Expense Categorization System

## Overview

This system provides intelligent expense categorization using a three-tier approach:

1. **Keyword Engine** - Fast pattern matching (150+ keywords)
2. **ML Model** - DistilBERT via HuggingFace Inference API
3. **LLM Fallback** - OpenAI for edge cases

## Setup Instructions

### 1. Database Migration

Run the Prisma migration to create the necessary tables:

```bash
npx prisma generate
npx prisma migrate dev --name add_ml_categorization
```

This will add:
- `category_cache` table for caching results
- ML metadata fields to `expenses` table

### 2. Python ML Service Setup

Navigate to the ml-service directory and set up the Python environment:

```bash
cd ml-service
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Train the Model

With the virtual environment activated:

```bash
source venv/bin/activate
python train.py
```

This will:
- Load the 15,000 expense dataset
- Train a DistilBERT model
- Save the model to `./model/`
- Save the label encoder to `./labels.pkl`

Training takes approximately 15-30 minutes depending on your hardware.

### 4. Test the Model Locally

Before uploading, test the model:

```bash
python test_model.py
```

This will run predictions on sample expenses and show confidence scores.

### 5. Upload to HuggingFace

#### a. Create HuggingFace Account

1. Go to https://huggingface.co/join
2. Create an account
3. Generate an access token at https://huggingface.co/settings/tokens
   - Select "Write" permissions

#### b. Login via CLI

```bash
huggingface-cli login
```

Paste your access token when prompted.

#### c. Upload the Model

```bash
python upload_to_hf.py
```

This will:
- Create a repository on HuggingFace
- Upload the model files
- Generate a README
- Provide the inference API endpoint

Wait 5-10 minutes for the model to load on HuggingFace servers.

### 6. Configure Environment Variables

Update your `.env` file:

```env
# HuggingFace
HF_TOKEN=your_huggingface_token
HF_MODEL_URL=https://api-inference.huggingface.co/models/YOUR_USERNAME/expense-category-model

# OpenAI (optional but recommended)
OPENAI_API_KEY=your_openai_api_key
```

Replace:
- `your_huggingface_token` with your HF access token
- `YOUR_USERNAME` with your HuggingFace username
- `your_openai_api_key` with your OpenAI API key (optional)

### 7. Restart the Server

The NestJS server will automatically pick up the new module:

```bash
npm run start
```

## API Endpoints

### Categorize Single Expense

```bash
POST /api/categorization/detect
Content-Type: application/json

{
  "description": "Paid rent for apartment"
}
```

Response:
```json
{
  "category": "housing",
  "confidence": 0.95,
  "source": "keyword"
}
```

### Categorize Multiple Expenses

```bash
POST /api/categorization/batch
Content-Type: application/json

{
  "descriptions": [
    "Paid rent for apartment",
    "Bought groceries from supermarket",
    "Uber ride to office"
  ]
}
```

### Get Available Categories

```bash
GET /api/categorization/categories
```

### Get Cache Statistics

```bash
GET /api/categorization/cache/stats
```

### Clear Cache

```bash
DELETE /api/categorization/cache
```

## Categories

The system supports 14 categories:

1. **food** - Restaurants, food delivery
2. **groceries** - Supermarkets, vegetables, fruits
3. **travel** - Uber, Ola, petrol, flights
4. **shopping** - Amazon, Flipkart, clothes
5. **medicine** - Pharmacy, hospital, doctor
6. **bills** - Electricity, WiFi, recharge
7. **entertainment** - Netflix, movies, concerts
8. **housing** - Rent, maintenance, repairs
9. **education** - Tuition, courses, books
10. **fitness** - Gym, yoga, sports
11. **insurance** - Premiums, policies
12. **investment** - Mutual funds, stocks, SIP
13. **pets** - Pet food, vet, grooming
14. **other** - Miscellaneous

## How It Works

### Categorization Flow

```
User Input → Cache Check → Keyword Match → ML Model → LLM Fallback → Result
```

1. **Cache Check**: First checks if the description has been categorized before
2. **Keyword Match**: Searches for known keywords (confidence: 0.8)
3. **ML Model**: Uses HuggingFace model if confidence >= 0.6
4. **LLM Fallback**: Uses OpenAI for low-confidence cases
5. **Result**: Returns category, confidence, and source

### Caching Strategy

All categorization results are cached in the database to:
- Reduce API calls to HuggingFace and OpenAI
- Improve response time
- Stay within free tier limits

## Free Tier Limits

- **HuggingFace**: ~100 requests/hour (free)
- **OpenAI**: Pay-as-you-go (minimal usage due to caching)
- **Database**: Uses existing PostgreSQL instance

## Troubleshooting

### Model Loading Error (503)

If you get a 503 error from HuggingFace:
- The model is loading (first request after deployment)
- Wait 5-10 minutes and try again
- The system will fallback to LLM in the meantime

### Low Confidence Predictions

If ML predictions have low confidence:
- Add more training data
- Retrain the model
- The system will automatically use LLM fallback

### Cache Not Working

Check that the migration ran successfully:

```bash
npx prisma studio
```

Verify the `category_cache` table exists.

## Development

### Adding New Keywords

Edit `src/categorization/keyword-dictionary.ts`:

```typescript
export const KEYWORDS = {
  food: [
    // Add new keywords here
    'new_restaurant_name',
  ],
  // ...
};
```

### Retraining the Model

1. Add more data to the CSV dataset
2. Run `python train.py` again
3. Upload the new model with `python upload_to_hf.py`
4. Update `HF_MODEL_URL` in `.env`

### Testing

Test the categorization endpoint:

```bash
curl -X POST http://localhost:5000/api/categorization/detect \
  -H "Content-Type: application/json" \
  -d '{"description": "Paid rent for apartment"}'
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           CategorizationController                       │
│                 (REST API)                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           CategorizationService                          │
│              (Orchestrator)                              │
└─┬───────────┬───────────┬───────────┬──────────────────┘
  │           │           │           │
  ▼           ▼           ▼           ▼
┌───────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Cache │ │Keyword │ │   ML   │ │  LLM   │
│Service│ │Service │ │Service │ │Service │
└───┬───┘ └────────┘ └───┬────┘ └───┬────┘
    │                    │          │
    ▼                    ▼          ▼
┌────────┐         ┌──────────┐ ┌────────┐
│Database│         │HuggingFace│ │OpenAI  │
└────────┘         └──────────┘ └────────┘
```

## Performance

- **Keyword Match**: < 1ms
- **Cache Hit**: < 10ms
- **ML Model**: 100-500ms (first request), 50-200ms (subsequent)
- **LLM Fallback**: 500-2000ms

## Next Steps

1. ✅ Database schema updated
2. ✅ Python ML service created
3. ⏳ Train the model (run `python train.py`)
4. ⏳ Upload to HuggingFace (run `python upload_to_hf.py`)
5. ⏳ Configure environment variables
6. ⏳ Test the API endpoints

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the HuggingFace model logs
3. Check the NestJS server logs
4. Verify environment variables are set correctly
