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

    // 1. Détermination du statut : seul le statut 0 (numérique ou string) indique le succès immédiat
    const isSuccess = response.status === 0 || response.status === '0'
    const depositStatus = isSuccess ? 'completed' : 'pending'

    // 2. Mise à jour Supabase : UNIQUEMENT en cas de succès confirmé
    // Tout autre statut (2, undefined, etc.) est laissé en 'pending' 
    // pour permettre au polling de continuer ou au Webhook de finaliser plus tard.
    if (isSuccess) {
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