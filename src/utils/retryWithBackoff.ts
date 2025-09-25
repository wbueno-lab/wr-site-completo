interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
}

const defaultConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  factor: 2,
};

export class RetryError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public lastError?: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const finalConfig = { ...defaultConfig, ...config };
  let attempt = 0;
  let lastError: Error | undefined;

  while (attempt < finalConfig.maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      lastError = error as Error;

      // Se for um erro de abort (timeout), não tentar novamente
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Operação abortada (timeout)');
        throw error;
      }

      if (attempt === finalConfig.maxAttempts) {
        console.error(`Todas as ${attempt} tentativas falharam`);
        throw new RetryError(
          `Operação falhou após ${attempt} tentativas`,
          attempt,
          lastError
        );
      }

      const delay = Math.min(
        finalConfig.initialDelay * Math.pow(finalConfig.factor, attempt - 1),
        finalConfig.maxDelay
      );

      console.log(
        `Tentativa ${attempt} falhou. Tentando novamente em ${delay}ms...`,
        error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new RetryError(
    `Operação falhou após ${attempt} tentativas`,
    attempt,
    lastError
  );
};