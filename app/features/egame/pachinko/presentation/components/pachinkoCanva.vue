<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useTransactionStore } from '@/features/transaction/presentation/stores/transaction_store'
import { usePachinkoGameStore } from '../stores/pachinko_game_store'
import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'
import { Failure } from '@/core/errors/failure'
import { AppAudio } from '@/core/constants/app_audios'
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
const statusMessage = ref<string>('Place ta mise pour démarrer !')
const messageColor = ref<string>('#fcdc00')

// Matrice du plateau : gridConfig[row][col]
const gridConfig = ref<string[][]>([])
const gridRevealed = ref<string[][]>([])

const formatBalance = (val: number | null) => {
  if (val === null || val === undefined) return '0'
  return Math.floor(val).toLocaleString('fr-FR')
}

const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) {
    transactionStore.updateAllBalances(result)
  }
}

// Initialisation d'une grille vide sécurisée
const initEmptyGrid = () => {
  gridRevealed.value = Array.from({ length: ROWS }, () => Array(COLS).fill(''))
}

const updateStatusMessage = () => {
  const currentMult = (BASE_MULT + currentLevel.value * STEP_MULT).toFixed(2)
  const chances = currentLevel.value < 3 ? '3/6 (50%)' : '2/6 (33%)'
  const modeName = currentLevel.value < 3 ? 'Normal' : 'Hard ⚠️'

  if (currentLevel.value === 0) {
    statusMessage.value = `Étage 1 (x${currentMult}) | Mode ${modeName} [Chances: ${chances}]`
  } else {
    const gainActuel = (currentBet.value * (BASE_MULT + (currentLevel.value - 1) * STEP_MULT)).toFixed(2)
    statusMessage.value = `Étage ${currentLevel.value + 1} (x${currentMult}) | Gains: ${gainActuel} $ [Chances: ${chances}]`
  }
  messageColor.value = '#fcdc00'
}

// Mélange des éléments d'une ligne
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

// Démarrage de la partie
const startGame = async () => {
  if (isPlaying.value) return

  const bet = Number(betInput.value)
  if (isNaN(bet) || bet < 10) {
    statusMessage.value = '❌ Mise minimale 10 XOF'
    messageColor.value = '#ef4444'
    return
  }

  await fetchBalance()
  const balance = mainBalance.value || 0
  if (bet > balance) {
    statusMessage.value = '❌ Solde insuffisant'
    messageColor.value = '#ef4444'
    return
  }

  // Enregistrement du jeu et déduction de la mise
  transactionStore.updateBalance(balance - bet)
  currentBet.value = bet
  currentLevel.value = 0
  isPlaying.value = true

  // Génération de la configuration secrète de la grille
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

// Clic sur une brique
const selectBrick = async (row: number, col: number) => {
  if (!isPlaying.value || row !== currentLevel.value) return

  const rowData = gridConfig.value[row]
  if (!rowData) return

  const item = rowData[col]
  if (!item) return

  const targetRowRevealed = gridRevealed.value[row]
  if (!targetRowRevealed) return

  if (item === 'bomb') {
    // 💣 PERDU !
    targetRowRevealed[col] = 'boom'
    revealRow(row)

    statusMessage.value = 'BOOM ! Perdu !'
    messageColor.value = '#ef4444'

    await endGame(false, 0)
  } else {
    // 🍄 Brique Sécurisée !
    targetRowRevealed[col] = 'safe'
    currentLevel.value++

    if (currentLevel.value < ROWS) {
      updateStatusMessage()
    } else {
      // Victoire Maximale
      const maxMult = BASE_MULT + (ROWS - 1) * STEP_MULT
      const totalWin = Math.floor(currentBet.value * maxMult)

      statusMessage.value = `🎉 Victoire Maximale ! Gain : ${totalWin.toLocaleString('fr-FR')} XOF`
      messageColor.value = '#22c55e'

      await endGame(true, totalWin)
    }
  }
}

// Révéler les autres cases d'un étage après explosion
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

// Encaissement manuel
const cashout = async () => {
  if (!isPlaying.value || currentLevel.value === 0) return

  const finalMult = BASE_MULT + (currentLevel.value - 1) * STEP_MULT
  const winAmount = Math.floor(currentBet.value * finalMult)

  statusMessage.value = `🎉 Encaissement réussi ! Gain : ${winAmount.toLocaleString('fr-FR')} XOF`
  messageColor.value = '#22c55e'

  await endGame(true, winAmount)
}

// Fin de la partie et synchronisation Supabase
const endGame = async (isWin: boolean, winAmount: number) => {
  isPlaying.value = false

  // Validation finale dans Supabase via le Repository
  await playPachinkoUseCase.execute({
    userId: user.value?.id || '',
    betAmount: currentBet.value, // Ex: 500 XOF
    winAmount: isWin ? winAmount : 0, // Gain calculé par le jeu Mario
    isWin
  } as any)

  if (isWin && winAmount > 0) {
    try { void new Audio(AppAudio.Win_Ringtone).play() } catch {}
    triggerConfetti()
    showToast(`+${winAmount.toLocaleString('fr-FR')} XOF`, 'fi-rr-check', 'success')
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
  <div class="mario-root">
    <!-- Navbar -->
    <nav class="app-bar">
      <button class="back-btn" aria-label="Retour" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left" />
      </button>
    </nav>

    <!-- Game Container -->
    <div class="game-card">
      <div class="stats-panel">
        <div class="stat-box">
          Solde
          <span>{{ formatBalance(mainBalance) }} XOF</span>
        </div>
        <div class="stat-box">
          Gain Potentiel
          <span>
            {{
              isPlaying && currentLevel > 0
                ? Math.floor(currentBet * (BASE_MULT + (currentLevel - 1) * STEP_MULT)).toLocaleString('fr-FR')
                : '0'
            }}
            XOF
          </span>
        </div>
      </div>

      <div class="controls">
        <input
          id="bet-input"
          v-model.number="betInput"
          type="number"
          min="10"
          step="10"
          inputmode="decimal"
          :disabled="isPlaying"
        >
        <button class="btn-start" :disabled="isPlaying" @click="startGame">
          Miser
        </button>
      </div>

      <button class="btn-cashout" :disabled="!isPlaying || currentLevel === 0" @click="cashout">
        Encaisser
      </button>

      <div class="status-msg" :style="{ color: messageColor }">
        {{ statusMessage }}
      </div>

      <!-- Grille de Jeu -->
      <div class="grid">
        <div
          v-for="r in [...Array(ROWS).keys()].reverse()"
          :key="r"
          class="row"
          :class="{
            active: isPlaying && currentLevel === r,
            completed: isPlaying && currentLevel > r,
          }"
        >
          <div
            v-for="c in COLS"
            :key="c - 1"
            class="brick"
            :class="{
              safe: gridRevealed[r]?.[c - 1] === 'safe',
              boom: gridRevealed[r]?.[c - 1] === 'boom',
              revealed: gridRevealed[r]?.[c - 1]?.startsWith('revealed'),
            }"
            @click="selectBrick(r, c - 1)"
          >
            <span v-if="gridRevealed[r]?.[c - 1] === 'safe'">🍄</span>
            <span v-else-if="gridRevealed[r]?.[c - 1] === 'boom'">💣</span>
            <span v-else-if="gridRevealed[r]?.[c - 1] === 'revealed-bomb'" class="dimmed">💣</span>
            <span v-else-if="gridRevealed[r]?.[c - 1] === 'revealed-safe'" class="dimmed">🍄</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.bunny.net/css?family=jura:300,600,800');

:root {
  --mario-red: #e52521;
  --brick-brown: #b84418;
  --brick-border: #702808;
  --gold-yellow: #fcdc00;
  --sky-blue: #5c94fc;
}

.mario-root {
  min-height: 100vh;
  padding: 85px 16px 120px;
  background-color: #5c94fc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Jura", sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.app-bar {
  position: fixed;
  z-index: 30;
  top: 0;
  right: 0;
  left: 0;
  height: 65px;
  padding: 10px 15px;
  background: #fff;
  border-bottom: 1px solid #f1f1f1;
}

.back-btn {
  width: 45px;
  height: 45px;
  border: 1px solid #eee;
  border-radius: 14px;
  background: #f8f9fa;
  color: #334155;
  font-size: 20px;
  cursor: pointer;
}

.game-card {
  background-color: #000;
  border: 3px solid #fff;
  border-radius: 16px;
  padding: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  color: #fff;
}

.stats-panel {
  display: flex;
  justify-content: space-between;
  background: #222;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #444;
  font-weight: bold;
  font-size: 0.9rem;
}

.stat-box span {
  display: block;
  color: #fcdc00;
  font-size: 1.1rem;
  margin-top: 2px;
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

input[type="number"] {
  width: 60%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 6px;
  border: none;
  outline: none;
  font-weight: bold;
  background: #fff;
  color: #000;
}

button {
  padding: 10px;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
  touch-action: manipulation;
}

.btn-start {
  background-color: #28a745;
  color: white;
  width: 40%;
}

.btn-cashout {
  background-color: #fcdc00;
  color: #000;
  width: 100%;
  font-size: 1rem;
  margin-bottom: 12px;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: #111;
  padding: 8px;
  border-radius: 8px;
  width: 100%;
}

.row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  opacity: 0.35;
  pointer-events: none;
  width: 100%;
}

.row.active {
  opacity: 1;
  pointer-events: auto;
}

.row.completed {
  opacity: 0.85;
  pointer-events: none;
}

.brick {
  width: 100%;
  height: 48px;
  background-color: #b84418;
  border: 2px solid #702808;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.3), inset -1px -1px 0px rgba(0, 0, 0, 0.4);
}

.brick.safe {
  background-color: #28a745;
  border-color: #1e7e34;
  box-shadow: none;
}

.brick.boom {
  background-color: #e52521;
  border-color: #8b0000;
  box-shadow: none;
}

.brick.revealed {
  background-color: #333;
  border-color: #222;
  box-shadow: none;
}

.dimmed {
  opacity: 0.5;
}

.status-msg {
  text-align: center;
  margin-bottom: 10px;
  min-height: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}
</style>