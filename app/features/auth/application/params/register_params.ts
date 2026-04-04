export interface RegisterParam {
  userName: string
  email: string
  phoneNumber: string
  password: string
}

export interface RegisterPayload extends RegisterParam {
  role: string
}