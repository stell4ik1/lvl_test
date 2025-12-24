// src/utils/logger.ts
interface LogEntry {
  timestamp: string;
  action: string;
  data: Record<string, any>;
  context: Record<string, any>;
}

const LOG_STORAGE_KEY = 'monarch_system_logs';

export class DataLogger {
  private static instance: DataLogger;
  private logs: LogEntry[] = [];

  private constructor() {
    this.loadLogs();
  }

  public static getInstance(): DataLogger {
    if (!DataLogger.instance) {
      DataLogger.instance = new DataLogger();
    }
    return DataLogger.instance;
  }

  private loadLogs(): void {
    try {
      const savedLogs = localStorage.getItem(LOG_STORAGE_KEY);
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Failed to load logs from localStorage', error);
      this.logs = [];
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs to localStorage', error);
    }
  }

  public log(action: string, data: Record<string, any> = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      data,
      context: this.getCurrentContext()
    };

    this.logs.push(entry);
    this.saveLogs();
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  private getCurrentContext(): Record<string, any> {
    const state = JSON.parse(localStorage.getItem('monarch_system_state') || '{}');
    return {
      debt: state.debt,
      level: state.level,
      cleanDays: state.cleanDays,
      benchPress: state.benchPress,
      lastUpdate: new Date().toISOString()
    };
  }
}

export const logger = DataLogger.getInstance();
