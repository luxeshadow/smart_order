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

    <div class="roulette-container">
      <div class="led-lights">
        <div v-for="i in 8" :key="i" class="led-dot" :style="{ transform: `rotate(${(i-1) * 45}deg) translateY(-143px)` }"></div>
      </div>

      <section class="wrapper" data-items="12">
        <div class="marker-pin" :class="{ ticking: isSpinning }"></div>

        <div class="controls">
          <button id="spin-btn" @click="spinWheel" :disabled="isSpinning">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
    </div>

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
  z-index: 2000;
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

.spacer { width: 40px; }

#roulette-root {
  font-family: "Jura", sans-serif;
  background-color: #ffffff;
  color: #334155;
  border-radius: 24px;
  padding: 24px;
  margin-top: 85px; 
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  user-select: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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
.balance-badge .amount { color: #ff5e00; font-weight: 700; font-size: 15px; }

.bet-container {
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.1rem;
  color: #1e293b;
}

.bet-container input {
  padding: 8px 12px;
  border-radius: 12px;
  border: 2px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  width: 130px;
  font-size: 1.1rem;
  text-align: center;
  font-weight: bold;
  margin-left: 10px;
  outline: none;
  transition: border-color 0.2s;
}
.bet-container input:focus {
  border-color: #ff5e00;
}

/* --- AMÉLIORATION DESIGN DU CONTENEUR DE ROUE --- */
.roulette-container {
  position: relative;
  width: 320px;
  height: 320px;
  margin: 40px auto;
  background: #e65100; /* Fond orange foncé comme la bordure de l'image */
  border-radius: 50%;
  padding: 15px; /* Épaisseur du contour violet/orange */
  box-shadow: 0 12px 28px rgba(230, 81, 0, 0.3), inset 0 -4px 10px rgba(0,0,0,0.3);
}

/* Système de lampes LED tout autour */
.led-lights {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}
.led-dot {
  position: absolute;
  top: 50%; left: 50%;
  width: 8px; height: 8px;
  background: #ffffff;
  border-radius: 50%;
  margin-top: -4px; margin-left: -4px;
  box-shadow: 0 0 8px #ffffff, 0 0 15px #ffffff;
  animation: flash 1s ease-in-out infinite alternate;
}

@keyframes flash {
  0% { opacity: 0.5; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 12px #ffb74d; }
}

.wrapper {
  --items: 12;
  --slice-angle: calc(360deg / var(--items));
  width: 100%;
  height: 100%;
  position: relative;
}

/* Le marqueur physique au-dessus (Flèche blanche/orange) */
.marker-pin {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 22px solid #ffffff; /* Marqueur blanc pur */
  filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.3));
  z-index: 110;
}
.marker-pin.ticking {
  animation: marker-tick 250ms ease-in-out infinite alternate;
}

/* Bouton central repensé façon cartoon 3D doré */
.controls {
  position: absolute;
  z-index: 100;
  inset: 0;
  margin: auto;
  width: 65px;
  height: 65px;
  background: linear-gradient(135deg, #ffe082 0%, #ffb300 100%);
  border: 4px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 6px 12px rgba(0,0,0,0.25), inset 0 -4px 0px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls button {
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  height: 100%;
  color: #e65100;
  display: grid;
  place-items: center;
}
.controls button:hover:not(:disabled) { transform: scale(1.05); }
.controls button:disabled { opacity: 0.8; cursor: not-allowed; }

/* La Roue avec des parts nettes bicolores orange/blanc */
.wheel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid #ffffff; /* Séparateur intérieur blanc */
  box-shadow: inset 0 0 20px rgba(0,0,0,0.15);
  
  /* Gradation de couleurs alternée en conservant l'orange et le blanc cassé */
  background: repeating-conic-gradient(
    from calc(0deg - (var(--slice-angle) / 2)),
    #ffffff 0deg var(--slice-angle),
    #fff3e0 var(--slice-angle) calc(var(--slice-angle) * 2)
  );
  transition: transform 5s cubic-bezier(0.1, 0.8, 0.1, 1); /* Animation plus fluide */
  will-change: transform;
  z-index: 1;
}

.slice-item {
  position: absolute;
  font-size: 1.1rem;
  font-weight: 800;
  color: #e65100; /* Texte orange vif */
  /* Ajustement de la distance du texte vers l'extérieur pour copier le rendu de la photo */
  offset-path: circle(105px at 50% 50%); 
  offset-rotate: auto;
  offset-distance: var(--offset-dist);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Orientation radiale : les textes pointent naturellement vers le centre */
.slice-text {
  display: inline-block;
  transform: rotate(90deg); 
  white-space: nowrap;
  text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

.slice-item.skull { font-size: 1.3rem; }

.message {
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
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
  from { transform: translateX(-50%) rotate(-12deg); }
  to   { transform: translateX(-50%) rotate(12deg); }
}
</style>