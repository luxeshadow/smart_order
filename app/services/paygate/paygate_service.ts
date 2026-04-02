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
  transaction_status?: 'pending' | 'completed' | 'rejected'
}



import { createClient } from '@supabase/supabase-js'

export class PaygateService {
  private supabase: any

  constructor() {
    const config = useRuntimeConfig()
    this.supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  }

  async createPayment(payload: CreatePaymentPayload): Promise<PaygateCreateResponse> {
    const response = await $fetch<PaygateCreateResponse>('/api/paygate/create', {
      method: 'POST',
      body: payload
    })

    if (response.status === 0 && response.tx_reference) {
      await this.supabase
        .from('deposits')
        .update({ paygate_reference: String(response.tx_reference) })
        .eq('reference_id', payload.identifier)
    }
    return response
  }

  async checkPaymentStatus(txReference: string, identifier: string): Promise<PaygateCheckResponse> {
    const response = await $fetch<any>('/api/paygate/check', {
      method: 'POST',
      body: { tx_reference: txReference }
    })

    const depositStatus = response.status === 0 ? 'completed' : 'rejected'
    
    await this.supabase
      .from('deposits')
      .update({ status: depositStatus })
      .eq('reference_id', identifier)

    return {
      status: response.status,
      message: response.message,
      transaction_status: depositStatus
    }
  }
}