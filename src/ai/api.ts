// src/ai/api.ts
import { systemPrompt, soloLevelingQuotes } from './systemPrompt';

interface AIResponse {
  message: string;
  context: Record<string, any>;
  timestamp: string;
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  public async fetchAIResponse(context: Record<string, any>): Promise<AIResponse> {
    // In a real implementation, this would call an actual API
    // For now, we'll return a random Solo Leveling quote with the current context
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: this.getRandomElement(soloLevelingQuotes),
          context,
          timestamp: new Date().toISOString()
        });
      }, 500); // Simulate network delay
    });
  }

  public async analyzePlayerData(logs: any[]): Promise<string> {
    // In a real implementation, this would analyze the logs and provide insights
    // For now, return a random system message
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getRandomElement(systemPrompt.samplePhrases));
      }, 300);
    });
  }
}

export const aiService = AIService.getInstance();
