// Tipos para o novo sistema de pagamento

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  requires_online: boolean;
  processing_fee_percentage: number;
  min_amount: number;
  max_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodType {
  CREDIT_CARD: 'credit_card';
  DEBIT_CARD: 'debit_card';
  PIX: 'pix';
  BOLETO: 'boleto';
  BANK_TRANSFER: 'bank_transfer';
  CASH_ON_DELIVERY: 'cash_on_delivery';
  CARD_ON_DELIVERY: 'card_on_delivery';
}

export interface CardPaymentData {
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
  cardType?: string;
}

export interface PixPaymentData {
  pixKey?: string;
  qrCode: string;
  qrCodeBase64?: string;
  expirationTime: Date;
  amount: number;
}

export interface BoletoPaymentData {
  boletoCode: string;
  barCode: string;
  dueDate: Date;
  amount: number;
  instructions?: string;
}

export interface PaymentDetails {
  method: string;
  amount: number;
  fee_amount?: number;
  total_amount: number;
  installments?: number;
  card_data?: Partial<CardPaymentData>;
  pix_data?: PixPaymentData;
  boleto_data?: BoletoPaymentData;
  status: PaymentStatus;
  transaction_id?: string;
  external_id?: string;
  processed_at?: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  redirectUrl?: string;
  qrCode?: string;
  boletoUrl?: string;
  message: string;
  status?: PaymentStatus;
  details?: PaymentDetails;
}

export interface ShippingCalculation {
  cep_origin: string;
  cep_destination: string;
  weight: number;
  length: number;
  height: number;
  width: number;
  services: ShippingService[];
}

export interface ShippingService {
  code: string;
  name: string;
  price: number;
  delivery_time: number;
  company: 'correios' | 'sedex' | 'pac';
  additional_info?: string;
}

export interface ShippingResult {
  success: boolean;
  services: ShippingService[];
  error?: string;
}

export interface OrderData {
  items: OrderItem[];
  payment_method: string;
  payment_details?: PaymentDetails;
  total_amount: number;
  shipping_cost?: number;
  shipping_service?: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_cpf?: string; // CPF do cliente (opcional)
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  notes?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  product_snapshot?: any; // Snapshot completo do produto no momento da compra
  price: number;
  selectedSize?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}




