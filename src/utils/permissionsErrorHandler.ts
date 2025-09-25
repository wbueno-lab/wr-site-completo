import { PostgrestError } from '@supabase/supabase-js';

export class PermissionsError extends Error {
  constructor(
    message: string,
    public originalError?: PostgrestError | Error,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PermissionsError';
  }
}

export const handlePermissionsError = (error: unknown): PermissionsError => {
  console.error('Erro original:', error);

  if (error instanceof PermissionsError) {
    return error;
  }

  // Erro do Supabase
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as PostgrestError;
    
    switch (supabaseError.code) {
      case 'PGRST116':
        return new PermissionsError(
          'Permissões não encontradas',
          supabaseError,
          'PERMISSIONS_NOT_FOUND',
          { details: 'Não foi possível encontrar as permissões do usuário' }
        );
      
      case '23505':
        return new PermissionsError(
          'Conflito de permissões',
          supabaseError,
          'PERMISSIONS_CONFLICT',
          { details: 'Já existe uma permissão igual para este usuário' }
        );
      
      case '42P01':
        return new PermissionsError(
          'Erro na estrutura do banco de dados',
          supabaseError,
          'DATABASE_ERROR',
          { details: 'Tabela de permissões não encontrada' }
        );
      
      case '57014':
        return new PermissionsError(
          'Tempo limite excedido',
          supabaseError,
          'QUERY_TIMEOUT',
          { details: 'A consulta de permissões demorou muito para responder' }
        );
      
      default:
        if (supabaseError.message?.includes('timeout')) {
          return new PermissionsError(
            'Tempo limite excedido',
            supabaseError,
            'TIMEOUT',
            { details: 'A operação demorou muito para responder' }
          );
        }
        
        return new PermissionsError(
          'Erro desconhecido no banco de dados',
          supabaseError,
          'DATABASE_ERROR',
          { details: supabaseError.message }
        );
    }
  }

  // Erro de rede
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return new PermissionsError(
        'Erro de conexão',
        error,
        'NETWORK_ERROR',
        { details: 'Não foi possível conectar ao servidor' }
      );
    }

    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return new PermissionsError(
        'Tempo limite excedido',
        error,
        'TIMEOUT',
        { details: 'A operação demorou muito para responder' }
      );
    }

    return new PermissionsError(
      'Erro inesperado',
      error,
      'UNKNOWN_ERROR',
      { details: error.message }
    );
  }

  return new PermissionsError(
    'Erro desconhecido',
    undefined,
    'UNKNOWN_ERROR',
    { details: 'Ocorreu um erro desconhecido ao verificar permissões' }
  );
};

export const getErrorMessage = (error: PermissionsError): string => {
  switch (error.code) {
    case 'PERMISSIONS_NOT_FOUND':
      return 'Não foi possível encontrar suas permissões. Por favor, faça login novamente.';
    
    case 'PERMISSIONS_CONFLICT':
      return 'Houve um conflito ao verificar suas permissões. Por favor, tente novamente.';
    
    case 'DATABASE_ERROR':
      return 'Ocorreu um erro no banco de dados. Por favor, tente novamente mais tarde.';
    
    case 'NETWORK_ERROR':
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    
    case 'TIMEOUT':
      return 'O servidor demorou muito para responder. Por favor, tente novamente.';
    
    case 'QUERY_TIMEOUT':
      return 'A consulta de permissões demorou muito. Por favor, tente novamente.';
    
    default:
      return 'Ocorreu um erro ao verificar suas permissões. Por favor, tente novamente mais tarde.';
  }
};