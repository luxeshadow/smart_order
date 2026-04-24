import type { SmsService } from '../sms_interface'

type KingSmsResponse = {
  messageId?: string
  status?: string
  error?: string
}

export class KingSmsService implements SmsService {
  async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      const res = await $fetch<KingSmsResponse>('/api/kingsms/send', {
        method: 'POST',
        body: {
          phone,
          message
        }
      })

      // KING SMS retourne souvent messageId si succès
      if (!res || !res.messageId) {
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