import { TextbeltService } from '../sms/textBell/textbelt'
import type { SmsService } from './sms_interface'

export const getSmsService = (): SmsService => {
  const config = useRuntimeConfig()

  const provider = config.public.smsProvider

  switch (provider) {
    case 'textbelt':
      return new TextbeltService()

    default:
      return new TextbeltService()
  }
}