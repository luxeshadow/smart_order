import type { SmsService } from '../sms_interface'

type SmsResponse = {
  success: boolean
  error?: string
}

export class TextbeltService implements SmsService {
  async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      const res = await $fetch<SmsResponse>('/api/textbelt/send', {
        method: 'POST',
        body: {
          phone,
          message
        }
      })

      if (!res || res.success !== true) {
        console.error('SMS failed:', res?.error || 'Unknown error')
        return false
      }

      return true
    } catch (e) {
      console.error('SMS error:', e)
      return false
    }
  }
}