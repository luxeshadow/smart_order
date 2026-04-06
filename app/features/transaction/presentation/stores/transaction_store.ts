import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserBalanceParam } from '@/features/transaction/application/params/user_balance_params'

export const useTransactionStore = defineStore('transaction', () => {
  const mainBalance = ref<number | null>(null)
  const dailyEarnings = ref<number>(0)
  const refundBalance = ref<number>(0)

  function updateBalance(newBalance: number) {
    mainBalance.value = newBalance
  }


  function updateEarnings(newEarnings: number) {
    dailyEarnings.value = newEarnings
  }


  function updateRefund(newRefund: number) {
    refundBalance.value = newRefund
  }

  function updateAllBalances(balances: UserBalanceParam) {
    mainBalance.value = balances.main
    dailyEarnings.value = balances.earnings
    refundBalance.value = balances.refund
  }

  return {
    mainBalance,
    dailyEarnings,
    refundBalance,
    updateBalance,
    updateEarnings,
    updateRefund,
    updateAllBalances
  }
})