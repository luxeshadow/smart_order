import { createClient } from '@supabase/supabase-js'
import type {
  CreatePaymentPayload,
  PaymentCheckResponse,
  PaymentCreateResponse,
  PaymentServiceInterface
} from '../payment_interface'

export class PaygateService implements PaymentServiceInterface {
  private supabase: any

  constructor() {
    const config = useRuntimeConfig()
    this.supabase = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey
    )
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async createPayment(
    payload: CreatePaymentPayload
  ): Promise<PaymentCreateResponse> {
    const response = await $fetch<PaymentCreateResponse>(
      '/api/paygate/create',
      {
        method: 'POST',
        body: payload
      }
    )

    if (response.status === 0 && response.tx_reference) {
      await this.supabase
        .from('deposits')
        .update({ paygate_reference: String(response.tx_reference) })
        .eq('reference_id', payload.identifier)
    }

    return response
  }

  async checkPaymentStatus(
    txReference: string,
    identifier: string
  ): Promise<PaymentCheckResponse> {
    // Attendre 5 secondes avant tout
    await this.delay(20000)

    const response = await $fetch<any>('/api/paygate/check', {
      method: 'POST',
      body: { tx_reference: txReference }
    })

    const depositStatus =
      response.status === 0 ? 'completed' : 'rejected'

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