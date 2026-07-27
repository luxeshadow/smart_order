<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/core/components/client/mobile/Button.vue'
import Input from '@/core/components/client/mobile/Input.vue'
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

const otpCode = ref("")
const isLoading = ref(false)
const isResending = ref(false)

// 1. Timer d'expiration globale du code (10 minutes)
const initialTimer = 600 
const timer = ref(initialTimer)

// 2. Timer de rechargement du bouton "Renvoyer" (60 secondes)
const RESEND_COOLDOWN = 60
const resendCooldownTimer = ref(0)
const canResend = ref(true)

let interval: any = null
let cooldownInterval: any = null

const startTimer = () => {
  timer.value = initialTimer
  if (interval) clearInterval(interval)
  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(interval)
    }
  }, 1000)
}

const startResendCooldown = () => {
  canResend.value = false
  resendCooldownTimer.value = RESEND_COOLDOWN
  if (cooldownInterval) clearInterval(cooldownInterval)

  cooldownInterval = setInterval(() => {
    if (resendCooldownTimer.value > 0) {
      resendCooldownTimer.value--
    } else {
      canResend.value = true
      clearInterval(cooldownInterval)
    }
  }, 1000)
}

const formatTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
})

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

// Renvoi réel de l'OTP avec vérification du quota (Max 2 par 24h)
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
      // Affiche l'erreur si le quota (2 renvois / 24h) est dépassé ou autre problème
      showToast(result.message, "fi-rr-time-out", "error")
    } else {
      showToast("Un nouveau code vous a été envoyé", "fi-rr-refresh", "success")
      
      // Réinitialise le timer d'expiration globale et démarre le cooldown du bouton
      startTimer()
      startResendCooldown()
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
  startTimer()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (cooldownInterval) clearInterval(cooldownInterval)
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
        <Input
          id="otp-code"
          label="Code de validation*"
          type="text"
          v-model="otpCode"
          icon="fi-rr-shield-check"
          placeholder="Ex: 755843"
          maxlength="6"
        />

        <div class="timer-container">
          <p v-if="timer > 0" class="timer-text">
            Le code expire dans <span class="time">{{ formatTimer }}</span>
          </p>

          <!-- Bouton de renvoi avec gestion des états -->
          <div class="resend-wrapper">
            <button
              v-if="canResend"
              @click="handleResend"
              class="resend-btn"
              :disabled="isResending"
              :style="{ color: AppColor.primary.base }"
            >
              <i class="fi fi-rr-refresh" :class="{ 'spin-icon': isResending }"></i>
              <span>{{ isResending ? 'Envoi en cours...' : 'Renvoyer le code' }}</span>
            </button>

            <span v-else class="cooldown-text">
              Renvoyer disponible dans {{ resendCooldownTimer }}s
            </span>
          </div>
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
.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cooldown-text {
  font-size: 13px;
  color: #9ca3af;
}

.resend-wrapper {
  margin-top: 8px;
}

/* App Bar Style */
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

/* Page & Card Style */
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

.timer-container {
  display: flex;
  justify-content: center;
  min-height: 20px;
}

.timer-text {
  font-size: 13px;
  color: #999;
}

.time {
  font-weight: 700;
  color: #333;
}

.resend-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
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

/* Responsive */
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
}
</style>