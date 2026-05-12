export interface RegisterParam {
  userName: string
  email: string
  phoneNumber: string
  password: string
  referredBy?: string | null
}

export interface RegisterPayload extends RegisterParam {
  role: string
}