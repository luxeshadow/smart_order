export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const amount = Number(body.amount)

  try {
    const response: any = await $fetch(
      'https://api-checkout.cinetpay.com/v2/payment',
      {
        method: 'POST',
        body: {
          apikey: config.cinetpayApiKey,
          site_id: config.cinetpaySiteId,
          transaction_id: body.identifier,
          amount,
          currency: 'XOF',
          channels: 'MOBILE_MONEY',
          description: body.description,

          customer_name: body.name || 'Client',
          customer_surname: body.name || 'User',
          customer_email: body.email || 'client@smartorder.com',
          customer_phone_number: body.phone_number,

          customer_address: 'Lomé',
          customer_city: 'Lomé',
          customer_country: 'TG',
          customer_state: 'TG',
          customer_zip_code: '00000',

          notify_url: `${config.public.baseUrl}/api/cinetpay/notify`,
          return_url: `${config.public.baseUrl}/payment-success`,
          metadata: body.identifier,
          lang: 'fr'
        }
      }
    )

    return response
  } catch (error: any) {
    console.error('CinetPay create error =>', error?.data || error)

    throw createError({
      statusCode: 500,
      statusMessage:
        error?.data?.description ||
        error?.message ||
        'Erreur paiement CinetPay'
    })
  }
})