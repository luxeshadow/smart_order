import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserBalanceParam } from '@/features/transaction/application/params/user_balance_params'

export const useTransactionStore = defineStore('transaction', () => {
  // --- ÉTATS (STATES) ---
  const mainBalance = ref<number | null>(null)
  const dailyEarnings = ref<number>(0)
  const refundBalance = ref<number>(0)

  // --- ACTIONS ---

  /**
   * Met à jour uniquement le solde principal
   */
  function updateBalance(newBalance: number) {
    mainBalance.value = newBalance
  }

  /**
   * Met à jour uniquement les gains journaliers
   */
  function updateEarnings(newEarnings: number) {
    dailyEarnings.value = newEarnings
  }

  /**
   * Met à jour uniquement le solde de remboursement
   */
  function updateRefund(newRefund: number) {
    refundBalance.value = newRefund
  }

  /**
   * Met à jour les trois soldes d'un coup 
   * Pratique pour le résultat du UseCase : store.updateAllBalances(result)
   */
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