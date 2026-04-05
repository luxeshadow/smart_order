import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTransactionStore = defineStore('transaction', () => {
  const mainBalance = ref<number | null>(null)

  function updateBalance(newBalance: number) {
    mainBalance.value = newBalance
  }

  return {
    mainBalance,
    updateBalance
  }
})