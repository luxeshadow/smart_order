export interface ChildDetail {
  id: string
  username: string
  mainBalance: number
  phoneNumber: string
  activeLevels: string[]
}

export interface UserDetail {
  id: string
  username: string
  email: string
  role: string
  mainBalance: number
  refundBalance: number
  levelNames: string[]
  childrenDetails: ChildDetail[] 
}