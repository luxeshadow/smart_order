export class UserBalance {
  main: number
  earnings: number
  refund: number

  constructor(params: {
    main: number
    earnings: number
    refund: number
  }) {
    this.main = params.main
    this.earnings = params.earnings
    this.refund = params.refund
  }
}