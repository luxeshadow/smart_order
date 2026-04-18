import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserBalance } from '@/features/transaction/domain/entities/user_balance'
import type { MyTransaction } from '~/features/transaction/domain/entities/my_transaction'
import type { ListMyTransactionUseCase } from '@/features/transaction/application/usecases/list_my_transaction_usecase'
import { DatabaseFailure } from '@/core/errors/failure'

export const useTransactionStore = defineStore('transaction', () => {

  const mainBalance = ref<number | null>(null)
  const dailyEarnings = ref<number>(0)
  const refundBalance = ref<number>(0)

  const transactions = ref<MyTransaction[]>([])
  const isLoading = ref(false)
  const hasMore = ref(true)

  function updateBalance(newBalance: number) {
    mainBalance.value = newBalance
  }

  function updateEarnings(newEarnings: number) {
    dailyEarnings.value = newEarnings
  }

  function updateRefund(newRefund: number) {
    refundBalance.value = newRefund
  }

  // 🔥 FIX: Entity au lieu de Param
  function updateAllBalances(balances: UserBalance) {
    mainBalance.value = balances.main
    dailyEarnings.value = balances.earnings
    refundBalance.value = balances.refund
  }

  async function fetchTransactions(
    useCase: ListMyTransactionUseCase,
    userId: string
  ) {
    if (isLoading.value) return

    isLoading.value = true

    const result = await useCase.execute({ userId })

    if (result instanceof DatabaseFailure) {
      isLoading.value = false
      return
    }

    const freshData = result as MyTransaction[]

    const hasChanged =
      JSON.stringify(freshData) !== JSON.stringify(transactions.value)

    if (hasChanged) {
      transactions.value = freshData
    }

    hasMore.value = freshData.length > 0

    isLoading.value = false
  }

  function resetHistory() {
    transactions.value = []
    hasMore.value = true
    isLoading.value = false
  }

  return {
    mainBalance,
    dailyEarnings,
    refundBalance,

    updateBalance,
    updateEarnings,
    updateRefund,
    updateAllBalances,

    transactions,
    isLoading,
    hasMore,
    fetchTransactions,
    resetHistory
  }
})