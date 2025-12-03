export class CategorizationResultDto {
  category: string;
  confidence: number;
  source: 'keyword' | 'ml' | 'llm' | 'cache';
}
