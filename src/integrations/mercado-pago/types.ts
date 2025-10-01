// Tipos para integração com Mercado Pago

export interface MercadoPagoPaymentMethod {
  id: string;
  name: string;
  payment_type_id: 'credit_card' | 'debit_card' | 'ticket' | 'bank_transfer' | 'account_money';
  status: 'active' | 'inactive';
  secure_thumbnail: string;
  thumbnail: string;
  deferred_capture: 'supported' | 'unsupported' | 'does_not_apply';
  settings: Array<{
    card_number: {
      validation: string;
      length: number;
    };
    bin: {
      pattern: string;
      installments_pattern: string;
      exclusion_pattern: string;
    };
    security_code: {
      length: number;
      card_location: string;
      mode: string;
    };
  }>;
  additional_info_needed: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  accreditation_time: number;
  financial_institutions: any[];
  processing_modes: string[];
}

export interface MercadoPagoCardToken {
  id: string;
  public_key: string;
  card_id: string | null;
  status: string;
  date_created: string;
  date_last_updated: string;
  date_due: string;
  luhn_validation: boolean;
  live_mode: boolean;
  require_esc: boolean;
  card_number_length: number;
  security_code_length: number;
}

export interface MercadoPagoPaymentRequest {
  transaction_amount: number;
  token?: string;
  description: string;
  installments: number;
  payment_method_id: string;
  issuer_id?: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  additional_info?: {
    items: Array<{
      id: string;
      title: string;
      description?: string;
      picture_url?: string;
      category_id?: string;
      quantity: number;
      unit_price: number;
    }>;
    payer?: {
      first_name?: string;
      last_name?: string;
      phone?: {
        area_code?: string;
        number?: string;
      };
      address?: {
        zip_code?: string;
        street_name?: string;
        street_number?: string;
      };
    };
    shipments?: {
      receiver_address: {
        zip_code: string;
        state_name: string;
        city_name: string;
        street_name: string;
        street_number: number;
      };
    };
  };
  statement_descriptor?: string;
  external_reference?: string;
  notification_url?: string;
  metadata?: Record<string, any>;
}

export interface MercadoPagoPaymentResponse {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  operation_type: string;
  date_created: string;
  date_approved: string | null;
  date_last_updated: string;
  money_release_date: string | null;
  currency_id: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  differential_pricing_id: string | null;
  deduction_schema: string | null;
  transaction_details: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    external_resource_url: string | null;
    installment_amount: number;
    financial_institution: string | null;
    payment_method_reference_id: string | null;
    payable_deferral_period: string | null;
    acquirer_reference: string | null;
  };
  fee_details: Array<{
    type: string;
    amount: number;
    fee_payer: string;
  }>;
  captured: boolean;
  binary_mode: boolean;
  call_for_authorize_id: string | null;
  statement_descriptor: string;
  installments: number;
  card: {
    id: string | null;
    first_six_digits: string;
    last_four_digits: string;
    expiration_month: number;
    expiration_year: number;
    date_created: string;
    date_last_updated: string;
    cardholder: {
      name: string;
      identification: {
        type: string;
        number: string;
      };
    };
  };
  payment_method_id: string;
  issuer_id: string;
  payment_type_id: string;
  payer: {
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
    type: string;
  };
  external_reference: string;
  metadata: Record<string, any>;
  notification_url: string;
  description: string;
  point_of_interaction?: {
    type: string;
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    };
  };
}

export interface MercadoPagoPixPaymentRequest {
  transaction_amount: number;
  description: string;
  payment_method_id: 'pix';
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  external_reference?: string;
  notification_url?: string;
  metadata?: Record<string, any>;
}

export interface MercadoPagoBoletoPaymentRequest {
  transaction_amount: number;
  description: string;
  payment_method_id: 'bolbradesco' | 'pec';
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
    address?: {
      zip_code: string;
      street_name: string;
      street_number: string;
      neighborhood: string;
      city: string;
      federal_unit: string;
    };
  };
  external_reference?: string;
  notification_url?: string;
  metadata?: Record<string, any>;
}

export interface MercadoPagoInstallment {
  installments: number;
  installment_rate: number;
  discount_rate: number;
  reimbursement_rate: number | null;
  labels: string[];
  installment_rate_collector: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  recommended_message: string;
  installment_amount: number;
  total_amount: number;
  payment_method_option_id: string;
}

export interface MercadoPagoError {
  error: string;
  message: string;
  status: number;
  cause?: Array<{
    code: string;
    description: string;
    data: string | null;
  }>;
}


