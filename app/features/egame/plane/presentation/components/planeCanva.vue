<template>
  <nav class="app-bar">
    <button class="back-btn" @click="router.back()">
      <i class="fi fi-rr-arrow-small-left"></i>
    </button>
    <span class="app-bar-title">E-games</span>
    <div class="spacer"></div>
  </nav>

  <div id="crash-root">
    <div class="top-bar">
      <span class="title-label">Crash Arena</span>
      <span class="balance-badge">
        Solde : <span class="amount">{{ formatBalance(mainBalance) }}</span> XOF
      </span>
    </div>

    <div class="arena-container">
      <div class="canvas-wrap">
        <canvas ref="canvasRef"></canvas>
        
        <div class="mult-overlay">
          <div class="mult-val" :style="{ color: multColor }">{{ multValText }}</div>
          <div class="mult-sub">{{ multSubText }}</div>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <div class="ctrl-box">
        <div class="ctrl-label">Montant à miser (XOF)</div>
        <div class="input-wrapper">
          <input 
            type="number" 
            v-model.number="betInput" 
            class="ctrl-input" 
            :disabled="phase !== 'idle'"
            min="500" 
            step="100"
          >
        </div>
        <div class="chip-row">
          <button class="chip" :disabled="phase !== 'idle'" @click="addBet(500)">+500</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="addBet(1000)">+1K</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="setBet(Math.floor((mainBalance || 0) / 2 / 100) * 100)">½</button>
          <button class="chip" :disabled="phase !== 'idle'" @click="setBet(mainBalance || 0)">Max</button>
        </div>
      </div>
    </div>

    <div class="btn-row">
      <button 
        v-if="phase !== 'running'" 
        id="btn-start" 
        class="btn-main btn-start-safe" 
        :disabled="phase !== 'idle'" 
        @click="startGame"
      >
        Placer le pari
      </button>
      <button 
        v-else 
        id="btn-cashout" 
        class="btn-main btn-cashout-safe" 
        @click="cashOut"
      >
        Sécuriser les gains
      </button>
    </div>

    <div class="msg" :style="{ color: msgColor }">{{ msgText }}</div>

    <div class="history-row">
      <span 
        v-for="(h, idx) in history" 
        :key="idx" 
        class="hist-chip"
        :style="{
          backgroundColor: h.m < 1.5 ? AppColor.status.error + '10' : h.m < 3 ? AppColor.status.warning + '10' : AppColor.status.success + '10',
          color: h.m < 1.5 ? AppColor.status.error : h.m < 3 ? AppColor.status.warning : AppColor.status.success,
          borderColor: h.m < 1.5 ? AppColor.status.error + '20' : h.m < 3 ? AppColor.status.warning + '20' : AppColor.status.success + '20'
        }"
      >
        {{ h.m.toFixed(2) }}x
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from "pinia"
import { AppColor } from "@/core/constants/app_colors"
import { useAuthStore } from "@/features/auth/presentation/stores/auth_store"
import { useTransactionStore } from "@/features/transaction/presentation/stores/transaction_store"

import { useToast } from '@/core/utils/useToast'
import { useConfetti } from '@/core/utils/useConfetti'

import { ShowMyPrincipalBalanceUseCase } from '~/features/transaction/application/usecases/show_my_principal_balance_usecase'
import { ShowMyPrincipalBalanceRepositoryImpl } from '~/features/transaction/data/repositories/show_my_principal_balance_repository_impl'
import { Failure } from '@/core/errors/failure'

// --- Mapping local des couleurs pour le v-bind CSS ---
const cssTertiaryBase = AppColor.tertiary.base
const cssPrimaryBase = AppColor.primary.base

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

const PAD = { l: 54, b: 32, r: 24, t: 45 }

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
  if (phase.value === 'countdown') return AppColor.status.warning
  if (phase.value === 'running') return AppColor.primary.base
  if (phase.value === 'crashed') return AppColor.status.error
  if (phase.value === 'cashedout') return AppColor.status.success
  return AppColor.status.success
})

// --- Formatage de Solde ---
const formatBalance = (value: number | null): string => {
  if (value === null || value === undefined) return "00,000,000"
  const padded = Math.floor(value).toString().padStart(8, '0');
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

// --- Moteur Graphique Mathématiques ---
const W = () => (canvasRef.value ? canvasRef.value.width / window.devicePixelRatio : 0)
const H = () => (canvasRef.value ? canvasRef.value.height / window.devicePixelRatio : 0)

const genCrash = (): number => {
  const r = Math.random()
  if (r < 0.05) return parseFloat((10 + Math.random() * 15).toFixed(2))
  if (r < 0.10) return parseFloat((5 + Math.random() * 5).toFixed(2))
  if (r < 0.20) return parseFloat((4 + Math.random() * 1).toFixed(2))
  if (r < 0.30) return parseFloat((3 + Math.random() * 1).toFixed(2))
  if (r < 0.40) return parseFloat((2 + Math.random() * 1).toFixed(2))
  if (r < 0.50) return parseFloat((1.5 + Math.random() * 0.5).toFixed(2))
  if (Math.random() < 0.15) return 1.00
  return parseFloat((1.01 + Math.random() * 0.48).toFixed(2))
}

const multToY = (m: number, maxM: number) => {
  const gH = H() - PAD.b - PAD.t
  const norm = Math.log(m) / Math.log(Math.max(maxM, 1.5))
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
  canvasCtx.fillStyle = AppColor.status.warning
  canvasCtx.fill()

  // Fuselage
  canvasCtx.beginPath()
  canvasCtx.moveTo(18, 0)
  canvasCtx.bezierCurveTo(14, -4, -4, -5, -13, -3)
  canvasCtx.lineTo(-13, 3)
  canvasCtx.bezierCurveTo(-4, 5, 14, 4, 18, 0)
  canvasCtx.fillStyle = AppColor.primary.base
  canvasCtx.fill()

  // Ailes
  canvasCtx.beginPath()
  canvasCtx.moveTo(4, -2)
  canvasCtx.lineTo(-3, -13)
  canvasCtx.lineTo(-9, -13)
  canvasCtx.lineTo(-7, -2)
  canvasCtx.closePath()
  canvasCtx.fillStyle = AppColor.primary.dark
  canvasCtx.fill()

  canvasCtx.restore()
}

// --- Particules & Explosion Vectorielle ---
const initExplosion = (x: number, y: number) => {
  debris = []
  const COLORS = [AppColor.primary.base, AppColor.status.warning, AppColor.status.error, AppColor.primary.accent, '#888']

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
  canvasCtx.strokeStyle = `rgba(244,67,54,${a})`
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

  c.strokeStyle = 'rgba(0,0,0,0.06)'
  c.lineWidth = 1;
  [1.5, 2, 3, 5, 10, 20].forEach(m => {
    if (m > maxM) return
    const y = multToY(m, maxM)
    c.beginPath(); c.moveTo(PAD.l, y); c.lineTo(w - PAD.r, y); c.stroke()
    c.fillStyle = '#888888'
    c.font = '10px sans-serif'
    c.textAlign = 'right'
    c.fillText(m + 'x', PAD.l - 5, y + 3)
  })

  if (path.length > 1) {
    const crashed = phase.value === 'crashed'
    const firstPoint = path[0]
    if (!firstPoint) return

    c.beginPath()
    c.moveTo(timeToX(firstPoint.t, maxT), multToY(firstPoint.m, maxM))
    for (const p of path) c.lineTo(timeToX(p.t, maxT), multToY(p.m, maxM))
    c.strokeStyle = crashed ? AppColor.status.error : AppColor.primary.base
    c.lineWidth = 3
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
    msgText.value = 'Mise minimale de 500 requise.'; msgColor.value = AppColor.status.error; return 
  }

  msgText.value = 'Vérification du solde...'; msgColor.value = '#64748b'
  await fetchBalance()

  const soldeActuel = mainBalance.value || 0
  if (bet > soldeActuel) { 
    msgText.value = 'Solde insuffisant !'; msgColor.value = AppColor.status.error
    showToast("Votre solde principal est insuffisant.", "fi-rr-info", "error")
    return 
  }

  transactionStore.mainBalance = soldeActuel - bet
  
  currentBet = bet
  crashAt = genCrash()
  phase.value = 'countdown'
  mult.value = 1.0
  path = []
  exploding = false
  smoothAngle = 0

  let cd = 3
  msgText.value = `Décollage dans ${cd}s`; msgColor.value = AppColor.status.warning
  
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
    
    mult.value = parseFloat((1 + elapsed * 0.05 + elapsed * elapsed * 0.015).toFixed(3))
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

  msgText.value = `Crash à ${crashAt.toFixed(2)}x`
  msgColor.value = AppColor.status.error
  addHistory(crashAt, false)

  await fetchBalance()

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
  
  transactionStore.mainBalance = nouveauSolde

  triggerConfetti()
  showToast(`Succès ! +${gains.toLocaleString('fr-FR')} XOF`, "fi-rr-check", "success")
  
  msgText.value = `Encaissé à ${mult.value.toFixed(2)}x → +${gains.toLocaleString('fr-FR')} XOF`
  msgColor.value = AppColor.status.success
  
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

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

/* Barre d'application */
.app-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 65px;
  background: #ffffff;
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
  color: #2d3436;
}
.spacer { width: 45px; }

/* Base Container */
#crash-root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #ffffff;
  padding: 85px 16px 20px 16px;
  color: v-bind('cssTertiaryBase');
  user-select: none;
}

.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.title-label { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; }
.balance-badge { font-size: 13px; color: #64748b; }
.balance-badge .amount { color: #0f172a; font-weight: 700; }

/* Box de l'arène */
.arena-container {
  background: #f8fafc;
  border-left: 2px solid #cbd5e1; 
  border-bottom: 2px solid #cbd5e1;
  border-top: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 0;
}

.canvas-wrap { 
  position: relative; 
  width: 100%; 
  height: 200px; 
  background: transparent;
  overflow: hidden; 
}
canvas { display: block; width: 100%; height: 100%; }

/* Indicateurs de cotes */
.mult-overlay { 
  position: absolute; 
  top: 10px; 
  left: 14px; 
  pointer-events: none; 
  z-index: 4; 
  background: rgba(255, 255, 255, 0.85);
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.mult-val { font-size: 1.4rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.3px; }
.mult-sub { font-size: 8px; letter-spacing: 0.5px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-top: 1px; }

/* Zone de Saisie Épurée */
.controls-section { margin-bottom: 20px; }
.ctrl-box { display: flex; flex-direction: column; }
.ctrl-label { font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 8px; }

.input-wrapper { position: relative; }
.ctrl-input { 
  width: 100%; 
  background: #f8fafc;
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  padding: 12px 16px; 
  color: #0f172a; 
  font-size: 16px; 
  font-weight: 700; 
  outline: none; 
  transition: all 0.2s ease;
}
.ctrl-input:focus { 
  background: #ffffff;
  border-color: v-bind('cssPrimaryBase');
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
}

.chip-row { display: flex; gap: 6px; margin-top: 8px; }
.chip { 
  flex: 1; 
  padding: 8px 0; 
  border-radius: 10px; 
  border: 1px solid #e2e8f0;
  background: #ffffff; 
  color: #475569; 
  font-size: 12px; 
  font-weight: 600;
  cursor: pointer; 
  transition: all 0.15s ease; 
}
.chip:hover:not(:disabled) { border-color: #cbd5e1; background: #f8fafc; color: #0f172a; }
.chip:disabled { opacity: 0.3; cursor: not-allowed; }

/* Actionneurs */
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
  background: #0f172a; 
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}
.btn-start-safe:hover:not(:disabled) { background: #1e293b; }

.btn-cashout-safe {
  background: #10b981;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.msg { text-align: center; font-size: 12px; min-height: 18px; margin-bottom: 16px; font-weight: 600; color: #64748b; }

.history-row { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.hist-chip { font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 700; border: 1px solid; }
</style>