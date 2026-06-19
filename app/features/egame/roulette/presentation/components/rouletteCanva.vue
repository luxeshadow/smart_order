<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
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

interface Slice {
  type: 'skull' | 'win'
  label: string
  mult: number
}

const slices: Slice[] = [
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.25x', mult: 1.25 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.5x', mult: 1.5 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '2x', mult: 2 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.25x', mult: 1.25 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '1.75x', mult: 1.75 },
  { type: 'skull', label: '💀', mult: 0 },
  { type: 'win', label: '10x', mult: 10 }
]

const betInput = ref(500)
const isSpinning = ref(false)
const msgText = ref('')
const msgColor = ref('#94a3b8')
const currentRotation = ref(0)

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

  const total = slices.length
  const sliceAngle = 360 / total

  // 🎯 Choix du gagnant
  const winningIndex = Math.floor(Math.random() * total)
  const winningSlice = slices[winningIndex]

  // Rotation de la roue
  const extraTurns = (Math.floor(Math.random() * 5) + 6) * 360
  const targetRotation = winningIndex * sliceAngle
  currentRotation.value += extraTurns + targetRotation

  // === RÉSULTAT FIABLE ===
  setTimeout(async () => {
    isSpinning.value = false

    // ✅ Fix TypeScript
    if (!winningSlice) {
      msgText.value = "Erreur lors du tirage"
      msgColor.value = "#ef4444"
      return
    }

    if (winningSlice.type === 'skull') {
      msgText.value = `💀 Perdu ${betInput.value} XOF`
      msgColor.value = "#ef4444"
      await fetchBalance()
      return
    }

    const gains = Math.floor(betInput.value * winningSlice.mult)
    transactionStore.mainBalance = (mainBalance.value || 0) + gains

    triggerConfetti()
    showToast(`+${gains}`, "fi-rr-check", "success")

    msgText.value = `🎉 ${winningSlice.label} → +${gains}`
    msgColor.value = "#22c55e"
  }, 4300)
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

    <section class="wrapper" data-items="12">
      <div class="controls" :class="{ ticking: isSpinning }">
        <button id="spin-btn" @click="spinWheel" :disabled="isSpinning">
          SPIN
        </button>
      </div>
      
      <div 
        id="wheel" 
        class="wheel" 
        :style="{ transform: `rotate(${currentRotation}deg)` }"
      >
        <span 
          v-for="(slice, index) in slices" 
          :key="index"
          :class="['slice-item', slice.type]"
          :style="{ '--offset-dist': `${((index + 1) / 12) * 100}%` }"
        >
          {{ slice.label }}
        </span>
      </div>
    </section>

    <div id="message" class="message" :style="{ color: msgColor }">
      {{ msgText }}
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.bunny.net/css?family=jura:300,700');

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

.title-label { font-size: 13px; font-weight: 600; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; }
.balance-badge { font-size: 13px; color: #64748b; }
.balance-badge .amount { color: #fbbf24; font-weight: 700; font-size: 15px; }

.bet-container {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.1rem;
}

.bet-container input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.03);
  color: #fff;
  width: 130px;
  font-size: 1.1rem;
  text-align: center;
  font-weight: bold;
  margin-left: 10px;
  outline: none;
}

.wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 30px auto;
}

.controls {
  position: absolute;
  z-index: 10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: #04070f;
  border: 4px solid #fff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 0 20px rgba(0,0,0,0.6);
}

.controls button {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wheel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 6px solid #fff;
  box-shadow: 0 0 25px rgba(0,0,0,0.7);
  background: repeating-conic-gradient(
    from 15deg,
    #111827 0deg 30deg,
    #1e293b 30deg 60deg
  );
  transition: transform 4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.slice-item {
  position: absolute;
  font-size: 1.2rem;
  font-weight: 700;
  offset-path: circle(115px at 50% 50%);
  offset-rotate: auto;
  offset-distance: var(--offset-dist);
}

.slice-item.skull { font-size: 1.5rem; }

.message {
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 20px;
  min-height: 40px;
}
</style>