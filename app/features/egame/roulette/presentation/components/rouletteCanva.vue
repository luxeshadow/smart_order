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

// IMPORTATION DEPUIS TON DOSSIER CONSTANTES (Ajuste le chemin si nécessaire)
import { ROULETTE_SLICES } from '@/core/constants/roulette_game'

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

// Utilisation directe de la constante partagée (Zéro duplication, le template reste inchangé)
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

  // 1. On effectue le tirage de confiance côté Repository (BDD)
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

  // Déduction visuelle immédiate de la mise pendant la rotation
  transactionStore.mainBalance = balance - bet

  isSpinning.value = true
  msgText.value = "La roue tourne..."
  msgColor.value = "#ff5e00"

  const total = slices.length
  const sliceAngle = 360 / total

  // 2. On force la roue à cibler l'index EXACT déterminé par le Repository
  const serverWinningIndex = result.winningIndex
  const extraTurns = (Math.floor(Math.random() * 5) + 6) * 360
  const targetRotation = serverWinningIndex * sliceAngle

  currentRotation.value += extraTurns + targetRotation

  setTimeout(async () => {
    isSpinning.value = false

    const normalized = ((currentRotation.value % 360) + 360) % 360
    const visualOffset = 295 

    const angleUnderPointer = (360 - normalized + visualOffset) % 360
    const detectedIndex = Math.floor(angleUnderPointer / sliceAngle) % total

    debugInfo.value = { winning: serverWinningIndex, detected: detectedIndex }

    // 3. Traitement des résultats renvoyés par le serveur
    if (!result.isWin) {
      msgText.value = `💀 Perdu ${bet} XOF`
      msgColor.value = "#ef4444"
      await fetchBalance() // Resynchronise le solde réel
      return
    }

    triggerConfetti()
    showToast(`+${result.gains}`, "fi-rr-check", "success")

    const item = slices[serverWinningIndex]
    msgText.value = `🎉 ${item?.label || 'Gagné'} → +${result.gains} XOF`
    msgColor.value = "#22c55e"
    
    await fetchBalance() // Met à jour le store Pinia avec le solde incluant le gain
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
      <span class="app-bar-title">E-games</span>
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

    <div class="debug-info">
      Winning Index: {{ debugInfo.winning }} | Detected: {{ debugInfo.detected }}
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.bunny.net/css?family=jura:300,700');

.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 65px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 15px;
  z-index: 1000;
  border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px;
  height: 45px;
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 4px;
  transition: all 0.2s ease;
}

.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  color: #2d3436;
}

.spacer { width: 40px; }

/* Nouveau fond clair & lumineux */
#roulette-root {
  font-family: "Jura", sans-serif;
  background-color: #ffffff;
  color: #334155;
  border-radius: 16px;
  padding: 24px;
  margin-top: 65px; /* Évite la superposition avec l'app-bar */
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.title-label { font-size: 13px; font-weight: 600; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }
.balance-badge { font-size: 13px; color: #64748b; }
.balance-badge .amount { color: #ff5e00; font-weight: 700; font-size: 15px; } /* base */

.bet-container {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.1rem;
  color: #1e293b;
}

.bet-container input {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  width: 130px;
  font-size: 1.1rem;
  text-align: center;
  font-weight: bold;
  margin-left: 10px;
  outline: none;
}
.bet-container input:focus {
  border-color: #ff5e00; /* base */
}

.wrapper {
  --items: 12;
  --slice-angle: calc(360deg / var(--items));
  --start-angle: calc(var(--slice-angle) / 2);
  --wheel-radius: min(38vw, 180px);
  --wheel-size: calc(var(--wheel-radius) * 2);
  --wheel-padding: 15%;
  --item-radius: calc(var(--wheel-radius) - var(--wheel-padding));

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
  background: #ffffff;
  border: 3px solid #ff5e00; /* base */
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.controls button {
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  height: 100%;
  color: #ff5e00; /* base */
  display: grid;
  place-items: center;
}
.controls button:hover:not(:disabled) { transform: scale(1.1); }
.controls button:disabled { opacity: 0.6; cursor: not-allowed; }

.controls::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 18px solid #ff5e00; /* base */
  z-index: 11;
}

.controls.ticking::before {
  animation: marker-tick 400ms ease-in-out infinite alternate;
}

/* Changement de look de la roue vers le orange/crème */
.wheel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid #ff5e00; /* base */
  box-shadow: 0 10px 25px rgba(255, 94, 0, 0.15);
  background: repeating-conic-gradient(
    from var(--start-angle),
    #fff3e0 0deg var(--slice-angle),       /* light */
    #ffb74d var(--slice-angle) calc(var(--slice-angle)*2) /* accent */
  );
  transition: transform 4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.slice-item {
  position: absolute;
  font-size: 1.1rem;
  font-weight: 700;
  color: #e65100; /* dark pour maximiser le contraste sur fond clair */
  offset-path: circle(var(--item-radius) at 50% 50%);
  offset-rotate: auto;
  offset-distance: var(--offset-dist);
}

.slice-item.skull { font-size: 1.35rem; }

.message {
  text-align: center;
  font-weight: bold;
  font-size: 1.15rem;
  margin-top: 25px;
  min-height: 32px;
}

.debug-info {
  text-align: center; 
  margin-top: 15px; 
  color: #94a3b8; 
  font-size: 0.95rem;
}

@keyframes marker-tick {
  from { transform: translateX(-50%) rotate(-10deg); }
  to   { transform: translateX(-50%) rotate(10deg); }
}
</style>