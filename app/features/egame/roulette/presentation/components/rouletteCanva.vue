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

const repo = new ShowMyPrincipalBalanceRepositoryImpl()
const useCase = new ShowMyPrincipalBalanceUseCase(repo)

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

const POINTER_ANGLE = 0

const formatBalance = (v: number | null) => {
  if (!v) return "00,000,000"
  const p = Math.floor(v).toString().padStart(8, '0')
  return p.replace(/(\d{2})(\d{3})(\d{3})/, "$1,$2,$3")
}

const fetchBalance = async () => {
  if (!user.value?.id) return
  const res = await useCase.execute({ userId: user.value.id })
  if (!(res instanceof Failure)) {
    transactionStore.updateAllBalances(res)
  }
}

const spinWheel = async () => {
  if (isSpinning.value) return

  const bet = Number(betInput.value)
  if (isNaN(bet) || bet < 500) return

  await fetchBalance()

  const balance = mainBalance.value || 0
  if (bet > balance) return

  transactionStore.mainBalance = balance - bet

  isSpinning.value = true
  msgText.value = "..."

  const total = slices.length
  const sliceAngle = 360 / total

  // 🎯 résultat décidé
  const winningIndex = Math.floor(Math.random() * total)

  // 🎯 centre du segment
  const target = winningIndex * sliceAngle + sliceAngle / 2

  // 🎯 rotations
  const spins = (5 + Math.floor(Math.random() * 3)) * 360

  currentRotation.value += spins + (360 - target)

  setTimeout(async () => {
    isSpinning.value = false

    const normalized = ((currentRotation.value % 360) + 360) % 360

    // lecture EXACTE sous aiguille fixe
    const angle = (normalized + POINTER_ANGLE) % 360

    const index = Math.floor(angle / sliceAngle) % total

    const item = slices[index]

    if (!item) return

    if (item.type === 'skull') {
      msgText.value = "💀 Perdu"
      await fetchBalance()
      return
    }

    const gain = Math.floor(bet * item.mult)

    transactionStore.mainBalance = (mainBalance.value || 0) + gain

    triggerConfetti()
    showToast(`+${gain}`, "fi-rr-check", "success")

    msgText.value = `${item.label} → +${gain}`
  }, 4200)
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

      <div class="controls">
        <button @click="spinWheel" :disabled="isSpinning">SPIN</button>
      </div>

      <div class="wheel" :style="{ transform: `rotate(${currentRotation}deg)` }">
        <span v-for="(s, i) in slices" :key="i" class="slice-item">
          {{ s.label }}
        </span>
      </div>

    </section>

    <div class="message" :style="{ color: msgColor }">
      {{ msgText }}
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.bunny.net/css?family=jura:300,700');

#roulette-root {
  font-family: Jura;
  background: #080c18;
  color: white;
  padding: 20px;
  border-radius: 16px;
  max-width: 500px;
  margin: auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.bet-container {
  text-align: center;
  margin-bottom: 20px;
}

.wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  margin: auto;
}

.controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  z-index: 10;
}

.controls button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: white;
  font-weight: bold;
  cursor: pointer;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid white;
  transition: transform 4s cubic-bezier(.2,.8,.2,1);
  background: repeating-conic-gradient(
    #1e293b 0deg 30deg,
    #111827 30deg 60deg
  );
}

.slice-item {
  position: absolute;
  font-size: 14px;
}

.message {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
</style>