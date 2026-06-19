<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from "pinia"
import { AppImage } from "@/core/constants/app_images"
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import { useTransactionStore } from "@/features/transaction/presentation/stores/transaction_store"

import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'

import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'
import { Failure } from '@/core/errors/failure'

// --- Accès aux Stores & Utilitaires ---
const router = useRouter()
const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const { showToast } = useToast()
const { triggerConfetti } = useConfetti()

const { user } = storeToRefs(authStore)
const { mainBalance } = storeToRefs(transactionStore)

// --- Initialisation des UseCases ---
const balanceRepo = new ShowMyPrincipalBalanceRepositoryImpl()
const getBalanceUseCase = new ShowMyPrincipalBalanceUseCase(balanceRepo)

// --- États Réactifs du Jeu ---
const phase = ref<'idle' | 'countdown' | 'running' | 'crashed' | 'cashedout'>('idle')
const mult = ref(1.0)
const betInput = ref(500)
const autoInput = ref<number | string>('')
const msgText = ref('')
const msgColor = ref('#64748b')
const history = ref<Array<{ m: number; won: boolean }>>([])

// --- Références Canvas & Moteur de Jeu ---
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

let crashAt = 1.0
let startTime = 0
let animId: number | null = null
let countdownInterval: any = null
let path: Array<{ t: number; m: number }> = []
let currentBet = 0
let planeX = 0
let planeY = 0
let smoothAngle = 0
let targetAngle = 0
let exploding = false
let explodeStart = 0
const EXPLODE_DUR = 900
let debris: any[] = []

const PAD = { l: 48, b: 32, r: 16, t: 16 }

// --- Calculs Dynamiques Textes & Couleurs ---
const multValText = computed(() => {
  if (phase.value === 'countdown') return '---'
  return mult.value.toFixed(2) + 'x'
})

const multSubText = computed(() => {
  if (phase.value === 'idle') return 'En attente'
  if (phase.value === 'running') return 'En vol'
  if (phase.value === 'crashed') return 'CRASH'
  if (phase.value === 'cashedout') return 'Encaissé !'
  return 'Décollage...'
})

const multColor = computed(() => {
  if (phase.value === 'countdown') return '#fbbf24'
  if (phase.value === 'running') return '#f97316'
  if (phase.value === 'crashed') return '#ef4444'
  if (phase.value === 'cashedout') return '#22c55e'
  return '#22c55e'
})

// --- Formatage de Solde Réutilisé ---
const formatBalance = (value: number | null): string => {
  if (value === null || value === undefined) return "00,000,000"
  const padded = Math.floor(value).toString().padStart(8, '0')
  return padded.replace(/(\d{2})(\d{3})(\d{3})/, "$1,$2,$3")
}

// --- Appel de synchronisation API ---
const fetchBalance = async () => {
  if (!user.value?.id) return
  const result = await getBalanceUseCase.execute({ userId: user.value.id })
  if (!(result instanceof Failure)) {
    transactionStore.updateAllBalances(result)
  }
}

// --- Raccourcis Inputs ---
const addBet = (n: number) => {
  const currentSolde = mainBalance.value || 0
  betInput.value = Math.min((Number(betInput.value) || 0) + n, currentSolde)
}
const setBet = (n: number) => { betInput.value = n }
const setAuto = (v: number) => { autoInput.value = v > 0 ? v : '' }

// --- Moteur Graphique Mathématiques ---
const W = () => (canvasRef.value ? canvasRef.value.width / window.devicePixelRatio : 0)
const H = () => (canvasRef.value ? canvasRef.value.height / window.devicePixelRatio : 0)

const genCrash = (): number => {
  const r = Math.random()
  if (r < 0.08) return 1.00
  return parseFloat((1.02 + Math.pow(Math.random(), 0.6) * 6 + (Math.random() > 0.78 ? Math.random() * 14 : 0)).toFixed(2))
}

const multToY = (m: number, maxM: number) => {
  const gH = H() - PAD.b - PAD.t
  const norm = Math.pow((m - 1) / Math.max(maxM - 1, 0.001), 0.6)
  return PAD.t + gH - norm * gH
}

const timeToX = (t: number, maxT: number) => {
  return PAD.l + (t / maxT) * (W() - PAD.l - PAD.r)
}

// --- Dessin de l'avion SVG sur Canvas ---
const drawPlane = (canvasCtx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
  canvasCtx.save()
  canvasCtx.translate(x, y)
  canvasCtx.rotate(angle)

  const flicker = 0.7 + Math.random() * 0.6
  const fl = 14 * flicker

  // Flamme
  canvasCtx.beginPath()
  canvasCtx.moveTo(-13, 0)
  canvasCtx.bezierCurveTo(-13 - fl * 0.6, -4, -13 - fl, 0, -13 - fl * 0.6, 4)
  canvasCtx.fillStyle = 'rgba(251,191,36,0.9)'
  canvasCtx.fill()

  // Fuselage
  canvasCtx.beginPath()
  canvasCtx.moveTo(18, 0)
  canvasCtx.bezierCurveTo(14, -4, -4, -5, -13, -3)
  canvasCtx.lineTo(-13, 3)
  canvasCtx.bezierCurveTo(-4, 5, 14, 4, 18, 0)
  canvasCtx.fillStyle = '#f97316'
  canvasCtx.fill()

  // Ailes
  canvasCtx.beginPath()
  canvasCtx.moveTo(4, -2)
  canvasCtx.lineTo(-3, -13)
  canvasCtx.lineTo(-9, -13)
  canvasCtx.lineTo(-7, -2)
  canvasCtx.closePath()
  canvasCtx.fillStyle = '#ea6c0a'
  canvasCtx.fill()

  canvasCtx.restore()
}

// --- Particules & Explosion Vectorielle ---
const initExplosion = (x: number, y: number) => {
  debris = []
  const COLORS = ['#f97316', '#fbbf24', '#ef4444', '#fb923c', '#fff']

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3
    const speed = 2.5 + Math.random() * 3.5
    debris.push({
      type: 'shard', x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.25,
      size: 5 + Math.random() * 6, color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1, gravity: 0.08
    })
  }
}

const drawExplosion = (canvasCtx: CanvasRenderingContext2D, progress: number) => {
  const r = progress * 55
  const a = Math.max(0, 0.7 - progress * 0.9)
  
  canvasCtx.beginPath()
  canvasCtx.arc(planeX, planeY, r, 0, Math.PI * 2)
  canvasCtx.strokeStyle = `rgba(239,68,68,${a})`
  canvasCtx.lineWidth = 2
  canvasCtx.stroke()

  debris.forEach(d => {
    d.x += d.vx
    d.y += d.vy
    d.vy += d.gravity
    d.alpha = Math.max(0, d.alpha - 0.022)

    canvasCtx.save()
    canvasCtx.globalAlpha = d.alpha
    canvasCtx.translate(d.x, d.y)
    canvasCtx.rotate(d.angle)
    canvasCtx.fillStyle = d.color
    canvasCtx.fillRect(-d.size/2, -d.size/2, d.size, d.size)
    canvasCtx.restore()
  })
}

// --- Rendu de la Scène Globale ---
const drawScene = () => {
  if (!ctx || !canvasRef.value) return
  const c = ctx 
  const w = W()
  const h = H()
  c.clearRect(0, 0, w, h)

  const elapsed = startTime ? (performance.now() - startTime) / 1000 : 0
  const maxT = Math.max(elapsed * 1.35, 4)
  const maxM = Math.max(mult.value * 1.4, 2.5)

  // Grille Horizontale Multiplicateurs
  c.strokeStyle = 'rgba(255,255,255,0.04)'
  c.lineWidth = 1;
  [1.5, 2, 3, 5, 10, 20].forEach(m => {
    if (m > maxM) return
    const y = multToY(m, maxM)
    c.beginPath(); c.moveTo(PAD.l, y); c.lineTo(w - PAD.r, y); c.stroke()
    c.fillStyle = 'rgba(255,255,255,0.22)'
    c.font = '10px sans-serif'
    c.textAlign = 'right'
    c.fillText(m + 'x', PAD.l - 5, y + 3)
  })

  // Graphique de courbe
  if (path.length > 1) {
    const crashed = phase.value === 'crashed'
    const firstPoint = path[0]
    if (!firstPoint) return

    c.beginPath()
    c.moveTo(timeToX(firstPoint.t, maxT), multToY(firstPoint.m, maxM))
    for (const p of path) c.lineTo(timeToX(p.t, maxT), multToY(p.m, maxM))
    c.strokeStyle = crashed ? '#ef4444' : '#f97316'
    c.lineWidth = 2.5
    c.stroke()

    const last = path[path.length - 1]
    const prev = path[Math.max(0, path.length - 8)]
    
    if (last && prev) {
      const lx = timeToX(last.t, maxT)
      const ly = multToY(last.m, maxM)
      targetAngle = Math.atan2(ly - multToY(prev.m, maxM), lx - timeToX(prev.t, maxT))
      smoothAngle += (targetAngle - smoothAngle) * 0.1

      if (exploding) {
        const prog = Math.min(1, (performance.now() - explodeStart) / EXPLODE_DUR)
        drawExplosion(c, prog)
      } else if (phase.value !== 'crashed') {
        planeX = lx; planeY = ly
        drawPlane(c, lx, ly, smoothAngle)
      }
    }
  }
}

// --- Gestion des Vibrations ---
const triggerVibration = () => {
  if (navigator.vibrate) navigator.vibrate(120)
}

// --- Logique Métier Jeu de Crash ---
const startGame = async () => {
  triggerVibration()
  const bet = Number(betInput.value)
  if (isNaN(bet) || bet < 500) { 
    msgText.value = 'Mise minimale de 500 requise.'; msgColor.value = '#ef4444'; return 
  }

  // TCHEK SOLDE AVANT CHAQUE LANCER
  msgText.value = 'Vérification du solde en cours...'; msgColor.value = '#94a3b8'
  await fetchBalance()

  const soldeActuel = mainBalance.value || 0
  if (bet > soldeActuel) { 
    msgText.value = 'Solde insuffisant !'; msgColor.value = '#ef4444'
    showToast("Votre solde principal est insuffisant.", "fi-rr-info", "error")
    return 
  }

  // Déduction directe de la mise dans le store Pinia
  transactionStore.mainBalance = soldeActuel - bet
  
  currentBet = bet
  crashAt = genCrash()
  phase.value = 'countdown'
  mult.value = 1.0
  path = []
  exploding = false
  smoothAngle = 0

  let cd = 3
  msgText.value = `Décollage dans ${cd}s`; msgColor.value = '#fbbf24'
  
  countdownInterval = setInterval(() => {
    cd--
    if (cd <= 0) {
      clearInterval(countdownInterval)
      launch()
    } else {
      msgText.value = `Décollage dans ${cd}s`
    }
  }, 1000)
}

const launch = () => {
  phase.value = 'running'
  startTime = performance.now()
  path = [{ t: 0, m: 1.0 }]

  const tick = (now: number) => {
    const elapsed = (now - startTime) / 1000
    mult.value = parseFloat((1 + elapsed * 0.08 + elapsed * elapsed * 0.04).toFixed(3))
    path.push({ t: elapsed, m: mult.value })

    const auto = parseFloat(String(autoInput.value))
    if (!isNaN(auto) && auto >= 1.01 && mult.value >= auto) { cashOut(); return }
    if (mult.value >= crashAt) { doCrash(elapsed); return }

    drawScene()
    animId = requestAnimationFrame(tick)
  }
  animId = requestAnimationFrame(tick)
}

const doCrash = async (elapsed: number) => {
  phase.value = 'crashed'
  path.push({ t: elapsed, m: crashAt })
  exploding = true
  explodeStart = performance.now()
  initExplosion(planeX, planeY)

  msgText.value = `Crash à ${crashAt.toFixed(2)}x — En attente du prochain tour.`
  msgColor.value = '#ef4444'
  addHistory(crashAt, false)

  await fetchBalance() // Synchronisation sécurisée post-perte

  const explodeTick = (now: number) => {
    drawScene()
    if ((now - explodeStart) / EXPLODE_DUR < 1) {
      requestAnimationFrame(explodeTick)
    } else {
      exploding = false
      drawScene()
      setTimeout(endRound, 900)
    }
  }
  requestAnimationFrame(explodeTick)
}

const cashOut = async () => {
  if (phase.value !== 'running' || animId === null) return
  cancelAnimationFrame(animId)
  triggerVibration()
  phase.value = 'cashedout'
  
  const gains = Math.floor(currentBet * mult.value)
  const nouveauSolde = (mainBalance.value || 0) + gains
  
  // Modification directe et réactive de la balance Pinia
  transactionStore.mainBalance = nouveauSolde

  triggerConfetti()
  showToast(`Succès ! +${gains.toLocaleString('fr-FR')} XOF`, "fi-rr-check", "success")
  
  msgText.value = `Encaissé à ${mult.value.toFixed(2)}x → +${gains.toLocaleString('fr-FR')} XOF`
  msgColor.value = '#22c55e'
  
  addHistory(mult.value, true)
  drawScene()
  setTimeout(endRound, 1800)
}

const endRound = () => {
  phase.value = 'idle'
  mult.value = 1.0
  path = []
  exploding = false
  drawScene()
}

const addHistory = (m: number, won: boolean) => {
  history.value.unshift({ m, won })
  if (history.value.length > 8) history.value.pop()
}

const resize = () => {
  if (!canvasRef.value) return
  const wrap = canvasRef.value.parentElement
  if (!wrap) return
  canvasRef.value.width = wrap.clientWidth * window.devicePixelRatio
  canvasRef.value.height = wrap.clientHeight * window.devicePixelRatio
  ctx = canvasRef.value.getContext('2d')
  if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  drawScene()
}

onMounted(() => {
  resize()
  fetchBalance()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (animId) cancelAnimationFrame(animId)
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <div id="crash-root">
    <div class="top-bar">
      <span class="title-label">Crash Arena</span>
      <span class="balance-badge">
        Solde Principal : <span class="amount">{{ formatBalance(mainBalance) }}</span> XOF
      </span>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
      <div class="mult-overlay">
        <div class="mult-val" :style="{ color: multColor }">{{ multValText }}</div>
        <div class="mult-sub">{{ multSubText }}</div>
      </div>
    </div>

    <div class="controls">
      <div class="ctrl-box">
        <div class="ctrl-label">Mise (min. 500)</div>
        <input 
          type="number" 
          v-model.number="betInput" 
          class="ctrl-input" 
          :disabled="phase !== 'idle'"
          min="500" 
          step="100"
        >
        <div class="chip-row">
          <button class="chip" :disabled="phase !== 'idle'" @click="addBet(500)">+500</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="addBet(1000)">+1K</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="setBet(Math.floor((mainBalance || 0) / 2 / 100) * 100)">½</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="setBet(mainBalance || 0)">Max</button>
        </div>
      </div>

      <div class="ctrl-box">
        <div class="ctrl-label">Cashout auto</div>
        <input 
          type="number" 
          v-model="autoInput" 
          class="ctrl-input" 
          :disabled="phase !== 'idle'"
          placeholder="Ex: 2.00"
        >
        <div class="chip-row">
          <button class="chip" :disabled="phase !== 'idle'" @click="setAuto(1.5)">1.5x</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="setAuto(2)">2x</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="setAuto(5)">5x</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="setAuto(0)">OFF</button>
        </div>
      </div>
    </div>

    <div class="btn-row">
      <button 
        v-if="phase !== 'running'" 
        id="btn-start" 
        class="btn-main" 
        :disabled="phase !== 'idle'" 
        @click="startGame"
      >
        Lancer la mise
      </button>
      <button 
        v-else 
        id="btn-cashout" 
        class="btn-main" 
        @click="cashOut"
      >
        Encaisser maintenant
      </button>
    </div>

    <div class="msg" :style="{ color: msgColor }">{{ msgText }}</div>

    <div class="history-row">
      <span 
        v-for="(h, idx) in history" 
        :key="idx" 
        class="hist-chip"
        :style="{
          backgroundColor: h.m < 1.5 ? '#ef444418' : h.m < 3 ? '#fbbf2418' : '#22c55e18',
          color: h.m < 1.5 ? '#ef4444' : h.m < 3 ? '#fbbf24' : '#22c55e',
          borderColor: h.m < 1.5 ? '#ef444433' : h.m < 3 ? '#fbbf2433' : '#22c55e33'
        }"
      >
        {{ h.m.toFixed(2) }}x
      </span>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

#crash-root {
  font-family: sans-serif;
  background: #080c18;
  border-radius: 16px;
  padding: 18px;
  color: #fff;
  user-select: none;
}
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.title-label { font-size: 13px; font-weight: 600; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; }
.balance-badge { font-size: 13px; color: #64748b; }
.balance-badge .amount { color: #fbbf24; font-weight: 700; font-size: 15px; }
.canvas-wrap { position: relative; width: 100%; height: 280px; background: #04070f; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 14px; }
canvas { display: block; width: 100%; height: 100%; }
.mult-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; pointer-events: none; z-index: 4; }
.mult-val { font-size: 3.4rem; font-weight: 800; letter-spacing: -2px; line-height: 1; transition: color 0.3s; }
.mult-sub { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.6; margin-top: 4px; }
.controls { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.ctrl-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px; }
.ctrl-label { font-size: 10px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
.ctrl-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 7px 10px; color: #fff; font-size: 15px; font-weight: 600; outline: none; }
.ctrl-input:focus { border-color: rgba(255,255,255,0.25); }
.chip-row { display: flex; gap: 5px; margin-top: 7px; }
.chip { flex: 1; padding: 5px 0; border-radius: 5px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #94a3b8; font-size: 11px; cursor: pointer; transition: all 0.15s; }
.chip:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: #fff; }
.chip:disabled { opacity: 0.2; cursor: not-allowed; }
.btn-row { display: flex; gap: 10px; margin-bottom: 10px; }
.btn-main { flex: 1; padding: 14px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: transform 0.1s; }
.btn-main:active { transform: scale(0.98); }
.btn-main:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
#btn-start { background: #ff5e00; color: #fff; }
#btn-cashout { background: #22c55e; color: #052e16; }
.msg { text-align: center; font-size: 13px; min-height: 18px; margin-bottom: 8px; font-weight: 500; }
.history-row { display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; min-height: 24px; }
.hist-chip { font-size: 11px; padding: 3px 8px; border-radius: 5px; font-weight: 600; border: 1px solid transparent; }
</style>