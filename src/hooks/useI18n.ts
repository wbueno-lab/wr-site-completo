import { useCallback } from 'react';
import { messages as ptBR } from '@/i18n/pt-BR';

type Messages = typeof ptBR;
type Path = keyof Messages | string;

export const useI18n = () => {
  const messages = ptBR;

  const t = useCallback((path: Path, params?: Record<string, string | number>) => {
    const keys = path.split('.');
    let value: any = messages;

    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        console.warn(`Translation not found for key: ${path}`);
        return path;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${path}`);
      return path;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, key) => {
        const replacement = params[key];
        return replacement !== undefined ? String(replacement) : `{${key}}`;
      });
    }

    return value;
  }, []);

  return { t };
};
