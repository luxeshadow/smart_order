<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import { useTransactionStore } from "@/features/transaction/presentation/stores/transaction_store"
import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'

import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'

// Importations de la méthode sécurisée
import { PlayRouletteGameUseCase } from '~/features/egame/roulette/application/usecases/play_roulette_game_usecase'
import { PlayRouletteGameRepositoryImpl } from '~/features/egame/roulette/data/repositories/play_roulette_game_repository_impl'
import { Failure } from '@/core/errors/failure'

// IMPORTATIONS DEPUIS LES CONSTANTES
import { ROULETTE_SLICES } from '@/core/constants/roulette_game'
import { AppAudio } from '@/core/constants/app_audios'

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const { user } = storeToRefs(authStore)
const { mainBalance } = storeToRefs(transactionStore)

const { showToast } = useToast()
const { triggerConfetti } = useConfetti()

const balanceRepo = new ShowMyPrincipalBalanceRepositoryImpl()
const getBalanceUseCase = new ShowMyPrincipalBalanceUseCase(balanceRepo)

// Instanciation de la roulette
const rouletteRepo = new PlayRouletteGameRepositoryImpl()
const playRouletteUseCase = new PlayRouletteGameUseCase(rouletteRepo)

// Utilisation directe de la constante partagée
const slices = ROULETTE_SLICES

const betInput = ref(500)
const isSpinning = ref(false)
const msgText = ref('')
const msgColor = ref('#64748b')
const currentRotation = ref(0)

const debugInfo = ref({ winning: null as number | null, detected: null as number | null })

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

  // 1. Tirage côté serveur
  const result = await playRouletteUseCase.execute({
    userId: user.value?.id || '',
    betAmount: bet
  })

  if (result instanceof Failure) {
    msgText.value = `❌ ${result.message}`
    msgColor.value = "#ef4444"
    showToast(result.message, "fi-rr-cross", "error")
    return
  }

  // Déduction visuelle immédiate du solde
  transactionStore.mainBalance = balance - bet

  isSpinning.value = true
  msgText.value = "La roue tourne..."
  msgColor.value = "#ff5e00"

  const total = slices.length
  const sliceAngle = 360 / total

  const serverWinningIndex = result.winningIndex
  const extraTurns = (Math.floor(Math.random() * 5) + 6) * 360
  
  // Angle requis pour amener la case correspondante sous le pointeur
  const targetRotation = (total - serverWinningIndex) * sliceAngle

  // On arrondit par rapport à l'angle accumulé précédent
  const currentBaseRotation = Math.ceil(currentRotation.value / 360) * 360
  currentRotation.value = currentBaseRotation + extraTurns + targetRotation

  setTimeout(async () => {
    isSpinning.value = false

    const normalizedAngle = currentRotation.value % 360
    const detectedIndex = Math.round((360 - normalizedAngle) / sliceAngle) % total

    debugInfo.value = { winning: serverWinningIndex, detected: detectedIndex }

    // 3. Traitement des résultats
    if (!result.isWin) {
      msgText.value = `💀 Perdu ${bet} XOF`
      msgColor.value = "#ef4444"
      await fetchBalance() 
      return
    }

    // Lecture sécurisée du son de victoire avant l'explosion de confettis
    try {
      const audio = new Audio(AppAudio.Win_Ringtone)
      audio.play()
    } catch (e) {
      console.warn("Audio play blocked or failed:", e)
    }

    triggerConfetti()
    showToast(`+${result.gains}`, "fi-rr-check", "success")

    const item = slices[serverWinningIndex]
    msgText.value = `🎉 ${item?.label || 'Gagné'} → +${result.gains} XOF`
    msgColor.value = "#22c55e"
    
    await fetchBalance()
  }, 4300)
}

onMounted(fetchBalance)
</script>

<template>
  <div id="roulette-root">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
    
      <div class="spacer"></div>
    </nav>

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
        :style="{ transform: `rotate(calc(-90deg + ${currentRotation}deg))` }"
      >
        <div 
          v-for="(slice, index) in slices" 
          :key="index"
          :class="['slice-item', slice.type]"
          :style="{ '--offset-dist': `${(index / 12) * 100}%` }"
        >
          <span class="slice-text">{{ slice.label }}</span>
        </div>
      </div>
    </section>

    <div id="message" class="message" :style="{ color: msgColor }">
      {{ msgText }}
    </div>

    <div class="debug-info">
      Winning Index: {{ debugInfo.winning }} | Detected: {{ debugInfo.detected }}
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.bunny.net/css?family=jura:300,700');

.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  padding: 0 15px;
  z-index: 2000;
  border-bottom: 1px solid rgba(255,255,255,.3);
}

.back-btn {
  width: 45px;
  height: 45px;
  background: white;
  border: 1px solid #eee;
  border-radius: 14px;
  transition: .2s;
}

.back-btn:hover {
  transform: scale(1.05);
}

.spacer {
  width: 40px;
}

#roulette-root {
  position: relative;
  overflow: hidden;

  font-family: "Jura", sans-serif;

  background:
    radial-gradient(circle at top,
      #fffdf8 0%,
      #fff8ef 100%);

  color: #334155;
  border-radius: 24px;
  padding: 24px;
  margin-top: 85px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid #ececec;
  padding-bottom: 12px;
}

.title-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.balance-badge {
  font-size: 13px;
  color: #64748b;
}

.balance-badge .amount {
  color: #ff6f00;
  font-weight: 900;
  font-size: 16px;
}

.bet-container {
  text-align: center;
  margin-bottom: 30px;
}

.bet-container label {
  font-weight: 700;
}

.bet-container input {
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid #ffe0b2;
  background: white;
  width: 130px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-left: 12px;
  outline: none;
  transition: .25s;
}

.bet-container input:focus {
  border-color: #ff9800;
  box-shadow: 0 0 15px rgba(255,152,0,.25);
}

/* ---------------------- */
/* ROUE */
/* ---------------------- */

.wrapper {
  --items: 12;
  --slice-angle: calc(360deg / var(--items));
  --wheel-radius: min(40vw, 190px);
  --wheel-size: calc(var(--wheel-radius) * 2);
  --wheel-padding: 18%;
  --item-radius: calc(var(--wheel-radius) - var(--wheel-padding));

  position: relative;
  width: var(--wheel-size);
  aspect-ratio: 1;
  margin: auto;
}

/* ---------------------- */
/* BOUTON CENTRAL */
/* ---------------------- */

.controls {
  position: absolute;
  z-index: 100;
  inset: 0;
  margin: auto;

  width: 74px;
  height: 74px;
  border-radius: 50%;

  background:
    radial-gradient(circle at 30% 30%,
      #ffffff,
      #ffe082 40%,
      #ffb300 75%,
      #ff6f00 100%
    );

  border: 5px solid white;

  box-shadow:
    0 0 20px rgba(255,215,0,.8),
    0 0 40px rgba(255,152,0,.5),
    inset 0 4px 12px rgba(255,255,255,.7);

  animation: pulse 2s infinite;
}

.controls button {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.controls button svg {
  width: 32px;
  height: 32px;
}

.controls button:hover:not(:disabled) {
  transform: scale(1.1);
}

.controls button:disabled {
  opacity: .6;
}

/* ---------------------- */
/* AIGUILLE */
/* ---------------------- */

.controls::before {
  content: '';
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);

  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 32px solid #ff1744;

  filter:
    drop-shadow(0 0 6px rgba(255,23,68,.8))
    drop-shadow(0 0 15px rgba(255,23,68,.5));
}

.controls.ticking::before {
  animation: marker-tick .08s infinite alternate;
}

/* ---------------------- */
/* DISQUE */
/* ---------------------- */

.wheel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;

  border: 10px solid #ffd54f;

  background:
    radial-gradient(circle at center,
      rgba(255,255,255,.9) 0%,
      rgba(255,255,255,.2) 20%,
      transparent 21%
    ),

    repeating-conic-gradient(
      from calc(0deg - (var(--slice-angle) / 2)),
      #fff8e1 0deg var(--slice-angle),
      #ff9800 var(--slice-angle) calc(var(--slice-angle) * 2)
    );

  box-shadow:
    0 0 15px rgba(255,215,0,.8),
    0 0 35px rgba(255,140,0,.7),
    0 0 60px rgba(255,94,0,.35),
    inset 0 0 25px rgba(255,255,255,.35);

  transition: transform 4s cubic-bezier(.1,.85,.15,1);
  will-change: transform;
}

/* LEDs */

.wheel::before {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 50%;

  background:
    repeating-conic-gradient(
      #ffd700 0deg 2deg,
      transparent 2deg 8deg
    );

  animation: led-spin 8s linear infinite;
  z-index: -1;
}

.wheel::after {
  content: "";
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,.5);
}

/* ---------------------- */
/* CASES */
/* ---------------------- */

.slice-item {
  position: absolute;

  offset-path: circle(var(--item-radius) at 50% 50%);
  offset-rotate: auto;
  offset-distance: var(--offset-dist);

  width: 42px;
  height: 42px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: white;
  font-size: 18px;
  font-weight: 900;

  text-shadow:
    0 2px 4px rgba(0,0,0,.4),
    0 0 10px rgba(255,255,255,.4);
}

.slice-text {
  transform: rotate(90deg);
  white-space: nowrap;
}

.slice-item.skull {
  font-size: 24px;
}

.message {
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 35px;
  min-height: 32px;
}

.debug-info {
  text-align: center;
  margin-top: 20px;
  color: #94a3b8;
  font-size: .9rem;
}

/* ---------------------- */
/* ANIMATIONS */
/* ---------------------- */

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes marker-tick {
  from {
    transform: translateX(-50%) rotate(-10deg);
  }

  to {
    transform: translateX(-50%) rotate(10deg);
  }
}

@keyframes led-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>