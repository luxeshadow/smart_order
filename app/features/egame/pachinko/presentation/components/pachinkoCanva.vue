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
import { PlayPachinkoGameUseCase } from '../../application/usecases/play_pachinko_game_usecase'
import { PlayPachinkoGameRepositoryImpl } from '../../data/repositories/play_pachinko_game_repository_impl'

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
const playPachinkoUseCase = new PlayPachinkoGameUseCase(new PlayPachinkoGameRepositoryImpl())

// États du jeu
const betInput = ref<number>(500)
const isPlaying = ref<boolean>(false)
const currentLevel = ref<number>(0)
const currentBet = ref<number>(0)
const statusMessage = ref<string>('Choisissez votre mise et lancez la partie')
const messageColor = ref<string>(AppColor.tertiary.soft)

// Matrice du plateau : gridConfig[row][col]
const gridConfig = ref<string[][]>([])
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
  const chances = currentLevel.value < 3 ? '50%' : '33%'
  if (currentLevel.value === 0) {
    statusMessage.value = `Étage 1 (x${nextMultiplier.value.toFixed(2)}) • Chance de succès : ${chances}`
    messageColor.value = AppColor.tertiary.base
  } else {
    const currentWin = Math.floor(currentBet.value * currentMultiplier.value)
    statusMessage.value = `Étage ${currentLevel.value + 1} (x${nextMultiplier.value.toFixed(2)}) • Gains actuels : ${currentWin.toLocaleString('fr-FR')} XOF`
    messageColor.value = AppColor.status.success
  }
}

const shuffle = (array: string[]): string[] => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    if (temp !== undefined && arr[j] !== undefined) {
      arr[i] = arr[j]!
      arr[j] = temp
    }
  }
  return arr
}

const startGame = async () => {
  if (isPlaying.value) return

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

  transactionStore.updateBalance(balance - bet)
  currentBet.value = bet
  currentLevel.value = 0
  isPlaying.value = true

  const generatedConfig: string[][] = []
  for (let r = 0; r < ROWS; r++) {
    const bombs = r < 3 ? 3 : 4
    const safes = COLS - bombs
    const rowItems: string[] = [
      ...Array(bombs).fill('bomb'),
      ...Array(safes).fill('safe')
    ]
    generatedConfig[r] = shuffle(rowItems)
  }
  gridConfig.value = generatedConfig

  initEmptyGrid()
  gameStore.startGame()
  updateStatusMessage()
}

const selectBrick = async (row: number, col: number) => {
  if (!isPlaying.value || row !== currentLevel.value) return

  const rowData = gridConfig.value[row]
  const targetRowRevealed = gridRevealed.value[row]
  if (!rowData || !targetRowRevealed) return

  const item = rowData[col]
  if (!item) return

  if (item === 'bomb') {
    targetRowRevealed[col] = 'boom'
    revealRow(row)

    statusMessage.value = '💥 BOOM ! Vous avez sauté sur une bombe.'
    messageColor.value = AppColor.status.error

    await endGame(false, 0)
  } else {
    targetRowRevealed[col] = 'safe'
    currentLevel.value++

    if (currentLevel.value < ROWS) {
      updateStatusMessage()
    } else {
      const maxMult = BASE_MULT + (ROWS - 1) * STEP_MULT
      const totalWin = Math.floor(currentBet.value * maxMult)

      statusMessage.value = `🎉 Victoire Maximale ! Gain : ${totalWin.toLocaleString('fr-FR')} XOF`
      messageColor.value = AppColor.status.success

      await endGame(true, totalWin)
    }
  }
}

const revealRow = (row: number) => {
  const currentRowRevealed = gridRevealed.value[row]
  const currentRowConfig = gridConfig.value[row]

  if (!currentRowRevealed || !currentRowConfig) return

  for (let c = 0; c < COLS; c++) {
    if (!currentRowRevealed[c]) {
      currentRowRevealed[c] = currentRowConfig[c] === 'bomb' ? 'revealed-bomb' : 'revealed-safe'
    }
  }
}

const cashout = async () => {
  if (!isPlaying.value || currentLevel.value === 0) return

  const winAmount = Math.floor(currentBet.value * currentMultiplier.value)

  statusMessage.value = `🎉 Encaissement réussi ! Gain : ${winAmount.toLocaleString('fr-FR')} XOF`
  messageColor.value = AppColor.status.success

  await endGame(true, winAmount)
}

const endGame = async (isWin: boolean, winAmount: number) => {
  isPlaying.value = false

  if (isWin && winAmount > 0) {
    try {
      void new Audio(AppAudio.Win_Ringtone).play()
    } catch {}
    triggerConfetti()
    showToast(`+${winAmount.toLocaleString('fr-FR')} XOF`, 'fi-rr-check', 'success')

    await playPachinkoUseCase.execute({
      userId: user.value?.id || '',
      betAmount: currentBet.value,
      winAmount,
      isWin: true
    } as any)
  } else {
    await playPachinkoUseCase.execute({
      userId: user.value?.id || '',
      betAmount: currentBet.value,
      winAmount: 0,
      isWin: false
    } as any)
  }

  gameStore.finishGame(0)
  await fetchBalance()
}

onMounted(async () => {
  await fetchBalance()
  initEmptyGrid()
})
</script>

<template>
  <div id="crash-root">
    <!-- Barre d'application fixe -->
    <nav class="app-bar">
      <button class="back-btn" aria-label="Retour" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left" />
      </button>
      <div class="app-bar-title">
        Mario Bricks
      </div>
      <div class="spacer" />
    </nav>

    <!-- En-tête : Titre & Solde -->
    <div class="top-bar">
      <span class="title-label">Déminage à Étagères</span>
      <span class="balance-badge">Solde : <strong class="amount">{{ formatBalance(mainBalance) }} XOF</strong></span>
    </div>

    <!-- Arène du jeu : Grille de Briques Réalistes -->
    <div class="arena-container">
      <div class="mult-overlay">
        <div class="mult-val" :style="{ color: isPlaying && currentLevel > 0 ? AppColor.status.success : AppColor.tertiary.base }">
          x{{ (isPlaying && currentLevel > 0 ? currentMultiplier : BASE_MULT).toFixed(2) }}
        </div>
        <div class="mult-sub">
          {{ isPlaying ? `Étage ${currentLevel} / ${ROWS}` : 'Cote de départ' }}
        </div>
      </div>

      <div class="brick-grid-arena">
        <div
          v-for="r in [...Array(ROWS).keys()].reverse()"
          :key="r"
          class="brick-row"
          :class="{
            active: isPlaying && currentLevel === r,
            completed: isPlaying && currentLevel > r,
          }"
        >
          <div
            v-for="c in COLS"
            :key="c - 1"
            class="brick-cell"
            :class="{
              safe: gridRevealed[r]?.[c - 1] === 'safe',
              boom: gridRevealed[r]?.[c - 1] === 'boom',
              revealed: gridRevealed[r]?.[c - 1]?.startsWith('revealed'),
            }"
            @click="selectBrick(r, c - 1)"
          >
            <span v-if="gridRevealed[r]?.[c - 1] === 'safe'" class="icon-pop">🍄</span>
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

    <!-- Section de Saisie & Actions -->
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
            :disabled="isPlaying"
          >
        </div>
        <div class="chip-row">
          <button class="chip" :disabled="isPlaying" @click="setQuickBet(500)">
            500
          </button>
          <button class="chip" :disabled="isPlaying" @click="setQuickBet(1000)">
            1 000
          </button>
          <button class="chip" :disabled="isPlaying" @click="setQuickBet(2500)">
            2 500
          </button>
          <button class="chip" :disabled="isPlaying" @click="setQuickBet(5000)">
            5 000
          </button>
        </div>
      </div>
    </div>

    <!-- Boutons d'Action -->
    <div class="btn-row">
      <button
        v-if="!isPlaying || currentLevel === 0"
        class="btn-main btn-start-safe"
        :disabled="isPlaying"
        @click="startGame"
      >
        JOUER
      </button>

      <button
        v-else
        class="btn-main btn-cashout-safe"
        @click="cashout"
      >
        ENCAISSER ({{ Math.floor(currentBet * currentMultiplier).toLocaleString('fr-FR') }} XOF)
      </button>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

/* Barre d'application */
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

/* Container Principal */
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

/* Arène de Jeu */
.arena-container {
  position: relative;
  background: v-bind('AppColor.surface.off');
  border-left: 2px solid v-bind('AppColor.surface.bone'); 
  border-bottom: 2px solid v-bind('AppColor.surface.bone');
  border-top: 1px solid v-bind('AppColor.surface.smoke');
  border-right: 1px solid v-bind('AppColor.surface.smoke');
  border-radius: 16px;
  margin-bottom: 16px;
  padding: 55px 12px 12px 12px;
}

/* Multiplicateur Flottant */
.mult-overlay { 
  position: absolute; 
  top: 10px; 
  left: 14px; 
  pointer-events: none; 
  z-index: 4; 
  background: v-bind('AppColor.surface.pure');
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid v-bind('AppColor.surface.bone');
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.mult-val { font-size: 1.3rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.3px; }
.mult-sub { font-size: 8px; letter-spacing: 0.5px; text-transform: uppercase; color: v-bind('AppColor.tertiary.soft'); font-weight: 700; margin-top: 1px; }

/* Grille de Briques */
.brick-grid-arena {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.brick-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  opacity: 0.4;
  pointer-events: none;
  transition: all 0.25s ease;
}

.brick-row.active {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1.01);
}

.brick-row.completed {
  opacity: 0.85;
  pointer-events: none;
}

/* 🧱 BRIQUE AVEC COULEURS D'ACCENT/PRIMARY 🧱 */
.brick-cell {
  position: relative;
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, v-bind('AppColor.primary.base') 0%, v-bind('AppColor.primary.dark') 100%);
  border-radius: 6px;
  border: 1px solid v-bind('AppColor.primary.dark');
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 
    inset 2px 2px 0px rgba(255, 255, 255, 0.4),
    inset -2px -2px 0px rgba(0, 0, 0, 0.3),
    0 3px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
}

.brick-row.active .brick-cell:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
  box-shadow: 
    inset 2px 2px 0px rgba(255, 255, 255, 0.6),
    inset -2px -2px 0px rgba(0, 0, 0, 0.4),
    0 5px 10px rgba(0, 0, 0, 0.15);
}

.brick-cell:active {
  transform: translateY(1px);
  box-shadow: 
    inset 1px 1px 0px rgba(0, 0, 0, 0.5),
    inset -1px -1px 0px rgba(255, 255, 255, 0.2);
}

/* États révélés */
.brick-cell.safe {
  background: linear-gradient(135deg, v-bind('AppColor.status.success') 0%, #388e3c 100%);
  border-color: #2e7d32;
  box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.4), inset -1px -1px 0px rgba(0, 0, 0, 0.3);
}

.brick-cell.boom {
  background: linear-gradient(135deg, v-bind('AppColor.status.error') 0%, #d32f2f 100%);
  border-color: #c62828;
  box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.4), inset -1px -1px 0px rgba(0, 0, 0, 0.3);
}

.brick-cell.revealed {
  background: v-bind('AppColor.surface.smoke');
  border-color: v-bind('AppColor.surface.bone');
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08);
}

.icon-pop {
  animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dimmed { opacity: 0.45; }

@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* Saisie & Contrôles */
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
  transition: all 0.2s ease;
}
.ctrl-input:focus { 
  background: v-bind('AppColor.surface.pure');
  border-color: v-bind('AppColor.primary.base');
  box-shadow: 0 0 0 3px rgba(255, 94, 0, 0.1);
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

/* Boutons d'Action */
.btn-row { display: flex; gap: 12px; margin-bottom: 16px; }
.btn-main { 
  flex: 1; 
  padding: 15px; 
  border: none; 
  border-radius: 14px; 
  font-size: 15px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.2s ease; 
}
.btn-main:active { transform: scale(0.99); }
.btn-main:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-start-safe {
  background: v-bind('AppColor.primary.base'); 
  color: v-bind('AppColor.surface.pure');
  box-shadow: 0 4px 12px rgba(255, 94, 0, 0.25);
}
.btn-start-safe:hover:not(:disabled) { background: v-bind('AppColor.primary.dark'); }

.btn-cashout-safe {
  background: v-bind('AppColor.status.success');
  color: v-bind('AppColor.surface.pure');
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
}

.msg { text-align: center; font-size: 12px; min-height: 18px; margin-bottom: 16px; font-weight: 600; }
</style>