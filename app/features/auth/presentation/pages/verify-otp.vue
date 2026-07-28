<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/core/components/client/mobile/Button.vue'
import { AppColor } from "@/core/constants/app_colors"
import { AppImage } from "@/core/constants/app_images"
import { useToast } from "@/core/utils/useToast"
import { Failure } from '@/core/errors/failure'

// UseCases & Repositories
import { VerifyOtpUseCase } from '../../application/usecases/verify_otp_usecase'
import { VerifyOtpRepositoryImpl } from '../../data/repositories/verify_otp_repository_impl'
import { ResendOtpUseCase } from '../../application/usecases/resend_otp_usecase'
import { ResendOtpRepositoryImpl } from '../../data/repositories/resend_otp_repository_impl'

const { showToast } = useToast()
const router = useRouter()
const route = useRoute()

// Instanciation des UseCases
const verifyOtpUseCase = new VerifyOtpUseCase(new VerifyOtpRepositoryImpl())
const resendOtpUseCase = new ResendOtpUseCase(new ResendOtpRepositoryImpl())

// Récupération des paramètres de l'URL
const email = computed(() => (route.query.email as string) || "")
const type = computed(() => (route.query.type as string) || "registration")

// Tableau de 6 carreaux
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])

// Reconstitue le code OTP sous forme de chaîne de caractères
const otpCode = computed(() => otpDigits.value.join(''))

const isLoading = ref(false)
const isResending = ref(false)

// Persistance du timer de 10 minutes dans localStorage
const initialTimer = 600 // 10 minutes
const timer = ref(initialTimer)
const canResend = ref(false)

let interval: any = null

const TIMER_KEY = computed(() => `otp_expiry_${email.value || 'default'}`)

// Restaure ou démarre le timer
const startOrRestoreTimer = () => {
  if (!email.value) return

  const savedExpiry = localStorage.getItem(TIMER_KEY.value)
  const now = Date.now()

  if (savedExpiry) {
    const expiryTime = parseInt(savedExpiry, 10)
    const remainingSeconds = Math.floor((expiryTime - now) / 1000)

    if (remainingSeconds > 0) {
      timer.value = remainingSeconds
      canResend.value = false
    } else {
      timer.value = 0
      canResend.value = true
      localStorage.removeItem(TIMER_KEY.value)
      return
    }
  } else {
    // Premier lancement : initialise 10 min
    const targetExpiry = now + initialTimer * 1000
    localStorage.setItem(TIMER_KEY.value, targetExpiry.toString())
    timer.value = initialTimer
    canResend.value = false
  }

  if (interval) clearInterval(interval)

  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      canResend.value = true
      clearInterval(interval)
      localStorage.removeItem(TIMER_KEY.value)
    }
  }, 1000)
}

const formatTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// --- GESTION DE LA SAISIE CARREAU PAR CARREAU ---
const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.slice(-1) // Garde uniquement le dernier caractère entré

  // Ne garder que les chiffres
  if (!/^\d*$/.test(value)) {
    otpDigits.value[index] = ''
    return
  }

  otpDigits.value[index] = value

  // Passer automatiquement au carreau suivant si un chiffre est saisi
  if (value && index < 5) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  // Reculer sur la touche Retour arrière (Backspace) si la case est vide
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text').trim() || ''

  // Si la chaîne collée contient des chiffres
  if (/^\d+$/.test(pastedData)) {
    const digits = pastedData.slice(0, 6).split('')
    digits.forEach((digit, index) => {
      if (index < 6) {
        otpDigits.value[index] = digit
      }
    })

    // Placer le focus sur le dernier champ rempli ou le suivant
    const targetIndex = Math.min(digits.length, 5)
    nextTick(() => {
      inputRefs.value[targetIndex]?.focus()
    })
  }
}

// Vérification de l'OTP
const handleVerify = async () => {
  if (otpCode.value.length < 6) {
    showToast("Veuillez entrer le code à 6 chiffres", "fi-rr-info", "error")
    return
  }

  isLoading.value = true
  try {
    const result = await verifyOtpUseCase.execute({
      email: email.value,
      otp: otpCode.value,
      type: type.value 
    })

    if (result instanceof Failure) {
      showToast(result.message, "fi-rr-cross-circle", "error")
      isLoading.value = false
    } else {
      showToast("Vérification réussie !", "fi-rr-check", "success")
      localStorage.removeItem(TIMER_KEY.value)
      
      setTimeout(() => {
        if (type.value === 'email_change') {
          router.push("/auth/profile")
        } else {
          router.push("/auth/login")
        }
        isLoading.value = false
      }, 1500)
    }
  } catch (error) {
    isLoading.value = false
    showToast("Erreur de connexion", "fi-rr-shield-exclamation", "error")
  }
}

// Renvoi réel de l'OTP
const handleResend = async () => {
  if (!canResend.value || isResending.value) return

  if (!email.value) {
    showToast("Adresse e-mail introuvable", "fi-rr-cross-circle", "error")
    return
  }

  isResending.value = true

  try {
    const result = await resendOtpUseCase.execute({ email: email.value })

    if (result instanceof Failure) {
      showToast(result.message, "fi-rr-time-out", "error")
    } else {
      showToast("Un nouveau code vous a été envoyé", "fi-rr-refresh", "success")
      
      // Réinitialise l'expiration à 10 min
      const targetExpiry = Date.now() + initialTimer * 1000
      localStorage.setItem(TIMER_KEY.value, targetExpiry.toString())
      startOrRestoreTimer()
    }
  } catch (error) {
    showToast("Impossible de renvoyer le code pour le moment", "fi-rr-shield-exclamation", "error")
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  if (!email.value) {
    showToast("Session expirée", "fi-rr-info", "error")
    router.push(type.value === 'email_change' ? "/auth/profile" : "/auth/register")
    return
  }
  startOrRestoreTimer()

  // Focus automatique sur le premier carreau au chargement
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="otp-page">
    <nav class="app-bar">
      <button class="back-btn" @click="router.back()">
        <i class="fi fi-rr-arrow-small-left"></i>
      </button>
      <span class="app-bar-title">Vérification</span>
      <div class="spacer"></div>
    </nav>

    <div class="auth-card">
      <div class="logo-container">
        <img :src="AppImage.Logo" alt="Logo" class="app-logo" />
      </div>

      <header class="header-content">
        <h2 class="title">Code de sécurité</h2>
        <p class="subtitle">
          {{ type === 'email_change' ? 'Confirmez votre nouvel email :' : 'Saisissez le code envoyé à :' }}
          <br />
          <strong :style="{ color: AppColor.primary.base }">{{ email }}</strong>
        </p>
      </header>

      <div class="form-group">
        <!-- Grille des 6 carreaux OTP -->
        <div class="otp-boxes-container" @paste="handlePaste">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            ref="inputRefs"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-box"
            :class="{ 'has-value': otpDigits[index] !== '' }"
            v-model="otpDigits[index]"
            @input="handleInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
          />
        </div>

        <!-- Zone d'action de renvoi -->
        <div class="resend-line">
          <button
            @click="handleResend"
            class="resend-btn"
            :disabled="!canResend || isResending"
            :style="{ color: canResend ? AppColor.primary.base : '#9ca3af' }"
          >
            <i class="fi fi-rr-refresh" :class="{ 'spin-icon': isResending }"></i>
            <span>{{ isResending ? 'Envoi...' : 'Renvoyer le code' }}</span>
          </button>

          <span v-if="!canResend" class="timer-text">
            ({{ formatTimer }})
          </span>
        </div>
      </div>

      <Button label="Confirmer" :loading="isLoading" @click="handleVerify" />

      <div class="footer-link">
        <NuxtLink :to="type === 'email_change' ? '/auth/profile' : '/auth/register'" class="back-link">
          <i class="fi fi-rr-hand-back-point-left"></i>
          <span>Annuler et retourner</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- CARREAUX OTP --- */
.otp-boxes-container {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin-bottom: 10px;
}

.otp-box {
  width: 50px;
  height: 56px;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  background-color: #f9fafb;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease-in-out;
}

.otp-box:focus {
  border-color: v-bind('AppColor.primary.base');
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.otp-box.has-value {
  border-color: v-bind('AppColor.primary.base');
  background-color: #ffffff;
}

/* Animations et reste du style */
.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.resend-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.resend-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
}

.resend-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.timer-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

/* App Bar */
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-bar-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
  color: #2d3436;
}

.spacer { width: 45px; }

/* Page & Card */
.otp-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 85px 20px 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 40px 30px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.logo-container {
  text-align: center;
  margin-bottom: 15px;
}

.app-logo {
  height: 70px;
  width: auto;
}

.header-content {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 8px;
}

.subtitle {
  color: #95a5a6;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}

.footer-link {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #a0a0a0;
  text-decoration: none;
}

.back-link:hover {
  color: v-bind('AppColor.primary.base');
}

/* Responsive Mobile */
@media (max-width: 600px) {
  .otp-page {
    background-color: white;
    align-items: flex-start;
    padding: 85px 20px 20px 20px;
  }
  .auth-card {
    box-shadow: none;
    border-radius: 0;
    padding: 20px 0;
  }
  .otp-box {
    width: 44px;
    height: 50px;
    font-size: 18px;
  }
}
</style>