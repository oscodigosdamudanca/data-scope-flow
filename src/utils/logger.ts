/**
 * Sistema de logging centralizado para a aplicação DataScope
 * Substitui o uso direto de console.error por um sistema mais robusto
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: Error | unknown;
  timestamp: Date;
  userId?: string;
  companyId?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Limite de logs em memória

  /**
   * Log de erro
   */
  error(message: string, error?: Error | unknown, context?: string, metadata?: { userId?: string; companyId?: string }) {
    this.log(LogLevel.ERROR, message, context, error, metadata);
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: string, metadata?: { userId?: string; companyId?: string }) {
    this.log(LogLevel.WARN, message, context, undefined, metadata);
  }

  /**
   * Log de informação
   */
  info(message: string, context?: string, metadata?: { userId?: string; companyId?: string }) {
    this.log(LogLevel.INFO, message, context, undefined, metadata);
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, context?: string, metadata?: { userId?: string; companyId?: string }) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context, undefined, metadata);
    }
  }

  /**
   * Método principal de logging
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    error?: Error | unknown,
    metadata?: { userId?: string; companyId?: string }
  ) {
    const logEntry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp: new Date(),
      userId: metadata?.userId,
      companyId: metadata?.companyId
    };

    // Adiciona à lista de logs em memória
    this.addToMemoryLogs(logEntry);

    // Log no console baseado no nível
    this.logToConsole(logEntry);

    // Em produção, poderia enviar para serviço de logging externo
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToExternalService(logEntry);
    }
  }

  /**
   * Adiciona log à memória com limite
   */
  private addToMemoryLogs(logEntry: LogEntry) {
    this.logs.push(logEntry);
    
    // Remove logs antigos se exceder o limite
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Log formatado no console
   */
  private logToConsole(logEntry: LogEntry) {
    const timestamp = logEntry.timestamp.toISOString();
    const contextStr = logEntry.context ? `[${logEntry.context}]` : '';
    const userStr = logEntry.userId ? `[User: ${logEntry.userId}]` : '';
    const companyStr = logEntry.companyId ? `[Company: ${logEntry.companyId}]` : '';
    
    const prefix = `${timestamp} ${contextStr}${userStr}${companyStr}`;
    const fullMessage = `${prefix} ${logEntry.message}`;

    switch (logEntry.level) {
      case LogLevel.ERROR:
        console.error(fullMessage, logEntry.error || '');
        break;
      case LogLevel.WARN:
        console.warn(fullMessage);
        break;
      case LogLevel.INFO:
        console.info(fullMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(fullMessage);
        break;
    }
  }

  /**
   * Envia logs críticos para serviço externo (implementação futura)
   */
  private sendToExternalService(logEntry: LogEntry) {
    // TODO: Implementar integração com serviço de logging externo
    // Ex: Sentry, LogRocket, etc.
    console.warn('Log crítico detectado - implementar envio para serviço externo:', logEntry);
  }

  /**
   * Retorna logs em memória (para debugging)
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Limpa logs em memória
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Exporta logs como JSON (para debugging)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Funções de conveniência para uso direto
export const logError = (message: string, error?: Error | unknown, context?: string, metadata?: { userId?: string; companyId?: string }) => {
  logger.error(message, error, context, metadata);
};

export const logWarn = (message: string, context?: string, metadata?: { userId?: string; companyId?: string }) => {
  logger.warn(message, context, metadata);
};

export const logInfo = (message: string, context?: string, metadata?: { userId?: string; companyId?: string }) => {
  logger.info(message, context, metadata);
};

export const logDebug = (message: string, context?: string, metadata?: { userId?: string; companyId?: string }) => {
  logger.debug(message, context, metadata);
};