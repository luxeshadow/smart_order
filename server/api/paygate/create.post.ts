export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  // 1. On construit l'adresse du Webhook de VOTRE backend
  // config.public.siteUrl est récupéré de votre variable d'environnement
  const siteUrl = config.public.siteUrl || 'http://192.168.0.173:3000'
  const webhookUrl = `${siteUrl}/api/paygate/webhook`

  try {
    const response: any = await $fetch('https://paygateglobal.com/api/v1/pay', {
      method: 'POST',
      body: {
        auth_token: config.paygateApiKey,
        phone_number: body.phone_number,
        amount: Number(body.amount),
        network: String(body.network).toUpperCase(),
        identifier: body.identifier,
        notification_url: webhookUrl 
      }
    })

    return response 
  } catch (error: any) {
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.message || 'Erreur lors de la création du paiement' 
    })
  }
})