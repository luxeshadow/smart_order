<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/presentation/stores/auth_store'
import { useTransactionStore } from '@/features/transaction/presentation/stores/transaction_store'
import { usePachinkoGameStore } from '../stores/pachinko_game_store'
import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'
import { Failure } from '@/core/errors/failure'
import { AppAudio } from '@/core/constants/app_audios'
import { PACHINKO_BUCKETS } from '@/core/constants/pachinko_game'
import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'
import { PlayPachinkoGameUseCase } from '../../application/usecases/play_pachinko_game_usecase'
import { PlayPachinkoGameRepositoryImpl } from '../../data/repositories/play_pachinko_game_repository_impl'

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

const betInput = ref(500)
const message = ref('Lancez la bille !')
const messageColor = ref('#64748b')
const ballVisible = ref(false)
const ballTarget = ref('50%')
const activeBucket = ref<number | null>(null)
const pins = Array.from({ length: 36 })

const ballStyle = computed(() => ({ '--target-x': ballTarget.value }))

const formatBalance = (value: number | null) => {
  if (value === null || value === undefined) return '00,000,000'
  return Math.floor(value).toLocaleString('fr-FR')
}

const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) transactionStore.updateAllBalances(result)
}

const playWinSound = () => {
  try { new Audio(AppAudio.Win_Ringtone).play() } catch { /* audio may be blocked by the browser */ }
}

const launchBall = async () => {
  if (gameStore.isPlaying) return
  const bet = Number(betInput.value)
  if (Number.isNaN(bet) || bet < 500) {
    message.value = 'Mise minimale 500 XOF'
    messageColor.value = '#ef4444'
    return
  }

  await fetchBalance()
  const balance = mainBalance.value || 0
  if (bet > balance) {
    message.value = 'Solde insuffisant'
    messageColor.value = '#ef4444'
    showToast('Solde insuffisant', 'fi-rr-info', 'error')
    return
  }

  const result = await playPachinkoUseCase.execute({ userId: user.value?.id || '', betAmount: bet })
  if (result instanceof Failure) {
    message.value = result.message
    messageColor.value = '#ef4444'
    showToast(result.message, 'fi-rr-cross', 'error')
    return
  }

  gameStore.startGame()
  transactionStore.updateBalance(balance - bet)
  activeBucket.value = null
  ballTarget.value = `${((result.winningIndex + 0.5) / PACHINKO_BUCKETS.length) * 100}%`
  ballVisible.value = true
  message.value = 'La bille est en route...'
  messageColor.value = '#ff5e00'

  window.setTimeout(async () => {
    ballVisible.value = false
    activeBucket.value = result.winningIndex
    gameStore.finishGame(result.winningIndex)

    if (!result.isWin) {
      message.value = `Perdu ${bet.toLocaleString('fr-FR')} XOF`
      messageColor.value = '#ef4444'
    } else {
      playWinSound()
      triggerConfetti()
      showToast(`+${result.gains.toLocaleString('fr-FR')} XOF`, 'fi-rr-check', 'success')
      message.value = `Gagné ${PACHINKO_BUCKETS[result.winningIndex]?.label} → +${result.gains.toLocaleString('fr-FR')} XOF`
      messageColor.value = '#22c55e'
    }
    await fetchBalance()
  }, 2400)
}

onMounted(fetchBalance)
</script>

<template>
  <div class="pachinko-root">
    <nav class="app-bar">
      <button class="back-btn" aria-label="Retour" @click="router.back()"><i class="fi fi-rr-arrow-small-left" /></button>
    </nav>

    <div class="top-bar">
      <span class="title-label">Pachinko</span>
      <span class="balance-badge">Solde Principal : <strong>{{ formatBalance(mainBalance) }}</strong> XOF</span>
    </div>

    <div class="bet-container">
      <label for="pachinko-bet">Mise (Min 500) :</label>
      <input id="pachinko-bet" v-model.number="betInput" type="number" min="500" :disabled="gameStore.isPlaying">
    </div>

    <section class="board" aria-label="Plateau de Pachinko">
      <div class="emitter" />
      <div class="pin-grid">
        <i v-for="(_, index) in pins" :key="index" class="pin" :class="`pin-${index}`" />
      </div>
      <div v-if="ballVisible" class="ball" :style="ballStyle" />
      <div class="buckets">
        <div v-for="(bucket, index) in PACHINKO_BUCKETS" :key="bucket.label + index" class="bucket" :class="{ active: activeBucket === index }" :style="{ backgroundColor: bucket.color }">
          {{ bucket.label }}
        </div>
      </div>
    </section>

    <p class="message" :style="{ color: messageColor }">{{ message }}</p>
    <button class="launch-btn" :disabled="gameStore.isPlaying" @click="launchBall">
      {{ gameStore.isPlaying ? 'BILLE EN COURS…' : 'LÂCHER LA BILLE' }}
    </button>
  </div>
</template>

<style scoped>
.pachinko-root { min-height: 100vh; max-width: 500px; margin: 0 auto; padding: 85px 20px 120px; color: #334155; background: #fff; font-family: Jura, sans-serif; user-select: none; }
.app-bar { position: fixed; z-index: 20; top: 0; right: 0; left: 0; height: 65px; padding: 10px 15px; background: #fff; border-bottom: 1px solid #f1f1f1; }
.back-btn { width: 45px; height: 45px; border: 1px solid #eee; border-radius: 14px; background: #f8f9fa; color: #334155; font-size: 20px; }
.top-bar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
.title-label { color: #64748b; font-size: 13px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; }
.balance-badge { color: #64748b; font-size: 12px; }.balance-badge strong { color: #ff5e00; font-size: 14px; }
.bet-container { margin: 20px 0; text-align: center; font-weight: 600; }.bet-container input { width: 130px; margin-left: 8px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 9px; text-align: center; font-weight: 700; }
.board { position: relative; height: 410px; overflow: hidden; border: 3px solid #ff5e00; border-radius: 24px; background: radial-gradient(circle at top, #fff7ed, #f8fafc 64%); }
.emitter { position: absolute; top: 12px; left: calc(50% - 18px); width: 36px; height: 12px; border-radius: 4px; background: #475569; }.emitter::after { content: ''; position: absolute; left: 13px; top: 9px; width: 10px; height: 10px; border-radius: 50%; background: #fbbf24; }
.pin-grid { position: absolute; top: 56px; left: 8%; right: 8%; bottom: 58px; display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(5, 1fr); align-items: center; }.pin { justify-self: center; width: 9px; height: 9px; border-radius: 50%; background: #94a3b8; box-shadow: 0 2px 2px #94a3b880; }.pin:nth-child(odd) { transform: translateX(18px); }.pin:nth-child(-n+4), .pin:nth-last-child(-n+4) { opacity: .65; }
.ball { position: absolute; top: 24px; left: calc(50% - 10px); z-index: 4; width: 20px; height: 20px; border: 2px solid #d97706; border-radius: 50%; background: #fbbf24; box-shadow: 0 3px 8px #d9770688; animation: drop-ball 2.35s cubic-bezier(.38,.03,.65,.96) forwards; }
.buckets { position: absolute; right: 8px; bottom: 10px; left: 8px; display: grid; grid-template-columns: repeat(9, 1fr); gap: 2px; }.bucket { display: grid; min-height: 44px; place-items: center; border-radius: 5px; color: #fff; font-size: 11px; font-weight: 800; box-shadow: 0 2px 4px #0002; }.bucket.active { animation: impact .55s ease-out; outline: 3px solid #fbbf24; }
.message { min-height: 28px; margin: 20px 0 14px; text-align: center; font-weight: 800; }.launch-btn { width: 100%; padding: 16px; border: 0; border-radius: 16px; background: linear-gradient(135deg, #ff7a00, #ff5e00); color: #fff; font: inherit; font-weight: 800; letter-spacing: .5px; box-shadow: 0 8px 16px #ff5e0040; }.launch-btn:disabled { background: #94a3b8; box-shadow: none; }
@keyframes drop-ball { 0% { transform: translate(0, 0); } 18% { transform: translate(-38px, 74px); } 38% { transform: translate(42px, 145px); } 58% { transform: translate(-26px, 218px); } 76% { transform: translate(30px, 282px); } 100% { left: calc(var(--target-x) - 10px); transform: translate(0, 340px); } }
@keyframes impact { 40% { transform: scale(1.23, .72); } 70% { transform: scale(.9, 1.12); } }
</style>
