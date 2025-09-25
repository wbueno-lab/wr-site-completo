// Sistema de tratamento de erros centralizado
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];
  private maxErrors = 100;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Registrar erro
  public logError(error: Error | string, context?: string, details?: any): AppError {
    const appError: AppError = {
      code: this.generateErrorCode(),
      message: typeof error === 'string' ? error : error.message,
      details,
      timestamp: new Date(),
      context
    };

    this.errors.unshift(appError);
    
    // Manter apenas os últimos N erros
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log no console em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('🚨 Error logged:', appError);
    }

    return appError;
  }

  // Obter erros recentes
  public getRecentErrors(limit = 10): AppError[] {
    return this.errors.slice(0, limit);
  }

  // Limpar erros
  public clearErrors(): void {
    this.errors = [];
  }

  // Gerar código de erro único
  private generateErrorCode(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Tratar erros específicos do Supabase
  public handleSupabaseError(error: any, context?: string): AppError {
    let message = 'Erro desconhecido';
    let code = 'SUPABASE_UNKNOWN';

    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          message = 'Registro não encontrado';
          code = 'SUPABASE_NOT_FOUND';
          break;
        case '23505':
          message = 'Registro duplicado';
          code = 'SUPABASE_DUPLICATE';
          break;
        case '23503':
          message = 'Violação de chave estrangeira';
          code = 'SUPABASE_FOREIGN_KEY';
          break;
        case '42501':
          message = 'Permissão negada';
          code = 'SUPABASE_PERMISSION_DENIED';
          break;
        default:
          message = error.message || 'Erro no banco de dados';
          code = `SUPABASE_${error.code}`;
      }
    }

    return this.logError(message, context || 'Supabase', error);
  }

  // Tratar erros de rede
  public handleNetworkError(error: any, context?: string): AppError {
    let message = 'Erro de conexão';
    let code = 'NETWORK_ERROR';

    if (error?.name === 'AbortError') {
      message = 'Requisição cancelada';
      code = 'NETWORK_ABORTED';
    } else if (error?.message?.includes('fetch')) {
      message = 'Falha na requisição';
      code = 'NETWORK_FETCH_ERROR';
    }

    return this.logError(message, context || 'Network', error);
  }

  // Tratar erros de validação
  public handleValidationError(field: string, message: string): AppError {
    return this.logError(`Validação falhou: ${field} - ${message}`, 'Validation', { field });
  }

  // Tratar erros de autenticação
  public handleAuthError(error: any, context?: string): AppError {
    let message = 'Erro de autenticação';
    let code = 'AUTH_ERROR';

    if (error?.message?.includes('Invalid login credentials')) {
      message = 'Credenciais inválidas';
      code = 'AUTH_INVALID_CREDENTIALS';
    } else if (error?.message?.includes('Email not confirmed')) {
      message = 'Email não confirmado';
      code = 'AUTH_EMAIL_NOT_CONFIRMED';
    } else if (error?.message?.includes('User not found')) {
      message = 'Usuário não encontrado';
      code = 'AUTH_USER_NOT_FOUND';
    }

    return this.logError(message, context || 'Authentication', error);
  }
}

// Instância singleton
export const errorHandler = ErrorHandler.getInstance();

// Função de inicialização
export const initializeErrorHandler = () => {
  // Capturar erros não tratados
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error, 'Unhandled Error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Capturar promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(event.reason, 'Unhandled Promise Rejection');
  });

  console.log('✅ Error handler initialized');
};

// Hook para usar o error handler
export const useErrorHandler = () => {
  return {
    logError: (error: Error | string, context?: string, details?: any) => 
      errorHandler.logError(error, context, details),
    handleSupabaseError: (error: any, context?: string) => 
      errorHandler.handleSupabaseError(error, context),
    handleNetworkError: (error: any, context?: string) => 
      errorHandler.handleNetworkError(error, context),
    handleValidationError: (field: string, message: string) => 
      errorHandler.handleValidationError(field, message),
    handleAuthError: (error: any, context?: string) => 
      errorHandler.handleAuthError(error, context),
    getRecentErrors: (limit?: number) => 
      errorHandler.getRecentErrors(limit),
    clearErrors: () => 
      errorHandler.clearErrors()
  };
};