<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
// @ts-ignore
import FortuneWheel from 'vue-fortune-wheel'
import 'vue-fortune-wheel/dist/style.css'

import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import { useTransactionStore } from "@/features/transaction/presentation/stores/transaction_store"
import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'

import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'
import { Failure } from '@/core/errors/failure'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const { user } = storeToRefs(authStore)
const { mainBalance } = storeToRefs(transactionStore)

const { showToast } = useToast()
const { triggerConfetti } = useConfetti()

const balanceRepo = new ShowMyPrincipalBalanceRepositoryImpl()
const getBalanceUseCase = new ShowMyPrincipalBalanceUseCase(balanceRepo)

const betInput = ref(500)
const isSpinning = ref(false)
const msgText = ref('')
const msgColor = ref('#94a3b8')

const wheelItems = [
  { id: 0, name: '💀', color: '#334155', value: 0, type: 'skull' as const },
  { id: 1, name: '1.25x', color: '#1e40af', value: 1.25, type: 'win' as const },
  { id: 2, name: '💀', color: '#334155', value: 0, type: 'skull' as const },
  { id: 3, name: '1.5x', color: '#1e40af', value: 1.5, type: 'win' as const },
  { id: 4, name: '💀', color: '#334155', value: 0, type: 'skull' as const },
  { id: 5, name: '2x', color: '#1e40af', value: 2, type: 'win' as const },
  { id: 6, name: '💀', color: '#334155', value: 0, type: 'skull' as const },
  { id: 7, name: '1.25x', color: '#1e40af', value: 1.25, type: 'win' as const },
  { id: 8, name: '💀', color: '#334155', value: 0, type: 'skull' as const },
  { id: 9, name: '1.75x', color: '#1e40af', value: 1.75, type: 'win' as const },
  { id: 10, name: '💀', color: '#334155', value: 0, type: 'skull' as const },
  { id: 11, name: '10x', color: '#b91c1c', value: 10, type: 'win' as const },
] as const

const formatBalance = (value: number | null): string => {
  if (!value) return "00,000,000"
  const padded = Math.floor(value).toString().padStart(8, '0')
  return padded.replace(/(\d{2})(\d{3})(\d{3})/, "$1,$2,$3")
}

const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) {
    transactionStore.updateAllBalances(result)
  }
}

const spinWheel = async () => {
  if (isSpinning.value) return

  const bet = Number(betInput.value)
  if (isNaN(bet) || bet < 500) {
    msgText.value = "❌ Mise minimale 500 XOF"
    msgColor.value = "#ef4444"
    return
  }

  await fetchBalance()
  const balance = mainBalance.value || 0
  if (bet > balance) {
    msgText.value = "❌ Solde insuffisant"
    msgColor.value = "#ef4444"
    showToast("Solde insuffisant", "fi-rr-info", "error")
    return
  }

  transactionStore.mainBalance = balance - bet
  isSpinning.value = true
  msgText.value = "La roue tourne..."
  msgColor.value = "#fbbf24"
}

const onSpinComplete = (result: any) => {
  isSpinning.value = false

  const item = wheelItems[result?.index]

  // ✅ Fix TypeScript
  if (!item) {
    msgText.value = "Erreur lors du tirage"
    msgColor.value = "#ef4444"
    return
  }

  if (item.type === 'skull') {
    msgText.value = `💀 Perdu ${betInput.value} XOF`
    msgColor.value = "#ef4444"
    fetchBalance()
    return
  }

  const gains = Math.floor(betInput.value * item.value)
  transactionStore.mainBalance = (mainBalance.value || 0) + gains

  triggerConfetti()
  showToast(`+${gains}`, "fi-rr-check", "success")

  msgText.value = `🎉 ${item.name} → +${gains}`
  msgColor.value = "#22c55e"
}

onMounted(fetchBalance)
</script>

<template>
  <div id="roulette-root">
    <div class="top-bar">
      <span class="title-label">Lucky Wheel</span>
      <span class="balance-badge">
        Solde Principal : <span class="amount">{{ formatBalance(mainBalance) }}</span> XOF
      </span>
    </div>

    <div class="bet-container">
      <label for="bet-input">Mise (Min 500) :</label>
      <input 
        type="number" 
        id="bet-input" 
        v-model.number="betInput" 
        min="500" 
        :disabled="isSpinning"
      >
    </div>

    <div class="wheel-container">
      <FortuneWheel
        :items="wheelItems"
        duration="4500"
        @spin-complete="onSpinComplete"
      />
    </div>

    <div id="message" class="message" :style="{ color: msgColor }">
      {{ msgText }}
    </div>

    <button 
      class="spin-button"
      @click="spinWheel" 
      :disabled="isSpinning"
    >
      {{ isSpinning ? 'En cours...' : '🚀 TOURNER LA ROUE' }}
    </button>
  </div>
</template>

<style scoped>
#roulette-root {
  font-family: "Jura", sans-serif;
  background-color: #080c18;
  color: #f5f5f5;
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  margin: auto;
  user-select: none;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding-bottom: 10px;
}

.title-label { font-size: 13px; font-weight: 600; color: #94a3b8; }
.balance-badge .amount { color: #fbbf24; font-weight: 700; }

.bet-container {
  text-align: center;
  margin-bottom: 25px;
}

.bet-container input {
  padding: 10px;
  width: 140px;
  text-align: center;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.2);
  color: white;
  border-radius: 8px;
}

.wheel-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.message {
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 25px 0;
  min-height: 50px;
}

.spin-button {
  width: 100%;
  padding: 16px;
  font-size: 1.2rem;
  font-weight: bold;
  background: #ff5e00;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 10px;
}

.spin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>