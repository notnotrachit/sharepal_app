import { secureStorage } from '../utils/secureStorage';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: string;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: DebugLog[] = [];
  private maxLogs = 100;
  private storageKey = 'debug_logs';

  constructor() {
    this.loadLogs();
  }

  private async loadLogs() {
    try {
      const storedLogs = await secureStorage.getItem(this.storageKey);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  private async saveLogs() {
    try {
      await secureStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      // Ignore storage errors
    }
  }

  private addLog(level: DebugLog['level'], category: string, message: string, data?: any) {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? JSON.stringify(data) : undefined,
    };

    this.logs.unshift(log); // Add to beginning
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console in development
    if (__DEV__) {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : console.log;
      logMethod(`[${category}] ${message}`, data || '');
    }

    this.saveLogs();
  }

  info(category: string, message: string, data?: any) {
    this.addLog('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.addLog('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.addLog('error', category, message, data);
  }

  success(category: string, message: string, data?: any) {
    this.addLog('success', category, message, data);
  }

  getLogs(): DebugLog[] {
    return [...this.logs];
  }

  getLogsByCategory(category: string): DebugLog[] {
    return this.logs.filter(log => log.category === category);
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const debugLogger = new DebugLogger();