import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const txReference = body.tx_reference
  const identifier = body.identifier

  // ✅ Vérification stricte
  if (!txReference || txReference === -1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'tx_reference invalide'
    })
  }

  try {
    // ✅ Appel API PayGate
    const statusRes: any = await $fetch(
      'https://paygateglobal.com/api/v1/status',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          auth_token: config.paygateApiKey,
          tx_reference: txReference
        }
      }
    )


    if (
      identifier &&
      config.supabaseServiceRoleKey &&
      config.public.supabaseUrl
    ) {
      const supabase = createClient(
        config.public.supabaseUrl,
        config.supabaseServiceRoleKey
      )

      const depositStatus =
        statusRes.status === 0 ? 'success' : 'failed'

      await supabase
        .from('deposits')
        .update({
          status: depositStatus
        })
        .eq('reference_id', identifier)
    }

    return {
      success: true,
      status: statusRes.status,
      message: statusRes.message,
      transaction_status:
        statusRes.status === 0 ? 'success' : 'failed',
      data: statusRes
    }
  } catch (error: any) {
    console.error('PAYGATE CHECK ERROR:', error)

    throw createError({
      statusCode: 500,
      statusMessage:
        error?.data?.message ||
        error.message ||
        'Erreur lors de la vérification PayGate'
    })
  }
})