import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface HuggingFacePrediction {
  label: string;
  score: number;
}

type HuggingFaceResponse = HuggingFacePrediction[][];

@Injectable()
export class MLService {
  private readonly logger = new Logger(MLService.name);
  private readonly hfToken: string;
  private readonly hfModelUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.hfToken = this.configService.get<string>('HF_TOKEN') || '';
    this.hfModelUrl = this.configService.get<string>('HF_MODEL_URL') || '';
  }

  /**
   * Predict category using HuggingFace model
   */
  async predict(
    description: string,
  ): Promise<{ category: string; confidence: number }> {
    if (!this.hfToken || !this.hfModelUrl) {
      this.logger.warn('HuggingFace credentials not configured');
      return { category: 'other', confidence: 0 };
    }

    try {
      const response = await fetch(this.hfModelUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: description }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `HuggingFace API error: ${response.status} - ${errorText}`,
        );

        // Handle model loading state
        if (response.status === 503) {
          this.logger.warn('Model is loading, please try again in a moment');
          return { category: 'other', confidence: 0 };
        }

        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = (await response.json()) as HuggingFaceResponse;

      // HuggingFace returns array of predictions
      // Format: [[{label: "category", score: 0.95}, ...]]
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        const predictions: HuggingFacePrediction[] = data[0];
        const best: HuggingFacePrediction = predictions[0];

        return {
          category: best.label,
          confidence: best.score,
        };
      }

      this.logger.warn('Unexpected HuggingFace response format', data);
      return { category: 'other', confidence: 0 };
    } catch (error) {
      this.logger.error('Error calling HuggingFace API', error);
      return { category: 'other', confidence: 0 };
    }
  }

  /**
   * Check if ML service is available
   */
  isAvailable(): boolean {
    return !!(this.hfToken && this.hfModelUrl);
  }
}
