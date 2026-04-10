export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    const response: any = await $fetch('https://paygateglobal.com/api/v1/status', {
      method: 'POST',
      body: {
        auth_token: config.paygateApiKey,
        tx_reference: body.tx_reference
      }
    })
    return response 
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})