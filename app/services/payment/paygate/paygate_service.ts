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
    const response = await $fetch<any>('/api/paygate/check', {
      method: 'POST',
      body: { tx_reference: txReference }
    })

    // 🔴 CORRECTION ICI : Si ce n'est pas 0 (ex: 2), on laisse en 'pending' 
    // au lieu de forcer 'rejected'. Seul le statut 0 confirme le succès.
    const depositStatus = response.status === 0 ? 'completed' : 'pending'

    // On ne met à jour Supabase que si la transaction est validée (completed).
    // Si c'est 'pending', on laisse le Webhook s'en charger plus tard !
    if (depositStatus === 'completed') {
      await this.supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('reference_id', identifier)
    }

    return {
      status: response.status,
      message: response.message,
      transaction_status: depositStatus
    }
  }
}