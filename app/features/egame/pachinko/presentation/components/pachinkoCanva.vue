<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { AppColor } from '@/core/constants/app_colors'
import { AppAudio } from '@/core/constants/app_audios'
import { Failure } from '@/core/errors/failure'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useTransactionStore } from '@/features/transaction/presentation/stores/transaction_store'
import { usePachinkoGameStore } from '../stores/pachinko_game_store'
import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'
import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'
import { PlayPachinkoGameRepositoryImpl } from '../../data/repositories/play_pachinko_game_repository_impl'
const MarioBox = '/assets/videos/gif/mario_box.gif'
const Mario_Ringtone = AppAudio?.Mario_Ringtone || '/assets/audios/ringtone/mario.mpeg'
const bomb_Ringtone = AppAudio?.bomb_Ringtone || '/assets/audios/ringtone/bomb.mpeg'

const ROWS = 8
const COLS = 6
const BASE_MULT = 1.25
const STEP_MULT = 0.25

const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const gameStore = usePachinkoGameStore()

const { user } = storeToRefs(authStore)
const { mainBalance } = storeToRefs(transactionStore)

const { showToast } = useToast()
const { triggerConfetti } = useConfetti()

const getBalanceUseCase = new ShowMyPrincipalBalanceUseCase(new ShowMyPrincipalBalanceRepositoryImpl())
const pachinkoRepository = new PlayPachinkoGameRepositoryImpl()

// États du jeu
const betInput = ref<number>(500)
const isPlaying = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const currentLevel = ref<number>(0)
const currentBet = ref<number>(0)
const activeSessionId = ref<string | null>(null)
const statusMessage = ref<string>('Choisissez votre mise et lancez la partie')
const messageColor = ref<string>(AppColor.tertiary.soft)

// Matrice révélée uniquement côté client
const gridRevealed = ref<string[][]>([])

const formatBalance = (val: number | null) => {
  if (val === null || val === undefined) return '0'
  return Math.floor(val).toLocaleString('fr-FR')
}

const currentMultiplier = computed(() => {
  if (currentLevel.value === 0) return BASE_MULT
  return BASE_MULT + (currentLevel.value - 1) * STEP_MULT
})

const nextMultiplier = computed(() => {
  return BASE_MULT + currentLevel.value * STEP_MULT
})

const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) {
    transactionStore.updateAllBalances(result)
  }
}

const initEmptyGrid = () => {
  gridRevealed.value = Array.from({ length: ROWS }, () => Array(COLS).fill(''))
}

const setQuickBet = (amount: number) => {
  if (isPlaying.value) return
  betInput.value = amount
}

const updateStatusMessage = () => {
  if (currentLevel.value === 0) {
    statusMessage.value = `Étage 1 (x${nextMultiplier.value.toFixed(2)})`
    messageColor.value = AppColor.tertiary.base
  } else {
    const currentWin = Math.floor(currentBet.value * currentMultiplier.value)
    statusMessage.value = `Étage ${currentLevel.value + 1} (x${nextMultiplier.value.toFixed(2)}) • Gains actuels : ${currentWin.toLocaleString('fr-FR')} XOF`
    messageColor.value = AppColor.status.success
  }
}

// 1. Démarrage sécurisé via Supabase RPC + Audio Mario
const startGame = async () => {
  if (isPlaying.value || isLoading.value) return

  const bet = Number(betInput.value)
  if (isNaN(bet) || bet < 100) {
    statusMessage.value = '❌ Mise minimale 100 XOF'
    messageColor.value = AppColor.status.error
    return
  }

  await fetchBalance()
  const balance = mainBalance.value || 0
  if (bet > balance) {
    statusMessage.value = '❌ Solde insuffisant'
    messageColor.value = AppColor.status.error
    return
  }

  isLoading.value = true
  statusMessage.value = 'Initialisation de la partie...'

  const result = await pachinkoRepository.startGame(user.value?.id || '', bet)

  if (result instanceof Failure) {
    statusMessage.value = `❌ ${result.message}`
    messageColor.value = AppColor.status.error
    isLoading.value = false
    return
  }

  // 🔊 Audio au chargement/démarrage du jeu
  try {
    void new Audio(Mario_Ringtone).play()
  } catch (err) {
    console.warn('Erreur de lecture audio Mario:', err)
  }

  // Mise à jour locale de la session et du solde
  activeSessionId.value = result.session_id
  transactionStore.updateBalance(result.new_balance)
  currentBet.value = bet
  currentLevel.value = 0
  isPlaying.value = true
  isLoading.value = false

  initEmptyGrid()
  gameStore.startGame()
  updateStatusMessage()
}

// 2. Sélection d'une brique + Audio Bombe en cas de défaite
const selectBrick = async (row: number, col: number) => {
  if (!isPlaying.value || isLoading.value || row !== currentLevel.value || !activeSessionId.value) return

  isLoading.value = true
  const result = await pachinkoRepository.revealBrick(activeSessionId.value, user.value?.id || '', col)

  if (result instanceof Failure) {
    statusMessage.value = `❌ ${result.message}`
    messageColor.value = AppColor.status.error
    isLoading.value = false
    return
  }

  const targetRowRevealed = gridRevealed.value[row]
  if (!targetRowRevealed) {
    isLoading.value = false
    return
  }

  if (result.result === 'BOOM') {
    // 🔊 Audio lors d'un impact avec une bombe
    try {
      void new Audio(bomb_Ringtone).play()
    } catch (err) {
      console.warn('Erreur de lecture audio bombe:', err)
    }

    targetRowRevealed[col] = 'boom'
    if (result.full_row) {
      revealRowWithData(row, result.full_row)
    }

    statusMessage.value = '💥 BOOM ! Une bombe était cachée.'
    messageColor.value = AppColor.status.error

    await finishLocalGame(false, 0)
  } else {
    targetRowRevealed[col] = 'safe'
    currentLevel.value = result.current_level ?? (currentLevel.value + 1)

    if (result.status === 'WON') {
      const winAmount = result.win_amount || Math.floor(currentBet.value * currentMultiplier.value)
      statusMessage.value = `🎉 Victoire Maximale ! Gain : ${winAmount.toLocaleString('fr-FR')} XOF`
      messageColor.value = AppColor.status.success

      await handleWinEffects(winAmount)
      await finishLocalGame(true, winAmount)
    } else {
      updateStatusMessage()
    }
  }

  isLoading.value = false
}

const revealRowWithData = (row: number, serverRowData: string[]) => {
  const currentRowRevealed = gridRevealed.value[row]
  if (!currentRowRevealed) return

  for (let c = 0; c < COLS; c++) {
    if (!currentRowRevealed[c]) {
      currentRowRevealed[c] = serverRowData[c] === 'bomb' ? 'revealed-bomb' : 'revealed-safe'
    }
  }
}

// 3. Encaissement volontaire géré par le serveur
const cashout = async () => {
  if (!isPlaying.value || isLoading.value || currentLevel.value === 0 || !activeSessionId.value) return

  isLoading.value = true
  const result = await pachinkoRepository.cashout(activeSessionId.value, user.value?.id || '')

  if (result instanceof Failure) {
    statusMessage.value = `❌ ${result.message}`
    messageColor.value = AppColor.status.error
    isLoading.value = false
    return
  }

  statusMessage.value = `🎉 Encaissement réussi ! Gain : ${result.win_amount.toLocaleString('fr-FR')} XOF`
  messageColor.value = AppColor.status.success

  await handleWinEffects(result.win_amount)
  await finishLocalGame(true, result.win_amount)
  isLoading.value = false
}

const handleWinEffects = async (winAmount: number) => {
  try { void new Audio(AppAudio.Win_Ringtone).play() } catch {}
  triggerConfetti()
  showToast(`+${winAmount.toLocaleString('fr-FR')} XOF`, 'fi-rr-check', 'success')
}

const finishLocalGame = async (isWin: boolean, winAmount: number) => {
  isPlaying.value = false
  activeSessionId.value = null
  gameStore.finishGame(winAmount)
  await fetchBalance()
}

onMounted(async () => {
  await fetchBalance()
  initEmptyGrid()
})
</script>

<template>
  <div id="crash-root">
    <!-- App Bar -->
    <nav class="app-bar">
      <button class="back-btn" aria-label="Retour" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left" />
      </button>
      <div class="app-bar-title">
        Mario Bricks
      </div>
      <div class="spacer" />
    </nav>

    <!-- Header Balance -->
    <div class="top-bar">
      <span class="title-label">Déminage à Étagères (4 Bombes)</span>
      <span class="balance-badge">Solde : <strong class="amount">{{ formatBalance(mainBalance) }} XOF</strong></span>
    </div>

    <!-- Container GIF Mario Box -->
    <div class="mario-box-container">
      <img :src="MarioBox" alt="Mario Box GIF" class="mario-box-gif" />
    </div>

    <!-- Arena Container -->
    <div class="arena-container">
      <div class="mult-overlay">
        <div class="mult-val" :style="{ color: isPlaying && currentLevel > 0 ? AppColor.status.success : AppColor.tertiary.base }">
          x{{ (isPlaying && currentLevel > 0 ? currentMultiplier : BASE_MULT).toFixed(2) }}
        </div>
        <div class="mult-sub">
          {{ isPlaying ? `Étage ${currentLevel} / ${ROWS}` : 'Cote de départ' }}
        </div>
      </div>

      <div class="mario-wall">
        <div
          v-for="r in [...Array(ROWS).keys()].reverse()"
          :key="r"
          class="brick-row"
          :class="{
            active: isPlaying && currentLevel === r && !isLoading,
            completed: isPlaying && currentLevel > r,
          }"
        >
          <div
            v-for="c in COLS"
            :key="c - 1"
            class="mario-brick"
            :class="{
              safe: gridRevealed[r]?.[c - 1] === 'safe',
              boom: gridRevealed[r]?.[c - 1] === 'boom',
              revealed: gridRevealed[r]?.[c - 1]?.startsWith('revealed'),
            }"
            @click="selectBrick(r, c - 1)"
          >
            <span v-if="!gridRevealed[r]?.[c - 1]" class="question-mark">?</span>
            <span v-else-if="gridRevealed[r]?.[c - 1] === 'safe'" class="icon-pop">🍄</span>
            <span v-else-if="gridRevealed[r]?.[c - 1] === 'boom'" class="icon-pop">💣</span>
            <span v-else-if="gridRevealed[r]?.[c - 1] === 'revealed-bomb'" class="dimmed">💣</span>
            <span v-else-if="gridRevealed[r]?.[c - 1] === 'revealed-safe'" class="dimmed">🍄</span>
          </div>
        </div>
      </div>
    </div>

    <div class="msg" :style="{ color: messageColor }">
      {{ statusMessage }}
    </div>

    <!-- Controls & Inputs -->
    <div class="controls-section">
      <div class="ctrl-box">
        <span class="ctrl-label">Montant de la mise (XOF)</span>
        <div class="input-wrapper">
          <input
            v-model.number="betInput"
            type="number"
            min="100"
            step="100"
            class="ctrl-input"
            :disabled="isPlaying || isLoading"
          >
        </div>
        <div class="chip-row">
          <button class="chip" :disabled="isPlaying || isLoading" @click="setQuickBet(500)">
            500
          </button>
          <button class="chip" :disabled="isPlaying || isLoading" @click="setQuickBet(1000)">
            1 000
          </button>
          <button class="chip" :disabled="isPlaying || isLoading" @click="setQuickBet(2500)">
            2 500
          </button>
          <button class="chip" :disabled="isPlaying || isLoading" @click="setQuickBet(5000)">
            5 000
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="btn-row">
      <button
        v-if="!isPlaying || currentLevel === 0"
        class="btn-main btn-start-safe"
        :disabled="isPlaying || isLoading"
        @click="startGame"
      >
        {{ isLoading ? 'CHARGEMENT...' : 'JOUER' }}
      </button>

      <button
        v-else
        class="btn-main btn-cashout-safe"
        :disabled="isLoading"
        @click="cashout"
      >
        ENCAISSER ({{ Math.floor(currentBet * currentMultiplier).toLocaleString('fr-FR') }} XOF)
      </button>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 65px;
  background: v-bind('AppColor.surface.pure');
  display: flex;
  align-items: center;
  padding: 0 15px;
  z-index: 2000;
  border-bottom: 1px solid v-bind('AppColor.surface.smoke');
}
.back-btn {
  width: 45px;
  height: 45px;
  background-color: v-bind('AppColor.surface.off');
  border: 1px solid v-bind('AppColor.surface.bone');
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  color: v-bind('AppColor.tertiary.base');
}
.spacer { width: 45px; }

#crash-root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: v-bind('AppColor.surface.pure');
  padding: 85px 16px 20px 16px;
  color: v-bind('AppColor.tertiary.base');
  user-select: none;
  min-height: 100vh;
}

.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.title-label { font-size: 11px; font-weight: 700; color: v-bind('AppColor.tertiary.soft'); letter-spacing: 0.5px; text-transform: uppercase; }
.balance-badge { font-size: 13px; color: v-bind('AppColor.tertiary.soft'); }
.balance-badge .amount { color: v-bind('AppColor.tertiary.pure'); font-weight: 700; }

.mario-box-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
}

.mario-box-gif {
  max-width: 100px;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.arena-container {
  position: relative;
  background: v-bind('AppColor.surface.off');
  border-left: 2px solid v-bind('AppColor.surface.bone'); 
  border-bottom: 2px solid v-bind('AppColor.surface.bone');
  border-top: 1px solid v-bind('AppColor.surface.smoke');
  border-right: 1px solid v-bind('AppColor.surface.smoke');
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 55px 10px 10px 10px;
}

.mult-overlay { 
  position: absolute; 
  top: 10px; 
  left: 10px; 
  pointer-events: none; 
  z-index: 10; 
  background: v-bind('AppColor.surface.pure');
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid v-bind('AppColor.surface.bone');
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.mult-val { font-size: 1.2rem; font-weight: 800; line-height: 1.1; }
.mult-sub { font-size: 8px; letter-spacing: 0.5px; text-transform: uppercase; color: v-bind('AppColor.tertiary.soft'); font-weight: 700; }

.mario-wall {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: v-bind('AppColor.surface.smoke');
  padding: 6px;
  border-radius: 8px;
  border: 1px solid v-bind('AppColor.surface.bone');
  width: 100%;
}

.brick-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  opacity: 0.35;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.brick-row.active {
  opacity: 1;
  pointer-events: auto;
}

.brick-row.completed {
  opacity: 0.75;
  pointer-events: none;
}

.mario-brick {
  position: relative;
  width: 100%;
  height: 42px;
  background-color: #b84418;
  border: 1px solid #702808;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 800;
  box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.3), inset -1px -1px 0px rgba(0, 0, 0, 0.4);
  transition: transform 0.1s ease, filter 0.15s ease;
}

.question-mark {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.2rem;
  font-weight: 900;
  color: #fcdc00;
  text-shadow: 1px 1px 0px #000;
}

.brick-row.active .mario-brick:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.mario-brick:active {
  transform: translateY(1px);
}

.mario-brick.safe {
  background-color: v-bind('AppColor.status.success');
  border-color: #2e7d32;
  box-shadow: none;
}

.mario-brick.boom {
  background-color: v-bind('AppColor.status.error');
  border-color: #c62828;
  box-shadow: none;
}

.mario-brick.revealed {
  background-color: v-bind('AppColor.surface.bone');
  border-color: v-bind('AppColor.surface.smoke');
  box-shadow: none;
}

.icon-pop {
  position: relative;
  z-index: 2;
  animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dimmed { 
  position: relative;
  z-index: 2;
  opacity: 0.4; 
}

@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.controls-section { margin-bottom: 20px; }
.ctrl-box { display: flex; flex-direction: column; }
.ctrl-label { font-size: 11px; color: v-bind('AppColor.tertiary.soft'); font-weight: 600; margin-bottom: 8px; }

.input-wrapper { position: relative; }
.ctrl-input { 
  width: 100%; 
  background: v-bind('AppColor.surface.off');
  border: 1px solid v-bind('AppColor.surface.bone'); 
  border-radius: 12px; 
  padding: 12px 16px; 
  color: v-bind('AppColor.tertiary.base'); 
  font-size: 16px; 
  font-weight: 700; 
  outline: none; 
  transition: border-color 0.2s ease;
}
.ctrl-input:focus { 
  background: v-bind('AppColor.surface.pure');
  border-color: v-bind('AppColor.primary.base');
}

.chip-row { display: flex; gap: 6px; margin-top: 8px; }
.chip { 
  flex: 1; 
  padding: 8px 0; 
  border-radius: 10px; 
  border: 1px solid v-bind('AppColor.surface.bone');
  background: v-bind('AppColor.surface.pure'); 
  color: v-bind('AppColor.tertiary.soft'); 
  font-size: 12px; 
  font-weight: 600;
  cursor: pointer; 
  transition: all 0.15s ease; 
}
.chip:hover:not(:disabled) { 
  border-color: v-bind('AppColor.primary.accent'); 
  background: v-bind('AppColor.primary.light'); 
  color: v-bind('AppColor.primary.dark'); 
}
.chip:disabled { opacity: 0.3; cursor: not-allowed; }

.btn-row { display: flex; gap: 12px; margin-bottom: 16px; }
.btn-main { 
  flex: 1; 
  padding: 15px; 
  border: none; 
  border-radius: 14px; 
  font-size: 15px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: opacity 0.2s ease; 
}
.btn-main:active { transform: scale(0.99); }
.btn-main:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-start-safe {
  background: v-bind('AppColor.primary.base'); 
  color: v-bind('AppColor.surface.pure');
  box-shadow: 0 4px 12px rgba(255, 94, 0, 0.25);
}

.btn-cashout-safe {
  background: v-bind('AppColor.status.success');
  color: v-bind('AppColor.surface.pure');
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
}

.msg { text-align: center; font-size: 12px; min-height: 18px; margin-bottom: 16px; font-weight: 600; }
</style>