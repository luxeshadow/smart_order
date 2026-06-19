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

// --- Stores & Hooks ---
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

// --- STATE ---
const betInput = ref<number>(500)
const isSpinning = ref(false)
const msgText = ref('')
const msgColor = ref('#94a3b8')
const currentRotation = ref(0)

// --- BALANCE FORMAT ---
const formatBalance = (value: number | null): string => {
  if (!value) return "00,000,000"
  const padded = Math.floor(value).toString().padStart(8, '0')
  return padded.replace(/(\d{2})(\d{3})(\d{3})/, "$1,$2,$3")
}

// --- API ---
const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) {
    transactionStore.updateAllBalances(result)
  }
}

// --- SPIN LOGIC FIXED ---
const spinWheel = async () => {
  if (isSpinning.value) return

  const bet = Number(betInput.value)

  if (isNaN(bet) || bet < 500) {
    msgText.value = "❌ Mise minimale de 500 XOF requise."
    msgColor.value = "#ef4444"
    return
  }

  msgText.value = "Vérification du solde..."
  msgColor.value = "#94a3b8"

  await fetchBalance()

  const balance = mainBalance.value || 0

  if (bet > balance) {
    msgText.value = "❌ Solde insuffisant !"
    msgColor.value = "#ef4444"
    showToast("Solde insuffisant", "fi-rr-info", "error")
    return
  }

  // retrait immédiat
  transactionStore.mainBalance = balance - bet

  isSpinning.value = true
  msgText.value = "La roue tourne..."
  msgColor.value = "#fbbf24"

  const total = slices.length
  const sliceAngle = 360 / total

  // correction aiguille
  const pointerOffset = sliceAngle / 2

  const winningIndex = Math.floor(Math.random() * total)

  const extraTurns = (Math.floor(Math.random() * 4) + 5) * 360

  // 🎯 ROTATION CORRIGÉE
  const targetRotation =
    currentRotation.value +
    extraTurns +
    (360 - (winningIndex * sliceAngle + pointerOffset))

  currentRotation.value = targetRotation

  setTimeout(async () => {
    isSpinning.value = false

    // 🔥 recalcul réel sous aiguille (SOURCE DE VÉRITÉ)
    const normalized = currentRotation.value % 360

    const indexUnderPointer = Math.floor(
      (360 - normalized + pointerOffset) / sliceAngle
    ) % total

    const item = slices[indexUnderPointer]

    if (!item) return

    if (item.type === 'skull') {
      msgText.value = `💀 Perdu ${bet.toLocaleString('fr-FR')} XOF`
      msgColor.value = "#ef4444"
      await fetchBalance()
      return
    }

    const gains = Math.floor(bet * item.mult)

    transactionStore.mainBalance = (mainBalance.value || 0) + gains

    triggerConfetti()
    showToast(`+${gains.toLocaleString()} XOF`, "fi-rr-check", "success")

    msgText.value = `🎉 ${item.label} → +${gains.toLocaleString()} XOF`
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
        <button id="spin-btn" @click="spinWheel" :disabled="isSpinning" aria-label="Tourner la roue">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M14 12a2 2 0 1 0 -4 0a2 2 0 0 0 4 0" />
            <path d="M12 21c-3.314 0 -6 -2.462 -6 -5.5s2.686 -5.5 6 -5.5" />
            <path d="M21 12c0 3.314 -2.462 6 -5.5 6s-5.5 -2.686 -5.5 -6" />
            <path d="M12 14c3.314 0 6 -2.462 6 -5.5s-2.686 -5.5 -6 -5.5" />
            <path d="M14 12c0 -3.314 -2.462 -6 -5.5 -6s-5.5 2.686 -5.5 6" />
          </svg>
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
.bet-container input:focus {
  border-color: #ff5e00;
}

.wrapper {
  --items: 12;
  --slice-angle: calc(360deg / var(--items));
  --start-angle: calc(var(--slice-angle) / 2);
  --wheel-radius: min(38vw, 180px);
  --wheel-size: calc(var(--wheel-radius) * 2);
  --wheel-padding: 15%;
  --item-radius: calc(var(--wheel-radius) - var(--wheel-padding));

  --marker-bg-color: #ef4444;
  --button-text-color: white;

  position: relative;
  width: var(--wheel-size);
  aspect-ratio: 1;
  margin: auto;
}

.controls {
  position: absolute;
  z-index: 10;
  inset: 0;
  margin: auto;
  width: 50px;
  height: 50px;
  background: #04070f;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(0,0,0,0.5);
}

.controls button {
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  height: 100%;
  color: var(--button-text-color);
  display: grid;
  place-items: center;
  transition: transform 150ms ease-in-out;
}
.controls button:hover:not(:disabled) {
  transform: scale(1.1);
}
.controls button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Flèche Repère du haut */
.controls::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 18px solid var(--marker-bg-color);
  z-index: 11;
}

.controls.ticking::before {
  animation: marker-tick 120ms ease-in-out infinite;
}

.wheel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
  user-select: none;
  background: repeating-conic-gradient(
    from var(--start-angle),
    #111827 0deg var(--slice-angle),
    #1e293b var(--slice-angle) calc(var(--slice-angle) * 2)
  );
  transition: transform 4s cubic-bezier(0.1, 0.8, 0.1, 1);
}

/* Positionnement des éléments textuels sur la courbure */
.slice-item {
  position: absolute;
  font-size: 1.1rem;
  font-weight: 700;
  offset-path: circle(var(--item-radius) at 50% 50%);
  offset-rotate: auto;
  offset-distance: var(--offset-dist);
}

.slice-item.skull {
  font-size: 1.3rem;
}

.message {
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 25px;
  min-height: 30px;
}

@keyframes marker-tick {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(-50%) rotate(-15deg); }
}
</style>