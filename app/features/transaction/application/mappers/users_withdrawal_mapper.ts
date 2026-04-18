import type { UserWithdrawal } from '../../domain/entities/users_withdrawal'
import type { UserWithdrawalGroupViewModel } from '../../presentation/viewmodels/users_withdrawal_view_model'

export class UserWithdrawalMapper {
  static toViewModel(
    data: UserWithdrawal[]
  ): UserWithdrawalGroupViewModel[] {

    const map = new Map<string, UserWithdrawalGroupViewModel>()

    data.forEach((item) => {
      if (!map.has(item.userId)) {
        map.set(item.userId, {
          userId: item.userId,

          username: item.username,
          email: item.email,
          phone: item.phoneNumber,

          validatedAmounts: [],
          totalValidated: 0,

          pendingWithdrawals: [],
          totalPending: 0,

          pendingCount: 0,
          lastWithdrawalDate: null
        })
      }

      const user = map.get(item.userId)!
      if (
        !user.lastWithdrawalDate ||
        new Date(item.createdAt) > new Date(user.lastWithdrawalDate)
      ) {
        user.lastWithdrawalDate = item.createdAt
      }

      if (item.status === 'completed') {
        user.validatedAmounts.push(item.amount)
        user.totalValidated += item.amount
      }

      if (item.status === 'pending') {
        user.pendingWithdrawals.push({
          id: item.id,
          amount: item.amount,
          createdAt: item.createdAt,
          method: item.method
        })

        user.totalPending += item.amount
        user.pendingCount += 1
      }

    })

    map.forEach((user) => {
      user.pendingWithdrawals.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
    })
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.lastWithdrawalDate || 0).getTime() -
        new Date(a.lastWithdrawalDate || 0).getTime()
    )
  }
}