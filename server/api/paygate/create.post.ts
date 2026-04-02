//server/api/paygate/create.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (!body.phone_number || !body.amount || !body.network) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Champs de paiement manquants'
    })
  }

  try {
    const response: any = await $fetch(
      'https://paygateglobal.com/api/v1/pay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          auth_token: config.paygateApiKey,
          phone_number: body.phone_number,
          amount: Number(body.amount),
          network: String(body.network).toUpperCase(),
          description: body.description || 'Recharge de compte',
          identifier: body.identifier
        }
      }
    )

    return response
  } catch (error: any) {
    console.error('PAYGATE CREATE ERROR:', error)

    throw createError({
      statusCode: 500,
      statusMessage:
        error?.data?.message ||
        error.message ||
        'Erreur lors de la création du paiement'
    })
  }
})