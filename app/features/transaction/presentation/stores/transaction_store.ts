import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserBalanceParam } from '@/features/transaction/application/params/user_balance_params'
import type { UserTransaction } from '@/features/transaction/domain/entities/user_transaction'
import type { ListMyTransactionUseCase } from '@/features/transaction/application/usecases/list_my_transaction_usecase'
import { DatabaseFailure } from '@/core/errors/failure'

export const useTransactionStore = defineStore('transaction', () => {
  // --- ÉTATS DES BALANCES ---
  const mainBalance = ref<number | null>(null)
  const dailyEarnings = ref<number>(0)
  const refundBalance = ref<number>(0)

  // --- ÉTATS DE L'HISTORIQUE ---
  const transactions = ref<UserTransaction[]>([])
  const isLoading = ref(false)
  const hasMore = ref(true)

  // --- ACTIONS BALANCES ---
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

  // --- ACTIONS HISTORIQUE (Clean Arch) ---
  
  /**
   * Récupère l'historique via le UseCase
   */
  async function fetchTransactions(useCase: ListMyTransactionUseCase, userId: string) {
    // Évite les appels multiples si déjà en cours ou si fin de liste
    if (isLoading.value || !hasMore.value) return
    
    isLoading.value = true
    
    const result = await useCase.execute({ userId })

    if (result instanceof DatabaseFailure) {
      // Gérer l'erreur si nécessaire (ex: toast)
      isLoading.value = false
      return
    }

    // On stocke les transactions (result est typé UserTransaction[])
    const data = result as UserTransaction[]
    
    // Si on reçoit moins de data que prévu (ex: pagination), on peut déduire qu'il n'y a plus rien
    if (data.length === 0) {
      hasMore.value = false
    } else {
      // Pour l'instant on remplace, mais pour un vrai scroll infini on ferait:
      // transactions.value.push(...data)
      transactions.value = data
      
      // On coupe le scroll infini après le premier load pour cet exemple
      hasMore.value = false 
    }
    
    isLoading.value = false
  }

  /**
   * Réinitialise l'historique (utile pour le "Pull to Refresh")
   */
  function resetHistory() {
    transactions.value = []
    hasMore.value = true
    isLoading.value = false
  }

  return {
    // Balances
    mainBalance,
    dailyEarnings,
    refundBalance,
    updateBalance,
    updateEarnings,
    updateRefund,
    updateAllBalances,
    
    // Historique
    transactions,
    isLoading,
    hasMore,
    fetchTransactions,
    resetHistory
  }
})