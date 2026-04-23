export interface SmsService {
  sendSms(phone: string, message: string): Promise<boolean>
}