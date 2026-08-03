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

    if (response?.status === 0 && response.tx_reference) {
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
    try {
      const response = await $fetch<any>('/api/paygate/check', {
        method: 'POST',
        body: { tx_reference: txReference }
      })

      /**
       * 1) Si la réponse est vide, null, ou ne contient pas de champ status :
       * On considère le statut comme 'pending' (en attente) pour ne pas casser la boucle de vérification.
       */
      if (!response || response.status === undefined || response.status === null) {
        return {
          status: -1,
          message: response?.message || 'Attente de réponse de Paygate...',
          transaction_status: 'pending'
        }
      }

      /**
       * 2) Traitement des statuts explicites :
       * - status 0 : Succès (completed)
       * - status 2, 4, 6, 201 : En attente de saisie du code secret (pending)
       * - Tout autre statut : Échec ou annulation (rejected)
       */
      let depositStatus: 'completed' | 'pending' | 'rejected' = 'pending'

      if (response.status === 0) {
        depositStatus = 'completed'
      } else if (
        response.status === 2 || 
        response.status === 4 || 
        response.status === 6 ||
        response.status === 201
      ) {
        depositStatus = 'rejected'
      } else {
        depositStatus = 'rejected'
      }

      // ⚠️ On ne met à jour la base Supabase que si le statut est DÉFINITIF
      if (depositStatus !== 'rejected') {
        await this.supabase
          .from('deposits')
          .update({ status: depositStatus })
          .eq('reference_id', identifier)
      }

      return {
        status: response.status,
        message: response.message || 'Statut mis à jour',
        transaction_status: depositStatus
      }

    } catch (error: any) {
 
      return {
        status: -1,
        message: 'Erreur temporaire de connexion à Paygate',
        transaction_status: 'pending'
      }
    }
  }
}