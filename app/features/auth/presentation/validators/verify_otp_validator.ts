export class VerifyOtpValidator {

  static validate(otp: string): string | null {

    if (!otp || otp.trim() === '') {
      return "Le code de vérification est requis"
    }

    if (otp.length !== 6) {
      return "Le code doit contenir exactement 6 chiffres"
    }

    const isNumeric = /^\d+$/.test(otp)
    if (!isNumeric) {
      return "Le code ne doit contenir que des chiffres"
    }

    return null
  }
}