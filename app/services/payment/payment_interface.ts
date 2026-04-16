export type CreatePaymentPayload = {
  phone_number: string
  amount: number
  network: 'TMONEY' | 'FLOOZ'
  description: string
  identifier: string
  email?: string
  name?: string
}

export type PaymentCreateResponse = {
  tx_reference: string
  status: number
  message?: string
}

export type PaymentCheckResponse = {
  status: number
  message?: string
  transaction_status?: 'pending' | 'completed' | 'rejected'
}

export interface PaymentServiceInterface {
  createPayment(payload: CreatePaymentPayload): Promise<PaymentCreateResponse>
  checkPaymentStatus(
    txReference: string,
    identifier: string
  ): Promise<PaymentCheckResponse>
}