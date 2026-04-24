export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()



  if (!body.phone || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing phone or message'
    })
  }

  try {
    const response: any = await $fetch(
      'https://edok-api.kingsmspro.com/api/v1/sms/send',
      {
        method: 'POST',
        headers: {
          APIKEY: config.kingsmsApiKey,
          CLIENTID: config.kingsmsClientId,
          'Content-Type': 'application/json'
        },
        body: {
          from: 'Smart Order',
          to: body.phone,
          message: body.message,
          type: 0
        }
      }
    )

    console.log('✅ KING SMS RESPONSE =>', response)

    return response

  } catch (error: any) {
    console.error('❌ FULL ERROR =>', error?.data || error)

    throw createError({
      statusCode: error?.response?.status || 500,
      statusMessage:
        error?.response?._data?.message ||
        error?.data?.message ||
        error.message ||
        'SMS failed'
    })
  }
})