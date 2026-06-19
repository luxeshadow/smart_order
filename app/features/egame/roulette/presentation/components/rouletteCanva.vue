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

const formatBalance = (value: number | null) => {
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
    msgText.value = "Mise minimale 500 XOF"
    msgColor.value = "#ef4444"
    return
  }

  await fetchBalance()

  const balance = mainBalance.value || 0
  if (bet > balance) {
    msgText.value = "Solde insuffisant"
    msgColor.value = "#ef4444"
    showToast("Solde insuffisant", "fi-rr-info", "error")
    return
  }

  // retrait local immédiat
  transactionStore.mainBalance = balance - bet

  isSpinning.value = true
  msgText.value = "La roue tourne..."
  msgColor.value = "#fbbf24"

  const total = slices.length
  const sliceAngle = 360 / total

  // angle du pointeur (correction du décalage visuel)
  const pointerOffset = sliceAngle / 2

  // choix du gagnant
  const winningIndex = Math.floor(Math.random() * total)

  // rotations aléatoires
  const extraSpins = (Math.floor(Math.random() * 4) + 5) * 360

  // 🎯 alignement EXACT sur l’aiguille
  const finalRotation =
    currentRotation.value +
    extraSpins +
    (360 - (winningIndex * sliceAngle + pointerOffset))

  currentRotation.value = finalRotation

  setTimeout(async () => {
    isSpinning.value = false

    const item = slices[winningIndex]
    if (!item) return

    if (item.type === 'skull') {
      msgText.value = `💀 Perdu ${bet.toLocaleString()} XOF`
      msgColor.value = "#ef4444"
      await fetchBalance()
      return
    }

    const gain = Math.floor(bet * item.mult)
    transactionStore.mainBalance = (mainBalance.value || 0) + gain

    triggerConfetti()
    showToast(`+${gain.toLocaleString()} XOF`, "fi-rr-check", "success")

    msgText.value = `🎉 x${item.mult} → +${gain.toLocaleString()} XOF`
    msgColor.value = "#22c55e"

  }, 4000)
}

onMounted(fetchBalance)
</script>

<template>
  <div id="roulette-root">

    <div class="top-bar">
      <span class="title-label">Lucky Wheel</span>
      <span class="balance-badge">
        Solde : <span class="amount">{{ formatBalance(mainBalance) }}</span> XOF
      </span>
    </div>

    <div class="bet-container">
      <label>Mise :</label>
      <input type="number" v-model.number="betInput" min="500" :disabled="isSpinning">
    </div>

    <section class="wrapper">
      <div class="controls" :class="{ ticking: isSpinning }">
        <button @click="spinWheel" :disabled="isSpinning">SPIN</button>
      </div>

      <div
        class="wheel"
        :style="{ transform: `rotate(${currentRotation}deg)` }"
      >
        <span
          v-for="(slice, i) in slices"
          :key="i"
          class="slice-item"
        >
          {{ slice.label }}
        </span>
      </div>
    </section>

    <div class="message" :style="{ color: msgColor }">
      {{ msgText }}
    </div>

  </div>
</template>

<style scoped>
#wheel-root {
  background: #080c18;
  color: white;
  padding: 20px;
  border-radius: 16px;
  max-width: 500px;
  margin: auto;
}

.wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  margin: auto;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: repeating-conic-gradient(
    #111 0deg 30deg,
    #1e293b 30deg 60deg
  );
  transition: transform 4s cubic-bezier(0.1, 0.8, 0.1, 1);
}

.controls {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: #fff;
  cursor: pointer;
  font-weight: bold;
}

.slice-item {
  position: absolute;
}

.message {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
</style>