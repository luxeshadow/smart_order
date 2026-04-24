export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  console.log('TEXTBELT KEY =>', config.textbeltApiKey)

  try {
    const response: any = await $fetch('https://textbelt.com/text', {
      method: 'POST',
      body: {
        phone: body.phone,
        message: body.message,
        key: config.textbeltApiKey
      }
    })

    return response

  } catch (error: any) {
    console.error('SMS ERROR =>', error)

    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})