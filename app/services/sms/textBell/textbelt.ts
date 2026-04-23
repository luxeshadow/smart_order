type TextbeltResponse = {
  success: boolean
  quotaRemaining?: number
  error?: string
}

export class TextbeltService {
  async sendSms(phone: string, message: string): Promise<boolean> {
    const config = useRuntimeConfig()

    try {
      const res = await $fetch<TextbeltResponse>('https://textbelt.com/text', {
        method: 'POST',
        body: {
          phone,
          message,
          key: config.textbeltApiKey
        }
      })

      if (!res.success) {
        console.error('SMS failed:', res.error)
        return false
      }

      return true
    } catch (e) {
      console.error('SMS error:', e)
      return false
    }
  }
}