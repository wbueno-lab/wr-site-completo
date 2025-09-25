// Tipos para integração com Mercado Pago

export interface MercadoPagoItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MercadoPagoPayer {
  name?: string;
  surname?: string;
  email: string;
  phone?: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: string;
    number: string;
  };
  address?: {
    street_name: string;
    street_number: number;
    zip_code: string;
  };
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer?: MercadoPagoPayer;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  notification_url?: string;
  external_reference?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

export interface MercadoPagoPayment {
  id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  description: string;
  payment_method_id: string;
  payment_type_id: string;
  date_approved?: string;
  date_created: string;
  date_last_updated: string;
  external_reference?: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
    phone: {
      area_code: string;
      number: string;
    };
    first_name: string;
    last_name: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status?: string;
  message?: string;
  redirectUrl?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'bank_transfer';
  enabled: boolean;
  installments?: {
    min: number;
    max: number;
  };
  fee?: {
    percentage: number;
    fixed?: number;
  };
}

