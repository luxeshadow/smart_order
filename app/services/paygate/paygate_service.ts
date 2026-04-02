export type CreatePaymentPayload = {
  phone_number: string
  amount: number
  network: 'TMONEY' | 'FLOOZ'
  description: string
  identifier: string
}

export type PaygateCreateResponse = {
  tx_reference: string
  status: number
  message?: string
}

export type PaygateCheckResponse = {
  status: number
  message?: string
  transaction_status?: 'pending' | 'success' | 'failed'
}

export class PaygateService {
  async createPayment(payload: CreatePaymentPayload): Promise<PaygateCreateResponse> {
    return await $fetch<PaygateCreateResponse>('/api/paygate/create', {
      method: 'POST',
      body: payload
    })
  }

  async checkPaymentStatus(txReference: string): Promise<PaygateCheckResponse> {
    return await $fetch<PaygateCheckResponse>('/api/paygate/check', {
      method: 'POST',
      body: {
        tx_reference: txReference
      }
    })
  }
}