// src/utils/context.ts
import { logger } from './logger';

export interface PlayerContext {
  debt: number;
  hytaleProgress: number;
  pushupsCount: number;
  purityCounter: number;
  lastUpdated: string;
  stats: {
    daysTracked: number;
    totalIncome: number;
    totalWorkouts: number;
  };
}

export class ContextManager {
  private static instance: ContextManager;
  private context: PlayerContext;

  private constructor() {
    this.context = this.loadContext();
  }

  public static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  private loadContext(): PlayerContext {
    try {
      const savedContext = localStorage.getItem('playerContext');
      if (savedContext) {
        return JSON.parse(savedContext);
      }
    } catch (error) {
      console.error('Failed to load player context', error);
    }

    // Default context
    return {
      debt: 187000,
      hytaleProgress: 0,
      pushupsCount: 0,
      purityCounter: 0,
      lastUpdated: new Date().toISOString(),
      stats: {
        daysTracked: 1,
        totalIncome: 0,
        totalWorkouts: 0
      }
    };
  }

  public getContext(): PlayerContext {
    return { ...this.context };
  }

  public updateContext(updates: Partial<PlayerContext>): void {
    this.context = {
      ...this.context,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    this.saveContext();
    logger.log('CONTEXT_UPDATED', { updates });
  }

  private saveContext(): void {
    try {
      localStorage.setItem('playerContext', JSON.stringify(this.context));
    } catch (error) {
      console.error('Failed to save player context', error);
    }
  }

  public resetContext(): void {
    this.context = {
      debt: 187000,
      hytaleProgress: 0,
      pushupsCount: 0,
      purityCounter: 0,
      lastUpdated: new Date().toISOString(),
      stats: {
        daysTracked: 1,
        totalIncome: 0,
        totalWorkouts: 0
      }
    };
    this.saveContext();
    logger.log('CONTEXT_RESET');
  }
}

export const contextManager = ContextManager.getInstance();
