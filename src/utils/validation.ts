// Sistema de validação de formulários
import { useState } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Validações comuns
export const validations = {
  required: (message = 'Este campo é obrigatório'): ValidationRule => ({
    required: true,
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Mínimo de ${min} caracteres`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Máximo de ${max} caracteres`
  }),

  email: (message = 'Email inválido'): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  }),

  phone: (message = 'Telefone inválido'): ValidationRule => ({
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    message
  }),

  cpf: (message = 'CPF inválido'): ValidationRule => ({
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message
  }),

  cep: (message = 'CEP inválido'): ValidationRule => ({
    pattern: /^\d{5}-\d{3}$/,
    message
  }),

  price: (message = 'Preço inválido'): ValidationRule => ({
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return message;
      }
      return null;
    }
  }),

  positiveNumber: (message = 'Número deve ser positivo'): ValidationRule => ({
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return message;
      }
      return null;
    }
  }),

  integer: (message = 'Deve ser um número inteiro'): ValidationRule => ({
    custom: (value: any) => {
      const num = parseInt(value);
      if (isNaN(num) || !Number.isInteger(parseFloat(value))) {
        return message;
      }
      return null;
    }
  }),

  url: (message = 'URL inválida'): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message
  }),

  password: (message = 'Senha deve ter pelo menos 6 caracteres'): ValidationRule => ({
    minLength: 6,
    message
  }),

  confirmPassword: (password: string, message = 'Senhas não coincidem'): ValidationRule => ({
    custom: (value: any) => {
      if (value !== password) {
        return message;
      }
      return null;
    }
  })
};

// Função principal de validação
export const validate = (data: Record<string, any>, schema: ValidationSchema): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const error = validateField(value, rules);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar campo individual
export const validateField = (value: any, rules: ValidationRule): string | null => {
  // Verificar se é obrigatório
  if (rules.required && (!value || value.toString().trim() === '')) {
    return rules.message || 'Este campo é obrigatório';
  }

  // Se não é obrigatório e está vazio, não validar
  if (!rules.required && (!value || value.toString().trim() === '')) {
    return null;
  }

  const stringValue = value.toString();

  // Validar comprimento mínimo
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.message || `Mínimo de ${rules.minLength} caracteres`;
  }

  // Validar comprimento máximo
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.message || `Máximo de ${rules.maxLength} caracteres`;
  }

  // Validar padrão
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.message || 'Formato inválido';
  }

  // Validar função customizada
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
};

// Validar em tempo real
export const validateFieldRealTime = (
  value: any,
  rules: ValidationRule,
  debounceMs = 300
): Promise<string | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const error = validateField(value, rules);
      resolve(error);
    }, debounceMs);
  });
};

// Schemas de validação comuns
export const schemas = {
  product: {
    name: [
      validations.required('Nome do produto é obrigatório'),
      validations.minLength(3, 'Nome deve ter pelo menos 3 caracteres'),
      validations.maxLength(255, 'Nome muito longo')
    ],
    price: [
      validations.required('Preço é obrigatório'),
      validations.price('Preço deve ser maior que zero')
    ],
    description: [
      validations.maxLength(1000, 'Descrição muito longa')
    ],
    stock_quantity: [
      validations.positiveNumber('Estoque deve ser um número positivo')
    ]
  },

  user: {
    email: [
      validations.required('Email é obrigatório'),
      validations.email('Email inválido')
    ],
    password: [
      validations.required('Senha é obrigatória'),
      validations.password('Senha deve ter pelo menos 6 caracteres')
    ],
    full_name: [
      validations.required('Nome completo é obrigatório'),
      validations.minLength(2, 'Nome deve ter pelo menos 2 caracteres')
    ],
    phone: [
      validations.phone('Telefone inválido')
    ]
  },

  order: {
    customer_name: [
      validations.required('Nome do cliente é obrigatório'),
      validations.minLength(2, 'Nome deve ter pelo menos 2 caracteres')
    ],
    customer_email: [
      validations.required('Email do cliente é obrigatório'),
      validations.email('Email inválido')
    ],
    customer_phone: [
      validations.phone('Telefone inválido')
    ]
  }
};

// Hook para validação
export const useValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validateData = (data: Record<string, any>) => {
    const result = validate(data, schema);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  };

  const validateField = (field: string, value: any) => {
    const rules = schema[field];
    if (rules) {
      const error = validateField(value, rules);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
      return !error;
    }
    return true;
  };

  const clearErrors = () => {
    setErrors({});
    setIsValid(false);
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return {
    errors,
    isValid,
    validateData,
    validateField,
    clearErrors,
    clearFieldError
  };
};
