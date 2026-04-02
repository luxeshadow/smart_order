export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const response = await $fetch('https://paygateglobal.com/api/v1/pay', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paygateApiKey}`
    },
    body: {
      phone_number: body.phone_number,
      amount: body.amount,
      network: body.network,
      description: body.description,
      identifier: body.identifier
    }
  })

  return response
})