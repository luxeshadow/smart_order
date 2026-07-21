<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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

declare global {
  interface Window { Matter?: any }
}

const MATTER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js'
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

const matterContainer = ref<HTMLElement | null>(null)
const betInput = ref(500)
const message = ref('Lancez la bille !')
const messageColor = ref('#64748b')
const activeBucket = ref<number | null>(null)

let engine: any
let render: any
let runner: any
let matter: any
let currentBall: any = null
let audioContext: AudioContext | null = null

const formatBalance = (value: number | null) => value === null || value === undefined ? '0' : Math.floor(value).toLocaleString('fr-FR')

const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) transactionStore.updateAllBalances(result)
}

const loadMatter = () => new Promise<void>((resolve, reject) => {
  if (window.Matter) return resolve()
  const script = document.createElement('script')
  script.src = MATTER_CDN
  script.onload = () => window.Matter ? resolve() : reject(new Error('Matter.js indisponible'))
  script.onerror = () => reject(new Error('Chargement de Matter.js impossible'))
  document.head.appendChild(script)
})

const playDingSound = () => {
  try {
    audioContext ||= new AudioContext()
    if (audioContext.state === 'suspended') void audioContext.resume()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(350 + Math.random() * 200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.08)
    gain.gain.setValueAtTime(0.1, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.08)
  } catch {}
}

const initMatter = () => {
  if (!matterContainer.value || !window.Matter) return
  matter = window.Matter
  const { Engine, Render, Runner, Bodies, Composite, Events } = matter
  const width = matterContainer.value.clientWidth
  const height = matterContainer.value.clientHeight

  engine = Engine.create({ gravity: { y: 0.9 }, positionIterations: 8, velocityIterations: 8 })
  render = Render.create({ element: matterContainer.value, engine, options: { width, height, wireframes: false, background: 'transparent' } })
  runner = Runner.create()
  Render.run(render)
  Runner.run(runner, engine)

  const pins: any[] = []
  const pinRows = 8
  const pinSpacingX = 26
  const pinSpacingY = 28
  for (let row = 0; row < pinRows; row++) {
    const pinsInRow = row + 3
    const rowY = 45 + row * pinSpacingY
    const startX = width / 2 - ((pinsInRow - 1) * pinSpacingX) / 2
    for (let column = 0; column < pinsInRow; column++) {
      pins.push(Bodies.circle(startX + column * pinSpacingX, rowY, 3.8, {
        isStatic: true, label: 'pin', restitution: 0.5, friction: 0.1, render: { fillStyle: '#94a3b8' }
      }))
    }
  }
  Composite.add(engine.world, pins)

  Events.on(engine, 'collisionStart', (event: any) => {
    event.pairs.forEach((pair: any) => {
      if (pair.bodyA.label === 'pin' || pair.bodyB.label === 'pin') playDingSound()
    })
  })
}

const finishRound = async (result: any, bet: number) => {
  if (!currentBall || !engine) return
  matter.Composite.remove(engine.world, currentBall)
  currentBall = null

  activeBucket.value = result.winningIndex
  gameStore.finishGame(result.winningIndex)

  const bucket = PACHINKO_BUCKETS[result.winningIndex]

  if (!result.isWin || result.gains === 0) {
    message.value = `💀 Perdu ${bet.toLocaleString('fr-FR')} XOF`
    messageColor.value = '#ef4444'
  } else {
    try { void new Audio(AppAudio.Win_Ringtone).play() } catch {}
    triggerConfetti()
    showToast(`+${result.gains.toLocaleString('fr-FR')} XOF`, 'fi-rr-check', 'success')
    message.value = `🎉 Gagné ! ${bucket?.label || ''} → +${result.gains.toLocaleString('fr-FR')} XOF`
    messageColor.value = '#22c55e'
  }

  await fetchBalance()
}

const launchBall = async () => {
  if (gameStore.isPlaying || !engine || !matterContainer.value) return
  
  const bet = Number(betInput.value)
  if (Number.isNaN(bet) || bet < 500) {
    message.value = '❌ Mise minimale 500 XOF'
    messageColor.value = '#ef4444'
    return
  }

  await fetchBalance()
  const balance = mainBalance.value || 0
  if (bet > balance) {
    message.value = '❌ Solde insuffisant'
    messageColor.value = '#ef4444'
    return
  }

  // 1. Appel serveur de sécurisation du gain
  const result = await playPachinkoUseCase.execute({ userId: user.value?.id || '', betAmount: bet })
  if (result instanceof Failure) {
    message.value = `❌ ${result.message}`
    messageColor.value = '#ef4444'
    return
  }

  gameStore.startGame()
  transactionStore.updateBalance(balance - bet)
  activeBucket.value = null
  message.value = 'Bille en cours...'
  messageColor.value = '#ff5e00'

  const width = matterContainer.value.clientWidth
  const { Bodies, Composite, Body } = matter

  // 2. CALCUL D'ORIENTATION NATURELLE DE DEPART
  // On calcule la position X cible théorique
  const bucketCount = PACHINKO_BUCKETS.length
  const bucketWidth = 26
  const totalGridWidth = bucketCount * bucketWidth
  const gridStartX = (width - totalGridWidth) / 2
  const targetX = gridStartX + (result.winningIndex + 0.5) * bucketWidth
  
  // Calcul du petit décalage initial (subtil et 100% physique)
  const offsetFromCenter = (targetX - (width / 2)) * 0.18

  currentBall = Bodies.circle(width / 2 + offsetFromCenter, 15, 7.5, {
    restitution: 0.5,
    friction: 0.05,
    frictionAir: 0.008,
    density: 0.015,
    label: 'ball',
    render: { fillStyle: '#fbbf24', strokeStyle: '#d97706', lineWidth: 1.5 }
  })

  // Micro-impulsion au lâcher
  Body.applyForce(currentBall, currentBall.position, { x: offsetFromCenter * 0.0001, y: 0 })
  Composite.add(engine.world, currentBall)

  // 3. Suivi de la chute sans aucune téléportation
  const interval = window.setInterval(() => {
    if (!currentBall) return window.clearInterval(interval)
    const height = matterContainer.value?.clientHeight || 0

    if (currentBall.position.y >= height - 35) {
      window.clearInterval(interval)
      void finishRound(result, bet)
    }
  }, 16)
}

onMounted(async () => {
  await fetchBalance()
  try { await loadMatter(); await nextTick(); initMatter() }
  catch { message.value = 'Erreur de chargement.'; messageColor.value = '#ef4444' }
})

onBeforeUnmount(() => {
  if (render) matter.Render.stop(render)
  if (runner) matter.Runner.stop(runner)
  if (engine) matter.Composite.clear(engine.world, false)
})
</script>

<template>
  <div class="pachinko-root">
    <nav class="app-bar">
      <button class="back-btn" aria-label="Retour" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left" />
      </button>
    </nav>
    <div class="game-card">
      <header class="header">
        <span class="title">Pachinko Game</span>
        <span class="balance-box">Solde : <strong>{{ formatBalance(mainBalance) }}</strong> XOF</span>
      </header>

      <div class="bet-area">
        <label for="pachinko-bet">Mise :</label>
        <input id="pachinko-bet" v-model.number="betInput" type="number" min="500" :disabled="gameStore.isPlaying">
      </div>

      <section class="arena">
        <div class="emitter" />
        <div ref="matterContainer" class="matter-container" />
        <div class="buckets-container">
          <div 
            v-for="(bucket, index) in PACHINKO_BUCKETS" 
            :key="`${bucket.label}-${index}`" 
            class="bucket" 
            :class="{ active: activeBucket === index }" 
            :style="{ backgroundColor: bucket.color }"
          >
            {{ bucket.label }}
          </div>
        </div>
      </section>

      <p class="output-msg" :style="{ color: messageColor }">{{ message }}</p>

      <button class="play-btn" :disabled="gameStore.isPlaying" @click="launchBall">
        {{ gameStore.isPlaying ? 'BILLE EN COURS…' : 'LÂCHER LA BILLE' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.bunny.net/css?family=jura:300,600,800');

.pachinko-root { min-height: 100vh; padding: 85px 16px 120px; background: #fff; font-family: Jura, sans-serif; }
.app-bar { position: fixed; z-index: 30; top: 0; right: 0; left: 0; height: 65px; padding: 10px 15px; background: #fff; border-bottom: 1px solid #f1f1f1; }
.back-btn { width: 45px; height: 45px; border: 1px solid #eee; border-radius: 14px; background: #f8f9fa; color: #334155; font-size: 20px; cursor: pointer; }

.game-card { width: 100%; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 28px; background: #fff; box-shadow: 0 20px 40px -18px #3341552b; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
.title { color: #64748b; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.balance-box { color: #64748b; font-size: 12px; }
.balance-box strong { color: #ff5e00; font-size: 15px; }

.bet-area { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; color: #64748b; font-size: 14px; font-weight: 600; }
.bet-area input { width: 140px; padding: 10px 16px; border: 1px solid #cbd5e1; border-radius: 12px; background: #f8fafc; color: #334155; font: inherit; font-size: 16px; font-weight: 800; text-align: center; }

.arena { position: relative; overflow: hidden; padding: 15px; border: 1px solid #e2e8f0; border-radius: 20px; background: radial-gradient(circle at center, #fff7ed 0%, #f8fafc 100%); }
.emitter { position: relative; z-index: 2; width: 32px; height: 12px; margin: 0 auto 5px; border-radius: 4px; background: #475569; }
.matter-container { width: 100%; height: 340px; position: relative; }
.matter-container :deep(canvas) { display: block; }

.buckets-container { position: absolute; z-index: 10; bottom: 15px; left: 50%; display: flex; width: 234px; transform: translateX(-50%); }
.bucket { display: flex; width: 26px; height: 38px; align-items: center; justify-content: center; border: 1px solid #ffffff80; color: #fff; box-shadow: 0 4px 8px #0003; font-size: 9px; font-weight: 800; transform-origin: center bottom; }
.bucket:first-child { border-radius: 6px 0 0 6px; }
.bucket:last-child { border-radius: 0 6px 6px 0; }
.bucket.active { animation: impact .5s ease-out; outline: 2px solid #fbbf24; }

.output-msg { min-height: 24px; margin: 20px 0; text-align: center; font-size: 16px; font-weight: 700; }
.play-btn { width: 100%; padding: 16px; border: 0; border-radius: 16px; background: linear-gradient(135deg, #ff7a00, #ff5e00); color: #fff; box-shadow: 0 10px 25px -5px #ff5e0070; font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; }
.play-btn:disabled { cursor: not-allowed; background: #94a3b8; box-shadow: none; }

@keyframes impact { 35% { transform: scale(1.3, .5); } 65% { transform: scale(.85, 1.25); } }
</style>