export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    const response: any = await $fetch('https://paygateglobal.com/api/v1/pay', {
      method: 'POST',
      body: {
        auth_token: config.paygateApiKey,
        phone_number: body.phone_number,
        amount: Number(body.amount),
        network: String(body.network).toUpperCase(),
        identifier: body.identifier
      }
    })
    return response 
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})