import React, { createContext, useContext, useState } from 'react';
import { messages as ptBR } from '@/i18n/pt-BR';

type Messages = typeof ptBR;
type Path = keyof Messages | string;

interface I18nContextType {
  t: (path: Path, params?: Record<string, string | number>) => string;
  locale: string;
  setLocale: (locale: string) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState('pt-BR');
  const messages = ptBR;

  const t = (path: Path, params?: Record<string, string | number>) => {
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
  };

  const value = {
    t,
    locale,
    setLocale,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};
