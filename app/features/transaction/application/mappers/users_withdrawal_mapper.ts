import type { Withdrawal } from '../../domain/entities/withdrawal'
import type { UserWithdrawalGroupViewModel } from '../../presentation/viewmodels/users_withdrawal_view_model'

export class UserWithdrawalMapper {
  static toViewModel(
    data: Withdrawal[]
  ): UserWithdrawalGroupViewModel[] {

    const map = new Map<string, UserWithdrawalGroupViewModel>()

    for (const item of data) {

      const createdAt = item.createdAt ?? ''

      if (!map.has(item.userId)) {
        map.set(item.userId, {
          userId: item.userId,
          username: item.username ?? '',
          email: item.email ?? '',
          phone: item.phoneNumber ?? '',

          validatedAmounts: [],
          totalValidated: 0,

          pendingWithdrawals: [],
          totalPending: 0,

          pendingCount: 0,
          lastWithdrawalDate: createdAt || null
        })
      }

      const user = map.get(item.userId)!

      // LAST DATE SAFE
      if (
        createdAt &&
        (!user.lastWithdrawalDate ||
          new Date(createdAt) > new Date(user.lastWithdrawalDate))
      ) {
        user.lastWithdrawalDate = createdAt
      }

      // VALIDATED
      if (item.status === 'completed') {
        user.validatedAmounts.push(item.amount)
        user.totalValidated += item.amount
      }

      // PENDING
      if (item.status === 'pending') {
        user.pendingWithdrawals.push({
          id: item.id,
          amount: item.amount,
          createdAt,
          method: item.method
        })

        user.totalPending += item.amount
        user.pendingCount += 1
      }
    }

    // SORT PENDING
    for (const user of map.values()) {
      user.pendingWithdrawals.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
    }

    // FINAL SORT USERS
    return Array.from(map.values()).sort((a, b) => {
      const dateA = a.lastWithdrawalDate
        ? new Date(a.lastWithdrawalDate).getTime()
        : 0

      const dateB = b.lastWithdrawalDate
        ? new Date(b.lastWithdrawalDate).getTime()
        : 0

      return dateB - dateA
    })
  }
}