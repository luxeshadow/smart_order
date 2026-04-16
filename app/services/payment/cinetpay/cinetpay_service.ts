import { createClient } from '@supabase/supabase-js'
import type {
  CreatePaymentPayload,
  PaymentCheckResponse,
  PaymentCreateResponse,
  PaymentServiceInterface
} from '../payment_interface'

export class CinetpayService implements PaymentServiceInterface {
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
    const response: any = await $fetch('/api/cinetpay/create', {
      method: 'POST',
      body: payload
    })

    const txReference = response.data?.payment_token || payload.identifier

    await this.supabase
      .from('deposits')
      .update({ paygate_reference: txReference })
      .eq('reference_id', payload.identifier)

    return {
      status: 0,
      tx_reference: txReference,
      message: 'Paiement initié'
    }
  }

  async checkPaymentStatus(
    txReference: string,
    identifier: string
  ): Promise<PaymentCheckResponse> {
    const response: any = await $fetch('/api/cinetpay/check', {
      method: 'POST',
      body: { transaction_id: txReference }
    })

    const status =
      response.data?.status === 'ACCEPTED'
        ? 'completed'
        : 'rejected'

    await this.supabase
      .from('deposits')
      .update({ status })
      .eq('reference_id', identifier)

    return {
      status: status === 'completed' ? 0 : 1,
      message: response.message,
      transaction_status: status
    }
  }
}