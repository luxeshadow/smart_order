
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { txReference, identifier } = body

    if (!txReference) {
      throw createError({
        statusCode: 400,
        statusMessage: 'txReference requis'
      })
    }

    const statusRes: any = await $fetch('https://paygateglobal.com/api/v1/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.paygateApiKey}`
      },
      body: {
        tx_reference: txReference
      }
    })

    if (identifier && config.public.supabaseUrl && config.public.supabaseKey) {
      const supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseKey
      )

      const status = statusRes.status === 0 ? 'success' : 'failed'

      await supabase
        .from('deposits')
        .update({ status })
        .eq('reference_id', identifier)
    }

    return {
      success: true,
      status: statusRes.status,
      message: statusRes.message,
      data: statusRes
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erreur lors de la vérification PayGate'
    })
  }
})